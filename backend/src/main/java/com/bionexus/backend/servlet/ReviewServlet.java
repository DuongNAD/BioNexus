package com.bionexus.backend.servlet;

// [TN-16] BẮT ĐẦU · API gửi đánh giá: POST /api/reviews (xem đánh giá nằm ở ProductsServlet)
// import com.bionexus.backend.dto.ApiResponse;
// import com.bionexus.backend.dto.CreateReviewRequest;
// import com.bionexus.backend.enums.MessageKey;
// import com.bionexus.backend.service.ReviewService;
// import com.bionexus.backend.util.ApiErrors;
// import com.bionexus.backend.util.ApiException;
// import com.bionexus.backend.util.JsonUtil;
// import jakarta.servlet.annotation.WebServlet;
// import jakarta.servlet.http.HttpServlet;
// import jakarta.servlet.http.HttpServletRequest;
// import jakarta.servlet.http.HttpServletResponse;

// import java.io.IOException;

// /** JwtAuthFilter (đã thêm "/api/reviews/*") yêu cầu đăng nhập USER và gán attribute "authId". */
// @WebServlet("/api/reviews/*")
// public class ReviewServlet extends HttpServlet {
    // private final ReviewService reviewService = new ReviewService();

    // @Override
    // protected void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
        // try {
            // String path = request.getPathInfo(); // null khi gọi đúng /api/reviews
            // if (path != null && !path.equals("/")) {
                // JsonUtil.writeBody(response, 404, ApiResponse.error(MessageKey.NOT_FOUND));
                // return;
            // }
            // int userId = (int) request.getAttribute("authId");
            // CreateReviewRequest body = JsonUtil.readBody(request, CreateReviewRequest.class);
            // if (body == null) {
                // throw new ApiException(MessageKey.BAD_REQUEST);
            // }
            // JsonUtil.writeBody(response, 201, ApiResponse.ok(MessageKey.REVIEW_CREATED, reviewService.createReview(userId, body)));
        // } catch (Exception e) {
            // ApiErrors.write(response, e);
        // }
    // }
// }
// [TN-16] KẾT THÚC
