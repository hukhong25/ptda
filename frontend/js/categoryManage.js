// ===============================
// CATEGORY MANAGEMENT - STANDALONE
// ===============================

document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");
  
  if (!token) {
    return; // Đã được kiểm tra ở userManage.js
  }

  let editingCategoryId = null;

  // ------------------- FETCH API -------------------
  async function fetchData(endpoint) {
    try {
      const res = await fetch(`http://localhost:3000/api/${endpoint}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return await res.json();
    } catch (err) {
      console.error("Fetch error:", err);
      return { error: true };
    }
  }

  // ------------------- RENDER CATEGORIES -------------------
  async function renderCategories() {
    const data = await fetchData("categories");
    const categories = data.categories || [];

    const tbody = document.querySelector("#categoryTable tbody");
    if (!tbody) return; // Tab chưa được hiển thị

    tbody.innerHTML = "";

    if (categories.length === 0) {
      tbody.innerHTML = "<tr><td colspan='3' style='text-align:center'>Chưa có danh mục nào</td></tr>";
      return;
    }

    categories.forEach((c) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${c.maDanhMuc}</td>
        <td>${c.tenDanhMuc}</td>
        <td>
          <button class="action-btn edit-btn" data-id="${c.maDanhMuc}">Sửa</button>
          <button class="action-btn delete-btn" data-id="${c.maDanhMuc}">Xóa</button>
        </td>`;
      tbody.appendChild(tr);
    });

    // Gắn sự kiện cho các nút
    attachEventListeners();
  }

  // ------------------- GẮN SỰ KIỆN -------------------
  function attachEventListeners() {
    // Nút sửa
    document.querySelectorAll("#categoryTable .edit-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const id = parseInt(e.target.dataset.id);
        editCategory(id);
      });
    });

    // Nút xóa
    document.querySelectorAll("#categoryTable .delete-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const id = parseInt(e.target.dataset.id);
        deleteCategory(id);
      });
    });
  }

  // ------------------- MODAL DANH MỤC -------------------
  const categoryModal = document.getElementById("categoryModal");
  const addCategoryBtn = document.getElementById("addCategoryBtn");
  const closeCategoryBtn = document.getElementById("closeCategoryModal");
  const categoryForm = document.getElementById("categoryForm");
  const categoryModalTitle = document.getElementById("categoryModalTitle");

  // Mở modal thêm
  if (addCategoryBtn) {
    addCategoryBtn.addEventListener("click", () => {
      if (categoryModal) {
        categoryModal.style.display = "block";
        categoryModalTitle.innerText = "Thêm danh mục";
        categoryForm.reset();
        editingCategoryId = null;
      }
    });
  }

  // Đóng modal
  if (closeCategoryBtn) {
    closeCategoryBtn.addEventListener("click", () => {
      if (categoryModal) {
        categoryModal.style.display = "none";
        categoryForm.reset();
        editingCategoryId = null;
      }
    });
  }

  // Click ngoài modal để đóng
  window.addEventListener("click", (e) => {
    if (e.target === categoryModal) {
      categoryModal.style.display = "none";
      categoryForm.reset();
      editingCategoryId = null;
    }
  });

  // ------------------- SUBMIT FORM (THÊM/SỬA) -------------------
  if (categoryForm) {
    categoryForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const tenDanhMuc = document.getElementById("categoryName").value.trim();

      if (!tenDanhMuc) {
        alert("Vui lòng nhập tên danh mục!");
        return;
      }

      try {
        const url = editingCategoryId
          ? `http://localhost:3000/api/categories/${editingCategoryId}`
          : "http://localhost:3000/api/categories";

        const method = editingCategoryId ? "PUT" : "POST";

        const res = await fetch(url, {
          method,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ tenDanhMuc }),
        });

        const data = await res.json();

        if (!res.ok) {
          alert(data.message || "Có lỗi xảy ra");
          return;
        }

        alert(data.message || "Thành công");
        categoryModal.style.display = "none";
        categoryForm.reset();
        editingCategoryId = null;
        renderCategories();
      } catch (err) {
        console.error("Submit category error:", err);
        alert("Lỗi khi lưu danh mục");
      }
    });
  }

  // ------------------- SỬA DANH MỤC -------------------
  async function editCategory(id) {
    editingCategoryId = id;

    const data = await fetchData(`categories/${id}`);
    if (data.error || !data.category) {
      alert("Không tìm thấy danh mục");
      return;
    }

    const category = data.category;
    document.getElementById("categoryName").value = category.tenDanhMuc;

    categoryModalTitle.innerText = "Sửa danh mục";
    categoryModal.style.display = "block";
  }

  // ------------------- XÓA DANH MỤC -------------------
  async function deleteCategory(id) {
    if (!confirm("Bạn có chắc muốn xóa danh mục này?")) return;

    try {
      const res = await fetch(`http://localhost:3000/api/categories/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Xóa thất bại");
        return;
      }

      alert(data.message || "Xóa thành công");
      renderCategories();
    } catch (err) {
      console.error("Delete category error:", err);
      alert("Lỗi khi xóa danh mục");
    }
  }

  // ------------------- LẮNG NGHE CHUYỂN TAB -------------------
  // Khi user click vào tab categories, render lại dữ liệu
  const categoryTab = document.querySelector('[data-tab="categories"]');
  if (categoryTab) {
    categoryTab.addEventListener("click", () => {
      // Đợi một chút để DOM cập nhật
      setTimeout(() => {
        renderCategories();
      }, 100);
    });
  }

  // ------------------- KHỞI TẠO -------------------
  // Nếu tab categories đang active thì render ngay
  const categoriesContent = document.getElementById("categories");
  if (categoriesContent && categoriesContent.style.display !== "none") {
    renderCategories();
  }
});