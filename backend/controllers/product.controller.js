import Product from "../models/Product.js";
import path from "path";
import fs from "fs";
import { ProductDetailModel } from "../models/productSize.js";

export const getProducts = (req, res) => {
  Product.getAll((err, result) => {
    if (err) {
      console.error("Lỗi lấy danh sách:", err);
      return res.status(500).json({ message: "Lỗi server" });
    }
    res.json({ products: result });
  });
};

export const getProductById = (req, res) => {
  const { id } = req.params;
  Product.getById(id, (err, result) => {
    if (err) return res.status(500).json({ message: "Lỗi server" });
    if (!result || result.length === 0)
      return res.status(404).json({ message: "Không tìm thấy" });

    // Gom nhóm sizes
    const firstRow = result[0];
    const product = {
      maSP: firstRow.maSP,
      tenSP: firstRow.tenSP,
      gia: firstRow.gia,
      moTa: firstRow.moTa,
      anhSP: firstRow.anhSP,
      sizes: [],
    };

    // Tính tổng số lượng để hiển thị ra form sửa
    let totalStock = 0;
    result.forEach((row) => {
      if (row.maSize) {
        product.sizes.push({
          maSize: row.maSize,
          tenSize: row.tenSize,
          soLuongTon: row.soLuongTon,
        });
        totalStock += row.soLuongTon;
      }
    });
    // Gán soLuong tổng vào product để frontend hiển thị trong ô input
    // Vì yêu cầu là "các size mặc định", ta lấy số lượng của 1 size bất kỳ làm đại diện nếu muốn đồng bộ,
    // hoặc lấy trung bình. Ở đây để đơn giản ta lấy số lượng của size đầu tiên (vì logic là set all giống nhau).
    product.soLuong =
      product.sizes.length > 0 ? product.sizes[0].soLuongTon : 0;

    res.json({ product });
  });
};

export const getProductCategories = (req, res) => {
  const { id } = req.params;
  Product.getCategories(id, (err, result) => {
    if (err) return res.status(500).json({ message: "Lỗi server" });
    res.json({ categories: result });
  });
};

export const getProductSizes = async (req, res) => {
  const { id } = req.params;
  try {
    const sizes = await ProductDetailModel.getSizesByProductId(id);
    // Trả đúng format để frontend dễ dùng
    res.json({
      sizes: sizes.map((s) => ({
        maSize: s.maSize,
        tenSize: s.tenSize,
        soLuongTon: s.soLuongTon,
      })),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi lấy size sản phẩm" });
  }
};

// ====================== THÊM SẢN PHẨM ===========================
export const createProduct = (req, res) => {
  const { tenSP, gia, moTa, categories, sizes } = req.body;

  if (!tenSP || !gia) {
    return res.status(400).json({ message: "Vui lòng nhập đầy đủ thông tin" });
  }

  let anhSP = null;
  if (req.file) anhSP = req.file.filename;

  const newProduct = { tenSP, gia: parseInt(gia), moTa: moTa || "", anhSP };

  Product.create(newProduct, (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Lỗi khi thêm sản phẩm" });
    }

    const productId = result.insertId;
    const stockQty = parseInt(soLuong) || 0;

    // ✅ Tạo kho theo size FE gửi lên
    let sizeData = [];
    try {
      sizeData = JSON.parse(sizes || "[]");
    } catch (e) {
      sizeData = [];
    }

    // sizeData = [{ maSize, soLuongTon }]
    ProductDetailModel.updateProductSizes(productId, sizeData);

    if (categories) {
      let categoryIds = [];
      try {
        categoryIds = JSON.parse(categories);
      } catch (e) {
        categoryIds = [];
      }
      if (Array.isArray(categoryIds)) {
        categoryIds.forEach((catId) =>
          Product.addCategory(productId, catId, () => {})
        );
      }
    }

    res.json({ message: "Thêm sản phẩm thành công", productId });
  });
};

// ====================== CẬP NHẬT SẢN PHẨM ===========================
export const updateProduct = (req, res) => {
  const { id } = req.params;
  const { tenSP, gia, moTa, categories, oldImage, sizes } = req.body;

  if (!tenSP || !gia) {
    return res.status(400).json({ message: "Vui lòng nhập đầy đủ thông tin" });
  }

  let anhSP = oldImage;
  if (req.file) {
    anhSP = req.file.filename;
    if (oldImage && oldImage !== "null" && oldImage !== "undefined") {
      try {
        const oldPath = path.join(process.cwd(), "../frontend/Asset", oldImage);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      } catch (err) {
        console.error("Không xóa được ảnh cũ:", err.message);
      }
    }
  }

  const updatedProduct = { tenSP, gia: parseInt(gia), moTa: moTa || "", anhSP };

  Product.update(id, updatedProduct, (err, result) => {
    if (err) {
      console.error("Lỗi update SP:", err);
      return res.status(500).json({ message: "Lỗi khi cập nhật sản phẩm" });
    }

    // ✅ Cập nhật kho theo size
    let sizeData = [];
    try {
      sizeData = JSON.parse(sizes || "[]");
    } catch (e) {
      sizeData = [];
    }

    ProductDetailModel.updateProductSizes(id, sizeData);

    if (categories) {
      let categoryIds = [];
      try {
        categoryIds = JSON.parse(categories);
      } catch (e) {}
      Product.removeAllCategories(id, (err) => {
        if (!err && Array.isArray(categoryIds)) {
          categoryIds.forEach((catId) =>
            Product.addCategory(id, catId, () => {})
          );
        }
      });
    }

    res.json({ message: "Cập nhật sản phẩm thành công" });
  });
};

export const deleteProduct = (req, res) => {
  const { id } = req.params;
  Product.getById(id, (err, result) => {
    if (err) return res.status(500).json({ message: "Lỗi server" });
    if (!result || result.length === 0)
      return res.status(404).json({ message: "Không tìm thấy" });

    const product = result[0];
    Product.delete(id, (err, deleteResult) => {
      if (err) {
        if (err.code === "ER_ROW_IS_REFERENCED_2") {
          return res
            .status(400)
            .json({ message: "Không thể xóa: Sản phẩm đang có đơn hàng." });
        }
        return res.status(500).json({ message: "Lỗi xóa sản phẩm" });
      }
      if (product.anhSP) {
        try {
          const imagePath = path.join(
            process.cwd(),
            "../frontend/Asset",
            product.anhSP
          );
          if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
        } catch (e) {}
      }
      res.json({ message: "Xóa sản phẩm thành công" });
    });
  });
};
