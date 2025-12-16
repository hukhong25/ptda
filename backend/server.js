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
import axios from 'axios';
import crypto from 'crypto';

// --- CẤU HÌNH MOMO SANDBOX (DÙNG CHUNG CHO TEST) ---
const config = {
  accessKey: 'F8BBA842ECF85', // Key test công khai của MoMo
  secretKey: 'K951B6PE1waDMi640xX08PD3vg6EkVlz', // Key test công khai
  partnerCode: 'MOMO',
  redirectUrl: 'http://127.0.0.1:5500/html/orderSuccess.html', // Quay về trang thông báo thành công
  ipnUrl: 'http://127.0.0.1:5500/html/orderSuccess.html', // (Lưu ý: Localhost không nhận được IPN thật, đây chỉ là demo)
  requestType: 'payWithATM',
  extraData: '',
  orderInfo: 'Thanh toán đơn hàng quần áo',
  autoCapture: true,
  lang: 'vi',
};

// API TẠO LINK THANH TOÁN MOMO
app.post('/api/create-payment-momo', async (req, res) => {
  const { amount } = req.body; // Lấy tổng tiền từ Frontend gửi lên
  
  // Tạo mã đơn hàng ngẫu nhiên để không bị trùng
  const orderId = 'MOMO' + new Date().getTime();
  const requestId = orderId;
  
  // Tạo chữ ký bảo mật (Signature) theo yêu cầu của MoMo
  const rawSignature = `accessKey=${config.accessKey}&amount=${amount}&extraData=${config.extraData}&ipnUrl=${config.ipnUrl}&orderId=${orderId}&orderInfo=${config.orderInfo}&partnerCode=${config.partnerCode}&redirectUrl=${config.redirectUrl}&requestId=${requestId}&requestType=${config.requestType}`;

  const signature = crypto
    .createHmac('sha256', config.secretKey)
    .update(rawSignature)
    .digest('hex');

  // Tạo body gửi sang MoMo
  const requestBody = {
    partnerCode: config.partnerCode,
    partnerName: "Test MoMo",
    storeId: "MomoTestStore",
    requestId: requestId,
    amount: amount,
    orderId: orderId,
    orderInfo: config.orderInfo,
    redirectUrl: config.redirectUrl,
    ipnUrl: config.ipnUrl,
    lang: config.lang,
    requestType: config.requestType,
    autoCapture: config.autoCapture,
    extraData: config.extraData,
    signature: signature,
  };

  try {
    // Gọi API của MoMo
    const response = await axios.post(
      'https://test-payment.momo.vn/v2/gateway/api/create',
      requestBody
    );
    
    // Trả về link thanh toán (payUrl) cho Frontend
    res.status(200).json(response.data);
  } catch (error) {
    console.error('Lỗi thanh toán MoMo:', error);
    res.status(500).json({ message: 'Lỗi tạo giao dịch MoMo' });
  }
});

// ------------------ START SERVER ------------------
app.listen(3000, () => {
  console.log("🚀 Server chạy tại http://localhost:3000");
});


// tắt bằng terminal:  taskkill /F /IM node.exe