/*
    Migration 002 - them gio hang: bang Carts va CartItems

    Dung cho may DA CO BioNexusDB (da chay BioNexusDatabes.sql truoc do).
    - KHONG drop database, KHONG xoa du lieu.
    - Chay lai nhieu lan van an toan: bang nao da co thi bo qua.
    - May chua co DB / muon tao moi hoan toan: chay BioNexusDatabes.sql (script do da co san 2 bang nay).

    Thiet ke:
    - Carts: moi user toi da 1 gio (UQ_Carts_userID), gio chi duoc tao khi user them mon dau tien.
    - CartItems: khoa chinh (cartID, productID) nen mot san pham chi xuat hien 1 lan trong 1 gio
      (them lan nua thi tang quantity). quantity phai > 0.
    - Gio KHONG luu gia: gia luon lay tu Products luc hien thi va luc dat hang.
*/
USE BioNexusDB;

SET XACT_ABORT ON;
BEGIN TRANSACTION;

IF OBJECT_ID('dbo.Carts', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.Carts(
        cartID int identity(1,1),
        userID int not null,
        createdAt datetime2 default sysdatetime(),
        updatedAt datetime2 constraint DF_Carts_updatedAt default sysdatetime(),

        constraint PK_Carts primary key(cartID),
        constraint UQ_Carts_userID unique(userID),
        constraint FK_Carts_Users foreign key(userID) references dbo.Users(userID)
    );
    PRINT 'Created Carts';
END
ELSE
    PRINT 'Skipped Carts (already exists)';

IF OBJECT_ID('dbo.CartItems', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.CartItems(
        cartID int not null,
        productID int not null,
        quantity int not null default 1,
        addedAt datetime2 default sysdatetime(),

        constraint PK_CartItems primary key(cartID, productID),
        constraint CK_CartItems_Quantity check (quantity > 0),
        constraint FK_CartItems_Carts foreign key(cartID) references dbo.Carts(cartID),
        constraint FK_CartItems_Products foreign key(productID) references dbo.Products(productID)
    );
    PRINT 'Created CartItems';
END
ELSE
    PRINT 'Skipped CartItems (already exists)';

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_CartItems_productID' AND object_id = OBJECT_ID('dbo.CartItems'))
    CREATE INDEX IX_CartItems_productID ON dbo.CartItems(productID);

COMMIT TRANSACTION;

-- Kiem tra ket qua: phai ra du 2 bang
SELECT TABLE_NAME
FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_NAME IN ('Carts', 'CartItems')
ORDER BY TABLE_NAME;
