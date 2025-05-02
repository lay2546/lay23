document.addEventListener("DOMContentLoaded", () => {
    // 📌 Sidebar Toggle
    const menuBtn = document.getElementById("menu-btn");
    const closeBtn = document.getElementById("close-btn");
    const sidebar = document.getElementById("sidebar");
    const overlay = document.getElementById("overlay");

    function toggleSidebar(show) {
        sidebar?.classList.toggle("show", show);
        overlay?.classList.toggle("show", show);
    }

    menuBtn?.addEventListener("click", () => toggleSidebar(true));
    closeBtn?.addEventListener("click", () => toggleSidebar(false));
    overlay?.addEventListener("click", () => toggleSidebar(false));

    // 📌 Dropdown Menu
    document.querySelectorAll(".dropdown-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            btn.nextElementSibling?.classList.toggle("show");
        });
    });

    // 🔐 Login System
    const loginBtn = document.getElementById("login-btn");
    const logoutBtn = document.getElementById("logout-btn");
    const loginModal = document.getElementById("login-modal");
    const closeModal = document.getElementById("close-modal");
    const submitLogin = document.getElementById("submit-login");

    let isLoggedIn = localStorage.getItem("isLoggedIn") === "true";

    loginBtn?.addEventListener("click", () => loginModal?.classList.remove("hidden"));
    closeModal?.addEventListener("click", () => loginModal?.classList.add("hidden"));

    submitLogin?.addEventListener("click", () => {
        const username = document.getElementById("login-username")?.value || "Guest";
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("user", JSON.stringify({ username }));
        updateAuthUI();
        loginModal?.classList.add("hidden");
        alert("✅ ล็อกอินสำเร็จ! คุณสามารถสั่งซื้อสินค้าได้แล้ว");
    });

    logoutBtn?.addEventListener("click", () => {
        localStorage.setItem("isLoggedIn", "false");
        localStorage.removeItem("user");
        updateAuthUI();
    });

    function updateAuthUI() {
        isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
        loginBtn?.classList.toggle("hidden", isLoggedIn);
        logoutBtn?.classList.toggle("hidden", !isLoggedIn);
    }

    updateAuthUI();

    // 🛒 Cart System
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

    // 📌 Click on quantity or remove
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

    // 📌 Add to cart
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
    
            // Load the login form dynamically
            const loginContent = document.getElementById("loginContent");
            try {
                const response = await fetch("login.html");
                const html = await response.text();
                loginContent.innerHTML = html;
    
                // Reattach the close button event after loading new content
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
    
        // Proceed with checkout if the user is logged in
        alert(`✅ สั่งซื้อสำเร็จ! ขอบคุณ ${user.username} ที่ใช้บริการ`);
        cart = [];
        localStorage.removeItem("cart");
        renderCart();
    });

    // 📌 Sync with other tabs
    window.addEventListener("storage", () => {
        cart = JSON.parse(localStorage.getItem("cart")) || [];
        renderCart();
    });

    renderCart();
});

document.getElementById("loginBtn").addEventListener("click", async (e) => {
    e.preventDefault();
    const loginModal = document.getElementById("loginModal");
    const loginContent = document.getElementById("loginContent");
  
    loginModal.classList.remove("hidden");
    loginModal.style.display = "flex"; // ✅ Ensure modal is displayed as flex for centering
  
    try {
      const response = await fetch("login.html"); // Fetch the login.html content
      const html = await response.text();
      loginContent.innerHTML = html; // Insert the fetched content into the modal
  
      // ✅ Reattach the close button event after loading new content
      const closeBtn = document.getElementById("closeModal");
      if (closeBtn) {
        closeBtn.addEventListener("click", () => {
          loginModal.classList.add("hidden");
          loginModal.style.display = "none"; // Explicitly hide the modal
        });
      }
    } catch (error) {
      loginContent.innerHTML = "<p>เกิดข้อผิดพลาดในการโหลดแบบฟอร์ม</p>"; // Error message
    }
  });
  
  window.addEventListener("click", (e) => {
    const modal = document.getElementById("loginModal");
    if (e.target === modal) {
      modal.classList.add("hidden");
      modal.style.display = "none"; // ✅ Close modal when clicking outside
    }
  });




