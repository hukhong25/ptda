import express from "express";
import { getKho, updateKho } from "../controllers/kho.controller.js";

const router = express.Router();

router.get("/", getKho);
router.put("/:maSP", updateKho);

export default router;
