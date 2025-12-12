document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem("token");

    if (!token) {
        alert("Vui lòng đăng nhập!");
        window.location.href = "login.html";
        return;
    }

    // Load dữ liệu
    fetchProfile(token);
    fetchOrders(token);

    // Bắt sự kiện nút Cập nhật (Nếu bạn có nút này trong HTML)
    const updateBtn = document.getElementById("update-btn"); // Thêm id="update-btn" cho nút Lưu trong HTML
    if(updateBtn) {
        updateBtn.addEventListener("click", () => updateProfile(token));
    }
});

async function fetchProfile(token) {
    try {
        const response = await fetch("http://localhost:3000/api/users/profile", {
            headers: { "Authorization": `Bearer ${token}` }
        });
        const data = await response.json();

        if (response.ok) {
            // Hiển thị dữ liệu
            if(document.getElementById("sidebar-username")) document.getElementById("sidebar-username").innerText = data.username;
            if(document.getElementById("username")) document.getElementById("username").value = data.username;
            if(document.getElementById("email")) document.getElementById("email").value = data.email;
            if(document.getElementById("phone")) document.getElementById("phone").value = data.phone;
            if(document.getElementById("address")) document.getElementById("address").value = data.address;

            // --- CẤU HÌNH Ô NHẬP LIỆU ---
            document.getElementById("username").disabled = false; // Cho sửa tên
            document.getElementById("phone").disabled = false;    // Cho sửa SĐT
            document.getElementById("address").disabled = false;  // Cho sửa địa chỉ
            
            document.getElementById("email").disabled = true;     // KHÓA EMAIL (Không cho sửa)
        }
    } catch (error) {
        console.error("Lỗi profile:", error);
    }
}

async function updateProfile(token) {
    // Lấy giá trị từ các ô input
    const username = document.getElementById("username").value;
    const phone = document.getElementById("phone").value;
    const address = document.getElementById("address").value; // Lấy địa chỉ

    try {
        const response = await fetch("http://localhost:3000/api/users/profile", {
            method: "PUT",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            // Chỉ gửi username, phone, address (không gửi email)
            body: JSON.stringify({ username, phone, address }) 
        });

        const result = await response.json();
        if (response.ok) {
            alert(result.message);
            // Cập nhật lại tên hiển thị bên góc trái
            document.getElementById("sidebar-username").innerText = username;
            
            // Cập nhật localStorage
            const user = JSON.parse(localStorage.getItem("user")) || {};
            user.ten = username;
            localStorage.setItem("user", JSON.stringify(user));
        } else {
            alert("Lỗi: " + result.message);
        }
    } catch (error) {
        console.error("Lỗi update:", error);
        alert("Có lỗi xảy ra khi cập nhật.");
    }
}

async function fetchOrders(token) {
    try {
        const response = await fetch("http://localhost:3000/api/orders/my-orders", {
            headers: { "Authorization": `Bearer ${token}` }
        });
        const orders = await response.json();
        const orderListDiv = document.getElementById("order-list");

        if (response.ok && orders.length > 0) {
            orderListDiv.innerHTML = orders.map(order => `
                <div class="order-item">
                    <div class="order-header">
                        <span><strong>Đơn hàng:</strong> #${order.maDonHang}</span>
                        <span class="status-badge status-${order.trangThai.toLowerCase()}">${order.trangThai}</span>
                    </div>
                    <div class="order-body">
                        <p>Ngày đặt: ${new Date(order.ngayDat).toLocaleDateString('vi-VN')}</p>
                        <p>Người nhận: ${order.tenNguoiNhan} - ${order.sdt}</p>
                        <p>Địa chỉ: ${order.diaChiGiaoHang}</p>
                    </div>
                    <div class="order-total">
                        Tổng tiền: ${Number(order.tongTien).toLocaleString('vi-VN')} đ
                    </div>
                </div>
            `).join('');
        } else {
            orderListDiv.innerHTML = "<p>Bạn chưa có đơn hàng nào.</p>";
        }
    } catch (error) {
        console.error("Lỗi orders:", error);
    }
}

// Hàm hỗ trợ chuyển Tab
function switchTab(tabName) {
    // Ẩn tất cả tab
    document.querySelectorAll('.tab-content').forEach(el => el.style.display = 'none');
    document.querySelectorAll('.profile-menu li').forEach(el => el.classList.remove('active'));

    // Hiện tab được chọn
    if(tabName === 'info') {
        document.getElementById('tab-info').style.display = 'block';
        document.querySelector('.profile-menu li:nth-child(1)').classList.add('active');
    } else {
        document.getElementById('tab-orders').style.display = 'block';
        document.querySelector('.profile-menu li:nth-child(2)').classList.add('active');
    }
}

function getStatusClass(status) {
    if (status === 'Đã giao' || status === 'completed') return 'status-completed';
    if (status === 'Đã hủy' || status === 'cancelled') return 'status-cancelled';
    return 'status-pending';
}

function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "login.html";
}