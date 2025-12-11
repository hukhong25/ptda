import Product from "../models/Product.js";
import path from "path";
import fs from "fs";

// ====================== LẤY TẤT CẢ SẢN PHẨM ===========================
export const getProducts = (req, res) => {
  Product.getAll((err, result) => {
    if (err) return res.status(500).json({ message: "Lỗi server" });
    res.json({ products: result });
  });
};

// ====================== LẤY 1 SẢN PHẨM THEO ID ===========================
export const getProductById = (req, res) => {
  const { id } = req.params;
  
  Product.getById(id, (err, result) => {
    if (err) return res.status(500).json({ message: "Lỗi server" });
    if (result.length === 0) {
      return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
    }
    res.json({ product: result[0] });
  });
};

// ====================== LẤY DANH MỤC CỦA SẢN PHẨM ===========================
export const getProductCategories = (req, res) => {
  const { id } = req.params;
  
  Product.getCategories(id, (err, result) => {
    if (err) return res.status(500).json({ message: "Lỗi server" });
    res.json({ categories: result });
  });
};

// ====================== THÊM SẢN PHẨM ===========================
export const createProduct = (req, res) => {
  const { tenSP, gia, moTa, soLuong, categories } = req.body;
  
  if (!tenSP || !gia) {
    return res.status(400).json({ message: "Vui lòng nhập đầy đủ thông tin" });
  }

  // Xử lý file upload (nếu có)
  let anhSP = null;
  if (req.file) {
    anhSP = req.file.filename;
  }

  const newProduct = {
    tenSP,
    gia: parseInt(gia),
    moTa: moTa || "",
    anhSP,
    soLuong: parseInt(soLuong) || 0
  };

  Product.create(newProduct, (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Lỗi khi thêm sản phẩm" });
    }

    const productId = result.insertId;

    // Nếu có danh mục, thêm vào bảng SanPham_DanhMuc
    if (categories) {
      let categoryIds = [];
      try {
        categoryIds = JSON.parse(categories);
      } catch (e) {
        console.error("Error parsing categories:", e);
      }

      // Thêm từng danh mục
      if (Array.isArray(categoryIds) && categoryIds.length > 0) {
        categoryIds.forEach((categoryId) => {
          Product.addCategory(productId, categoryId, (err) => {
            if (err) console.error("Lỗi khi thêm danh mục:", err);
          });
        });
      }
    }

    res.json({ 
      message: "Thêm sản phẩm thành công", 
      productId: productId 
    });
  });
};

// ====================== CẬP NHẬT SẢN PHẨM ===========================
export const updateProduct = (req, res) => {
  const { id } = req.params;
  const { tenSP, gia, moTa, soLuong, categories, oldImage } = req.body;

  if (!tenSP || !gia) {
    return res.status(400).json({ message: "Vui lòng nhập đầy đủ thông tin" });
  }

  // Xử lý ảnh mới (nếu có)
  let anhSP = oldImage;
  if (req.file) {
    anhSP = req.file.filename;
    
    // Xóa ảnh cũ nếu có
    if (oldImage) {
      const oldPath = path.join(process.cwd(), "../frontend/Asset", oldImage);
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    }
  }

  const updatedProduct = {
    tenSP,
    gia: parseInt(gia),
    moTa: moTa || "",
    anhSP,
    soLuong: parseInt(soLuong) || 0
  };

  Product.update(id, updatedProduct, (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Lỗi khi cập nhật sản phẩm" });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
    }

    // Cập nhật danh mục
    if (categories !== undefined) {
      let categoryIds = [];
      try {
        categoryIds = JSON.parse(categories);
      } catch (e) {
        console.error("Error parsing categories:", e);
      }

      // Xóa tất cả danh mục cũ
      Product.removeAllCategories(id, (err) => {
        if (err) console.error("Lỗi xóa danh mục cũ:", err);

        // Thêm danh mục mới
        if (Array.isArray(categoryIds) && categoryIds.length > 0) {
          categoryIds.forEach((categoryId) => {
            Product.addCategory(id, categoryId, (err) => {
              if (err) console.error("Lỗi thêm danh mục mới:", err);
            });
          });
        }
      });
    }

    res.json({ message: "Cập nhật sản phẩm thành công" });
  });
};

// ====================== XÓA SẢN PHẨM ===========================
export const deleteProduct = (req, res) => {
  const { id } = req.params;

  // Lấy thông tin sản phẩm trước khi xóa để xóa ảnh
  Product.getById(id, (err, result) => {
    if (err) return res.status(500).json({ message: "Lỗi server" });
    if (result.length === 0) {
      return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
    }

    const product = result[0];

    // Xóa sản phẩm trong DB
    Product.delete(id, (err, deleteResult) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: "Lỗi khi xóa sản phẩm" });
      }

      // Xóa ảnh nếu có
      if (product.anhSP) {
        const imagePath = path.join(process.cwd(), "../frontend/Asset", product.anhSP);
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      }

      res.json({ message: "Xóa sản phẩm thành công" });
    });
  });
};