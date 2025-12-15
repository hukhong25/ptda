import express from "express";
import path from "path";
import authRoutes from "./routes/auth.routes.js";
import productRoutes from "./routes/product.routes.js";
import userRoutes from "./routes/user.routes.js";
import khoRoutes from "./routes/kho.routes.js";
import categoryRoutes from "./routes/category.routes.js";
import cartRoutes from "./routes/cart.routes.js";
import orderRoutes from "./routes/order.routes.js";
import cors from "cors";// thu vien cors de chay live server

const app = express();

app.use(cors({
  origin: [
    "http://localhost:5500",
    "http://127.0.0.1:5500",
  ],
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use(express.json());

const __dirname = path.resolve();

// ------------------ API ROUTES -----------------
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/users", userRoutes);
app.use("/api/kho", khoRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
// ------------------ STATIC FRONTEND ------------------
app.use("/Asset", express.static(path.join(__dirname, "../frontend/Asset")));
app.use(express.static(path.join(__dirname, "../frontend")));

app.get("/", (req, res) =>
  res.sendFile(path.join(__dirname, "../frontend/html/index.html"))
);

app.get("/login", (req, res) =>
  res.sendFile(path.join(__dirname, "../frontend/html/login.html"))
);

app.get("/register", (req, res) =>
  res.sendFile(path.join(__dirname, "../frontend/html/register.html"))
);

// Serve uploads
app.use("/uploads", express.static(path.join(__dirname, "../frontend/Asset")));

// ------------------ START SERVER ------------------
app.listen(3000, () => {
  console.log("🚀 Server chạy tại http://localhost:3000");
});


// tắt bằng terminal:  taskkill /F /IM node.exe