package com.bionexus.backend.servlet;

import com.bionexus.backend.dto.ApiResponse;
import com.bionexus.backend.dto.PlaceOrderRequest;
import com.bionexus.backend.enums.MessageKey;
import com.bionexus.backend.service.OrderService;
import com.bionexus.backend.util.ApiErrors;
import com.bionexus.backend.util.ApiException;
import com.bionexus.backend.util.JsonUtil;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;

/** Đơn hàng của người dùng: POST /api/orders, GET /api/orders/mine, GET /api/orders/{id}. JwtAuthFilter đã yêu cầu đăng nhập. */
@WebServlet("/api/orders/*")
public class OrderServlet extends HttpServlet {
    private final OrderService orderService = new OrderService();

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
        try {
            String path = request.getPathInfo(); // null khi gọi đúng /api/orders
            // [TN-01] BẮT ĐẦU · POST /api/orders/{id}/cancel: người mua hủy đơn đang chờ xử lý
            // if (path != null && path.endsWith("/cancel")) {
                // int buyerId = (int) request.getAttribute("authId");
                // String[] parts = path.substring(1).split("/"); // "/15/cancel" → {"15", "cancel"}
                // if (parts.length != 2) {
                    // JsonUtil.writeBody(response, 404, ApiResponse.error(MessageKey.NOT_FOUND));
                    // return;
                // }
                // long orderId = Long.parseLong(parts[0]); // không phải số thì NumberFormatException → 400
                // JsonUtil.writeBody(response, 200,
                        // ApiResponse.ok(MessageKey.ORDER_CANCEL_SUCCESS, orderService.cancelMyOrder(buyerId, orderId)));
                // return;
            // }
            // [TN-01] KẾT THÚC
            // [TN-02] BẮT ĐẦU · POST /api/orders/{id}/complete: người mua xác nhận đã nhận hàng
            // if (path != null && path.endsWith("/complete")) {
                // int buyerId = (int) request.getAttribute("authId");
                // String[] parts = path.substring(1).split("/"); // "/15/complete" → {"15", "complete"}
                // if (parts.length != 2) {
                    // JsonUtil.writeBody(response, 404, ApiResponse.error(MessageKey.NOT_FOUND));
                    // return;
                // }
                // long orderId = Long.parseLong(parts[0]);
                // JsonUtil.writeBody(response, 200,
                        // ApiResponse.ok(MessageKey.ORDER_COMPLETE_SUCCESS, orderService.confirmReceived(buyerId, orderId)));
                // return;
            // }
            // [TN-02] KẾT THÚC
            if (path != null && !path.equals("/")) {
                JsonUtil.writeBody(response, 404, ApiResponse.error(MessageKey.NOT_FOUND));
                return;
            }
            int userId = (int) request.getAttribute("authId");
            PlaceOrderRequest body = JsonUtil.readBody(request, PlaceOrderRequest.class);
            if (body == null) throw new ApiException(MessageKey.BAD_REQUEST);
            JsonUtil.writeBody(response, 201,
                    ApiResponse.ok(MessageKey.ORDER_CREATE_SUCCESS, orderService.placeOrder(userId, body)));
        } catch (Exception e) {
            ApiErrors.write(response, e);
        }
    }

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
        try {
            int userId = (int) request.getAttribute("authId");
            String path = request.getPathInfo();
            if ("/mine".equals(path)) {
                JsonUtil.writeBody(response, 200, ApiResponse.ok(orderService.getMyOrders(userId)));
            } else if (path != null && path.length() > 1 && path.indexOf('/', 1) < 0) {
                long id = Long.parseLong(path.substring(1)); // không phải số thì NumberFormatException → 400
                JsonUtil.writeBody(response, 200, ApiResponse.ok(orderService.getMyOrder(userId, id)));
            } else {
                JsonUtil.writeBody(response, 404, ApiResponse.error(MessageKey.NOT_FOUND));
            }
        } catch (Exception e) {
            ApiErrors.write(response, e);
        }
    }
}
