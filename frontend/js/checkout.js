// frontend/js/checkout.js
document.addEventListener("DOMContentLoaded", async () => {
  // --- 1. Lấy dữ liệu từ query string ---
  const params = new URLSearchParams(window.location.search);
  const maSP = params.get("maSP");
  const maSize = params.get("maSize");
  const soLuong = parseInt(params.get("soLuong")) || 1;
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  if (!maSP || !maSize) {
    alert("Không có thông tin đơn hàng!");
    window.location.href = "/html/index.html";
    return;
  }

  // --- 2. Điền thông tin user ---
  if (user) {
    document.getElementById("tenNguoiNhan").value = user.ten || "";
    document.getElementById("sdt").value = user.sdt || "";
  }

  const orderItemsList = document.getElementById("orderItemsList");
  const finalTotalEl = document.getElementById("finalTotal");
  const ptttSelect = document.getElementById("maPTTT");
  const qrInfo = document.getElementById("qrInfo");
  let totalAmount = 0;

  // --- 3. Lấy chi tiết sản phẩm từ backend ---
  try {
    const res = await fetch(`http://localhost:3000/api/products/${maSP}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!res.ok) throw new Error("Lỗi tải sản phẩm");
    const data = await res.json();
    const p = data.product;

    // Lấy tên size
    const sizeObj = (p.sizes || []).find((s) => s.maSize == maSize);
    const tenSize = sizeObj ? sizeObj.tenSize : "Không xác định";

    // Hiển thị sản phẩm
    const itemTotal = p.gia * soLuong;
    totalAmount += itemTotal;

    const div = document.createElement("div");
    div.className = "order-item";
    div.innerHTML = `
            <div>
                <strong>${p.tenSP}</strong> <br>
                <small>Size: ${tenSize} x ${soLuong}</small>
            </div>
            <span>${itemTotal.toLocaleString()} đ</span>
        `;
    orderItemsList.appendChild(div);
    finalTotalEl.innerText = totalAmount.toLocaleString() + " VND";
  } catch (err) {
    console.error(err);
    alert("Không tải được chi tiết sản phẩm");
    return;
  }

  // --- 4. Hiển thị QR code nếu chọn thanh toán chuyển khoản ---
  ptttSelect.addEventListener("change", (e) => {
    if (e.target.value === "2") {
      qrInfo.style.display = "block";
      const ten = document.getElementById("tenNguoiNhan").value;
      const sdt = document.getElementById("sdt").value;
      document.getElementById(
        "qrNote"
      ).innerText = `Thanh toán đơn hàng ${sdt}`;
    } else {
      qrInfo.style.display = "none";
    }
  });

  // --- 5. Hàm validate form ---
  function validateForm(ten, sdt, diaChi) {
    let isValid = true;

    // Reset thông báo lỗi
    document
      .querySelectorAll(".error-message")
      .forEach((el) => (el.style.display = "none"));

    // Validate Tên
    if (!ten || ten.trim() === "") {
      document.getElementById("error-ten").style.display = "block";
      isValid = false;
    }

    // Validate SĐT
    const phoneRegex = /^[0-9]+$/;
    if (!sdt || !phoneRegex.test(sdt)) {
      document.getElementById("error-sdt").innerText =
        "Số điện thoại không được để trống và chỉ chứa số";
      document.getElementById("error-sdt").style.display = "block";
      isValid = false;
    } else if (sdt.length < 10 || sdt.length > 11) {
      document.getElementById("error-sdt").innerText =
        "Số điện thoại phải từ 10-11 số";
      document.getElementById("error-sdt").style.display = "block";
      isValid = false;
    }

    // Validate Địa chỉ
    const addressRegex =
      /^[a-zA-Z0-9\sàáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđÀÁẠẢÃÂẦẤẬẨẪĂẰẮẶẲẴÈÉẸẺẼÊỀẾỆỂỄÌÍỊỈĨÒÓỌỎÕÔỒỐỘỔỖƠỜỚỢỞỠÙÚỤỦŨƯỪỨỰỬỮỲÝỴỶỸĐ,.\-\/]+$/;

    if (!diaChi || diaChi.trim() === "") {
      document.getElementById("error-diachi").innerText =
        "Địa chỉ không được để trống";
      document.getElementById("error-diachi").style.display = "block";
      isValid = false;
    } else if (!addressRegex.test(diaChi)) {
      document.getElementById("error-diachi").innerText =
        "Địa chỉ không được chứa ký tự đặc biệt (@, #, $, %...)";
      document.getElementById("error-diachi").style.display = "block";
      isValid = false;
    }

    return isValid;
  }

  // --- 6. Xử lý nút Đặt Hàng ---
  document
    .getElementById("btnPlaceOrder")
    .addEventListener("click", async () => {
      const tenNguoiNhan = document.getElementById("tenNguoiNhan").value;
      const sdt = document.getElementById("sdt").value;
      const diaChiGiaoHang = document.getElementById("diaChiGiaoHang").value;
      const maPTTT = document.getElementById("maPTTT").value;
      const ghiChu = document.getElementById("ghiChu").value;

      if (!validateForm(tenNguoiNhan, sdt, diaChiGiaoHang)) return;

      const payload = {
        tenNguoiNhan,
        sdt,
        diaChiGiaoHang,
        maPTTT,
        ghiChu,
        tongTien: totalAmount,
        items: [{ maSP, maSize, soLuong }],
      };

      try {
        const res = await fetch("http://localhost:3000/api/orders/create", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });

        const data = await res.json();
        if (res.ok) {
          alert("Đặt hàng thành công!");
          window.location.href = "/html/index.html";
        } else {
          alert(data.message || "Có lỗi xảy ra");
        }
      } catch (err) {
        console.error(err);
        alert("Lỗi kết nối server");
      }
    });
});
