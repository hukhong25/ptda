document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem("token");
    if (!token) {
        window.location.href = "login.html";
        return;
    }
    fetchProfile(token);
    fetchOrders(token);

    document.getElementById("update-btn").addEventListener("click", () => updateBasicInfo(token));
});

async function fetchProfile(token) {
    try {
        const response = await fetch("http://localhost:3000/api/users/profile", {
            headers: { "Authorization": `Bearer ${token}` }
        });
        const data = await response.json();

        if (response.ok) {
            // 1. Điền thông tin cơ bản
            document.getElementById("sidebar-username").innerText = data.username;
            document.getElementById("username").value = data.username;
            document.getElementById("email").value = data.email;
            document.getElementById("phone").value = data.phone;

            // 2. Render danh sách địa chỉ
            renderAddressList(data.addresses);
        }
    } catch (error) {
        console.error("Lỗi profile:", error);
    }
}

function renderAddressList(addresses) {
    const listEl = document.getElementById("address-list");
    listEl.innerHTML = ""; // Xóa cũ

    if (!addresses || addresses.length === 0) {
        listEl.innerHTML = "<li>Chưa có địa chỉ nào.</li>";
        return;
    }

    addresses.forEach(addr => {
        const li = document.createElement("li");
        li.style.cssText = "display: flex; justify-content: space-between; align-items: center; padding: 10px; border-bottom: 1px solid #eee;";
        
        li.innerHTML = `
            <span><i class="fa-solid fa-map-marker-alt" style="color:#ee4d2d; margin-right:8px;"></i> ${addr.tenDiaChi}</span>
            <button onclick="removeAddress(${addr.maDiaChi})" style="background:none; border:none; color: red; cursor: pointer;">
                <i class="fa-solid fa-trash"></i>
            </button>
        `;
        listEl.appendChild(li);
    });
}

// Hàm cập nhật Tên & SĐT
async function updateBasicInfo(token) {
    const username = document.getElementById("username").value;
    const phone = document.getElementById("phone").value;

    try {
        const res = await fetch("http://localhost:3000/api/users/profile", {
            method: "PUT",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ username, phone })
        });
        const result = await res.json();
        alert(result.message);
    } catch (err) {
        alert("Lỗi cập nhật!");
    }
}

// Hàm thêm địa chỉ mới (Gọi từ HTML)
async function addNewAddress() {
    const token = localStorage.getItem("token");
    const address = document.getElementById("new-address").value.trim();
    if (!address) return alert("Vui lòng nhập địa chỉ!");

    try {
        const res = await fetch("http://localhost:3000/api/users/address", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ address })
        });

        if (res.ok) {
            alert("Thêm địa chỉ thành công!");
            document.getElementById("new-address").value = ""; // Xóa ô nhập
            fetchProfile(token); // Load lại danh sách để hiện cái mới
        } else {
            alert("Lỗi thêm địa chỉ");
        }
    } catch (err) {
        console.error(err);
    }
}

// Hàm xóa địa chỉ (Gọi từ HTML)
async function removeAddress(id) {
    if (!confirm("Bạn có chắc muốn xóa địa chỉ này?")) return;
    const token = localStorage.getItem("token");

    try {
        const res = await fetch(`http://localhost:3000/api/users/address/${id}`, {
            method: "DELETE",
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (res.ok) {
            fetchProfile(token); // Load lại danh sách
        } else {
            alert("Không thể xóa địa chỉ này.");
        }
    } catch (err) {
        console.error(err);
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