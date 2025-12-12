// frontend/js/productDetail.js
document.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(window.location.search);
  const productId = params.get("id");
  let selectedSizeId = null;
  
  if (!productId) {
      alert("Không tìm thấy ID sản phẩm");
      window.location.href = "/html/index.html";
      return;
  }

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
      if (!res.ok) throw new Error("Lỗi tải sản phẩm");
      
      const data = await res.json();
      const p = data.product;

      // Render thông tin
      productName.innerText = p.tenSP;
      productPrice.innerText = Number(p.gia).toLocaleString() + " VND";
      productDesc.innerHTML = p.moTa || "Chưa có mô tả";
      if (p.anhSP) {
          productImage.src = `/Asset/${p.anhSP}`;
      }

      // RENDER SIZE
      sizeContainer.innerHTML = "";
      if (p.sizes && Array.isArray(p.sizes) && p.sizes.length > 0) {
        p.sizes.forEach(s => {
            const btn = document.createElement("button");
            btn.className = "size-btn";
            btn.innerText = s.tenSize;
            btn.style.marginRight = "10px";
            btn.style.padding = "5px 15px";
            btn.style.cursor = "pointer";
            btn.style.border = "1px solid #ccc";
            
            // Check tồn kho
            if (s.soLuongTon <= 0) {
                btn.classList.add("disabled");
                btn.disabled = true;
                btn.style.opacity = "0.5";
                btn.title = "Hết hàng";
            }

            btn.addEventListener("click", () => {
                // Xóa active cũ
                document.querySelectorAll(".size-btn").forEach(b => {
                    b.classList.remove("active");
                    b.style.backgroundColor = "";
                    b.style.color = "";
                });
                // Active mới
                btn.classList.add("active");
                btn.style.backgroundColor = "#333";
                btn.style.color = "#fff";
                selectedSizeId = s.maSize;
            });
            sizeContainer.appendChild(btn);
        });
      } else {
          sizeContainer.innerHTML = "<p>Sản phẩm này chưa có size</p>";
      }
    } catch (err) { 
        console.error(err);
        alert("Không tải được chi tiết sản phẩm");
    }
  }

  loadProduct();

  // ---------------- QUANTITY ----------------
  if(btnMinus && btnPlus && qtyInput) {
      btnMinus.addEventListener("click", () => {
        let qty = parseInt(qtyInput.value);
        if (qty > 1) qtyInput.value = qty - 1;
      });
      btnPlus.addEventListener("click", () => {
        qtyInput.value = parseInt(qtyInput.value) + 1;
      });
  }

  // ---------------- ADD TO CART ----------------
  if(addToCartBtn) {
      addToCartBtn.addEventListener("click", async () => {
       // Lấy lại token mới nhất từ localStorage phòng khi vừa login xong
       user = JSON.parse(localStorage.getItem("user"));
       token = localStorage.getItem("token");

       if (!user || !token) {
        alert("Bạn cần đăng nhập để mua hàng!");
        window.location.href = "/html/login.html";
        return;
       }
        
        if (!selectedSizeId) {
            alert("Vui lòng chọn Size!");
            return;
        }

        const qty = parseInt(qtyInput.value);

        try {
            const res = await fetch("http://localhost:3000/api/cart/add", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({ 
                  maSP: productId, 
                  soLuong: qty, 
                  maSize: selectedSizeId 
              }),
            });
            
            const result = await res.json();
            
            if (res.ok) {
                alert("Đã thêm vào giỏ hàng thành công!");
                // Nếu có function update count ở header thì gọi
                if(window.updateHeaderCartCount) window.updateHeaderCartCount();
            } else {
                alert(result.message || "Lỗi khi thêm vào giỏ");
            }
        } catch(e) {
            console.error(e);
            alert("Lỗi kết nối server");
        }
      });
  }

  // ---------------- BUY NOW ----------------
  if(buyNowBtn) {
      buyNowBtn.addEventListener("click", () => {
        if (!selectedSizeId) {
            alert("Vui lòng chọn Size!");
            return;
        }
        const qty = parseInt(qtyInput.value);
        localStorage.setItem(
          "buyNow",
          JSON.stringify({ id: productId, quantity: qty, maSize: selectedSizeId })
        );
        window.location.href = "/html/checkout.html";
      });
  }
});