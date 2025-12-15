import { SizeModel } from "../models/Size.js";

export const getAllSizes = async (req, res) => {
  try {
    const sizes = await SizeModel.getAll(); // không destructure
    res.json({ sizes }); // trả thẳng mảng sizes
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi lấy danh sách size" });
  }
};
