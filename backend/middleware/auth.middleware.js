import jwt from "jsonwebtoken";
import { SECRET_KEY } from "../config/config.js";

export const verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    if (!authHeader) {
      // Nếu không có token, bỏ qua, cho phép truy cập public API
      return next();
    }

    // Header dạng "Bearer token"
    const token = authHeader.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : null;

    if (!token) {
      return next(); // Token không hợp lệ, vẫn cho truy cập public
    }

    const decoded = jwt.verify(token, SECRET_KEY);
    req.user = decoded; // thêm thông tin user nếu token hợp lệ
    next();
  } catch (err) {
    console.error("verifyToken error:", err);
    // Token hết hạn hoặc không hợp lệ, bỏ qua, không trả lỗi
    next();
  }
};

export const verifyAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ message: "Chỉ admin mới được truy cập" });
  }
  next();
};
