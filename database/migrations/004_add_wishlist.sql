/*
    Migration 004 - [TN-15] them bang Wishlists (danh sach yeu thich / luu de mua sau)

    Chi chay khi BAT chuc nang TN-15 (xem CHUC-NANG-MUA-HANG-THEM.md o thu muc goc).
    Dung cho may DA CO BioNexusDB.
    - KHONG drop database, KHONG xoa du lieu.
    - Chay lai nhieu lan van an toan: bang da co thi bo qua.

    Thiet ke:
    - Khoa chinh (userID, productID): moi san pham chi luu mot lan cho mot nguoi.
    - Khong luu gia: gia va ton kho luon doc tu Products luc hien thi (giong gio hang).
*/
USE BioNexusDB;
GO

IF OBJECT_ID('dbo.Wishlists', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.Wishlists(
        userID int not null,
        productID int not null,
        addedAt datetime2 not null constraint DF_Wishlists_addedAt default sysdatetime(),

        constraint PK_Wishlists primary key(userID, productID),
        constraint FK_Wishlists_Users foreign key(userID) references dbo.Users(userID),
        constraint FK_Wishlists_Products foreign key(productID) references dbo.Products(productID)
    );
    -- Tim theo san pham (vd. xoa san pham) can index nay; tim theo user da co khoa chinh phuc vu
    CREATE INDEX IX_Wishlists_productID ON dbo.Wishlists(productID);
END
GO
