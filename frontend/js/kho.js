document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");

  if (!token) {
    alert("Bạn chưa đăng nhập!");
    window.location.href = "/html/login.html";
    return;
  }

  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      window.location.href = "/html/index.html";
    });
  }

  let currentEditingProductId = null;

  // ------------------- FETCH API -------------------
  async function fetchData(endpoint) {
    try {
      const res = await fetch(`http://localhost:3000/api/kho${endpoint}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) {
        alert("Hết phiên đăng nhập!");
        window.location.href = "/html/login.html";
        return;
      }
      return await res.json();
    } catch (err) {
      console.error("Fetch Error:", err);
      return { products: [] };
    }
  }

  // ------------------- RENDER LIST -------------------
  async function renderKho() {
    const searchInput = document.getElementById("searchInput");
    const search = searchInput ? searchInput.value : "";
    
    // Gọi API (API đã được sửa để trả về danh sách gom nhóm)
    const data = await fetchData(`?search=${search}`);

    const tbody = document.querySelector("#khoTable tbody");
    if (!tbody) return;
    tbody.innerHTML = "";

    if (!data.products || data.products.length === 0) {
        tbody.innerHTML = "<tr><td colspan='6'>Không tìm thấy sản phẩm nào</td></tr>";
        return;
    }

    data.products.forEach((sp) => {
      const imgSrc = sp.anhSP ? `/Asset/${sp.anhSP}` : "/Asset/no-image.jpg";
      
      // Tạo chuỗi tóm tắt size (Ví dụ: S:10 M:5)
      let sizeSummary = '<span style="color:#999; font-style:italic;">Chưa có size</span>';
      if (sp.sizes && sp.sizes.length > 0) {
          sizeSummary = sp.sizes.map(s => 
              `<span class="size-badge">${s.tenSize}: <b>${s.soLuongTon}</b></span>`
          ).join(" ");
      }

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${sp.maSP}</td>
        <td><img src="${imgSrc}" width="50" style="object-fit:cover; border-radius:4px;"></td>
        <td>${sp.tenSP}</td>
        <td style="font-weight:bold; color: #2ecc71;">${sp.tongTonKho}</td>
        <td>${sizeSummary}</td>
        <td>
          <button class="edit-btn" style="cursor:pointer; padding:5px 10px;">Sửa kho</button>
        </td>
      `;
      
      // Gán dữ liệu vào nút Sửa để dùng khi click
      const editBtn = tr.querySelector(".edit-btn");
      editBtn.productData = sp; // Lưu toàn bộ object sp vào nút

      tbody.appendChild(tr);
    });

    attachEditEvents();
  }

  // ------------------- SỰ KIỆN NÚT SỬA -------------------
  function attachEditEvents() {
    document.querySelectorAll(".edit-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const sp = e.target.productData;
        currentEditingProductId = sp.maSP;

        const modal = document.getElementById("editModal");
        const container = document.getElementById("sizeInputsContainer");
        const title = document.getElementById("modalTitle");

        title.innerText = `Cập nhật: ${sp.tenSP}`;
        container.innerHTML = "";

        if (!sp.sizes || sp.sizes.length === 0) {
            container.innerHTML = "<p>Sản phẩm này chưa được cấu hình Size bên Admin.</p>";
        } else {
            // Tạo ô input cho từng size
            sp.sizes.forEach(s => {
                const div = document.createElement("div");
                div.className = "input-group-row";
                div.innerHTML = `
                    <label>Size ${s.tenSize}</label>
                    <input type="number" class="qty-input" 
                           data-size-id="${s.maSize}" 
                           value="${s.soLuongTon}" min="0">
                `;
                container.appendChild(div);
            });
        }

        modal.style.display = "block";
      });
    });
  }

  // ------------------- LƯU CẬP NHẬT -------------------
  const saveBtn = document.getElementById("saveEditBtn");
  if (saveBtn) {
    saveBtn.addEventListener("click", async () => {
        // 1. Thu thập dữ liệu từ các ô input trong modal
        const inputs = document.querySelectorAll("#sizeInputsContainer .qty-input");
        const inventoryUpdate = [];

        inputs.forEach(inp => {
            inventoryUpdate.push({
                maSize: parseInt(inp.dataset.sizeId),
                soLuong: parseInt(inp.value) || 0
            });
        });

        if (inventoryUpdate.length === 0) return;

        // 2. Gửi về server
        try {
            const res = await fetch(`http://localhost:3000/api/kho/${currentEditingProductId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ inventory: inventoryUpdate })
            });

            const data = await res.json();
            if (res.ok) {
                alert("Cập nhật thành công!");
                document.getElementById("editModal").style.display = "none";
                renderKho(); // Load lại bảng
            } else {
                alert("Lỗi: " + data.error);
            }
        } catch (err) {
            console.error(err);
            alert("Lỗi kết nối server");
        }
    });
  }

  // ------------------- MODAL EVENTS -------------------
  const modal = document.getElementById("editModal");
  const closeBtn = document.getElementById("closeModal");
  if (closeBtn) {
      closeBtn.onclick = () => modal.style.display = "none";
  }
  window.onclick = (e) => {
      if (e.target == modal) modal.style.display = "none";
  }

  // ------------------- TÌM KIẾM -------------------
  const searchBtn = document.getElementById("searchBtn");
  if(searchBtn) searchBtn.onclick = () => renderKho();

  // Chạy lần đầu
  renderKho();
});