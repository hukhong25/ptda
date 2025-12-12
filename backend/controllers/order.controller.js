import db from "../config/db.js";

// ====================== TẠO ĐƠN HÀNG ===========================
export const createOrder = (req, res) => {
  const userId = req.user.id;
  const { tenNguoiNhan, sdt, diaChiGiaoHang, ghiChu, items, tongTien, maPTTT } = req.body;

  if (!items || items.length === 0) {
    return res.status(400).json({ message: "Không có sản phẩm nào để đặt hàng" });
  }

  // 1. Tạo đơn hàng
  const queryOrder = `
    INSERT INTO DonHang (id, tenNguoiNhan, sdt, diaChiGiaoHang, ghiChu, tongTien, maPTTT, trangThai)
    VALUES (?, ?, ?, ?, ?, ?, ?, 'Pending')
  `;

  db.query(
    queryOrder,
    [userId, tenNguoiNhan, sdt, diaChiGiaoHang, ghiChu, tongTien, maPTTT || 1],
    (err, result) => {
      if (err) return res.status(500).json({ message: "Lỗi tạo đơn hàng: " + err.message });

      const maDonHang = result.insertId;

      // 2. Chuẩn bị dữ liệu chi tiết
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

        // 3. Xóa giỏ hàng (Logic đơn giản: xóa theo item đã mua)
        const getCartQuery = "SELECT maGioHang FROM GioHang WHERE userId = ?";
        db.query(getCartQuery, [userId], (err, cartRows) => {
            if(!err && cartRows.length > 0) {
                const maGioHang = cartRows[0].maGioHang;
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

// ====================== LẤY ĐƠN HÀNG CỦA TÔI ===========================
export const getMyOrders = (req, res) => {
    const userId = req.user.id; 

    // Query lấy đơn hàng từ bảng DonHang
    const query = `
        SELECT * FROM DonHang 
        WHERE id = ? 
        ORDER BY ngayDat DESC
    `;

    db.query(query, [userId], (err, results) => {
        if (err) {
            return res.status(500).json({ message: "Lỗi khi lấy danh sách đơn hàng", error: err });
        }
        res.status(200).json(results);
    });
};