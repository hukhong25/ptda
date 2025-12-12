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
    const data = await fetchData("products");
    const products = data.products || [];
    const tbody = document.querySelector("#productTable tbody");
    if (!tbody) return;
    tbody.innerHTML = "";

    if (products.length === 0) {
      tbody.innerHTML = "<tr><td colspan='6'>Chưa có sản phẩm nào</td></tr>";
      return;
    }

    // Lấy map tên danh mục
    const catData = await fetchData("categories");
    const categories = catData.categories || [];
    const catMap = {};
    categories.forEach(c => catMap[c.maDanhMuc] = c.tenDanhMuc);

    for (const p of products) {
      const pCats = await fetchData(`products/${p.maSP}/categories`);
      const catNames = (pCats.categories || []).map(c => catMap[c.maDanhMuc] || c.maDanhMuc);
      
      // SỬA: Hiển thị danh mục kèm số lượng
      // p.tongSoLuong được lấy từ API getProducts (đã sửa ở Model)
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

    // Gắn sự kiện
    document.querySelectorAll(".edit-btn").forEach(btn => 
        btn.addEventListener("click", () => editProduct(btn.dataset.id)));
    document.querySelectorAll(".delete-btn").forEach(btn => 
        btn.addEventListener("click", () => deleteProduct(btn.dataset.id)));
  }

  // --- Add/Edit Form ---
  const form = document.getElementById("productForm");
  const modal = document.getElementById("productModal");
  
  // Hàm Sửa
  window.editProduct = async function(id) {
      editingProductId = id;
      const data = await fetchData(`products/${id}`);
      if(!data.product) return alert("Lỗi tải sản phẩm");
      const p = data.product;

      document.getElementById("modalTitle").innerText = "Sửa sản phẩm";
      document.getElementById("productName").value = p.tenSP;
      document.getElementById("productPrice").value = p.gia;
      document.getElementById("productDesc").value = p.moTa;
      // Hiển thị số lượng (lấy từ API detail đã sửa)
      document.getElementById("productStock").value = p.soLuong || 0; 

      // Ảnh cũ
      const imgDiv = document.getElementById("currentImage");
      if(p.anhSP) {
          imgDiv.innerHTML = `<img src="/Asset/${p.anhSP}" width="80">`;
          imgDiv.dataset.oldimage = p.anhSP;
          imgDiv.style.display = "block";
      } else {
          imgDiv.style.display = "none";
      }

      // Load categories
      const pCatData = await fetchData(`products/${id}/categories`);
      const selectedIds = (pCatData.categories || []).map(c => c.maDanhMuc);
      loadCategories(selectedIds);

      modal.style.display = "block";
  };

  // Hàm Xóa
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

  // Submit Form
  if (form) {
      form.addEventListener("submit", async (e) => {
          e.preventDefault();
          const formData = new FormData();
          formData.append("tenSP", document.getElementById("productName").value);
          formData.append("gia", document.getElementById("productPrice").value);
          formData.append("moTa", document.getElementById("productDesc").value);
          formData.append("soLuong", document.getElementById("productStock").value); // Gửi số lượng lên

          const cats = [];
          document.querySelectorAll("#productCategoriesContainer input:checked").forEach(cb => cats.push(cb.value));
          formData.append("categories", JSON.stringify(cats));

          const file = document.getElementById("productImage").files[0];
          if(file) formData.append("anhSP", file);
          if(editingProductId) {
              const old = document.getElementById("currentImage")?.dataset.oldimage;
              if(old) formData.append("oldImage", old);
          }

          const url = editingProductId ? `http://localhost:3000/api/products/${editingProductId}` : "http://localhost:3000/api/products";
          const method = editingProductId ? "PUT" : "POST";

          try {
              const res = await fetch(url, {
                  method: method,
                  headers: { Authorization: `Bearer ${token}` },
                  body: formData
              });
              if(res.ok) {
                  alert("Thành công!");
                  modal.style.display = "none";
                  renderProducts();
              } else {
                  const d = await res.json();
                  alert(d.message);
              }
          } catch(err) { console.error(err); }
      });
  }

  // Helper functions
  async function loadCategories(selectedIds = []) {
      const data = await fetchData("categories");
      const container = document.getElementById("productCategoriesContainer");
      container.innerHTML = "";
      (data.categories || []).forEach(c => {
          const div = document.createElement("div");
          div.innerHTML = `
            <input type="checkbox" id="cat_${c.maDanhMuc}" value="${c.maDanhMuc}" 
              ${selectedIds.includes(c.maDanhMuc) ? "checked" : ""}>
            <label for="cat_${c.maDanhMuc}">${c.tenDanhMuc}</label>
          `;
          container.appendChild(div);
      });
  }

  const addBtn = document.getElementById("addProductBtn");
  const closeBtn = document.querySelector(".close");
  if(addBtn) addBtn.onclick = () => {
      editingProductId = null;
      form.reset();
      document.getElementById("currentImage").style.display = "none";
      document.getElementById("modalTitle").innerText = "Thêm sản phẩm";
      loadCategories([]);
      modal.style.display = "block";
  };
  if(closeBtn) closeBtn.onclick = () => modal.style.display = "none";

  renderProducts();
});