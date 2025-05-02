document.addEventListener("DOMContentLoaded", () => {
    // 📌 เปิด/ปิด Sidebar
    const menuBtn = document.getElementById("menu-btn");
    const closeBtn = document.getElementById("close-btn");
    const sidebar = document.getElementById("sidebar");
    const overlay = document.getElementById("overlay");

    menuBtn.addEventListener("click", () => toggleSidebar(true));
    closeBtn.addEventListener("click", () => toggleSidebar(false));
    overlay.addEventListener("click", () => toggleSidebar(false));

    function toggleSidebar(show) {
        sidebar.classList.toggle("show", show);
        overlay.classList.toggle("show", show);
    }

    // 📌 เปิด/ปิด Dropdown Menu
    document.querySelectorAll(".dropdown-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            const dropdownContent = btn.nextElementSibling;
            const arrow = btn.querySelector(".arrow");

            dropdownContent.classList.toggle("show");
            arrow.classList.toggle("rotate");
        });
    });

    // 📌 ระบบล็อกอิน
    const loginBtn = document.getElementById("login-btn");
    const logoutBtn = document.getElementById("logout-btn");
    const loginModal = document.getElementById("login-modal");
    const closeModal = document.getElementById("close-modal");
    const submitLogin = document.getElementById("submit-login");

    let isLoggedIn = localStorage.getItem("isLoggedIn") === "true";

    loginBtn.addEventListener("click", () => loginModal.classList.remove("hidden"));
    closeModal.addEventListener("click", () => loginModal.classList.add("hidden"));

    submitLogin.addEventListener("click", () => {
        localStorage.setItem("isLoggedIn", "true");
        updateAuthUI();
        loginModal.classList.add("hidden");
    });

    logoutBtn.addEventListener("click", () => {
        localStorage.setItem("isLoggedIn", "false");
        updateAuthUI();
    });

    function updateAuthUI() {
        isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
        loginBtn.classList.toggle("hidden", isLoggedIn);
        logoutBtn.classList.toggle("hidden", !isLoggedIn);
    }

    updateAuthUI(); // ตรวจสอบสถานะล็อกอินเมื่อโหลดหน้าเว็บ

    // 📌 ระบบตะกร้าสินค้า
    const cartMenu = document.getElementById("cart-menu");
    const cartCount = document.getElementById("cart-count");
    const cartModal = document.getElementById("cart-modal");
    const closeCart = document.getElementById("close-cart");
    const cartItems = document.getElementById("cart-items");
    const clearCart = document.getElementById("clear-cart");
    const totalPriceElement = document.getElementById("total-price");
    const addToCartButtons = document.querySelectorAll(".add-to-cart");

    let cart = JSON.parse(localStorage.getItem("cart")) || [];

    function updateCartCount() {
        cartCount.textContent = `(${cart.length})`;
    }

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
                li.innerHTML = `${item.name} - ฿${item.price} 
                    <button class="remove-item" data-index="${index}">❌</button>`;
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

    addToCartButtons.forEach(button => {
        button.addEventListener("click", function () {
            let name = this.dataset.name;
            let price = this.dataset.price;

            cart.push({ name, price });
            localStorage.setItem("cart", JSON.stringify(cart));

            updateCartCount();
            renderCart();
        });
    });

    cartMenu.addEventListener("click", () => {
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

    updateCartCount();
    calculateTotalPrice();
});
document.addEventListener("DOMContentLoaded", function () {
    function updateCartCount() {
        let cart = JSON.parse(localStorage.getItem("cart")) || [];
        let totalItems = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
        document.getElementById("cart-count").textContent = `(${totalItems})`;
    }
    
    updateCartCount();
    
    window.addEventListener("storage", updateCartCount);
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
  import { db } from './firebase.js';
  import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

  document.querySelector(".delivery-form").addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("name").value;
    const phone = document.getElementById("phone").value;
    const address = document.getElementById("address").value;
    const deliveryOption = document.getElementById("delivery-option").value;

    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const user = JSON.parse(localStorage.getItem("user"));

    if (!user || !user.uid) {
      alert("❌ กรุณาล็อกอินก่อนทำการสั่งซื้อ!");
      return;
    }

    if (cart.length === 0) {
      alert("❌ กรุณาเพิ่มสินค้าในตะกร้าก่อนสั่งซื้อ!");
      return;
    }

    try {
      await addDoc(collection(db, "orders"), {
        uid: user.uid,
        name,
        phone,
        address,
        deliveryOption,
        cart,
        createdAt: serverTimestamp()
      });

      alert("✅ สั่งซื้อสำเร็จ! ขอบคุณที่ใช้บริการ Le Poney");
      localStorage.removeItem("cart");
      window.location.href = "history.html";
    } catch (error) {
      console.error("เกิดข้อผิดพลาด:", error);
      alert("❌ ไม่สามารถส่งคำสั่งซื้อได้: " + error.message);
    }
  });





