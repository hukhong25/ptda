import express from "express";
import { 
  getAllUsers, 
  deleteUser, 
  updateUserRole,
  getProfile,   
  updateProfile  
} from "../controllers/user.controller.js";
import { verifyToken, verifyAdmin } from "../middleware/auth.middleware.js";

const router = express.Router();

// --- USER ROUTES ---
router.get("/profile", verifyToken, getProfile);       // Xem thông tin
router.put("/profile", verifyToken, updateProfile);    // Sửa thông tin

// --- ADMIN ROUTES ---
router.get("/", verifyToken, verifyAdmin, getAllUsers);
router.delete("/:id", verifyToken, verifyAdmin, deleteUser);
router.put("/:id/role", verifyToken, verifyAdmin, updateUserRole);

export default router;