import db from "../config/db.js";

// ================= Cart Controller =================
export const getCart = (req, res) => {
  const userId = req.user.id;

  const query = `
    SELECT c.maSP, c.maSize, s_size.tenSize, c.soLuongMua, s.tenSP, s.gia, s.anhSP
    FROM ChiTietGioHang c
    JOIN GioHang g ON c.maGioHang = g.maGioHang
    JOIN SanPham s ON c.maSP = s.maSP
    JOIN Size s_size ON c.maSize = s_size.maSize
    WHERE g.userId = ?
  `;

  db.query(query, [userId], (err, results) => {
    if (err) return res.status(500).json({ message: err.message });
    res.json({ cart: results });
  });
};

export const addToCart = (req, res) => {
  const userId = req.user.id;
  const { maSP, soLuong = 1, maSize } = req.body; // Cần maSize

  if (!maSize) return res.status(400).json({ message: "Thiếu thông tin size" });

  // Tìm giỏ hàng của user
  db.query(
    "SELECT maGioHang FROM GioHang WHERE userId = ?",
    [userId],
    (err, rows) => {
      if (err) return res.status(500).json({ message: err.message });

      let maGioHang;
      if (rows.length === 0) {
        db.query("INSERT INTO GioHang (userId) VALUES (?)", [userId], (err, result) => {
          if (err) return res.status(500).json({ message: err.message });
          maGioHang = result.insertId;
          processItem();
        });
      } else {
        maGioHang = rows[0].maGioHang;
        processItem();
      }

      function processItem() {
        // Kiểm tra sản phẩm với SIZE cụ thể đã có chưa
        db.query(
          "SELECT * FROM ChiTietGioHang WHERE maGioHang = ? AND maSP = ? AND maSize = ?",
          [maGioHang, maSP, maSize],
          (err, results) => {
            if (err) return res.status(500).json({ message: err.message });

            if (results.length > 0) {
              const newQty = results[0].soLuongMua + soLuong;
              db.query(
                "UPDATE ChiTietGioHang SET soLuongMua = ? WHERE maGioHang = ? AND maSP = ? AND maSize = ?",
                [newQty, maGioHang, maSP, maSize],
                (err) => {
                  if (err) return res.status(500).json({ message: err.message });
                  res.json({ message: "Cập nhật giỏ hàng thành công" });
                }
              );
            } else {
              db.query(
                "INSERT INTO ChiTietGioHang (maGioHang, maSP, maSize, soLuongMua) VALUES (?, ?, ?, ?)",
                [maGioHang, maSP, maSize, soLuong],
                (err) => {
                  if (err) return res.status(500).json({ message: err.message });
                  res.json({ message: "Thêm vào giỏ hàng thành công" });
                }
              );
            }
          }
        );
      }
    }
  );
};

export const updateCart = (req, res) => {
  const userId = req.user.id;
  const { maSP, soLuong, maSize } = req.body; // Cần maSize

  const query = `
    UPDATE ChiTietGioHang c
    JOIN GioHang g ON c.maGioHang = g.maGioHang
    SET c.soLuongMua = ?
    WHERE g.userId = ? AND c.maSP = ? AND c.maSize = ?
  `;

  db.query(query, [soLuong, userId, maSP, maSize], (err) => {
    if (err) return res.status(500).json({ message: err.message });
    res.json({ message: "Cập nhật số lượng thành công" });
  });
};

export const removeFromCart = (req, res) => {
  const userId = req.user.id;
  const { maSP, maSize } = req.body; // Chuyển sang dùng body để gửi maSize, hoặc params dạng /remove/:maSP/:maSize

  const query = `
    DELETE c FROM ChiTietGioHang c
    JOIN GioHang g ON c.maGioHang = g.maGioHang
    WHERE g.userId = ? AND c.maSP = ? AND c.maSize = ?
  `;

  db.query(query, [userId, maSP, maSize], (err) => {
    if (err) return res.status(500).json({ message: err.message });
    res.json({ message: "Xóa sản phẩm khỏi giỏ hàng thành công" });
  });
};