import db from "../config/db.js";

// ------------------- LẤY DANH SÁCH KHO (GOM NHÓM THEO SP) -------------------
export const getKho = (req, res) => {
  const search = req.query.search || "";

  // LEFT JOIN để lấy cả sản phẩm chưa có size (nếu có)
  const sql = `
    SELECT p.maSP, p.tenSP, p.anhSP, s.tenSize, s.maSize, ct.soLuongTon
    FROM SanPham p
    LEFT JOIN ChiTietSanPham ct ON p.maSP = ct.maSP
    LEFT JOIN Size s ON ct.maSize = s.maSize
    WHERE p.tenSP LIKE ?
    ORDER BY p.maSP DESC, s.maSize ASC
  `;

  db.query(sql, [`%${search}%`], (err, results) => {
    if (err) {
      console.error("Lỗi lấy kho:", err);
      return res.status(500).json({ error: "Lỗi server" });
    }

    // --- LOGIC GOM NHÓM (GROUP BY maSP) ---
    const productsMap = {};

    results.forEach(row => {
        if (!productsMap[row.maSP]) {
            productsMap[row.maSP] = {
                maSP: row.maSP,
                tenSP: row.tenSP,
                anhSP: row.anhSP,
                tongTonKho: 0,
                sizes: []
            };
        }
        
        // Nếu dòng này có dữ liệu size (không phải null do Left Join)
        if (row.maSize) {
            productsMap[row.maSP].sizes.push({
                maSize: row.maSize,
                tenSize: row.tenSize,
                soLuongTon: row.soLuongTon
            });
            productsMap[row.maSP].tongTonKho += row.soLuongTon;
        }
    });

    // Chuyển Map thành Array để trả về frontend
    const products = Object.values(productsMap);

    res.json({ products });
  });
};

// ------------------- CẬP NHẬT KHO (BATCH UPDATE) -------------------
export const updateKho = (req, res) => {
  const { maSP } = req.params;
  const { inventory } = req.body; 
  // inventory mong đợi dạng: [{ maSize: 1, soLuong: 10 }, { maSize: 2, soLuong: 5 }]

  if (!inventory || !Array.isArray(inventory)) {
    return res.status(400).json({ error: "Dữ liệu inventory không hợp lệ" });
  }

  // Dùng Promise.all để chạy nhiều câu update cùng lúc
  const updatePromises = inventory.map(item => {
      return new Promise((resolve, reject) => {
          const sql = "UPDATE ChiTietSanPham SET soLuongTon = ? WHERE maSP = ? AND maSize = ?";
          db.query(sql, [item.soLuong, maSP, item.maSize], (err, result) => {
              if (err) return reject(err);
              resolve(result);
          });
      });
  });

  Promise.all(updatePromises)
      .then(() => {
          res.json({ message: "Cập nhật kho thành công!" });
      })
      .catch(err => {
          console.error("Lỗi update batch:", err);
          res.status(500).json({ error: "Lỗi server khi cập nhật kho" });
      });
};