/*
    Migration 005 - [TN-16] them bang Reviews (danh gia san pham sau khi mua)

    Chi chay khi BAT chuc nang TN-16 (xem CHUC-NANG-MUA-HANG-THEM.md o thu muc goc).
    Dung cho may DA CO BioNexusDB.
    - KHONG drop database, KHONG xoa du lieu.
    - Chay lai nhieu lan van an toan: bang da co thi bo qua.

    Thiet ke:
    - Moi nguoi chi danh gia mot san pham mot lan: UQ_Reviews_user_product(userID, productID).
    - rating tu 1 den 5 sao (CHECK). comment toi da 1000 ky tu.
    - Dieu kien "da mua va da nhan hang" kiem tra o ReviewService (tra Orders + OrderDetails),
      khong dat trong DB vi don co the doi trang thai sau nay.
*/
USE BioNexusDB;
GO

IF OBJECT_ID('dbo.Reviews', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.Reviews(
        reviewID int identity(1,1),
        productID int not null,
        userID int not null,
        rating tinyint not null,
        comment nvarchar(1000) not null,
        createdAt datetime2 not null constraint DF_Reviews_createdAt default sysdatetime(),

        constraint PK_Reviews primary key(reviewID),
        constraint UQ_Reviews_user_product unique(userID, productID),
        constraint CK_Reviews_rating check (rating between 1 and 5),
        constraint FK_Reviews_Products foreign key(productID) references dbo.Products(productID),
        constraint FK_Reviews_Users foreign key(userID) references dbo.Users(userID)
    );
    -- Trang san pham tim danh gia theo productID
    CREATE INDEX IX_Reviews_productID ON dbo.Reviews(productID);
END
GO
