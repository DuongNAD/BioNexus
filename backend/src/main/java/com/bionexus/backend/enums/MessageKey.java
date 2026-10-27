package com.bionexus.backend.enums;

public enum MessageKey {

    // ==================== 1. COMMON (Dùng chung) ====================
    SUCCESS("Thành công", "Success"),
    CREATED_SUCCESS("Tạo mới thành công", "Created successfully"),
    UPDATED_SUCCESS("Cập nhật thành công", "Updated successfully"),
    DELETED_SUCCESS("Xóa thành công", "Deleted successfully"),
    BAD_REQUEST("Dữ liệu gửi lên không hợp lệ", "Invalid request data"),
    NOT_FOUND("Không tìm thấy dữ liệu yêu cầu", "Requested resource not found"),
    INTERNAL_ERROR("Lỗi hệ thống, vui lòng thử lại sau", "Internal server error, please try again later"),
    INVALID_ID("Mã định danh không hợp lệ", "Invalid identifier"),
    INVALID_JSON("Nội dung gửi lên không phải JSON hợp lệ", "Request body is not valid JSON"),
    INVALID_PAGINATION("Tham số phân trang không hợp lệ", "Invalid pagination parameters"),
    INVALID_STATUS("Trạng thái không hợp lệ", "Invalid status value"),
    METHOD_NOT_ALLOWED("Phương thức không được hỗ trợ cho đường dẫn này", "Method not allowed for this endpoint"),
    CONFLICT("Dữ liệu xung đột với trạng thái hiện tại", "The request conflicts with the current state"),

    // ==================== 2. AUTH (Xác thực & Phân quyền) ====================
    AUTH_LOGIN_SUCCESS("Đăng nhập thành công", "Login successful"),
    AUTH_REGISTER_SUCCESS("Đăng ký tài khoản thành công", "Account registered successfully"),
    AUTH_INVALID_CREDENTIALS("Sai tài khoản hoặc mật khẩu", "Invalid username or password"),
    AUTH_ACCOUNT_INACTIVE("Tài khoản chưa được kích hoạt hoặc đang tạm khóa", "Account is inactive"),
    AUTH_ACCOUNT_BANNED("Tài khoản của bạn đã bị khóa vĩnh viễn", "Your account has been banned"),
    AUTH_UNAUTHORIZED("Vui lòng đăng nhập để tiếp tục", "Please log in to continue"),
    AUTH_TOKEN_EXPIRED("Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại", "Session expired, please log in again"),
    AUTH_TOKEN_INVALID("Token xác thực không hợp lệ", "Invalid authentication token"),
    AUTH_FORBIDDEN("Bạn không có quyền thực hiện thao tác này", "You do not have permission to perform this action"),
    AUTH_TOO_MANY_ATTEMPTS("Bạn đã thử đăng nhập quá nhiều lần, vui lòng thử lại sau", "Too many login attempts, please try again later"), // làm nếu còn thời gian

    // ==================== 3. USER (Người dùng) ====================
    USER_NOT_FOUND("Không tìm thấy người dùng", "User not found"),
    USER_USERNAME_EXISTS("Tên đăng nhập đã tồn tại", "Username already exists"),
    USER_EMAIL_EXISTS("Email đã được sử dụng", "Email is already in use"),
    USER_MISSING_FIELDS("Vui lòng điền đầy đủ thông tin bắt buộc", "Please fill in all required fields"),
    USER_INVALID_USERNAME("Tên đăng nhập không hợp lệ", "Invalid username"),
    USER_INVALID_EMAIL("Email không hợp lệ", "Invalid email address"),
    USER_INVALID_PASSWORD("Mật khẩu không hợp lệ hoặc quá ngắn", "Invalid or too short password"),
    USER_INVALID_PHONE("Số điện thoại không hợp lệ", "Invalid phone number"),

    // ==================== 4. SELLER (Cửa hàng / Người bán) ====================
    SELLER_NOT_FOUND("Không tìm thấy thông tin cửa hàng", "Seller profile not found"),
    SELLER_ALREADY_REGISTERED("Tài khoản này đã đăng ký cửa hàng", "This user already has a seller profile"),
    SELLER_SHOP_NAME_EXISTS("Tên cửa hàng đã tồn tại", "Shop name already exists"),
    SELLER_NOT_ACTIVE("Cửa hàng chưa được duyệt hoặc đang bị khóa", "Seller profile is not active"),
    SELLER_APPLY_SUCCESS("Đã gửi yêu cầu mở cửa hàng, vui lòng chờ duyệt", "Shop application submitted, please wait for approval"),
    SELLER_INVALID_SHOP_NAME("Tên cửa hàng không hợp lệ", "Invalid shop name"),
    SELLER_APPROVED_SUCCESS("Đã duyệt cửa hàng", "Shop approved"),
    SELLER_REJECTED_SUCCESS("Đã từ chối cửa hàng", "Shop rejected"),
    SELLER_BANNED_SUCCESS("Đã khóa cửa hàng", "Shop banned"),
    SELLER_INVALID_STATUS_TRANSITION("Không thể chuyển cửa hàng sang trạng thái này", "Cannot change the shop to this status"),

    // ==================== 5. TAXONOMY & SPECIES (Phân loại & Loài sinh vật) ====================
    TAXONOMY_NOT_FOUND("Không tìm thấy nhánh phân loại sinh học", "Taxonomy node not found"),
    SPECIES_NOT_FOUND("Không tìm thấy thông tin loài sinh vật", "Species not found"),
    SPECIES_NAME_EXISTS("Tên khoa học của loài đã tồn tại", "Scientific name already exists"),
    TAXONOMY_NAME_EXISTS("Tên khoa học của nhánh phân loại đã tồn tại", "Taxonomy scientific name already exists"), // làm nếu còn thời gian (BIOLOGIST quản lý loài)
    TAXONOMY_INVALID_PARENT("Nhánh cha không hợp lệ", "Invalid parent node"), // làm nếu còn thời gian
    TAXONOMY_INVALID_RANK("Cấp bậc của nhánh con phải thấp hơn cấp bậc của nhánh cha", "A child node's rank must be lower than its parent's rank"), // làm nếu còn thời gian
    SPECIES_INVALID_NODE("Loài phải được gắn vào nhánh phân loại cấp chi (GENUS)", "A species must belong to a genus-level taxonomy node"), // làm nếu còn thời gian
    SPECIES_INVALID_CONSERVATION_STATUS("Mức độ bảo tồn không hợp lệ", "Invalid conservation status"), // làm nếu còn thời gian

    // ==================== 6. PRODUCT (Sản phẩm) ====================
    PRODUCT_NOT_FOUND("Không tìm thấy sản phẩm", "Product not found"),
    PRODUCT_OUT_OF_STOCK("Sản phẩm đã hết hàng hoặc không đủ số lượng tồn kho", "Product is out of stock or insufficient quantity"),
    PRODUCT_INVALID_PRICE("Giá sản phẩm không hợp lệ", "Invalid product price"),
    PRODUCT_SUBMITTED("Đã gửi sản phẩm, vui lòng chờ kiểm duyệt", "Product submitted, please wait for moderation"),
    PRODUCT_APPROVED_SUCCESS("Đã duyệt sản phẩm", "Product approved"),
    PRODUCT_REJECTED_SUCCESS("Đã từ chối sản phẩm", "Product rejected"),
    PRODUCT_INVALID_NAME("Tên sản phẩm không hợp lệ", "Invalid product name"),
    PRODUCT_INVALID_STOCK("Số lượng tồn kho không hợp lệ", "Invalid stock quantity"),
    PRODUCT_NOT_AVAILABLE("Sản phẩm hiện không còn được bán", "Product is no longer available"),
    PRODUCT_NOT_OWNED("Sản phẩm này không thuộc cửa hàng của bạn", "This product does not belong to your shop"),
    PRODUCT_INVALID_STATUS_TRANSITION("Không thể chuyển sản phẩm sang trạng thái này", "Cannot change the product to this status"),

    // ==================== 7. ORDER (Đơn hàng) ====================
    ORDER_NOT_FOUND("Không tìm thấy đơn hàng", "Order not found"),
    ORDER_CREATE_SUCCESS("Đặt hàng thành công", "Order placed successfully"),
    ORDER_EMPTY_ITEMS("Đơn hàng phải có ít nhất 1 sản phẩm", "Order must contain at least one item"),
    ORDER_CANNOT_CANCEL("Không thể hủy đơn hàng ở trạng thái hiện tại", "Cannot cancel order in its current status"),
    ORDER_INVALID_QUANTITY("Số lượng phải lớn hơn 0", "Quantity must be greater than 0"),
    ORDER_INVALID_SHIPPING_ADDRESS("Vui lòng nhập địa chỉ giao hàng", "Please enter a shipping address"),
    ORDER_DUPLICATE_ITEMS("Mỗi sản phẩm chỉ được xuất hiện một lần trong đơn hàng", "Each product can appear only once in an order"),
    ORDER_OWN_PRODUCT("Bạn không thể mua sản phẩm của chính cửa hàng mình", "You cannot buy products from your own shop"),
    ORDER_CANCEL_SUCCESS("Hủy đơn hàng thành công", "Order cancelled successfully"), // làm nếu còn thời gian (hủy đơn)

    // ==================== 8. CART (Giỏ hàng) ====================
    CART_ITEM_ADDED("Đã thêm vào giỏ hàng", "Added to cart"),
    CART_ITEM_UPDATED("Đã cập nhật giỏ hàng", "Cart updated"),
    CART_ITEM_REMOVED("Đã xóa sản phẩm khỏi giỏ hàng", "Removed from cart"),
    CART_CLEARED("Đã xóa toàn bộ giỏ hàng", "Cart cleared"),
    CART_ITEM_NOT_FOUND("Sản phẩm không có trong giỏ hàng", "Item is not in the cart"),
    CART_EMPTY("Giỏ hàng đang trống", "Your cart is empty"),
    CART_INVALID_QUANTITY("Số lượng trong giỏ phải lớn hơn 0", "Cart quantity must be greater than 0"),
    CART_QUANTITY_EXCEEDS_STOCK("Số lượng vượt quá tồn kho hiện có", "Quantity exceeds available stock");

    private final String vi;
    private final String en;

    MessageKey(String vi, String en) {
        this.vi = vi;
        this.en = en;
    }

    public String getVi() {
        return vi;
    }

    public String getEn() {
        return en;
    }

    /**
     * Lấy nội dung thông báo theo mã ngôn ngữ ("vi" hoặc "en").
     * Mặc định trả về tiếng Việt nếu không truyền hoặc truyền khác "en".
     */
    public String getMessage(String lang) {
        if ("en".equalsIgnoreCase(lang)) {
            return en;
        }
        return vi;
    }

    /**
     * Dịch tự động từ tên mã (ví dụ "AUTH_INVALID_CREDENTIALS") sang câu thông báo theo ngôn ngữ.
     * Nếu chuỗi truyền vào không nằm trong MessageKey thì trả về nguyên gốc chuỗi đó.
     */
    public static String resolve(String keyName, String lang) {
        if (keyName == null) {
            return INTERNAL_ERROR.getMessage(lang);
        }
        try {
            return MessageKey.valueOf(keyName).getMessage(lang);
        } catch (IllegalArgumentException e) {
            return keyName;
        }
    }
}
