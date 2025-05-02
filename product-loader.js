// product-loader.js
import { db } from "./firebase.js";
import { collection, onSnapshot } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

export function loadProducts(category, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const q = collection(db, "products");

  onSnapshot(q, (snapshot) => {
    container.innerHTML = ""; // clear content
    snapshot.forEach(doc => {
      const data = doc.data();
      if (data.category !== category) return;

      const card = document.createElement("div");
      card.className = "product-card";
      card.innerHTML = `
        <img src="${data.image}" class="product-img" alt="${data.name}">
        <div class="product-body">
          <h5 class="product-title">${data.name}</h5>
          <p class="product-price">฿${data.price} / ชิ้น</p>
          <button class="add-to-cart" data-name="${data.name}" data-price="${data.price}">เพิ่มลงตะกร้า</button>
        </div>
      `;
      container.appendChild(card);
    });
  });
}
