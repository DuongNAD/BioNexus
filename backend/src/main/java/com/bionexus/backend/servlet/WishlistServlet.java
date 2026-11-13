package com.bionexus.backend.servlet;

// [TN-15] BẮT ĐẦU · API danh sách yêu thích: GET /api/wishlist, POST và DELETE /api/wishlist/{productId}
// import com.bionexus.backend.dto.ApiResponse;
// import com.bionexus.backend.enums.MessageKey;
// import com.bionexus.backend.service.WishlistService;
// import com.bionexus.backend.util.ApiErrors;
// import com.bionexus.backend.util.ApiException;
// import com.bionexus.backend.util.JsonUtil;
// import jakarta.servlet.annotation.WebServlet;
// import jakarta.servlet.http.HttpServlet;
// import jakarta.servlet.http.HttpServletRequest;
// import jakarta.servlet.http.HttpServletResponse;

// import java.io.IOException;

// /** JwtAuthFilter (đã thêm "/api/wishlist/*") yêu cầu đăng nhập USER và gán attribute "authId". */
// @WebServlet("/api/wishlist/*")
// public class WishlistServlet extends HttpServlet {
    // private final WishlistService wishlistService = new WishlistService();

    // /** Lấy productId từ "/{productId}". Sai dạng đường dẫn thì null; không phải số dương thì INVALID_ID. */
    // private static Integer productIdFrom(String path) {
        // if (path == null || path.length() <= 1 || path.indexOf('/', 1) >= 0) {
            // return null;
        // }
        // int id = Integer.parseInt(path.substring(1)); // không phải số thì NumberFormatException → 400
        // if (id <= 0) {
            // throw new ApiException(MessageKey.INVALID_ID);
        // }
        // return id;
    // }

    // @Override
    // protected void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
        // try {
            // String path = request.getPathInfo();
            // if (path != null && !path.equals("/")) {
                // JsonUtil.writeBody(response, 404, ApiResponse.error(MessageKey.NOT_FOUND));
                // return;
            // }
            // int userId = (int) request.getAttribute("authId");
            // JsonUtil.writeBody(response, 200, ApiResponse.ok(wishlistService.getMyWishlist(userId)));
        // } catch (Exception e) {
            // ApiErrors.write(response, e);
        // }
    // }

    // @Override
    // protected void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
        // try {
            // Integer productId = productIdFrom(request.getPathInfo());
            // if (productId == null) {
                // JsonUtil.writeBody(response, 404, ApiResponse.error(MessageKey.NOT_FOUND));
                // return;
            // }
            // int userId = (int) request.getAttribute("authId");
            // JsonUtil.writeBody(response, 200, ApiResponse.ok(MessageKey.WISHLIST_ADDED, wishlistService.add(userId, productId)));
        // } catch (Exception e) {
            // ApiErrors.write(response, e);
        // }
    // }

    // @Override
    // protected void doDelete(HttpServletRequest request, HttpServletResponse response) throws IOException {
        // try {
            // Integer productId = productIdFrom(request.getPathInfo());
            // if (productId == null) {
                // JsonUtil.writeBody(response, 404, ApiResponse.error(MessageKey.NOT_FOUND));
                // return;
            // }
            // int userId = (int) request.getAttribute("authId");
            // JsonUtil.writeBody(response, 200, ApiResponse.ok(MessageKey.WISHLIST_REMOVED, wishlistService.remove(userId, productId)));
        // } catch (Exception e) {
            // ApiErrors.write(response, e);
        // }
    // }
// }
// [TN-15] KẾT THÚC
