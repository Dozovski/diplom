USE pail_rental;
GO
 
-- ============================================
-- Таблица: users
-- ============================================
IF OBJECT_ID('personal_access_tokens', 'U') IS NOT NULL DROP TABLE personal_access_tokens;
IF OBJECT_ID('bookings', 'U') IS NOT NULL DROP TABLE bookings;
IF OBJECT_ID('reviews', 'U') IS NOT NULL DROP TABLE reviews;
IF OBJECT_ID('contact_messages', 'U') IS NOT NULL DROP TABLE contact_messages;
IF OBJECT_ID('users', 'U') IS NOT NULL DROP TABLE users;
IF OBJECT_ID('cars', 'U') IS NOT NULL DROP TABLE cars;
GO
 
CREATE TABLE users (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(255) NOT NULL,
    phone NVARCHAR(255) NOT NULL UNIQUE,
    email NVARCHAR(255) NULL,
    birth_date DATE NULL,
    passport NVARCHAR(255) NULL,
    password NVARCHAR(255) NOT NULL,
    role NVARCHAR(10) NOT NULL DEFAULT 'user',
    created_at DATETIME2 NULL,
    updated_at DATETIME2 NULL
);
GO
 
SET IDENTITY_INSERT users ON;
GO
 
INSERT INTO users (id, name, phone, email, birth_date, passport, password, role, created_at, updated_at) VALUES
(1, N'Виктор Виктор', N'+375292317438', NULL, NULL, NULL, N'$2y$12$ZAShPKcNwAlQOO6QfAaNqeGxgHTJ.c1CQxLZC70BhJbCjkLp6OI0G', N'user', '2026-04-11 11:31:50', '2026-04-11 11:31:50'),
(2, N'Павло', N'+375298448627', NULL, NULL, NULL, N'$2y$12$1at/fJQ5idH.U7VbjqaAr.lwTeXs4iXhzfZEOKpLoieUC2Qj.6K1.', N'user', '2026-04-11 11:52:11', '2026-04-11 11:52:11'),
(3, N'Администратор', N'admin', NULL, '2007-03-19', N'БЦ12345', N'$2y$12$tYLvSCdOW/XKT3XPqlBccO/0dAnqBWAdHmvfeK7jXgjiPJeYwrfyu', N'admin', '2026-04-12 09:48:12', '2026-05-10 12:35:42'),
(4, N'Павел', N'+375292515684', NULL, '2007-03-19', N'БЦ12345', N'$2y$12$mFjzRkLUJQp8haFsu1U9neMcmRyN4FYbMkfjYju0gNOolcELn80im', N'user', '2026-05-09 04:34:42', '2026-05-09 04:52:43');
GO
 
SET IDENTITY_INSERT users OFF;
GO
DBCC CHECKIDENT ('users', RESEED, 5);
GO
 
-- ============================================
-- Таблица: cars
-- ============================================
CREATE TABLE cars (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(255) NOT NULL,
    category NVARCHAR(20) NOT NULL,
    year INT NOT NULL,
    seats INT NOT NULL DEFAULT 5,
    transmission NVARCHAR(20) NOT NULL,
    fuel NVARCHAR(20) NOT NULL,
    engine NVARCHAR(255) NOT NULL,
    hp INT NOT NULL,
    price INT NOT NULL,
    lat DECIMAL(10,6) NOT NULL,
    lng DECIMAL(10,6) NOT NULL,
    address NVARCHAR(255) NOT NULL,
    available BIT NOT NULL DEFAULT 1,
    rating DECIMAL(2,1) NOT NULL DEFAULT 0.0,
    trips INT NOT NULL DEFAULT 0,
    description NVARCHAR(MAX) NULL,
    photos NVARCHAR(MAX) NULL,
    created_at DATETIME2 NULL,
    updated_at DATETIME2 NULL
);
GO
 
SET IDENTITY_INSERT cars ON;
GO
 
INSERT INTO cars (id, name, category, year, seats, transmission, fuel, engine, hp, price, lat, lng, address, available, rating, trips, description, photos, created_at, updated_at) VALUES
(14, N'BMW 520d', N'Бизнес', 2023, 5, N'Автомат', N'Дизель', N'2.0L Turbo', 190, 120, 53.904500, 27.561500, N'пр. Независимости, 31', 1, 0.0, 0, N'Элегантный бизнес-седан с превосходным комфортом и динамикой.', NULL, '2026-05-14 17:11:51', '2026-05-14 17:18:47');
GO
 
SET IDENTITY_INSERT cars OFF;
GO
DBCC CHECKIDENT ('cars', RESEED, 15);
GO
 
-- ============================================
-- Таблица: bookings
-- ============================================
CREATE TABLE bookings (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    car_id BIGINT NOT NULL,
    name NVARCHAR(255) NOT NULL,
    phone NVARCHAR(20) NOT NULL,
    email NVARCHAR(255) NULL,
    date_from DATE NOT NULL,
    date_to DATE NOT NULL,
    comment NVARCHAR(MAX) NULL,
    status NVARCHAR(20) NOT NULL DEFAULT 'pending',
    created_at DATETIME2 NULL,
    updated_at DATETIME2 NULL,
    CONSTRAINT FK_bookings_cars FOREIGN KEY (car_id) REFERENCES cars(id) ON DELETE CASCADE
);
GO
DBCC CHECKIDENT ('bookings', RESEED, 14);
GO
 
-- ============================================
-- Таблица: reviews
-- ============================================
CREATE TABLE reviews (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(255) NOT NULL,
    text NVARCHAR(MAX) NOT NULL,
    rating INT NOT NULL DEFAULT 5,
    car_id BIGINT NULL,
    created_at DATETIME2 NULL,
    updated_at DATETIME2 NULL
);
GO
 
SET IDENTITY_INSERT reviews ON;
GO
 
INSERT INTO reviews (id, name, text, rating, car_id, created_at, updated_at) VALUES
(1, N'Александр К.', N'Отличный сервис! Машина была чистая и полностью заправлена. Очень удобное бронирование.', 5, NULL, '2026-04-12 12:55:31', '2026-04-12 12:55:31'),
(2, N'Мария П.', N'Арендовала BMW на выходные — всё прошло отлично. Рекомендую!', 5, NULL, '2026-04-12 12:55:31', '2026-04-12 12:55:31'),
(3, N'Дмитрий В.', N'Быстрая обработка заявки, вежливый персонал. Буду обращаться ещё.', 4, NULL, '2026-04-12 12:55:31', '2026-04-12 12:55:31'),
(4, N'Екатерина С.', N'Хороший выбор машин по адекватным ценам. Удобное расположение.', 5, NULL, '2026-04-12 12:55:31', '2026-04-12 12:55:31');
GO
 
SET IDENTITY_INSERT reviews OFF;
GO
DBCC CHECKIDENT ('reviews', RESEED, 6);
GO
 
-- ============================================
-- Таблица: contact_messages
-- ============================================
CREATE TABLE contact_messages (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(255) NOT NULL,
    email NVARCHAR(255) NOT NULL,
    message NVARCHAR(MAX) NOT NULL,
    created_at DATETIME2 NULL,
    updated_at DATETIME2 NULL
);
GO
 
-- ============================================
-- Таблица: personal_access_tokens
-- ============================================
CREATE TABLE personal_access_tokens (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    tokenable_type NVARCHAR(255) NOT NULL,
    tokenable_id BIGINT NOT NULL,
    name NVARCHAR(255) NOT NULL,
    token NVARCHAR(64) NOT NULL UNIQUE,
    abilities NVARCHAR(MAX) NULL,
    last_used_at DATETIME2 NULL,
    expires_at DATETIME2 NULL,
    created_at DATETIME2 NULL,
    updated_at DATETIME2 NULL
);
GO
 
-- ============================================
-- Готово!
-- SELECT * FROM users
-- SELECT * FROM cars
-- SELECT * FROM bookings
-- SELECT * FROM reviews
-- ============================================