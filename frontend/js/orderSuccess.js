 document.addEventListener("DOMContentLoaded", () => {
            // 1. Lấy tham số từ URL (Do MoMo trả về)
            const urlParams = new URLSearchParams(window.location.search);
            const resultCode = urlParams.get('resultCode'); // Quan trọng nhất

            const successView = document.getElementById('success-view');
            const failView = document.getElementById('fail-view');

            // 2. Kiểm tra resultCode
            if (resultCode === '0') {
                // --- TRƯỜNG HỢP THÀNH CÔNG ---
                successView.style.display = 'block';
                
                // Chỉ xóa giỏ hàng khi thực sự thành công
                localStorage.removeItem("checkoutItems");
                // localStorage.removeItem("cart"); // Bật dòng này nếu muốn xóa sạch giỏ hàng gốc
                
                console.log("Thanh toán MoMo thành công!");
            } else {
                // --- TRƯỜNG HỢP HỦY HOẶC LỖI ---
                failView.style.display = 'block';
                
                // KHÔNG xóa giỏ hàng, để người dùng còn mua lại
                console.log("Giao dịch thất bại hoặc bị hủy. Code:", resultCode);
            }
        });