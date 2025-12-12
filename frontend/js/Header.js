// header.js
document.addEventListener("DOMContentLoaded", () => {
  const loginBtn = document.getElementById("loginBtn");
  const registerBtn = document.getElementById("registerBtn");
  const userMenu = document.getElementById("userMenu");
  const userName = document.getElementById("userName");
  const dropdownMenu = document.getElementById("dropdownMenu");
  const logoutBtn = document.getElementById("logoutBtn");
  const cartBtn = document.getElementById("cartBtn");
  const cartCount = document.getElementById("cartCount");
  const logo = document.getElementById("logo");
  const searchInput = document.getElementById("searchInput");
  const searchBtn = document.getElementById("searchBtn");

  // --- Nút Đăng nhập / Đăng ký ---
  loginBtn?.addEventListener("click", () => {
    window.location.href = "/html/login.html";
  });

  registerBtn?.addEventListener("click", () => {
    window.location.href = "/html/register.html";
  });

  // ---------------- UPDATE HEADER (Kiểm tra trạng thái đăng nhập) ----------------
  async function updateHeader() {
    const user = JSON.parse(localStorage.getItem("user"));
    const token = localStorage.getItem("token");

    if (user && token) {
      // Đã đăng nhập: Ẩn nút Login/Register, Hiện User Menu
      loginBtn.style.display = "none";
      registerBtn.style.display = "none";
      userMenu.style.display = "flex";
      userName.innerText = user.ten || user.username || "User"; // Thêm user.username để dự phòng
      cartBtn.style.display = "flex";
      await updateCartCount();
    } else {
      // Chưa đăng nhập: Hiện nút Login/Register, Ẩn User Menu
      loginBtn.style.display = "inline-block";
      registerBtn.style.display = "inline-block";
      userMenu.style.display = "none";
      cartBtn.style.display = "none";
      cartCount.innerText = 0;
    }
  }

  updateHeader();

  // ---------------- XỬ LÝ CLICK VÀO USER (PROFILE) ----------------
  // Đây là đoạn code bạn yêu cầu thêm vào:
  userMenu?.addEventListener("click", (e) => {
    const token = localStorage.getItem("token");
    
    if (token) {
      // Nếu đã đăng nhập, click vào sẽ sang trang profile
      window.location.href = "/html/profile.html"; 
    } else {
      // Chưa đăng nhập thì sang login (trường hợp userMenu hiển thị lỗi)
      window.location.href = "/html/login.html";
    }
    
    // Lưu ý: Đã bỏ chức năng dropdownMenu cũ để ưu tiên chuyển trang Profile
    // dropdownMenu.classList.toggle("show"); 
    e.stopPropagation();
  });

  // Ẩn dropdown nếu click ra ngoài (Giữ lại để tránh lỗi JS nếu còn code cũ dùng)
  document.addEventListener("click", () => {
    if(dropdownMenu) dropdownMenu.classList.remove("show");
  });

  // ---------------- LOGOUT ----------------
  logoutBtn?.addEventListener("click", () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("cart"); // optional
    alert("Đã đăng xuất!");
    window.location.href = "/html/login.html";
  });

  // ---------------- LOGO ----------------
  logo?.addEventListener("click", () => {
    window.location.href = "/html/index.html";
  });

  // ---------------- CART ----------------
  cartBtn?.addEventListener("click", () => {
    window.location.href = "/html/cart.html";
  });

  // ---------------- SEARCH ----------------
  function goToSearch() {
    const keyword = searchInput.value.trim();
    if (!keyword) return;
    window.location.href = `/html/search.html?keyword=${encodeURIComponent(
      keyword
    )}`;
  }
  searchBtn?.addEventListener("click", goToSearch);
  searchInput?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") goToSearch();
  });

  // ---------------- CART COUNT ----------------
  async function updateCartCount() {
    try {
      let total = 0;
      const token = localStorage.getItem("token");
      if (token) {
        // Nếu đăng nhập, lấy giỏ hàng từ API
        const res = await fetch("http://localhost:3000/api/cart", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          // Kiểm tra cấu trúc data trả về để tính tổng
          if (data.cart) {
             total = data.cart.reduce((sum, item) => sum + item.soLuongMua, 0);
          } else if (Array.isArray(data)) {
             total = data.reduce((sum, item) => sum + item.soLuongMua, 0);
          }
        }
      } else {
        // Nếu chưa đăng nhập, lấy từ localStorage
        const cart = JSON.parse(localStorage.getItem("cart")) || [];
        total = cart.reduce((sum, item) => sum + item.quantity, 0);
      }
      cartCount.innerText = total;
    } catch (err) {
      console.error(err);
      cartCount.innerText = 0;
    }
  }

  // ---------------- GLOBAL ----------------
  window.updateHeaderCartCount = updateCartCount;

  window.addEventListener("storage", (e) => {
    if (e.key === "cart") updateCartCount();
  });
});