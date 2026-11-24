// ========== DATA AWAL ==========
let products = [
    { id: 1, name: 'Smartphone X', price: 3500000, category: 'elektronik', image: 'https://picsum.photos/300/200?random=2' },
    { id: 2, name: 'Kaos Polos Premium', price: 75000, category: 'fashion', image: 'https://picsum.photos/300/200?random=3' },
    { id: 3, name: 'Kopi Arabika 250g', price: 45000, category: 'makanan', image: 'https://picsum.photos/300/200?random=4' },
    { id: 4, name: 'Lipstik Matte', price: 120000, category: 'kecantikan', image: 'https://picsum.photos/300/200?random=5' },
    { id: 5, name: 'Headphone Wireless', price: 800000, category: 'elektronik', image: 'https://picsum.photos/300/200?random=6' },
    { id: 6, name: 'Hoodie Casual', price: 180000, category: 'fashion', image: 'https://picsum.photos/300/200?random=7' }
];

let currentUser = null;
let currentRole = 'buyer';
let cart = [];
let currentCategory = 'all';
let searchQuery = '';

// ========== DOM ==========
const productList = document.getElementById('productList');
const cartCount = document.getElementById('cartCount');
const cartModal = document.getElementById('cartModal');
const cartItems = document.getElementById('cartItems');
const cartTotal = document.getElementById('cartTotal');
const authModal = document.getElementById('authModal');
const modalTitle = document.getElementById('modalTitle');
const authForm = document.getElementById('authForm');
const authMessage = document.getElementById('authMessage');
const userNameDisplay = document.getElementById('userNameDisplay');
const loginLink = document.getElementById('loginLink');
const registerLink = document.getElementById('registerLink');
const logoutLink = document.getElementById('logoutLink');
const sellerPanel = document.getElementById('sellerPanel');
const roleBuyer = document.getElementById('roleBuyer');
const roleSeller = document.getElementById('roleSeller');
const roleStatus = document.getElementById('roleStatus');
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const userBtn = document.getElementById('userBtn');
const userDropdown = document.getElementById('userDropdown');

// ========== UTILITAS ==========
const formatRupiah = (angka) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka);

function saveToLocalStorage() {
    localStorage.setItem('bukanshopeeProducts', JSON.stringify(products));
    localStorage.setItem('bukanshopeeUser', JSON.stringify(currentUser));
    localStorage.setItem('bukanshopeeCart', JSON.stringify(cart));
}

function loadFromLocalStorage() {
    const sp = localStorage.getItem('bukanshopeeProducts');
    if (sp) products = JSON.parse(sp);

    const su = localStorage.getItem('bukanshopeeUser');
    if (su && su !== 'null') {
        currentUser = JSON.parse(su);
        if (currentUser) updateUserUI();
    }

    const sc = localStorage.getItem('bukanshopeeCart');
    if (sc) cart = JSON.parse(sc);
}

function updateUserUI() {
    if (currentUser) {
        userNameDisplay.textContent = currentUser.username;
        loginLink.style.display = 'none';
        registerLink.style.display = 'none';
        logoutLink.style.display = 'block';
    } else {
        userNameDisplay.textContent = 'Tamu';
        loginLink.style.display = 'block';
        registerLink.style.display = 'block';
        logoutLink.style.display = 'none';
    }
}

// ========== RENDER PRODUK ==========
function renderProducts() {
    const filtered = products.filter(p => {
        const matchCat = currentCategory === 'all' || p.category === currentCategory;
        const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
        return matchCat && matchSearch;
    });

    if (filtered.length === 0) {
        productList.innerHTML = '<p style="text-align:center; grid-column:1/-1; padding:40px; color:#888;">Tidak ada produk ditemukan.</p>';
        return;
    }

    productList.innerHTML = filtered.map(p => `
        <div class="product-card">
            <img src="${p.image}" alt="${p.name}" class="product-img" onerror="this.src='https://picsum.photos/300/200?random=${p.id}'">
            <div class="product-info">
                <h4>${p.name}</h4>
                <div class="product-price">${formatRupiah(p.price)}</div>
                <div class="product-cat">${p.category}</div>
                <button class="add-to-cart" data-id="${p.id}" type="button">
                    <i class="fas fa-cart-plus"></i> Tambah ke Keranjang
                </button>
            </div>
        </div>
    `).join('');

    // Attach event setelah render
    document.querySelectorAll('.add-to-cart').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = parseInt(e.currentTarget.dataset.id);
            addToCart(id);
        });
    });
}

// ========== KERANJANG ==========
function addToCart(productId) {
    if (!currentUser) {
        alert('Silakan login terlebih dahulu untuk berbelanja.');
        showAuthModal('login');
        return;
    }
    if (currentRole === 'seller') {
        alert('Anda sedang dalam mode Penjual. Beralih ke mode Pembeli untuk berbelanja.');
        return;
    }

    const product = products.find(p => p.id === productId);
    if (!product) return;

    const existing = cart.find(item => item.id === productId);
    if (existing) {
        existing.qty += 1;
    } else {
        cart.push({ ...product, qty: 1 });
    }
    updateCartCount();
    saveToLocalStorage();
    alert(`✅ ${product.name} ditambahkan ke keranjang.`);
}

function updateCartCount() {
    const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);
    cartCount.textContent = totalQty;
}

function renderCart() {
    if (cart.length === 0) {
        cartItems.innerHTML = '<p style="text-align:center;color:#888;padding:20px;">Keranjang kosong.</p>';
        cartTotal.textContent = 'Rp 0';
        return;
    }

    cartItems.innerHTML = cart.map(item => `
        <div class="cart-item">
            <div class="cart-item-info">
                <strong>${item.name}</strong>
                ${formatRupiah(item.price)} × ${item.qty}
            </div>
            <div class="cart-item-actions">
                <button class="remove-item" data-id="${item.id}" type="button">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');

    const total = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    cartTotal.textContent = formatRupiah(total);

    document.querySelectorAll('.remove-item').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = parseInt(e.currentTarget.dataset.id);
            cart = cart.filter(item => item.id !== id);
            updateCartCount();
            renderCart();
            saveToLocalStorage();
        });
    });
}

function checkout() {
    if (!currentUser) { alert('Login dulu untuk checkout.'); return; }
    if (cart.length === 0) { alert('Keranjang kosong.'); return; }
    const total = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    alert(`✅ Checkout berhasil!\nTotal: ${formatRupiah(total)}\nTerima kasih telah berbelanja di Bukanshopee.`);
    cart = [];
    updateCartCount();
    renderCart();
    saveToLocalStorage();
    closeModal(cartModal);
}

// ========== AUTH ==========
function showAuthModal(type) {
    openModal(authModal);
    authForm.dataset.mode = type;
    if (type === 'login') {
        modalTitle.textContent = 'Login';
        document.getElementById('authSubmit').textContent = 'Login';
    } else {
        modalTitle.textContent = 'Daftar Akun';
        document.getElementById('authSubmit').textContent = 'Daftar';
    }
    authMessage.textContent = '';
    document.getElementById('username').value = '';
    document.getElementById('password').value = '';
}

function handleAuth(e) {
    e.preventDefault();
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
    const mode = authForm.dataset.mode || 'login';

    if (!username || !password) {
        authMessage.style.color = '#ee4d2d';
        authMessage.textContent = 'Username dan password wajib diisi.';
        return;
    }

    let users = JSON.parse(localStorage.getItem('bukanshopeeUsers') || '[]');

    if (mode === 'register') {
        if (users.find(u => u.username === username)) {
            authMessage.style.color = '#ee4d2d';
            authMessage.textContent = 'Username sudah terdaftar.';
            return;
        }
        users.push({ username, password });
        localStorage.setItem('bukanshopeeUsers', JSON.stringify(users));
        authMessage.style.color = 'green';
        authMessage.textContent = '✅ Registrasi berhasil! Silakan login.';
        setTimeout(() => showAuthModal('login'), 1200);
        return;
    }

    // Login
    if (users.length === 0) {
        users.push({ username: 'demo', password: 'demo' });
        localStorage.setItem('bukanshopeeUsers', JSON.stringify(users));
    }

    const found = users.find(u => u.username === username && u.password === password);
    if (!found) {
        authMessage.style.color = '#ee4d2d';
        authMessage.textContent = 'Username atau password salah. Coba demo/demo.';
        return;
    }

    currentUser = { username };
    updateUserUI();
    saveToLocalStorage();
    closeModal(authModal);
    alert(`Selamat datang, ${username}! 🎉`);
}

function logout() {
    if (!confirm('Yakin ingin logout?')) return;
    currentUser = null;
    updateUserUI();
    setRole('buyer');
    saveToLocalStorage();
    userDropdown.classList.remove('show');
}

// ========== ROLE ==========
function setRole(role) {
    currentRole = role;
    if (role === 'seller') {
        sellerPanel.style.display = 'block';
        roleStatus.textContent = 'Anda melihat sebagai Penjual (dapat menambah produk)';
        roleBuyer.classList.remove('active');
        roleSeller.classList.add('active');
    } else {
        sellerPanel.style.display = 'none';
        roleStatus.textContent = 'Anda melihat sebagai Pembeli';
        roleSeller.classList.remove('active');
        roleBuyer.classList.add('active');
    }
}

// ========== MODAL HELPERS ==========
function openModal(modal) { modal.classList.add('show'); }
function closeModal(modal) { modal.classList.remove('show'); }

// ========== TAMBAH PRODUK ==========
document.getElementById('addProductForm').addEventListener('submit', (e) => {
    e.preventDefault();
    if (!currentUser) {
        alert('Login terlebih dahulu untuk menambah produk.');
        showAuthModal('login');
        return;
    }
    if (currentRole !== 'seller') {
        alert('Beralih ke mode Penjual untuk menambah produk.');
        return;
    }

    const name = document.getElementById('prodName').value.trim();
    const price = parseInt(document.getElementById('prodPrice').value);
    const category = document.getElementById('prodCategory').value;
    const image = document.getElementById('prodImage').value.trim() ||
                  `https://picsum.photos/300/200?random=${Date.now()}`;

    if (!name || !price || price <= 0) {
        alert('Nama dan harga produk harus valid.');
        return;
    }

    const newId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;
    products.push({ id: newId, name, price, category, image });
    saveToLocalStorage();
    renderProducts();
    e.target.reset();
    alert(`✅ Produk "${name}" berhasil ditambahkan!`);
});

// ========== INIT ==========
document.addEventListener('DOMContentLoaded', () => {
    loadFromLocalStorage();
    renderProducts();
    updateCartCount();
    renderCart();
    setRole('buyer');

    // Toggle dropdown
    userBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        userDropdown.classList.toggle('show');
    });

    // Klik di luar dropdown → tutup
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.user-menu')) {
            userDropdown.classList.remove('show');
        }
    });

    // Login/Register
    loginLink.addEventListener('click', (e) => { e.preventDefault(); userDropdown.classList.remove('show'); showAuthModal('login'); });
    registerLink.addEventListener('click', (e) => { e.preventDefault(); userDropdown.classList.remove('show'); showAuthModal('register'); });
    logoutLink.addEventListener('click', (e) => { e.preventDefault(); logout(); });

    authForm.addEventListener('submit', handleAuth);
    document.getElementById('closeAuth').addEventListener('click', () => closeModal(authModal));
    document.getElementById('closeCart').addEventListener('click', () => closeModal(cartModal));

    // Klik backdrop modal → tutup
    authModal.addEventListener('click', (e) => { if (e.target === authModal) closeModal(authModal); });
    cartModal.addEventListener('click', (e) => { if (e.target === cartModal) closeModal(cartModal); });

    // Role
    roleBuyer.addEventListener('click', () => setRole('buyer'));
    roleSeller.addEventListener('click', () => setRole('seller'));

    // Kategori
    document.querySelectorAll('.cat-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
            e.currentTarget.classList.add('active');
            currentCategory = e.currentTarget.dataset.cat;
            renderProducts();
        });
    });

    // Search
    searchBtn.addEventListener('click', () => {
        searchQuery = searchInput.value;
        renderProducts();
    });
    searchInput.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') {
            searchQuery = searchInput.value;
            renderProducts();
        }
    });

    // Cart
    document.getElementById('cartBtn').addEventListener('click', () => {
        if (!currentUser) {
            alert('Login dulu untuk melihat keranjang.');
            showAuthModal('login');
            return;
        }
        renderCart();
        openModal(cartModal);
    });
    document.getElementById('checkoutBtn').addEventListener('click', checkout);

    // User default
    if (!localStorage.getItem('bukanshopeeUsers')) {
        localStorage.setItem('bukanshopeeUsers', JSON.stringify([{ username: 'demo', password: 'demo' }]));
    }
});