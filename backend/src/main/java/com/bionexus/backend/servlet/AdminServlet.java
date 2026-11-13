package com.bionexus.backend.servlet;

import com.bionexus.backend.dto.ApiResponse;
import com.bionexus.backend.dto.UpdateStatusRequest;
import com.bionexus.backend.enums.MessageKey;
import com.bionexus.backend.enums.ProductStatus;
import com.bionexus.backend.enums.SellerProfileStatus;
import com.bionexus.backend.service.SellerService;
// import com.bionexus.backend.enums.OrderStatus; // [TN-03]
// import com.bionexus.backend.service.OrderService; // [TN-03]
// import com.bionexus.backend.service.StatsService; // [TN-04]
// import com.bionexus.backend.enums.PaymentStatus; // [TN-11]
// import com.bionexus.backend.service.OrderService; // [TN-11]
import com.bionexus.backend.util.ApiErrors;
import com.bionexus.backend.util.ApiException;
import com.bionexus.backend.util.JsonUtil;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;

/**
 * Kiểm duyệt shop và sản phẩm (/api/admin/*).
 * JwtAuthFilter đã chặn token USER và nạp vai trò thật từ DB vào attribute "authRole".
 */
@WebServlet("/api/admin/*")
public class AdminServlet extends HttpServlet {
    private final SellerService sellerService = new SellerService();
    // private final OrderService orderService = new OrderService(); // [TN-03]
    // private final StatsService statsService = new StatsService(); // [TN-04]
    // private final OrderService paymentOrderService = new OrderService(); // [TN-11]

    /** Chỉ MODERATOR và SUPER_ADMIN được duyệt; BIOLOGIST gọi vào đây thì 403. */
    private void requireModerator(HttpServletRequest request) {
        String role = (String) request.getAttribute("authRole");
        if (!"MODERATOR".equals(role) && !"SUPER_ADMIN".equals(role)) {
            throw new ApiException(MessageKey.AUTH_FORBIDDEN);
        }
    }

    private static String[] parts(HttpServletRequest request) {
        String p = request.getPathInfo();
        return (p == null || p.equals("/")) ? new String[0] : p.substring(1).split("/");
    }

    /** Thiếu status thì trả null (lấy tất cả) trừ khi bắt buộc; sai chữ thì 400. */
    private static <E extends Enum<E>> E parseStatus(String s, Class<E> type, boolean required) {
        if (s == null || s.isBlank()) {
            if (required) throw new ApiException(MessageKey.INVALID_STATUS);
            return null;
        }
        try {
            return Enum.valueOf(type, s.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new ApiException(MessageKey.INVALID_STATUS);
        }
    }

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
        try {
            requireModerator(request);
            String[] p = parts(request);
            String status = request.getParameter("status");
            if (p.length == 1 && "sellers".equals(p[0])) {
                var list = sellerService.getSellersByStatus(parseStatus(status, SellerProfileStatus.class, false));
                JsonUtil.writeBody(response, 200, ApiResponse.ok(list));
            } else if (p.length == 1 && "products".equals(p[0])) {
                var list = sellerService.getProductsByStatus(parseStatus(status, ProductStatus.class, false));
                JsonUtil.writeBody(response, 200, ApiResponse.ok(list));
            // [TN-03] BẮT ĐẦU · GET /api/admin/orders?status=: danh sách đơn cho quản trị
            // } else if (p.length == 1 && "orders".equals(p[0])) {
                // var list = orderService.getOrdersForAdmin(parseStatus(status, OrderStatus.class, false));
                // JsonUtil.writeBody(response, 200, ApiResponse.ok(list));
            // [TN-03] KẾT THÚC
            // [TN-04] BẮT ĐẦU · GET /api/admin/stats: thống kê doanh thu
            // } else if (p.length == 1 && "stats".equals(p[0])) {
                // JsonUtil.writeBody(response, 200, ApiResponse.ok(statsService.getSalesStats()));
            // [TN-04] KẾT THÚC
            // [TN-11] BẮT ĐẦU · GET /api/admin/payments?status=UNPAID: đơn theo trạng thái thanh toán
            // } else if (p.length == 1 && "payments".equals(p[0])) {
                // var list = paymentOrderService.getOrdersByPaymentStatus(parseStatus(status, PaymentStatus.class, false));
                // JsonUtil.writeBody(response, 200, ApiResponse.ok(list));
            // [TN-11] KẾT THÚC
            } else {
                JsonUtil.writeBody(response, 404, ApiResponse.error(MessageKey.NOT_FOUND));
            }
        } catch (Exception e) {
            ApiErrors.write(response, e);
        }
    }

    @Override
    protected void doPut(HttpServletRequest request, HttpServletResponse response) throws IOException {
        try {
            requireModerator(request);
            int adminId = (int) request.getAttribute("authId");
            String[] p = parts(request);                      // {"sellers", "5", "status"}
            // [TN-11] BẮT ĐẦU · PUT /api/admin/orders/{id}/payment: xác nhận đã thu tiền (không cần body)
            // if (p.length == 3 && "orders".equals(p[0]) && "payment".equals(p[2])) {
                // long orderId = Long.parseLong(p[1]);
                // JsonUtil.writeBody(response, 200,
                        // ApiResponse.ok(MessageKey.PAYMENT_CONFIRMED, paymentOrderService.confirmPayment(orderId)));
                // return;
            // }
            // [TN-11] KẾT THÚC
            if (p.length != 3 || !"status".equals(p[2])) {
                JsonUtil.writeBody(response, 404, ApiResponse.error(MessageKey.NOT_FOUND));
                return;
            }
            int id = Integer.parseInt(p[1]);                  // sai thì NumberFormatException → 400
            UpdateStatusRequest body = JsonUtil.readBody(request, UpdateStatusRequest.class);
            if (body == null) throw new ApiException(MessageKey.BAD_REQUEST);

            if ("sellers".equals(p[0])) {
                var s = parseStatus(body.status(), SellerProfileStatus.class, true);
                JsonUtil.writeBody(response, 200, ApiResponse.ok(sellerService.moderateSeller(adminId, id, s)));
            } else if ("products".equals(p[0])) {
                var s = parseStatus(body.status(), ProductStatus.class, true);
                JsonUtil.writeBody(response, 200, ApiResponse.ok(sellerService.moderateProduct(adminId, id, s)));
            // [TN-03] BẮT ĐẦU · PUT /api/admin/orders/{id}/status: hoàn tất hoặc hủy đơn (hủy thì hoàn kho)
            // } else if ("orders".equals(p[0])) {
                // var s = parseStatus(body.status(), OrderStatus.class, true);
                // JsonUtil.writeBody(response, 200, ApiResponse.ok(MessageKey.UPDATED_SUCCESS, orderService.updateOrderStatusByAdmin(id, s)));
            // [TN-03] KẾT THÚC
            } else {
                JsonUtil.writeBody(response, 404, ApiResponse.error(MessageKey.NOT_FOUND));
            }
        } catch (Exception e) {
            ApiErrors.write(response, e);
        }
    }
}
