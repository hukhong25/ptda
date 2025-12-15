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
      console.error("Fetch error:", err);
      return { error: true };
    }
  }

  // ================= Render danh sách sản phẩm =================
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

    const catData = await fetchData("categories");
    const categories = catData.categories || [];
    const catMap = {};
    categories.forEach((c) => (catMap[c.maDanhMuc] = c.tenDanhMuc));

    for (const p of products) {
      const pCats = await fetchData(`products/${p.maSP}/categories`);
      const catNames = (pCats.categories || []).map(
        (c) => catMap[c.maDanhMuc] || c.maDanhMuc
      );
      const catDisplay =
        catNames.length > 0 ? catNames.join(", ") : "Chưa phân loại";
      const imgSrc = p.anhSP ? `/Asset/${p.anhSP}` : "/Asset/no-image.jpg";

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${p.maSP}</td>
        <td>${p.tenSP}</td>
        <td>${Number(p.gia).toLocaleString()}</td>
        <td>${catDisplay}</td>
        <td><img src="${imgSrc}" width="50"></td>
        <td>
          <button class="edit-btn" data-id="${p.maSP}">Sửa</button>
          <button class="delete-btn" data-id="${p.maSP}">Xóa</button>
        </td>
      `;
      tbody.appendChild(tr);
    }

    // Gán sự kiện sửa/xóa
    document
      .querySelectorAll(".edit-btn")
      .forEach((btn) =>
        btn.addEventListener("click", () => editProduct(btn.dataset.id))
      );
    document
      .querySelectorAll(".delete-btn")
      .forEach((btn) =>
        btn.addEventListener("click", () => deleteProduct(btn.dataset.id))
      );
  }

  // ================= Hàm load categories =================
  async function loadCategories(selectedIds = []) {
    const data = await fetchData("categories");
    const container = document.getElementById("productCategoriesContainer");
    if (!container) return;
    container.innerHTML = "";

    (data.categories || []).forEach((c) => {
      const div = document.createElement("div");
      div.className = "checkbox-wrapper";
      div.innerHTML = `
        <input type="checkbox" id="cat_${c.maDanhMuc}" value="${c.maDanhMuc}"
          ${selectedIds.includes(c.maDanhMuc) ? "checked" : ""}>
        <label for="cat_${c.maDanhMuc}">${c.tenDanhMuc}</label>
      `;
      container.appendChild(div);
    });
  }

  // ================= Hàm load sizes =================
  async function loadSizes(selectedSizes = []) {
    const container = document.getElementById("productSizeContainer");
    if (!container) return;
    container.innerHTML = "";

    try {
      const res = await fetch("http://localhost:3000/api/sizes", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      const sizes = data.sizes || [];

      sizes.forEach((s) => {
        const sId = s.maSize.toString();
        const div = document.createElement("div");
        div.className = "checkbox-wrapper";
        div.innerHTML = `
          <input type="checkbox"
            name="productSize"
            id="size_${sId}"
            value="${sId}"
            ${selectedSizes.includes(sId) ? "checked" : ""}>
          <label for="size_${sId}">${s.tenSize}</label>
        `;
        container.appendChild(div);
      });
    } catch (err) {
      console.error("Lỗi lấy size:", err);
    }
  }

  // ================= Thêm / Sửa sản phẩm =================
  const form = document.getElementById("productForm");
  const modal = document.getElementById("productModal");
  const closeBtn = document.getElementById("closeProductModal");

  window.editProduct = async function (id) {
    editingProductId = id;
    const data = await fetchData(`products/${id}`);
    if (!data.product) return alert("Lỗi tải sản phẩm");
    const p = data.product;

    document.getElementById("modalTitle").innerText = "Sửa sản phẩm";
    document.getElementById("productName").value = p.tenSP;
    document.getElementById("productPrice").value = p.gia;
    document.getElementById("productDesc").value = p.moTa;

    // Lấy size đã có
    const sizeData = await fetchData(`products/${id}/sizes`);
    const selectedSizes = (sizeData.sizes || []).map((s) =>
      s.maSize.toString()
    );
    await loadSizes(selectedSizes); // quan trọng phải await

    // Ảnh cũ
    const imgDiv = document.getElementById("currentImage");
    if (p.anhSP) {
      imgDiv.innerHTML = `<img src="/Asset/${p.anhSP}" width="80">`;
      imgDiv.dataset.oldimage = p.anhSP;
      imgDiv.style.display = "block";
    } else imgDiv.style.display = "none";

    // Load categories
    const pCatData = await fetchData(`products/${id}/categories`);
    const selectedIds = (pCatData.categories || []).map((c) => c.maDanhMuc);
    loadCategories(selectedIds);

    modal.style.display = "block";
  };

  // ================= Xóa sản phẩm =================
  window.deleteProduct = async function (id) {
    if (!confirm("Chắc chắn xóa?")) return;
    try {
      const res = await fetch(`http://localhost:3000/api/products/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const d = await res.json();
      if (res.ok) {
        alert("Đã xóa");
        renderProducts();
      } else alert(d.message);
    } catch (e) {
      console.error(e);
    }
  };

  // ================= Submit form =================
  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const formData = new FormData();
      formData.append("tenSP", document.getElementById("productName").value);
      formData.append("gia", document.getElementById("productPrice").value);
      formData.append("moTa", document.getElementById("productDesc").value);

      // Categories
      const cats = [];
      document
        .querySelectorAll("#productCategoriesContainer input:checked")
        .forEach((cb) => cats.push(cb.value));
      formData.append("categories", JSON.stringify(cats));

      // Sizes
      const sizes = [];
      document
        .querySelectorAll('input[name="productSize"]:checked')
        .forEach((cb) =>
          sizes.push({ maSize: parseInt(cb.value), soLuongTon: 0 })
        );
      formData.append("sizes", JSON.stringify(sizes));

      // Ảnh
      const file = document.getElementById("productImage").files[0];
      if (file) formData.append("anhSP", file);
      if (editingProductId) {
        const old = document.getElementById("currentImage")?.dataset.oldimage;
        if (old) formData.append("oldImage", old);
      }

      const url = editingProductId
        ? `http://localhost:3000/api/products/${editingProductId}`
        : "http://localhost:3000/api/products";
      const method = editingProductId ? "PUT" : "POST";

      try {
        const res = await fetch(url, {
          method,
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });
        if (res.ok) {
          alert("Thành công!");
          modal.style.display = "none";
          renderProducts();
        } else {
          const d = await res.json();
          alert(d.message || "Có lỗi xảy ra");
        }
      } catch (err) {
        console.error(err);
        alert("Lỗi kết nối");
      }
    });
  }

  // ================= Thêm sản phẩm =================
  const addBtn = document.getElementById("addProductBtn");
  if (addBtn)
    addBtn.onclick = () => {
      editingProductId = null;
      form.reset();
      document.getElementById("currentImage").style.display = "none";
      document.getElementById("modalTitle").innerText = "Thêm sản phẩm";
      loadSizes([]);
      loadCategories([]);
      modal.style.display = "block";
    };

  // ================= Đóng modal =================
  if (closeBtn) closeBtn.onclick = () => (modal.style.display = "none");
  window.addEventListener("click", (e) => {
    if (e.target === modal) modal.style.display = "none";
  });

  // ================= Init =================
  const activeTab = localStorage.getItem("activeTab");
  if (activeTab === "products") renderProducts();
  const productTabBtn = document.querySelector('li[data-tab="products"]');
  if (productTabBtn)
    productTabBtn.addEventListener("click", () => renderProducts());
});
