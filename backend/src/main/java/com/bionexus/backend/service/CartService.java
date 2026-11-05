package com.bionexus.backend.service;

import com.bionexus.backend.dal.CartItemsDao;
import com.bionexus.backend.dal.CartsDao;
import com.bionexus.backend.dal.ProductDao;
import com.bionexus.backend.dal.SellerProfilesDao;
import com.bionexus.backend.dto.CartDto;
import com.bionexus.backend.dto.CartItemDto;
import com.bionexus.backend.enums.MessageKey;
import com.bionexus.backend.enums.ProductStatus;
import com.bionexus.backend.model.CartItems;
import com.bionexus.backend.model.Carts;
import com.bionexus.backend.model.Products;
import com.bionexus.backend.model.SellerProfiles;
import com.bionexus.backend.util.ApiException;

import java.math.BigDecimal;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

/**
 * Giỏ hàng (PLAN mục 4.5). Giỏ KHÔNG lưu giá và KHÔNG giữ hàng:
 * giá luôn đọc từ Products lúc hiển thị, kho chỉ bị trừ lúc đặt hàng (OrderService kiểm lại ở đó).
 * Mọi hàm trả về giỏ sau thay đổi để giao diện cập nhật một lần.
 */
public class CartService {
    private final CartsDao cartsDao = new CartsDao();
    private final CartItemsDao cartItemsDao = new CartItemsDao();
    private final ProductDao productDao = new ProductDao();
    private final SellerProfilesDao sellerProfilesDao = new SellerProfilesDao();

    /** Giỏ của tôi. Chưa có giỏ (chưa thêm món nào) thì trả giỏ rỗng. */
    public CartDto getCart(int userId) throws SQLException {
        Carts cart = cartsDao.getCartByUserId(userId);
        if (cart == null) {
            return CartDto.empty();
        }
        return toDto(cartItemsDao.getItemsByCartId(cart.getCartID()));
    }

    /** Thêm món; món đã có thì cộng dồn. Thứ tự kiểm tra khớp với bản mock của giao diện. */
    public CartDto addItem(int userId, Integer productId, Integer quantity) throws SQLException {
        requireValidQuantity(quantity);
        if (productId == null) {
            throw new ApiException(MessageKey.BAD_REQUEST);
        }
        Products product = productDao.getProductById(productId);
        if (product == null) {
            throw new ApiException(MessageKey.PRODUCT_NOT_FOUND);
        }
        SellerProfiles myShop = sellerProfilesDao.getSellerProfileByUserId(userId);
        if (myShop != null && product.getSellerProfileID() == myShop.getSellerProfileID()) {
            throw new ApiException(MessageKey.ORDER_OWN_PRODUCT);
        }
        if (product.getProductStatus() != ProductStatus.APPROVED) {
            throw new ApiException(MessageKey.PRODUCT_NOT_AVAILABLE);
        }
        if (product.getStockQuantity() <= 0) {
            throw new ApiException(MessageKey.PRODUCT_OUT_OF_STOCK);
        }

        Carts cart = cartsDao.getOrCreateCartByUserId(userId); // chỉ tạo giỏ khi mọi kiểm tra ở trên đã qua
        CartItems existing = cartItemsDao.getItem(cart.getCartID(), productId);
        // Tính bằng long: cộng hai số int lớn có thể tràn thành số âm và lọt qua phép so với kho
        long newQuantity = (long) (existing == null ? 0 : existing.getQuantity()) + quantity;
        if (newQuantity > product.getStockQuantity()) {
            throw new ApiException(MessageKey.CART_QUANTITY_EXCEEDS_STOCK);
        }
        cartItemsDao.addItem(cart.getCartID(), productId, quantity);
        cartsDao.touchCart(cart.getCartID());
        return getCart(userId);
    }

    /** Đặt số lượng mới cho một món đã có trong giỏ (không cộng dồn). Muốn bỏ món thì dùng removeItem. */
    public CartDto setQuantity(int userId, int productId, Integer quantity) throws SQLException {
        requireValidQuantity(quantity);
        Carts cart = cartsDao.getCartByUserId(userId);
        if (cart == null || cartItemsDao.getItem(cart.getCartID(), productId) == null) {
            throw new ApiException(MessageKey.CART_ITEM_NOT_FOUND);
        }
        Products product = productDao.getProductById(productId);
        if (product == null) {
            throw new ApiException(MessageKey.PRODUCT_NOT_FOUND);
        }
        if (quantity > product.getStockQuantity()) {
            throw new ApiException(MessageKey.CART_QUANTITY_EXCEEDS_STOCK);
        }
        cartItemsDao.setItemQuantity(cart.getCartID(), productId, quantity);
        cartsDao.touchCart(cart.getCartID());
        return getCart(userId);
    }

    public CartDto removeItem(int userId, int productId) throws SQLException {
        Carts cart = cartsDao.getCartByUserId(userId);
        if (cart == null || !cartItemsDao.removeItem(cart.getCartID(), productId)) {
            throw new ApiException(MessageKey.CART_ITEM_NOT_FOUND);
        }
        cartsDao.touchCart(cart.getCartID());
        return getCart(userId);
    }

    /** Xóa hết món. Giỏ chưa có hoặc đã rỗng cũng không phải lỗi. */
    public CartDto clear(int userId) throws SQLException {
        Carts cart = cartsDao.getCartByUserId(userId);
        if (cart != null) {
            cartItemsDao.clearCart(cart.getCartID());
            cartsDao.touchCart(cart.getCartID());
        }
        return CartDto.empty();
    }

    /** Số lượng phải là số nguyên dương: thiếu, 0 hoặc âm đều là CART_INVALID_QUANTITY. */
    private static void requireValidQuantity(Integer quantity) {
        if (quantity == null || quantity <= 0) {
            throw new ApiException(MessageKey.CART_INVALID_QUANTITY);
        }
    }

    /** Dựng giỏ hiển thị: giá hiện tại, available, maxQuantity, lineTotal, tạm tính. Món có sản phẩm đã mất thì bỏ qua. */
    private CartDto toDto(List<CartItems> rows) {
        List<CartItemDto> items = new ArrayList<>();
        BigDecimal subtotal = BigDecimal.ZERO;
        int itemCount = 0;
        for (CartItems row : rows) {
            Products p = productDao.getProductById(row.getProductID());
            if (p == null) {
                continue;
            }
            boolean available = p.getProductStatus() == ProductStatus.APPROVED && p.getStockQuantity() > 0;
            BigDecimal lineTotal = available
                    ? p.getPrice().multiply(BigDecimal.valueOf(row.getQuantity()))
                    : BigDecimal.ZERO;
            subtotal = subtotal.add(lineTotal);
            itemCount += row.getQuantity();
            items.add(new CartItemDto(p.getProductID(), p.getProductName(), p.getImageUrl(), p.getPrice(),
                    row.getQuantity(), available, p.getStockQuantity(), lineTotal, p.getSpeciesID()));
        }
        return new CartDto(items, itemCount, subtotal);
    }
}
