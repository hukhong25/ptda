import express from "express";
import { 
  getAllUsers, 
  deleteUser, 
  updateUserRole 
} from "../controllers/user.controller.js";
import { verifyToken, verifyAdmin } from "../middleware/auth.middleware.js";

const router = express.Router();

// GET /api/users - Lấy danh sách users (chỉ admin)
router.get("/", verifyToken, verifyAdmin, getAllUsers);

// DELETE /api/users/:id - Xóa user (chỉ admin)
router.delete("/:id", verifyToken, verifyAdmin, deleteUser);

// PUT /api/users/:id/role - Cập nhật role (chỉ admin)
router.put("/:id/role", verifyToken, verifyAdmin, updateUserRole);

export default router;