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
// import com.bionexus.backend.dal.UsersDao; // [TN-03]
// import com.bionexus.backend.dto.AdminOrderDto; // [TN-03]
// import com.bionexus.backend.model.Users; // [TN-03]
// import com.bionexus.backend.dal.UsersDao; // [TN-05]
// import com.bionexus.backend.dto.SellerOrderDto; // [TN-05]
// import com.bionexus.backend.model.Users; // [TN-05]
// import com.bionexus.backend.enums.Coupon; // [TN-06]
// import com.bionexus.backend.enums.PaymentMethod; // [TN-10]
// import com.bionexus.backend.enums.PaymentStatus; // [TN-11]

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
        // [TN-13] BẮT ĐẦU · Chỉ đặt các món được chọn trong giỏ (cartProductIds), món còn lại giữ trong giỏ
        // Integer partialCartId = null;
        // if (request.items() == null && request.cartProductIds() != null) {
            // if (request.cartProductIds().isEmpty()) {
                // throw new ApiException(MessageKey.ORDER_EMPTY_ITEMS);
            // }
            // Set<Integer> chosenIds = new HashSet<>(request.cartProductIds());
            // List<Line> chosenLines = new ArrayList<>();
            // for (Line line : lines) {
                // if (chosenIds.contains(line.productId())) {
                    // chosenLines.add(line);
                // }
            // }
            // if (chosenLines.size() != chosenIds.size()) {
                // throw new ApiException(MessageKey.CART_ITEM_NOT_FOUND); // có món được chọn nhưng không nằm trong giỏ
            // }
            // lines = chosenLines;
            // partialCartId = cartId;
            // cartId = null; // không xóa cả giỏ: chỉ xóa các món đã mua (trong transaction bên dưới)
        // }
        // [TN-13] KẾT THÚC
        // Luôn khóa theo thứ tự id tăng dần: hai đơn cùng lúc không khóa chéo nhau (deadlock)
        lines.sort(Comparator.comparingInt(Line::productId));

        // [TN-08] BẮT ĐẦU · Giới hạn số lượng mỗi sản phẩm trong một đơn (kiểm trước khi mở transaction)
        // for (Line line : lines) {
            // if (line.quantity() > CartService.MAX_QUANTITY_PER_PRODUCT) {
                // throw new ApiException(MessageKey.ORDER_QUANTITY_LIMIT);
            // }
        // }
        // [TN-08] KẾT THÚC

        // [TN-06] BẮT ĐẦU · Tìm mã giảm giá trước khi mở transaction: sai mã thì báo ngay, chưa đụng tới kho
        // Coupon coupon = null;
        // if (request.couponCode() != null && !request.couponCode().isBlank()) {
            // coupon = Coupon.find(request.couponCode());
            // if (coupon == null) {
                // throw new ApiException(MessageKey.COUPON_INVALID);
            // }
        // }
        // [TN-06] KẾT THÚC

        // [TN-10] BẮT ĐẦU · Đọc phương thức thanh toán: bỏ trống thì mặc định trả tiền khi nhận hàng (COD)
        // PaymentMethod paymentMethod = PaymentMethod.COD;
        // if (request.paymentMethod() != null && !request.paymentMethod().isBlank()) {
            // try {
                // paymentMethod = PaymentMethod.valueOf(request.paymentMethod().trim().toUpperCase());
            // } catch (IllegalArgumentException e) {
                // throw new ApiException(MessageKey.PAYMENT_INVALID_METHOD);
            // }
        // }
        // [TN-10] KẾT THÚC

        // 2. Transaction
        SellerProfiles myShop = sellerProfilesDao.getSellerProfileByUserId(userId);
        long orderId;
        try (Connection conn = DBContext.getConnection()) {
            conn.setAutoCommit(false);
            try {
                orderId = createOrder(conn, userId, address, lines, myShop, cartId);
                // [TN-06] BẮT ĐẦU · Trừ tiền giảm giá vào đơn vừa tạo, vẫn trong cùng transaction
                // if (coupon != null) {
                    // applyCoupon(conn, orderId, coupon);
                // }
                // [TN-06] KẾT THÚC
                // [TN-10] BẮT ĐẦU · Lưu phương thức thanh toán vào đơn vừa tạo, cùng transaction
                // ordersDao.updatePaymentMethod(conn, orderId, paymentMethod);
                // [TN-10] KẾT THÚC
                // [TN-13] BẮT ĐẦU · Xóa khỏi giỏ đúng các món vừa đặt, cùng transaction với đơn
                // if (partialCartId != null) {
                    // for (Line line : lines) {
                        // cartItemsDao.removeItem(conn, partialCartId, line.productId());
                    // }
                // }
                // [TN-13] KẾT THÚC
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

        // [TN-07] BẮT ĐẦU · Cộng phí vận chuyển vào tổng đơn trước khi lưu
        // total = total.add(shippingFeeFor(total));
        // [TN-07] KẾT THÚC
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

    // [TN-00] BẮT ĐẦU · Hủy đơn (có hoàn kho) và hoàn tất đơn, dùng chung cho người mua (TN-01, TN-02) và quản trị (TN-03)
    // // Hủy đơn PENDING trong MỘT transaction: đổi trạng thái rồi cộng lại kho từng món.
    // // Lỗi ở bất kỳ bước nào thì rollback: không có chuyện đơn đã hủy mà kho chưa được hoàn.
    // private void cancelAndRestoreStock(long orderId) throws SQLException {
        // try (Connection conn = DBContext.getConnection()) {
            // conn.setAutoCommit(false);
            // try {
                // boolean changed = ordersDao.updateStatusIfCurrent(conn, orderId, OrderStatus.PENDING, OrderStatus.CANCELLED);
                // if (!changed) {
                    // throw new ApiException(MessageKey.ORDER_CANNOT_CANCEL); // đơn đã hoàn tất hoặc đã hủy trước đó
                // }
                // for (OrderDetails detail : orderDetailsDao.getOrderDetailsByOrderId(conn, orderId)) {
                    // productDao.restoreStock(conn, detail.getProductID(), detail.getQuantity());
                // }
                // conn.commit();
            // } catch (SQLException | RuntimeException e) {
                // conn.rollback();
                // throw e;
            // } finally {
                // conn.setAutoCommit(true);
            // }
        // }
    // }

    // // Hoàn tất đơn PENDING. Không đụng tới kho vì kho đã trừ lúc đặt hàng.
    // private void markCompleted(long orderId) throws SQLException {
        // try (Connection conn = DBContext.getConnection()) {
            // boolean changed = ordersDao.updateStatusIfCurrent(conn, orderId, OrderStatus.PENDING, OrderStatus.COMPLETED);
            // if (!changed) {
                // throw new ApiException(MessageKey.ORDER_CANNOT_COMPLETE);
            // }
        // }
    // }
    // [TN-00] KẾT THÚC

    // [TN-01] BẮT ĐẦU · Người mua hủy đơn của chính mình (POST /api/orders/{id}/cancel)
    // // Đơn của người khác cũng báo "không tìm thấy", giống getMyOrder.
    // public OrderDto cancelMyOrder(int userId, long orderId) throws SQLException {
        // Orders order = ordersDao.getOrderById(orderId);
        // if (order == null || order.getUserId() != userId) {
            // throw new ApiException(MessageKey.ORDER_NOT_FOUND);
        // }
        // cancelAndRestoreStock(orderId);
        // return getMyOrder(userId, orderId);
    // }
    // [TN-01] KẾT THÚC

    // [TN-02] BẮT ĐẦU · Người mua xác nhận đã nhận hàng (POST /api/orders/{id}/complete)
    // public OrderDto confirmReceived(int userId, long orderId) throws SQLException {
        // Orders order = ordersDao.getOrderById(orderId);
        // if (order == null || order.getUserId() != userId) {
            // throw new ApiException(MessageKey.ORDER_NOT_FOUND);
        // }
        // markCompleted(orderId);
        // return getMyOrder(userId, orderId);
    // }
    // [TN-02] KẾT THÚC

    // [TN-03] BẮT ĐẦU · Quản trị viên xem mọi đơn và đổi trạng thái đơn
    // // status null thì lấy tất cả đơn.
    // public List<AdminOrderDto> getOrdersForAdmin(OrderStatus status) throws SQLException {
        // UsersDao usersDao = new UsersDao();
        // List<AdminOrderDto> result = new ArrayList<>();
        // for (Orders order : ordersDao.getOrdersForAdmin(status)) {
            // Users buyer = usersDao.getUserById(order.getUserId());
            // result.add(AdminOrderDto.fromEntity(order, buyer, itemsOf(order.getOrderId())));
        // }
        // return result;
    // }

    // // Chỉ đơn PENDING mới đổi được: sang COMPLETED (đã giao xong) hoặc CANCELLED (hủy và hoàn kho).
    // public AdminOrderDto updateOrderStatusByAdmin(long orderId, OrderStatus newStatus) throws SQLException {
        // Orders order = ordersDao.getOrderById(orderId);
        // if (order == null) {
            // throw new ApiException(MessageKey.ORDER_NOT_FOUND);
        // }
        // if (newStatus == OrderStatus.CANCELLED) {
            // cancelAndRestoreStock(orderId);
        // } else if (newStatus == OrderStatus.COMPLETED) {
            // markCompleted(orderId);
        // } else {
            // throw new ApiException(MessageKey.INVALID_STATUS); // không cho đưa đơn về lại PENDING
        // }
        // Orders updated = ordersDao.getOrderById(orderId);
        // Users buyer = new UsersDao().getUserById(updated.getUserId());
        // return AdminOrderDto.fromEntity(updated, buyer, itemsOf(orderId));
    // }
    // [TN-03] KẾT THÚC

    // [TN-05] BẮT ĐẦU · Người bán xem các đơn có hàng của shop mình (GET /api/seller/orders)
    // // Mỗi đơn chỉ hiện các món của shop này, vì một đơn có thể gồm hàng của nhiều shop.
    // public List<SellerOrderDto> getShopOrders(int userId) throws SQLException {
        // SellerProfiles shop = sellerProfilesDao.getSellerProfileByUserId(userId);
        // if (shop == null) {
            // throw new ApiException(MessageKey.SELLER_NOT_ACTIVE);
        // }
        // UsersDao usersDao = new UsersDao();
        // List<SellerOrderDto> result = new ArrayList<>();
        // for (Orders order : ordersDao.getOrdersBySellerProfileId(shop.getSellerProfileID())) {
            // List<OrderItemDto> shopItems = new ArrayList<>();
            // for (OrderDetails detail : orderDetailsDao.getOrderDetailsByOrderId(order.getOrderId())) {
                // Products product = productDao.getProductById(detail.getProductID());
                // if (product == null || product.getSellerProfileID() != shop.getSellerProfileID()) {
                    // continue; // món của shop khác trong cùng đơn
                // }
                // BigDecimal lineTotal = detail.getUnitPrice().multiply(BigDecimal.valueOf(detail.getQuantity()));
                // shopItems.add(new OrderItemDto(product.getProductID(), product.getProductName(), product.getImageUrl(),
                        // detail.getQuantity(), detail.getUnitPrice(), lineTotal));
            // }
            // Users buyer = usersDao.getUserById(order.getUserId());
            // result.add(SellerOrderDto.fromEntity(order, buyer, shopItems));
        // }
        // return result;
    // }
    // [TN-05] KẾT THÚC

    // [TN-11] BẮT ĐẦU · Đối soát thanh toán cho quản trị viên
    // // status null thì lấy mọi đơn.
    // public List<OrderDto> getOrdersByPaymentStatus(PaymentStatus status) throws SQLException {
        // List<OrderDto> result = new ArrayList<>();
        // for (Orders order : ordersDao.getOrdersByPaymentStatus(status)) {
            // result.add(OrderDto.fromEntity(order, itemsOf(order.getOrderId())));
        // }
        // return result;
    // }

    // // Quản trị viên xác nhận đã thu tiền (COD do người giao hàng thu, hoặc đã thấy tiền chuyển khoản về).
    // // Đơn đã thanh toán rồi hoặc đã hủy thì không xác nhận được nữa.
    // public OrderDto confirmPayment(long orderId) throws SQLException {
        // Orders order = ordersDao.getOrderById(orderId);
        // if (order == null) {
            // throw new ApiException(MessageKey.ORDER_NOT_FOUND);
        // }
        // if (!ordersDao.markPaid(orderId)) {
            // throw new ApiException(MessageKey.PAYMENT_CANNOT_CONFIRM);
        // }
        // return OrderDto.fromEntity(ordersDao.getOrderById(orderId), itemsOf(orderId));
    // }
    // [TN-11] KẾT THÚC

    // [TN-06] BẮT ĐẦU · Áp mã giảm giá cho đơn vừa tạo (gọi trong transaction của placeOrder)
    // // Tiền giảm tính trên tiền hàng (tổng các dòng), không tính trên phí vận chuyển.
    // // Ném lỗi ở đây thì placeOrder rollback: đơn không được tạo, kho và giỏ giữ nguyên.
    // private void applyCoupon(Connection conn, long orderId, Coupon coupon) throws SQLException {
        // BigDecimal itemsTotal = orderDetailsDao.sumLineTotals(conn, orderId);
        // if (!coupon.isEligible(itemsTotal)) {
            // throw new ApiException(MessageKey.COUPON_MIN_ORDER_NOT_MET);
        // }
        // BigDecimal discount = coupon.discountFor(itemsTotal);
        // ordersDao.subtractFromTotal(conn, orderId, discount);
    // }
    // [TN-06] KẾT THÚC

    // [TN-07] BẮT ĐẦU · Quy tắc phí vận chuyển
    // private static final BigDecimal SHIPPING_FEE = new BigDecimal("30000");
    // private static final BigDecimal FREE_SHIPPING_FROM = new BigDecimal("1000000");

    // // Tiền hàng từ 1.000.000đ trở lên thì miễn phí, dưới mức đó thu 30.000đ.
    // private static BigDecimal shippingFeeFor(BigDecimal itemsTotal) {
        // if (itemsTotal.compareTo(FREE_SHIPPING_FROM) >= 0) {
            // return BigDecimal.ZERO;
        // }
        // return SHIPPING_FEE;
    // }
    // [TN-07] KẾT THÚC

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
