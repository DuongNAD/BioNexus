package com.bionexus.backend.service;

// [TN-15] BẮT ĐẦU · Nghiệp vụ danh sách yêu thích
// import com.bionexus.backend.dal.ProductDao;
// import com.bionexus.backend.dal.WishlistDao;
// import com.bionexus.backend.dto.ProductDto;
// import com.bionexus.backend.enums.MessageKey;
// import com.bionexus.backend.model.Products;
// import com.bionexus.backend.util.ApiException;

// import java.sql.SQLException;
// import java.util.ArrayList;
// import java.util.List;

// /**
 // * Danh sách yêu thích (lưu để mua sau). Giống giỏ hàng: không lưu giá, không giữ hàng.
 // * Mọi hàm trả về danh sách sau thay đổi để giao diện cập nhật một lần.
 // */
// public class WishlistService {
    // private final WishlistDao wishlistDao = new WishlistDao();
    // private final ProductDao productDao = new ProductDao();
    // private final DtoAssembler assembler = new DtoAssembler();

    // /** Các sản phẩm đã lưu, kèm trạng thái bán hiện tại (giao diện tự báo "ngừng bán" nếu cần). */
    // public List<ProductDto> getMyWishlist(int userId) throws SQLException {
        // List<Products> products = new ArrayList<>();
        // for (int productId : wishlistDao.getProductIds(userId)) {
            // Products p = productDao.getProductById(productId);
            // if (p != null) {
                // products.add(p);
            // }
        // }
        // return assembler.products(products);
    // }

    // public List<ProductDto> add(int userId, int productId) throws SQLException {
        // if (productDao.getProductById(productId) == null) {
            // throw new ApiException(MessageKey.PRODUCT_NOT_FOUND);
        // }
        // wishlistDao.add(userId, productId); // đã lưu rồi thì bỏ qua, không báo lỗi
        // return getMyWishlist(userId);
    // }

    // public List<ProductDto> remove(int userId, int productId) throws SQLException {
        // if (!wishlistDao.remove(userId, productId)) {
            // throw new ApiException(MessageKey.NOT_FOUND);
        // }
        // return getMyWishlist(userId);
    // }
// }
// [TN-15] KẾT THÚC
