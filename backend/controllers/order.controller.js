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

        // 3. Xử lý: Xóa giỏ hàng VÀ Trừ kho sản phẩm
        const getCartQuery = "SELECT maGioHang FROM GioHang WHERE userId = ?";
        db.query(getCartQuery, [userId], (err, cartRows) => {
            // Lấy mã giỏ hàng (nếu có lỗi hoặc không có thì bỏ qua bước xóa giỏ)
            const maGioHang = (cartRows && cartRows.length > 0) ? cartRows[0].maGioHang : null;

            items.forEach(item => {
                // A. Xóa sản phẩm khỏi giỏ hàng (nếu tìm thấy giỏ hàng)
                if (maGioHang) {
                    db.query(
                        "DELETE FROM ChiTietGioHang WHERE maGioHang = ? AND maSP = ? AND maSize = ?",
                        [maGioHang, item.maSP, item.maSize]
                    );
                }

                // B. [MỚI THÊM] Trừ số lượng tồn kho trong bảng ChiTietSanPham
                const updateStockQuery = `
                    UPDATE ChiTietSanPham 
                    SET soLuongTon = soLuongTon - ? 
                    WHERE maSP = ? AND maSize = ? AND soLuongTon >= ?
                `;
                
                // Tham số: [Số lượng mua, Mã SP, Mã Size, Số lượng mua (để đảm bảo không bị âm kho)]
                db.query(
                    updateStockQuery, 
                    [item.soLuongMua, item.maSP, item.maSize, item.soLuongMua],
                    (stockErr) => {
                        if (stockErr) {
                            console.error(`Lỗi trừ kho SP ${item.maSP} Size ${item.maSize}:`, stockErr);
                        }
                    }
                );
            });
        });

        res.status(201).json({ message: "Đặt hàng thành công!", maDonHang });
      });
    }
  );
};

// ====================== LẤY ĐƠN HÀNG CỦA TÔI (Giữ nguyên) ===========================
export const getMyOrders = (req, res) => {
    const userId = req.user.id; 

    // SỬ DỤNG BACKTICK CHO TÊN BẢNG ĐỂ TRÁNH LỖI TỪ KHÓA
    const query = `
        SELECT 
            d.maDonHang, d.ngayDat, d.trangThai, d.tongTien, d.tenNguoiNhan, d.sdt, d.diaChiGiaoHang, d.ghiChu,
            c.maSP, c.soLuongMua, c.giaMua,
            s.tenSP, s.anhSP,
            sz.tenSize
        FROM DonHang d
        LEFT JOIN ChiTietDonHang c ON d.maDonHang = c.maDonHang
        LEFT JOIN SanPham s ON c.maSP = s.maSP
        LEFT JOIN \`Size\` sz ON c.maSize = sz.maSize
        WHERE d.id = ? 
        ORDER BY d.ngayDat DESC
    `;

    db.query(query, [userId], (err, results) => {
        if (err) {
            console.error("❌ Lỗi SQL getMyOrders:", err); 
            return res.status(500).json({ message: "Lỗi Server khi lấy đơn hàng", error: err.message });
        }

        const ordersMap = {};

        results.forEach(row => {
            if (!ordersMap[row.maDonHang]) {
                ordersMap[row.maDonHang] = {
                    maDonHang: row.maDonHang,
                    ngayDat: row.ngayDat,
                    trangThai: row.trangThai,
                    tongTien: row.tongTien,
                    tenNguoiNhan: row.tenNguoiNhan,
                    sdt: row.sdt,
                    diaChiGiaoHang: row.diaChiGiaoHang,
                    items: []
                };
            }
            if (row.maSP) {
                ordersMap[row.maDonHang].items.push({
                    tenSP: row.tenSP,
                    anhSP: row.anhSP,
                    tenSize: row.tenSize,
                    soLuongMua: row.soLuongMua,
                    giaMua: row.giaMua
                });
            }
        });

        res.status(200).json(Object.values(ordersMap));
    });
};