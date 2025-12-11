document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");
  const messageEl = document.getElementById("message");
  const registerBtn = document.getElementById("registerBtn");

  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!email || !password) {
      messageEl.textContent = "Vui lòng nhập đầy đủ thông tin";
      return;
    }

    try {
      const res = await fetch("http://localhost:3000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        messageEl.textContent = data.message || "Đăng nhập thất bại";
        return;
      }

      // Lưu token, user và cartCount vào localStorage
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("cartCount", data.cartCount || 0);

      // Điều hướng theo role
      if (data.user.role === "admin") {
        window.location.href = "/html/admin.html";
      } else if (data.user.role === "staff") {
        window.location.href = "/html/qlKho.html";
      } else {
        window.location.href = "/html/index.html"; // khách hoặc user
      }
    } catch (error) {
      console.error(error);
      messageEl.textContent = "Lỗi server. Vui lòng thử lại";
    }
  });

  // Chuyển sang trang đăng ký
  registerBtn?.addEventListener("click", () => {
    window.location.href = "/html/register.html";
  });
});
