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
    const orderListDiv = document.getElementById("order-list");
    orderListDiv.innerHTML = "<p>Đang tải đơn hàng...</p>";

    try {
        const response = await fetch("http://localhost:3000/api/orders/my-orders", {
            headers: { "Authorization": `Bearer ${token}` }
        });
        
        // Nếu response không OK, ném lỗi ra catch
        if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.message || response.statusText);
        }

        const orders = await response.json();

        if (orders.length > 0) {
            orderListDiv.innerHTML = orders.map(order => {
                // Render danh sách sản phẩm trong đơn
                const productsHtml = order.items.map(item => `
                    <div style="display: flex; gap: 15px; padding: 10px 0; border-top: 1px solid #f0f0f0;">
                        <img src="../Asset/${item.anhSP}" alt="${item.tenSP}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 4px; border: 1px solid #ddd;">
                        <div style="flex: 1;">
                            <div style="font-weight: 500; font-size: 14px;">${item.tenSP}</div>
                            <div style="font-size: 13px; color: #777;">
                                Phân loại: ${item.tenSize || 'N/A'} | x${item.soLuongMua}
                            </div>
                            <div style="font-size: 14px; color: #ee4d2d; margin-top: 2px;">
                                ${Number(item.giaMua).toLocaleString('vi-VN')} đ
                            </div>
                        </div>
                    </div>
                `).join('');

                // Render tổng thể đơn hàng
                return `
                <div class="order-item" style="background: #fff; padding: 15px; margin-bottom: 15px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); border: 1px solid #eee;">
                    <div class="order-header" style="display: flex; justify-content: space-between; margin-bottom: 10px; padding-bottom: 5px;">
                        <div>
                            <strong>Đơn hàng #${order.maDonHang}</strong>
                            <br><span style="font-size: 12px; color: #888;">${new Date(order.ngayDat).toLocaleString('vi-VN')}</span>
                        </div>
                        <span class="status-badge status-${(order.trangThai || 'pending').toLowerCase()}" 
                              style="padding: 4px 8px; border-radius: 4px; font-size: 12px; height: fit-content; background: #e0f2f1; color: #00695c;">
                            ${order.trangThai}
                        </span>
                    </div>
                    
                    <div class="order-body">
                        ${productsHtml}
                    </div>

                    <div class="order-footer" style="margin-top: 10px; padding-top: 10px; border-top: 1px dashed #ddd; display: flex; justify-content: space-between; align-items: center;">
                        <span style="font-size: 13px; color: #555;">Người nhận: ${order.tenNguoiNhan} (${order.sdt})</span>
                        <div class="order-total" style="font-size: 15px; font-weight: bold; color: #ee4d2d;">
                            Thành tiền: ${Number(order.tongTien).toLocaleString('vi-VN')} đ
                        </div>
                    </div>
                </div>
            `;
            }).join('');
        } else {
            orderListDiv.innerHTML = "<p style='text-align:center'>Bạn chưa có đơn hàng nào.</p>";
        }
    } catch (error) {
        console.error("Lỗi orders:", error);
        // Hiển thị lỗi cụ thể ra màn hình để dễ debug
        orderListDiv.innerHTML = `<p style='color:red; text-align:center;'>Có lỗi xảy ra: ${error.message}</p>`;
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