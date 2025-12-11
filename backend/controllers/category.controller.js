import Category from "../models/Category.js";

// Lấy tất cả danh mục
export const getAllCategories = (req, res) => {
  Category.getAll((err, categories) => {
    if (err) return res.status(500).json({ message: "Lỗi server" });
    res.json({ categories });
  });
};

// Lấy danh mục theo ID
export const getCategoryById = (req, res) => {
  const { id } = req.params;
  
  Category.getById(id, (err, result) => {
    if (err) return res.status(500).json({ message: "Lỗi server" });
    if (result.length === 0) {
      return res.status(404).json({ message: "Không tìm thấy danh mục" });
    }
    res.json({ category: result[0] });
  });
};

// Thêm danh mục
export const createCategory = (req, res) => {
  const { tenDanhMuc } = req.body;
  
  if (!tenDanhMuc || !tenDanhMuc.trim()) {
    return res.status(400).json({ message: "Vui lòng nhập tên danh mục" });
  }

  const newCategory = { tenDanhMuc: tenDanhMuc.trim() };

  Category.create(newCategory, (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Lỗi khi thêm danh mục" });
    }
    res.json({ 
      message: "Thêm danh mục thành công", 
      categoryId: result.insertId 
    });
  });
};

// Cập nhật danh mục
export const updateCategory = (req, res) => {
  const { id } = req.params;
  const { tenDanhMuc } = req.body;

  if (!tenDanhMuc || !tenDanhMuc.trim()) {
    return res.status(400).json({ message: "Vui lòng nhập tên danh mục" });
  }

  const updatedCategory = { tenDanhMuc: tenDanhMuc.trim() };

  Category.update(id, updatedCategory, (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Lỗi khi cập nhật danh mục" });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Không tìm thấy danh mục" });
    }
    res.json({ message: "Cập nhật danh mục thành công" });
  });
};

// Xóa danh mục
export const deleteCategory = (req, res) => {
  const { id } = req.params;

  // Kiểm tra xem danh mục có sản phẩm không
  Category.countProducts(id, (err, result) => {
    if (err) return res.status(500).json({ message: "Lỗi server" });
    
    const productCount = result[0].count;
    if (productCount > 0) {
      return res.status(400).json({ 
        message: `Không thể xóa danh mục này vì có ${productCount} sản phẩm đang sử dụng` 
      });
    }

    // Xóa danh mục nếu không có sản phẩm
    Category.delete(id, (err, deleteResult) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: "Lỗi khi xóa danh mục" });
      }
      res.json({ message: "Xóa danh mục thành công" });
    });
  });
};