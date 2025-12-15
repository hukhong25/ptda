import express from "express";
import { 
  getAllUsers, deleteUser, updateUserRole, 
  getProfile, updateProfile, addAddress, deleteAddress, 
  setDefaultAddress // <--- 1. BẠN CẦN THÊM CÁI NÀY VÀO IMPORT
} from "../controllers/user.controller.js";
import { verifyToken, verifyAdmin } from "../middleware/auth.middleware.js";

const router = express.Router();

// --- USER ROUTES ---
router.get("/profile", verifyToken, getProfile);
router.put("/profile", verifyToken, updateProfile);
router.post("/address", verifyToken, addAddress);
router.delete("/address/:id", verifyToken, deleteAddress);

// <--- 2. THÊM DÒNG NÀY VÀO ĐÂY (Đã sửa lại tên biến cho đúng)
router.put("/address/:id/default", verifyToken, setDefaultAddress); 

// --- ADMIN ROUTES (Giữ nguyên) ---
router.get("/", verifyToken, verifyAdmin, getAllUsers);
router.delete("/:id", verifyToken, verifyAdmin, deleteUser);
router.put("/:id/role", verifyToken, verifyAdmin, updateUserRole);

export default router;