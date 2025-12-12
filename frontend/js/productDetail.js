// productDetail.js
document.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(window.location.search);
  const productId = params.get("id");
  let selectedSizeId = null;
  if (!productId) return;

  const productName = document.getElementById("productName");
  const productImage = document.getElementById("productImage");
  const productPrice = document.getElementById("productPrice");
  const productDesc = document.getElementById("productDesc");
  const qtyInput = document.getElementById("quantity");
  const btnMinus = document.getElementById("btnMinus");
  const btnPlus = document.getElementById("btnPlus");
  const addToCartBtn = document.getElementById("addToCartBtn");
  const buyNowBtn = document.getElementById("buyNowBtn");
  const sizeContainer = document.getElementById("sizeContainer");
  let user = JSON.parse(localStorage.getItem("user"));
  let token = localStorage.getItem("token");

  // ---------------- LOAD PRODUCT ----------------
  async function loadProduct() {
    try {
      const res = await fetch(`http://localhost:3000/api/products/${productId}`);
      const data = await res.json();
      if (!res.ok) return;

      const p = data.product;
      // ... gán tên, giá, ảnh ...

      // RENDER SIZE
      if (p.sizes && p.sizes.length > 0) {
        sizeContainer.innerHTML = "";
        p.sizes.forEach(s => {
            const btn = document.createElement("button");
            btn.className = "size-btn";
            btn.innerText = s.tenSize;
            
            // Check tồn kho
            if (s.soLuongTon <= 0) {
                btn.classList.add("disabled");
                btn.disabled = true;
            }

            btn.addEventListener("click", () => {
                // Xóa active cũ
                document.querySelectorAll(".size-btn").forEach(b => b.classList.remove("active"));
                // Active mới
                btn.classList.add("active");
                selectedSizeId = s.maSize;
            });
            sizeContainer.appendChild(btn);
        });
      }
    } catch (err) { console.error(err); }
  }

  loadProduct();

  // ---------------- QUANTITY ----------------
  btnMinus.addEventListener("click", () => {
    let qty = parseInt(qtyInput.value);
    if (qty > 1) qtyInput.value = qty - 1;
  });
  btnPlus.addEventListener("click", () => {
    qtyInput.value = parseInt(qtyInput.value) + 1;
  });

  // ---------------- ADD TO CART ----------------
  addToCartBtn.addEventListener("click", async () => {
   if (!user || !token) {
    alert("Bạn cần đăng nhập trước!");
    window.location.href = "login.html";  // chuyển hướng
    return;
   }
    
    if (!selectedSizeId) {
        alert("Vui lòng chọn Size!");
        return;
    }

    const qty = parseInt(qtyInput.value);

    await fetch("http://localhost:3000/api/cart/add", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      // Gửi thêm maSize
      body: JSON.stringify({ maSP: productId, soLuong: qty, maSize: selectedSizeId }),
    });

    alert("Đã thêm vào giỏ hàng!");
    window.updateHeaderCartCount?.();
  });

  // ---------------- BUY NOW ----------------
  buyNowBtn.addEventListener("click", () => {
    const qty = parseInt(qtyInput.value);
    localStorage.setItem(
      "buyNow",
      JSON.stringify({ id: productId, quantity: qty })
    );
    window.location.href = "/html/checkout.html";
  });
});
