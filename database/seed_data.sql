USE BioNexusDB;
GO

/*
    seed_data.sql - Dữ liệu mẫu cho dự án BioNexus. CHỈ DÙNG CHO DB DEV.

    CÁCH CHẠY (đúng thứ tự)
      1. BioNexusDatabes.sql : DROP + CREATE lại DB, các bảng rỗng
      2. seed_data.sql       : file này
    DB đã có dữ liệu thì file này dừng ngay và không ghi gì (cả seed nằm trong 1 transaction, lỗi ở
    đâu cũng rollback hết). Muốn seed lại thì chạy lại bước 1 trước.

    QUY ƯỚC
    - Không gõ ID cứng: khóa ngoại được tra theo tên (username, account, shopName, scientificName,
      orderCode, productName). SQL Server không bảo đảm ID cấp theo thứ tự dòng của INSERT ... SELECT,
      nên trong test cũng đừng giả định ID, hãy tra theo tên.
    - Cây phân loại: mỗi cấp một câu INSERT, từ KINGDOM xuống GENUS. Cha phải nằm ở khối phía trên vì
      một câu INSERT không "thấy" các dòng do chính nó vừa thêm.
    - Thêm dữ liệu: copy một dòng cùng khối rồi sửa. Cuối file có các câu kiểm tra: tra sai tên
      cha / chi / shop sẽ báo lỗi và rollback.
    - Phân loại theo cách xếp truyền thống (Reptilia = CLASS, Squamata = ORDER). GBIF xếp bò sát khác
      (Squamata, Testudines ở bậc CLASS và không có ORDER) nên đừng ép "cấp con = cấp cha + 1".
      Họ / chi / loài đã đối chiếu với GBIF Backbone; mức bảo tồn lấy từ IUCN Red List qua GBIF,
      tra ngày 2026-10-26. Có LC, NT, VU, EN, CR; chưa có EW, EX.
    - Tên tiếng Việt chỉ để tham khảo. Taxon chưa có tên Việt đã kiểm chứng thì ghi theo tên Latin
      (ví dụ "Họ Eublepharidae"), thay khi có nguồn.
    - environmentSpecs và description là dữ liệu mẫu, không phải hướng dẫn nuôi.
    - Giỏ hàng mẫu: levanc có 2 món bình thường; phamthid có 1 món vượt tồn kho và 1 món đã SOLD_OUT
      để thử các trường hợp lỗi. Giỏ không lưu giá.
    - password_hash đang chứa mật khẩu thô vì backend chưa băm. Khi làm đăng nhập có băm thì phải sinh lại.
*/

SET XACT_ABORT ON;

BEGIN TRY
    BEGIN TRANSACTION;

    -- 0. Chỉ seed vào DB rỗng (Users, Admins, TaxonomyNodes rỗng thì các bảng phụ thuộc chắc chắn rỗng)
    IF EXISTS (SELECT 1 FROM Users) OR EXISTS (SELECT 1 FROM Admins) OR EXISTS (SELECT 1 FROM TaxonomyNodes)
        THROW 50000, N'DB đã có dữ liệu. Chạy lại BioNexusDatabes.sql (DROP + CREATE) rồi mới chạy seed_data.sql.', 1;

    -- 1. Users: đủ 3 trạng thái ACTIVE / INACTIVE / BANNED
    INSERT INTO Users (username, password_hash, email, fullName, phone, address, status)
    VALUES
    ('nguyenvana', '123456', 'vana@gmail.com', N'Nguyễn Văn A', '0901234567', N'Quận 1, TP.HCM',        'ACTIVE'),
    ('tranthib',   '123456', 'thib@gmail.com', N'Trần Thị B',   '0912345678', N'Cầu Giấy, Hà Nội',     'ACTIVE'),
    ('levanc',     '123456', 'vanc@gmail.com', N'Lê Văn C',     '0987654321', N'Hải Châu, Đà Nẵng',    'ACTIVE'),
    ('phamthid',   '123456', 'thid@gmail.com', N'Phạm Thị D',   '0934567890', N'Thanh Khê, Đà Nẵng',   'ACTIVE'),
    ('hoangvane',  '123456', 'vane@gmail.com', N'Hoàng Văn E',  '0945678901', N'Ninh Kiều, Cần Thơ',   'ACTIVE'),
    ('vuthif',     '123456', 'thif@gmail.com', N'Vũ Thị F',     '0956789012', N'Biên Hòa, Đồng Nai',   'BANNED'),
    ('dangvang',   '123456', 'vang@gmail.com', N'Đặng Văn G',   '0967890123', N'Nha Trang, Khánh Hòa', 'INACTIVE');

    -- 2. Admins: đủ 3 vai trò và 3 trạng thái
    INSERT INTO Admins (fullName, account, password_hash, adminRole, status)
    VALUES
    (N'Admin Tổng',         'superadmin', 'admin123', 'SUPER_ADMIN', 'ACTIVE'),
    (N'TS. Sinh Học Nam',   'biologist1', 'admin123', 'BIOLOGIST',   'ACTIVE'),
    (N'Kiểm Duyệt Viên',    'moderator1', 'admin123', 'MODERATOR',   'ACTIVE'),
    (N'Kiểm Duyệt Viên 2',  'moderator2', 'admin123', 'MODERATOR',   'INACTIVE'),
    (N'ThS. Sinh Học Minh', 'biologist2', 'admin123', 'BIOLOGIST',   'BANNED');

    -- 3. SellerProfiles: đủ 4 trạng thái. Shop ACTIVE/BANNED có admin duyệt, PENDING/REJECTED thì chưa
    INSERT INTO SellerProfiles (userID, shopName, businessLicenseUrl, bio, status, approvedByAdminID)
    SELECT u.userID, v.shopName, v.businessLicenseUrl, v.bio, v.status, a.adminID
    FROM (VALUES
        ('nguyenvana', N'BioGreen Exotic',    'https://bionexus.vn/licenses/lic-01.pdf', N'Chuyên cung cấp sinh vật cảnh và cây thực vật quý hiếm có giấy phép.', 'ACTIVE',   'moderator1'),
        ('tranthib',   N'AquaTerra Shop',     'https://bionexus.vn/licenses/lic-02.pdf', N'Trại nhân giống bò sát và lưỡng cư sinh sản nhân tạo.',               'PENDING',  NULL),
        ('phamthid',   N'Carnivora Garden',   'https://bionexus.vn/licenses/lic-03.pdf', N'Vườn ươm cây ăn côn trùng: nắp ấm, bắt ruồi, gọng vó.',              'ACTIVE',   'moderator1'),
        ('hoangvane',  N'Exotic Reptile Hub', NULL,                                      N'Cửa hàng bò sát nhập khẩu.',                                          'REJECTED', NULL),
        ('vuthif',     N'Gecko Lab',          'https://bionexus.vn/licenses/lic-05.pdf', N'Nhân giống tắc kè và thằn lằn cảnh.',                                 'BANNED',   'moderator1')
    ) AS v(username, shopName, businessLicenseUrl, bio, status, approverAccount)
    LEFT JOIN Users  u ON u.username = v.username
    LEFT JOIN Admins a ON a.account  = v.approverAccount;

    -- 4. TaxonomyNodes: mỗi cấp một INSERT, tra cha theo scientificName (cha phải được thêm ở khối trên)
    -- 4.1 KINGDOM
    INSERT INTO TaxonomyNodes (scientificName, commonName, rankLevel, parentNodeID)
    VALUES
    ('Animalia', N'Giới Động vật', 'KINGDOM', NULL),
    ('Plantae',  N'Giới Thực vật', 'KINGDOM', NULL);

    -- 4.2 PHYLUM
    INSERT INTO TaxonomyNodes (scientificName, commonName, rankLevel, parentNodeID)
    SELECT v.scientificName, v.commonName, 'PHYLUM', p.nodeID
    FROM (VALUES
        ('Chordata',     N'Ngành Dây sống',         'Animalia'),
        ('Tracheophyta', N'Ngành Thực vật có mạch', 'Plantae')
    ) AS v(scientificName, commonName, parentName)
    LEFT JOIN TaxonomyNodes p ON p.scientificName = v.parentName;

    -- 4.3 CLASS
    INSERT INTO TaxonomyNodes (scientificName, commonName, rankLevel, parentNodeID)
    SELECT v.scientificName, v.commonName, 'CLASS', p.nodeID
    FROM (VALUES
        ('Reptilia',      N'Lớp Bò sát',     'Chordata'),
        ('Amphibia',      N'Lớp Lưỡng cư',   'Chordata'),
        ('Magnoliopsida', N'Lớp Hai lá mầm', 'Tracheophyta')
    ) AS v(scientificName, commonName, parentName)
    LEFT JOIN TaxonomyNodes p ON p.scientificName = v.parentName;

    -- 4.4 ORDER
    INSERT INTO TaxonomyNodes (scientificName, commonName, rankLevel, parentNodeID)
    SELECT v.scientificName, v.commonName, 'ORDER', p.nodeID
    FROM (VALUES
        ('Squamata',       N'Bộ Có vảy',     'Reptilia'),
        ('Testudines',     N'Bộ Rùa',        'Reptilia'),
        ('Caudata',        N'Bộ Có đuôi',    'Amphibia'),
        ('Caryophyllales', N'Bộ Cẩm chướng', 'Magnoliopsida')
    ) AS v(scientificName, commonName, parentName)
    LEFT JOIN TaxonomyNodes p ON p.scientificName = v.parentName;

    -- 4.5 FAMILY
    INSERT INTO TaxonomyNodes (scientificName, commonName, rankLevel, parentNodeID)
    SELECT v.scientificName, v.commonName, 'FAMILY', p.nodeID
    FROM (VALUES
        ('Eublepharidae',  N'Họ Eublepharidae',  'Squamata'),
        ('Agamidae',       N'Họ Nhông',          'Squamata'),
        ('Pythonidae',     N'Họ Trăn',           'Squamata'),
        ('Testudinidae',   N'Họ Rùa núi',        'Testudines'),
        ('Ambystomatidae', N'Họ Ambystomatidae', 'Caudata'),
        ('Nepenthaceae',   N'Họ Nắp ấm',         'Caryophyllales'),
        ('Droseraceae',    N'Họ Gọng vó',        'Caryophyllales')
    ) AS v(scientificName, commonName, parentName)
    LEFT JOIN TaxonomyNodes p ON p.scientificName = v.parentName;

    -- 4.6 GENUS
    INSERT INTO TaxonomyNodes (scientificName, commonName, rankLevel, parentNodeID)
    SELECT v.scientificName, v.commonName, 'GENUS', p.nodeID
    FROM (VALUES
        ('Eublepharis', N'Chi Thằn lằn da báo', 'Eublepharidae'),
        ('Pogona',      N'Chi Pogona',          'Agamidae'),
        ('Python',      N'Chi Trăn',            'Pythonidae'),
        ('Testudo',     N'Chi Testudo',         'Testudinidae'),
        ('Ambystoma',   N'Chi Ambystoma',       'Ambystomatidae'),
        ('Nepenthes',   N'Chi Nắp ấm',          'Nepenthaceae'),
        ('Dionaea',     N'Chi Dionaea',         'Droseraceae')
    ) AS v(scientificName, commonName, parentName)
    LEFT JOIN TaxonomyNodes p ON p.scientificName = v.parentName;

    -- 5. Species: gắn vào node GENUS, do biologist1 quản lý. conservationStatus: LC, NT, VU, EN, CR
    INSERT INTO Species (nodeID, managedByAdminID, scientificName, commonName, conservationStatus, environmentSpecs, description, imageUrl, referenceUrl)
    SELECT g.nodeID, a.adminID, v.scientificName, v.commonName, v.conservationStatus,
           v.environmentSpecs, v.description, v.imageUrl, v.referenceUrl
    FROM (VALUES
        ('Eublepharis', 'Eublepharis macularius', N'Thằn lằn da báo (Leopard Gecko)', 'LC',
         N'Nhiệt độ: 26-32°C, Độ ẩm: 30-40%, Môi trường: Bán hoang mạc',
         N'Loài thằn lằn hoạt động về đêm, hiền lành, dễ nuôi trong điều kiện nuôi nhốt.',
         'https://bionexus.vn/images/leopard-gecko.jpg', 'https://www.gbif.org/species/5221283'),
        ('Pogona', 'Pogona vitticeps', N'Rồng Úc (Bearded Dragon)', 'LC',
         N'Nhiệt độ: 26-32°C (điểm sưởi 38-42°C), Độ ẩm: 30-40%, Môi trường: Bán hoang mạc, savan khô',
         N'Thằn lằn bản địa miền trung nước Úc, hoạt động ban ngày, tính tình hiền, ăn tạp (côn trùng và rau xanh).',
         'https://bionexus.vn/images/bearded-dragon.jpg', 'https://www.gbif.org/species/2465641'),
        ('Python', 'Python regius', N'Trăn bóng (Ball Python)', 'NT',
         N'Nhiệt độ: 26-32°C, Độ ẩm: 50-60%, Môi trường: Savan và đồng cỏ Tây Phi',
         N'Trăn cỡ nhỏ, hiền, khi sợ hãi cuộn tròn như quả bóng; phổ biến làm thú cưng với rất nhiều màu (morph).',
         'https://bionexus.vn/images/ball-python.jpg', 'https://www.gbif.org/species/2465380'),
        ('Python', 'Python bivittatus', N'Trăn đất (Burmese Python)', 'VU',
         N'Nhiệt độ: 26-32°C, Độ ẩm: 60-80%, Môi trường: Rừng nhiệt đới, đầm lầy, ven sông',
         N'Một trong những loài trăn lớn nhất thế giới, bản địa Nam và Đông Nam Á (có ở Việt Nam); cần chuồng rộng.',
         'https://bionexus.vn/images/burmese-python.jpg', 'https://www.gbif.org/species/4820533'),
        ('Testudo', 'Testudo hermanni', N'Rùa Hermann (Hermann''s Tortoise)', 'VU',
         N'Nhiệt độ: 20-30°C (điểm sưởi 32-35°C), Độ ẩm: 40-60%, Môi trường: Bụi rậm và đồng cỏ khô Địa Trung Hải',
         N'Rùa cạn cỡ nhỏ ở Nam Âu, ăn chủ yếu thực vật, có thể sống nhiều thập kỷ.',
         'https://bionexus.vn/images/hermann-tortoise.jpg', 'https://www.gbif.org/species/2441454'),
        ('Ambystoma', 'Ambystoma mexicanum', N'Axolotl (Kỳ giông Mexico)', 'CR',
         N'Nhiệt độ nước: 14-18°C, Độ ẩm: không áp dụng (thủy sinh), Môi trường: Nước ngọt sạch, ít dòng chảy',
         N'Kỳ giông thủy sinh đặc hữu hồ Xochimilco (Mexico), giữ mang ngoài suốt đời và có khả năng tái sinh chi; ngoài tự nhiên cực kỳ nguy cấp.',
         'https://bionexus.vn/images/axolotl.jpg', 'https://www.gbif.org/species/2431950'),
        ('Nepenthes', 'Nepenthes rajah', N'Nắp ấm Rajah (Giant Malaysian Pitcher Plant)', 'EN',
         N'Nhiệt độ: ngày 18-26°C, đêm 10-15°C, Độ ẩm: 80-95%, Môi trường: Rừng mây núi cao (khoảng 1.500-2.650 m)',
         N'Nắp ấm đặc hữu vùng núi Kinabalu và Tambuyukon (Borneo), có túi bẫy thuộc hàng lớn nhất trong chi; khó trồng ở vùng thấp.',
         'https://bionexus.vn/images/nepenthes-rajah.jpg', 'https://www.gbif.org/species/3702163'),
        ('Nepenthes', 'Nepenthes ampullaria', N'Nắp ấm Ampullaria', 'LC',
         N'Nhiệt độ: 22-32°C, Độ ẩm: 70-90%, Môi trường: Rừng mưa vùng thấp, mọc sát đất',
         N'Nắp ấm vùng thấp có túi bẫy tròn mọc thành cụm sát gốc; dễ trồng hơn nhiều loài nắp ấm khác.',
         'https://bionexus.vn/images/nepenthes-ampullaria.jpg', 'https://www.gbif.org/species/7167254'),
        ('Dionaea', 'Dionaea muscipula', N'Cây bắt ruồi Venus (Venus Flytrap)', 'VU',
         N'Nhiệt độ: 20-30°C (cần giai đoạn nghỉ lạnh vào mùa đông), Độ ẩm: 50-70%, Môi trường: Đầm lầy nghèo dinh dưỡng, nhiều nắng',
         N'Cây ăn côn trùng bản địa vùng đồng bằng ven biển Bắc và Nam Carolina (Mỹ); lá bẫy khép lại khi côn trùng chạm vào lông cảm ứng.',
         'https://bionexus.vn/images/venus-flytrap.jpg', 'https://www.gbif.org/species/5421410')
    ) AS v(genusName, scientificName, commonName, conservationStatus, environmentSpecs, description, imageUrl, referenceUrl)
    LEFT JOIN TaxonomyNodes g ON g.scientificName = v.genusName
    LEFT JOIN Admins        a ON a.account = 'biologist1';

    -- 6. Products: đủ 4 trạng thái APPROVED / PENDING / REJECTED / SOLD_OUT (PENDING chưa có admin kiểm duyệt)
    INSERT INTO Products (sellerProfileID, speciesID, productName, price, stockQuantity, description, imageUrl, status, moderatedByAdminID)
    SELECT sp.sellerProfileID, s.speciesID, v.productName, v.price, v.stockQuantity,
           v.description, v.imageUrl, v.status, a.adminID
    FROM (VALUES
        (N'BioGreen Exotic',  'Eublepharis macularius', N'Leopard Gecko High Yellow (3 tháng tuổi)', 850000.00,  5,  N'Cá thể khỏe mạnh, ăn dế tốt, đã lột xác 3 lần.',                  'https://bionexus.vn/images/prod-gecko-1.jpg',            'APPROVED', 'moderator1'),
        (N'BioGreen Exotic',  'Eublepharis macularius', N'Leopard Gecko Tangerine Baby',            1200000.00, 3,  N'Màu cam đậm đột biến gen, giấy tờ nguồn gốc đầy đủ.',               'https://bionexus.vn/images/prod-gecko-2.jpg',            'APPROVED', 'moderator1'),
        (N'BioGreen Exotic',  'Pogona vitticeps',       N'Rồng Úc Hypo Baby (2 tháng tuổi)',        1500000.00, 4,  N'Cá thể ăn dế và rau tốt, đang chờ kiểm duyệt.',                     'https://bionexus.vn/images/prod-bearded-dragon-1.jpg',   'PENDING',  NULL),
        (N'BioGreen Exotic',  'Python regius',          N'Trăn bóng Pastel (4 tháng tuổi)',         2500000.00, 2,  N'Cá thể nhân giống, ăn chuột tốt, có giấy tờ nguồn gốc.',            'https://bionexus.vn/images/prod-ball-python-1.jpg',      'APPROVED', 'moderator1'),
        (N'BioGreen Exotic',  'Python bivittatus',      N'Trăn đất Albino (6 tháng tuổi)',          2800000.00, 1,  N'Chưa đính kèm giấy tờ nguồn gốc.',                                  'https://bionexus.vn/images/prod-burmese-python-1.jpg',   'REJECTED', 'moderator1'),
        (N'BioGreen Exotic',  'Testudo hermanni',       N'Rùa Hermann baby',                        3500000.00, 0,  N'Rùa cạn con, ăn rau và cỏ; hiện đã bán hết.',                       'https://bionexus.vn/images/prod-hermann-tortoise-1.jpg', 'SOLD_OUT', 'moderator1'),
        (N'BioGreen Exotic',  'Ambystoma mexicanum',    N'Axolotl Leucistic (5 cm)',                450000.00,  8,  N'Axolotl hồng nhạt (leucistic) nhân giống nhân tạo.',                 'https://bionexus.vn/images/prod-axolotl-1.jpg',          'APPROVED', 'moderator1'),
        (N'Carnivora Garden', 'Dionaea muscipula',      N'Cây bắt ruồi Venus (Venus Flytrap)',      120000.00,  40, N'Cây nuôi cấy mô, chậu 8 cm.',                                        'https://bionexus.vn/images/prod-venus-flytrap-1.jpg',    'APPROVED', 'moderator1'),
        (N'Carnivora Garden', 'Nepenthes rajah',        N'Nắp ấm Rajah cây con',                    2500000.00, 2,  N'Cây con nuôi cấy mô, có giấy tờ nguồn gốc.',                         'https://bionexus.vn/images/prod-nepenthes-rajah-1.jpg',  'APPROVED', 'moderator1'),
        (N'Carnivora Garden', 'Nepenthes ampullaria',   N'Nắp ấm Ampullaria xanh',                  350000.00,  10, N'Cây trưởng thành, đã ra túi bẫy.',                                   'https://bionexus.vn/images/prod-nepenthes-ampullaria-1.jpg', 'APPROVED', 'moderator1')
    ) AS v(shopName, speciesName, productName, price, stockQuantity, description, imageUrl, status, moderatorAccount)
    LEFT JOIN SellerProfiles sp ON sp.shopName = v.shopName
    LEFT JOIN Species        s  ON s.scientificName = v.speciesName
    LEFT JOIN Admins         a  ON a.account = v.moderatorAccount;

    -- 7. Orders: đủ 3 trạng thái PENDING / COMPLETED / CANCELLED. totalAmount = tổng quantity * unitPrice ở bước 8
    INSERT INTO Orders (orderCode, userID, totalAmount, status, shippingAddress)
    SELECT v.orderCode, u.userID, v.totalAmount, v.status, v.shippingAddress
    FROM (VALUES
        ('ORD-2026-0001', 'levanc',   2050000.00, 'PENDING',   N'123 Nguyễn Văn Linh, Hải Châu, Đà Nẵng'),
        ('ORD-2026-0002', 'levanc',    590000.00, 'COMPLETED', N'123 Nguyễn Văn Linh, Hải Châu, Đà Nẵng'),
        ('ORD-2026-0003', 'dangvang', 3500000.00, 'CANCELLED', N'45 Lê Lợi, Nha Trang, Khánh Hòa')
    ) AS v(orderCode, username, totalAmount, status, shippingAddress)
    LEFT JOIN Users u ON u.username = v.username;

    -- 8. OrderDetails: unitPrice là giá tại thời điểm mua
    INSERT INTO OrderDetails (orderID, productID, quantity, unitPrice)
    SELECT o.orderID, p.productID, v.quantity, v.unitPrice
    FROM (VALUES
        ('ORD-2026-0001', N'Leopard Gecko High Yellow (3 tháng tuổi)', 1,  850000.00),
        ('ORD-2026-0001', N'Leopard Gecko Tangerine Baby',            1, 1200000.00),
        ('ORD-2026-0002', N'Cây bắt ruồi Venus (Venus Flytrap)',      2,  120000.00),
        ('ORD-2026-0002', N'Nắp ấm Ampullaria xanh',                  1,  350000.00),
        ('ORD-2026-0003', N'Rùa Hermann baby',                        1, 3500000.00)
    ) AS v(orderCode, productName, quantity, unitPrice)
    LEFT JOIN Orders   o ON o.orderCode   = v.orderCode
    LEFT JOIN Products p ON p.productName = v.productName;

    -- 9. Carts: mỗi user tối đa 1 giỏ (userID UNIQUE). Giỏ chỉ được tạo khi user thêm món đầu tiên.
    INSERT INTO Carts (userID)
    SELECT u.userID
    FROM (VALUES ('levanc'), ('phamthid')) AS v(username)
    LEFT JOIN Users u ON u.username = v.username;

    -- 10. CartItems: giỏ KHÔNG lưu giá, giá luôn lấy từ Products lúc hiển thị và lúc đặt hàng.
    --     levanc: 2 món bình thường.
    --     phamthid: 1 món vượt tồn kho (Tangerine còn 3, giỏ 5) và 1 món đã SOLD_OUT, để thử các trường hợp lỗi.
    INSERT INTO CartItems (cartID, productID, quantity)
    SELECT c.cartID, p.productID, v.quantity
    FROM (VALUES
        ('levanc',   N'Axolotl Leucistic (5 cm)',        1),
        ('levanc',   N'Trăn bóng Pastel (4 tháng tuổi)', 1),
        ('phamthid', N'Leopard Gecko Tangerine Baby',    5),
        ('phamthid', N'Rùa Hermann baby',                1)
    ) AS v(username, productName, quantity)
    LEFT JOIN Users    u ON u.username = v.username
    LEFT JOIN Carts    c ON c.userID = u.userID
    LEFT JOIN Products p ON p.productName = v.productName;

    -- 11. Kiểm tra seed: sai là THROW, CATCH bên dưới sẽ rollback tất cả
    IF EXISTS (SELECT 1 FROM TaxonomyNodes WHERE parentNodeID IS NULL AND rankLevel <> 'KINGDOM')
        THROW 50001, N'TaxonomyNodes: node không phải KINGDOM mà không có cha (gõ sai tên cha?)', 1;

    -- Vị trí của tên cấp trong chuỗi = độ sâu của cấp (KINGDOM nông nhất, GENUS sâu nhất)
    IF EXISTS (
        SELECT 1
        FROM TaxonomyNodes c
        JOIN TaxonomyNodes p ON p.nodeID = c.parentNodeID
        WHERE CHARINDEX(c.rankLevel, 'KINGDOM PHYLUM CLASS ORDER FAMILY GENUS')
           <= CHARINDEX(p.rankLevel, 'KINGDOM PHYLUM CLASS ORDER FAMILY GENUS')
    )
        THROW 50002, N'TaxonomyNodes: cấp của node con phải thấp hơn cấp của node cha', 1;

    IF EXISTS (
        SELECT 1
        FROM Species s
        JOIN TaxonomyNodes g ON g.nodeID = s.nodeID
        WHERE g.rankLevel <> 'GENUS' OR s.scientificName NOT LIKE g.scientificName + ' %'
    )
        THROW 50003, N'Species: loài phải gắn vào node GENUS và tên loài phải bắt đầu bằng tên chi', 1;

    IF EXISTS (SELECT 1 FROM SellerProfiles WHERE status IN ('ACTIVE', 'BANNED') AND approvedByAdminID IS NULL)
        THROW 50004, N'SellerProfiles: shop ACTIVE/BANNED phải có admin duyệt', 1;

    IF EXISTS (SELECT 1 FROM Products WHERE status <> 'PENDING' AND moderatedByAdminID IS NULL)
        THROW 50005, N'Products: sản phẩm đã xử lý (khác PENDING) phải có admin kiểm duyệt', 1;

    IF EXISTS (
        SELECT 1
        FROM Orders o
        WHERE o.totalAmount <> ISNULL((SELECT SUM(d.quantity * d.unitPrice) FROM OrderDetails d WHERE d.orderID = o.orderID), 0)
    )
        THROW 50006, N'Orders: totalAmount phải bằng tổng quantity * unitPrice của OrderDetails', 1;

    -- Luật nghiệp vụ: không được bỏ vào giỏ sản phẩm của chính shop của mình
    IF EXISTS (
        SELECT 1
        FROM CartItems ci
        JOIN Carts c ON c.cartID = ci.cartID
        JOIN Products p ON p.productID = ci.productID
        JOIN SellerProfiles sp ON sp.sellerProfileID = p.sellerProfileID
        WHERE sp.userID = c.userID
    )
        THROW 50007, N'CartItems: giỏ chứa sản phẩm của chính shop của chủ giỏ', 1;

    COMMIT TRANSACTION;
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
    THROW;
END CATCH;
GO

-- Tóm tắt số dòng từng bảng
SELECT 'Users' AS tableName, COUNT(*) AS totalRows FROM Users
UNION ALL SELECT 'Admins',         COUNT(*) FROM Admins
UNION ALL SELECT 'SellerProfiles', COUNT(*) FROM SellerProfiles
UNION ALL SELECT 'TaxonomyNodes',  COUNT(*) FROM TaxonomyNodes
UNION ALL SELECT 'Species',        COUNT(*) FROM Species
UNION ALL SELECT 'Products',       COUNT(*) FROM Products
UNION ALL SELECT 'Orders',         COUNT(*) FROM Orders
UNION ALL SELECT 'OrderDetails',   COUNT(*) FROM OrderDetails
UNION ALL SELECT 'Carts',          COUNT(*) FROM Carts
UNION ALL SELECT 'CartItems',      COUNT(*) FROM CartItems;
GO

-- Cây phân loại: nhìn bằng mắt xem cha - con có đúng không
WITH tree AS (
    SELECT nodeID, scientificName, commonName, rankLevel, 0 AS depth,
           CAST(scientificName AS varchar(900)) AS sortKey
    FROM TaxonomyNodes
    WHERE parentNodeID IS NULL
    UNION ALL
    SELECT c.nodeID, c.scientificName, c.commonName, c.rankLevel, t.depth + 1,
           CAST(t.sortKey + '/' + c.scientificName AS varchar(900))
    FROM TaxonomyNodes c
    JOIN tree t ON c.parentNodeID = t.nodeID
)
SELECT REPLICATE('    ', depth) + scientificName AS scientificName, rankLevel, commonName
FROM tree
ORDER BY sortKey;
GO
