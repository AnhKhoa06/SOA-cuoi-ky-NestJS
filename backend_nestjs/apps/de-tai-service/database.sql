CREATE DATABASE IF NOT EXISTS qldatn_detai;
USE qldatn_detai;

CREATE TABLE DeTai (
    MaDeTai INT PRIMARY KEY AUTO_INCREMENT,
    TenDeTai VARCHAR(255) NOT NULL,
    MoTa TEXT,
    GiangVienHuongDan VARCHAR(255),
    SoLuongToiDa INT DEFAULT 1
);