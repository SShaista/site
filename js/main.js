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
    showNotification('Produit ajouté au panier !');
    
    // Animation sur l'icône panier
    const cartIcon = document.querySelector('.nav-icons a[href="panier.html"]');
    if (cartIcon) {
        cartIcon.style.transform = 'scale(1.2)';
        setTimeout(() => {
            cartIcon.style.transform = 'scale(1)';
        }, 200);
    }
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
    // Supprimer ancienne notification
    const oldNotif = document.querySelector('.notification');
    if (oldNotif) oldNotif.remove();
    
    const notif = document.createElement('div');
    notif.className = 'notification';
    notif.textContent = message;
    document.body.appendChild(notif);
    
    // Forcer le reflow
    notif.offsetHeight;
    
    notif.classList.add('show');
    
    setTimeout(() => {
        notif.classList.remove('show');
        setTimeout(() => notif.remove(), 300);
    }, 2500);
}

// Rendu de la page panier
function renderCartPage() {
    const container = document.getElementById('cartItemsList');
    const summarySubtotal = document.getElementById('summarySubtotal');
    const summaryTotal = document.getElementById('summaryTotal');
    const summaryShipping = document.getElementById('summaryShipping');
    
    if (!container) return;
    
    if (cart.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 60px 20px;">
                <div style="font-size: 48px; margin-bottom: 20px;">🛒</div>
                <h3 style="margin-bottom: 10px;">Votre panier est vide</h3>
                <p style="color: var(--gris); margin-bottom: 20px;">Découvrez nos produits</p>
                <a href="index.html" class="btn-primary" style="display: inline-block; width: auto; padding: 12px 30px;">Continuer les achats</a>
            </div>
        `;
        if (summarySubtotal) summarySubtotal.textContent = '0€';
        if (summaryTotal) summaryTotal.textContent = '0€';
        if (summaryShipping) summaryShipping.textContent = '-';
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
                    <div class="item-qty">
                        <button onclick="updateQuantity(${item.id}, '${item.size}', -1)">-</button>
                        <span>${item.quantity}</span>
                        <button onclick="updateQuantity(${item.id}, '${item.size}', 1)">+</button>
                    </div>
                </div>
                <div style="text-align: right;">
                    <div style="font-weight: 700; margin-bottom: 5px;">${item.price * item.quantity}€</div>
                    <button class="remove-btn" onclick="removeFromCart(${item.id}, '${item.size}')">×</button>
                </div>
            </div>
        `;
    }).join('');
    
    const shipping = subtotal > 100 ? 0 : 10;
    const total = subtotal + shipping;
    
    if (summarySubtotal) summarySubtotal.textContent = subtotal + '€';
    if (summaryShipping) {
        summaryShipping.textContent = shipping === 0 ? 'Gratuit' : shipping + '€';
    }
    if (summaryTotal) summaryTotal.textContent = total + '€';
}

// Menu mobile
function toggleMobileMenu() {
    const nav = document.querySelector('.nav-links');
    const overlay = document.querySelector('.menu-overlay');
    
    if (!overlay) {
        const newOverlay = document.createElement('div');
        newOverlay.className = 'menu-overlay';
        newOverlay.onclick = toggleMobileMenu;
        document.body.appendChild(newOverlay);
        setTimeout(() => newOverlay.classList.add('active'), 10);
    } else {
        overlay.classList.remove('active');
        setTimeout(() => overlay.remove(), 300);
    }
    
    nav.classList.toggle('mobile-open');
    
    // Empêcher le scroll du body quand menu ouvert
    document.body.style.overflow = nav.classList.contains('mobile-open') ? 'hidden' : '';
}

// Fermer menu en cliquant sur un lien
document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
        const nav = document.querySelector('.nav-links');
        const overlay = document.querySelector('.menu-overlay');
        if (nav.classList.contains('mobile-open')) {
            nav.classList.remove('mobile-open');
            if (overlay) {
                overlay.classList.remove('active');
                setTimeout(() => overlay.remove(), 300);
            }
            document.body.style.overflow = '';
        }
    });
});

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    updateCartCount();
    renderCartPage();
    
    // Animation au scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    document.querySelectorAll('.product-card').forEach((el, index) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = `all 0.6s ease ${index * 0.1}s`;
        observer.observe(el);
    });
});
