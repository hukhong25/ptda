import db from "../config/db.js";

const Product = {
  // Lấy tất cả sản phẩm
  getAll: (callback) => {
    const sql = "SELECT * FROM SanPham ORDER BY maSP DESC";
    db.query(sql, callback);
  },

  // Lấy sản phẩm theo ID
  getById: (id, callback) => {
    const sql = "SELECT * FROM SanPham WHERE maSP = ?";
    db.query(sql, [id], callback);
  },

  // Thêm sản phẩm mới
  create: (product, callback) => {
    const sql = "INSERT INTO SanPham (tenSP, gia, moTa, anhSP, soLuong) VALUES (?, ?, ?, ?, ?)";
    db.query(sql, [
      product.tenSP,
      product.gia,
      product.moTa,
      product.anhSP,
      product.soLuong
    ], callback);
  },

  // Cập nhật sản phẩm
  update: (id, product, callback) => {
    const sql = "UPDATE SanPham SET tenSP = ?, gia = ?, moTa = ?, anhSP = ?, soLuong = ? WHERE maSP = ?";
    db.query(sql, [
      product.tenSP,
      product.gia,
      product.moTa,
      product.anhSP,
      product.soLuong,
      id
    ], callback);
  },

  // Xóa sản phẩm
  delete: (id, callback) => {
    const sql = "DELETE FROM SanPham WHERE maSP = ?";
    db.query(sql, [id], callback);
  },

  // ================= QUẢN LÝ DANH MỤC =================

  // Lấy danh mục của sản phẩm
  getCategories: (productId, callback) => {
    const sql = "SELECT maDanhMuc FROM SanPham_DanhMuc WHERE maSP = ?";
    db.query(sql, [productId], callback);
  },

  // Thêm sản phẩm vào danh mục
  addCategory: (productId, categoryId, callback) => {
    const sql = "INSERT INTO SanPham_DanhMuc (maSP, maDanhMuc) VALUES (?, ?)";
    db.query(sql, [productId, categoryId], callback);
  },

  // Xóa tất cả danh mục của sản phẩm
  removeAllCategories: (productId, callback) => {
    const sql = "DELETE FROM SanPham_DanhMuc WHERE maSP = ?";
    db.query(sql, [productId], callback);
  },

  // Xóa một danh mục cụ thể của sản phẩm
  removeCategory: (productId, categoryId, callback) => {
    const sql = "DELETE FROM SanPham_DanhMuc WHERE maSP = ? AND maDanhMuc = ?";
    db.query(sql, [productId, categoryId], callback);
  }
};

export default Product;