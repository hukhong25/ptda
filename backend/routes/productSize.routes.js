import express from "express";
import { getProductSizes } from "../controllers/productSize.controller.js";
import { verifyToken } from "../middleware/auth.middleware.js";

const router = express.Router();

// GET /api/products/:id/sizes
router.get("/:id/sizes", verifyToken, getProductSizes);

export default router;
