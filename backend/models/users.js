import db from "../config/db.js";

class User {
  static findByEmail(email, callback) {
    db.query("SELECT * FROM users WHERE email = ?", [email], callback);
  }

  static findById(id, callback) {
    db.query("SELECT * FROM users WHERE id = ?", [id], callback);
  }

  static create({ ten, email, matKhau, role = "user" }, callback) {
    db.query(
      "INSERT INTO users (ten, email, matKhau, role, sdt) VALUES (?, ?, ?, ?, ?)",
      [ten, email, matKhau, role, ""], // sdt để trống hoặc có thể thêm vào params
      callback
    );
  }

  static getAll(callback) {
    db.query("SELECT id, ten, email, role FROM users ORDER BY id ASC", callback);
  }

  static delete(id, callback) {
    // Xóa các bản ghi liên quan trước (nếu có)
    // Ví dụ: xóa giỏ hàng, địa chỉ, đơn hàng của user
    
    // Xóa địa chỉ
    db.query("DELETE FROM DiaChi WHERE id = ?", [id], (err) => {
      if (err) return callback(err);
      
      // Xóa giỏ hàng chi tiết
      db.query(
        "DELETE FROM ChiTietGioHang WHERE maGioHang IN (SELECT maGioHang FROM GioHang WHERE userid = ?)", 
        [id], 
        (err) => {
          if (err) return callback(err);
          
          // Xóa giỏ hàng
          db.query("DELETE FROM GioHang WHERE userid = ?", [id], (err) => {
            if (err) return callback(err);
            
            // Cuối cùng xóa user
            db.query("DELETE FROM users WHERE id = ?", [id], callback);
          });
        }
      );
    });
  }

  static updateRole(id, role, callback) {
    db.query("UPDATE users SET role = ? WHERE id = ?", [role, id], callback);
  }
}

export default User;