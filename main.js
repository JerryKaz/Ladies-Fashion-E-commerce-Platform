/**
 * ATELIER LUXE - Main JavaScript File
 * Handles core functionality across the e-commerce platform
 */

// Global variables
let cart = [];
let wishlist = [];
let currentUser = null;

// Initialize application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    // Load data from localStorage
    loadCart();
    loadWishlist();
    loadUser();
    
    // Initialize common functionality
    initializeScrollAnimations();
    initializeNotifications();
    initializeServiceWorker();
    
    // Update UI elements
    updateCartCount();
    updateWishlistCount();
}

// ==================== CART FUNCTIONALITY ====================

function loadCart() {
    try {
        const savedCart = localStorage.getItem('cart');
        cart = savedCart ? JSON.parse(savedCart) : [];
    } catch (error) {
        console.error('Error loading cart:', error);
        cart = [];
    }
}

function saveCart() {
    try {
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartCount();
        updateCartUI();
    } catch (error) {
        console.error('Error saving cart:', error);
    }
}

function addToCart(productId, quantity = 1, size = null, color = null) {
    const product = getProductById(productId);
    if (!product) {
        showNotification('Product not found', 'error');
        return false;
    }

    // Check if item already exists in cart
    const existingItem = cart.find(item => 
        item.id === productId && 
        item.size === size && 
        item.color === color
    );

    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({
            id: productId,
            name: product.name,
            price: product.price,
            image: product.image,
            quantity: quantity,
            size: size,
            color: color,
            addedAt: new Date().toISOString()
        });
    }

    saveCart();
    showNotification(`${product.name} added to cart!`, 'success');
    
    // Trigger cart animation
    animateCartIcon();
    
    return true;
}

function removeFromCart(productId, size = null, color = null) {
    const initialLength = cart.length;
    
    cart = cart.filter(item => 
        !(item.id === productId && 
          item.size === size && 
          item.color === color)
    );
    
    if (cart.length < initialLength) {
        saveCart();
        showNotification('Item removed from cart', 'info');
        return true;
    }
    
    return false;
}

function updateCartQuantity(productId, newQuantity, size = null, color = null) {
    if (newQuantity <= 0) {
        return removeFromCart(productId, size, color);
    }

    const item = cart.find(item => 
        item.id === productId && 
        item.size === size && 
        item.color === color
    );

    if (item) {
        item.quantity = newQuantity;
        saveCart();
        return true;
    }
    
    return false;
}

function clearCart() {
    cart = [];
    saveCart();
    showNotification('Cart cleared', 'info');
}

function getCartTotal() {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
}

function getCartItemCount() {
    return cart.reduce((count, item) => count + item.quantity, 0);
}

function updateCartCount() {
    const cartCountElements = document.querySelectorAll('#cartCount, .cart-count');
    const totalItems = getCartItemCount();
    
    cartCountElements.forEach(element => {
        if (element) {
            element.textContent = totalItems;
            
            // Animate count update
            if (totalItems > 0) {
                element.style.transform = 'scale(1.2)';
                setTimeout(() => {
                    element.style.transform = 'scale(1)';
                }, 200);
            }
        }
    });
}

function updateCartUI() {
    // Update any cart-related UI elements
    const cartTotalElements = document.querySelectorAll('.cart-total');
    const total = getCartTotal();
    
    cartTotalElements.forEach(element => {
        if (element) {
            element.textContent = `$${total.toFixed(2)}`;
        }
    });
}

function animateCartIcon() {
    const cartIcon = document.querySelector('.cart-icon');
    if (cartIcon) {
        cartIcon.style.animation = 'bounce 0.5s ease-in-out';
        setTimeout(() => {
            cartIcon.style.animation = '';
        }, 500);
    }
}

// ==================== WISHLIST FUNCTIONALITY ====================

function loadWishlist() {
    try {
        const savedWishlist = localStorage.getItem('wishlist');
        wishlist = savedWishlist ? JSON.parse(savedWishlist) : [];
    } catch (error) {
        console.error('Error loading wishlist:', error);
        wishlist = [];
    }
}

function saveWishlist() {
    try {
        localStorage.setItem('wishlist', JSON.stringify(wishlist));
        updateWishlistCount();
    } catch (error) {
        console.error('Error saving wishlist:', error);
    }
}

function addToWishlist(productId) {
    const product = getProductById(productId);
    if (!product) {
        showNotification('Product not found', 'error');
        return false;
    }

    const existingItem = wishlist.find(item => item.id === productId);
    
    if (existingItem) {
        showNotification('Item already in wishlist', 'info');
        return false;
    }

    wishlist.push({
        id: productId,
        name: product.name,
        price: product.price,
        image: product.image,
        addedAt: new Date().toISOString()
    });

    saveWishlist();
    showNotification(`${product.name} added to wishlist!`, 'success');
    return true;
}

function removeFromWishlist(productId) {
    const initialLength = wishlist.length;
    wishlist = wishlist.filter(item => item.id !== productId);
    
    if (wishlist.length < initialLength) {
        saveWishlist();
        showNotification('Item removed from wishlist', 'info');
        return true;
    }
    
    return false;
}

function updateWishlistCount() {
    const wishlistCountElements = document.querySelectorAll('#wishlistCount, .wishlist-count');
    const count = wishlist.length;
    
    wishlistCountElements.forEach(element => {
        if (element) {
            element.textContent = count;
        }
    });
}

function toggleWishlist(productId) {
    const isInWishlist = wishlist.some(item => item.id === productId);
    
    if (isInWishlist) {
        return removeFromWishlist(productId);
    } else {
        return addToWishlist(productId);
    }
}

// ==================== PRODUCT DATA ====================

function getProductById(productId) {
    // Mock product database - in a real app, this would come from an API
    const products = [
        {
            id: 'elegant-maxi-dress',
            name: 'Elegant Maxi Dress',
            category: 'dresses',
            price: 299,
            originalPrice: 399,
            image: 'https://kimi-web-img.moonshot.cn/img/img.freepik.com/82d920c9652766e87ec92a7a8f7135cc48e7c8c7.jpg',
            description: 'Flowing silk maxi dress with elegant drape and modern silhouette.',
            colors: ['black', 'cream', 'burgundy'],
            sizes: ['XS', 'S', 'M', 'L'],
            inStock: true,
            stockQuantity: 15
        },
        {
            id: 'luxury-tote-bag',
            name: 'Luxury Tote Bag',
            category: 'bags',
            price: 459,
            originalPrice: 459,
            image: 'https://kimi-web-img.moonshot.cn/img/www.photigy.com/ba2f241897f3be90e0fe732bbb319bf46c01267d.jpg',
            description: 'Premium leather tote with sophisticated hardware and spacious interior.',
            colors: ['black', 'brown', 'cream'],
            sizes: ['One Size'],
            inStock: true,
            stockQuantity: 8
        },
        {
            id: 'cashmere-blazer',
            name: 'Cashmere Blazer',
            category: 'outerwear',
            price: 599,
            originalPrice: 799,
            image: 'https://kimi-web-img.moonshot.cn/img/media.istockphoto.com/e037b1c914af3468e1938e79c6b3273dde643531.jpg',
            description: 'Luxurious cashmere blazer with impeccable tailoring.',
            colors: ['black', 'navy', 'cream'],
            sizes: ['XS', 'S', 'M', 'L', 'XL'],
            inStock: true,
            stockQuantity: 12
        },
        {
            id: 'silk-blouse',
            name: 'Silk Blouse',
            category: 'tops',
            price: 189,
            originalPrice: 189,
            image: 'https://kimi-web-img.moonshot.cn/img/cdn.fstoppers.com/3fdb6e4ebe1e7182a5d2950aa9eb4d2b25d02f96.jpg',
            description: 'Elegant silk blouse with modern tailoring and luxurious feel.',
            colors: ['white', 'cream', 'black'],
            sizes: ['XS', 'S', 'M', 'L'],
            inStock: true,
            stockQuantity: 20
        },
        {
            id: 'crossbody-bag',
            name: 'Crossbody Bag',
            category: 'bags',
            price: 329,
            originalPrice: 329,
            image: 'https://kimi-web-img.moonshot.cn/img/perfect-studio.in/e2fd81e8472b238157e9bdd5f04505d73dd31eb0.webp',
            description: 'Versatile crossbody bag with adjustable strap and multiple compartments.',
            colors: ['black', 'brown', 'burgundy'],
            sizes: ['One Size'],
            inStock: true,
            stockQuantity: 10
        },
        {
            id: 'wide-leg-trousers',
            name: 'Wide-Leg Trousers',
            category: 'bottoms',
            price: 249,
            originalPrice: 249,
            image: 'https://kimi-web-img.moonshot.cn/img/images.squarespace-cdn.com/ef093675583c719b10907a0dc884ead0a96fdf35.jpg',
            description: 'Modern wide-leg trousers with perfect drape and comfortable fit.',
            colors: ['black', 'navy', 'cream'],
            sizes: ['XS', 'S', 'M', 'L', 'XL'],
            inStock: true,
            stockQuantity: 18
        }
    ];

    return products.find(product => product.id === productId);
}

function searchProducts(query) {
    const products = [
        {
            id: 'elegant-maxi-dress',
            name: 'Elegant Maxi Dress',
            category: 'dresses',
            price: 299,
            image: 'https://kimi-web-img.moonshot.cn/img/img.freepik.com/82d920c9652766e87ec92a7a8f7135cc48e7c8c7.jpg'
        },
        {
            id: 'luxury-tote-bag',
            name: 'Luxury Tote Bag',
            category: 'bags',
            price: 459,
            image: 'https://kimi-web-img.moonshot.cn/img/www.photigy.com/ba2f241897f3be90e0fe732bbb319bf46c01267d.jpg'
        },
        {
            id: 'cashmere-blazer',
            name: 'Cashmere Blazer',
            category: 'outerwear',
            price: 599,
            image: 'https://kimi-web-img.moonshot.cn/img/media.istockphoto.com/e037b1c914af3468e1938e79c6b3273dde643531.jpg'
        }
    ];

    const lowercaseQuery = query.toLowerCase();
    return products.filter(product => 
        product.name.toLowerCase().includes(lowercaseQuery) ||
        product.category.toLowerCase().includes(lowercaseQuery)
    );
}

// ==================== USER MANAGEMENT ====================

function loadUser() {
    try {
        const savedUser = localStorage.getItem('currentUser');
        currentUser = savedUser ? JSON.parse(savedUser) : null;
    } catch (error) {
        console.error('Error loading user:', error);
        currentUser = null;
    }
}

function saveUser(user) {
    try {
        currentUser = user;
        localStorage.setItem('currentUser', JSON.stringify(user));
    } catch (error) {
        console.error('Error saving user:', error);
    }
}

function logout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    showNotification('Logged out successfully', 'info');
    
    // Redirect to home page
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1000);
}

// ==================== NOTIFICATIONS ====================

function showNotification(message, type = 'info', duration = 3000) {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => {
        notification.remove();
    });

    // Create new notification
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;

    // Style the notification
    const colors = {
        success: '#28a745',
        error: '#dc3545',
        warning: '#ffc107',
        info: '#8B2635'
    };

    Object.assign(notification.style, {
        position: 'fixed',
        top: '100px',
        right: '20px',
        background: colors[type] || colors.info,
        color: 'white',
        padding: '1rem 2rem',
        borderRadius: '8px',
        zIndex: '10000',
        fontWeight: '500',
        transform: 'translateX(100%)',
        transition: 'transform 0.3s ease',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
        maxWidth: '400px',
        wordWrap: 'break-word'
    });

    document.body.appendChild(notification);

    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);

    // Animate out and remove
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, duration);
}

function initializeNotifications() {
    // Add CSS for notification animations
    const style = document.createElement('style');
    style.textContent = `
        @keyframes bounce {
            0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
            40% { transform: translateY(-10px); }
            60% { transform: translateY(-5px); }
        }
    `;
    document.head.appendChild(style);
}

// ==================== SCROLL ANIMATIONS ====================

function initializeScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                
                // Add staggered animation for multiple elements
                const index = Array.from(entry.target.parentNode.children).indexOf(entry.target);
                entry.target.style.animationDelay = `${index * 0.1}s`;
            }
        });
    }, observerOptions);

    // Observe elements with fade-in class
    document.querySelectorAll('.fade-in').forEach(el => {
        observer.observe(el);
    });
}

// ==================== FORM VALIDATION ====================

function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function validatePhone(phone) {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
}

function validateForm(formElement) {
    const requiredFields = formElement.querySelectorAll('[required]');
    let isValid = true;

    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            field.classList.add('error');
            isValid = false;
            
            // Show error message
            const errorElement = field.parentNode.querySelector('.error-message');
            if (errorElement) {
                errorElement.style.display = 'block';
            }
        } else {
            field.classList.remove('error');
            
            // Hide error message
            const errorElement = field.parentNode.querySelector('.error-message');
            if (errorElement) {
                errorElement.style.display = 'none';
            }

            // Additional validation for specific field types
            if (field.type === 'email' && !validateEmail(field.value)) {
                field.classList.add('error');
                isValid = false;
            }
            
            if (field.type === 'tel' && !validatePhone(field.value)) {
                field.classList.add('error');
                isValid = false;
            }
        }
    });

    return isValid;
}

// ==================== PAYMENT PROCESSING ====================

function processPayment(paymentData) {
    // Simulate payment processing
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            // Simulate 90% success rate
            if (Math.random() > 0.1) {
                resolve({
                    success: true,
                    transactionId: 'TXN-' + Date.now(),
                    message: 'Payment processed successfully'
                });
            } else {
                reject({
                    success: false,
                    error: 'Payment failed. Please try again.',
                    code: 'PAYMENT_ERROR'
                });
            }
        }, 2000);
    });
}

function formatCurrency(amount, currency = 'USD') {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency
    }).format(amount);
}

// ==================== GEOLOCATION ====================

function getCurrentPosition() {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error('Geolocation is not supported'));
            return;
        }

        navigator.geolocation.getCurrentPosition(
            position => {
                resolve({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    accuracy: position.coords.accuracy
                });
            },
            error => {
                reject(error);
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 300000
            }
        );
    });
}

// ==================== UTILITY FUNCTIONS ====================

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

function formatDate(date) {
    return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }).format(new Date(date));
}

function generateId() {
    return 'id-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
}

function copyToClipboard(text) {
    if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(() => {
            showNotification('Copied to clipboard!', 'success');
        }).catch(() => {
            fallbackCopyToClipboard(text);
        });
    } else {
        fallbackCopyToClipboard(text);
    }
}

function fallbackCopyToClipboard(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
        document.execCommand('copy');
        showNotification('Copied to clipboard!', 'success');
    } catch (err) {
        showNotification('Failed to copy to clipboard', 'error');
    }
    document.body.removeChild(textArea);
}

// ==================== SERVICE WORKER ====================

function initializeServiceWorker() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('Service Worker registered successfully:', registration);
            })
            .catch(error => {
                console.log('Service Worker registration failed:', error);
            });
    }
}

// ==================== PERFORMANCE MONITORING ====================

function measurePageLoad() {
    window.addEventListener('load', () => {
        const loadTime = performance.now();
        console.log(`Page loaded in ${loadTime.toFixed(2)}ms`);
        
        // Send analytics data
        if (typeof gtag !== 'undefined') {
            gtag('event', 'page_load_time', {
                value: Math.round(loadTime)
            });
        }
    });
}

// ==================== ERROR HANDLING ====================

window.addEventListener('error', function(e) {
    console.error('JavaScript error:', e.error);
    showNotification('Something went wrong. Please refresh the page.', 'error');
});

window.addEventListener('unhandledrejection', function(e) {
    console.error('Unhandled promise rejection:', e.reason);
    showNotification('Something went wrong. Please try again.', 'error');
});

// ==================== EXPORT FUNCTIONS ====================

// Make functions available globally
window.atelierLuxe = {
    // Cart functions
    addToCart,
    removeFromCart,
    updateCartQuantity,
    clearCart,
    getCartTotal,
    getCartItemCount,
    
    // Wishlist functions
    addToWishlist,
    removeFromWishlist,
    toggleWishlist,
    
    // Product functions
    getProductById,
    searchProducts,
    
    // User functions
    saveUser,
    logout,
    
    // Utility functions
    showNotification,
    validateForm,
    validateEmail,
    validatePhone,
    formatCurrency,
    formatDate,
    copyToClipboard,
    debounce,
    throttle,
    generateId,
    
    // Payment functions
    processPayment,
    
    // Geolocation functions
    getCurrentPosition
};

// Initialize performance monitoring
measurePageLoad();

// Log successful initialization
console.log('ATELIER LUXE - Main JavaScript loaded successfully');