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

    // ==================== 3. USER (Người dùng) ====================
    USER_NOT_FOUND("Không tìm thấy người dùng", "User not found"),
    USER_USERNAME_EXISTS("Tên đăng nhập đã tồn tại", "Username already exists"),
    USER_EMAIL_EXISTS("Email đã được sử dụng", "Email is already in use"),
    USER_MISSING_FIELDS("Vui lòng điền đầy đủ thông tin bắt buộc", "Please fill in all required fields"),

    // ==================== 4. SELLER (Cửa hàng / Người bán) ====================
    SELLER_NOT_FOUND("Không tìm thấy thông tin cửa hàng", "Seller profile not found"),
    SELLER_ALREADY_REGISTERED("Tài khoản này đã đăng ký cửa hàng", "This user already has a seller profile"),
    SELLER_SHOP_NAME_EXISTS("Tên cửa hàng đã tồn tại", "Shop name already exists"),
    SELLER_NOT_ACTIVE("Cửa hàng chưa được duyệt hoặc đang bị khóa", "Seller profile is not active"),

    // ==================== 5. TAXONOMY & SPECIES (Phân loại & Loài sinh vật) ====================
    TAXONOMY_NOT_FOUND("Không tìm thấy nhánh phân loại sinh học", "Taxonomy node not found"),
    SPECIES_NOT_FOUND("Không tìm thấy thông tin loài sinh vật", "Species not found"),
    SPECIES_NAME_EXISTS("Tên khoa học của loài đã tồn tại", "Scientific name already exists"),

    // ==================== 6. PRODUCT (Sản phẩm) ====================
    PRODUCT_NOT_FOUND("Không tìm thấy sản phẩm", "Product not found"),
    PRODUCT_OUT_OF_STOCK("Sản phẩm đã hết hàng hoặc không đủ số lượng tồn kho", "Product is out of stock or insufficient quantity"),
    PRODUCT_INVALID_PRICE("Giá sản phẩm không hợp lệ", "Invalid product price"),

    // ==================== 7. ORDER (Đơn hàng) ====================
    ORDER_NOT_FOUND("Không tìm thấy đơn hàng", "Order not found"),
    ORDER_CREATE_SUCCESS("Đặt hàng thành công", "Order placed successfully"),
    ORDER_EMPTY_ITEMS("Đơn hàng phải có ít nhất 1 sản phẩm", "Order must contain at least one item"),
    ORDER_CANNOT_CANCEL("Không thể hủy đơn hàng ở trạng thái hiện tại", "Cannot cancel order in its current status");

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
