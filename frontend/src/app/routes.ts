import type { AdminRole } from '@/types/api';

export interface RouteMeta {
  path: string;
  name: string;
  title: string;
  layout: 'root' | 'auth' | 'account' | 'seller' | 'admin' | 'journey';
  has3D: boolean;
  description: string;
  /** user: cần tài khoản USER; admin: cần tài khoản ADMIN (lọc thêm theo roles) */
  access?: 'user' | 'admin';
  roles?: AdminRole[];
  /** Chỉ đăng ký route ở chế độ dev */
  devOnly?: boolean;
}

export const APP_ROUTES: RouteMeta[] = [
  { path: '/', name: 'Trang chủ', title: 'BioNexus · Khởi nguồn Sinh quyển', layout: 'root', has3D: true, description: 'Đại cảnh 3D kết nối câu chuyện sự sống và phân loại sinh học.' },
  { path: '/tham-hiem', name: 'Hành trình 9 loài', title: 'Hành trình 9 loài · BioNexus', layout: 'journey', has3D: false, description: 'Chuyến đi thực địa số qua 4 chặng, 9 trạm loài từ Cúc Phương đến Địa Trung Hải.' },
  { path: '/taxonomy', name: 'Cây phân loại', title: 'Cây phân loại Sinh học', layout: 'root', has3D: false, description: 'Khám phá phả hệ sinh học 6 cấp từ 2 giới gốc.' },
  { path: '/taxonomy/:id', name: 'Chi tiết phân loại', title: 'Chi tiết Nút Phân loại', layout: 'root', has3D: false, description: 'Duyệt nhánh phân loại và danh sách loài trực thuộc.' },
  { path: '/species', name: 'Bách khoa loài', title: 'Bách khoa Toàn thư Loài', layout: 'root', has3D: false, description: 'Tra cứu hồ sơ loài, lọc theo mức bảo tồn IUCN.' },
  { path: '/species/:id', name: 'Hồ sơ loài', title: 'Hồ sơ Tạp chí Khoa học', layout: 'root', has3D: true, description: 'Chuyên khảo khoa học, bản đồ sinh cảnh và cá thể đang bán.' },
  { path: '/products', name: 'Cửa hàng', title: 'Sàn Sinh vật cảnh Nhân giống', layout: 'root', has3D: false, description: 'Danh mục cá thể cảnh nhân tạo có kiểm định pháp lý.' },
  { path: '/products/:id', name: 'Chi tiết sản phẩm', title: 'Thông tin Sinh vật cảnh', layout: 'root', has3D: false, description: 'Chi tiết cá thể, cam kết nhân giống và đặt hàng.' },
  { path: '/login', name: 'Đăng nhập', title: 'Đăng nhập Tài khoản', layout: 'auth', has3D: false, description: 'Cổng đăng nhập thành viên cộng đồng BioNexus.' },
  { path: '/register', name: 'Đăng ký', title: 'Đăng ký Thành viên', layout: 'auth', has3D: false, description: 'Tạo tài khoản người mua mới.' },
  { path: '/admin/login', name: 'Đăng nhập Quản trị', title: 'Khu vực Ban Quản trị', layout: 'auth', has3D: false, description: 'Cổng xác thực kiểm duyệt viên và nhà sinh học.' },
  { path: '/cart', name: 'Giỏ hàng', title: 'Giỏ hàng của bạn', layout: 'root', has3D: false, description: 'Kiểm tra cá thể dự kiến mua và tính toán chi phí.', access: 'user' },
  { path: '/checkout', name: 'Thanh toán', title: 'Xác nhận Đặt hàng', layout: 'root', has3D: false, description: 'Mô phỏng transaction đặt hàng và khấu trừ kho.', access: 'user' },
  { path: '/orders', name: 'Đơn hàng', title: 'Lịch sử Đơn hàng', layout: 'account', has3D: false, description: 'Theo dõi tiến độ xử lý và vận chuyển đơn hàng.', access: 'user' },
  { path: '/orders/:id', name: 'Chi tiết đơn hàng', title: 'Chi tiết Đơn hàng', layout: 'account', has3D: false, description: 'Mã đơn, địa chỉ giao hàng và danh sách sinh vật.', access: 'user' },
  { path: '/account', name: 'Tài khoản', title: 'Hồ sơ Cá nhân', layout: 'account', has3D: false, description: 'Quản lý thông tin cá nhân và thiết lập tài khoản.', access: 'user' },
  { path: '/seller/apply', name: 'Đăng ký mở shop', title: 'Đăng ký Người bán', layout: 'account', has3D: false, description: 'Nộp hồ sơ cấp phép trang trại sinh vật cảnh.', access: 'user' },
  { path: '/seller', name: 'Bảng điều khiển Shop', title: 'Quản lý Bán hàng', layout: 'seller', has3D: false, description: 'Thống kê sản phẩm và đơn hàng của shop.', access: 'user' },
  { path: '/seller/products/new', name: 'Đăng bán mới', title: 'Đăng ký Cá thể Mới', layout: 'seller', has3D: false, description: 'Tạo hồ sơ đăng bán liên kết mã định danh loài.', access: 'user' },
  { path: '/admin', name: 'Quản trị hệ thống', title: 'Tổng quan Quản trị', layout: 'admin', has3D: false, description: 'Chỉ số thống kê KPI sinh quyển và vận hành sàn.', access: 'admin' },
  { path: '/admin/sellers', name: 'Kiểm duyệt shop', title: 'Kiểm duyệt Người bán', layout: 'admin', has3D: false, description: 'Phê duyệt hoặc từ chối hồ sơ đăng ký mở shop.', access: 'admin', roles: ['MODERATOR'] },
  { path: '/admin/products', name: 'Kiểm duyệt sản phẩm', title: 'Kiểm duyệt Sinh vật cảnh', layout: 'admin', has3D: false, description: 'Đối soát cá thể đăng bán với danh mục bảo tồn.', access: 'admin', roles: ['MODERATOR'] },
  { path: '/admin/species', name: 'Quản lý loài', title: 'Quản trị Bách khoa Loài', layout: 'admin', has3D: false, description: 'Cập nhật danh mục khoa học và thông số sinh học.', access: 'admin', roles: ['BIOLOGIST'] },
  { path: '/credits', name: 'Bản quyền ảnh', title: 'Ghi công & Bản quyền Ảnh', layout: 'root', has3D: false, description: 'Minh bạch nguồn gốc, tác giả và giấy phép Wikimedia Commons.' },
  { path: '/dev/ui', name: 'Thư viện giao diện', title: 'Thư viện Giao diện Dev', layout: 'root', has3D: false, description: 'Trưng bày toàn bộ 37 thành phần UI ở chế độ phát triển.', devOnly: true },
  { path: '*', name: 'Không tìm thấy', title: '404 · Lạc lối trong Sinh quyển', layout: 'root', has3D: false, description: 'Trang thông báo đường dẫn không tồn tại.' },
];
