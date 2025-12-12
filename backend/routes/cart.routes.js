import express from "express";
import { getCart, addToCart, updateCart, removeFromCart } from "../controllers/cart.controller.js";
import { verifyToken } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", verifyToken, getCart);
router.post("/add", verifyToken, addToCart);
router.put("/update", verifyToken, updateCart);
// Thay đổi route xóa để nhận maSize qua body
router.post("/remove", verifyToken, removeFromCart); 

export default router;