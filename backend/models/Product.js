import db from "../config/db.js";



const Product = {
  getAll: (callback) => {
    const sql = `
      SELECT p.*,
             COALESCE(SUM(ct.soLuongTon), 0) AS tongSoLuong
      FROM SanPham p
      LEFT JOIN ChiTietSanPham ct ON p.maSP = ct.maSP
      GROUP BY p.maSP, p.tenSP, p.gia, p.moTa, p.anhSP
      ORDER BY p.maSP DESC

    `;

    db.query(sql, callback);

  },

  getById: (id, callback) => {
    // Query này lấy thông tin SP kèm thông tin Size
    const sql = `
      SELECT p.*, s.maSize, s.tenSize, ct.soLuongTon
      FROM SanPham p
      LEFT JOIN ChiTietSanPham ct ON p.maSP = ct.maSP
      LEFT JOIN Size s ON ct.maSize = s.maSize
      WHERE p.maSP = ?
    `;
    db.query(sql, [id], callback);
  },

  create: (product, callback) => {
    const sql = "INSERT INTO SanPham (tenSP, gia, moTa, anhSP) VALUES (?, ?, ?, ?)";
    db.query(sql, [product.tenSP, product.gia, product.moTa, product.anhSP], callback);
  },

  // Hàm initInventory cũ
  initInventory: (maSP, sizesData, callback) => {
    if (!sizesData || sizesData.length === 0) return callback(null);
    const values = sizesData.map(s => [maSP, s.maSize, s.soLuongTon]);
    const sql = "INSERT INTO ChiTietSanPham (maSP, maSize, soLuongTon) VALUES ?";
    db.query(sql, [values], callback);
  },

  update: (id, product, callback) => {
    const sql = "UPDATE SanPham SET tenSP = ?, gia = ?, moTa = ?, anhSP = ? WHERE maSP = ?";
    db.query(sql, [product.tenSP, product.gia, product.moTa, product.anhSP, id], callback);
  },

  updateInventory: (maSP, soLuong, callback) => {
    const sql = "UPDATE ChiTietSanPham SET soLuongTon = ? WHERE maSP = ?";
    db.query(sql, [soLuong, maSP], callback);
  },

  delete: (id, callback) => {
    const sql = "DELETE FROM SanPham WHERE maSP = ?";
    db.query(sql, [id], callback);
  },

  getCategories: (productId, callback) => {
    const sql = `SELECT d.maDanhMuc, d.tenDanhMuc FROM SanPham_DanhMuc sd JOIN danhMuc d ON sd.maDanhMuc = d.maDanhMuc WHERE sd.maSP = ?`;
    db.query(sql, [productId], callback);
  },
  addCategory: (productId, categoryId, callback) => {
    const sql = "INSERT INTO SanPham_DanhMuc (maSP, maDanhMuc) VALUES (?, ?)";
    db.query(sql, [productId, categoryId], callback);
  },
  removeAllCategories: (productId, callback) => {
    const sql = "DELETE FROM SanPham_DanhMuc WHERE maSP = ?";
    db.query(sql, [productId], callback);
  },

  // 1. Thêm size vào kho dựa trên TÊN SIZE
 // 1. Thêm size vào kho dựa trên TÊN SIZE (Logic: Tìm ID trước -> Insert sau)
  addSizeByName: (maSP, listTenSize, soLuongTon, callback) => {
    if (!listTenSize || listTenSize.length === 0) {
        return callback(null);
    }
    
    // Bước 1: Tìm maSize tương ứng với các tên size (VD: ['S', 'M'] -> ra ID 1, 2)
    const sqlFind = "SELECT maSize, tenSize FROM Size WHERE tenSize IN (?)";
    
    db.query(sqlFind, [listTenSize], (err, sizesFound) => {
        if (err) return callback(err);
        if (!sizesFound || sizesFound.length === 0) return callback(null);

        // Bước 2: Tạo mảng dữ liệu để Insert nhiều dòng cùng lúc
        // Format của thư viện mysql: [[maSP, maSize, soLuongTon], [maSP, maSize, soLuongTon]]
        const values = sizesFound.map(s => [maSP, s.maSize, soLuongTon]);
        
        const sqlInsert = "INSERT INTO ChiTietSanPham (maSP, maSize, soLuongTon) VALUES ?";
        db.query(sqlInsert, [values], (err, res) => {
            if (err) return callback(err);
            callback(null, res);
        });
    });
  },

  // 2. Xóa hết size cũ của sản phẩm
  removeAllSizes: (maSP, callback) => {
    const sql = "DELETE FROM ChiTietSanPham WHERE maSP = ?";
    db.query(sql, [maSP], callback);
  }
};

export default Product;