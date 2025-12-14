document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");
  let editingProductId = null;

  async function fetchData(endpoint) {
    try {
      const res = await fetch(`http://localhost:3000/api/${endpoint}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return await res.json();
    } catch (err) {
      return { error: true };
    }
  }

  // --- Render List ---
  async function renderProducts() {
    // ... (Giữ nguyên logic render cũ của bạn ở đây) ...
    // Code render cũ của bạn khá ổn, chỉ cần copy lại vào đây
    const data = await fetchData("products");
    const products = data.products || [];
    const tbody = document.querySelector("#productTable tbody");
    if (!tbody) return;
    tbody.innerHTML = "";

    if (products.length === 0) {
      tbody.innerHTML = "<tr><td colspan='6'>Chưa có sản phẩm nào</td></tr>";
      return;
    }

    const catData = await fetchData("categories");
    const categories = catData.categories || [];
    const catMap = {};
    categories.forEach(c => catMap[c.maDanhMuc] = c.tenDanhMuc);

    for (const p of products) {
      const pCats = await fetchData(`products/${p.maSP}/categories`);
      const catNames = (pCats.categories || []).map(c => catMap[c.maDanhMuc] || c.maDanhMuc);
      
      const catDisplay = catNames.length > 0 ? catNames.join(", ") : "Chưa phân loại";
      const quantityDisplay = `<span style="color:red; font-weight:bold; margin-left:10px;">(SL: ${p.tongSoLuong})</span>`;
      const imgSrc = p.anhSP ? `/Asset/${p.anhSP}` : "/Asset/no-image.jpg";

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${p.maSP}</td>
        <td>${p.tenSP}</td>
        <td>${Number(p.gia).toLocaleString()}</td>
        <td>${catDisplay} ${quantityDisplay}</td>
        <td><img src="${imgSrc}" width="50"></td>
        <td>
          <button class="edit-btn" data-id="${p.maSP}">Sửa</button>
          <button class="delete-btn" data-id="${p.maSP}">Xóa</button>
        </td>
      `;
      tbody.appendChild(tr);
    }

    document.querySelectorAll(".edit-btn").forEach(btn => 
        btn.addEventListener("click", () => editProduct(btn.dataset.id)));
    document.querySelectorAll(".delete-btn").forEach(btn => 
        btn.addEventListener("click", () => deleteProduct(btn.dataset.id)));
  }

  // --- Add/Edit Form Logic ---
  const form = document.getElementById("productForm");
  const modal = document.getElementById("productModal");
  
  // SỬA: Chọn đúng ID nút close
  const closeBtn = document.getElementById("closeProductModal"); 



 // Hàm Sửa (Đã thêm kiểm tra null để tránh lỗi)
window.editProduct = async function(id) {
    console.log("Đang sửa sản phẩm:", id);
    editingProductId = id;

    // Gọi API lấy chi tiết sản phẩm
    const data = await fetchData(`products/${id}`);
    if (!data.product) return alert("Lỗi tải sản phẩm");
    const p = data.product;

    // Cập nhật tiêu đề Modal
    const title = document.getElementById("modalTitle");
    if(title) title.innerText = "Sửa sản phẩm";

    // --- ĐIỀN DỮ LIỆU VÀO FORM (CÓ KIỂM TRA) ---
    
    // Tên sản phẩm
    const nameInput = document.getElementById("productName");
    if (nameInput) nameInput.value = p.tenSP || "";

    // Giá sản phẩm
    const priceInput = document.getElementById("productPrice");
    if (priceInput) priceInput.value = p.gia || 0;

    // Mô tả
    const descInput = document.getElementById("productDesc");
    if (descInput) descInput.value = p.moTa || "";

    // Số lượng (Đây là chỗ gây lỗi cũ nếu thiếu thẻ input)
    const stockInput = document.getElementById("productStock");
    if (stockInput) {
        stockInput.value = p.soLuong || 0;
    }

    // --- XỬ LÝ CHECKBOX SIZE ---
    // Reset toàn bộ size trước
    document.querySelectorAll('input[name="productSize"]').forEach(cb => cb.checked = false);
    // Tích chọn size đã có
    if (p.sizes && Array.isArray(p.sizes)) {
        p.sizes.forEach(s => {
            const cb = document.querySelector(`input[name="productSize"][value="${s}"]`);
            if (cb) cb.checked = true;
        });
    }

    // --- XỬ LÝ ẢNH ---
    const imgDiv = document.getElementById("currentImage");
    if (imgDiv) {
        if (p.anhSP) {
            imgDiv.innerHTML = `<img src="/Asset/${p.anhSP}" width="80" style="margin-top:5px;">`;
            imgDiv.dataset.oldimage = p.anhSP;
            imgDiv.style.display = "block";
        } else {
            imgDiv.style.display = "none";
        }
    }

    // --- XỬ LÝ DANH MỤC ---
    const pCatData = await fetchData(`products/${id}/categories`);
    const selectedIds = (pCatData.categories || []).map(c => c.maDanhMuc);
    loadCategories(selectedIds);

    // HIỆN MODAL
    const modal = document.getElementById("productModal");
    if (modal) modal.style.display = "block";
};


  // Hàm Xóa (Giữ nguyên)
  window.deleteProduct = async function(id) {
      if(!confirm("Chắc chắn xóa?")) return;
      try {
          const res = await fetch(`http://localhost:3000/api/products/${id}`, {
              method: "DELETE",
              headers: { Authorization: `Bearer ${token}` }
          });
          const d = await res.json();
          if(res.ok) { alert("Đã xóa"); renderProducts(); }
          else alert(d.message);
      } catch(e) { console.error(e); }
  };

  // --- SUBMIT FORM (QUAN TRỌNG) ---
 

const btnSave = document.getElementById("btnSaveProduct");

if (btnSave) {
    btnSave.addEventListener("click", async () => {
        // 1. Tự kiểm tra dữ liệu bắt buộc (Validation)
        const form = document.getElementById("productForm");
        if (!form.checkValidity()) {
            form.reportValidity(); // Hiển thị thông báo lỗi của trình duyệt nếu thiếu dữ liệu
            return; // Dừng lại, không gửi
        }

        // 2. Lấy dữ liệu (Code cũ giữ nguyên logic này)
        const formData = new FormData();
        formData.append("tenSP", document.getElementById("productName").value);
        formData.append("gia", document.getElementById("productPrice").value);
        formData.append("moTa", document.getElementById("productDesc").value);
        formData.append("soLuong", 0); // Hoặc lấy từ input nếu có

        // Lấy Categories
        const cats = [];
        document.querySelectorAll("#productCategoriesContainer input:checked").forEach(cb => cats.push(cb.value));
        formData.append("categories", JSON.stringify(cats));

        // Lấy Size
        const sizes = [];
        document.querySelectorAll('input[name="productSize"]:checked').forEach(cb => sizes.push(cb.value));
        formData.append("sizes", JSON.stringify(sizes));

        // Lấy Ảnh
        const file = document.getElementById("productImage").files[0];
        if (file) formData.append("anhSP", file);
        if (editingProductId) {
            const old = document.getElementById("currentImage")?.dataset.oldimage;
            if (old) formData.append("oldImage", old);
        }

        // 3. Gửi API
        const url = editingProductId 
            ? `http://localhost:3000/api/products/${editingProductId}` 
            : "http://localhost:3000/api/products";
        const method = editingProductId ? "PUT" : "POST";

        try {
            const res = await fetch(url, {
                method: method,
                headers: { Authorization: `Bearer ${token}` }, // Bỏ Content-Type vì FormData tự lo
                body: formData
            });

            if (res.ok) {
                alert("Thành công!");
                document.getElementById("productModal").style.display = "none";
                renderProducts(); // Tải lại danh sách
            } else {
                const d = await res.json();
                alert(d.message || "Có lỗi xảy ra");
            }
        } catch (err) {
            console.error(err);
            alert("Lỗi kết nối server");
        }
    });
}

  // Helper functions
  async function loadCategories(selectedIds = []) {
      const data = await fetchData("categories");
      const container = document.getElementById("productCategoriesContainer");
      container.innerHTML = "";
      (data.categories || []).forEach(c => {
          const div = document.createElement("div");
          div.className = "checkbox-wrapper"; // Dùng class css đã có
          div.innerHTML = `
            <input type="checkbox" id="cat_${c.maDanhMuc}" value="${c.maDanhMuc}" 
              ${selectedIds.includes(c.maDanhMuc) ? "checked" : ""}>
            <label for="cat_${c.maDanhMuc}">${c.tenDanhMuc}</label>
          `;
          container.appendChild(div);
      });
  }

  // Nút Thêm sản phẩm
  const addBtn = document.getElementById("addProductBtn");
  if(addBtn) addBtn.onclick = () => {
      editingProductId = null;
      form.reset();
      document.getElementById("currentImage").style.display = "none";
      document.getElementById("modalTitle").innerText = "Thêm sản phẩm";
      
      // Reset checkboxes size
      document.querySelectorAll('input[name="productSize"]').forEach(cb => cb.checked = false);
      
      loadCategories([]);
      modal.style.display = "block";
  };

  // Nút Đóng Modal (Đã sửa selector ở trên)
  if(closeBtn) {
      closeBtn.onclick = () => {
          modal.style.display = "none";
      }
  }

  // Click ngoài biên để đóng
  window.addEventListener("click", (e) => {
      if (e.target === modal) {
          modal.style.display = "none";
      }
  });

  // Init
  // Kiểm tra xem tab hiện tại có phải products không để render
  const activeTab = localStorage.getItem("activeTab");
  if (activeTab === 'products') {
      renderProducts();
  }
  
  // Lắng nghe sự kiện click vào tab Products để render lại (vì userManage chỉ show div)
  const productTabBtn = document.querySelector('li[data-tab="products"]');
  if(productTabBtn) {
      productTabBtn.addEventListener('click', () => {
          renderProducts();
      });
  }
});
