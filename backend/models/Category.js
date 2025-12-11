import db from "../config/db.js";

const Category = {
  // Lấy tất cả danh mục
  getAll: (callback) => {
    const sql = "SELECT * FROM danhMuc ORDER BY maDanhMuc DESC";
    db.query(sql, callback);
  },

  // Lấy danh mục theo ID
  getById: (id, callback) => {
    const sql = "SELECT * FROM danhMuc WHERE maDanhMuc = ?";
    db.query(sql, [id], callback);
  },

  // Thêm danh mục mới
  create: (category, callback) => {
    const sql = "INSERT INTO danhMuc (tenDanhMuc) VALUES (?)";
    db.query(sql, [category.tenDanhMuc], callback);
  },

  // Cập nhật danh mục
  update: (id, category, callback) => {
    const sql = "UPDATE danhMuc SET tenDanhMuc = ? WHERE maDanhMuc = ?";
    db.query(sql, [category.tenDanhMuc, id], callback);
  },

  // Xóa danh mục
  delete: (id, callback) => {
    const sql = "DELETE FROM danhMuc WHERE maDanhMuc = ?";
    db.query(sql, [id], callback);
  },

  // Đếm số sản phẩm trong danh mục
  countProducts: (id, callback) => {
    const sql = "SELECT COUNT(*) as count FROM SanPham_DanhMuc WHERE maDanhMuc = ?";
    db.query(sql, [id], callback);
  }
};

export default Category;