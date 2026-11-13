/*
    Migration 003 - [TN-10] [TN-11] them thong tin thanh toan cho don hang

    Chi chay khi BAT chuc nang TN-10 hoac TN-11 (xem CHUC-NANG-MUA-HANG-THEM.md o thu muc goc).
    Dung cho may DA CO BioNexusDB (da chay BioNexusDatabes.sql va seed_data.sql).
    - KHONG drop database, KHONG xoa du lieu.
    - Chay lai nhieu lan van an toan: cot nao da co thi bo qua.

    Thiet ke:
    - paymentMethod: COD (tra tien khi nhan hang) hoac BANK_TRANSFER (chuyen khoan VietQR). Don cu mac dinh COD.
    - paymentStatus: UNPAID hoac PAID. Quan tri vien bam "Xac nhan da thu tien" thi chuyen sang PAID.
    - Don COD cu da COMPLETED thi coi nhu da thu tien (PAID).
*/
USE BioNexusDB;
GO

IF COL_LENGTH('dbo.Orders', 'paymentMethod') IS NULL
BEGIN
    ALTER TABLE dbo.Orders ADD paymentMethod varchar(20) NOT NULL
        CONSTRAINT DF_Orders_paymentMethod DEFAULT 'COD'
        CONSTRAINT CK_Orders_paymentMethod CHECK (paymentMethod IN ('COD', 'BANK_TRANSFER'));
END
GO

IF COL_LENGTH('dbo.Orders', 'paymentStatus') IS NULL
BEGIN
    ALTER TABLE dbo.Orders ADD paymentStatus varchar(20) NOT NULL
        CONSTRAINT DF_Orders_paymentStatus DEFAULT 'UNPAID'
        CONSTRAINT CK_Orders_paymentStatus CHECK (paymentStatus IN ('UNPAID', 'PAID'));
END
GO

-- Tach rieng batch: SQL Server chi nhin thay cot moi o batch sau lenh ALTER TABLE
UPDATE dbo.Orders
SET paymentStatus = 'PAID'
WHERE status = 'COMPLETED' AND paymentMethod = 'COD' AND paymentStatus = 'UNPAID';
GO
