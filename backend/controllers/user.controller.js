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

// ====================== LẤY PROFILE (Kèm danh sách địa chỉ) ===========================
export const getProfile = (req, res) => {
  const userId = req.user.id;

  // 1. Lấy thông tin User
  const queryUser = "SELECT id, ten AS username, email, sdt AS phone, role FROM users WHERE id = ?";
  
  db.query(queryUser, [userId], (err, userResults) => {
    if (err) return res.status(500).json({ message: "Lỗi server", error: err });
    if (userResults.length === 0) return res.status(404).json({ message: "User not found" });

    const user = userResults[0];

    // 2. Lấy danh sách địa chỉ của User này
    const queryAddr = "SELECT maDiaChi, tenDiaChi FROM DiaChi WHERE id = ? ORDER BY maDiaChi DESC";
    
    db.query(queryAddr, [userId], (err, addrResults) => {
      if (err) return res.status(500).json({ message: "Lỗi lấy địa chỉ", error: err });
      
      // Gán danh sách địa chỉ vào object user trả về
      user.addresses = addrResults; 
      res.json(user);
    });
  });
};

// ====================== CẬP NHẬT THÔNG TIN CÁ NHÂN (Tên, SĐT) ===========================
export const updateProfile = (req, res) => {
  const userId = req.user.id;
  const { username, phone } = req.body;

  const query = "UPDATE users SET ten = ?, sdt = ? WHERE id = ?";
  
  db.query(query, [username, phone, userId], (err, result) => {
    if (err) return res.status(500).json({ message: "Lỗi cập nhật", error: err });
    res.json({ message: "Cập nhật thông tin cá nhân thành công!" });
  });
};

// ====================== THÊM ĐỊA CHỈ MỚI ===========================
export const addAddress = (req, res) => {
    const userId = req.user.id;
    const { address } = req.body;

    if (!address) return res.status(400).json({ message: "Địa chỉ không được để trống" });

    const query = "INSERT INTO DiaChi (tenDiaChi, id) VALUES (?, ?)";
    
    db.query(query, [address, userId], (err, result) => {
        if (err) return res.status(500).json({ message: "Lỗi thêm địa chỉ", error: err });
        res.json({ message: "Thêm địa chỉ thành công", id: result.insertId });
    });
};

// ====================== XÓA ĐỊA CHỈ ===========================
export const deleteAddress = (req, res) => {
    const userId = req.user.id;
    const { id } = req.params; // id của địa chỉ cần xóa

    const query = "DELETE FROM DiaChi WHERE maDiaChi = ? AND id = ?";
    
    db.query(query, [id, userId], (err, result) => {
        if (err) return res.status(500).json({ message: "Lỗi xóa địa chỉ", error: err });
        res.json({ message: "Đã xóa địa chỉ" });
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