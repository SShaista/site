// Gestion du panier avec localStorage
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Sauvegarder le panier
function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
}

// Mettre à jour le compteur du panier
function updateCartCount() {
    const count = cart.reduce((total, item) => total + item.quantity, 0);
    document.querySelectorAll('.cart-count').forEach(el => {
        el.textContent = count;
    });
}

// Ajouter au panier
function addToCart(productId, name, price, image, size = 'M') {
    const existingItem = cart.find(item => item.id === productId && item.size === size);
    
    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({
            id: productId,
            name: name,
            price: price,
            image: image,
            size: size,
            quantity: 1
        });
    }
    
    saveCart();
    
    // Animation de confirmation
    showNotification('Produit ajouté au panier !');
}

// Supprimer du panier
function removeFromCart(productId, size) {
    cart = cart.filter(item => !(item.id === productId && item.size === size));
    saveCart();
    renderCartPage();
}

// Modifier quantité
function updateQuantity(productId, size, change) {
    const item = cart.find(item => item.id === productId && item.size === size);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            removeFromCart(productId, size);
        } else {
            saveCart();
            renderCartPage();
        }
    }
}

// Afficher notification
function showNotification(message) {
    const notif = document.createElement('div');
    notif.style.cssText = `
        position: fixed;
        bottom: 30px;
        right: 30px;
        background: var(--noir);
        color: white;
        padding: 20px 30px;
        z-index: 10000;
        animation: slideIn 0.3s ease;
        font-weight: 500;
    `;
    notif.textContent = message;
    document.body.appendChild(notif);
    
    setTimeout(() => {
        notif.remove();
    }, 3000);
}

// Rendu de la page panier
function renderCartPage() {
    const container = document.getElementById('cartItemsList');
    const summarySubtotal = document.getElementById('summarySubtotal');
    const summaryTotal = document.getElementById('summaryTotal');
    
    if (!container) return;
    
    if (cart.length === 0) {
        container.innerHTML = '<div style="text-align: center; padding: 60px;">Votre panier est vide</div>';
        if (summarySubtotal) summarySubtotal.textContent = '0€';
        if (summaryTotal) summaryTotal.textContent = '0€';
        return;
    }
    
    let subtotal = 0;
    container.innerHTML = cart.map(item => {
        subtotal += item.price * item.quantity;
        return `
            <div class="cart-item-row">
                <img src="${item.image}" alt="${item.name}">
                <div class="item-details">
                    <h3>${item.name}</h3>
                    <p>Taille: ${item.size}</p>
                </div>
                <div class="item-qty">
                    <button onclick="updateQuantity(${item.id}, '${item.size}', -1)">-</button>
                    <span>${item.quantity}</span>
                    <button onclick="updateQuantity(${item.id}, '${item.size}', 1)">+</button>
                </div>
                <div style="font-weight: 600;">${item.price * item.quantity}€</div>
                <button class="remove-btn" onclick="removeFromCart(${item.id}, '${item.size}')">×</button>
            </div>
        `;
    }).join('');
    
    const shipping = subtotal > 100 ? 0 : 10;
    const total = subtotal + shipping;
    
    if (summarySubtotal) summarySubtotal.textContent = subtotal + '€';
    if (document.getElementById('summaryShipping')) {
        document.getElementById('summaryShipping').textContent = shipping === 0 ? 'Gratuit' : shipping + '€';
    }
    if (summaryTotal) summaryTotal.textContent = total + '€';
}

// Menu mobile
function toggleMobileMenu() {
    const nav = document.querySelector('.nav-links');
    nav.classList.toggle('mobile-open');
}

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    updateCartCount();
    renderCartPage();
    
    // Animation au scroll
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    });
    
    document.querySelectorAll('.product-card').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'all 0.6s ease';
        observer.observe(el);
    });
});