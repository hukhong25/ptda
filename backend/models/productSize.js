import db from "../config/db.js";

export const ProductDetailModel = {
  // Lấy size + tồn kho của 1 sản phẩm
  getByProductId: (maSP) => {
    const sql = `
      SELECT 
        s.maSize,
        s.tenSize,
        ct.soLuongTon
      FROM ChiTietSanPham ct
      JOIN Size s ON ct.maSize = s.maSize
      WHERE ct.maSP = ?
    `;
    return db.promise().query(sql, [maSP]);
  },

  // Cập nhật size + tồn kho (dùng cho add / edit)
  updateProductSizes: async (maSP, sizes = []) => {
    const deleteSql = "DELETE FROM ChiTietSanPham WHERE maSP = ?";
    await db.promise().query(deleteSql, [maSP]);

    const insertSql = `
      INSERT INTO ChiTietSanPham (maSP, maSize, soLuongTon)
      VALUES (?, ?, ?)
    `;
    for (const s of sizes) {
      await db.promise().query(insertSql, [maSP, s.maSize, s.soLuongTon || 0]);
    }
  },
};
