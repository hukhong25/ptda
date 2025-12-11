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

  loginBtn?.addEventListener("click", () => {
    window.location.href = "/html/login.html";
  });

  registerBtn?.addEventListener("click", () => {
    window.location.href = "/html/register.html";
  });

  // ---------------- UPDATE HEADER ----------------
  async function updateHeader() {
    const user = JSON.parse(localStorage.getItem("user"));
    const token = localStorage.getItem("token");

    if (user && token) {
      loginBtn.style.display = "none";
      registerBtn.style.display = "none";
      userMenu.style.display = "flex";
      userName.innerText = user.ten || "User";
      cartBtn.style.display = "flex";
      await updateCartCount();
    } else {
      loginBtn.style.display = "inline-block";
      registerBtn.style.display = "inline-block";
      userMenu.style.display = "none";
      cartBtn.style.display = "none";
      cartCount.innerText = 0;
    }
  }

  updateHeader();

  // ---------------- DROPDOWN USER ----------------
  userMenu?.addEventListener("click", (e) => {
    dropdownMenu.classList.toggle("show");
    e.stopPropagation();
  });

  document.addEventListener("click", () => {
    dropdownMenu.classList.remove("show");
  });

  // ---------------- LOGOUT ----------------
  logoutBtn?.addEventListener("click", () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("cart"); // optional
    updateHeader();
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
        const res = await fetch("http://localhost:3000/api/cart", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          total = data.cart.reduce((sum, item) => sum + item.soLuongMua, 0);
        }
      } else {
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
