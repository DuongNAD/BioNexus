import type { MessageKey } from '@/types/api';

/**
 * Bảng ánh xạ chuẩn hóa 59+ mã lỗi MessageKey từ backend Java sang tiếng Việt có dấu.
 * Nguồn: com.bionexus.backend.enums.MessageKey.java
 */
export const MESSAGE_MAP: Record<MessageKey, string> = {
  // 1. COMMON
  SUCCESS: 'Thành công',
  CREATED_SUCCESS: 'Tạo mới thành công',
  UPDATED_SUCCESS: 'Cập nhật thành công',
  DELETED_SUCCESS: 'Xóa thành công',
  BAD_REQUEST: 'Dữ liệu gửi lên không hợp lệ',
  NOT_FOUND: 'Không tìm thấy dữ liệu yêu cầu',
  INTERNAL_ERROR: 'Lỗi hệ thống, vui lòng thử lại sau',
  INVALID_ID: 'Mã định danh không hợp lệ',
  INVALID_JSON: 'Nội dung gửi lên không phải JSON hợp lệ',
  INVALID_PAGINATION: 'Tham số phân trang không hợp lệ',
  INVALID_STATUS: 'Trạng thái không hợp lệ',
  METHOD_NOT_ALLOWED: 'Phương thức không được hỗ trợ cho đường dẫn này',
  CONFLICT: 'Dữ liệu xung đột với trạng thái hiện tại',

  // 2. AUTH
  AUTH_LOGIN_SUCCESS: 'Đăng nhập thành công',
  AUTH_REGISTER_SUCCESS: 'Đăng ký tài khoản thành công',
  AUTH_INVALID_CREDENTIALS: 'Sai tài khoản hoặc mật khẩu',
  AUTH_ACCOUNT_INACTIVE: 'Tài khoản chưa được kích hoạt hoặc đang tạm khóa',
  AUTH_ACCOUNT_BANNED: 'Tài khoản của bạn đã bị khóa vĩnh viễn',
  AUTH_UNAUTHORIZED: 'Vui lòng đăng nhập để tiếp tục',
  AUTH_TOKEN_EXPIRED: 'Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại',
  AUTH_TOKEN_INVALID: 'Token xác thực không hợp lệ',
  AUTH_FORBIDDEN: 'Bạn không có quyền thực hiện thao tác này',
  AUTH_TOO_MANY_ATTEMPTS: 'Bạn đã thử đăng nhập quá nhiều lần, vui lòng thử lại sau',

  // 3. USER
  USER_NOT_FOUND: 'Không tìm thấy người dùng',
  USER_USERNAME_EXISTS: 'Tên đăng nhập đã tồn tại',
  USER_EMAIL_EXISTS: 'Email đã được sử dụng',
  USER_MISSING_FIELDS: 'Vui lòng điền đầy đủ thông tin bắt buộc',
  USER_INVALID_USERNAME: 'Tên đăng nhập không hợp lệ',
  USER_INVALID_EMAIL: 'Email không hợp lệ',
  USER_INVALID_PASSWORD: 'Mật khẩu không hợp lệ hoặc quá ngắn',
  USER_INVALID_PHONE: 'Số điện thoại không hợp lệ',

  // 4. SELLER
  SELLER_NOT_FOUND: 'Không tìm thấy thông tin cửa hàng',
  SELLER_ALREADY_REGISTERED: 'Tài khoản này đã đăng ký cửa hàng',
  SELLER_SHOP_NAME_EXISTS: 'Tên cửa hàng đã tồn tại',
  SELLER_NOT_ACTIVE: 'Cửa hàng chưa được duyệt hoặc đang bị khóa',
  SELLER_APPLY_SUCCESS: 'Đã gửi yêu cầu mở cửa hàng, vui lòng chờ duyệt',
  SELLER_INVALID_SHOP_NAME: 'Tên cửa hàng không hợp lệ',
  SELLER_APPROVED_SUCCESS: 'Đã duyệt cửa hàng',
  SELLER_REJECTED_SUCCESS: 'Đã từ chối cửa hàng',
  SELLER_BANNED_SUCCESS: 'Đã khóa cửa hàng',
  SELLER_INVALID_STATUS_TRANSITION: 'Không thể chuyển cửa hàng sang trạng thái này',

  // 5. TAXONOMY & SPECIES
  TAXONOMY_NOT_FOUND: 'Không tìm thấy nhánh phân loại sinh học',
  SPECIES_NOT_FOUND: 'Không tìm thấy thông tin loài sinh vật',
  SPECIES_NAME_EXISTS: 'Tên khoa học của loài đã tồn tại',
  TAXONOMY_NAME_EXISTS: 'Tên khoa học của nhánh phân loại đã tồn tại',
  TAXONOMY_INVALID_PARENT: 'Nhánh cha không hợp lệ',
  TAXONOMY_INVALID_RANK: 'Cấp bậc của nhánh con phải thấp hơn cấp bậc của nhánh cha',
  SPECIES_INVALID_NODE: 'Loài phải được gắn vào nhánh phân loại cấp chi (GENUS)',
  SPECIES_INVALID_CONSERVATION_STATUS: 'Mức độ bảo tồn không hợp lệ',

  // 6. PRODUCT
  PRODUCT_NOT_FOUND: 'Không tìm thấy sản phẩm',
  PRODUCT_OUT_OF_STOCK: 'Sản phẩm đã hết hàng hoặc không đủ số lượng tồn kho',
  PRODUCT_INVALID_PRICE: 'Giá sản phẩm không hợp lệ',
  PRODUCT_SUBMITTED: 'Đã gửi sản phẩm, vui lòng chờ kiểm duyệt',
  PRODUCT_APPROVED_SUCCESS: 'Đã duyệt sản phẩm',
  PRODUCT_REJECTED_SUCCESS: 'Đã từ chối sản phẩm',
  PRODUCT_INVALID_NAME: 'Tên sản phẩm không hợp lệ',
  PRODUCT_INVALID_STOCK: 'Số lượng tồn kho không hợp lệ',
  PRODUCT_NOT_AVAILABLE: 'Sản phẩm hiện không còn được bán',
  PRODUCT_NOT_OWNED: 'Sản phẩm này không thuộc cửa hàng của bạn',
  PRODUCT_INVALID_STATUS_TRANSITION: 'Không thể chuyển sản phẩm sang trạng thái này',

  // 7. ORDER
  ORDER_NOT_FOUND: 'Không tìm thấy đơn hàng',
  ORDER_CREATE_SUCCESS: 'Đặt hàng thành công',
  ORDER_EMPTY_ITEMS: 'Đơn hàng phải có ít nhất 1 sản phẩm',
  ORDER_CANNOT_CANCEL: 'Không thể hủy đơn hàng ở trạng thái hiện tại',
  ORDER_INVALID_QUANTITY: 'Số lượng phải lớn hơn 0',
  ORDER_INVALID_SHIPPING_ADDRESS: 'Vui lòng nhập địa chỉ giao hàng',
  ORDER_DUPLICATE_ITEMS: 'Mỗi sản phẩm chỉ được xuất hiện một lần trong đơn hàng',
  ORDER_OWN_PRODUCT: 'Bạn không thể mua sản phẩm của chính cửa hàng mình',
  ORDER_CANCEL_SUCCESS: 'Hủy đơn hàng thành công',

  // 8. CART
  CART_ITEM_ADDED: 'Đã thêm vào giỏ hàng',
  CART_ITEM_UPDATED: 'Đã cập nhật giỏ hàng',
  CART_ITEM_REMOVED: 'Đã xóa sản phẩm khỏi giỏ hàng',
  CART_CLEARED: 'Đã xóa toàn bộ giỏ hàng',
  CART_ITEM_NOT_FOUND: 'Sản phẩm không có trong giỏ hàng',
  CART_EMPTY: 'Giỏ hàng đang trống',
  CART_INVALID_QUANTITY: 'Số lượng trong giỏ phải lớn hơn 0',
  CART_QUANTITY_EXCEEDS_STOCK: 'Số lượng vượt quá tồn kho hiện có',
};

/**
 * Tra cứu thông điệp tiếng Việt từ mã MessageKey hoặc trả về chính chuỗi đó nếu không tìm thấy.
 */
export function getMessage(code: string): string {
  if (code in MESSAGE_MAP) {
    return MESSAGE_MAP[code as MessageKey];
  }
  return code || MESSAGE_MAP.INTERNAL_ERROR;
}
