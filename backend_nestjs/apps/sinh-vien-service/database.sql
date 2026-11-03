CREATE DATABASE IF NOT EXISTS qldatn_sinhvien;
USE qldatn_sinhvien;

CREATE TABLE SinhVien (
    MaSV VARCHAR(20) PRIMARY KEY,
    HoTen VARCHAR(255) NOT NULL,
    Email VARCHAR(255),
    Lop VARCHAR(50),
    Password VARCHAR(255),
    Token VARCHAR(255)
);