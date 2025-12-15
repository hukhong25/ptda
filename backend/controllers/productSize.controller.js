import { ProductDetailModel } from "../models/productSize.js";

export const getProductSizes = async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await ProductDetailModel.getByProductId(id);
    res.json({ sizes: rows }); // trả về mảng [{ maSize, tenSize, soLuongTon }]
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi lấy danh sách size" });
  }
};
