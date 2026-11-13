// Hằng số này giữ file không rỗng khi khối bên dưới đang bị comment (lint cấm file rỗng).
export const FEATURE_INFO = 'TN-17 · Giỏ hàng tạm cho khách (xem CHUC-NANG-MUA-HANG-THEM.md)';

// [TN-17] BẮT ĐẦU · Giỏ hàng tạm của khách chưa đăng nhập, lưu ở localStorage của trình duyệt
// // Khách chỉ lưu id và số lượng; giá, tồn kho và các điều kiện mua đều do backend kiểm khi gộp vào giỏ thật.
// export interface GuestCartLine {
  // productId: number;
  // quantity: number;
// }

// const STORAGE_KEY = 'bionexus.guestCart.v1';

// // localStorage có thể ném lỗi (chế độ riêng tư, bị chặn): khi đó coi như giỏ tạm rỗng
// export function readGuestCart(): GuestCartLine[] {
  // try {
    // const raw = window.localStorage.getItem(STORAGE_KEY);
    // if (!raw) {
      // return [];
    // }
    // const parsed = JSON.parse(raw) as GuestCartLine[];
    // if (!Array.isArray(parsed)) {
      // return [];
    // }
    // return parsed.filter((line) => Number.isInteger(line.productId) && Number.isInteger(line.quantity) && line.quantity > 0);
  // } catch {
    // return [];
  // }
// }

// function writeGuestCart(lines: GuestCartLine[]): void {
  // try {
    // window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
  // } catch {
    // // Bỏ qua: không lưu được thì giỏ tạm mất khi tải lại trang
  // }
// }

// /** Thêm vào giỏ tạm; món đã có thì cộng dồn nhưng không vượt maxQuantity (tồn kho hoặc giới hạn mỗi sản phẩm). */
// export function addToGuestCart(productId: number, quantity: number, maxQuantity: number): void {
  // const lines = readGuestCart();
  // const existing = lines.find((line) => line.productId === productId);
  // if (existing) {
    // existing.quantity = Math.min(existing.quantity + quantity, maxQuantity);
  // } else {
    // lines.push({ productId, quantity: Math.min(quantity, maxQuantity) });
  // }
  // writeGuestCart(lines);
// }

// export function countGuestCartItems(): number {
  // let total = 0;
  // for (const line of readGuestCart()) {
    // total = total + line.quantity;
  // }
  // return total;
// }

// export function clearGuestCart(): void {
  // try {
    // window.localStorage.removeItem(STORAGE_KEY);
  // } catch {
    // // Bỏ qua
  // }
// }
// [TN-17] KẾT THÚC
