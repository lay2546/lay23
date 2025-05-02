import { auth } from "./firebase.js";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";

export function initLoginEvents() {
    // 🔐 Login
    const loginBtn = document.getElementById("submit-login");
    loginBtn?.addEventListener("click", async () => {
        const email = document.getElementById("login-username").value;
        const password = document.getElementById("login-password").value;
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            localStorage.setItem("isLoggedIn", "true");
            localStorage.setItem("user", JSON.stringify({
                uid: user.uid,
                email: user.email,
                username: user.displayName || ""
            }));
            window.location.href = "/history.html"; // ✅ ไปหน้าประวัติหลังล็อกอิน
        } catch (error) {
            alert("❌ เข้าสู่ระบบล้มเหลว: " + error.message);
        }
    });

    // 📝 Register
    const registerBtn = document.getElementById("submit-register");
    registerBtn?.addEventListener("click", async () => {
        const name = document.getElementById("register-name").value;
        const email = document.getElementById("register-email").value;
        const password = document.getElementById("register-password").value;
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            await updateProfile(userCredential.user, { displayName: name });
            localStorage.setItem("isLoggedIn", "true");
            localStorage.setItem("user", JSON.stringify({
                uid: userCredential.user.uid,
                email: email,
                username: name
            }));
            window.location.href = "/history.html"; // ✅ ไปหน้าประวัติหลังสมัคร
        } catch (error) {
            alert("❌ สมัครสมาชิกล้มเหลว: " + error.message);
        }
    });

    // 🔄 Switch login/register
    document.getElementById("openRegister")?.addEventListener("click", (e) => {
        e.preventDefault();
        document.getElementById("loginForm").classList.add("hidden");
        document.getElementById("registerForm").classList.remove("hidden");
    });

    document.getElementById("backToLogin")?.addEventListener("click", (e) => {
        e.preventDefault();
        document.getElementById("registerForm").classList.add("hidden");
        document.getElementById("loginForm").classList.remove("hidden");
    });

    // ❌ Close Modal
    document.getElementById("closeModal")?.addEventListener("click", () => {
        document.getElementById("loginModal")?.classList.add("hidden");
    });

    // 🔄 เปลี่ยนปุ่ม Login ➝ ประวัติ / Logout
    document.addEventListener("DOMContentLoaded", () => {
        const loginBtn = document.getElementById("loginBtn");
        const logoutBtn = document.getElementById("logoutBtn");

        onAuthStateChanged(auth, (user) => {
            if (user) {
                loginBtn.textContent = "📜 ประวัติการสั่งซื้อ";
                loginBtn.href = "/history.html";
                logoutBtn?.classList.remove("hidden");
                logoutBtn?.addEventListener("click", async () => {
                    await signOut(auth);
                    localStorage.removeItem("isLoggedIn");
                    localStorage.removeItem("user");
                    window.location.reload();
                });
            } else {
                loginBtn.textContent = "🔑 Login";
                loginBtn.href = "#";
                loginBtn?.addEventListener("click", (e) => {
                    e.preventDefault();
                    document.getElementById("loginModal")?.classList.remove("hidden");
                });
                logoutBtn?.classList.add("hidden");
            }
        });
    });
}
