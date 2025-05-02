document.addEventListener("DOMContentLoaded", () => {
    // 📌 Sidebar
    const menuBtn = document.getElementById("menu-btn");
    const closeBtn = document.getElementById("close-btn");
    const sidebar = document.getElementById("sidebar");
    const overlay = document.getElementById("overlay");

    if (menuBtn && closeBtn && sidebar && overlay) {
        function toggleSidebar(show) {
            sidebar.classList.toggle("show", show);
            overlay.classList.toggle("show", show);
        }
        menuBtn.addEventListener("click", () => toggleSidebar(true));
        closeBtn.addEventListener("click", () => toggleSidebar(false));
        overlay.addEventListener("click", () => toggleSidebar(false));
    }

    // 📌 Dropdown Menu
    document.querySelectorAll(".dropdown-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            const dropdownContent = btn.nextElementSibling;
            const arrow = btn.querySelector(".arrow");
            if (dropdownContent) dropdownContent.classList.toggle("show");
            if (arrow) arrow.classList.toggle("rotate");
        });
    });

    // 📌 Login/Logout
    const loginBtn = document.getElementById("login-btn") || document.getElementById("loginBtn");
    const logoutBtn = document.getElementById("logout-btn") || document.getElementById("logoutBtn");
    const loginModal = document.getElementById("login-modal") || document.getElementById("loginModal");
    const closeModal = document.getElementById("close-modal") || document.getElementById("closeModal");
    const submitLogin = document.getElementById("submit-login");

    function updateAuthUI() {
        const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
        if (loginBtn) loginBtn.classList.toggle("hidden", isLoggedIn);
        if (logoutBtn) logoutBtn.classList.toggle("hidden", !isLoggedIn);
    }

    if (loginBtn && loginModal) {
        loginBtn.addEventListener("click", () => {
            loginModal.classList.remove("hidden");
            loginModal.style.display = "flex";
        });
    }

    if (closeModal && loginModal) {
        closeModal.addEventListener("click", () => {
            loginModal.classList.add("hidden");
            loginModal.style.display = "none";
        });
    }

    if (submitLogin && loginModal) {
        submitLogin.addEventListener("click", () => {
            localStorage.setItem("isLoggedIn", "true");
            updateAuthUI();
            loginModal.classList.add("hidden");
        });
    }

    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            localStorage.setItem("isLoggedIn", "false");
            updateAuthUI();
        });
    }

    updateAuthUI();

    // 📌 Cart Count
    const cartCount = document.getElementById("cart-count");
    const cartItems = document.getElementById("cart-items");
    const clearCart = document.getElementById("clear-cart");
    const totalPriceElement = document.getElementById("total-price");
    const totalItemsElement = document.getElementById("total-items");
    const checkoutBtn = document.getElementById("checkout");

    let cart = JSON.parse(localStorage.getItem("cart")) || [];

    function updateCartCount() {
        let totalItems = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
        cartCount && (cartCount.textContent = `(${totalItems})`);
        totalItemsElement && (totalItemsElement.textContent = totalItems);
    }

    function calculateTotalPrice() {
        const total = cart.reduce((sum, item) => sum + (parseFloat(item.price) * (item.quantity || 1)), 0);
        totalPriceElement && (totalPriceElement.textContent = total.toFixed(2));
    }

    function renderCart() {
        if (!cartItems) return;
        cartItems.innerHTML = "";
        if (cart.length === 0) {
            cartItems.innerHTML = "<li class='empty-cart text-center text-gray-500'>ไม่มีสินค้าในตะกร้า 🛒</li>";
        } else {
            cart.forEach((item, index) => {
                const li = document.createElement("li");
                li.className = "cart-item flex justify-between p-2 border-b";
                li.innerHTML = `
                    <span>${item.name} - ฿${item.price}</span>
                    <div class="quantity-controls flex items-center gap-2">
                        <button class="decrease-qty" data-index="${index}">➖</button>
                        <span class="item-quantity">${item.quantity || 1}</span>
                        <button class="increase-qty" data-index="${index}">➕</button>
                        <button class="remove-item text-red-500" data-index="${index}">❌</button>
                    </div>
                `;
                cartItems.appendChild(li);
            });
        }
        calculateTotalPrice();
        updateCartCount();
    }

    cartItems?.addEventListener("click", (e) => {
        const index = e.target.dataset.index;
        if (e.target.classList.contains("increase-qty")) {
            cart[index].quantity = (cart[index].quantity || 1) + 1;
        } else if (e.target.classList.contains("decrease-qty")) {
            cart[index].quantity > 1 ? cart[index].quantity-- : cart.splice(index, 1);
        } else if (e.target.classList.contains("remove-item")) {
            cart.splice(index, 1);
        }
        localStorage.setItem("cart", JSON.stringify(cart));
        renderCart();
    });

    document.addEventListener("click", (e) => {
        if (e.target.classList.contains("add-to-cart")) {
            const name = e.target.dataset.name;
            const price = e.target.dataset.price;
            const existing = cart.find(item => item.name === name);
            if (existing) {
                existing.quantity++;
            } else {
                cart.push({ name, price, quantity: 1 });
            }
            localStorage.setItem("cart", JSON.stringify(cart));
            renderCart();
        }
    });

    clearCart?.addEventListener("click", () => {
        cart = [];
        localStorage.removeItem("cart");
        renderCart();
    });

    checkoutBtn?.addEventListener("click", async () => {
        if (cart.length === 0) {
            alert("❌ กรุณาเพิ่มสินค้าในตะกร้าก่อนทำการสั่งซื้อ!");
            return;
        }

        const user = JSON.parse(localStorage.getItem("user"));
        if (!user) {
            alert("❌ กรุณาล็อกอินก่อนทำการสั่งซื้อ!");
            const loginModal = document.getElementById("loginModal");
            loginModal.classList.remove("hidden");
            loginModal.style.display = "flex";

            const loginContent = document.getElementById("loginContent");
            try {
                const response = await fetch("login.html");
                const html = await response.text();
                loginContent.innerHTML = html;

                const closeBtn = document.getElementById("closeModal");
                closeBtn?.addEventListener("click", () => {
                    loginModal.classList.add("hidden");
                    loginModal.style.display = "none";
                });
            } catch (error) {
                loginContent.innerHTML = "<p>เกิดข้อผิดพลาดในการโหลดแบบฟอร์ม</p>";
            }
            return;
        }

        alert(`✅ สั่งซื้อสำเร็จ! ขอบคุณ ${user.username} ที่ใช้บริการ`);
        cart = [];
        localStorage.removeItem("cart");
        renderCart();
    });

    window.addEventListener("storage", () => {
        cart = JSON.parse(localStorage.getItem("cart")) || [];
        renderCart();
    });

    renderCart();

    // 📌 Cart Modal
    const cartModal = document.getElementById("cart-modal");
    const closeCart = document.getElementById("close-cart");
    const cartMenu = document.getElementById("cart-menu");

    if (cartModal && cartItems && clearCart && closeCart && totalPriceElement) {
        let cart = JSON.parse(localStorage.getItem("cart")) || [];

        function calculateTotalPrice() {
            let total = cart.reduce((sum, item) => sum + parseFloat(item.price), 0);
            totalPriceElement.textContent = total.toFixed(2);
        }

        function renderCart() {
            cartItems.innerHTML = "";
            if (cart.length === 0) {
                cartItems.innerHTML = "<li class='empty-cart'>ไม่มีสินค้าในตะกร้า</li>";
                totalPriceElement.textContent = "0";
            } else {
                cart.forEach((item, index) => {
                    let li = document.createElement("li");
                    li.innerHTML = `${item.name} - ฿${item.price} <button class="remove-item" data-index="${index}">❌</button>`;
                    cartItems.appendChild(li);
                });

                document.querySelectorAll(".remove-item").forEach(button => {
                    button.addEventListener("click", function () {
                        let index = this.dataset.index;
                        cart.splice(index, 1);
                        localStorage.setItem("cart", JSON.stringify(cart));
                        renderCart();
                        updateCartCount();
                        calculateTotalPrice();
                    });
                });
            }
            calculateTotalPrice();
        }

        cartMenu?.addEventListener("click", () => {
            cart = JSON.parse(localStorage.getItem("cart")) || [];
            cartModal.classList.remove("hidden");
            renderCart();
        });

        closeCart.addEventListener("click", () => cartModal.classList.add("hidden"));

        clearCart.addEventListener("click", () => {
            cart = [];
            localStorage.setItem("cart", JSON.stringify(cart));
            renderCart();
            updateCartCount();
            calculateTotalPrice();
        });
    }

    // 🔐 Modal Login Dynamic Load
    const loginBtn2 = document.getElementById("loginBtn");
    const loginModal2 = document.getElementById("loginModal");
    const loginContent = document.getElementById("loginContent");

    loginBtn2?.addEventListener("click", async (e) => {
        e.preventDefault();
        loginModal2.classList.remove("hidden");
        loginModal2.style.display = "flex";
        try {
            const response = await fetch("login.html");
            const html = await response.text();
            loginContent.innerHTML = html;
            initLoginEvents();
        } catch (err) {
            loginContent.innerHTML = "<p>เกิดข้อผิดพลาดในการโหลดแบบฟอร์ม</p>";
        }
    });

    window.addEventListener("click", (e) => {
        if (e.target === loginModal2) {
            loginModal2.classList.add("hidden");
            loginModal2.style.display = "none";
        }
    });

    function initLoginEvents() {
        const openRegister = document.getElementById("openRegister");
        const backToLogin = document.getElementById("backToLogin");

        openRegister?.addEventListener("click", (e) => {
            e.preventDefault();
            document.getElementById("loginForm").classList.add("hidden");
            document.getElementById("registerForm").classList.remove("hidden");
        });

        backToLogin?.addEventListener("click", (e) => {
            e.preventDefault();
            document.getElementById("registerForm").classList.add("hidden");
            document.getElementById("loginForm").classList.remove("hidden");
        });
    }
});
function updateAuthUI() {
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
    const loginBtn = document.getElementById("login-btn") || document.getElementById("loginBtn");

    if (loginBtn) {
        if (isLoggedIn) {
            // เปลี่ยนเป็นลิงก์ไปหน้า history
            loginBtn.textContent = "📄 ประวัติการสั่งซื้อ";
            loginBtn.href = "history.html";
            loginBtn.removeAttribute("id"); // ป้องกันคลิกแล้วโหลด modal อีก
        } else {
            // กลับเป็นปุ่ม Login
            loginBtn.textContent = "🔑 Login";
            loginBtn.setAttribute("href", "#");
            loginBtn.setAttribute("id", "loginBtn"); // ตั้งกลับ
        }
    }

    const logoutBtn = document.getElementById("logout-btn") || document.getElementById("logoutBtn");
    if (logoutBtn) {
        logoutBtn.classList.toggle("hidden", !isLoggedIn);
    }
}
submitLogin.addEventListener("click", () => {
    localStorage.setItem("isLoggedIn", "true");
    updateAuthUI();
    loginModal.classList.add("hidden");
});
// 📌 Dropdown Menu (ใช้ได้ในทั้ง script.js และ cart.js)
document.querySelectorAll(".dropdown-btn").forEach(btn => {
    btn.addEventListener("click", () => {
        const content = btn.nextElementSibling;
        const arrow = btn.querySelector(".arrow");
        if (content) content.classList.toggle("show");
        if (arrow) arrow.classList.toggle("rotate");
    });
});





