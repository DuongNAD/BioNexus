import type { MockUser, MockAdmin } from '../types';

export const SEED_USERS: MockUser[] = [
  { id: 1, username: 'nguyenvana', passwordHash: '123456', email: 'vana@gmail.com', fullName: 'Nguyễn Văn A', phone: '0901234567', address: 'Quận 1, TP.HCM', status: 'ACTIVE' },
  { id: 2, username: 'tranthib', passwordHash: '123456', email: 'thib@gmail.com', fullName: 'Trần Thị B', phone: '0912345678', address: 'Cầu Giấy, Hà Nội', status: 'ACTIVE' },
  { id: 3, username: 'levanc', passwordHash: '123456', email: 'vanc@gmail.com', fullName: 'Lê Văn C', phone: '0987654321', address: 'Hải Châu, Đà Nẵng', status: 'ACTIVE' },
  { id: 4, username: 'phamthid', passwordHash: '123456', email: 'thid@gmail.com', fullName: 'Phạm Thị D', phone: '0934567890', address: 'Thanh Khê, Đà Nẵng', status: 'ACTIVE' },
  { id: 5, username: 'hoangvane', passwordHash: '123456', email: 'vane@gmail.com', fullName: 'Hoàng Văn E', phone: '0945678901', address: 'Ninh Kiều, Cần Thơ', status: 'ACTIVE' },
  { id: 6, username: 'vuthif', passwordHash: '123456', email: 'thif@gmail.com', fullName: 'Vũ Thị F', phone: '0956789012', address: 'Biên Hòa, Đồng Nai', status: 'BANNED' },
  { id: 7, username: 'dangvang', passwordHash: '123456', email: 'vang@gmail.com', fullName: 'Đặng Văn G', phone: '0967890123', address: 'Nha Trang, Khánh Hòa', status: 'INACTIVE' },
];

export const SEED_ADMINS: MockAdmin[] = [
  { id: 1, account: 'superadmin', fullName: 'Admin Tổng', passwordHash: 'admin123', adminRole: 'SUPER_ADMIN', status: 'ACTIVE' },
  { id: 2, account: 'biologist1', fullName: 'TS. Sinh Học Nam', passwordHash: 'admin123', adminRole: 'BIOLOGIST', status: 'ACTIVE' },
  { id: 3, account: 'moderator1', fullName: 'Kiểm Duyệt Viên', passwordHash: 'admin123', adminRole: 'MODERATOR', status: 'ACTIVE' },
  { id: 4, account: 'moderator2', fullName: 'Kiểm Duyệt Viên 2', passwordHash: 'admin123', adminRole: 'MODERATOR', status: 'INACTIVE' },
  { id: 5, account: 'biologist2', fullName: 'ThS. Sinh Học Minh', passwordHash: 'admin123', adminRole: 'BIOLOGIST', status: 'BANNED' },
];
