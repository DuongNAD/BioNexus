/*
    Migration 001 - add updatedAt to Users, Orders, SellerProfiles, Species, Products

    Dung cho may DA CO BioNexusDB (da chay BioNexusDatabes.sql truoc do).
    - KHONG drop database, KHONG xoa du lieu.
    - Chay lai nhieu lan van an toan: bang nao da co updatedAt thi bo qua.
    - Dong cu duoc backfill: updatedAt = createdAt (Orders: orderDate).

    May chua co DB / muon tao moi hoan toan: chay BioNexusDatabes.sql (script do da
    co san updatedAt, nhung se DROP DATABASE truoc khi tao lai).
*/
USE BioNexusDB;

SET XACT_ABORT ON;
BEGIN TRANSACTION;

DECLARE @targets TABLE (tableName sysname, sourceColumn sysname);
INSERT INTO @targets (tableName, sourceColumn) VALUES
    ('Users',          'createdAt'),
    ('Orders',         'orderDate'),
    ('SellerProfiles', 'createdAt'),
    ('Species',        'createdAt'),
    ('Products',       'createdAt');

DECLARE @tableName sysname, @sourceColumn sysname, @sql nvarchar(max);

DECLARE targetCursor CURSOR LOCAL FAST_FORWARD FOR
    SELECT tableName, sourceColumn FROM @targets;
OPEN targetCursor;
FETCH NEXT FROM targetCursor INTO @tableName, @sourceColumn;

WHILE @@FETCH_STATUS = 0
BEGIN
    IF COL_LENGTH('dbo.' + @tableName, 'updatedAt') IS NULL
    BEGIN
        -- Dynamic SQL: cot updatedAt chua ton tai luc batch nay duoc compile,
        -- nen ALTER va UPDATE phai nam trong cac EXEC rieng.
        SET @sql = N'ALTER TABLE dbo.' + QUOTENAME(@tableName)
                 + N' ADD updatedAt datetime2 CONSTRAINT ' + QUOTENAME('DF_' + @tableName + '_updatedAt')
                 + N' DEFAULT SYSDATETIME();';
        EXEC (@sql);

        SET @sql = N'UPDATE dbo.' + QUOTENAME(@tableName)
                 + N' SET updatedAt = COALESCE(' + QUOTENAME(@sourceColumn) + N', SYSDATETIME());';
        EXEC (@sql);

        PRINT 'Added updatedAt to ' + @tableName;
    END
    ELSE
        PRINT 'Skipped ' + @tableName + ' (updatedAt already exists)';

    FETCH NEXT FROM targetCursor INTO @tableName, @sourceColumn;
END

CLOSE targetCursor;
DEALLOCATE targetCursor;

COMMIT TRANSACTION;

-- Kiem tra ket qua: phai ra du 5 dong (Orders, Products, SellerProfiles, Species, Users)
SELECT TABLE_NAME, COLUMN_NAME, DATA_TYPE, IS_NULLABLE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE COLUMN_NAME = 'updatedAt'
ORDER BY TABLE_NAME;
