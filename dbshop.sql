# DROP DATABASE IF EXISTS clothes_db;
# CREATE DATABASE clothes_db;
#dấu thăng là comment ae muốn chạy lại bảng thì xóa dấu # đi nhé
USE clothes_db;

-- 1. Bảng USERS
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ten VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    sdt VARCHAR(20) NOT NULL,
    matKhau VARCHAR(255) NOT NULL,
    role ENUM('user', 'admin', 'staff') DEFAULT 'user'
);

-- 2. Bảng DANH MỤC
CREATE TABLE danhMuc (
    maDanhMuc INT AUTO_INCREMENT PRIMARY KEY,
    tenDanhMuc VARCHAR(100) NOT NULL
);

-- 3. Bảng SIZE (MỚI)
CREATE TABLE Size (
    maSize INT AUTO_INCREMENT PRIMARY KEY,
    tenSize VARCHAR(50) NOT NULL
);


-- 4. Bảng SẢN PHẨM (Bỏ cột soLuong tổng)
CREATE TABLE SanPham (
    maSP INT AUTO_INCREMENT PRIMARY KEY,
    tenSP VARCHAR(150) NOT NULL,
    gia INT NOT NULL,
    moTa TEXT,
    anhSP VARCHAR(255)
);


-- 5. Bảng CHI TIẾT SẢN PHẨM (Quản lý kho theo Size) (MỚI)
CREATE TABLE ChiTietSanPham (
    maSP INT,
    maSize INT,
    soLuongTon INT DEFAULT 0,
    PRIMARY KEY (maSP, maSize),
    FOREIGN KEY (maSP) REFERENCES SanPham(maSP) ON DELETE CASCADE,
    FOREIGN KEY (maSize) REFERENCES Size(maSize) ON DELETE CASCADE
);

-- 6. Bảng SẢN PHẨM - DANH MỤC
CREATE TABLE SanPham_DanhMuc (
    maSP INT,
    maDanhMuc INT,
    PRIMARY KEY (maSP, maDanhMuc),
    FOREIGN KEY (maSP) REFERENCES SanPham(maSP) ON DELETE CASCADE,
    FOREIGN KEY (maDanhMuc) REFERENCES danhMuc(maDanhMuc) ON DELETE CASCADE
);

-- 7. Bảng HÌNH ẢNH PHỤ
CREATE TABLE HinhAnh (
    maAnh INT AUTO_INCREMENT PRIMARY KEY,
    link VARCHAR(255) NOT NULL,
    maSP INT,
    FOREIGN KEY (maSP) REFERENCES SanPham(maSP) ON DELETE CASCADE
);

-- 8. Bảng GIỎ HÀNG
CREATE TABLE GioHang (
    maGioHang INT AUTO_INCREMENT PRIMARY KEY,
    userId INT,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

-- 9. Bảng CHI TIẾT GIỎ HÀNG (Thêm maSize)
CREATE TABLE ChiTietGioHang (
    maGioHang INT,
    maSP INT,
    maSize INT,
    soLuongMua INT DEFAULT 1,
    PRIMARY KEY (maGioHang, maSP, maSize), -- Khóa chính gồm 3 cột để phân biệt size
    FOREIGN KEY (maGioHang) REFERENCES GioHang(maGioHang) ON DELETE CASCADE,
    FOREIGN KEY (maSP) REFERENCES SanPham(maSP) ON DELETE CASCADE,
    FOREIGN KEY (maSize) REFERENCES Size(maSize) ON DELETE CASCADE
);

-- 10. Bảng PHƯƠNG THỨC THANH TOÁN
CREATE TABLE phuongThucThanhToan (
    maPTTT INT AUTO_INCREMENT PRIMARY KEY,
    tenPTTT VARCHAR(100) NOT NULL
);
INSERT INTO phuongThucThanhToan (tenPTTT) VALUES ('Thanh toán khi nhận hàng (COD)'), ('Chuyển khoản ngân hàng');

-- 11. Bảng GIẢM GIÁ
CREATE TABLE GiamGia (
    maGiamGia INT AUTO_INCREMENT PRIMARY KEY,
    chietKhau INT NOT NULL,
    ngayBatDau DATE NOT NULL,
    ngayKetThuc DATE NOT NULL,
    moTa TEXT
);

-- 12. Bảng ĐỊA CHỈ
CREATE TABLE DiaChi (
    maDiaChi INT AUTO_INCREMENT PRIMARY KEY,
    tenDiaChi VARCHAR(255) NOT NULL,
    id INT,
    FOREIGN KEY (id) REFERENCES users(id) ON DELETE CASCADE
);

-- 13. Bảng ĐƠN HÀNG
CREATE TABLE DonHang (
    maDonHang INT AUTO_INCREMENT PRIMARY KEY,
    ngayDat DATETIME DEFAULT CURRENT_TIMESTAMP,
    trangThai VARCHAR(50) DEFAULT 'Pending',
    ghiChu TEXT,
    tenNguoiNhan VARCHAR(100),
    sdt VARCHAR(20),
    email VARCHAR(100),
    diaChiGiaoHang VARCHAR(255),
    phiGiaoHang INT DEFAULT 0,
    tongTien INT DEFAULT 0,

    maPTTT INT,
    id INT,
    maDiaChi INT,
    maGiamGia INT,

    FOREIGN KEY (maPTTT) REFERENCES phuongThucThanhToan(maPTTT),
    FOREIGN KEY (id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (maDiaChi) REFERENCES DiaChi(maDiaChi),
    FOREIGN KEY (maGiamGia) REFERENCES GiamGia(maGiamGia)
);

-- 14. Bảng CHI TIẾT ĐƠN HÀNG (Thêm maSize)
CREATE TABLE ChiTietDonHang (
    maDonHang INT,
    maSP INT,
    maSize INT,
    soLuongMua INT DEFAULT 1,
    giaMua INT,
    PRIMARY KEY (maDonHang, maSP, maSize),
    FOREIGN KEY (maDonHang) REFERENCES DonHang(maDonHang) ON DELETE CASCADE,
    FOREIGN KEY (maSP) REFERENCES SanPham(maSP),
    FOREIGN KEY (maSize) REFERENCES Size(maSize)
);
INSERT INTO Size (tenSize) VALUES ('S'), ('M'), ('L'), ('XL'), ('XXL');
INSERT INTO phuongThucThanhToan (tenPTTT) VALUES ('Ví điện tử MoMo');
ALTER TABLE DiaChi ADD COLUMN macDinh TINYINT(1) DEFAULT 0;

UPDATE users 
SET role = 'ADMIN' 
WHERE id = 1;

select * from users;
select * from diachi;
select * from chitietsanpham;
select * from phuongThucThanhToan;


