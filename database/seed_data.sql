USE BioNexusDB;
GO

-- 1. Thêm Users mẫu (userID sẽ tự tăng: 1, 2, 3)
INSERT INTO Users (username, password_hash, email, fullName, phone, address, status)
VALUES 
('nguyenvana', '123456', 'vana@gmail.com', N'Nguyễn Văn A', '0901234567', N'Quận 1, TP.HCM', 'ACTIVE'),
('tranthib',   '123456', 'thib@gmail.com', N'Trần Thị B',   '0912345678', N'Cầu Giấy, Hà Nội', 'ACTIVE'),
('levanc',     '123456', 'vanc@gmail.com', N'Lê Văn C',     '0987654321', N'Hải Châu, Đà Nẵng', 'ACTIVE');
GO

-- 2. Thêm Admins mẫu (adminID sẽ tự tăng: 1, 2, 3)
INSERT INTO Admins (fullName, account, password_hash, adminRole, status)
VALUES 
(N'Admin Tổng',        'superadmin', 'admin123', 'SUPER_ADMIN', 'ACTIVE'),
(N'TS. Sinh Học Nam',  'biologist1', 'admin123', 'BIOLOGIST',   'ACTIVE'),
(N'Kiểm Duyệt Viên',   'moderator1', 'admin123', 'MODERATOR',   'ACTIVE');
GO

-- 3. Thêm SellerProfiles mẫu (sellerProfileID = 1, 2)
-- User 1 mở shop đã được Admin 3 duyệt (ACTIVE), User 2 mới đăng ký (PENDING)
INSERT INTO SellerProfiles (userID, shopName, businessLicenseUrl, bio, status, approvedByAdminID)
VALUES 
(1, N'BioGreen Exotic', 'https://bionexus.vn/licenses/lic-01.pdf', N'Chuyên cung cấp sinh vật cảnh và cây thực vật quý hiếm có giấy phép.', 'ACTIVE', 3),
(2, N'AquaTerra Shop',  'https://bionexus.vn/licenses/lic-02.pdf', N'Trại nhân giống bò sát và lưỡng cư sinh sản nhân tạo.', 'PENDING', NULL);
GO

-- 4. Thêm cây phân loại TaxonomyNodes (nodeID = 1 -> 6)
INSERT INTO TaxonomyNodes (scientificName, commonName, rankLevel, parentNodeID)
VALUES 
('Animalia',       N'Giới Động vật',        'KINGDOM', NULL),
('Chordata',       N'Ngành Dây sống',       'PHYLUM',  1),
('Reptilia',       N'Lớp Bò sát',           'CLASS',   2),
('Squamata',       N'Bộ Có vảy',            'ORDER',   3),
('Gekkonidae',     N'Họ Tắc kè',            'FAMILY',  4),
('Eublepharis',    N'Chi Thằn lằn da báo',  'GENUS',   5);
GO

-- 5. Thêm Species (speciesID = 1)
INSERT INTO Species (nodeID, managedByAdminID, scientificName, commonName, conservationStatus, environmentSpecs, description, imageUrl, referenceUrl)
VALUES 
(6, 2, 'Eublepharis macularius', N'Thằn lằn da báo (Leopard Gecko)', 'LC', 
 N'Nhiệt độ: 26-32°C, Độ ẩm: 30-40%, Môi trường: Bán hoang mạc', 
 N'Loài thằn lằn hoạt động về đêm, hiền lành, dễ nuôi trong điều kiện nuôi nhốt.', 
 'https://bionexus.vn/images/leopard-gecko.jpg', 
 'https://en.wikipedia.org/wiki/Leopard_gecko');
GO

-- 6. Thêm Products (productID = 1, 2)
INSERT INTO Products (sellerProfileID, speciesID, productName, price, stockQuantity, description, imageUrl, status, moderatedByAdminID)
VALUES 
(1, 1, N'Leopard Gecko High Yellow (3 tháng tuổi)', 850000.00, 5, N'Cá thể khỏe mạnh, ăn dế tốt, đã lột xác 3 lần.', 'https://bionexus.vn/images/prod-gecko-1.jpg', 'APPROVED', 3),
(1, 1, N'Leopard Gecko Tangerine Baby',            1200000.00, 3, N'Màu cam đậm đột biến gen, giấy tờ nguồn gốc đầy đủ.', 'https://bionexus.vn/images/prod-gecko-2.jpg', 'APPROVED', 3);
GO

-- 7. Thêm Orders (orderID = 1)
INSERT INTO Orders (orderCode, userID, totalAmount, status, shippingAddress)
VALUES 
('ORD-2026-0001', 3, 2050000.00, 'PENDING', N'123 Nguyễn Văn Linh, Hải Châu, Đà Nẵng');
GO

-- 8. Thêm OrderDetails
INSERT INTO OrderDetails (orderID, productID, quantity, unitPrice)
VALUES 
(1, 1, 1, 850000.00),
(1, 2, 1, 1200000.00);
GO
