import Product from "../models/Product.js";
import path from "path";
import fs from "fs";

// ... (Giữ nguyên getProducts) ...
export const getProducts = (req, res) => {
  Product.getAll((err, result) => {
    if (err) {
      console.error("Lỗi lấy danh sách:", err);
      return res.status(500).json({ message: "Lỗi server" });
    }
    res.json({ products: result });
  });
};

// ... (SỬA HÀM getProductById) ...
export const getProductById = (req, res) => {
  const { id } = req.params;
  Product.getById(id, (err, result) => {
    if (err) return res.status(500).json({ message: "Lỗi server" });
    if (!result || result.length === 0) return res.status(404).json({ message: "Không tìm thấy" });

    // Gom nhóm sizes
    const firstRow = result[0];
    const product = {
        maSP: firstRow.maSP,
        tenSP: firstRow.tenSP,
        gia: firstRow.gia,
        moTa: firstRow.moTa,
        anhSP: firstRow.anhSP,
        sizes: [] // Chúng ta sẽ chứa danh sách tên size: ['S', 'M', 'L']
    };
    
   // --- SỬA ĐOẠN NÀY ---
    let totalStock = 0;
    result.forEach(row => {
        if (row.tenSize) { 
            // Thay vì chỉ push tên, hãy push cả OBJECT chứa thông tin size
            // Frontend cần maSize để thêm vào giỏ, và soLuongTon để kiểm tra kho
            product.sizes.push({
                maSize: row.maSize,         // Cần cái này để thêm vào giỏ hàng
                tenSize: row.tenSize,       // Cần cái này để hiển thị tên (S, M)
                soLuongTon: row.soLuongTon  // Cần cái này để check disable nút nếu hết hàng
            });
            totalStock += row.soLuongTon;
        }
    });
    // --------------------

    // Lấy số lượng đại diện
    product.soLuong = result.length > 0 && result[0].soLuongTon ? result[0].soLuongTon : 0;

    res.json({ product });
  });
};

// ... (Giữ nguyên getProductCategories) ...
export const getProductCategories = (req, res) => {
  const { id } = req.params;
  Product.getCategories(id, (err, result) => {
    if (err) return res.status(500).json({ message: "Lỗi server" });
    res.json({ categories: result });
  });
};

// ====================== THÊM SẢN PHẨM (ĐÃ SỬA) ===========================
export const createProduct = (req, res) => {
  // Lấy thêm biến sizes từ body
  const { tenSP, gia, moTa, categories, soLuong, sizes } = req.body; 
  
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

    // --- PHẦN SỬA ĐỔI QUAN TRỌNG: XỬ LÝ SIZE ---
    // Thay vì fix cứng [1,2,3,4,5], ta lấy từ biến sizes frontend gửi lên
    if (sizes) {
        let sizeArray = [];
        try { 
            sizeArray = JSON.parse(sizes); // Chuyển chuỗi '["S", "M"]' thành mảng
        } catch (e) { sizeArray = []; }

        if (Array.isArray(sizeArray) && sizeArray.length > 0) {
            // Gọi hàm Model mới để lưu vào ChiTietSanPham
            Product.addSizeByName(productId, sizeArray, stockQty, (err) => {
                if (err) console.error("Lỗi tạo kho size:", err);
            });
        }
    }
    // ---------------------------------------------

    if (categories) {
      let categoryIds = [];
      try { categoryIds = JSON.parse(categories); } catch (e) { categoryIds = []; }
      if (Array.isArray(categoryIds)) {
        categoryIds.forEach((catId) => Product.addCategory(productId, catId, () => {}));
      }
    }

    res.json({ message: "Thêm sản phẩm thành công", productId });
  });
};

// ====================== CẬP NHẬT SẢN PHẨM (ĐÃ SỬA) ===========================
export const updateProduct = (req, res) => {
  const { id } = req.params;
  // Lấy thêm sizes
  const { tenSP, gia, moTa, categories, oldImage, soLuong, sizes } = req.body;

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
      } catch (err) { console.error("Không xóa được ảnh cũ:", err.message); }
    }
  }

  const updatedProduct = { tenSP, gia: parseInt(gia), moTa: moTa || "", anhSP };

  Product.update(id, updatedProduct, (err, result) => {
    if (err) {
      console.error("Lỗi update SP:", err);
      return res.status(500).json({ message: "Lỗi khi cập nhật sản phẩm" });
    }

    const stockQty = parseInt(soLuong) || 0;

    // --- PHẦN SỬA ĐỔI QUAN TRỌNG: UPDATE SIZE ---
    if (sizes) {
        let sizeArray = [];
        try { sizeArray = JSON.parse(sizes); } catch (e) {}

        // 1. Xóa hết size cũ của SP này trong bảng ChiTietSanPham
        Product.removeAllSizes(id, (err) => {
            if (!err) {
                 // 2. Thêm lại size mới user vừa chọn
                 if (Array.isArray(sizeArray) && sizeArray.length > 0) {
                    Product.addSizeByName(id, sizeArray, stockQty, (err) => {
                        if(err) console.error("Lỗi thêm lại size mới:", err);
                    });
                 }
            }
        });
    } else {
        // Nếu không gửi size (hoặc gửi rỗng), có thể logic của bạn là giữ nguyên
        // hoặc cập nhật lại số lượng tồn kho cho các size hiện có
        Product.updateInventory(id, stockQty, (err) => {
             if(err) console.error("Lỗi update kho:", err);
        });
    }
    // -----------------------------------------------

    if (categories) {
      let categoryIds = [];
      try { categoryIds = JSON.parse(categories); } catch (e) {}
      Product.removeAllCategories(id, (err) => {
        if (!err && Array.isArray(categoryIds)) {
          categoryIds.forEach((catId) => Product.addCategory(id, catId, () => {}));
        }
      });
    }

    res.json({ message: "Cập nhật sản phẩm thành công" });
  });
};

// ... (Giữ nguyên deleteProduct) ...
export const deleteProduct = (req, res) => {
  const { id } = req.params;
  Product.getById(id, (err, result) => {
    if (err) return res.status(500).json({ message: "Lỗi server" });
    if (!result || result.length === 0) return res.status(404).json({ message: "Không tìm thấy" });

    const product = result[0];
    Product.delete(id, (err, deleteResult) => {
      if (err) {
        if (err.code === 'ER_ROW_IS_REFERENCED_2') {
            return res.status(400).json({ message: "Không thể xóa: Sản phẩm đang có đơn hàng." });
        }
        return res.status(500).json({ message: "Lỗi xóa sản phẩm" });
      }
      if (product.anhSP) {
        try {
            const imagePath = path.join(process.cwd(), "../frontend/Asset", product.anhSP);
            if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
        } catch (e) {}
      }
      res.json({ message: "Xóa sản phẩm thành công" });
    });
  });
};