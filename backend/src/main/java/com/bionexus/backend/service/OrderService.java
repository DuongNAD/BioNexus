package com.bionexus.backend.service;

import com.bionexus.backend.dal.CartItemsDao;
import com.bionexus.backend.dal.CartsDao;
import com.bionexus.backend.dal.DBContext;
import com.bionexus.backend.dal.OrderDetailsDao;
import com.bionexus.backend.dal.OrdersDao;
import com.bionexus.backend.dal.ProductDao;
import com.bionexus.backend.dal.SellerProfilesDao;
import com.bionexus.backend.dto.OrderDto;
import com.bionexus.backend.dto.OrderItemDto;
import com.bionexus.backend.dto.PlaceOrderRequest;
import com.bionexus.backend.enums.MessageKey;
import com.bionexus.backend.enums.OrderStatus;
import com.bionexus.backend.enums.ProductStatus;
import com.bionexus.backend.model.CartItems;
import com.bionexus.backend.model.Carts;
import com.bionexus.backend.model.OrderDetails;
import com.bionexus.backend.model.Orders;
import com.bionexus.backend.model.Products;
import com.bionexus.backend.model.SellerProfiles;
import com.bionexus.backend.util.ApiException;

import java.math.BigDecimal;
import java.security.SecureRandom;
import java.sql.Connection;
import java.sql.SQLException;
import java.time.Year;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

/**
 * Nghiệp vụ đơn hàng. placeOrder chạy trong MỘT transaction (PLAN mục 4.4):
 * khóa từng sản phẩm, kiểm tra, trừ kho, tạo đơn, tạo dòng đơn, (xóa giỏ) rồi mới commit.
 * Lỗi ở bất kỳ bước nào thì rollback: kho, đơn và giỏ đều nguyên như cũ.
 */
public class OrderService {
    private static final String CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // bỏ O, 0, I, 1 cho dễ đọc
    private static final int DUPLICATE_KEY = 2627;                               // mã lỗi SQL Server khi trùng UNIQUE
    private static final SecureRandom RANDOM = new SecureRandom();

    private final ProductDao productDao = new ProductDao();
    private final OrdersDao ordersDao = new OrdersDao();
    private final OrderDetailsDao orderDetailsDao = new OrderDetailsDao();
    private final CartsDao cartsDao = new CartsDao();
    private final CartItemsDao cartItemsDao = new CartItemsDao();
    private final SellerProfilesDao sellerProfilesDao = new SellerProfilesDao();

    /** Một món muốn mua (đã kiểm tra hình thức, chưa kiểm tra với DB). */
    private record Line(int productId, int quantity) {
    }

    public OrderDto placeOrder(int userId, PlaceOrderRequest request) throws SQLException {
        if (request == null) {
            throw new ApiException(MessageKey.BAD_REQUEST);
        }
        String address = request.shippingAddress() == null ? "" : request.shippingAddress().trim();
        if (address.isEmpty() || address.length() > 255) { // cột shippingAddress là nvarchar(255)
            throw new ApiException(MessageKey.ORDER_INVALID_SHIPPING_ADDRESS);
        }

        // 1. Xác định danh sách món: từ body, hoặc cả giỏ nếu body không có "items"
        Integer cartId = null;
        List<Line> lines;
        if (request.items() == null) {
            Carts cart = cartsDao.getCartByUserId(userId);
            List<CartItems> cartItems = cart == null ? List.of() : cartItemsDao.getItemsByCartId(cart.getCartID());
            if (cartItems.isEmpty()) {
                throw new ApiException(MessageKey.CART_EMPTY);
            }
            cartId = cart.getCartID();
            lines = new ArrayList<>();
            for (CartItems ci : cartItems) {
                lines.add(new Line(ci.getProductID(), ci.getQuantity()));
            }
        } else {
            lines = parseItems(request.items());
        }
        // Luôn khóa theo thứ tự id tăng dần: hai đơn cùng lúc không khóa chéo nhau (deadlock)
        lines.sort(Comparator.comparingInt(Line::productId));

        // 2. Transaction
        SellerProfiles myShop = sellerProfilesDao.getSellerProfileByUserId(userId);
        long orderId;
        try (Connection conn = DBContext.getConnection()) {
            conn.setAutoCommit(false);
            try {
                orderId = createOrder(conn, userId, address, lines, myShop, cartId);
                conn.commit();
            } catch (SQLException | RuntimeException e) {
                conn.rollback();
                throw e;
            } finally {
                conn.setAutoCommit(true);
            }
        }
        return getMyOrder(userId, orderId);
    }

    /** Kiểm tra hình thức danh sách món trong body: không rỗng, số lượng > 0, không trùng sản phẩm. */
    private List<Line> parseItems(List<PlaceOrderRequest.Item> items) {
        if (items.isEmpty()) {
            throw new ApiException(MessageKey.ORDER_EMPTY_ITEMS);
        }
        List<Line> lines = new ArrayList<>();
        Set<Integer> seen = new HashSet<>();
        for (PlaceOrderRequest.Item item : items) {
            if (item == null || item.productId() == null) {
                throw new ApiException(MessageKey.BAD_REQUEST);
            }
            if (item.quantity() == null || item.quantity() <= 0) {
                throw new ApiException(MessageKey.ORDER_INVALID_QUANTITY);
            }
            if (!seen.add(item.productId())) {
                throw new ApiException(MessageKey.ORDER_DUPLICATE_ITEMS);
            }
            lines.add(new Line(item.productId(), item.quantity()));
        }
        return lines;
    }

    /** Phần ghi dữ liệu của transaction. Giá luôn đọc từ DB (không bao giờ nhận giá từ client). */
    private long createOrder(Connection conn, int userId, String address, List<Line> lines,
                             SellerProfiles myShop, Integer cartId) throws SQLException {
        List<OrderDetails> details = new ArrayList<>();
        BigDecimal total = BigDecimal.ZERO;

        for (Line line : lines) {
            Products p = productDao.getProductForUpdate(conn, line.productId()); // khóa dòng này
            if (p == null) {
                throw new ApiException(MessageKey.PRODUCT_NOT_FOUND);
            }
            if (myShop != null && p.getSellerProfileID() == myShop.getSellerProfileID()) {
                throw new ApiException(MessageKey.ORDER_OWN_PRODUCT);
            }
            if (p.getProductStatus() != ProductStatus.APPROVED) {
                throw new ApiException(MessageKey.PRODUCT_NOT_AVAILABLE);
            }
            if (!productDao.decreaseStock(conn, p.getProductID(), line.quantity())) {
                throw new ApiException(MessageKey.PRODUCT_OUT_OF_STOCK); // không đủ hàng
            }
            details.add(new OrderDetails(0, p.getProductID(), line.quantity(), p.getPrice()));
            total = total.add(p.getPrice().multiply(BigDecimal.valueOf(line.quantity())));
        }

        long orderId = insertOrderWithUniqueCode(conn, userId, total, address);
        for (OrderDetails d : details) {
            d.setOrderID(orderId);
            orderDetailsDao.insertOrderDetail(conn, d);
        }
        if (cartId != null) {
            cartItemsDao.clearCart(conn, cartId); // mua từ giỏ thì xóa giỏ cùng lúc commit
        }
        return orderId;
    }

    /** Mã đơn dạng ORD-<năm>-<6 ký tự>. Trùng (hiếm) thì sinh mã khác, tối đa 5 lần. */
    private long insertOrderWithUniqueCode(Connection conn, int userId, BigDecimal total, String address) throws SQLException {
        SQLException last = null;
        for (int attempt = 0; attempt < 5; attempt++) {
            Orders order = new Orders(newOrderCode(), userId, total, OrderStatus.PENDING, address);
            try {
                return ordersDao.insertOrderReturnId(conn, order);
            } catch (SQLException e) {
                if (e.getErrorCode() != DUPLICATE_KEY) {
                    throw e;
                }
                last = e;
            }
        }
        throw last;
    }

    private static String newOrderCode() {
        StringBuilder sb = new StringBuilder("ORD-").append(Year.now().getValue()).append('-');
        for (int i = 0; i < 6; i++) {
            sb.append(CODE_CHARS.charAt(RANDOM.nextInt(CODE_CHARS.length())));
        }
        return sb.toString();
    }

    /** Đơn của tôi, mới nhất trước, kèm các dòng. */
    public List<OrderDto> getMyOrders(int userId) {
        List<OrderDto> result = new ArrayList<>();
        for (Orders o : ordersDao.getOrderByUserId(userId)) {
            result.add(OrderDto.fromEntity(o, itemsOf(o.getOrderId())));
        }
        return result;
    }

    /** Một đơn của tôi. Đơn của người khác cũng trả ORDER_NOT_FOUND (không tiết lộ đơn đó có tồn tại). */
    public OrderDto getMyOrder(int userId, long orderId) {
        Orders o = ordersDao.getOrderById(orderId);
        if (o == null || o.getUserId() != userId) {
            throw new ApiException(MessageKey.ORDER_NOT_FOUND);
        }
        return OrderDto.fromEntity(o, itemsOf(orderId));
    }

    private List<OrderItemDto> itemsOf(long orderId) {
        List<OrderItemDto> items = new ArrayList<>();
        for (OrderDetails d : orderDetailsDao.getOrderDetailsByOrderId(orderId)) {
            Products p = productDao.getProductById(d.getProductID());
            BigDecimal lineTotal = d.getUnitPrice().multiply(BigDecimal.valueOf(d.getQuantity()));
            items.add(new OrderItemDto(
                    d.getProductID(),
                    p == null ? null : p.getProductName(),
                    p == null ? null : p.getImageUrl(),
                    d.getQuantity(),
                    d.getUnitPrice(),
                    lineTotal));
        }
        return items;
    }
}
