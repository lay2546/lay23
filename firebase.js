// ✅ firebase-auth-modal.js
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore"; // ✅ Import Firestore
import { collection, addDoc, getDocs } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";
import { db } from "./firebase.js";

import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";

// 🔧 Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBIpu7d1kC_sjKAp9yhA11_fr9HVGXkEJk",
  authDomain: "lay01-a0522.firebaseapp.com",
  databaseURL: "https://lay01-a0522-default-rtdb.firebaseio.com",
  projectId: "lay01-a0522",
  storageBucket: "lay01-a0522.firebasestorage.app",
  messagingSenderId: "22588227396",
  appId: "1:22588227396:web:401bc67445565eee67a111",
  measurementId: "G-ND7FX0KBJ9"
};

// ✅ Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth();
export const db = getFirestore(app); // ✅ Initialize and export Firestore

// 🔐 Login and Registration Events
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
      window.location.reload();
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
      window.location.reload();
    } catch (error) {
      alert("❌ สมัครสมาชิกล้มเหลว: " + error.message);
    }
  });

  // 🔄 Toggle between Login and Register
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
    const modal = document.getElementById("loginModal");
    modal.classList.add("hidden");
    modal.style.display = "none";
  });
}

// 📌 Update Login Button and Logout Button Based on Auth State
document.addEventListener("DOMContentLoaded", () => {
  const loginBtn = document.getElementById("loginBtn");
  const logoutBtn = document.getElementById("logoutBtn");
  const auth = getAuth();

  auth.onAuthStateChanged((user) => {
    if (user) {
      // ✅ User is logged in
      if (loginBtn) {
        loginBtn.href = "history.html";
        loginBtn.textContent = "📜 ประวัติการสั่งซื้อ";
      }
      if (logoutBtn) {
        logoutBtn.classList.remove("hidden");
        logoutBtn.addEventListener("click", async () => {
          await signOut(auth);
          localStorage.removeItem("isLoggedIn");
          localStorage.removeItem("user");
          window.location.reload();
        });
      }
    } else {
      // ❌ User is not logged in
      if (loginBtn) {
        loginBtn.href = "#";
        loginBtn.textContent = "🔑 Login";
        loginBtn.addEventListener("click", (e) => {
          e.preventDefault();
          document.getElementById("loginModal")?.classList.remove("hidden");
        });
      }
      if (logoutBtn) {
        logoutBtn.classList.add("hidden");
      }
    }
  });
});

// โหลด login.html เข้ามาใน modal
const loginHtml = await fetch("login.html").then(res => res.text());
document.getElementById("loginContent").innerHTML = loginHtml;

// เรียกใช้ระบบ login event
import("./js/firebase-auth-modal.js").then(m => m.initLoginEvents());

async function addUserData(userId, userData) {
  try {
    const docRef = await addDoc(collection(db, "users"), {
      id: userId,
      ...userData,
    });
    console.log("Document written with ID: ", docRef.id);
  } catch (e) {
    console.error("Error adding document: ", e);
  }
}

async function getUsers() {
  const querySnapshot = await getDocs(collection(db, "users"));
  querySnapshot.forEach((doc) => {
    console.log(`${doc.id} =>`, doc.data());
  });
}
