package com.bionexus.backend.service;

// [TN-16] BẮT ĐẦU · Nghiệp vụ đánh giá sản phẩm: chỉ người đã mua và đã nhận hàng mới được đánh giá
// import com.bionexus.backend.dal.ProductDao;
// import com.bionexus.backend.dal.ReviewDao;
// import com.bionexus.backend.dto.CreateReviewRequest;
// import com.bionexus.backend.dto.ReviewDto;
// import com.bionexus.backend.enums.MessageKey;
// import com.bionexus.backend.util.ApiException;

// import java.sql.SQLException;
// import java.util.List;

// public class ReviewService {
    // private static final int MAX_COMMENT_LENGTH = 1000; // cột comment là nvarchar(1000)

    // private final ReviewDao reviewDao = new ReviewDao();
    // private final ProductDao productDao = new ProductDao();

    // /** Ai cũng xem được (GET /api/products/{id}/reviews). Sản phẩm không có thì 404. */
    // public List<ReviewDto> getReviews(int productId) throws SQLException {
        // if (productDao.getProductById(productId) == null) {
            // throw new ApiException(MessageKey.PRODUCT_NOT_FOUND);
        // }
        // return reviewDao.getByProductId(productId);
    // }

    // /** Kiểm tra theo thứ tự: dữ liệu gửi lên, sản phẩm có tồn tại, đã mua chưa, đã đánh giá chưa. */
    // public ReviewDto createReview(int userId, CreateReviewRequest request) throws SQLException {
        // if (request == null || request.productId() == null) {
            // throw new ApiException(MessageKey.BAD_REQUEST);
        // }
        // if (request.rating() == null || request.rating() < 1 || request.rating() > 5) {
            // throw new ApiException(MessageKey.REVIEW_INVALID_RATING);
        // }
        // String comment = "";
        // if (request.comment() != null) {
            // comment = request.comment().trim();
        // }
        // if (comment.isEmpty() || comment.length() > MAX_COMMENT_LENGTH) {
            // throw new ApiException(MessageKey.REVIEW_INVALID_COMMENT);
        // }
        // if (productDao.getProductById(request.productId()) == null) {
            // throw new ApiException(MessageKey.PRODUCT_NOT_FOUND);
        // }
        // if (!reviewDao.hasCompletedPurchase(userId, request.productId())) {
            // throw new ApiException(MessageKey.REVIEW_NOT_PURCHASED);
        // }
        // int newId = reviewDao.insert(userId, request.productId(), request.rating(), comment);
        // if (newId == -1) {
            // throw new ApiException(MessageKey.REVIEW_ALREADY_EXISTS);
        // }
        // return reviewDao.getById(newId);
    // }
// }
// [TN-16] KẾT THÚC
