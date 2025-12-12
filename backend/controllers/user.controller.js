import User from "../models/users.js";
import db from "../config/db.js"; // Import DB để dùng cho các query custom

// ====================== LẤY DANH SÁCH USERS (ADMIN) ===========================
// (Giữ nguyên code cũ của bạn)
export const getAllUsers = (req, res) => {
  User.getAll((err, users) => {
    if (err) {
      console.error("Lỗi get all users:", err);
      return res.status(500).json({ message: "Lỗi server" });
    }
    res.json({ users });
  });
};

// ====================== LẤY PROFILE (Kèm Địa chỉ từ bảng DiaChi) ===========================
export const getProfile = (req, res) => {
  const userId = req.user.id;

  // JOIN bảng users với bảng DiaChi để lấy địa chỉ mới nhất
  const query = `
    SELECT u.id, u.ten AS username, u.email, u.sdt AS phone, u.role, d.tenDiaChi AS address
    FROM users u
    LEFT JOIN DiaChi d ON u.id = d.id
    WHERE u.id = ?
    ORDER BY d.maDiaChi DESC 
    LIMIT 1
  `;

  db.query(query, [userId], (err, results) => {
    if (err) return res.status(500).json({ message: "Lỗi server", error: err });
    if (results.length === 0) return res.status(404).json({ message: "User not found" });
    
    const user = results[0];
    // Nếu chưa có địa chỉ thì trả về chuỗi rỗng
    if (!user.address) user.address = ""; 
    
    res.json(user);
  });
};

// ====================== CẬP NHẬT PROFILE (Tên, SĐT và Địa chỉ) ===========================
export const updateProfile = (req, res) => {
  const userId = req.user.id;
  const { username, phone, address } = req.body; // Lấy dữ liệu từ Frontend

  // 1. Cập nhật thông tin cơ bản trong bảng USERS (ten, sdt)
  const updateUserQuery = "UPDATE users SET ten = ?, sdt = ? WHERE id = ?";

  db.query(updateUserQuery, [username, phone, userId], (err, result) => {
    if (err) {
      console.error("Lỗi update user:", err);
      return res.status(500).json({ message: "Lỗi cập nhật thông tin cá nhân", error: err });
    }

    // 2. Xử lý địa chỉ trong bảng DiaChi
    if (address) {
      // Kiểm tra xem user này đã có địa chỉ nào chưa
      const checkAddressQuery = "SELECT maDiaChi FROM DiaChi WHERE id = ?";
      
      db.query(checkAddressQuery, [userId], (err, results) => {
        if (err) return res.status(500).json({ message: "Lỗi kiểm tra địa chỉ" });

        if (results.length > 0) {
          // TRƯỜNG HỢP 1: Đã có địa chỉ -> Cập nhật (UPDATE) địa chỉ đó
          const updateAddrQuery = "UPDATE DiaChi SET tenDiaChi = ? WHERE id = ?";
          db.query(updateAddrQuery, [address, userId], (err) => {
            if (err) return res.status(500).json({ message: "Lỗi cập nhật địa chỉ" });
            res.json({ message: "Cập nhật thông tin và địa chỉ thành công!" });
          });
        } else {
          // TRƯỜNG HỢP 2: Chưa có địa chỉ -> Thêm mới (INSERT) vào bảng DiaChi
          const insertAddrQuery = "INSERT INTO DiaChi (tenDiaChi, id) VALUES (?, ?)";
          db.query(insertAddrQuery, [address, userId], (err) => {
            if (err) return res.status(500).json({ message: "Lỗi thêm địa chỉ mới" });
            res.json({ message: "Đã cập nhật thông tin và thêm địa chỉ mới!" });
          });
        }
      });
    } else {
      // Nếu người dùng không nhập địa chỉ, chỉ báo thành công phần user
      res.json({ message: "Cập nhật thông tin cơ bản thành công!" });
    }
  });
};

// ====================== XÓA USER (ADMIN) ===========================
// (Giữ nguyên code cũ của bạn)
export const deleteUser = (req, res) => {
  const userId = req.params.id;
  const adminId = req.user.id;

  if (parseInt(userId) === parseInt(adminId)) {
    return res.status(400).json({ message: "Không thể xóa tài khoản của chính mình" });
  }

  User.findById(userId, (err, result) => {
    if (err) return res.status(500).json({ message: "Lỗi server" });
    if (result.length === 0) return res.status(404).json({ message: "Không tìm thấy user" });

    if (result[0].role === 'admin') {
      return res.status(403).json({ message: "Không thể xóa tài khoản admin" });
    }

    User.delete(userId, (err, result) => {
      if (err) return res.status(500).json({ message: "Lỗi khi xóa user" });
      res.json({ message: "Xóa user thành công" });
    });
  });
};

// ====================== CẬP NHẬT ROLE (ADMIN) ===========================
// (Giữ nguyên code cũ của bạn)
export const updateUserRole = (req, res) => {
  const userId = req.params.id;
  const { role } = req.body;
  const adminId = req.user.id;

  const validRoles = ['user', 'staff', 'admin'];
  if (!role || !validRoles.includes(role)) {
    return res.status(400).json({ message: "Role không hợp lệ" });
  }

  if (parseInt(userId) === parseInt(adminId)) {
    return res.status(400).json({ message: "Không thể thay đổi role của chính mình" });
  }

  User.findById(userId, (err, result) => {
    if (err) return res.status(500).json({ message: "Lỗi server" });
    if (result.length === 0) return res.status(404).json({ message: "Không tìm thấy user" });

    if (result[0].role === 'admin' && role !== 'admin') {
      return res.status(403).json({ message: "Không thể thay đổi role của admin khác" });
    }

    User.updateRole(userId, role, (err, result) => {
      if (err) return res.status(500).json({ message: "Lỗi khi cập nhật role" });
      res.json({ message: "Cập nhật role thành công", userId, newRole: role });
    });
  });
};