// ===== DATA KERANJANG =====
let cart = [];

// ===== NOMOR WHATSAPP =====
const WA_NUMBER = '6285884609818'; // Ganti dengan nomor WA Anda

// ===== TAMBAH KE KERANJANG =====
function addToCart(nama, harga) {
  const existing = cart.find(item => item.nama === nama);

  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ nama, harga, qty: 1 });
  }

  renderCart();
  updateBadge();
  showToast(`✅ ${nama} ditambahkan ke keranjang`);
}

// ===== KURANGI QTY =====
function decreaseQty(nama) {
  const index = cart.findIndex(item => item.nama === nama);
  if (index === -1) return;

  if (cart[index].qty <= 1) {
    removeFromCart(nama);
  } else {
    cart[index].qty -= 1;
    renderCart();
    updateBadge();
  }
}

// ===== TAMBAH QTY =====
function increaseQty(nama) {
  const item = cart.find(item => item.nama === nama);
  if (item) {
    item.qty += 1;
    renderCart();
    updateBadge();
  }
}

// ===== HAPUS ITEM =====
function removeFromCart(nama) {
  cart = cart.filter(item => item.nama !== nama);
  renderCart();
  updateBadge();
  showToast(`🗑️ ${nama} dihapus dari keranjang`);
}

// ===== KOSONGKAN KERANJANG =====
function clearCart() {
  if (cart.length === 0) return;
  cart = [];
  renderCart();
  updateBadge();
  showToast('🗑️ Keranjang dikosongkan');
}

// ===== FORMAT RUPIAH =====
function formatRupiah(angka) {
  return 'Rp ' + angka.toLocaleString('id-ID');
}

// ===== HITUNG TOTAL =====
function getTotal() {
  return cart.reduce((sum, item) => sum + item.harga * item.qty, 0);
}

function getTotalQty() {
  return cart.reduce((sum, item) => sum + item.qty, 0);
}

// ===== RENDER KERANJANG =====
function renderCart() {
  const cartItemsEl = document.getElementById('cartItems');
  const cartEmptyEl = document.getElementById('cartEmpty');
  const cartSummaryEl = document.getElementById('cartSummary');
  const totalItemEl = document.getElementById('totalItem');
  const totalHargaEl = document.getElementById('totalHarga');

  // Hapus semua item lama (kecuali elemen empty)
  const existingItems = cartItemsEl.querySelectorAll('.cart-item');
  existingItems.forEach(el => el.remove());

  if (cart.length === 0) {
    cartEmptyEl.style.display = 'flex';
    cartSummaryEl.style.display = 'none';
    return;
  }

  cartEmptyEl.style.display = 'none';
  cartSummaryEl.style.display = 'flex';

  // Render setiap item
  cart.forEach(item => {
    const el = document.createElement('div');
    el.className = 'cart-item';
    el.innerHTML = `
      <div class="cart-item-info">
        <span class="cart-item-name">${item.nama}</span>
        <span class="cart-item-price">${formatRupiah(item.harga)} / satuan</span>
      </div>
      <div class="cart-item-controls">
        <button class="qty-btn" onclick="decreaseQty('${item.nama}')" aria-label="Kurangi">−</button>
        <span class="qty-value">${item.qty}</span>
        <button class="qty-btn" onclick="increaseQty('${item.nama}')" aria-label="Tambah">+</button>
        <button class="remove-btn" onclick="removeFromCart('${item.nama}')" aria-label="Hapus">🗑️</button>
      </div>
      <div class="cart-item-subtotal">${formatRupiah(item.harga * item.qty)}</div>
    `;
    // Insert sebelum elemen empty (agar urutan DOM aman)
    cartItemsEl.insertBefore(el, cartEmptyEl);
  });

  // Update total
  const total = getTotal();
  const totalQty = getTotalQty();
  totalItemEl.textContent = `${totalQty} item`;
  totalHargaEl.textContent = formatRupiah(total);
}

// ===== UPDATE BADGE =====
function updateBadge() {
  const badge = document.getElementById('cartBadge');
  const qty = getTotalQty();
  badge.textContent = qty;
  badge.classList.toggle('has-item', qty > 0);
}

// ===== TOGGLE SIDEBAR =====
function toggleCart() {
  const sidebar = document.getElementById('cartSidebar');
  const overlay = document.getElementById('cartOverlay');
  const isOpen = sidebar.classList.contains('open');

  sidebar.classList.toggle('open', !isOpen);
  overlay.classList.toggle('open', !isOpen);
  document.body.style.overflow = isOpen ? '' : 'hidden';
}

// ===== KIRIM KE WHATSAPP =====
function sendToWhatsApp() {
  if (cart.length === 0) {
    showToast('⚠️ Keranjang masih kosong!');
    return;
  }

  let pesan = '*Pesanan dari Warung Budi*\n';
  pesan += '─────────────────────\n';

  cart.forEach((item, index) => {
    pesan += `${index + 1}. ${item.nama}\n`;
    pesan += `   ${item.qty} x ${formatRupiah(item.harga)} = ${formatRupiah(item.harga * item.qty)}\n`;
  });

  pesan += '─────────────────────\n';
  pesan += `Total Item: ${getTotalQty()} item\n`;
  pesan += `Total Harga: *${formatRupiah(getTotal())}*\n\n`;
  pesan += 'Mohon konfirmasi ketersediaan dan ongkos kirim. Terima kasih!';

  const encoded = encodeURIComponent(pesan);
  const url = `https://wa.me/${WA_NUMBER}?text=${encoded}`;
  window.open(url, '_blank');
}

// ===== TOAST NOTIFIKASI =====
function showToast(pesan) {
  const toast = document.getElementById('toast');
  toast.textContent = pesan;
  toast.classList.add('show');
  clearTimeout(toast._timeout);
  toast._timeout = setTimeout(() => toast.classList.remove('show'), 2500);
}
