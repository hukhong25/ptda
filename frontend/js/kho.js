document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");

  if (!token) {
    alert("Bạn chưa đăng nhập!");
    window.location.href = "/login.html";
    return;
  }

  const logoutBtn = document.getElementById("logoutBtn");

  // ------------------- LOGOUT -------------------
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      window.location.href = "/html/index.html";
    });
  }

  // ------------------- FETCH API -------------------
  async function fetchData(endpoint) {
    try {
      const res = await fetch(`http://localhost:3000/api/kho${endpoint}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) {
        alert("Token hết hạn, vui lòng đăng nhập lại!");
        localStorage.clear();
        window.location.href = "/login.html";
        return;
      }
      return await res.json();
    } catch (err) {
      console.error("Fetch Error:", err);
      return { products: [] };
    }
  }

  // ------------------- RENDER KHO -------------------
  async function renderKho() {
    const search = document.getElementById("searchInput").value;
    const data = await fetchData(`?search=${search}`);

    const tbody = document.querySelector("#khoTable tbody");
    tbody.innerHTML = "";

    (data.products || []).forEach((sp) => {
      const imgSrc = sp.anhSP ? `/Asset/${sp.anhSP}` : "/Asset/no-image.jpg";

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${sp.maSP}</td>
        <td><img src="${imgSrc}" width="60"></td>
        <td>${sp.tenSP}</td>
        <td>${sp.soLuong}</td>
        <td>
          <button class="edit-btn" data-id="${sp.maSP}" data-qty="${sp.soLuong}">
            Sửa số lượng
          </button>
        </td>
      `;
      tbody.appendChild(tr);
    });

    initEditButtons();
  }

  // ------------------- GÁN SỰ KIỆN EDIT -------------------
  function initEditButtons() {
    document.querySelectorAll(".edit-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.dataset.id;
        const qty = btn.dataset.qty;

        document.getElementById("editQty").value = qty;
        document.getElementById("saveEditBtn").dataset.id = id;

        document.getElementById("editModal").style.display = "block";
      });
    });
  }

  // ------------------- ĐÓNG MODAL -------------------
  const closeModalBtn = document.getElementById("closeModal");
  if (closeModalBtn) {
    closeModalBtn.addEventListener("click", () => {
      document.getElementById("editModal").style.display = "none";
    });
  }

  // ------------------- LƯU SỬA -------------------
  const saveEditBtn = document.getElementById("saveEditBtn");
  if (saveEditBtn) {
    saveEditBtn.addEventListener("click", async () => {
      const id = saveEditBtn.dataset.id;
      const soLuong = document.getElementById("editQty").value;

      try {
        const res = await fetch(`http://localhost:3000/api/kho/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ soLuong }),
        });

        const data = await res.json();
        alert(data.message || "Cập nhật thành công");

        document.getElementById("editModal").style.display = "none";
        renderKho();
      } catch (err) {
        console.error("Update kho lỗi:", err);
        alert("Lỗi khi cập nhật số lượng");
      }
    });
  }

  // ------------------- TÌM KIẾM -------------------
  const searchBtn = document.getElementById("searchBtn");
  if (searchBtn) {
    searchBtn.addEventListener("click", () => renderKho());
  }

  // ------------------- KHỞI TẠO -------------------
  renderKho();
});
