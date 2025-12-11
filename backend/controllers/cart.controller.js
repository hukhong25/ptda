// controllers/cart.controller.js
import db from "../config/db.js";

// ================= Cart Controller =================
export const getCart = (req, res) => {
  const userId = req.user.id;

  const query = `
    SELECT c.maSP, c.soLuongMua, s.tenSP, s.gia, s.anhSP
    FROM ChiTietGioHang c
    JOIN GioHang g ON c.maGioHang = g.maGioHang
    JOIN SanPham s ON c.maSP = s.maSP
    WHERE g.userId = ?
  `;

  db.query(query, [userId], (err, results) => {
    if (err) return res.status(500).json({ message: err.message });
    res.json({ cart: results });
  });
};

export const addToCart = (req, res) => {
  const userId = req.user.id;
  const { maSP, soLuong = 1 } = req.body;

  db.query(
    "SELECT maGioHang FROM GioHang WHERE userId = ?",
    [userId],
    (err, rows) => {
      if (err) return res.status(500).json({ message: err.message });

      let maGioHang;

      if (rows.length === 0) {
        db.query(
          "INSERT INTO GioHang (userId) VALUES (?)",
          [userId],
          (err, result) => {
            if (err) return res.status(500).json({ message: err.message });
            maGioHang = result.insertId;
            insertOrUpdateCart();
          }
        );
      } else {
        maGioHang = rows[0].maGioHang;
        insertOrUpdateCart();
      }

      function insertOrUpdateCart() {
        db.query(
          "SELECT * FROM ChiTietGioHang WHERE maGioHang = ? AND maSP = ?",
          [maGioHang, maSP],
          (err, results) => {
            if (err) return res.status(500).json({ message: err.message });

            if (results.length > 0) {
              const newQty = results[0].soLuongMua + soLuong;
              db.query(
                "UPDATE ChiTietGioHang SET soLuongMua = ? WHERE maGioHang = ? AND maSP = ?",
                [newQty, maGioHang, maSP],
                (err) => {
                  if (err)
                    return res.status(500).json({ message: err.message });
                  res.json({ message: "Cập nhật giỏ hàng thành công" });
                }
              );
            } else {
              db.query(
                "INSERT INTO ChiTietGioHang (maGioHang, maSP, soLuongMua) VALUES (?, ?, ?)",
                [maGioHang, maSP, soLuong],
                (err) => {
                  if (err)
                    return res.status(500).json({ message: err.message });
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
  const { maSP, soLuong } = req.body;

  const query = `
    UPDATE ChiTietGioHang c
    JOIN GioHang g ON c.maGioHang = g.maGioHang
    SET c.soLuongMua = ?
    WHERE g.userId = ? AND c.maSP = ?
  `;

  db.query(query, [soLuong, userId, maSP], (err) => {
    if (err) return res.status(500).json({ message: err.message });
    res.json({ message: "Cập nhật số lượng thành công" });
  });
};

export const removeFromCart = (req, res) => {
  const userId = req.user.id;
  const maSP = req.params.maSP;

  const query = `
    DELETE c FROM ChiTietGioHang c
    JOIN GioHang g ON c.maGioHang = g.maGioHang
    WHERE g.userId = ? AND c.maSP = ?
  `;

  db.query(query, [userId, maSP], (err) => {
    if (err) return res.status(500).json({ message: err.message });
    res.json({ message: "Xóa sản phẩm khỏi giỏ hàng thành công" });
  });
};
