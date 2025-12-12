import db from "../config/db.js";

const Product = {
  // Lấy tất cả sản phẩm (Bỏ soLuong)
  getAll: (callback) => {
    const sql = "SELECT * FROM SanPham ORDER BY maSP DESC";
    db.query(sql, callback);
  },

  // Lấy sản phẩm theo ID (Kèm thông tin Size và Số lượng tồn)
  getById: (id, callback) => {
    const sql = `
      SELECT p.*, 
             JSON_ARRAYAGG(
               JSON_OBJECT('maSize', s.maSize, 'tenSize', s.tenSize, 'soLuongTon', ct.soLuongTon)
             ) as sizes
      FROM SanPham p
      LEFT JOIN ChiTietSanPham ct ON p.maSP = ct.maSP
      LEFT JOIN Size s ON ct.maSize = s.maSize
      WHERE p.maSP = ?
      GROUP BY p.maSP
    `;
    db.query(sql, [id], callback);
  },

  // Thêm sản phẩm mới (Bỏ soLuong)
  create: (product, callback) => {
    const sql = "INSERT INTO SanPham (tenSP, gia, moTa, anhSP) VALUES (?, ?, ?, ?)";
    db.query(sql, [
      product.tenSP,
      product.gia,
      product.moTa,
      product.anhSP
    ], callback);
  },

  // Khởi tạo kho cho sản phẩm (Thêm size vào bảng ChiTietSanPham)
  initInventory: (maSP, sizesData, callback) => {
    // sizesData là mảng các object [{maSize: 1, soLuongTon: 10}, ...]
    if (!sizesData || sizesData.length === 0) return callback(null);
    
    const values = sizesData.map(s => [maSP, s.maSize, s.soLuongTon]);
    const sql = "INSERT INTO ChiTietSanPham (maSP, maSize, soLuongTon) VALUES ?";
    db.query(sql, [values], callback);
  },

  // Cập nhật sản phẩm
  update: (id, product, callback) => {
    const sql = "UPDATE SanPham SET tenSP = ?, gia = ?, moTa = ?, anhSP = ? WHERE maSP = ?";
    db.query(sql, [
      product.tenSP,
      product.gia,
      product.moTa,
      product.anhSP,
      id
    ], callback);
  },

  // Xóa sản phẩm
  delete: (id, callback) => {
    const sql = "DELETE FROM SanPham WHERE maSP = ?";
    db.query(sql, [id], callback);
  },

  // ... (Giữ nguyên các hàm quản lý danh mục cũ nếu cần) ...
  getCategories: (productId, callback) => {
    const sql = "SELECT maDanhMuc FROM SanPham_DanhMuc WHERE maSP = ?";
    db.query(sql, [productId], callback);
  },
  addCategory: (productId, categoryId, callback) => {
    const sql = "INSERT INTO SanPham_DanhMuc (maSP, maDanhMuc) VALUES (?, ?)";
    db.query(sql, [productId, categoryId], callback);
  },
  removeAllCategories: (productId, callback) => {
    const sql = "DELETE FROM SanPham_DanhMuc WHERE maSP = ?";
    db.query(sql, [productId], callback);
  }
};

export default Product;