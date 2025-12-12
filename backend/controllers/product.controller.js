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
    // Dữ liệu sizes trả về từ JSON_ARRAYAGG có thể là string hoặc object tùy driver
    const product = result[0];
    if (typeof product.sizes === 'string') {
        product.sizes = JSON.parse(product.sizes);
    }
    // Lọc bỏ null nếu sản phẩm chưa có size nào
    if (product.sizes && product.sizes[0].maSize === null) {
        product.sizes = [];
    }
    res.json({ product });
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
  // Lấy thêm inventory từ body nếu có, dạng JSON string
  const { tenSP, gia, moTa, categories, inventory } = req.body; 
  
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

    // Xử lý Size/Kho (Mặc định tạo 6 size cơ bản với số lượng 0 nếu không có input)
    let inventoryData = [];
    if (inventory) {
        try { inventoryData = JSON.parse(inventory); } catch(e) {}
    } else {
        // Mặc định tạo 6 size (ID 1->6) với số lượng 0
        inventoryData = [1,2,3,4,5,6].map(id => ({ maSize: id, soLuongTon: 0 }));
    }
    
    Product.initInventory(productId, inventoryData, (err) => {
        if(err) console.error("Lỗi tạo kho:", err);
    });

    // Xử lý danh mục
    if (categories) {
      let categoryIds = [];
      try { categoryIds = JSON.parse(categories); } catch (e) {}
      if (Array.isArray(categoryIds)) {
        categoryIds.forEach((catId) => Product.addCategory(productId, catId, () => {}));
      }
    }

    res.json({ message: "Thêm sản phẩm thành công", productId });
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