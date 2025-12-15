import express from "express";
import { getAllSizes } from "../controllers/size.controller.js";
import { verifyToken } from "../middleware/auth.middleware.js";

const router = express.Router();

// Lấy danh sách size
router.get("/", verifyToken, getAllSizes);

export default router;
