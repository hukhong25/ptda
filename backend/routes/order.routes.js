import express from "express";
import { createOrder } from "../controllers/order.controller.js";
import { verifyToken } from "../middleware/auth.middleware.js";

const router = express.Router();

// POST /api/orders/create
router.post("/create", verifyToken, createOrder);

export default router;