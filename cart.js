// =========================================================================
// DATA KERANJANG
// =========================================================================
let cart = [];

const WA_NUMBER = '6285884609818';

// =========================================================================
// STATE MODAL
// _variants : array of { label, harga }
// _selectedVariant : { label, harga } | null
// =========================================================================
let _modalNama       = '';
let _variants        = [];
let _selectedVariant = null;

// =========================================================================
// MODAL — BUKA / TUTUP
// =========================================================================

/**
 * Buka modal pemilihan varian.
 * @param {string} nama   - Nama produk
 * @param {Array}  variants - Array objek { label: string, harga: number }
 */
function openNoteModal(nama, variants) {
  _modalNama       = nama;
  _variants        = variants || [];
  _selectedVariant = null;

  document.getElementById('modalTitle').textContent = nama;
  document.getElementById('noteInput').value = '';
  updateModalHarga(); // tampilkan "Pilih varian..."

  // Render chip
  const chipGroup = document.getElementById('chipGroup');
  chipGroup.innerHTML = '';
  _variants.forEach((v, i) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'chip';
    // Tampilkan label + harga di chip
    btn.innerHTML =
      '<span class="chip-label">' + escText(v.label) + '</span>' +
      '<span class="chip-price">' + formatRupiah(v.harga) + '</span>';
    btn.dataset.idx = i;
    btn.addEventListener('click', () => selectVariant(btn, i));
    chipGroup.appendChild(btn);
  });

  document.getElementById('noteModal').classList.add('open');
  document.getElementById('modalOverlay').classList.add('open');
  document.body.style.overflow = 'hidden';

  setTimeout(() => document.getElementById('noteInput').focus(), 250);
}

function selectVariant(el, idx) {
  const v = _variants[idx];
  // Toggle off jika klik varian yang sama
  if (_selectedVariant && _selectedVariant.label === v.label) {
    _selectedVariant = null;
    document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
  } else {
    _selectedVariant = v;
    document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
    el.classList.add('active');
  }
  updateModalHarga();
}

function updateModalHarga() {
  const el = document.getElementById('modalHarga');
  if (_selectedVariant) {
    el.textContent = formatRupiah(_selectedVariant.harga);
    el.classList.add('has-price');
  } else {
    el.textContent = 'Pilih varian untuk melihat harga';
    el.classList.remove('has-price');
  }
}

function closeNoteModal() {
  document.getElementById('noteModal').classList.remove('open');
  document.getElementById('modalOverlay').classList.remove('open');
  document.body.style.overflow = '';
}

function confirmAddToCart() {
  if (!_selectedVariant) {
    // Goyang tombol konfirmasi sebagai feedback
    const btn = document.getElementById('btnConfirm');
    btn.classList.add('shake');
    setTimeout(() => btn.classList.remove('shake'), 400);
    showToast('Pilih varian terlebih dahulu');
    return;
  }

  const extraNote = document.getElementById('noteInput').value.trim();
  const note = extraNote
    ? _selectedVariant.label + ' · ' + extraNote
    : _selectedVariant.label;

  addToCart(_modalNama, _selectedVariant.harga, note);
  closeNoteModal();
}

// Tutup modal dengan Escape
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeNoteModal();
});

// =========================================================================
// KERANJANG — CRUD
// =========================================================================

function addToCart(nama, harga, note) {
  note = note || '';
  const key = nama + '||' + note;
  const existing = cart.find(item => item.key === key);

  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ key, nama, harga, qty: 1, note });
  }

  renderCart();
  updateBadge();
  showToast(nama + ' ditambahkan ke keranjang');
}

function decreaseQty(index) {
  if (index < 0 || index >= cart.length) return;
  if (cart[index].qty <= 1) {
    removeFromCart(index);
  } else {
    cart[index].qty -= 1;
    renderCart();
    updateBadge();
  }
}

function increaseQty(index) {
  if (index < 0 || index >= cart.length) return;
  cart[index].qty += 1;
  renderCart();
  updateBadge();
}

function removeFromCart(index) {
  if (index < 0 || index >= cart.length) return;
  const nama = cart[index].nama;
  cart.splice(index, 1);
  renderCart();
  updateBadge();
  showToast(nama + ' dihapus dari keranjang');
}

function clearCart() {
  if (cart.length === 0) return;
  cart = [];
  renderCart();
  updateBadge();
  showToast('Keranjang dikosongkan');
}

// =========================================================================
// RENDER KERANJANG
// =========================================================================

function formatRupiah(angka) {
  return 'Rp ' + angka.toLocaleString('id-ID');
}

function getTotal() {
  return cart.reduce((sum, item) => sum + item.harga * item.qty, 0);
}

function getTotalQty() {
  return cart.reduce((sum, item) => sum + item.qty, 0);
}

function renderCart() {
  const cartItemsEl   = document.getElementById('cartItems');
  const cartEmptyEl   = document.getElementById('cartEmpty');
  const cartSummaryEl = document.getElementById('cartSummary');
  const totalItemEl   = document.getElementById('totalItem');
  const totalHargaEl  = document.getElementById('totalHarga');

  cartItemsEl.querySelectorAll('.cart-item').forEach(el => el.remove());

  if (cart.length === 0) {
    cartEmptyEl.style.display = 'flex';
    cartSummaryEl.style.display = 'none';
    return;
  }

  cartEmptyEl.style.display = 'none';
  cartSummaryEl.style.display = 'flex';

  cart.forEach((item, idx) => {
    const el = document.createElement('div');
    el.className = 'cart-item';

    const noteEl = item.note
      ? '<span class="cart-item-note">' + escText(item.note) + '</span>'
      : '';

    el.innerHTML =
      '<div class="cart-item-info">' +
        '<span class="cart-item-name">' + escText(item.nama) + '</span>' +
        noteEl +
        '<span class="cart-item-price">' + formatRupiah(item.harga) + ' / satuan</span>' +
      '</div>' +
      '<div class="cart-item-controls">' +
        '<button class="qty-btn" data-action="dec" data-idx="' + idx + '" aria-label="Kurangi">−</button>' +
        '<span class="qty-value">' + item.qty + '</span>' +
        '<button class="qty-btn" data-action="inc" data-idx="' + idx + '" aria-label="Tambah">+</button>' +
        '<button class="remove-btn" data-action="del" data-idx="' + idx + '" aria-label="Hapus">' +
          '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">' +
            '<polyline points="3 6 5 6 21 6"/>' +
            '<path d="M19 6l-1 14H6L5 6"/>' +
            '<path d="M10 11v6"/><path d="M14 11v6"/>' +
            '<path d="M9 6V4h6v2"/>' +
          '</svg>' +
        '</button>' +
      '</div>' +
      '<div class="cart-item-subtotal">' + formatRupiah(item.harga * item.qty) + '</div>';

    cartItemsEl.insertBefore(el, cartEmptyEl);
  });

  totalItemEl.textContent  = getTotalQty() + ' item';
  totalHargaEl.textContent = formatRupiah(getTotal());
}

// Event delegation untuk tombol qty & hapus
document.getElementById('cartItems').addEventListener('click', e => {
  const btn = e.target.closest('[data-action]');
  if (!btn) return;
  const idx    = parseInt(btn.dataset.idx, 10);
  const action = btn.dataset.action;
  if (action === 'dec') decreaseQty(idx);
  if (action === 'inc') increaseQty(idx);
  if (action === 'del') removeFromCart(idx);
});

// =========================================================================
// BADGE & SIDEBAR
// =========================================================================

function updateBadge() {
  const badge = document.getElementById('cartBadge');
  const qty   = getTotalQty();
  badge.textContent = qty;
  badge.classList.toggle('has-item', qty > 0);
}

function toggleCart() {
  const sidebar = document.getElementById('cartSidebar');
  const overlay = document.getElementById('cartOverlay');
  const isOpen  = sidebar.classList.contains('open');
  sidebar.classList.toggle('open', !isOpen);
  overlay.classList.toggle('open', !isOpen);
  document.body.style.overflow = isOpen ? '' : 'hidden';
}

// =========================================================================
// WHATSAPP
// =========================================================================

function sendToWhatsApp() {
  if (cart.length === 0) {
    showToast('Keranjang masih kosong!');
    return;
  }

  const LINE = '\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\n';
  let pesan = '*Pesanan dari Warung Budi*\n' + LINE;

  cart.forEach((item, i) => {
    pesan += (i + 1) + '. ' + item.nama + '\n';
    if (item.note) pesan += '   Varian  : ' + item.note + '\n';
    pesan += '   Jumlah  : ' + item.qty + ' x ' + formatRupiah(item.harga) + '\n';
    pesan += '   Subtotal: ' + formatRupiah(item.harga * item.qty) + '\n';
  });

  pesan += LINE;
  pesan += 'Total Item  : ' + getTotalQty() + ' item\n';
  pesan += 'Total Harga : *' + formatRupiah(getTotal()) + '*\n\n';
  pesan += 'Mohon konfirmasi ketersediaan dan ongkos kirim. Terima kasih!';

  window.open('https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(pesan), '_blank');
}

// =========================================================================
// TOAST
// =========================================================================

function showToast(pesan) {
  const toast = document.getElementById('toast');
  toast.textContent = pesan;
  toast.classList.add('show');
  clearTimeout(toast._tid);
  toast._tid = setTimeout(() => toast.classList.remove('show'), 2500);
}

// =========================================================================
// UTIL
// =========================================================================

function escText(str) {
  const d = document.createElement('div');
  d.textContent = str;
  return d.innerHTML;
}
