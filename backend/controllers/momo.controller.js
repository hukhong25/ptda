import crypto from 'crypto';
import axios from 'axios';

export const createMomoPayment = async (req, res) => {
  const { amount, orderId } = req.body; // Lấy số tiền và mã đơn hàng từ Frontend gửi lên

  // 1. Cấu hình thông tin tài khoản MoMo Test (Đây là tài khoản test công khai của MoMo)
  // Bạn nên đăng ký tài khoản tại developers.momo.vn để lấy Key riêng nếu cần ổn định lâu dài
  const partnerCode = "MOMO";
  const accessKey = "F8BBA842ECF85";
  const secretKey = "K951B6PE1waDMi640xX08PD3vg6EkVlz";
  
  // 2. Cấu hình đường dẫn
  // Khi thanh toán xong, MoMo sẽ chuyển trang về link này
  const redirectUrl = "http://localhost:5500/frontend/html/index.html"; 
  // Link để MoMo báo kết quả về Server (quan trọng khi deploy, localhost thì bỏ qua)
  const ipnUrl = "http://localhost:3000/api/momo/callback"; 
  
  const requestId = orderId + new Date().getTime();
  const requestType = "captureWallet";
  const extraData = ""; // Có thể để trống
  const orderInfo = "Thanh toán đơn hàng " + orderId;

  // 3. Tạo chữ ký (Signature) theo thuật toán HMAC SHA256 (Bắt buộc)
  const rawSignature = `accessKey=${accessKey}&amount=${amount}&extraData=${extraData}&ipnUrl=${ipnUrl}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${partnerCode}&redirectUrl=${redirectUrl}&requestId=${requestId}&requestType=${requestType}`;

  const signature = crypto.createHmac('sha256', secretKey)
    .update(rawSignature)
    .digest('hex');

  // 4. Tạo body request gửi sang MoMo
  const requestBody = {
    partnerCode: partnerCode,
    partnerName: "Test MoMo",
    storeId: "MomoTestStore",
    requestId: requestId,
    amount: amount,
    orderId: orderId,
    orderInfo: orderInfo,
    redirectUrl: redirectUrl,
    ipnUrl: ipnUrl,
    lang: "vi",
    requestType: requestType,
    autoCapture: true,
    extraData: extraData,
    signature: signature
  };

  // 5. Gửi request sang MoMo
  try {
    const response = await axios.post(
      'https://test-payment.momo.vn/v2/gateway/api/create',
      requestBody
    );
    
    // Trả về link thanh toán (payUrl) cho Frontend
    return res.status(200).json(response.data); 
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Lỗi tạo thanh toán MoMo" });
  }
};