// productDetail.js
document.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(window.location.search);
  const productId = params.get("id");

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

  let user = JSON.parse(localStorage.getItem("user"));
  let token = localStorage.getItem("token");

  // ---------------- LOAD PRODUCT ----------------
  async function loadProduct() {
    try {
      const res = await fetch(
        `http://localhost:3000/api/products/${productId}`
      );
      const data = await res.json();
      if (!res.ok) return;

      const p = data.product;
      productName.textContent = p.tenSP;
      productPrice.textContent = Number(p.gia).toLocaleString() + " VND";
      productDesc.textContent = p.moTa || "Không có mô tả.";
      productImage.src = p.anhSP ? `/Asset/${p.anhSP}` : "/Asset/no-image.jpg";
    } catch (err) {
      console.error(err);
    }
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
      window.location.href = "/html/login.html";
      return;
    }

    const qty = parseInt(qtyInput.value);

    // Gọi API thêm giỏ
    await fetch("http://localhost:3000/api/cart/add", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ maSP: productId, soLuong: qty }),
    });

    alert("Đã thêm vào giỏ hàng!");
    window.updateHeaderCartCount?.(); // update header
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
