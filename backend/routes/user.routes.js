import express from "express";
import { 
  getAllUsers, deleteUser, updateUserRole, // Các hàm admin cũ
  getProfile, updateProfile, addAddress, deleteAddress // Các hàm mới
} from "../controllers/user.controller.js";
import { verifyToken, verifyAdmin } from "../middleware/auth.middleware.js";

const router = express.Router();

// --- USER ROUTES ---
router.get("/profile", verifyToken, getProfile);
router.put("/profile", verifyToken, updateProfile); // Chỉ sửa Tên/SĐT
router.post("/address", verifyToken, addAddress);   // Thêm địa chỉ
router.delete("/address/:id", verifyToken, deleteAddress); // Xóa địa chỉ

// --- ADMIN ROUTES (Giữ nguyên) ---
router.get("/", verifyToken, verifyAdmin, getAllUsers);
router.delete("/:id", verifyToken, verifyAdmin, deleteUser);
router.put("/:id/role", verifyToken, verifyAdmin, updateUserRole);

export default router;