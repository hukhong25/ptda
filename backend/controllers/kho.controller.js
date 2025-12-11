import db from "../config/db.js";

// ------------------- LẤY DANH SÁCH KHO -------------------
export const getKho = (req, res) => {
  const search = req.query.search || "";

  const sql = `
    SELECT maSP, tenSP, soLuong, anhSP
    FROM sanPham
    WHERE tenSP LIKE ?
    ORDER BY maSP ASC
  `;

  db.query(sql, [`%${search}%`], (err, results) => {
    if (err) {
      console.error("Lỗi lấy kho:", err);
      return res.status(500).json({ error: "Lỗi server" });
    }

    // Trả về dạng { products: [...] } để frontend render
    res.json({ products: results });
  });
};

// ------------------- CẬP NHẬT SỐ LƯỢNG KHO -------------------
export const updateKho = (req, res) => {
  const { maSP } = req.params;
  const { soLuong } = req.body;

  if (soLuong === undefined || soLuong < 0) {
    return res.status(400).json({ error: "Số lượng không hợp lệ" });
  }

  const sql = "UPDATE sanPham SET soLuong = ? WHERE maSP = ?";
  db.query(sql, [soLuong, maSP], (err, result) => {
    if (err) {
      console.error("Lỗi cập nhật kho:", err);
      return res.status(500).json({ error: "Lỗi server" });
    }

    // Kiểm tra xem có cập nhật được không
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Không tìm thấy sản phẩm" });
    }

    res.json({ message: "Cập nhật kho thành công!" });
  });
};
