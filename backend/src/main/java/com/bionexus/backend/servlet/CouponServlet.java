package com.bionexus.backend.servlet;

// [TN-06] BẮT ĐẦU · API kiểm tra mã giảm giá: GET /api/coupons/{code}?subtotal=
// import com.bionexus.backend.dto.ApiResponse;
// import com.bionexus.backend.dto.CouponDto;
// import com.bionexus.backend.enums.Coupon;
// import com.bionexus.backend.enums.MessageKey;
// import com.bionexus.backend.util.ApiErrors;
// import com.bionexus.backend.util.ApiException;
// import com.bionexus.backend.util.JsonUtil;
// import jakarta.servlet.annotation.WebServlet;
// import jakarta.servlet.http.HttpServlet;
// import jakarta.servlet.http.HttpServletRequest;
// import jakarta.servlet.http.HttpServletResponse;

// import java.io.IOException;
// import java.math.BigDecimal;

// /**
 // * Trang thanh toán gọi API này khi người dùng bấm "Áp dụng" để xem trước số tiền giảm.
 // * Đây chỉ là xem trước: lúc đặt hàng OrderService tính lại từ giá trong DB, không tin số giao diện gửi.
 // * API công khai (không nằm trong JwtAuthFilter) vì danh sách mã không phải dữ liệu riêng tư.
 // */
// @WebServlet("/api/coupons/*")
// public class CouponServlet extends HttpServlet {

    // @Override
    // protected void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
        // try {
            // String path = request.getPathInfo(); // ví dụ "/GIAM50K"
            // if (path == null || path.length() <= 1) {
                // JsonUtil.writeBody(response, 404, ApiResponse.error(MessageKey.NOT_FOUND));
                // return;
            // }
            // Coupon coupon = Coupon.find(path.substring(1));
            // if (coupon == null) {
                // throw new ApiException(MessageKey.COUPON_INVALID);
            // }

            // BigDecimal subtotal = parseSubtotal(request.getParameter("subtotal"));
            // if (!coupon.isEligible(subtotal)) {
                // throw new ApiException(MessageKey.COUPON_MIN_ORDER_NOT_MET);
            // }
            // CouponDto dto = new CouponDto(coupon.name(), coupon.getDescription(),
                    // coupon.discountFor(subtotal), coupon.getMinOrderAmount());
            // JsonUtil.writeBody(response, 200, ApiResponse.ok(dto));
        // } catch (Exception e) {
            // ApiErrors.write(response, e);
        // }
    // }

    // /** subtotal là tiền hàng hiện tại trên trang thanh toán. Thiếu thì coi như 0, sai dạng hoặc âm thì 400. */
    // private static BigDecimal parseSubtotal(String value) {
        // if (value == null || value.isBlank()) {
            // return BigDecimal.ZERO;
        // }
        // BigDecimal subtotal;
        // try {
            // subtotal = new BigDecimal(value.trim());
        // } catch (NumberFormatException e) {
            // throw new ApiException(MessageKey.BAD_REQUEST);
        // }
        // if (subtotal.signum() < 0) {
            // throw new ApiException(MessageKey.BAD_REQUEST);
        // }
        // return subtotal;
    // }
// }
// [TN-06] KẾT THÚC
