import express from "express";
import { 
    createOrder, 
    getMyOrders 
} from "../controllers/order.controller.js";
import { verifyToken } from "../middleware/auth.middleware.js";

const router = express.Router();

// POST /api/orders/create - Tạo đơn
router.post("/create", verifyToken, createOrder);

// GET /api/orders/my-orders - Xem lịch sử đơn hàng
router.get('/my-orders', verifyToken, getMyOrders);

export default router;