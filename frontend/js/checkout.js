document.addEventListener("DOMContentLoaded", () => {
    const user = JSON.parse(localStorage.getItem("user"));
    const token = localStorage.getItem("token");
    const checkoutItems = JSON.parse(localStorage.getItem("checkoutItems")) || [];

    if (!token || checkoutItems.length === 0) {
        alert("Không có thông tin đơn hàng!");
        window.location.href = "/html/cart.html";
        return;
    }

    // Điền sẵn thông tin user (Tên, SĐT từ localStorage)
    if (user) {
        document.getElementById("tenNguoiNhan").value = user.ten || "";
        document.getElementById("sdt").value = user.sdt || "";
    }

    // ==================================================================
    // [MỚI] 1. THÊM ĐOẠN CODE NÀY ĐỂ TẢI ĐỊA CHỈ VÀ CHỌN MẶC ĐỊNH
    // ==================================================================
    async function loadUserAddresses() {
        const addressSelect = document.getElementById("diaChiGiaoHang");
        
        // Kiểm tra xem bên HTML bạn đã đổi input thành select chưa
        if (!addressSelect || addressSelect.tagName !== 'SELECT') {
            console.warn("Lưu ý: Bạn cần đổi thẻ <input> id='diaChiGiaoHang' thành <select> bên file HTML thì code này mới chạy đúng.");
            return;
        }

        try {
            const res = await fetch("http://localhost:3000/api/users/profile", {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const data = await res.json();

            // Cập nhật SĐT mới nhất từ database (nếu có)
            if (data.phone) {
                document.getElementById("sdt").value = data.phone;
            }

            if (res.ok && data.addresses && data.addresses.length > 0) {
                // Xóa option cũ, tạo option đầu tiên
                addressSelect.innerHTML = '<option value="">-- Chọn địa chỉ giao hàng --</option>';
                
                let hasDefault = false;

                data.addresses.forEach(addr => {
                    const option = document.createElement("option");
                    option.value = addr.tenDiaChi; // Giá trị gửi đi
                    option.text = addr.tenDiaChi;  // Chữ hiển thị
                    
                    // Logic: Nếu là địa chỉ mặc định (macDinh == 1) thì tự chọn
                    if (addr.macDinh === 1) {
                        option.selected = true;
                        option.text += " (Mặc định)"; // Thêm chữ cho dễ nhìn
                        hasDefault = true;
                    }
                    
                    addressSelect.appendChild(option);
                });

                // Nếu không có cái nào mặc định, tự chọn cái đầu tiên (sau dòng "Chọn địa chỉ")
                if (!hasDefault && addressSelect.options.length > 1) {
                    addressSelect.selectedIndex = 1; 
                }

            } else {
                addressSelect.innerHTML = '<option value="">Bạn chưa lưu địa chỉ nào</option>';
            }
        } catch (err) {
            console.error("Lỗi tải địa chỉ:", err);
            addressSelect.innerHTML = '<option value="">Lỗi kết nối server</option>';
        }
    }

    // Gọi hàm chạy ngay lập tức
    loadUserAddresses();
    // ==================================================================


    const orderItemsList = document.getElementById("orderItemsList");
    const finalTotalEl = document.getElementById("finalTotal");
    const ptttSelect = document.getElementById("maPTTT");
    const qrInfo = document.getElementById("qrInfo");
    let totalAmount = 0;

    // --- Hiển thị danh sách sản phẩm (Giữ nguyên) ---
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

    // --- Xử lý logic hiển thị QR Code (Giữ nguyên) ---
    ptttSelect.addEventListener("change", (e) => {
        if (e.target.value === "2") {
            qrInfo.style.display = "block";
            const ten = document.getElementById("tenNguoiNhan").value;
            const sdt = document.getElementById("sdt").value;
            document.getElementById("qrNote").innerText = `Thanh toan don hang ${sdt}`;
        } else {
            qrInfo.style.display = "none";
        }
    });

    // --- Hàm Validate (SỬA LẠI) ---
    function validateForm(ten, sdt, diaChi) {
        let isValid = true;

        document.querySelectorAll('.error-message').forEach(el => el.style.display = 'none');

        // Validate Tên
        if (!ten || ten.trim() === "") {
            document.getElementById("error-ten").style.display = "block";
            isValid = false;
        }

        // Validate SĐT
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

        // ==================================================================
        // [SỬA] 2. SỬA VALIDATE ĐỊA CHỈ (Bỏ Regex, chỉ check rỗng)
        // ==================================================================
        if (!diaChi || diaChi.trim() === "") {
            document.getElementById("error-diachi").innerText = "Vui lòng chọn địa chỉ giao hàng";
            document.getElementById("error-diachi").style.display = "block";
            isValid = false;
        }
        // Đã xóa phần regex check ký tự đặc biệt vì người dùng chọn từ dropdown
        // ==================================================================

        return isValid;
    }

    // --- Xử lý nút Đặt Hàng (Giữ nguyên logic) ---
    document.getElementById("btnPlaceOrder").addEventListener("click", async () => {
        const tenNguoiNhan = document.getElementById("tenNguoiNhan").value;
        const sdt = document.getElementById("sdt").value;
        const diaChiGiaoHang = document.getElementById("diaChiGiaoHang").value;
        const maPTTT = document.getElementById("maPTTT").value;
        const ghiChu = document.getElementById("ghiChu").value;

        if (!validateForm(tenNguoiNhan, sdt, diaChiGiaoHang)) {
            return; 
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