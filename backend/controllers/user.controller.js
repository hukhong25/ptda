import User from "../models/users.js";

// ====================== LẤY DANH SÁCH USERS ===========================
export const getAllUsers = (req, res) => {
  User.getAll((err, users) => {
    if (err) {
      console.error("Lỗi get all users:", err);
      return res.status(500).json({ message: "Lỗi server" });
    }
    res.json({ users });
  });
};

// ====================== XÓA USER ===========================
export const deleteUser = (req, res) => {
  const userId = req.params.id;
  const adminId = req.user.id;

  // Không cho phép admin tự xóa chính mình
  if (parseInt(userId) === parseInt(adminId)) {
    return res.status(400).json({ 
      message: "Không thể xóa tài khoản của chính mình" 
    });
  }

  // Kiểm tra user tồn tại
  User.findById(userId, (err, result) => {
    if (err) {
      console.error("Lỗi find user:", err);
      return res.status(500).json({ message: "Lỗi server" });
    }

    if (result.length === 0) {
      return res.status(404).json({ message: "Không tìm thấy user" });
    }

    const targetUser = result[0];
    
    // Không cho phép xóa admin khác
    if (targetUser.role === 'admin') {
      return res.status(403).json({ 
        message: "Không thể xóa tài khoản admin" 
      });
    }

    // Thực hiện xóa
    User.delete(userId, (err, result) => {
      if (err) {
        console.error("Lỗi delete user:", err);
        return res.status(500).json({ message: "Lỗi khi xóa user" });
      }

      res.json({ message: "Xóa user thành công" });
    });
  });
};

// ====================== CẬP NHẬT ROLE ===========================
export const updateUserRole = (req, res) => {
  const userId = req.params.id;
  const { role } = req.body;
  const adminId = req.user.id;

  // Validate role
  const validRoles = ['user', 'staff', 'admin'];
  if (!role || !validRoles.includes(role)) {
    return res.status(400).json({ 
      message: "Role không hợp lệ. Chỉ chấp nhận: user, staff, admin" 
    });
  }

  // Không cho phép admin thay đổi role của chính mình
  if (parseInt(userId) === parseInt(adminId)) {
    return res.status(400).json({ 
      message: "Không thể thay đổi role của chính mình" 
    });
  }

  // Kiểm tra user tồn tại
  User.findById(userId, (err, result) => {
    if (err) {
      console.error("Lỗi find user:", err);
      return res.status(500).json({ message: "Lỗi server" });
    }

    if (result.length === 0) {
      return res.status(404).json({ message: "Không tìm thấy user" });
    }

    const targetUser = result[0];

    // Không cho phép thay đổi role của admin khác
    if (targetUser.role === 'admin' && role !== 'admin') {
      return res.status(403).json({ 
        message: "Không thể thay đổi role của admin khác" 
      });
    }

    // Cập nhật role
    User.updateRole(userId, role, (err, result) => {
      if (err) {
        console.error("Lỗi update role:", err);
        return res.status(500).json({ message: "Lỗi khi cập nhật role" });
      }

      res.json({ 
        message: "Cập nhật role thành công",
        userId,
        newRole: role
      });
    });
  });
};