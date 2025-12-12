// cart.js
document.addEventListener("DOMContentLoaded", async () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  if (!user || !token) {
    alert("Bạn chưa đăng nhập!");
    window.location.href = "/html/login.html";
    return;
  }

  const cartList = document.getElementById("cartList");
  const totalPriceEl = document.getElementById("totalPrice");
  const checkoutBtn = document.getElementById("checkoutBtn");

  let cartData = []; // Lưu dữ liệu giỏ hàng để dùng ở checkout

  async function loadCart() {
    try {
      const res = await fetch("http://localhost:3000/api/cart", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      cartData = data.cart;

      cartList.innerHTML = "";

      data.cart.forEach((item) => {
        const div = document.createElement("div");
        div.className = "cart-item";

        // Checkbox
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.className = "select-item";
        checkbox.checked = false; // mặc định được tích
        div.appendChild(checkbox);

        // Ảnh sản phẩm
        const img = document.createElement("img");
        img.src = item.anhSP ? `/Asset/${item.anhSP}` : "/Asset/no-image.jpg";
        img.alt = item.tenSP;
        div.appendChild(img);

        // Thông tin chi tiết
        const detailsDiv = document.createElement("div");
        detailsDiv.className = "cart-item-details";
        detailsDiv.innerHTML = `
          <h3>${item.tenSP}</h3>
          <p class="item-size">Size: ${item.tenSize || 'N/A'}</p> <p>${Number(item.gia).toLocaleString()} VND</p>
          <p>${Number(item.gia).toLocaleString()} VND</p>
          <div class="quantity-control">
            <button class="minus">-</button>
            <input type="number" value="${item.soLuongMua}" min="1" readonly>
            <button class="plus">+</button>
          </div>
        `;
        div.appendChild(detailsDiv);

        // Nút xóa
        const removeBtn = document.createElement("span");
        removeBtn.className = "remove-btn";
        removeBtn.innerText = "Xóa";
        div.appendChild(removeBtn);

        cartList.appendChild(div);

        // --- Event listeners ---
        const qtyInput = detailsDiv.querySelector("input[type='number']");
        const btnMinus = detailsDiv.querySelector(".minus");
        const btnPlus = detailsDiv.querySelector(".plus");

        function updateTotal() {
          let total = 0;
          document.querySelectorAll(".cart-item").forEach((ci) => {
            const cb = ci.querySelector(".select-item");
            if (cb.checked) {
              const priceText = ci
                .querySelector("p")
                .innerText.replace(/,/g, "")
                .replace(" VND", "");
              const price = Number(priceText);
              const qty = Number(
                ci.querySelector("input[type='number']").value
              );
              total += price * qty;
            }
          });
          totalPriceEl.innerText = total.toLocaleString();
        }

        btnMinus.addEventListener("click", async () => {
          if (item.soLuongMua > 1) {
            await fetch("http://localhost:3000/api/cart/update", {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                  maSP: item.maSP,
                  soLuong: item.soLuongMua - 1,
                  maSize: item.maSize // Gửi kèm maSize
              }),
            });
            loadCart();
            window.updateHeaderCartCount?.();
          }
        });

        btnPlus.addEventListener("click", async () => {
          await fetch("http://localhost:3000/api/cart/update", {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              maSP: item.maSP,
              soLuong: item.soLuongMua + 1,
            }),
          });
          loadCart();
          window.updateHeaderCartCount?.();
        });

        removeBtn.addEventListener("click", async () => {
            await fetch(`http://localhost:3000/api/cart/remove`, {
            method: "POST",
            headers: { 
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}` 
            },
            body: JSON.stringify({ maSP: item.maSP, maSize: item.maSize })
            });
            loadCart();
        });

        checkbox.addEventListener("change", updateTotal);
      });

      // Tính tổng lần đầu
      const event = new Event("change");
      document
        .querySelectorAll(".select-item")
        .forEach((cb) => cb.dispatchEvent(event));
    } catch (err) {
      console.error(err);
    }
  }

  checkoutBtn?.addEventListener("click", () => {
    const selectedItems = [];
    document.querySelectorAll(".cart-item").forEach((ci) => {
      const cb = ci.querySelector(".select-item");
      if (cb.checked) {
        const maSP = cartData.find(
          (i) => i.tenSP === ci.querySelector("h3").innerText
        ).maSP;
        selectedItems.push(maSP);
      }
    });
    localStorage.setItem("checkoutItems", JSON.stringify(selectedItems));
    window.location.href = "/html/checkout.html";
  });

  loadCart();
});
