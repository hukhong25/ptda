document.addEventListener("DOMContentLoaded", () => {
    const user = JSON.parse(localStorage.getItem("user"));
    const token = localStorage.getItem("token");
    const checkoutItems = JSON.parse(localStorage.getItem("checkoutItems")) || [];

    if (!token || checkoutItems.length === 0) {
        alert("Không có thông tin đơn hàng!");
        window.location.href = "/html/cart.html";
        return;
    }

    // Điền sẵn thông tin user
    if (user) {
        document.getElementById("tenNguoiNhan").value = user.ten || "";
        document.getElementById("sdt").value = user.sdt || "";
    }

    const orderItemsList = document.getElementById("orderItemsList");
    const finalTotalEl = document.getElementById("finalTotal");
    const ptttSelect = document.getElementById("maPTTT");
    const qrInfo = document.getElementById("qrInfo");
    let totalAmount = 0;

    // --- 1. Hiển thị danh sách sản phẩm ---
    orderItemsList.innerHTML = "";
    checkoutItems.forEach(item => {
        const itemTotal = item.gia * item.soLuongMua;
        totalAmount += itemTotal;

        const div = document.createElement("div");
        div.className = "order-item";
        div.innerHTML = `
            <div>
                <strong>${item.tenSP}</strong> <br>
                <small>Size: ${item.tenSize} x ${item.soLuongMua}</small>
            </div>
            <span>${itemTotal.toLocaleString()} đ</span>
        `;
        orderItemsList.appendChild(div);
    });
    finalTotalEl.innerText = totalAmount.toLocaleString() + " VND";

    // --- 2. Xử lý logic hiển thị QR Code ---
    ptttSelect.addEventListener("change", (e) => {
        if (e.target.value === "2") {
            // Nếu chọn Chuyển khoản ngân hàng (value = 2)
            qrInfo.style.display = "block";
            // Cập nhật nội dung chuyển khoản gợi ý
            const ten = document.getElementById("tenNguoiNhan").value;
            const sdt = document.getElementById("sdt").value;
            document.getElementById("qrNote").innerText = `Thanh toan don hang ${sdt}`;
        } else {
            qrInfo.style.display = "none";
        }
    });

    // --- 3. Hàm Validate (Kiểm tra dữ liệu) ---
    function validateForm(ten, sdt, diaChi) {
        let isValid = true;

        // Reset thông báo lỗi
        document.querySelectorAll('.error-message').forEach(el => el.style.display = 'none');

        // Validate Tên: Không được để trống
        if (!ten || ten.trim() === "") {
            document.getElementById("error-ten").style.display = "block";
            isValid = false;
        }

        // Validate SĐT: Chỉ chứa ký tự số
        // Regex: ^[0-9]+$ nghĩa là từ đầu đến cuối chỉ có các số từ 0-9
        const phoneRegex = /^[0-9]+$/;
        if (!sdt || !phoneRegex.test(sdt)) {
            document.getElementById("error-sdt").innerText = "Số điện thoại không được để trống và chỉ chứa số";
            document.getElementById("error-sdt").style.display = "block";
            isValid = false;
        } else if (sdt.length < 10 || sdt.length > 11) {
             document.getElementById("error-sdt").innerText = "Số điện thoại phải từ 10-11 số";
             document.getElementById("error-sdt").style.display = "block";
             isValid = false;
        }

        // Validate Địa chỉ: Không để trống & Không chứa ký tự đặc biệt
        // Regex cho phép: Chữ cái (kể cả tiếng Việt), số, khoảng trắng, và dấu phẩy, chấm, gạch ngang, xược (thường dùng trong địa chỉ)
        // Loại bỏ các ký tự đặc biệt như @, #, $, %, ^, &, *, (, ), !, v.v.
        // \p{L} là unicode property cho chữ cái bất kỳ ngôn ngữ nào
        // [0-9] là số
        // [\s,.\-\/] là khoảng trắng, phẩy, chấm, gạch ngang, gạch chéo
        const addressRegex = /^[a-zA-Z0-9\sàáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđÀÁẠẢÃÂẦẤẬẨẪĂẰẮẶẲẴÈÉẸẺẼÊỀẾỆỂỄÌÍỊỈĨÒÓỌỎÕÔỒỐỘỔỖƠỜỚỢỞỠÙÚỤỦŨƯỪỨỰỬỮỲÝỴỶỸĐ,.\-\/]+$/;

        if (!diaChi || diaChi.trim() === "") {
            document.getElementById("error-diachi").innerText = "Địa chỉ không được để trống";
            document.getElementById("error-diachi").style.display = "block";
            isValid = false;
        } else if (!addressRegex.test(diaChi)) {
            document.getElementById("error-diachi").innerText = "Địa chỉ không được chứa ký tự đặc biệt (@, #, $, %...)";
            document.getElementById("error-diachi").style.display = "block";
            isValid = false;
        }

        return isValid;
    }

    // --- 4. Xử lý nút Đặt Hàng ---
    document.getElementById("btnPlaceOrder").addEventListener("click", async () => {
        const tenNguoiNhan = document.getElementById("tenNguoiNhan").value;
        const sdt = document.getElementById("sdt").value;
        const diaChiGiaoHang = document.getElementById("diaChiGiaoHang").value;
        const maPTTT = document.getElementById("maPTTT").value;
        const ghiChu = document.getElementById("ghiChu").value;

        // Gọi hàm validate trước khi gửi
        if (!validateForm(tenNguoiNhan, sdt, diaChiGiaoHang)) {
            return; // Dừng lại nếu dữ liệu không hợp lệ
        }

        const payload = {
            tenNguoiNhan,
            sdt,
            diaChiGiaoHang,
            maPTTT,
            ghiChu,
            tongTien: totalAmount,
            items: checkoutItems
        };

        try {
            const res = await fetch("http://localhost:3000/api/orders/create", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            const data = await res.json();

            if (res.ok) {
                alert("Đặt hàng thành công!");
                localStorage.removeItem("checkoutItems");
                window.location.href = "/html/index.html"; 
            } else {
                alert(data.message || "Có lỗi xảy ra");
            }
        } catch (error) {
            console.error(error);
            alert("Lỗi kết nối server");
        }
    });
});