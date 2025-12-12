import db from "../config/db.js";

export const createOrder = (req, res) => {
  const userId = req.user.id;
  const { tenNguoiNhan, sdt, diaChiGiaoHang, ghiChu, items, tongTien, maPTTT } = req.body;

  if (!items || items.length === 0) {
    return res.status(400).json({ message: "Không có sản phẩm nào để đặt hàng" });
  }

  // 1. Tạo đơn hàng trong bảng DonHang
  const queryOrder = `
    INSERT INTO DonHang (id, tenNguoiNhan, sdt, diaChiGiaoHang, ghiChu, tongTien, maPTTT, trangThai)
    VALUES (?, ?, ?, ?, ?, ?, ?, 'Pending')
  `;

  db.query(
    queryOrder,
    [userId, tenNguoiNhan, sdt, diaChiGiaoHang, ghiChu, tongTien, maPTTT || 1], // Mặc định COD nếu thiếu
    (err, result) => {
      if (err) return res.status(500).json({ message: "Lỗi tạo đơn hàng: " + err.message });

      const maDonHang = result.insertId;

      // 2. Chuẩn bị dữ liệu cho bảng ChiTietDonHang
      // items là mảng các object { maSP, maSize, soLuongMua, gia }
      const orderDetails = items.map(item => [
        maDonHang,
        item.maSP,
        item.maSize,
        item.soLuongMua,
        item.gia
      ]);

      const queryDetails = `INSERT INTO ChiTietDonHang (maDonHang, maSP, maSize, soLuongMua, giaMua) VALUES ?`;

      db.query(queryDetails, [orderDetails], (err) => {
        if (err) return res.status(500).json({ message: "Lỗi lưu chi tiết đơn: " + err.message });

        // 3. Xóa các sản phẩm đã mua khỏi giỏ hàng (ChiTietGioHang)
        // Cần lấy maGioHang của user trước
        const getCartQuery = "SELECT maGioHang FROM GioHang WHERE userId = ?";
        db.query(getCartQuery, [userId], (err, cartRows) => {
            if(!err && cartRows.length > 0) {
                const maGioHang = cartRows[0].maGioHang;
                
                // Tạo điều kiện xóa (xóa đúng sản phẩm và size đã mua)
                // Vì MySQL DELETE JOIN hơi phức tạp, ở đây ta xóa theo list maSP và maSize
                // Cách đơn giản nhất cho demo: Lặp qua items để xóa (hoặc dùng câu lệnh DELETE phức tạp)
                
                items.forEach(item => {
                    db.query(
                        "DELETE FROM ChiTietGioHang WHERE maGioHang = ? AND maSP = ? AND maSize = ?",
                        [maGioHang, item.maSP, item.maSize]
                    );
                });
            }
        });

        res.status(201).json({ message: "Đặt hàng thành công!", maDonHang });
      });
    }
  );
};