import express from "express";
import { 
  getAllCategories, 
  getCategoryById, 
  createCategory, 
  updateCategory, 
  deleteCategory 
} from "../controllers/category.controller.js";
import { verifyToken, verifyAdmin } from "../middleware/auth.middleware.js";

const router = express.Router();

// PUBLIC - Lấy danh sách danh mục
router.get("/", getAllCategories);

// PUBLIC - Lấy chi tiết 1 danh mục
router.get("/:id", getCategoryById);

// ADMIN - Thêm danh mục
router.post("/", verifyToken, verifyAdmin, createCategory);

// ADMIN - Cập nhật danh mục
router.put("/:id", verifyToken, verifyAdmin, updateCategory);

// ADMIN - Xóa danh mục
router.delete("/:id", verifyToken, verifyAdmin, deleteCategory);

export default router;