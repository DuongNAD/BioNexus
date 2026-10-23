USE master;

IF DB_ID('BioNexusDB') IS NOT NULL
BEGIN
    ALTER DATABASE BioNexusDB SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
    DROP DATABASE BioNexusDB;
END

CREATE DATABASE BioNexusDB;
GO

USE BioNexusDB;

create table Users(
	userID int identity(1,1) primary key,
	username varchar(50) unique not null,
	password_hash varchar(255) not null,
	email varchar(100) not null unique,
	fullName nvarchar(100) not null,
	phone varchar(15),
	address nvarchar(255),
    status varchar(10) default 'ACTIVE',
	createdAt datetime2 default sysdatetime(),
	updatedAt datetime2 constraint DF_Users_updatedAt default sysdatetime(),

	constraint CK_Users_Status check ( status in ('ACTIVE','INACTIVE','BANNED'))
)

create table Orders(
	orderID bigint identity(1,1) primary key,
	orderCode varchar(20) not null unique,
	userID int not null,
	orderDate datetime2 default sysdatetime(),
	updatedAt datetime2 constraint DF_Orders_updatedAt default sysdatetime(),
	totalAmount decimal(18,2) not null,
	status varchar(20) not null default 'PENDING',
	shippingAddress nvarchar(255) not null,

	constraint CK_Orders_Status check (status in ('PENDING','COMPLETED','CANCELLED')),
	constraint FK_Orders_Users foreign key(userID) references Users(userID)
)

create table Admins(
	adminID int identity(1,1) primary key,
	fullName nvarchar(100) not null,
	account varchar(50) not null unique,
	password_hash varchar(255) not null,
	adminRole varchar(20) not null,
    status varchar(10) default 'ACTIVE',
	createdAt datetime2 default sysdatetime(),
	updatedAt datetime2 default sysdatetime(),
    constraint CK_Admins_status check ( status in('ACTIVE','INACTIVE','BANNED') ),
	constraint CK_Admins_adminRole check ( adminRole in ('MODERATOR','BIOLOGIST','SUPER_ADMIN'))
)

create table SellerProfiles(
	sellerProfileID int identity(1,1) primary key,
	userID int not null unique,
	shopName nvarchar(100) not null unique,
	businessLicenseUrl varchar(500),
	bio nvarchar(500),
	status varchar(20) not null default 'PENDING',
	approvedByAdminID int,
	createdAt datetime2 default sysdatetime(),
	updatedAt datetime2 constraint DF_SellerProfiles_updatedAt default sysdatetime(),

	constraint CK_SellerProfiles_Status check (status in ('PENDING','ACTIVE','REJECTED','BANNED')),
	constraint FK_SellerProfiles_Admins foreign key(approvedByAdminID) references Admins(adminID),
	constraint FK_SellerProfiles_Users foreign key(userID) references Users(userID)

)

create table TaxonomyNodes(
	nodeID int identity(1,1) primary key,
	scientificName varchar(100) not null unique,
	commonName nvarchar(100) not null,
	rankLevel varchar(20) not null,
	parentNodeID int null, 

	constraint CK_Taxonomy_Rank check (rankLevel in ('KINGDOM','PHYLUM','CLASS','ORDER','FAMILY','GENUS')),
	constraint FK_Taxonomy_Parent foreign key(parentNodeID) references TaxonomyNodes(nodeID)
)

create table Species(
	speciesID int identity(1,1) primary key,
	nodeID int not null,
	managedByAdminID int not null,
	scientificName varchar(150) not null unique,
	commonName nvarchar(150) not null,
	conservationStatus varchar(10) not null default 'LC',
	environmentSpecs nvarchar(max),
	description nvarchar(max),
	imageUrl varchar(500),
	referenceUrl varchar(500),
	createdAt datetime2 default sysdatetime(),
	updatedAt datetime2 constraint DF_Species_updatedAt default sysdatetime(),

	constraint CK_Species_Conservation check (conservationStatus in ('LC','NT','VU','EN','CR','EW','EX')),
	constraint FK_Species_Taxonomy foreign key(nodeID) references TaxonomyNodes(nodeID),
	constraint FK_Species_Admins foreign key(managedByAdminID) references Admins(adminID)
)

create table Products(
	productID int identity(1,1) primary key,
	sellerProfileID int not null,
	speciesID int not null,
	productName nvarchar(200) not null,
	price decimal(18,2) not null,
	stockQuantity int not null default 1,
	description nvarchar(max),
	imageUrl varchar(500) not null,
	status varchar(20) not null default 'PENDING',
	moderatedByAdminID int,
	createdAt datetime2 default sysdatetime(),
	updatedAt datetime2 constraint DF_Products_updatedAt default sysdatetime(),

	constraint CK_Products_status check ( status in ('PENDING','APPROVED','REJECTED','SOLD_OUT')),
	constraint CK_Products_Price check (price >=0),
	constraint CK_Products_Stock check (stockQuantity >=0),
	constraint FK_Products_Species foreign key (speciesID) references Species(speciesID),
	constraint FK_Products_Seller foreign key(sellerProfileID) references  SellerProfiles(sellerProfileID),
	constraint FK_Products_Admins foreign key(moderatedByAdminID) references Admins(adminID)

)

create table OrderDetails(
	orderID bigint not null,
	productID int not null,
	quantity int not null default 1,
	unitPrice decimal(18,2) not null,

	constraint PK_OrderDetails primary key(orderID, productID),
	constraint CK_OrderDetails_Quantity check (quantity > 0),
	constraint CK_OrderDetails_Price check (unitPrice >= 0),
	constraint FK_OrderDetails_Orders foreign key(orderID) references Orders(orderID),
	constraint FK_OrderDetails_Products foreign key(productID) references Products(productID)
)




