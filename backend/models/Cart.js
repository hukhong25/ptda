import db from "../config/db.js";

class Cart {
  static getCartByUser(userId, callback) {
    const sql = `
      SELECT c.maGioHang, ct.maSP, ct.soLuongMua, s.tenSP, s.gia, s.anhSP
      FROM GioHang c
      JOIN ChiTietGioHang ct ON c.maGioHang = ct.maGioHang
      JOIN SanPham s ON ct.maSP = s.maSP
      WHERE c.userId = ?
    `;
    db.query(sql, [userId], callback);
  }

  static addItem(userId, maSP, soLuong, callback) {
    // Logic thêm sản phẩm vào giỏ
  }

  static updateItem(userId, maSP, soLuong, callback) {
    // Logic update số lượng
  }

  static removeItem(userId, maSP, callback) {
    // Logic xóa sản phẩm
  }
}

export default Cart;
