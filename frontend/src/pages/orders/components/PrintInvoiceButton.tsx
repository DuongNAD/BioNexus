// Hằng số này giữ file không rỗng khi khối bên dưới đang bị comment (lint cấm file rỗng).
export const FEATURE_INFO = 'TN-12 · In hóa đơn (xem CHUC-NANG-MUA-HANG-THEM.md)';

// [TN-12] BẮT ĐẦU · Nút "In hóa đơn": mở cửa sổ hóa đơn nền trắng rồi gọi lệnh in của trình duyệt
// import React from 'react';
// import { Printer } from 'lucide-react';
// import { toast } from 'sonner';
// import { Button } from '@/components/ui/Button';
// import { formatVnd } from '@/lib/parseEnvironmentSpecs';
// import { formatOrderDate } from '../OrdersPage';
// import type { OrderDto } from '@/types/api';

// const STATUS_TEXT: Record<string, string> = {
  // PENDING: 'Đang chờ xử lý',
  // COMPLETED: 'Đã hoàn tất',
  // CANCELLED: 'Đã hủy',
// };

// // Tên sản phẩm và địa chỉ do người dùng nhập: phải thoát ký tự HTML trước khi ghép vào trang in
// function escapeHtml(text: string): string {
  // return text
    // .replace(/&/g, '&amp;')
    // .replace(/</g, '&lt;')
    // .replace(/>/g, '&gt;')
    // .replace(/"/g, '&quot;')
    // .replace(/'/g, '&#39;');
// }

// function buildInvoiceHtml(order: OrderDto): string {
  // const items = order.items || [];
  // let itemsTotal = 0;
  // let rows = '';
  // items.forEach((item, index) => {
    // itemsTotal = itemsTotal + item.lineTotal;
    // rows += `<tr>
      // <td>${index + 1}</td>
      // <td>${escapeHtml(item.productName)}</td>
      // <td class="num">${item.quantity}</td>
      // <td class="num">${formatVnd(item.unitPrice)}</td>
      // <td class="num">${formatVnd(item.lineTotal)}</td>
    // </tr>`;
  // });

  // // DB không lưu riêng phí vận chuyển và tiền giảm giá: phần chênh lệch giữa tổng tiền và tiền hàng
  // const difference = order.totalAmount - itemsTotal;
  // let differenceRow = '';
  // if (difference > 0) {
    // differenceRow = `<tr><td colspan="4">Phí vận chuyển</td><td class="num">${formatVnd(difference)}</td></tr>`;
  // } else if (difference < 0) {
    // differenceRow = `<tr><td colspan="4">Giảm giá và ưu đãi</td><td class="num">-${formatVnd(-difference)}</td></tr>`;
  // }

  // // Đọc kiểu "có thì dùng" để file này chạy được cả khi chưa bật TN-10 (đơn chưa có trường paymentMethod)
  // const paymentMethod = (order as { paymentMethod?: string }).paymentMethod;
  // let paymentLine = '';
  // if (paymentMethod === 'BANK_TRANSFER') {
    // paymentLine = '<p><b>Thanh toán:</b> Chuyển khoản VietQR</p>';
  // } else if (paymentMethod === 'COD') {
    // paymentLine = '<p><b>Thanh toán:</b> Trả tiền khi nhận hàng (COD)</p>';
  // }

  // return `<!doctype html>
// <html lang="vi">
// <head>
// <meta charset="utf-8">
// <title>Hóa đơn ${escapeHtml(order.orderCode)}</title>
// <style>
  // body { font-family: -apple-system, "Segoe UI", Roboto, Arial, sans-serif; color: #111; margin: 40px; }
  // h1 { font-size: 22px; margin: 0 0 4px; }
  // .brand { color: #0f766e; font-weight: 700; font-size: 18px; }
  // .meta p { margin: 4px 0; font-size: 14px; }
  // table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 14px; }
  // th, td { border-bottom: 1px solid #ddd; padding: 8px 6px; text-align: left; }
  // th { background: #f3f4f6; }
  // .num { text-align: right; white-space: nowrap; }
  // tfoot td { font-weight: 600; border-bottom: none; }
  // .total td { font-size: 16px; border-top: 2px solid #111; }
  // .thanks { margin-top: 32px; font-size: 13px; color: #555; }
// </style>
// </head>
// <body>
  // <div class="brand">BioNexus</div>
  // <h1>HÓA ĐƠN BÁN HÀNG</h1>
  // <div class="meta">
    // <p><b>Mã đơn:</b> ${escapeHtml(order.orderCode)}</p>
    // <p><b>Ngày đặt:</b> ${escapeHtml(formatOrderDate(order.createdAt))}</p>
    // <p><b>Trạng thái:</b> ${STATUS_TEXT[order.status] ?? order.status}</p>
    // <p><b>Giao đến:</b> ${escapeHtml(order.shippingAddress)}</p>
    // ${paymentLine}
  // </div>
  // <table>
    // <thead>
      // <tr><th>STT</th><th>Sản phẩm</th><th class="num">SL</th><th class="num">Đơn giá</th><th class="num">Thành tiền</th></tr>
    // </thead>
    // <tbody>${rows}</tbody>
    // <tfoot>
      // <tr><td colspan="4">Tiền hàng</td><td class="num">${formatVnd(itemsTotal)}</td></tr>
      // ${differenceRow}
      // <tr class="total"><td colspan="4">Tổng thanh toán</td><td class="num">${formatVnd(order.totalAmount)}</td></tr>
    // </tfoot>
  // </table>
  // <p class="thanks">Cảm ơn bạn đã mua sinh vật cảnh nhân giống hợp pháp tại BioNexus.</p>
// </body>
// </html>`;
// }

// export function PrintInvoiceButton({ order }: { order: OrderDto }): React.JSX.Element {
  // const handlePrint = () => {
    // const printWindow = window.open('', '_blank', 'width=820,height=900');
    // if (!printWindow) {
      // toast.error('Trình duyệt đang chặn cửa sổ mới. Hãy cho phép cửa sổ bật lên rồi thử lại.');
      // return;
    // }
    // printWindow.document.write(buildInvoiceHtml(order));
    // printWindow.document.close();
    // printWindow.focus();
    // printWindow.print();
  // };

  // return (
    // <Button pill variant="secondary" onClick={handlePrint} leftIcon={<Printer className="size-4" aria-hidden="true" />}>
      // In hóa đơn
    // </Button>
  // );
// }
// [TN-12] KẾT THÚC
