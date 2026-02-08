// js/ui.js
import { isLoggedIn, logout } from './auth.js';
import { getSellerType } from './adminAuth.js';
import { CartManager, setCartUpdateCallback } from './cart.js';
import * as api from './api.js';

// Global variables to track admin type (accessible to all event listeners)
let isMainAdmin = false;
let isFurnitureAdmin = false;
let isClothesAdmin = false;
let isKidsAdmin = false;

// Set up cart update callback
setCartUpdateCallback(() => {
    updateFloatingCartButton();
});

// This category data remains on the client for UI purposes (hero images, titles)
export let categoryData = {
    'phones': { name: 'Phones', heroImage: 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbf1?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80', subcategories: ['iphones', 'samsung-phones'] },
    'iphones': { name: 'iPhones', heroImage: 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80' },
    'samsung-phones': { name: 'Samsung Phones', heroImage: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80' },
    'tablets': { name: 'Tablets', heroImage: 'https://images.unsplash.com/photo-1561152044-723469344474?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80', subcategories: ['ipads', 'samsung-tabs', 'lenovo-tabs'] },
    'ipads': { name: 'iPads', heroImage: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80' },
    'samsung-tabs': { name: 'Samsung Tabs', heroImage: 'https://images.unsplash.com/photo-1607839396729-bab2a0619a69?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80' },
    'lenovo-tabs': { name: 'Lenovo/Android Tabs', heroImage: 'https://images.unsplash.com/photo-1518770660439-4636190af475?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80' },
    'laptops': { name: 'Laptops & Computers', heroImage: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80', subcategories: ['macbooks', 'dell-laptops', 'hp-laptops', 'imacs', 'hp-aio'] },
    'macbooks': { name: 'MacBooks', heroImage: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80' },
    'dell-laptops': { name: 'Dell Laptops', heroImage: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80' },
    'hp-laptops': { name: 'HP Laptops', heroImage: 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80' },
    'imacs': { name: 'iMacs', heroImage: 'https://images.unsplash.com/photo-1527443154391-507e9dc6c5cc?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80' },
    'hp-aio': { name: 'HP All-in-One', heroImage: 'https://images.unsplash.com/photo-1616353033707-23c8e5c7b1f8?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80' },
    'gaming': { name: 'Gaming', heroImage: 'https://images.unsplash.com/photo-1550745165-9bc0b252726a?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80', subcategories: ['playstation', 'xbox', 'gaming-accessories'] },
    'playstation': { name: 'PlayStation', heroImage: 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80' },
    'xbox': { name: 'Xbox', heroImage: 'https://images.unsplash.com/photo-1627885824424-a481c4ea2105?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80' },
    'gaming-accessories': { name: 'Gaming Accessories', heroImage: 'https://images.unsplash.com/photo-1593305841991-05c297ba4575?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80' },
    'clothing': { name: 'Clothing', heroImage: 'https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=1350&q=80', subcategories: ['womens-clothing', 'mens-clothing'] },
    // Aliases for nav links that use 'clothes' naming
    'clothes': { name: 'Clothing', heroImage: 'https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=1350&q=80', subcategories: ['womens-clothes', 'mens-clothes'] },
    'womens-clothing': { name: "Women's Clothes", parent: 'clothing', heroImage: 'https://images.unsplash.com/photo-1572804013427-4d7ca726b655?auto=format&fit=crop&w=1350&q=80' },
    'mens-clothing': { name: "Men's Clothes", parent: 'clothing', heroImage: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=1350&q=80' },
    // Aliases matching nav subpage keys
    'womens-clothes': { name: "Women's Clothes", parent: 'clothing', heroImage: 'https://images.unsplash.com/photo-1572804013427-4d7ca726b655?auto=format&fit=crop&w=1350&q=80' },
    'mens-clothes': { name: "Men's Clothes", parent: 'clothing', heroImage: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=1350&q=80' },
    'kids': { name: 'For Kids', heroImage: 'https://images.unsplash.com/photo-1518831004940-a39c9a0a4176?auto=format&fit=crop&w=1350&q=80' },
    'furniture': { name: 'Furniture', heroImage: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1350&q=80', subcategories: ['chairs', 'tables', 'sofas'] },
    // Alias plural in case nav uses 'furnitures'
    'furnitures': { name: 'Furniture', heroImage: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1350&q=80', subcategories: ['living-room','bedroom','office'] },
    'chairs': { name: 'Chairs', parent: 'furniture', heroImage: 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&w=1350&q=80' },
    'tables': { name: 'Tables', parent: 'furniture', heroImage: 'https://images.unsplash.com/photo-1604014237800-1c9102c219da?auto=format&fit=crop&w=1350&q=80' },
    'sofas': { name: 'Sofas', parent: 'furniture', heroImage: 'https://images.unsplash.com/photo-1540574163026-6addeaabfcdb?auto=format&fit=crop&w=1350&q=80' },
    // Nav uses 'living-room','bedroom','office' — ensure hero images exist for these subpages
    'living-room': { name: 'Living Room', parent: 'furniture', heroImage: 'https://images.unsplash.com/photo-1540574163026-6addeaabfcdb?auto=format&fit=crop&w=1350&q=80' },
    'bedroom': { name: 'Bedroom', parent: 'furniture', heroImage: 'https://images.unsplash.com/photo-1604014237800-1c9102c219da?auto=format&fit=crop&w=1350&q=80' },
    'office': { name: 'Office', parent: 'furniture', heroImage: 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&w=1350&q=80' },
    'trending': { name: 'Trending Now', heroImage: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80' },
    'new-arrivals': { name: 'New Arrivals', heroImage: 'https://images.unsplash.com/photo-1546054454-aa26e2b734c7?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80' },
    'on-sale': { name: 'On Sale', heroImage: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80' },
    'trade-in': { name: 'Trade-In Your Device', heroImage: 'https://images.unsplash.com/photo-1579934200670-35a01533d308?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80' },
    'second-hand': { name: 'Second-Hand Devices', heroImage: 'https://images.unsplash.com/photo-1598327105666-658454354c03?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80' },
    'combos': { name: 'Super Combos', heroImage: 'https://images.unsplash.com/photo-1572594691920-87d1b7b7a8a0?auto=format&fit=crop&w=800&q=60' }
};

export const updateCategoryData = (settings) => {
    for (const key in settings) {
        if (key.startsWith('heroImage_') && categoryData[key.replace('heroImage_', '')]) {
            categoryData[key.replace('heroImage_', '')].heroImage = settings[key];
        }
    }
};

const appRoot = document.getElementById('app-root');

export const clearRoot = () => {
    appRoot.innerHTML = '';
};

// --- Floating Cart Button ---
export const updateFloatingCartButton = () => {
    const cartCount = CartManager.getCartCount();
    const isUserLoggedIn = isLoggedIn();

    const headerCart = document.getElementById('header-cart-btn') || document.querySelector('.cart');
    if (headerCart) {
        const hb = headerCart.querySelector('.cart-badge');
        if (hb) hb.textContent = cartCount;
        // Always ensure the floating cart is visible (like AI assistant)
        headerCart.classList.remove('hidden');
    }
};

// Call this function after every state change that affects cart or login
export const initFloatingCart = () => {
    updateFloatingCartButton();
};

// --- Helper Functions ---
const formatCurrency = (amount) => `N$${amount.toLocaleString()}`;

// Calculate remaining time until a date and return formatted string
export const calculateTimeRemaining = (endDate) => {
    if (!endDate) return null;
    const now = new Date();
    const end = new Date(endDate);
    const diff = end - now;
    
    if (diff <= 0) return null; // Time has expired
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const secs = Math.floor((diff % (1000 * 60)) / 1000);
    
    if (days > 0) {
        return `${days}d ${hours}h ${mins}m`;
    } else if (hours > 0) {
        return `${hours}h ${mins}m ${secs}s`;
    } else {
        return `${mins}m ${secs}s`;
    }
};

// Start live timer updates for all timers on the current page
export const startLiveTimerUpdates = () => {
    if (window.liveTimerInterval) {
        clearInterval(window.liveTimerInterval);
    }

    window.liveTimerInterval = setInterval(() => {
        const allTimers = document.querySelectorAll('.product-timer .timer-countdown, .product-detail-timer .timer-display-large');
        let hasActiveTimers = false;

        allTimers.forEach(el => {
            const parent = el.closest('[data-sale-end-date], [data-combo-end-date]');
            if (!parent) return;

            const saleDate = parent.dataset.saleEndDate;
            const comboDate = parent.dataset.comboEndDate;
            const dateToUse = comboDate || saleDate; 

            if (dateToUse) {
                const timeLeft = calculateTimeRemaining(dateToUse);
                if (timeLeft) {
                    el.textContent = timeLeft;
                    hasActiveTimers = true;
                } else {
                    el.closest('.product-timer, .product-detail-timer').style.display = 'none';
                }
            }
        });

        if (!hasActiveTimers) {
            clearInterval(window.liveTimerInterval);
        }
    }, 1000);
};

const renderStars = (rating, reviewCount) => {
    if (!rating || reviewCount === 0) return `<div class="not-rated">Not Rated</div>`;
    let stars = '';
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 !== 0;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

    for (let i = 0; i < fullStars; i++) stars += '<i class="fas fa-star"></i>';
    if (halfStar) stars += '<i class="fas fa-star-half-alt"></i>';
    for (let i = 0; i < emptyStars; i++) stars += '<i class="far fa-star"></i>';
    
    if (reviewCount !== undefined) {
        return `${stars} <span>(${reviewCount} reviews)</span>`;
    }
    return stars;
};

const createProductTags = (product, pageType) => {
    let rightTags = '';
    let leftTags = '';
    // Do not render the save-tag on product cards — show saved amount in product detail text instead.
    if (product.stock !== undefined && product.stock !== null) {
        leftTags += `<div class="product-tag stock-badge" style="background: linear-gradient(135deg, #cb152d, #ff6b6b);">${product.stock} left</div>`;
    }

    // *** MODIFICATION START ***
    // Add a combo badge if the product is part of the 'combos' curated page
    if (product.curatedPages && product.curatedPages.includes('combos')) {
        rightTags += `<div class="product-tag combo-tag">COMBO</div>`;
    }
    // *** MODIFICATION END ***

    if (product.onSale && product.saleEndDate && new Date(product.saleEndDate) > new Date()) {
        if (pageType !== 'detail') {
            rightTags += `<div class="product-tag sale-tag">SALE</div>`;
        }
    }
    
    if (product.condition === 'second-hand') {
        rightTags += `<div class="product-tag second-hand-tag">PRE-OWNED</div>`;
    }
    
    return `
        ${leftTags ? `<div class="product-tags-left">${leftTags}</div>` : ''}
        ${rightTags ? `<div class="product-tags">${rightTags}</div>` : ''}
    `;
};


const createProductCard = (product) => {
    const isSoldOut = product.stock !== undefined && product.stock <= 0;
    const isCombo = product.curatedPages && product.curatedPages.includes('combos');
    const comboTimeLeft = isCombo ? calculateTimeRemaining(product.comboEndDate) : null;
    const saleTimeLeft = product.onSale ? calculateTimeRemaining(product.saleEndDate) : null;
    const savedAmount = product.oldPrice - product.currentPrice;
    
    let timerHTML = '';
    if (saleTimeLeft) {
        timerHTML += `<div class="product-timer sale-timer"><span class="timer-label">Sale Ends:</span> <span class="timer-countdown">${saleTimeLeft}</span></div>`;
    } else if (comboTimeLeft) {
        timerHTML += `<div class="product-timer sale-timer" style="background: linear-gradient(135deg, var(--corporate-blue), #2a7fec); border: 2px solid #4dabf7;"><span class="timer-label">Combo Ends:</span> <span class="timer-countdown">${comboTimeLeft}</span></div>`;
    }
    
    // Only show rating if there is at least one review linked to a viewer
    const viewerLinkedReviews = (product.reviews || []).filter(r => r.viewerId);
    return `
        <a href="#product/${product.productId}" class="product-card" data-id="${product.productId}" data-sale-end-date="${product.saleEndDate || ''}" data-combo-end-date="${product.comboEndDate || ''}">
            <div class="product-image">
                ${createProductTags(product, 'card')}
                ${timerHTML}
                <img src="${product.image}" alt="${product.title}">
            </div>
            <div class="product-details">
                <h3 class="product-title">${product.title}</h3>
                ${viewerLinkedReviews.length > 0 ? `<div class="product-rating">${renderStars(product.rating, product.reviewCount)}</div>` : ''}
                <div class="product-price">
                    ${formatCurrency(product.currentPrice)}
                    ${(savedAmount > 0) ? `<span class="original-price">${formatCurrency(product.oldPrice)}</span>` : ''}
                </div>
                ${(savedAmount > 0) ? `<div class="product-save-amount">You save ${formatCurrency(savedAmount)}!</div>` : ''}
                <button class="add-to-cart-btn"${isLoggedIn() ? '' : ' data-guest="true"'} data-id="${product.productId}" ${isSoldOut ? 'disabled' : ''}>
                    ${isSoldOut ? 'Sold Out' : 'Add to Cart'}
                </button>
            </div>
        </a>
    `;
};


// --- Page Rendering Functions ---

const showGiftCardPopup = () => {
    if (sessionStorage.getItem('giftCardPopupShown')) return;

    const popupHTML = `
        <div class="popup-overlay" id="gift-card-popup">
            <div class="popup-content">
                <button class="popup-close" id="popup-close-btn">&times;</button>
                <h2>🎁 You've Got a Gift!</h2>
                <p>For a limited time, get a <strong>5% gift card reward</strong> on the value of every purchase you make. Start shopping now to claim yours!</p>
                <a href="#on-sale" class="popup-cta" id="popup-shop-now-btn">Shop Now & Earn</a>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', popupHTML);
    const popup = document.getElementById('gift-card-popup');
    
    setTimeout(() => popup.classList.add('show'), 500);

    const closePopup = () => {
        popup.classList.remove('show');
        setTimeout(() => popup.remove(), 300);
        sessionStorage.setItem('giftCardPopupShown', 'true');
    };

    document.getElementById('popup-close-btn').addEventListener('click', closePopup);
    document.getElementById('popup-shop-now-btn').addEventListener('click', closePopup);
    popup.addEventListener('click', e => {
        if (e.target === popup) closePopup();
    });
};

export const renderHomePage = async () => {
    // Fetch real reviews from the backend (only those with viewerId and rating 5 for homepage)
    let reviewsCardsHTML = '';
    try {
        const products = await api.fetchProducts();
        // Flatten all reviews from all products, filter for 5-star and viewer-linked
        const allReviews = (products || []).flatMap(p => (p.reviews || []).map(r => ({...r, productTitle: p.title}))).filter(r => r.rating === 5 && r.viewerId);
        reviewsCardsHTML = allReviews.length > 0
            ? allReviews.map(review => `
                <div class="review-card">
                    <div class="review-stars">${renderStars(review.rating)}</div>
                    <p class="review-text">${review.text}</p>
                    <p class="review-author">${review.author} (${review.productTitle})</p>
                </div>
            `).join('')
            : '<p>No 5-star reviews yet.</p>';
    } catch (err) {
        reviewsCardsHTML = '<p>Could not load reviews.</p>';
    }

    // Load settings to get home hero images (supports admin-updated images)
    let settingsMap = {};
    try {
        const settingsArr = await api.fetchSettings();
        if (Array.isArray(settingsArr)) {
            settingsArr.forEach(s => settingsMap[s.key] = s.value);
        }
    } catch (err) {
        console.warn('Could not load settings for home hero images', err);
    }

    const reviewsHTML = `
        <section class="reviews-carousel-section">
            <h2 class="section-title">What Our Customers Say</h2>
            <div class="reviews-carousel">
                <div class="reviews-carousel-track">
                    ${reviewsCardsHTML}
                </div>
            </div>
        </section>
    `;

    // Determine hero images: allow 4 slides (admin-editable keys: home_hero_1..home_hero_4)
    const defaultHeroes = [
        'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
        'https://images.unsplash.com/photo-1550745165-9bc0b252726a?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
        'https://images.unsplash.com/photo-1601784551446-20c9e07cdbf1?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
        'https://images.unsplash.com/photo-1542223616-4a4b2f9b4b9f?auto=format&fit=crop&w=1350&q=80'
    ];
    const heroImages = [1,2,3,4].map(i => settingsMap[`home_hero_${i}`] || defaultHeroes[i-1]);

    const paymentOptionsHTML = `
        <section class="payment-options-section page-container">
            <h2 class="section-title">Flexible Ways to Pay & Save</h2>
            <div class="payment-options-grid">
                <a href="#trade-in" class="payment-option-card">
                    <div class="icon-wrapper"><i class="fas fa-sync-alt"></i></div>
                    <h3>Trade-In</h3>
                    <p>Get credit for your old device towards a new one.</p>
                </a>
                <a href="#faqs" class="payment-option-card">
                    <div class="icon-wrapper"><i class="fas fa-layer-group"></i></div>
                    <h3>Lay-Bye</h3>
                    <p>Pay for your device over 3 months, interest-free.</p>
                </a>
                <a href="#faqs" class="payment-option-card">
                    <div class="icon-wrapper"><i class="fas fa-hand-holding-usd"></i></div>
                    <h3>Deposit</h3>
                    <p>Secure your dream tech with a small upfront payment.</p>
                </a>
            </div>
        </section>
    `;

    appRoot.innerHTML = `
        <section class="hero">
            <div class="slides-container">
                ${heroImages.map((img, idx) => `
                    <div class="slide ${idx===0? 'active' : ''}" style="background-image: linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url('${img}');">
                        <div class="content">
                            ${idx===0? `<h1>Experience Premium Technology</h1><p>Discover curated tech with unmatched quality and service. Your journey to exceptional electronics starts here.</p><a href="#category/laptops" class="cta">Explore Laptops</a>` : idx===1? `<h1>Level Up Your Game</h1><p>Next-gen consoles and accessories are here. Immerse yourself in the future of gaming.</p><a href="#category/gaming" class="cta">Shop Gaming</a>` : idx===2? `<h1>Stay Connected, In Style</h1><p>The latest smartphones from top brands, combining cutting-edge features with sleek design.</p><a href="#category/phones" class="cta">Discover Phones</a>` : `<h1>Super Combos & Deals</h1><p>Handpicked bundles and offers to get the most value.</p><a href="#combos" class="cta">See Combos</a>`}
                        </div>
                    </div>
                `).join('')}
            </div>
            <div class="carousel-controls"><button class="prev">&lt;</button><div class="pagination"></div><button class="next">&gt;</button></div>
        </section>
        
        <div class="carousel-wrapper">
            <button class="carousel-chevron carousel-chevron-left"><i class="fas fa-chevron-left"></i></button>
            <section class="home-category-carousel">
                <a href="#trending" class="item" style="background-image: url('https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80');">
                    <h2>Trending Now</h2>
                    <span class="shop-now-btn">Shop Now</span>
                </a>
                <a href="#new-arrivals" class="item" style="background-image: url('https://images.unsplash.com/photo-1546054454-aa26e2b734c7?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80');">
                    <h2>New Arrivals</h2>
                    <span class="shop-now-btn">Shop Now</span>
                </a>
                <a href="#combos" class="item" style="background-image: url('https://images.unsplash.com/photo-1572594691920-87d1b7b7a8a0?auto=format&fit=crop&w=800&q=60');">
                    <h2>Super Combos</h2>
                    <span class="shop-now-btn">Shop Now</span>
                </a>
                <a href="#second-hand" class="item" style="background-image: url('https://images.unsplash.com/photo-1598327105666-658454354c03?auto=format&fit=crop&w=800&q=60');">
                    <h2>Pre-Owned Deals</h2>
                    <span class="shop-now-btn">Shop Now</span>
                </a>
                <a href="#on-sale" class="item" style="background-image: url('https://images.unsplash.com/photo-1555774698-0b77e0d5fac6?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80');">
                    <h2>On Sale</h2>
                    <span class="shop-now-btn">Shop Now</span>
                </a>
                <a href="#category/gaming-accessories" class="item" style="background-image: url('https://images.unsplash.com/photo-1598550476439-6847785fcea6?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80');">
                    <h2>Gaming Gear</h2>
                    <span class="shop-now-btn">Shop Now</span>
                </a>
            </section>
            <button class="carousel-chevron carousel-chevron-right"><i class="fas fa-chevron-right"></i></button>
        </div>

        ${paymentOptionsHTML}
        ${reviewsHTML}
    `;
    
    // JS for hero slider
    let currentSlide = 0;
    const slides = document.querySelectorAll('.hero .slide');
    const pagination = document.querySelector('.pagination');
    if (pagination && slides.length > 0) {
        pagination.innerHTML = '';
        slides.forEach((_, i) => {
            const dot = document.createElement('span');
            dot.classList.add('dot');
            if (i === 0) dot.classList.add('active');
            dot.addEventListener('click', () => showSlide(i));
            pagination.appendChild(dot);
        });
    }
    const dots = document.querySelectorAll('.pagination .dot');
    const showSlide = (n) => {
        currentSlide = (n + slides.length) % slides.length;
        slides.forEach(s => s.classList.remove('active'));
        dots.forEach(d => d.classList.remove('active'));
        slides[currentSlide].classList.add('active');
        dots[currentSlide].classList.add('active');
    };
    document.querySelector('.next').addEventListener('click', () => showSlide(currentSlide + 1));
    document.querySelector('.prev').addEventListener('click', () => showSlide(currentSlide - 1));
    setInterval(() => showSlide(currentSlide + 1), 5000);

    // JS for category carousel
    const carousel = document.querySelector('.home-category-carousel');
    const leftChevron = document.querySelector('.carousel-chevron-left');
    const rightChevron = document.querySelector('.carousel-chevron-right');
    
    if (carousel && leftChevron && rightChevron) {
        const scrollAmount = 350;
        leftChevron.addEventListener('click', () => {
            carousel.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
        });
        rightChevron.addEventListener('click', () => {
            carousel.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        });
    }

    showGiftCardPopup();
};

export const renderCategoryPage = (products, categoryKey, searchTerm = '') => {
    const category = categoryData[categoryKey];
    let title = "Search Results";
    let heroHTML = '';

    if (category) {
        title = category.name;
        heroHTML = `<div class="page-hero-header" style="background-image: linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url('${category.heroImage}')"><h1>${category.name}</h1></div>`;
    }

    // We rely on the top-menu category links (e.g. #category/womens-clothes) to filter clothes pages.
    const isClothesLanding = categoryKey === 'clothes' || categoryKey === 'clothing';

    const productGridHTML = products && products.length > 0 ? products.map(p => createProductCard(p)).join('') : (isClothesLanding ? `<h3>No clothes available at the moment.</h3>` : `<h3>No products found ${searchTerm ? `for "${searchTerm}"` : 'in this category yet'}.</h3>`);

    // Build filter controls. Merge clothing filters into a single `sort-by` select on clothing pages.
    let genderOptionsHTML = '';
    let clothingOptionsHTML = '';
    // Note: gender-specific filtering has been removed from the sort-by control.
    if (categoryKey === 'womens-clothing' || categoryKey === 'womens-clothes') {
        clothingOptionsHTML = `
            <option value="filter-tops">Shirts, Sweaters, Jerseys, and Jackets</option>
            <option value="filter-bottoms">Skirts, Trousers, Shorts, Dresses</option>
            <option value="filter-official">Official Attire</option>
            <option value="filter-traditional">Traditional Attire</option>
            <option value="filter-shoes">Shoes</option>
            <option value="filter-accessories">Accessories</option>
        `;
    } else if (categoryKey === 'mens-clothing' || categoryKey === 'mens-clothes') {
        clothingOptionsHTML = `
            <option value="filter-tops">Shirts, Sweaters, Jerseys, and Jackets</option>
            <option value="filter-bottoms">Trousers, Shorts</option>
            <option value="filter-official">Official Attire</option>
            <option value="filter-traditional">Traditional Attire</option>
            <option value="filter-shoes">Shoes</option>
            <option value="filter-accessories">Accessories</option>
        `;
    } else if (['furniture','furnitures','living-room','bedroom','office','kitchen'].includes(categoryKey)) {
        clothingOptionsHTML = `
            <option value="filter-furniture">Furniture</option>
            <option value="filter-appliances">Appliances</option>
        `;
    }

    const filterControlsHTML = `
        <div class="filter-controls">
            <div class="filter-group">
                <label for="sort-by">Sort By:</label>
                <select id="sort-by">
                    <option value="default">Default</option>
                    ${clothingOptionsHTML}
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                    <option value="name-asc">Name: A to Z</option>
                    <option value="name-desc">Name: Z to A</option>
                </select>
            </div>
        </div>
    `;

    appRoot.innerHTML = `
        ${heroHTML}
        <div class="page-container">
            ${searchTerm ? `<h2>Search results for: "${searchTerm}"</h2>` : ''}
            ${filterControlsHTML}
            <div class="products-grid" style="margin-top: 1rem;">
                ${productGridHTML}
            </div>
        </div>
    `;
    
    // Keep track of currently displayed products so sorting and filters operate together
    let currentDisplayed = Array.isArray(products) ? [...products] : [];

    const filterMap = {
        tops: ['shirt','sweater','jersey','jacket','coat','blazer','top','hoodie'],
        bottoms: ['skirt','trouser','trousers','pants','shorts','dress','jean','jeans'],
        official: ['uniform','official','suit','blazer','tie','blouse'],
        traditional: ['traditional','attire','ethnic','kandeka','oshifima','shaku'],
        shoes: ['shoe','sneaker','boot','sandals','heel','loafer','trainer'],
        accessories: ['belt','hat','cap','scarf','bag','purse','sunglass','jewel','watch'],
        furniture: ['sofa','sofas','couch','table','tables','chair','chairs','bed','beds','desk','shelf','cabinet','furniture','wardrobe','dresser'],
        appliances: ['fridge','refrigerator','oven','stove','microwave','washer','dryer','appliance','blender','toaster','kettle']
    };

    document.getElementById('sort-by').addEventListener('change', (e) => {
        const val = e.target.value;

        // Gender-based filtering removed from this control; use top-menu category links instead.

        // If selecting a clothing filter (values prefixed with 'filter-')
        if (val.startsWith('filter-')) {
            const key = val.replace('filter-', '');
            if (key === 'default') {
                currentDisplayed = Array.isArray(products) ? [...products] : [];
            } else {
                const keywords = filterMap[key] || [];
                // For furniture/appliances filters we require explicit assignment in product.clothingFilters
                if (key === 'furniture' || key === 'appliances') {
                    currentDisplayed = (products || []).filter(p => {
                        const filtersArr = Array.isArray(p.clothingFilters) ? p.clothingFilters.map(x => (x||'').toLowerCase()) : [];
                        if (filtersArr.includes(key)) return true;
                        const singular = key.replace(/s$/,'');
                        if (filtersArr.includes(singular)) return true;
                        if (filtersArr.includes(key + 's')) return true;
                        // handle 'appliance'/'appliances' explicitly
                        if (key === 'appliances' && (filtersArr.includes('appliance') || filtersArr.includes('appliances'))) return true;
                        return false;
                    });
                } else {
                    currentDisplayed = (products || []).filter(p => {
                        const title = (p.title || '').toLowerCase();
                        const cat = (p.category || '').toLowerCase();
                        const filtersArr = Array.isArray(p.clothingFilters) ? p.clothingFilters.map(x => (x||'').toLowerCase()) : [];
                        // Robust filter matching: check keywords, category, and clothingFilters with singular/plural tolerance
                        const filterMatches = () => {
                            if (filtersArr.includes(key)) return true;
                            const singular = key.replace(/s$/,'');
                            if (filtersArr.includes(singular)) return true;
                            if (filtersArr.includes(key + 's')) return true;
                            if (key === 'appliances' && (filtersArr.includes('appliance') || filtersArr.includes('appliances'))) return true;
                            return false;
                        };
                        return keywords.some(k => title.includes(k) || cat.includes(k)) || filterMatches();
                    });
                }
            }

            const newGridHTML = currentDisplayed.map(p => createProductCard(p)).join('');
            document.querySelector('.products-grid').innerHTML = newGridHTML;
            startLiveTimerUpdates();
            return;
        }

        // Otherwise handle sorting values
        const [sortBy, order] = val.split('-');
        let sortedProducts = [...currentDisplayed];
        if (sortBy === 'price') {
            sortedProducts.sort((a, b) => order === 'asc' ? a.currentPrice - b.currentPrice : b.currentPrice - a.currentPrice);
        } else if (sortBy === 'name') {
            sortedProducts.sort((a, b) => order === 'asc' ? a.title.localeCompare(b.title) : b.title.localeCompare(a.title));
        } else if (val === 'default') {
            sortedProducts = Array.isArray(products) ? [...products] : [];
        }

        const newGridHTML = sortedProducts.map(p => createProductCard(p)).join('');
        document.querySelector('.products-grid').innerHTML = newGridHTML;
        startLiveTimerUpdates();
    });

    try {
        const focusId = sessionStorage.getItem('focusProduct');
        if (focusId) {
            setTimeout(() => {
                const el = document.querySelector(`.products-grid .product-card[data-id="${focusId}"]`);
                if (el) {
                    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    el.classList.add('highlight-product');
                    setTimeout(() => el.classList.remove('highlight-product'), 4000);
                }
            }, 150);
            sessionStorage.removeItem('focusProduct');
        }
    } catch (err) {
        console.warn('Could not focus product after navigation', err);
    }
    
    startLiveTimerUpdates();

    // Clothes selector buttons removed — use top-menu category links (e.g. #category/womens-clothes) to filter.
};

export const renderProductPage = async (product) => {
    if (!product) { renderNotFound(); return; }

    // Try to fetch products in the same category first
    let similarProducts = [];
    try {
        similarProducts = await api.fetchProducts(product.category);
    } catch (err) {
        console.warn('Could not fetch similar products by category', err);
    }

    let filteredSimilar = (similarProducts || [])
        .filter(p => p.productId !== product.productId)
        .slice(0, 4);

    // Fallback: if no category-based similar products, show a few other products
    if (filteredSimilar.length === 0) {
        try {
            const allProducts = await api.fetchProducts();
            filteredSimilar = (allProducts || [])
                .filter(p => p.productId !== product.productId)
                .slice(0, 4);
        } catch (err) {
            console.warn('Could not fetch fallback similar products', err);
        }
    }

    let similarProductsHTML = '';
    if (filteredSimilar && filteredSimilar.length > 0) {
        similarProductsHTML = `
            <section class="similar-products-section page-container">
                <h2 class="section-title">You Might Also Like</h2>
                <div class="products-grid">
                    ${filteredSimilar.map(p => createProductCard(p)).join('')}
                </div>
            </section>
        `;
    }

    // Only show 5-star review section if at least one 5-star review exists
    // Only show 5-star reviews that are linked to a viewer
    let fiveStarReviews = [];
    if (product.reviews && product.reviews.length > 0) {
        fiveStarReviews = product.reviews.filter(r => r.rating === 5 && r.viewerId);
    }
    // Only count reviews with non-empty text as text reviews
    // Only consider reviews linked to a viewer
    const viewerLinkedReviews = (product.reviews || []).filter(r => r.viewerId);
    const textReviews = viewerLinkedReviews.filter(r => r.text && r.text.trim().length > 0);
    const reviewsHTML = textReviews.length > 0
        ? textReviews.map(review => `<div class="review"><div class="product-rating">${renderStars(review.rating)}</div><p class="review-author">by ${review.author}</p><p>${review.text}</p></div>`).join('')
        : '<p>0 reviews</p>';

    // 5-star review section (only if at least one 5-star review exists)
    let fiveStarSectionHTML = '';
    if (fiveStarReviews.length > 0) {
        fiveStarSectionHTML = `
            <section class="five-star-reviews">
                <h3>5-Star Reviews (${fiveStarReviews.length})</h3>
                ${fiveStarReviews.map(r => `<div class="review"><div class="product-rating">${renderStars(r.rating)}</div><p class="review-author">by ${r.author}</p><p>${r.text}</p></div>`).join('')}
            </section>
        `;
    } // else: do not render the section at all
        
    const featuresListHTML = product.features && product.features.length > 0
        ? `<ul>${product.features.map(feature => `<li>${feature}</li>`).join('')}</ul>`
        : '';

    const descriptionParagraphHTML = `<p>Experience the best with the ${product.title}. This premium product offers exceptional performance and value, backed by our comprehensive warranty. Perfect for both work and play, it's the smart choice for any tech enthusiast.</p>`;

    const colorOptionsHTML = product.colorsEnabled && product.colors && product.colors.length > 0
        ? `<div class="color-options"><h4>Available Colors:</h4><div class="color-swatches">${product.colors.map((color, idx) => `<button type="button" class="color-swatch ${idx === 0 ? 'selected' : ''}" data-color="${color}" style="background-color: ${color.toLowerCase()};" title="${color}" aria-label="Select ${color} color"></button>`).join('')}</div></div>`
        : '';
    
    const isCombo = product.curatedPages && product.curatedPages.includes('combos');
    const comboTimeLeft = isCombo ? calculateTimeRemaining(product.comboEndDate) : null;
    const saleTimeLeft = product.onSale ? calculateTimeRemaining(product.saleEndDate) : null;
    
    let topBarTimerHTML = '';
    if (saleTimeLeft) {
        topBarTimerHTML = `
            <div class="product-detail-timer sale-timer">
                <div class="timer-title"><i class="fas fa-fire"></i> Sale Ends:</div>
                <div class="timer-display-large">${saleTimeLeft}</div>
            </div>`;
    } else if (comboTimeLeft) {
        topBarTimerHTML = `
            <div class="product-detail-timer sale-timer" style="background: linear-gradient(135deg, var(--corporate-blue), #2a7fec); color: var(--white);">
                <div class="timer-title"><i class="fas fa-star"></i> Combo Deal Ends:</div>
                <div class="timer-display-large">${comboTimeLeft}</div>
            </div>`;
    }
        
    let giftRewardHTML = '';
    if (product.giftCardEnabled && product.giftCardValue > 0) {
        let rewardAmount = 0;
        let rewardText = '';
    
        if (product.giftCardType === 'fixed') {
            rewardAmount = product.giftCardValue;
            rewardText = `<strong>${formatCurrency(rewardAmount)}</strong>`;
        } else { // 'percent' is the other option and default
            rewardAmount = (product.currentPrice * product.giftCardValue) / 100;
            rewardText = `<strong>${formatCurrency(rewardAmount)}</strong> (${product.giftCardValue}%)`;
        }
    
        if (rewardAmount > 0) {
            giftRewardHTML = `
                <div class="gift-reward">
                    <p><i class="fas fa-gift"></i> Earn a ${rewardText} gift reward with this purchase to spend on your next purchase!</p>
                </div>`;
        }
    }
    const savedAmount = (product.oldPrice || 0) - (product.currentPrice || 0);
    // Show original price and saved badge whenever oldPrice is greater than currentPrice
    const isActuallyOnSale = savedAmount > 0;

    appRoot.innerHTML = `
    <div class="page-container product-page-container" data-sale-end-date="${product.saleEndDate || ''}" data-combo-end-date="${product.comboEndDate || ''}">
        <div class="product-page-top-bar">
            <a href="#" class="back-to-products" id="back-to-products"><i class="fas fa-arrow-left"></i>&nbsp; Back</a>
            ${topBarTimerHTML}
        </div>
        <div class="product-main">
            <div class="gallery-section">
                ${createProductTags(product, 'detail')}
                <div id="image-viewer-count" class="image-viewer-count" style="display: none;"></div>
                <div class="main-image-container">
                    <img src="${product.image}" alt="${product.title}" class="main-image" id="main-image">
                </div>
                <div class="thumbnails">${[product.image, ...(product.thumbnails || [])].map((thumb, i) => `<img src="${thumb}" class="thumbnail ${i === 0 ? 'active' : ''}" data-full="${thumb}">`).join('')}</div>
            </div>
            <div class="details-section">
                <h1>${product.title}</h1>
                ${(viewerLinkedReviews.length > 0) ? `<div class="product-rating">${renderStars(product.rating, product.reviewCount)}</div>` : ''}
                <div class="product-price">
                    ${formatCurrency(product.currentPrice)}
                    ${isActuallyOnSale ? `<span class="original-price">${formatCurrency(product.oldPrice)}</span><span class="save-badge">Save ${formatCurrency(savedAmount)}</span>` : ''}
                </div>
                
                ${giftRewardHTML}
                
                ${colorOptionsHTML}

                <div class="trust-info-bar">
                    <div class="trust-info-item"><i class="fas fa-sync-alt"></i> Trade-In</div>
                    <div class="trust-info-item"><i class="fas fa-layer-group"></i> Lay-Bye</div>
                    <div class="trust-info-item"><i class="fas fa-hand-holding-usd"></i> Deposit</div>
                </div>

                <div class="trust-info-bar">
                    <div class="trust-info-item"><i class="fas fa-truck"></i> Delivery Nationwide</div>
                    <div class="trust-info-item"><i class="fas fa-shield-alt"></i> 1-Year Warranty</div>
                    <div class="trust-info-item"><i class="fas fa-undo"></i> 15-Day Returns</div>
                </div>
                
                <button class="add-to-cart-btn"${isLoggedIn() ? '' : ' data-guest="true"'} data-id="${product.productId}" ${product.stock !== undefined && product.stock <= 0 ? 'disabled' : ''}>
                    ${product.stock !== undefined && product.stock <= 0 ? 'Sold Out' : 'Add to Cart'}
                </button>
                
                <div class="product-info-tabs">
                    <div class="tab-buttons">
                        <button class="tab-btn active" data-tab="description">Description</button>
                        <button class="tab-btn" data-tab="reviews">Reviews (${product.reviewCount})</button>
                    </div>
                    <div id="description" class="tab-content active">
                        ${featuresListHTML}
                        ${descriptionParagraphHTML}
                    </div>
                    <div id="reviews" class="tab-content">
                        ${fiveStarSectionHTML}
                        ${reviewsHTML}
                    </div>
                </div>
            </div>
        </div>
    </div>
    ${similarProductsHTML}
    `;
    
    // --- EVENT LISTENERS FOR PRODUCT PAGE ---

    // Back button
    const backBtn = document.getElementById('back-to-products');
    if (backBtn) {
        backBtn.addEventListener('click', (e) => {
            e.preventDefault();
            try { sessionStorage.setItem('focusProduct', product.productId); } catch (err) {}
            history.back();
        });
    }

    // Thumbnail click
    const thumbnails = document.querySelectorAll('.thumbnail');
    thumbnails.forEach(thumb => {
        thumb.addEventListener('click', () => {
            document.getElementById('main-image').src = thumb.dataset.full;
            thumbnails.forEach(t => t.classList.remove('active'));
            thumb.classList.add('active');
        });
    });

    // Color swatch selection
    const colorSwatches = document.querySelectorAll('.color-swatch');
    colorSwatches.forEach(swatch => {
        swatch.addEventListener('click', (e) => {
            e.preventDefault();
            colorSwatches.forEach(s => s.classList.remove('selected'));
            swatch.classList.add('selected');
        });
    });

    // Tab switching
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            tabButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
            document.getElementById(button.dataset.tab).classList.add('active');
        });
    });

    // Fetch and display viewer count
    try {
        const viewerResponse = await fetch(`/api/products/${product.productId}/viewers`);
        if (viewerResponse.ok) {
            const viewerData = await viewerResponse.json();
            const viewerDisplay = document.getElementById('image-viewer-count');
            if (viewerDisplay && viewerData && viewerData.viewerCount !== undefined && viewerData.viewerCount !== null) {
                const count = viewerData.viewerCount;
                const label = count === 1 ? 'person viewing' : 'people viewing';
                viewerDisplay.innerHTML = `<i class="fas fa-eye"></i> ${count} ${label}`;
                viewerDisplay.style.display = 'flex';
            }
        }
    } catch (err) {
        console.warn('Could not fetch viewer count', err);
    }
    
    startLiveTimerUpdates();
};

export const renderCartPage = (detailedCartItems) => {
    let subtotal = 0;
    const itemsHTML = detailedCartItems.length > 0 ? detailedCartItems.map(item => {
        const itemTotal = item.currentPrice * item.quantity;
        subtotal += itemTotal;
        const savedPerUnit = (item.oldPrice || 0) - (item.currentPrice || 0);
        const savedAmount = savedPerUnit > 0 ? savedPerUnit * item.quantity : 0;
        const isActuallyOnSale = savedAmount > 0;
        const stockInfo = item.stock !== undefined ? `<span class="cart-item-stock in-stock">${item.stock} left</span>` : '';
        const colorDisplay = item.selectedColor ? `<div style="display: flex; align-items: center; gap: 8px; margin-top: 5px;"><span style="font-size: 0.85rem; color: #666;">Color:</span><div style="width: 20px; height: 20px; border-radius: 50%; border: 1px solid #ddd; background-color: ${item.selectedColor.toLowerCase()}; cursor: help;" title="${item.selectedColor}"></div><span style="font-size: 0.85rem; font-weight: 500;">${item.selectedColor}</span></div>` : '';
        return `
            <div class="cart-item" data-product-id="${item.productId}">
                <div class="cart-item-img-wrapper">
                    <img src="${item.image}" class="cart-item-img" alt="${item.title}">
                </div>
                <div class="cart-item-details">
                    <div class="cart-item-title">${item.title} ${isActuallyOnSale ? `<span class="item-save-badge">Save ${formatCurrency(savedPerUnit)}</span>` : ''} ${stockInfo}</div>
                    <div>${formatCurrency(item.currentPrice)} x ${item.quantity} = <strong>${formatCurrency(itemTotal)}</strong></div>
                    ${isActuallyOnSale ? `<div class="item-saved-amount">You saved ${formatCurrency(savedAmount)}!</div>` : ''}
                    ${colorDisplay}
                </div>
                <div class="cart-item-actions">
                    <button class="quantity-change" data-id="${item.productId}" data-change="-1">−</button>
                    <span class="quantity-display">${item.quantity}</span>
                    <button class="quantity-change" data-id="${item.productId}" data-change="1">+</button>
                    <button class="remove-item" data-id="${item.productId}">✕</button>
                </div>
            </div>`;
    }).join('') : '<p>Your cart is empty.</p>';
    
    const giftAmount = subtotal * 0.05;

    const paymentInfoHTML = `
        <div class="payment-info-summary">
            <h4>Payment Options Available</h4>
            <p>Proceed to checkout to pay via <i class="fas fa-university"></i> EFT, <i class="fas fa-wallet"></i> E-Wallet or Blue wallet, or to arrange a <i class="fas fa-calendar-alt"></i> Lay-by.</p>
        </div>
    `;

    appRoot.innerHTML = `
        <div class="cart-page-container">
            <div class="cart-header"><h1>Shopping Cart</h1></div>
            <div class="cart-section">
                ${itemsHTML}
                ${subtotal > 0 ? `
                <div class="gift-reward" style="margin-top: 20px; text-align: center; padding: 15px; background: #eaf5ff; border-radius: 8px;"><h4><i class="fas fa-gift"></i> Your Gift Reward</h4><p>Complete this order to earn <strong>${formatCurrency(giftAmount)}</strong> for your next purchase!</p></div>
                <div class="order-summary">
                    <h3>Order Summary</h3>
                    <div class="summary-row" style="display: flex; justify-content: space-between; margin-bottom: 10px;"><span>Subtotal:</span> <span>${formatCurrency(subtotal)}</span></div>
                    <div class="summary-row" style="display: flex; justify-content: space-between; margin-bottom: 10px;"><span>Delivery:</span> <span class="free-shipping" style="color: var(--success-green);">FREE</span></div>
                    <div class="summary-row total-row" style="display: flex; justify-content: space-between; font-weight: bold; margin-top: 15px; border-top: 1px solid var(--border-color); padding-top: 10px;"><span>Total:</span> <span>${formatCurrency(subtotal)}</span></div>
                </div>` : ''}
                ${subtotal > 0 ? paymentInfoHTML : ''}
                <div class="action-buttons">
                    <a href="#home" class="btn btn-outline">← Continue Shopping</a>
                    ${detailedCartItems.length > 0 ? `<a href="#checkout" class="btn btn-primary">Proceed to Checkout →</a>` : ''}
                </div>
            </div>
        </div>`;
    
    // Add event listeners for cart actions
    appRoot.addEventListener('click', async (e) => {
        const quantityBtn = e.target.closest('.quantity-change');
        if (quantityBtn) {
            e.preventDefault();
            const productId = quantityBtn.dataset.id;
            const change = parseInt(quantityBtn.dataset.change);
            const currentItem = detailedCartItems.find(item => item.productId === productId);
            if (currentItem) {
                const newQuantity = currentItem.quantity + change;
                if (newQuantity > 0) {
                    CartManager.updateQuantity(productId, newQuantity);
                    // Update DOM in real-time
                    const cartItem = document.querySelector(`[data-product-id="${productId}"]`);
                    if (cartItem) {
                        const quantityDisplay = cartItem.querySelector('.quantity-display');
                        const newItemTotal = currentItem.currentPrice * newQuantity;
                        quantityDisplay.textContent = newQuantity;
                        // Update the total price for this item
                        const itemPriceText = cartItem.querySelector('.cart-item-details > div:nth-child(2)');
                        if (itemPriceText) {
                            itemPriceText.innerHTML = `${formatCurrency(currentItem.currentPrice)} x ${newQuantity} = <strong>${formatCurrency(newItemTotal)}</strong>`;
                        }
                        // Update overall cart summary
                        updateCartSummary(detailedCartItems);
                    }
                    currentItem.quantity = newQuantity;
                } else {
                    CartManager.removeItem(productId);
                    // Remove item from DOM in real-time
                    const cartItem = document.querySelector(`[data-product-id="${productId}"]`);
                    if (cartItem) {
                        cartItem.remove();
                        detailedCartItems = detailedCartItems.filter(item => item.productId !== productId);
                        // Check if cart is now empty
                        if (detailedCartItems.length === 0) {
                            const cartSection = document.querySelector('.cart-section');
                            if (cartSection) {
                                cartSection.innerHTML = '<p>Your cart is empty.</p><div class="action-buttons"><a href="#home" class="btn btn-outline">← Continue Shopping</a></div>';
                            }
                        } else {
                            updateCartSummary(detailedCartItems);
                        }
                    }
                }
            }
        }
        
        const removeBtn = e.target.closest('.remove-item');
        if (removeBtn) {
            e.preventDefault();
            const productId = removeBtn.dataset.id;
            if (confirm('Are you sure you want to remove this item?')) {
                CartManager.removeItem(productId);
                // Remove item from DOM in real-time
                const cartItem = document.querySelector(`[data-product-id="${productId}"]`);
                if (cartItem) {
                    cartItem.remove();
                    detailedCartItems = detailedCartItems.filter(item => item.productId !== productId);
                    // Check if cart is now empty
                    if (detailedCartItems.length === 0) {
                        const cartSection = document.querySelector('.cart-section');
                        if (cartSection) {
                            cartSection.innerHTML = '<p>Your cart is empty.</p><div class="action-buttons"><a href="#home" class="btn btn-outline">← Continue Shopping</a></div>';
                        }
                    } else {
                        updateCartSummary(detailedCartItems);
                    }
                }
            }
        }
    });
};

// Helper function to update cart summary in real-time
const updateCartSummary = (items) => {
    const subtotal = items.reduce((acc, item) => acc + item.currentPrice * item.quantity, 0);
    const giftAmount = subtotal * 0.05;
    
    const summaryRow = document.querySelector('.summary-row');
    if (summaryRow) {
        const parentDiv = summaryRow.closest('.order-summary');
        if (parentDiv) {
            parentDiv.innerHTML = `
                <div class="summary-row" style="display: flex; justify-content: space-between; margin-bottom: 10px;"><span>Subtotal:</span> <span>${formatCurrency(subtotal)}</span></div>
                <div class="summary-row" style="display: flex; justify-content: space-between; margin-bottom: 10px;"><span>Delivery:</span> <span class="free-shipping" style="color: var(--success-green);">FREE</span></div>
                <div class="summary-row total-row" style="display: flex; justify-content: space-between; font-weight: bold; margin-top: 15px; border-top: 1px solid var(--border-color); padding-top: 10px;"><span>Total:</span> <span>${formatCurrency(subtotal)}</span></div>
            `;
        }
    }
    
    // Update gift reward message
    const giftReward = document.querySelector('.gift-reward');
    if (giftReward && items.length > 0) {
        giftReward.innerHTML = `<h4><i class="fas fa-gift"></i> Your Gift Reward</h4><p>Complete this order to earn <strong>${formatCurrency(giftAmount)}</strong> for your next purchase!</p>`;
    }
};

export const renderCheckoutPage = (detailedCartItems) => {
    const subtotal = detailedCartItems.reduce((acc, item) => acc + item.currentPrice * item.quantity, 0);
    const giftAmount = subtotal * 0.05;
    
    const paymentOptionsSummaryHTML = `
        <div class="payment-info-summary" style="margin-top: 20px; padding: 15px; background: #f8f9fa; border-radius: 8px;">
            <h4>Payment Options Available</h4>
            <p>Proceed to the next step to pay via <i class="fas fa-university"></i> EFT, <i class="fas fa-wallet"></i> E-Wallet or Blue wallet, or to arrange a <i class="fas fa-calendar-alt"></i> Lay-by.</p>
        </div>
    `;

    appRoot.innerHTML = `
        <div class="checkout-page-container">
            <div class="cart-header"><h1>Checkout</h1></div>
            <div class="checkout-form">
                <h2>Delivery Information</h2>
                <form id="checkout-form">
                    <div class="form-group"><label for="name">Full Name</label><input type="text" id="name" required></div>
                    <div class="form-group"><label for="address">Town/City</label><select id="address" required><option value="">Select a town or city</option><option value="Windhoek">Windhoek</option><option value="Walvis Bay">Walvis Bay</option><option value="Swakopmund">Swakopmund</option><option value="Oshakati">Oshakati</option><option value="Rundu">Rundu</option><option value="Gobabis">Gobabis</option><option value="Rehoboth">Rehoboth</option><option value="Katima Mulilo">Katima Mulilo</option><option value="Outjo">Outjo</option><option value="Ondangwa">Ondangwa</option><option value="Okahandja">Okahandja</option><option value="Otjiwarongo">Otjiwarongo</option><option value="Karibib">Karibib</option><option value="Mariental">Mariental</option><option value="Keetmanshoop">Keetmanshoop</option><option value="Lüderitz">Lüderitz</option><option value="Henties Bay">Henties Bay</option><option value="Omaruru">Omaruru</option><option value="Aranos">Aranos</option><option value="Opuwo">Opuwo</option><option value="Eenhana">Eenhana</option><option value="Ngweze">Ngweze</option><option value="Ongwediva">Ongwediva</option><option value="Tsumeb">Tsumeb</option><option value="Usakos">Usakos</option><option value="Damaraland">Damaraland</option><option value="Sesfontein">Sesfontein</option><option value="Rosh Pinah">Rosh Pinah</option><option value="Aus">Aus</option></select></div>
                    <div class="form-group"><label for="physical-address">Physical Address</label><input type="text" id="physical-address" placeholder="Street address, house number, etc." required></div>
                    <div class="form-group"><label for="phone">Phone Number</label><input type="tel" id="phone" placeholder="+264 or 081..." required></div>
                    <div class="form-group"><label for="email">Email</label><input type="email" id="email" required></div>
                </form>
                <button id="place-order-btn" class="btn btn-primary" style="width: 100%; margin-top: 20px;">Place Order</button>
                
                ${paymentOptionsSummaryHTML}
            </div>
        </div>`;
    
    document.getElementById('place-order-btn').addEventListener('click', async () => {
        const customerName = document.getElementById('name').value;
        const customerEmail = document.getElementById('email').value;
        const customerAddress = document.getElementById('address').value;
        const physicalAddress = document.getElementById('physical-address').value;
        const phoneNumber = document.getElementById('phone').value;

        if (!customerName || !customerEmail || !customerAddress || !physicalAddress || !phoneNumber) {
            alert('Please fill in all delivery information.');
            return;
        }

        const pendingOrder = {
            customerName,
            customerEmail,
            customerAddress,
            physicalAddress,
            phoneNumber,
            items: detailedCartItems.map(item => ({
                productId: item.productId,
                title: item.title,
                quantity: item.quantity,
                price: item.currentPrice,
                selectedColor: item.selectedColor || null,
            })),
            totalAmount: subtotal,
            giftCardEarned: giftAmount,
        };

        // Save pending order and route to payment options page
        try {
            sessionStorage.setItem('pendingOrder', JSON.stringify(pendingOrder));
            location.hash = '#payment';
        } catch (err) {
            console.error('Could not prepare payment options:', err);
            alert('Could not proceed to payment. Please try again.');
        }
    });
};


// Render payment options page (select payment method)
export const renderPaymentOptionsPage = () => {
    const pending = sessionStorage.getItem('pendingOrder');
    if (!pending) {
        location.hash = '#checkout';
        return;
    }

    appRoot.innerHTML = `
        <div class="page-hero-header" style="background-image: linear-gradient(rgba(0,0,0,0.25), rgba(0,0,0,0.25)), url('https://images.unsplash.com/photo-1542223616-4a4b2f9b4b9f?auto=format&fit=crop&w=1350&q=80')"><h1>Choose Payment Method</h1></div>
        <div class="page-container" style="max-width: 900px; margin-top: 2rem;">
            <p>Please choose how you'd like to complete your order:</p>
            <div class="payment-options-grid">
                <a href="#payment/eft" class="payment-option">
                    <i class="fas fa-university"></i>
                    <div class="label">Direct Bank Transfer (EFT)</div>
                </a>
                <a href="#payment/ewallet" class="payment-option">
                    <i class="fas fa-wallet"></i>
                    <div class="label">E-Wallet or Blue wallet</div>
                </a>
                <a href="#payment/layby" class="payment-option">
                    <i class="fas fa-calendar-alt"></i>
                    <div class="label">Lay-by</div>
                </a>
                <a href="#payment/tradein" class="payment-option">
                    <i class="fas fa-exchange-alt"></i>
                    <div class="label">Trade-in Credit</div>
                </a>
            </div>
        </div>
    `;
};

// Render page with detailed instructions for a selected payment method
export const renderPaymentMethodPage = async (method) => {
    const pending = sessionStorage.getItem('pendingOrder');
    if (!pending) { location.hash = '#checkout'; return; }
    const order = JSON.parse(pending);

    const methodMap = {
        eft: { title: 'Direct Bank Transfer (EFT)', icon: 'fas fa-university' },
        ewallet: { title: 'E-Wallet or Blue wallet', icon: 'fas fa-wallet' },
        layby: { title: 'Lay-by', icon: 'fas fa-calendar-alt' },
        tradein: { title: 'Trade-in Credit', icon: 'fas fa-exchange-alt' },
    };

    const info = methodMap[method] || { title: method, icon: 'fas fa-credit-card' };

    // Method-specific instruction blocks
    let instructionsHTML = '';
    if (method === 'eft') {
        instructionsHTML = `
            <h4>How to Pay via EFT</h4>
            <p>Use the bank details below and email your proof of payment to payments@namix.com.</p>
            <ul>
                <li><strong>Bank:</strong> First National Bank of Namibia</li>
                <li><strong>Account Name:</strong> NAMIX Technologies</li>
                <li><strong>Account Number:</strong> 62201234567</li>
                <li><strong>Reference:</strong> ${order.customerName}</li>
            </ul>
            <p>Once payment is confirmed we'll dispatch your order. This usually takes 1-2 business days after confirmation.</p>
        `;
    } else if (method === 'ewallet') {
        instructionsHTML = `
            <h4>Pay with E-Wallet or Blue wallet</h4>
            <p>Select your preferred E-Wallet app (or Blue wallet) and transfer the total due to the NAMIX merchant account. Include your name in the reference.</p>
            <p>If you'd like, send a screenshot of the successful transfer to payments@namix.com to speed up processing.</p>
        `;
    } else if (method === 'layby') {
        instructionsHTML = `
            <h4>Lay-by Instructions</h4>
            <p>To arrange a Lay-by, we'll require a deposit of 20% of the total due. Remaining payments will be scheduled over an agreed period.</p>
            <p>Contact sales@namix.com or call our store to finalize your lay-by plan.</p>
        `;
    } else if (method === 'tradein') {
        instructionsHTML = `
            <h4>Apply Trade-in Credit</h4>
            <p>Use our Trade-in flow to value your old device. Once accepted, your trade-in credit will be applied to this order.</p>
            <p>Complete the trade-in submission and then press Complete Order to confirm the purchase using trade-in credit.</p>
        `;
    } else {
        instructionsHTML = `<p>Instructions for ${info.title} will be provided here.</p>`;
    }

    appRoot.innerHTML = `
        <div class="page-hero-header" style="background-image: linear-gradient(rgba(0,0,0,0.25), rgba(0,0,0,0.25)), url('https://images.unsplash.com/photo-1581091012184-7f8f0e6f8f3f?auto=format&fit=crop&w=1350&q=80')"><h1>${info.title}</h1></div>
        <div class="page-container" style="max-width: 900px; margin-top: 2rem;">
            <div class="payment-detail">
                <div class="payment-summary"><strong>Order Total:</strong> ${formatCurrency(order.totalAmount)}</div>
                ${instructionsHTML}
                <div style="margin-top: 20px;">
                    <button id="complete-order-btn" class="btn btn-primary">Complete Order</button>
                    <a href="#payment" class="btn btn-outline" style="margin-left: 10px;">← Back to Payment Options</a>
                </div>
            </div>
        </div>
    `;

    document.getElementById('complete-order-btn').addEventListener('click', async () => {
        // post transaction with paymentMethod
        const transactionData = {
            customerName: order.customerName,
            customerEmail: order.customerEmail,
            customerAddress: order.customerAddress,
            items: order.items,
            totalAmount: order.totalAmount,
            giftCardEarned: order.giftCardEarned,
            paymentMethod: method,
        };

        try {
            const response = await fetch('/api/transactions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(transactionData),
            });

            if (response.ok) {
                CartManager.clearCart();
                sessionStorage.removeItem('pendingOrder');
                alert('Payment recorded and order completed. Thank you!');
                location.hash = '#home';
            } else {
                const err = await response.json().catch(()=>({message:'Unknown'}));
                alert('Failed to complete order: ' + (err.message || 'Unknown error'));
            }
        } catch (err) {
            console.error('Error completing transaction', err);
            alert('Failed to complete order. Please try again.');
        }
    });
};

export const renderTradeInPage = () => {
    const category = categoryData['trade-in'];
    appRoot.innerHTML = `
        <div class="page-hero-header" style="background-image: linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url('${category.heroImage}')"><h1>${category.name}</h1></div>
        <div class="page-container" style="max-width: 800px;">
            <div class="checkout-form">
                <h2>Get a Quote for Your Old Device</h2>
                <p style="margin-bottom: 2rem;">Ready to upgrade? Trade in your old phone, tablet, or laptop for credit towards a new device. Fill out the form below to get an estimated trade-in value.</p>
                <form id="trade-in-form">
                    <div class="form-group">
                        <label for="device-type">Device Type</label>
                        <select id="device-type" required>
                            <option value="">-- Select Type --</option>
                            <option value="phone">Phone</option>
                            <option value="tablet">Tablet</option>
                             <option value="laptop">Laptop</option>
                        </select>
                    </div>
                    <div class="form-group"><label for="device-brand">Brand (e.g., Apple, Samsung)</label><input type="text" id="device-brand" required></div>
                    <div class="form-group"><label for="device-model">Model (e.g., iPhone 12 Pro, Galaxy Tab S8)</label><input type="text" id="device-model" required></div>
                    <div class="form-group">
                        <label for="device-condition">Condition</label>
                        <select id="device-condition" required>
                            <option value="">-- Select Condition --</option>
                            <option value="mint">Mint (Like New)</option>
                            <option value="good">Good (Minor wear)</option>
                            <option value="fair">Fair (Visible scratches/dents)</option>
                            <option value="damaged">Damaged (Cracked screen, etc.)</option>
                        </select>
                    </div>
                    <div class="form-group"><label for="user-name">Your Name</label><input type="text" id="user-name" required></div>
                    <div class="form-group"><label for="user-email">Your Email</label><input type="email" id="user-email" required></div>
                    <button class="btn btn-primary" type="submit" style="width: 100%;">Get My Quote</button>
                </form>

                <div class="whatsapp-trade-in">
                    <h3>For a Faster Quote...</h3>
                    <p>Send clear pictures of your device (front, back, and any damages) directly to us on WhatsApp. Our team will respond as quickly as possible.</p>
                    <a href="https://wa.me/264811234567?text=Hi%2C%20I'd%20like%20to%20get%20a%20trade-in%20quote%20for%20my%20device." class="btn btn-whatsapp" target="_blank">
                        <i class="fab fa-whatsapp"></i> Send Pictures on WhatsApp
                    </a>
                </div>
            </div>
        </div>`;
};

export const renderAboutPage = () => {
    appRoot.innerHTML = `
        <style>
            .value-card:hover {
                transform: translateY(-10px);
                box-shadow: 0 15px 40px rgba(0, 86, 179, 0.1);
            }
        </style>
        <div class="page-hero-header" style="background-image: linear-gradient(rgba(13, 45, 109, 0.7), rgba(13, 45, 109, 0.7)), url('https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1350&q=80'); color: white; text-align: left; padding: 80px 5%;">
            <h1 style="font-size: 3rem; font-weight: 700;">About NAMIX</h1>
            <p style="font-size: 1.1rem;">Your Namibian Home for Premium Tech</p>
        </div>

        <div class="page-container" style="max-width: 1200px; margin: 4rem auto; padding: 0 2rem;">

            <!-- The Promise Section -->
            <section style="display: flex; align-items: center; gap: 3rem; flex-wrap: wrap; margin-bottom: 5rem;">
                <div style="flex: 1; min-width: 300px;">
                    <p style="color: var(--corporate-blue); font-weight: 600; margin-bottom: 0.5rem;">WHY CHOOSE US</p>
                    <h2 style="font-size: 2.5rem; margin-bottom: 1.5rem; color: var(--corporate-blue-dark);">The NAMIX Promise</h2>
                    <p style="color: #555; line-height: 1.7; margin-bottom: 2rem;">
                        At NAMIX, we are dedicated to bringing the best technology to Namibia. We carefully select a range of premium new and pre-owned electronics, ensuring every product meets our high standards for quality and performance. Our mission is to make top-tier technology accessible and affordable for everyone, backed by outstanding local customer service.
                    </p>
                    <ul style="list-style: none; padding: 0; display: flex; flex-direction: column; gap: 1rem;">
                        <li style="display: flex; align-items: center; gap: 1rem; color: #333;"><i class="fas fa-check-circle" style="color: var(--corporate-blue); font-size: 1.2rem;"></i> Quality-assured new and "Renewed Premium" devices.</li>
                        <li style="display: flex; align-items: center; gap: 1rem; color: #333;"><i class="fas fa-check-circle" style="color: var(--corporate-blue); font-size: 1.2rem;"></i> Flexible payment options including Trade-in, Lay-by, and EFT.</li>
                        <li style="display: flex; align-items: center; gap: 1rem; color: #333;"><i class="fas fa-check-circle" style="color: var(--corporate-blue); font-size: 1.2rem;"></i> Free, fast, and reliable nationwide delivery across Namibia.</li>
                        <li style="display: flex; align-items: center; gap: 1rem; color: #333;"><i class="fas fa-check-circle" style="color: var(--corporate-blue); font-size: 1.2rem;"></i> Friendly, local support dedicated to your satisfaction.</li>
                    </ul>
                </div>
                <div style="flex: 1; min-width: 300px;">
                    <img src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=800&q=80" alt="Team collaborating" style="width: 100%; border-radius: 12px; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);">
                </div>
            </section>

            <!-- Core Values Section -->
            <section style="padding: 4rem 0; border-top: 1px solid #e0e0e0;">
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 2rem; text-align: center;">
                    <div class="value-card" style="padding: 2rem; background: #fff; border-radius: 12px; transition: all 0.3s ease;">
                        <i class="fas fa-shield-alt" style="font-size: 3rem; color: #fff; background: linear-gradient(135deg, var(--corporate-blue), var(--corporate-blue-dark)); padding: 1.5rem; border-radius: 50%; margin-bottom: 1.5rem; display: inline-block;"></i>
                        <h3 style="font-size: 1.5rem; color: var(--corporate-blue-dark); margin-bottom: 1rem;">Quality & Trust</h3>
                        <p style="color: #555; line-height: 1.6;">Every product is rigorously tested and comes with a 1-Year Warranty, ensuring you receive only the best, most reliable technology.</p>
                    </div>
                    <div class="value-card" style="padding: 2rem; background: #fff; border-radius: 12px; transition: all 0.3s ease;">
                        <i class="fas fa-hand-holding-usd" style="font-size: 3rem; color: #fff; background: linear-gradient(135deg, var(--corporate-blue), var(--corporate-blue-dark)); padding: 1.5rem; border-radius: 50%; margin-bottom: 1.5rem; display: inline-block;"></i>
                        <h3 style="font-size: 1.5rem; color: var(--corporate-blue-dark); margin-bottom: 1rem;">Accessibility</h3>
                        <p style="color: #555; line-height: 1.6;">We believe everyone deserves access to great tech. Our trade-in and lay-by options make owning your dream device a reality.</p>
                    </div>
                    <div class="value-card" style="padding: 2rem; background: #fff; border-radius: 12px; transition: all 0.3s ease;">
                        <i class="fas fa-headset" style="font-size: 3rem; color: #fff; background: linear-gradient(135deg, var(--corporate-blue), var(--corporate-blue-dark)); padding: 1.5rem; border-radius: 50%; margin-bottom: 1.5rem; display: inline-block;"></i>
                        <h3 style="font-size: 1.5rem; color: var(--corporate-blue-dark); margin-bottom: 1rem;">Customer Focus</h3>
                        <p style="color: #555; line-height: 1.6;">Your experience is our priority. From our AI assistant Kuku to our support team, we're here to help you every step of the way.</p>
                    </div>
                    <div class="value-card" style="padding: 2rem; background: #fff; border-radius: 12px; transition: all 0.3s ease;">
                        <i class="fas fa-lightbulb" style="font-size: 3rem; color: #fff; background: linear-gradient(135deg, var(--corporate-blue), var(--corporate-blue-dark)); padding: 1.5rem; border-radius: 50%; margin-bottom: 1.5rem; display: inline-block;"></i>
                        <h3 style="font-size: 1.5rem; color: var(--corporate-blue-dark); margin-bottom: 1rem;">Innovation</h3>
                        <p style="color: #555; line-height: 1.6;">We are constantly exploring new products and services to enhance your digital lifestyle, right here in Namibia.</p>
                    </div>
                </div>
            </section>

        </div>
    `;
};

export const renderContactPage = () => {
     appRoot.innerHTML = `
        <div class="page-hero-header" style="background-image: linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url('https://images.unsplash.com/photo-1534536281715-e28d76689b4d?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80')"><h1>Contact Us</h1></div>
        <div class="page-container" style="max-width: 800px;">
            <div class="checkout-form">
                <h2>Get In Touch</h2>
                <p style="margin-bottom: 2rem;">Have a question or need support? Fill out the form below or reach out to us via email or phone. We're here to help!</p>
                <form id="contact-form">
                    <div class="form-group"><label for="name">Full Name</label><input type="text" id="name" required></div>
                    <div class="form-group"><label for="email">Email</label><input type="email" id="email" required></div>
                    <div class="form-group"><label for="message">Message</label><textarea id="message" rows="5" style="width: 100%; padding: 12px; border: 1px solid var(--border-color); border-radius: 8px; font-size: 1rem;" required></textarea></div>
                    <button class="btn btn-primary" type="submit" style="width: 100%;">Send Message</button>
                </form>
                <div style="margin-top: 2rem; text-align: center;">
                    <p><strong>Email:</strong> support@namix.com</p>
                    <p><strong>Phone:</strong> +264 81 123 4567</p>
                </div>
            </div>
        </div>`;
};


export const renderAdminPage = (allProducts, allUsers, allViewers, allTransactions, allFAQs, settings, sellerType) => {
    isMainAdmin = sellerType === 'admin';
    const mapSellerToCategory = (st) => {
        if (!st) return '';
        const map = {
            'clothes': 'clothing', 'cloth': 'clothing', 'furnitures': 'furniture',
            'furniture': 'furniture', 'kids': 'kids', 'admin': 'admin'
        };
        return map[st] || st;
    };
    const mappedSellerCategory = mapSellerToCategory(sellerType);
    isFurnitureAdmin = mappedSellerCategory === 'furniture';
    isClothesAdmin = mappedSellerCategory === 'clothing';
    isKidsAdmin = mappedSellerCategory === 'kids';

    const relevantProducts = isMainAdmin
        ? allProducts
        : allProducts.filter(p => p.category === mappedSellerCategory || (categoryData[p.category] && categoryData[p.category].parent === mappedSellerCategory));

    const productListHTML = relevantProducts.map(p => `
        <li>
            <div class="product-info">${p.title} <span>(Stock: ${p.stock !== undefined ? p.stock : 'N/A'})</span></div>
            <div class="actions">
                <button class="edit-btn" data-product-id="${p.productId}" data-mongo-id="${p._id}"><i class="fas fa-edit"></i> Edit</button>
                <button class="delete-btn" data-id="${p._id}"><i class="fas fa-trash"></i> Delete</button>
            </div>
        </li>`).join('');

    const adminTabs = `
        <button class="admin-tab-btn active" data-tab="products">Products</button>
        <button class="admin-tab-btn" data-tab="transactions">Transactions</button>
        ${isMainAdmin ? `
            <button class="admin-tab-btn" data-tab="add-viewer">Add Viewer</button>
            <button class="admin-tab-btn" data-tab="manage-viewers">Manage Viewers</button>
            <button class="admin-tab-btn" data-tab="users">Users</button>
            <button class="admin-tab-btn" data-tab="sellers">Seller Accounts</button>
            <button class="admin-tab-btn" data-tab="faqs">FAQs</button>
            <button class="admin-tab-btn" data-tab="site-settings">Site Settings</button>
        ` : ''}
    `;

    const userListHTML = allUsers.map(u => {
        const isAdmin = u.isAdmin || u.sellerType === 'admin';
        const deleteButton = isAdmin
            ? `<span style="color: #999; font-size: 0.9rem;">Admin Account</span>`
            : `<button class="delete-user-btn" data-user-id="${u._id}"><i class="fas fa-trash"></i> Delete</button>`;
        return `<li><div class="user-info">${u.name}<span>${u.email}</span></div><div class="actions">${deleteButton}</div></li>`;
    }).join('');

    const sellerAccounts = allUsers.filter(u => u.sellerType && u.sellerType !== 'admin' && u.sellerType !== 'customer');
    let sellerListHTML = '';
    if (sellerAccounts.length === 0) {
        sellerListHTML = `<li style="padding: 15px; border-bottom: 1px solid #eee; color:#666;">No reseller accounts found. Make sure you are logged in as the main admin and that there are users with a <code>sellerType</code> (e.g., 'clothes', 'furniture').</li>`;
    } else {
        sellerListHTML = sellerAccounts.map(u => `
            <li style="padding: 15px; border-bottom: 1px solid #eee; transition: background-color 0.2s ease;" class="seller-account-item" data-seller-email="${u.email}">
                <div class="user-info">${u.name}<span>${u.email} | Type: <strong>${u.sellerType}</strong></span></div>
                <div class="actions" style="display:flex; gap:12px; align-items:center;">
                    <button type="button" class="view-seller-btn" data-seller-email="${u.email}" style="background: none; border: none; color: var(--primary-blue); cursor: pointer;"><i class="fas fa-sign-in-alt"></i> View Dashboard</button>
                    <a class="seller-dashboard-link" href="#admin/seller/${encodeURIComponent(u.email)}" target="_blank" rel="noopener noreferrer" style="color:var(--primary-blue); text-decoration:none; font-weight:600;"><i class="fas fa-external-link-alt"></i> Open Dashboard</a>
                </div>
            </li>
        `).join('');
    }

    const viewerListHTML = (allViewers || []).flatMap(p => {
        // Map viewerId to review for quick lookup
        const reviewsByViewerId = {};
        (p.reviews || []).forEach(r => {
            if (r.viewerId) reviewsByViewerId[r.viewerId.toString()] = r;
        });

        return (p.viewers || []).map(v => {
            const viewerName = v.name ? v.name : 'Anonymous';
            const review = reviewsByViewerId[v._id.toString()];
            const hasReview = !!review;

            const reviewStatus = hasReview
                ? `<span style="color: var(--success-green); font-weight: 600; display:flex; align-items:center; gap: 5px;"><i class="fas fa-check-circle"></i> Review Added</span>`
                : '';

            // Show review text and rating if exists
            const reviewDetails = hasReview
                ? `<div class="review-details" style="margin-top:4px; font-size:0.95em; color:#444; background:#f8f8f8; padding:6px 10px; border-radius:6px;">
                    <strong>Review:</strong> ${review.text}<br/>
                    <strong>Rating:</strong> ${review.rating} ★
                </div>`
                : '';

            return `<li>
                <div class="viewer-info">${p.title}<span>${viewerName}</span><span>Viewed At: ${new Date(v.viewedAt).toLocaleString()}</span></div>
                <div class="actions" style="display:flex; align-items:center; gap: 15px; flex-direction:column; align-items:flex-start;">
                    ${reviewStatus}
                    ${reviewDetails}
                    <button class="delete-btn" data-product-id="${p._id}" data-viewer-id="${v._id}"><i class="fas fa-trash"></i> Delete</button>
                </div>
            </li>`;
        });
    }).join('') || "<li>No viewers found.</li>";
    
    const relevantTransactions = isMainAdmin ? allTransactions : allTransactions.filter(transaction =>
        transaction.items.some(item => {
            const product = allProducts.find(p => p.productId === item.productId);
            return product && (product.category === mappedSellerCategory || (categoryData[product.category] && categoryData[product.category].parent === mappedSellerCategory));
        })
    );

    const faqListHTML = allFAQs.map(faq => `
        <li>
            <div class="faq-info">
                <strong>Q:</strong> ${faq.question}
                <p style="margin-left: 20px; color: #555;"><strong>A:</strong> ${faq.answer}</p>
            </div>
            <div class="actions">
                <button class="edit-faq-btn" data-faq-id="${faq._id}"><i class="fas fa-edit"></i> Edit</button>
                <button class="delete-faq-btn" data-faq-id="${faq._id}"><i class="fas fa-trash"></i> Delete</button>
            </div>
        </li>
    `).join('');

    const transactionsListHTML = (relevantTransactions || []).length > 0
    ? (() => {
        const totalRevenue = (relevantTransactions || []).reduce((sum, t) => sum + (t.totalAmount || 0), 0);
        const totalGiftCards = (relevantTransactions || []).reduce((sum, t) => sum + (t.giftCardEarned || 0), 0);
        return `<table class="transactions-table" style="width: 100%; border-collapse: collapse; margin-top: 15px;">
        <thead>
            <tr style="background-color: #f0f0f0; border-bottom: 2px solid var(--border-color);">
                <th style="padding: 10px; text-align: left; border: 1px solid var(--border-color);">Customer</th>
                <th style="padding: 10px; text-align: left; border: 1px solid var(--border-color);">Email</th>
                <th style="padding: 10px; text-align: right; border: 1px solid var(--border-color);">Total</th>
                <th style="padding: 10px; text-align: left; border: 1px solid var(--border-color);">Date</th>
                <th style="padding: 10px; text-align: center; border: 1px solid var(--border-color);">Details</th>
                <th style="padding: 10px; text-align: center; border: 1px solid var(--border-color);">Verified</th>
            </tr>
        </thead>
        <tbody>
            ${(relevantTransactions || []).map((t, idx) => `
                <tr class="transaction-row ${t.verified ? 'verified' : ''}" data-transaction-id="${t._id}">
                    <td style="padding: 10px; border: 1px solid var(--border-color);">${t.customerName || 'N/A'}</td>
                    <td style="padding: 10px; border: 1px solid var(--border-color);">${t.customerEmail || 'N/A'}</td>
                    <td style="padding: 10px; border: 1px solid var(--border-color); text-align: right;"><strong>${formatCurrency(t.totalAmount || 0)}</strong></td>
                    <td style="padding: 10px; border: 1px solid var(--border-color);">${t.createdAt ? new Date(t.createdAt).toLocaleDateString() : 'N/A'}</td>
                    <td style="padding: 10px; border: 1px solid var(--border-color); text-align: center;"><button class="view-transaction-btn" data-index="${idx}" style="padding: 6px 12px; background-color: var(--corporate-blue); color: white; border: none; border-radius: 4px; cursor: pointer;"><i class="fas fa-eye"></i></button></td>
                    <td style="padding: 10px; border: 1px solid var(--border-color); text-align: center;">
                        <label class="verify-switch switch">
                            <input type="checkbox" class="verify-switch" ${t.verified ? 'checked' : ''}>
                            <span class="slider round"></span>
                        </label>
                    </td>
                </tr>
            `).join('')}
        </tbody>
        <tfoot>
            <tr style="background-color: #f0f0f0; border-top: 2px solid var(--border-color); font-weight: bold;">
                <td colspan="2" style="padding: 15px 10px; border: 1px solid var(--border-color); text-align: right;"><strong>TOTAL REVENUE:</strong></td>
                <td style="padding: 15px 10px; border: 1px solid var(--border-color); text-align: right; background-color: #c8e6c9;"><strong style="color: #1b5e20; font-size: 1.1rem;">${formatCurrency(totalRevenue)}</strong></td>
                <td colspan="3" style="padding: 15px 10px; border: 1px solid var(--border-color);"></td>
            </tr>
        </tfoot>
    </table>`;
    })()
    : '<p>No transactions yet.</p>';
    
    const productOptions = allProducts.map(p => `<option value="${p.productId}">${p.title}</option>`).join('');
    
    const backToAdminButton = sessionStorage.getItem('mainAdminInfo') 
        ? `<button id="back-to-main-admin" class="btn btn-primary" style="margin-bottom: 1rem; background-color: var(--corporate-gold); color: #333;"><i class="fas fa-arrow-left"></i> Return to Main Admin Dashboard</button>` 
        : '';

    appRoot.innerHTML = `
        <div class="page-container admin-container">
            ${backToAdminButton}
             <div style="display: flex; justify-content: space-between; align-items: center;">
                <h1>${sellerType.charAt(0).toUpperCase() + sellerType.slice(1)} Dashboard</h1>
                <button id="logout-btn" class="btn btn-outline">Logout</button>
            </div>
            <div class="admin-tabs">${adminTabs}</div>

            <div id="products" class="admin-tab-content active">
                <section class="admin-section">
                    <h2>Add / Edit Product</h2>
                    <form id="product-form" class="admin-form">
                        <input type="hidden" id="product-id-hidden">
                        <div class="form-grid">
                            <div class="form-group"><label for="product-id">Product ID</label><input type="text" id="product-id" required></div>
                            <div class="form-group"><label for="product-title">Title</label><input type="text" id="product-title" required></div>
                            <div class="form-group"><label for="product-currentPrice">Current Price</label><input type="number" id="product-currentPrice" required></div>
                            <div class="form-group"><label for="product-oldPrice">Old Price</label><input type="number" id="product-oldPrice" required></div>
                            <div class="form-group"><label for="product-category">Category</label><input type="text" id="product-category" value="${isMainAdmin ? '' : mappedSellerCategory}" ${!isMainAdmin ? 'readonly' : ''} required></div>
                            <div class="form-group"><label for="product-image">Image URL</label><input type="text" id="product-image" required></div>
                            <div class="form-group"><label for="product-images">Upload up to 3 images</label><input type="file" id="product-images" accept="image/*" multiple></div>
                            <div id="product-images-preview" class="images-preview" style="display:flex; gap:8px; margin-top:8px;"></div>
                            <input type="hidden" id="product-thumbnails-hidden">
                            <div class="form-group"><label>Track Stock?</label><input type="checkbox" id="product-stockToggle"></div>
                            <div class="form-group" id="stock-field-group"><label for="product-stock">Stock Amount</label><input type="number" id="product-stock" value="10" min="0" step="1"></div>
                            ${!isClothesAdmin && !isKidsAdmin ? `<div class="form-group"><label for="product-condition">Condition</label><select id="product-condition"><option value="new">New</option><option value="second-hand">Second-Hand</option></select></div>` : ''}
                            
                            <div class="form-group" style="display: flex; align-items: center; gap: 12px;"><label style="margin: 0;">Enable Color Variations?</label><input type="checkbox" id="enable-product-colors"></div>
                            
                            <div id="product-colors-section" style="display:none; margin-top:1.5rem; padding:1rem; background-color:#f9f9f9; border-radius:8px;">
                                <label style="display:block; margin-bottom:8px; font-weight:600;">Product Colors (Enter up to 3 color names or hex codes)</label>
                                <div style="display:flex; gap:8px; flex-wrap:wrap;">
                                    <input type="text" id="product-color-1" placeholder="e.g., Black or #000000" style="flex:1; min-width:150px;">
                                    <input type="text" id="product-color-2" placeholder="e.g., Silver or #C0C0C0" style="flex:1; min-width:150px;">
                                    <input type="text" id="product-color-3" placeholder="e.g., Gold or #FFD700" style="flex:1; min-width:150px;">
                                </div>
                                <div id="product-colors-preview" style="display:flex; gap:12px; margin-top:10px;"></div>
                            </div>

                            ${isMainAdmin ? `
                            <div id="ai-features-section" style="margin-top:1.5rem; padding:1rem; background-color:#f0f7ff; border-radius:8px; border-left:4px solid var(--primary-blue);">
                                <h3 style="margin-top:0; margin-bottom:1rem; color:var(--primary-blue);">🤖 AI-Powered Features</h3>
                                <div style="margin-bottom:1rem;">
                                    <label style="display:block; margin-bottom:0.5rem; font-weight:600;">Product Features (Auto-generated)</label>
                                    <p style="margin:0.5rem 0 0.5rem 0; font-size:0.9rem; color:#666;">Type a product title above and we'll generate relevant features</p>
                                    <div id="product-features-container" style="display:flex; flex-direction:column; gap:8px; margin-top:8px;">
                                    </div>
                                    <button type="button" id="ai-generate-features-btn" style="margin-top:10px; padding:8px 16px; background-color:var(--primary-blue); color:white; border:none; border-radius:4px; cursor:pointer; font-weight:600;">Generate Features from Title</button>
                                    <button type="button" id="ai-clear-features-btn" style="margin-top:10px; margin-left:8px; padding:8px 16px; background-color:#ccc; color:#333; border:none; border-radius:4px; cursor:pointer;">Clear All</button>
                                    <div id="ai-features-status" style="margin-top:10px; font-size:0.9rem; color:#666; display:none;"></div>
                                </div>
                            </div>
                            ` : ''}
                            
                            <div class="form-group"><label>On Sale?</label><input type="checkbox" id="product-onSale"></div>
                        </div>
                        <div id="sale-dates-section" style="display:none; margin-top:1.5rem; padding:1rem; background-color:#f9f9f9; border-radius:8px;">
                            <h3 style="margin-bottom:1rem;">Sale Duration</h3>
                            <div class="form-grid">
                                <div class="form-group"><label for="product-saleStartDate">Sale Start Date & Time</label><input type="datetime-local" id="product-saleStartDate"></div>
                                <div class="form-group"><label for="product-saleEndDate">Sale End Date & Time</label><input type="datetime-local" id="product-saleEndDate"></div>
                            </div>
                        </div>
                        <h3 style="margin-top: 1.5rem; margin-bottom: 1rem;">Assign to Curated Pages</h3>
                        ${isMainAdmin ? `
                        <div class="form-grid">
                            <div class="form-group"><label>Trending Now <input type="checkbox" id="product-curate-trending" class="product-curate-toggle"></label></div>
                            <div class="form-group"><label>New Releases <input type="checkbox" id="product-curate-new-arrivals" class="product-curate-toggle"></label></div>
                            <div class="form-group"><label>Super Combos <input type="checkbox" id="product-curate-combos" class="product-curate-toggle"></label></div>
                        </div>
                        ` : `
                        <div class="form-grid">
                            ${isKidsAdmin ? `
                            <div class="form-group"><label>Kids Electronics <input type="checkbox" id="product-curate-kids-electronics" class="product-curate-toggle"></label></div>
                            <div class="form-group"><label>Kids Clothing <input type="checkbox" id="product-curate-kids-clothing" class="product-curate-toggle"></label></div>
                            <div class="form-group"><label>Kids Toys <input type="checkbox" id="product-curate-kids-toys" class="product-curate-toggle"></label></div>
                            ` : `
                            ${!isFurnitureAdmin ? `
                            <div class="form-group"><label>Women's Clothes Page <input type="checkbox" id="product-curate-womens" class="product-curate-toggle"></label></div>
                            <div class="form-group"><label>Men's Clothes Page <input type="checkbox" id="product-curate-mens" class="product-curate-toggle"></label></div>
                            ` : ''}
                            ${isFurnitureAdmin ? `
                            <div class="form-group"><label>Living Room <input type="checkbox" id="product-curate-livingroom" class="product-curate-toggle"></label></div>
                            <div class="form-group"><label>Bedroom <input type="checkbox" id="product-curate-bedroom" class="product-curate-toggle"></label></div>
                            <div class="form-group"><label>Office <input type="checkbox" id="product-curate-office" class="product-curate-toggle"></label></div>
                            <div class="form-group"><label>Kitchen <input type="checkbox" id="product-curate-kitchen" class="product-curate-toggle"></label></div>
                            ` : ''}
                            `}
                            <div class="form-group"><label>Super Combos <input type="checkbox" id="product-curate-combos" class="product-curate-toggle"></label></div>
                            ${!isKidsAdmin ? `
                            <div class="form-group" style="grid-column: 1 / -1;">
                                <label style="display:block; margin-bottom:6px; font-weight:600;">${isFurnitureAdmin ? 'Furniture Filters (assign this product to specific furniture filter categories)' : 'Clothing Filters (assign this product to specific clothing filter categories)'}</label>
                                <div style="display:flex; gap:10px; flex-wrap:wrap;">
                                    ${!isFurnitureAdmin ? `
                                    <label><input type="checkbox" id="product-filter-tops" class="product-curated-checkbox"> Tops</label>
                                    <label><input type="checkbox" id="product-filter-bottoms" class="product-curated-checkbox"> Bottoms</label>
                                    <label><input type="checkbox" id="product-filter-official" class="product-curated-checkbox"> Official</label>
                                    <label><input type="checkbox" id="product-filter-traditional" class="product-curated-checkbox"> Traditional</label>
                                    <label><input type="checkbox" id="product-filter-shoes" class="product-curated-checkbox"> Shoes</label>
                                    <label><input type="checkbox" id="product-filter-accessories" class="product-curated-checkbox"> Accessories</label>
                                    ` : ''}
                                    ${isFurnitureAdmin ? `<label><input type="checkbox" id="product-filter-furniture" class="product-curated-checkbox"> Furniture</label>
                                    <label><input type="checkbox" id="product-filter-appliances" class="product-curated-checkbox"> Appliances</label>` : ''}
                                </div>
                            </div>
                            ` : ''}
                        </div>
                        `}
                        <div id="combo-expiry-section" style="display:none; margin-top:1.5rem; padding:1rem; background-color:#fffbe6; border-radius:8px; border-left: 4px solid var(--corporate-gold);">
                            <div class="form-group">
                                <label for="product-comboEndDate">Combo Sale End Date</label>
                                <input type="datetime-local" id="product-comboEndDate">
                            </div>
                        </div>
                        <div id="combo-builder-section" class="admin-form" style="display:none; margin-top:1.5rem; padding:1.5rem; background-color:#eaf5ff; border-radius:12px; border-left: 4px solid var(--corporate-blue);">
                            <h3 style="margin-top:0; margin-bottom: 1rem; color: var(--corporate-blue);">Combo Product Builder</h3>
                            <p style="margin-top:0; margin-bottom:1rem; font-size: 0.9rem; color: #555;">Select up to 5 products to create a visual combo. The generated image will become this product's main image.</p>
                            <div class="form-group">
                                <label for="combo-product-search">Search products to add</label>
                                <input type="text" id="combo-product-search" placeholder="Type to filter product list...">
                            </div>
                            <div id="combo-product-list" style="max-height: 200px; overflow-y: auto; border: 1px solid #d2d2d7; background: white; padding: 10px; margin-bottom: 1rem; border-radius: 8px;">
                            </div>
                            <p style="font-weight: 600;">Selected Products (<span id="combo-selected-count">0</span>/5):</p>
                            <div id="combo-selected-preview" style="display:flex; flex-wrap:wrap; gap:10px; margin-bottom: 1.5rem; min-height: 50px; background: #dfeffc; padding: 10px; border-radius: 8px;">
                            </div>
                            <h4 style="margin-bottom: 0.5rem;">Generated Combo Image Preview:</h4>
                            <canvas id="combo-image-canvas" width="500" height="500" style="width: 250px; height: 250px; border: 2px dashed #ccc; background: #f9f9f9; border-radius: 8px;"></canvas>
                            <div id="combo-total-display" style="margin-top:10px; font-weight:700;">Calculated Total (Old Price): N$<span id="combo-total-value">0</span></div>
                            <div class="form-group" style="margin-top: 1rem;">
                                <label for="product-comboSalePrice"><strong>Combo Sale Price (Current Price)</strong></label>
                                <input type="number" id="product-comboSalePrice" required>
                            </div>
                            <input type="hidden" id="combo-product-ids-hidden">
                        </div>
                        ${isMainAdmin ? `
                        <h3 style="margin-top: 1.5rem; margin-bottom: 1rem;">Rewards & Promotions</h3>
                        <div class="form-grid">
                           <div class="form-group">
                               <label>Enable Gift Card Reward <input type="checkbox" id="product-giftCardEnabled" class="product-curate-toggle"></label>
                           </div>
                        </div>
                        <div id="gift-card-config-section" style="display:none; margin-top:1rem; padding:1rem; background-color:#f0f7ff; border-radius:8px; border-left:4px solid var(--corporate-blue);">
                           <div class="form-grid">
                               <div class="form-group">
                                   <label for="product-giftCardType">Reward Type</label>
                                   <select id="product-giftCardType">
                                       <option value="percent">Percentage</option>
                                       <option value="fixed">Fixed Amount</option>
                                   </select>
                               </div>
                               <div class="form-group">
                                   <label for="product-giftCardValue" id="gift-card-value-label">Value (%)</label>
                                   <input type="number" id="product-giftCardValue" value="5" min="0" step="0.01">
                               </div>
                           </div>
                        </div>
                        ` : ''}
                        <div id="product-validation-msg" style="color:#b71c1c; margin:8px 0; display:none; font-weight:600;"></div>
                        <button id="product-save-btn" type="submit" class="btn btn-primary">Save Product</button>
                        <button type="reset" id="clear-form-btn" class="btn btn-outline">Clear Form</button>
                        <button type="button" id="cancel-edit-btn" class="btn btn-outline" style="display:none;">Cancel</button>
                    </form>
                </section>
                <section class="admin-section">
                    <h2>Manage Products</h2>
                    <div id="product-list-admin"><ul>${productListHTML}</ul></div>
                </section>
            </div>
            
            <div id="transactions" class="admin-tab-content">
                <section class="admin-section">
                    <h2>${isMainAdmin ? 'All Transactions' : 'Your Transactions'}</h2>
                    <div id="transaction-list-admin">${transactionsListHTML}</div>
                </section>
            </div>

            ${isMainAdmin ? `
                <div id="add-viewer" class="admin-tab-content"><section class="admin-section"><h3>Add New Viewer</h3><div id="viewers-message" style="display: none;"></div><form id="add-viewers-form"><div class="form-group"><label for="viewers-product">Select Product</label><select id="viewers-product" required>${productOptions}</select></div><div class="form-group"><label for="viewer-name">Viewer Name (optional)</label><input type="text" id="viewer-name" placeholder="e.g. John Doe"></div><div class="form-group"><label>Also add a review for this viewer <input type="checkbox" id="add-review-now" class="product-curate-toggle"></label></div><div id="add-review-fields" style="display:none; margin-top:8px;"><div class="form-group"><label for="review-rating">Rating</label><select id="review-rating"><option value="5">5</option><option value="4">4</option><option value="3">3</option><option value="2">2</option><option value="1">1</option></select></div><div class="form-group"><label for="review-text">Review Text</label><input type="text" id="review-text" placeholder="Write the review here"></div></div><div class="form-group"><label>Select Peak Time</label><div id="peak-times-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 10px;"></div></div><button type="submit" class="btn btn-primary">Add Viewer</button></form></section></div>
                <div id="manage-viewers" class="admin-tab-content"><section class="admin-section"><h2>Manage Viewers</h2><div id="viewer-list-admin"><ul>${viewerListHTML}</ul></div></section></div>
                <div id="users" class="admin-tab-content"><section class="admin-section"><h2>Manage Users</h2><div id="user-list-admin"><ul>${userListHTML}</ul></div></section></div>
                <div id="sellers" class="admin-tab-content">
                    <section class="admin-section">
                        <h2>Manage Seller Accounts</h2>
                        <p>Click on a seller account to view their dashboard in this tab, or use the <strong>Open Dashboard</strong> links to open a reseller's dashboard directly in a new tab.</p>
                        <div id="seller-list-admin"><ul>${sellerListHTML}</ul></div>
                    </section>
                </div>
                <div id="faqs" class="admin-tab-content">
                    <section class="admin-section">
                        <h2>Add / Edit FAQ</h2>
                        <form id="faq-form" class="admin-form">
                            <input type="hidden" id="faq-id-hidden">
                            <div class="form-group full-width"><label for="faq-question">Question</label><input type="text" id="faq-question" required></div>
                            <div class="form-group full-width"><label for="faq-answer">Answer</label><textarea id="faq-answer" required></textarea></div>
                            <button id="faq-save-btn" type="submit" class="btn btn-primary">Save FAQ</button>
                            <button type="reset" id="clear-faq-form-btn" class="btn btn-outline">Clear</button>
                        </form>
                    </section>
                    <section class="admin-section">
                        <h2>Manage FAQs</h2>
                        <div id="faq-list-admin"><ul>${faqListHTML}</ul></div>
                    </section>
                </div>
                <div id="site-settings" class="admin-tab-content"><section class="admin-section"><h2>Site Settings & Hero Images</h2>
                    <p>Update homepage hero carousel images and category hero images used across the site.</p>
                    <form id="site-settings-form">
                        <h3>Homepage Heroes (4 slides)</h3>
                        <div class="form-grid">
                            ${[1,2,3,4].map(i => `
                                <div class="form-group">
                                    <label for="home-hero-url-${i}">Hero ${i} URL</label>
                                    <input type="text" id="home-hero-url-${i}" name="home_hero_${i}" placeholder="Image URL" value="${(settings && Array.isArray(settings) ? (settings.find(s=>s.key==='home_hero_' + i)?.value || '') : '')}">
                                    <label for="home-hero-file-${i}">Or upload file</label>
                                    <input type="file" id="home-hero-file-${i}" accept="image/*">
                                </div>
                            `).join('')}
                        </div>
                        <h3 style="margin-top: 1rem;">Category Hero Images</h3>
                        <div style="margin-bottom: 1rem;">Set hero image URL or upload for each category.</div>
                        <div class="form-grid" id="category-hero-grid">
                            ${Object.keys(categoryData).filter(k => categoryData[k] && categoryData[k].heroImage).map(k => `
                                <div class="form-group">
                                    <label for="cat-hero-url-${k}">${categoryData[k].name}</label>
                                    <input type="text" id="cat-hero-url-${k}" name="heroImage_${k}" placeholder="Image URL" value="${(settings && Array.isArray(settings) ? (settings.find(s=>s.key==='heroImage_'+k)?.value || '') : '')}">
                                    <label for="cat-hero-file-${k}">Or upload file</label>
                                    <input type="file" id="cat-hero-file-${k}" accept="image/*">
                                </div>
                            `).join('')}
                        </div>
                        <div style="margin-top: 1rem;"><button class="btn btn-primary" type="submit">Save Site Settings</button></div>
                    </form>
                </section></div>
            ` : ''}
        </div>`;
    
    attachAdminEventListeners(isMainAdmin, allProducts, relevantTransactions, allFAQs);
    if (isMainAdmin) {
        initAdminViewers();
    }
};

// FIX: This entire function has been rewritten for correctness
const attachAdminEventListeners = (isMainAdmin, allProducts, relevantTransactions, allFAQs) => {
    const adminContainer = document.querySelector('.admin-container');
    if (!adminContainer) return;

    // --- Tab Switching ---
    adminContainer.addEventListener('click', (e) => {
        if (e.target.matches('.admin-tab-btn')) {
            const tab = e.target.dataset.tab;
            adminContainer.querySelectorAll('.admin-tab-btn').forEach(btn => btn.classList.remove('active'));
            e.target.classList.add('active');
            adminContainer.querySelectorAll('.admin-tab-content').forEach(content => content.classList.remove('active'));
            document.getElementById(tab).classList.add('active');
        }
    });

    const productForm = document.getElementById('product-form');
    const productList = document.getElementById('product-list-admin');
    let selectedComboProducts = [];

    // --- Form Reset ---
    const resetForm = () => {
        productForm.reset();
        document.getElementById('product-id-hidden').value = '';
        const categoryInput = document.getElementById('product-category');
        if (!isMainAdmin) {
            const st = getSellerType();
            const map = { 'clothes': 'clothing', 'cloth': 'clothing', 'furnitures': 'furniture', 'furniture': 'furniture', 'kids': 'kids' };
            categoryInput.value = map[st] || st || '';
        }
        // Reset stock field visibility
        const stockToggle = document.getElementById('product-stockToggle');
        const stockFieldGroup = document.getElementById('stock-field-group');
        if (stockToggle && stockFieldGroup) {
            if (stockToggle.checked) {
                stockFieldGroup.style.display = 'flex';
            } else {
                stockFieldGroup.style.display = 'none';
            }
        }
        // Reset sale dates section visibility
        const saleDatesSection = document.getElementById('sale-dates-section');
        if (saleDatesSection) {
            saleDatesSection.style.display = 'none';
        }
        document.getElementById('product-saleStartDate').value = '';
        document.getElementById('product-saleEndDate').value = '';
        // Clear image previews and hidden thumbnails
        const imagesPreview = document.getElementById('product-images-preview');
        if (imagesPreview) imagesPreview.innerHTML = '';
        const thumbsHidden = document.getElementById('product-thumbnails-hidden');
        if (thumbsHidden) thumbsHidden.value = '';
        // Reset curated page toggles
        const womensToggle = document.getElementById('product-curate-womens');
        const mensToggle = document.getElementById('product-curate-mens');
        const livingToggle = document.getElementById('product-curate-livingroom');
        const bedroomToggle = document.getElementById('product-curate-bedroom');
        const officeToggle = document.getElementById('product-curate-office');
        const kitchenToggle = document.getElementById('product-curate-kitchen');
        const kidsElectronicsToggle = document.getElementById('product-curate-kids-electronics');
        const kidsClothingToggle = document.getElementById('product-curate-kids-clothing');
        const kidsToysToggle = document.getElementById('product-curate-kids-toys');
        if (womensToggle) womensToggle.checked = false;
        if (mensToggle) mensToggle.checked = false;
        if (livingToggle) livingToggle.checked = false;
        if (bedroomToggle) bedroomToggle.checked = false;
        if (officeToggle) officeToggle.checked = false;
        if (kitchenToggle) kitchenToggle.checked = false;
        if (kidsElectronicsToggle) kidsElectronicsToggle.checked = false;
        if (kidsClothingToggle) kidsClothingToggle.checked = false;
        if (kidsToysToggle) kidsToysToggle.checked = false;
        // Reset clothing filter toggles
        ['product-filter-tops','product-filter-bottoms','product-filter-official','product-filter-traditional','product-filter-shoes','product-filter-accessories','product-filter-furniture','product-filter-appliances'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.checked = false;
        });
        // Reset color inputs and preview
        ['product-color-1', 'product-color-2', 'product-color-3'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.value = '';
        });
        const colorsPreview = document.getElementById('product-colors-preview');
        if (colorsPreview) colorsPreview.innerHTML = '';
        // Reset color toggle
        const enableColorsToggle = document.getElementById('enable-product-colors');
        const colorsSection = document.getElementById('product-colors-section');
        if (enableColorsToggle) {
            enableColorsToggle.checked = false;
        }
        if (colorsSection) {
            colorsSection.style.display = 'none';
        }
        // Reset AI features
        const featuresContainer = document.getElementById('product-features-container');
        if (featuresContainer) {
            featuresContainer.innerHTML = '<p style="font-size:0.9rem; color:#999; margin:0;">No features yet. Generate some using the button below.</p>';
        }
        const aiStatusDiv = document.getElementById('ai-features-status');
        if (aiStatusDiv) {
            aiStatusDiv.textContent = '';
            aiStatusDiv.style.display = 'none';
        }
        // Hide validation message
        const validationMsg = document.getElementById('product-validation-msg');
        if (validationMsg) { validationMsg.textContent = ''; validationMsg.style.display = 'none'; }
        
        // Reset combo builder and expiry
        const comboToggle = document.getElementById('product-curate-combos');
        const comboExpirySection = document.getElementById('combo-expiry-section');
        const comboSalePriceInput = document.getElementById('product-comboSalePrice');
        if (comboToggle) {
            comboToggle.checked = false;
            comboToggle.dispatchEvent(new Event('change'));
        }
        if (comboSalePriceInput) comboSalePriceInput.value = '';
        // Reset gift card section
        const giftCardToggle = document.getElementById('product-giftCardEnabled');
        const giftCardConfigSection = document.getElementById('gift-card-config-section');
        if(giftCardToggle) giftCardToggle.checked = false;
        if(giftCardConfigSection) giftCardConfigSection.style.display = 'none';


        formInteracted = false; // Reset interaction flag
    };
    document.getElementById('clear-form-btn').addEventListener('click', resetForm);
    
    // --- Cancel Edit Button Listener ---
    document.getElementById('cancel-edit-btn').addEventListener('click', () => {
        document.getElementById('product-id-hidden').value = '';
        resetForm();
        document.getElementById('cancel-edit-btn').style.display = 'none';
        document.querySelector('form h3').textContent = 'Add New Product';
    });

    // --- Stock Toggle Listener ---
    const stockToggle = document.getElementById('product-stockToggle');
    const stockFieldGroup = document.getElementById('stock-field-group');
    if (stockToggle) {
        stockToggle.addEventListener('change', (e) => {
            if (e.target.checked) {
                stockFieldGroup.style.display = 'flex';
            } else {
                stockFieldGroup.style.display = 'none';
            }
        });
    }
    // --- Image input preview handler with cropping ---
    const imagesInput = document.getElementById('product-images');
    const imagesPreview = document.getElementById('product-images-preview');
    let cropper = null;
    let currentImageIndex = 0;
    let filesToProcess = [];
    let processedImages = [];
    
    if (imagesInput && imagesPreview) {
        imagesInput.addEventListener('change', (e) => {
            filesToProcess = Array.from(e.target.files).slice(0, 3);
            processedImages = [];
            currentImageIndex = 0;
            
            if (filesToProcess.length > 0) {
                processNextImage();
            }
        });
    }
    
    // Function to process images one by one
    const processNextImage = () => {
        if (currentImageIndex >= filesToProcess.length) {
            // All images processed, show preview
            imagesPreview.innerHTML = '';
            processedImages.forEach(imgDataUrl => {
                const img = document.createElement('img');
                img.src = imgDataUrl;
                img.style.width = '64px';
                img.style.height = '64px';
                img.style.objectFit = 'cover';
                img.style.borderRadius = '6px';
                imagesPreview.appendChild(img);
            });
            return;
        }
        
        const file = filesToProcess[currentImageIndex];
        const reader = new FileReader();
        reader.onload = (ev) => {
            showImageCropperModal(ev.target.result);
        };
        reader.readAsDataURL(file);
    };
    
    // Show image cropper modal
    const showImageCropperModal = (imageSrc) => {
        const modal = document.getElementById('image-cropper-modal');
        const cropperImg = document.getElementById('cropper-image');
        const cropConfirmBtn = document.getElementById('crop-confirm-btn');
        const cropCancelBtn = document.getElementById('crop-cancel-btn');
        
        cropperImg.src = imageSrc;
        modal.classList.add('active');
        
        // Destroy existing cropper if any
        if (cropper) {
            cropper.destroy();
        }
        
        // Initialize cropper with square aspect ratio
        cropper = new Cropper(cropperImg, {
            aspectRatio: 1,
            viewMode: 1,
            autoCropArea: 1,
            responsive: true,
            restore: true,
            guides: true,
            center: true,
            highlight: true,
            cropBoxMovable: true,
            cropBoxResizable: true,
            toggleDragModeOnDblclick: true,
        });
        
        // Handle crop confirm
        const handleCropConfirm = () => {
            const canvas = cropper.getCroppedCanvas({
                maxWidth: 500,
                maxHeight: 500,
                fillColor: '#fff',
                imageSmoothingEnabled: true,
                imageSmoothingQuality: 'high',
            });
            
            processedImages.push(canvas.toDataURL());
            currentImageIndex++;
            
            modal.classList.remove('active');
            cropConfirmBtn.removeEventListener('click', handleCropConfirm);
            cropCancelBtn.removeEventListener('click', handleCropCancel);
            
            processNextImage();
        };
        
        // Handle crop cancel
        const handleCropCancel = () => {
            modal.classList.remove('active');
            cropConfirmBtn.removeEventListener('click', handleCropConfirm);
            cropCancelBtn.removeEventListener('click', handleCropCancel);
            
            // If user cancels, stop processing
            filesToProcess = [];
            processedImages = [];
            currentImageIndex = 0;
            imagesInput.value = '';
        };
        
        cropConfirmBtn.addEventListener('click', handleCropConfirm);
        cropCancelBtn.addEventListener('click', handleCropCancel);
    };
    
    // --- On Sale Toggle Listener ---
    const onSaleToggle = document.getElementById('product-onSale');
    const saleDatesSection = document.getElementById('sale-dates-section');
    if (onSaleToggle && saleDatesSection) {
        onSaleToggle.addEventListener('change', (e) => {
            saleDatesSection.style.display = e.target.checked ? 'block' : 'none';
        });
    }

    // --- Enable Color Variations Toggle Listener ---
    const enableColorsToggle = document.getElementById('enable-product-colors');
    const colorsSection = document.getElementById('product-colors-section');
    if (enableColorsToggle && colorsSection) {
        enableColorsToggle.addEventListener('change', (e) => {
            colorsSection.style.display = e.target.checked ? 'block' : 'none';
            // Clear color inputs when disabled
            if (!e.target.checked) {
                ['product-color-1', 'product-color-2', 'product-color-3'].forEach(id => {
                    const input = document.getElementById(id);
                    if (input) input.value = '';
                });
                const colorsPreview = document.getElementById('product-colors-preview');
                if (colorsPreview) colorsPreview.innerHTML = '';
            }
        });
    }

    // --- Color Preview Listener ---
    const colorInputs = ['product-color-1', 'product-color-2', 'product-color-3'];
    const updateColorPreview = () => {
        const colorsPreview = document.getElementById('product-colors-preview');
        if (!colorsPreview) return;
        colorsPreview.innerHTML = '';
        colorInputs.forEach(id => {
            const input = document.getElementById(id);
            if (input && input.value.trim()) {
                const colorValue = input.value.trim();
                const circle = document.createElement('div');
                circle.style.width = '50px';
                circle.style.height = '50px';
                circle.style.borderRadius = '50%';
                circle.style.border = '2px solid #d2d2d7';
                circle.style.cursor = 'pointer';
                circle.title = colorValue;
                try {
                    circle.style.backgroundColor = colorValue;
                } catch (e) {
                    circle.style.backgroundColor = '#cccccc';
                }
                colorsPreview.appendChild(circle);
            }
        });
    };

    colorInputs.forEach(id => {
        const input = document.getElementById(id);
        if (input) {
            input.addEventListener('input', updateColorPreview);
            input.addEventListener('change', updateColorPreview);
        }
    });

    // --- AI Features Generator ---
    // Elements for AI features; only present for main admin
    const aiGenerateFeaturesBtn = document.getElementById('ai-generate-features-btn');
    const aiClearFeaturesBtn = document.getElementById('ai-clear-features-btn');
    const aiStatusDiv = document.getElementById('ai-features-status');
    const featuresContainer = document.getElementById('product-features-container');



    const updateFeaturesDisplay = () => {
        if (!featuresContainer) return;
        // Get all feature inputs from the container
        const featureInputs = featuresContainer.querySelectorAll('input[type="text"]');
        // Update display to show features as editable items with remove buttons
        const features = Array.from(featureInputs).map(input => input.value).filter(f => f.trim());
        
        if (features.length === 0 && featureInputs.length === 0) {
            featuresContainer.innerHTML = '<p style="font-size:0.9rem; color:#999; margin:0;">No features yet. Generate some using the button below.</p>';
        }
    };

    const displayFeatures = (features) => {
        if (!featuresContainer || !Array.isArray(features)) return;
        
        featuresContainer.innerHTML = '';
        
        if (features.length === 0) {
            featuresContainer.innerHTML = '<p style="font-size:0.9rem; color:#999; margin:0;">No features generated. Try again.</p>';
            return;
        }

        features.forEach((feature, index) => {
            const featureDiv = document.createElement('div');
            featureDiv.style.cssText = 'display:flex; gap:8px; margin-bottom:8px; align-items:center;';
            
            const input = document.createElement('input');
            input.type = 'text';
            input.value = feature;
            input.className = 'ai-feature-input';
            input.dataset.featureIndex = index;
            input.style.cssText = 'flex:1; padding:8px; border:1px solid #ddd; border-radius:4px; font-size:0.9rem;';
            
            const removeBtn = document.createElement('button');
            removeBtn.type = 'button';
            removeBtn.textContent = '✕';
            removeBtn.style.cssText = 'padding:6px 12px; background-color:#ff4444; color:white; border:none; border-radius:4px; cursor:pointer; font-weight:bold;';
            removeBtn.onclick = (e) => {
                e.preventDefault();
                featureDiv.remove();
            };
            
            featureDiv.appendChild(input);
            featureDiv.appendChild(removeBtn);
            featuresContainer.appendChild(featureDiv);
        });
    };

    const setStatus = (message, isError = false) => {
        if (!aiStatusDiv) return;
        aiStatusDiv.textContent = message;
        aiStatusDiv.style.display = message ? 'block' : 'none';
        aiStatusDiv.style.color = isError ? '#d32f2f' : '#2e7d32';
    };

    const generateFeatures = async () => {
        const titleInput = document.getElementById('product-title');
        const title = titleInput?.value?.trim();

        if (!title) {
            setStatus('❌ Please enter a product title first', true);
            return;
        }

        if (title.length < 3) {
            setStatus('❌ Product title must be at least 3 characters', true);
            return;
        }

        try {
            if (!isMainAdmin) return; // guard: only main admin should trigger AI
            if (aiGenerateFeaturesBtn) aiGenerateFeaturesBtn.disabled = true;
            setStatus('⏳ Generating features using Gemini AI...', false);

            const response = await fetch('/api/ai/generate-features', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ title })
            });

            if (!response.ok) {
                const error = await response.json();
                setStatus(`❌ ${error.error || 'Failed to generate features'}`, true);
                return;
            }

            const data = await response.json();

            if (data.success && Array.isArray(data.features)) {
                displayFeatures(data.features);
                setStatus(`✓ Successfully generated ${data.features.length} features!`, false);
            } else {
                setStatus('❌ No features were generated. Try a different product title.', true);
            }
        } catch (error) {
            console.error('Error generating features:', error);
            setStatus(`❌ Error: ${error.message}`, true);
        } finally {
            if (aiGenerateFeaturesBtn) aiGenerateFeaturesBtn.disabled = false;
        }
    };

    if (aiGenerateFeaturesBtn) {
        aiGenerateFeaturesBtn.addEventListener('click', (e) => {
            e.preventDefault();
            generateFeatures();
        });
    }

    // Auto-generate features when title is typed
    const productTitleInput = document.getElementById('product-title');
    let featureGenerationTimeout = null;
    if (productTitleInput) {
        productTitleInput.addEventListener('input', (e) => {
            // Clear previous timeout
            if (featureGenerationTimeout) {
                clearTimeout(featureGenerationTimeout);
            }
            
            const titleValue = e.target.value.trim();
            
            // Only auto-generate if title has at least 5 characters (to avoid generating for incomplete titles)
            if (titleValue.length >= 5) {
                // Debounce: wait 1.5 seconds after user stops typing before generating
                featureGenerationTimeout = setTimeout(() => {
                    console.log('Auto-generating features for:', titleValue);
                    if (isMainAdmin) generateFeatures(); // Only auto-generate for main admin
                }, 1500);
            }
        });
    }

    if (aiClearFeaturesBtn) {
        aiClearFeaturesBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (featuresContainer) {
                featuresContainer.innerHTML = '<p style="font-size:0.9rem; color:#999; margin:0;">No features yet. Generate some using the button below.</p>';
            }
            setStatus('');
        });
    }


    // --- Curated pages selection logic ---
    const allCuratedIds = [
        'product-curate-womens', 'product-curate-mens',
        'product-curate-livingroom', 'product-curate-bedroom', 'product-curate-office', 'product-curate-kitchen',
        'product-curate-kids-electronics', 'product-curate-kids-clothing', 'product-curate-kids-toys',
        'product-curate-trending', 'product-curate-new-arrivals', 'product-curate-combos'
    ];

    // Define groups of toggles that are mutually exclusive for non-main admins
    const exclusiveToggleGroups = [
        ['product-curate-womens', 'product-curate-mens'],
        ['product-curate-livingroom', 'product-curate-bedroom', 'product-curate-office', 'product-curate-kitchen'],
        ['product-curate-kids-electronics', 'product-curate-kids-clothing', 'product-curate-kids-toys']
    ];

    allCuratedIds.forEach(id => {
        const el = document.getElementById(id);
        if (!el) return;

        el.addEventListener('change', (e) => {
            if (isMainAdmin) {
                updateSaveButtonState();
                return;
            }

            if (e.target.checked) {
                const parentGroup = exclusiveToggleGroups.find(group => group.includes(id));
                if (parentGroup) {
                    parentGroup.forEach(otherId => {
                        if (otherId !== id) {
                            const otherEl = document.getElementById(otherId);
                            if (otherEl) otherEl.checked = false;
                        }
                    });
                }
            }
            updateSaveButtonState();
        });
    });

    // --- Enforce single selection for clothing filters in the admin product form ---
    const formFilterIds = ['product-filter-tops','product-filter-bottoms','product-filter-official','product-filter-traditional','product-filter-shoes','product-filter-accessories','product-filter-furniture','product-filter-appliances'];
    formFilterIds.forEach(id => {
        const el = document.getElementById(id);
        if (!el) return;
        el.addEventListener('change', (e) => {
            if (e.target.checked) {
                formFilterIds.forEach(otherId => {
                    if (otherId === id) return;
                    const other = document.getElementById(otherId);
                    if (other) other.checked = false;
                });
            }
        });
    });

    // --- Save button enable/disable logic: require 1 curated toggle and 1 clothing filter (kids admin only needs curated) ---
    const saveBtn = document.getElementById('product-save-btn');
    let formInteracted = false; // Track if user has interacted with form
    const updateSaveButtonState = () => {
        if (!saveBtn) return;
        const anyCurated = allCuratedIds.some(id => document.getElementById(id)?.checked);
        const anyFilter = formFilterIds.some(id => document.getElementById(id)?.checked);
        const validationMsg = document.getElementById('product-validation-msg');
        
        // Determine admin type (evaluate fresh each time in case it changed)
        const mainAdminCheck = isMainAdmin === true;
        const kidsAdminCheck = isKidsAdmin === true;
        
        // For main admin there are no curated/filter requirements; enable save.
        if (mainAdminCheck) {
            saveBtn.disabled = false;
            if (validationMsg) {
                validationMsg.textContent = '';
                validationMsg.style.display = 'none';
            }
        } else if (kidsAdminCheck) {
            // Kids admin: only needs curated selection, NO clothing filter validation
            saveBtn.disabled = !anyCurated;
            if (validationMsg) {
                if (!formInteracted) {
                    validationMsg.textContent = '';
                    validationMsg.style.display = 'none';
                } else if (!anyCurated) {
                    validationMsg.textContent = 'Please select a curated page before saving the product.';
                    validationMsg.style.display = 'block';
                } else {
                    validationMsg.textContent = '';
                    validationMsg.style.display = 'none';
                }
            }
        } else {
            // Other non-main admins: normally need both curated and filter, BUT allow combos without a clothing filter
            const combosChecked = document.getElementById('product-curate-combos')?.checked;
            if (combosChecked) {
                // If combos is selected, only require a curated page (combos) and no clothing filter
                saveBtn.disabled = !anyCurated;
                if (validationMsg) {
                    if (!formInteracted) {
                        validationMsg.textContent = '';
                        validationMsg.style.display = 'none';
                    } else if (!anyCurated) {
                        validationMsg.textContent = 'Please select a curated page before saving the product.';
                        validationMsg.style.display = 'block';
                    } else {
                        validationMsg.textContent = '';
                        validationMsg.style.display = 'none';
                    }
                }
            } else {
                // Default behavior: require both curated page and a clothing filter
                saveBtn.disabled = !(anyCurated && anyFilter);
                if (validationMsg) {
                    if (!formInteracted) {
                        validationMsg.textContent = '';
                        validationMsg.style.display = 'none';
                    } else if (!anyCurated && !anyFilter) {
                        validationMsg.textContent = 'Please select a curated page and a clothing filter before saving the product.';
                        validationMsg.style.display = 'block';
                    } else if (!anyCurated) {
                        validationMsg.textContent = 'Please select a curated page before saving the product.';
                        validationMsg.style.display = 'block';
                    } else if (!anyFilter) {
                        validationMsg.textContent = 'Please select a clothing filter before saving the product.';
                        validationMsg.style.display = 'block';
                    } else {
                        validationMsg.textContent = '';
                        validationMsg.style.display = 'none';
                    }
                }
            }
        }
    };

    // Attach listeners to curated toggles and filter checkboxes to update save button state
    allCuratedIds.forEach(id => { const el = document.getElementById(id); if (el) el.addEventListener('change', () => { formInteracted = true; updateSaveButtonState(); }); });
    formFilterIds.forEach(id => { const el = document.getElementById(id); if (el) el.addEventListener('change', () => { formInteracted = true; updateSaveButtonState(); }); });

    // Initialize save button state
    updateSaveButtonState();
    // Ensure reset and cancel actions also refresh save button state
    document.getElementById('clear-form-btn')?.addEventListener('click', updateSaveButtonState);
    document.getElementById('cancel-edit-btn')?.addEventListener('click', updateSaveButtonState);
    
    // --- Combo Builder & Expiry Logic ---
    const comboToggle = document.getElementById('product-curate-combos');
    const comboBuilderSection = document.getElementById('combo-builder-section');
    const comboExpirySection = document.getElementById('combo-expiry-section');
    const comboProductList = document.getElementById('combo-product-list');
    const comboProductSearch = document.getElementById('combo-product-search');
    const comboSelectedCount = document.getElementById('combo-selected-count');
    const comboSelectedPreview = document.getElementById('combo-selected-preview');
    const comboCanvas = document.getElementById('combo-image-canvas');
    const comboProductIdsHidden = document.getElementById('combo-product-ids-hidden');
    const comboEndDateInput = document.getElementById('product-comboEndDate');


    const populateComboProductList = (filter = '') => {
        if (!comboProductList) return;
        const lowerFilter = filter.toLowerCase();
        const productsHtml = allProducts
            .filter(p => p.title.toLowerCase().includes(lowerFilter))
            .map(p => `
                <div class="combo-switch-row" style="display:flex; align-items:center; justify-content:space-between; padding:5px; border-bottom:1px solid #eee;">
                    <label for="combo-prod-${p.productId}" class="combo-switch-label" style="display:flex; align-items:center; gap:8px; flex:1;">
                        <img src="${p.image}" width="40" height="40" style="object-fit: cover; border-radius: 4px;">
                        <span style="display:inline-block; max-width:420px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${p.title}</span>
                    </label>
                    <label class="switch" style="margin-left:12px;">
                        <input type="checkbox" id="combo-prod-${p.productId}" data-product-id="${p.productId}" class="combo-product-checkbox" ${selectedComboProducts.some(sp => sp.productId === p.productId) ? 'checked' : ''}>
                        <span class="slider round"></span>
                    </label>
                </div>
            `).join('');
        comboProductList.innerHTML = productsHtml || '<p>No products found.</p>';
    };

    const updateComboSelectionDisplay = () => {
        comboSelectedCount.textContent = selectedComboProducts.length;
        comboProductIdsHidden.value = JSON.stringify(selectedComboProducts.map(p => p.productId));
        comboSelectedPreview.innerHTML = selectedComboProducts.map((p, idx) => `
            <div style="position: relative; text-align: center; font-size: 0.8rem; color: #333; border: 2px solid #007bff; padding: 8px; border-radius: 6px; background: white;">
                <img src="${p.image}" width="60" height="60" style="object-fit: cover; border-radius: 4px; border: 1px solid #ccc;">
                <p style="margin: 4px 0; max-width: 60px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${p.title}</p>
                <div style="display: flex; gap: 4px; margin-top: 6px; justify-content: center;">
                    <button type="button" class="combo-remove-btn" data-product-id="${p.productId}" data-index="${idx}" style="padding: 4px 8px; background: #ff6b6b; color: white; border: none; border-radius: 3px; cursor: pointer; font-size: 0.75rem;">Remove</button>
                    <button type="button" class="combo-replace-btn" data-product-id="${p.productId}" data-index="${idx}" style="padding: 4px 8px; background: #4dabf7; color: white; border: none; border-radius: 3px; cursor: pointer; font-size: 0.75rem;">Replace</button>
                </div>
            </div>
        `).join('');

        // Update combo total price display
        const comboTotalValue = document.getElementById('combo-total-value');
        const total = selectedComboProducts.reduce((sum, p) => sum + (parseFloat(p.currentPrice) || 0), 0);
        if (comboTotalValue) comboTotalValue.textContent = total.toFixed(2);

        // If combo mode is active, show/hide relevant form fields
        const isComboActive = document.getElementById('product-curate-combos')?.checked;
        setComboUIState(!!isComboActive);
    };

    const drawComboLayout = (ctx, images, width, height) => {
        const count = images.length;
        const gap = 15;
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);
        if (count === 0) return;

        const drawImageInBox = (img, x, y, w, h) => {
            const hRatio = w / img.width;
            const vRatio = h / img.height;
            const ratio = Math.min(hRatio, vRatio);
            const scaledWidth = img.width * ratio;
            const scaledHeight = img.height * ratio;
            const centerX = x + (w - scaledWidth) / 2;
            const centerY = y + (h - scaledHeight) / 2;
            ctx.drawImage(img, centerX, centerY, scaledWidth, scaledHeight);
        };

        if (count === 1) {
            drawImageInBox(images[0], 0, 0, width, height);
        } else if (count === 2) {
            const itemWidth = (width - gap * 3) / 2;
            drawImageInBox(images[0], gap, (height - itemWidth) / 2, itemWidth, itemWidth);
            drawImageInBox(images[1], gap * 2 + itemWidth, (height - itemWidth) / 2, itemWidth, itemWidth);
        } else if (count === 3) {
            const itemWidth = (width - gap * 4) / 3;
            drawImageInBox(images[0], gap, (height - itemWidth) / 2, itemWidth, itemWidth);
            drawImageInBox(images[1], gap * 2 + itemWidth, (height - itemWidth) / 2, itemWidth, itemWidth);
            drawImageInBox(images[2], gap * 3 + itemWidth * 2, (height - itemWidth) / 2, itemWidth, itemWidth);
        } else if (count === 4) {
            const itemWidth = (width - gap * 3) / 2;
            const itemHeight = (height - gap * 3) / 2;
            drawImageInBox(images[0], gap, gap, itemWidth, itemHeight);
            drawImageInBox(images[1], gap * 2 + itemWidth, gap, itemWidth, itemHeight);
            drawImageInBox(images[2], gap, gap * 2 + itemHeight, itemWidth, itemHeight);
            drawImageInBox(images[3], gap * 2 + itemWidth, gap * 2 + itemHeight, itemWidth, itemHeight);
        } else if (count === 5) {
            const itemWidth = (width - gap * 4) / 3;
            const itemHeight = (height - gap * 3) / 2;
            // Top row (2 items, centered)
            const topRowTotalWidth = itemWidth * 2 + gap;
            const topRowStartX = (width - topRowTotalWidth) / 2;
            drawImageInBox(images[0], topRowStartX, gap, itemWidth, itemHeight);
            drawImageInBox(images[1], topRowStartX + itemWidth + gap, gap, itemWidth, itemHeight);
            // Bottom row (3 items)
            const bottomRowY = gap * 2 + itemHeight;
            drawImageInBox(images[2], gap, bottomRowY, itemWidth, itemHeight);
            drawImageInBox(images[3], gap * 2 + itemWidth, bottomRowY, itemWidth, itemHeight);
            drawImageInBox(images[4], gap * 3 + itemWidth * 2, bottomRowY, itemWidth, itemHeight);
        }
    };

    const generateAndDisplayComboImage = async () => {
        if (!comboCanvas) return;
        const ctx = comboCanvas.getContext('2d');
        ctx.clearRect(0, 0, comboCanvas.width, comboCanvas.height);
        
        if (selectedComboProducts.length === 0) return;

        const imagesToLoad = selectedComboProducts.map(p => {
            return new Promise((resolve) => {
                const img = new Image();
                img.crossOrigin = "anonymous";
                img.onload = () => resolve(img);
                img.onerror = () => {
                    // Create a placeholder image instead of rejecting
                    const placeholderImg = new Image();
                    placeholderImg.width = 100;
                    placeholderImg.height = 100;
                    // Resolve with placeholder to avoid breaking the combo
                    resolve(placeholderImg);
                };
                img.src = p.image;
            });
        });

        try {
            const loadedImages = await Promise.all(imagesToLoad);
            drawComboLayout(ctx, loadedImages, comboCanvas.width, comboCanvas.height);
        } catch (error) {
            console.error("Error generating combo image:", error);
            // Display a gentle message instead of error text
            ctx.fillStyle = '#ccc';
            ctx.font = '14px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('Preview will update when images load', comboCanvas.width / 2, comboCanvas.height / 2);
        }
    };

    const setComboUIState = (enabled) => {
        // Show/hide the combo builder section
        if (comboBuilderSection) comboBuilderSection.style.display = enabled ? 'block' : 'none';
        if (comboExpirySection) comboExpirySection.style.display = enabled ? 'block' : 'none';
        if (comboEndDateInput) comboEndDateInput.required = enabled;


        // Price and image inputs - hide when combo is enabled
        const priceGroup = document.getElementById('product-currentPrice')?.closest('.form-group');
        const oldPriceGroup = document.getElementById('product-oldPrice')?.closest('.form-group');
        const imageGroup = document.getElementById('product-image')?.closest('.form-group');
        const imagesUploadGroup = document.getElementById('product-images')?.closest('.form-group');
        const imagesPreviewEl = document.getElementById('product-images-preview');
        const comboSalePriceInput = document.getElementById('product-comboSalePrice')?.closest('.form-group');


        if (priceGroup) priceGroup.style.display = enabled ? 'none' : 'block';
        if (oldPriceGroup) oldPriceGroup.style.display = enabled ? 'none' : 'block';
        if (imageGroup) imageGroup.style.display = enabled ? 'none' : 'block';
        if (imagesUploadGroup) imagesUploadGroup.style.display = enabled ? 'none' : 'block';
        if (imagesPreviewEl) imagesPreviewEl.style.display = enabled ? 'none' : '';
        if (comboSalePriceInput) comboSalePriceInput.style.display = enabled ? 'block' : 'none';

        // Also toggle the 'required' attribute on inputs so browser constraint validation doesn't block when hidden
        const currentPriceInput = document.getElementById('product-currentPrice');
        const oldPriceInput = document.getElementById('product-oldPrice');
        const imageInput = document.getElementById('product-image');
        if (currentPriceInput) currentPriceInput.required = !enabled;
        if (oldPriceInput) oldPriceInput.required = !enabled;
        if (imageInput) imageInput.required = !enabled;
    };

    if (comboToggle) {
        comboToggle.addEventListener('change', (e) => {
            const enabled = e.target.checked;
            setComboUIState(enabled);
            if (enabled) {
                populateComboProductList();
            } else {
                selectedComboProducts = [];
                if (comboEndDateInput) comboEndDateInput.value = '';
                updateComboSelectionDisplay();
                generateAndDisplayComboImage();
            }
            // Re-evaluate save button state when combo toggle changes
            updateSaveButtonState();
        });
    }

    if (comboProductSearch) {
        comboProductSearch.addEventListener('input', (e) => populateComboProductList(e.target.value));
    }

    // Event delegation for Remove and Replace buttons
    if (comboSelectedPreview) {
        comboSelectedPreview.addEventListener('click', (e) => {
            const removeBtn = e.target.closest('.combo-remove-btn');
            const replaceBtn = e.target.closest('.combo-replace-btn');

            if (removeBtn) {
                e.preventDefault();
                const productId = removeBtn.dataset.productId;
                selectedComboProducts = selectedComboProducts.filter(p => p.productId !== productId);
                // Uncheck the checkbox in the product list
                const checkbox = document.getElementById(`combo-prod-${productId}`);
                if (checkbox) checkbox.checked = false;
                updateComboSelectionDisplay();
                generateAndDisplayComboImage();
            }

            if (replaceBtn) {
                e.preventDefault();
                const productId = replaceBtn.dataset.productId;
                const index = parseInt(replaceBtn.dataset.index, 10);
                
                // Show a simple selection dialog or focus the search
                comboProductSearch.focus();
                comboProductSearch.value = '';
                populateComboProductList('');
                
                // Mark this as a replacement operation
                window.comboReplaceIndex = index;
                window.comboReplaceProductId = productId;
                alert('Select a new product from the list below to replace this item.');
            }
        });
    }

    if (comboProductList) {
        comboProductList.addEventListener('change', (e) => {
            if (e.target.classList.contains('combo-product-checkbox')) {
                const productId = e.target.dataset.productId;
                const product = allProducts.find(p => p.productId === productId);

                // Handle replacement mode
                if (window.comboReplaceIndex !== undefined && e.target.checked) {
                    // Remove the old product
                    selectedComboProducts.splice(window.comboReplaceIndex, 1);
                    // Add the new product
                    selectedComboProducts.push(product);
                    // Clear replacement mode
                    window.comboReplaceIndex = undefined;
                    window.comboReplaceProductId = undefined;
                    updateComboSelectionDisplay();
                    generateAndDisplayComboImage();
                    return;
                }

                if (e.target.checked) {
                    if (selectedComboProducts.length < 5 && !selectedComboProducts.some(p => p.productId === productId)) {
                        selectedComboProducts.push(product);
                    } else {
                        e.target.checked = false;
                        if (selectedComboProducts.length >= 5) alert('You can select a maximum of 5 products for a combo.');
                    }
                } else {
                    selectedComboProducts = selectedComboProducts.filter(p => p.productId !== productId);
                }
                updateComboSelectionDisplay();
                generateAndDisplayComboImage();
            }
        });
    }

    // --- Gift Card Logic (Main Admin Only) ---
    const giftCardToggle = document.getElementById('product-giftCardEnabled');
    const giftCardConfigSection = document.getElementById('gift-card-config-section');
    const giftCardTypeSelect = document.getElementById('product-giftCardType');
    const giftCardValueLabel = document.getElementById('gift-card-value-label');
    
    if (isMainAdmin && giftCardToggle && giftCardConfigSection && giftCardTypeSelect && giftCardValueLabel) {
        giftCardToggle.addEventListener('change', (e) => {
            giftCardConfigSection.style.display = e.target.checked ? 'block' : 'none';
        });

        giftCardTypeSelect.addEventListener('change', (e) => {
            giftCardValueLabel.textContent = e.target.value === 'percent' ? 'Value (%)' : 'Value (N$)';
        });
    }

    // --- Edit and Delete Logic ---
    if (productList) {
        productList.addEventListener('click', async (e) => {
            const editBtn = e.target.closest('.edit-btn');
            const deleteBtn = e.target.closest('.delete-btn');

            if (editBtn) {
                const mongoId = editBtn.dataset.mongoId;
                const productId = editBtn.dataset.productId;
                console.log('Edit button clicked', { mongoId, productId });
                // Prefer finding by MongoDB id (more reliable), fallback to productId
                let productToEdit = allProducts.find(p => String(p._id) === String(mongoId));
                if (!productToEdit && productId) productToEdit = allProducts.find(p => String(p.productId) === String(productId));
                console.log('Found productToEdit:', !!productToEdit, productToEdit);
                if (productToEdit) {
                    // Reset form first to clear previous state
                    try { resetForm(); } catch (err) { console.warn('resetForm not available', err); }
                    document.getElementById('product-id-hidden').value = mongoId || productToEdit._id;
                    // Ensure admin products tab is visible
                    const productsTabBtn = document.querySelector('.admin-tab-btn[data-tab="products"]');
                    if (productsTabBtn) productsTabBtn.click();
                    document.getElementById('product-id').value = productToEdit.productId;
                    document.getElementById('product-title').value = productToEdit.title;
                    document.getElementById('product-currentPrice').value = productToEdit.currentPrice;
                    document.getElementById('product-oldPrice').value = productToEdit.oldPrice;
                    document.getElementById('product-category').value = productToEdit.category;
                    document.getElementById('product-image').value = productToEdit.image;
                    // populate thumbnails hidden field and preview
                    const thumbs = productToEdit.thumbnails || [];
                    document.getElementById('product-thumbnails-hidden').value = JSON.stringify(thumbs);
                    const preview = document.getElementById('product-images-preview');
                    if (preview) {
                        preview.innerHTML = '';
                        thumbs.slice(0,3).forEach(src => {
                            const img = document.createElement('img');
                            img.src = src;
                            img.style.width = '64px'; img.style.height = '64px'; img.style.objectFit = 'cover'; img.style.borderRadius = '6px';
                            preview.appendChild(img);
                        });
                    }
                    const condEl = document.getElementById('product-condition');
                    if (condEl) condEl.value = productToEdit.condition || 'new';
                    // Gender field removed from form; no population needed
                    const stockToggle = document.getElementById('product-stockToggle');
                    const stockFieldGroup = document.getElementById('stock-field-group');
                    if (productToEdit.stock !== undefined && productToEdit.stock !== null) {
                        stockToggle.checked = true;
                        stockFieldGroup.style.display = 'flex';
                        document.getElementById('product-stock').value = productToEdit.stock;
                    } else {
                        stockToggle.checked = false;
                        stockFieldGroup.style.display = 'none';
                    }
                    document.getElementById('product-onSale').checked = productToEdit.onSale || false;
                    // Show/hide sale dates section and populate if on sale
                    const saleDatesSection = document.getElementById('sale-dates-section');
                    if (productToEdit.onSale) {
                        saleDatesSection.style.display = 'block';
                        if (productToEdit.saleStartDate) {
                            document.getElementById('product-saleStartDate').value = new Date(productToEdit.saleStartDate).toISOString().slice(0, 16);
                        }
                        if (productToEdit.saleEndDate) {
                            document.getElementById('product-saleEndDate').value = new Date(productToEdit.saleEndDate).toISOString().slice(0, 16);
                        }
                    } else {
                        saleDatesSection.style.display = 'none';
                    }
                    // Set curated page toggles
                    const curatedPages = productToEdit.curatedPages || [];
                    // Trending/New Arrivals toggles removed from form
                                    // Set men's/women's curated toggles
                                    const womensToggle = document.getElementById('product-curate-womens');
                                    const mensToggle = document.getElementById('product-curate-mens');
                                    if (womensToggle) womensToggle.checked = curatedPages.includes('womens-clothes');
                                    if (mensToggle) mensToggle.checked = curatedPages.includes('mens-clothes');
                                    const livingToggle = document.getElementById('product-curate-livingroom');
                                    const bedroomToggle = document.getElementById('product-curate-bedroom');
                                    const officeToggle = document.getElementById('product-curate-office');
                                    const kitchenToggle = document.getElementById('product-curate-kitchen');
                                    if (livingToggle) livingToggle.checked = curatedPages.includes('living-room');
                                    if (bedroomToggle) bedroomToggle.checked = curatedPages.includes('bedroom');
                                    if (officeToggle) officeToggle.checked = curatedPages.includes('office');
                                    if (kitchenToggle) kitchenToggle.checked = curatedPages.includes('kitchen');
                                    const kidsElectronicsToggle = document.getElementById('product-curate-kids-electronics');
                                    const kidsClothingToggle = document.getElementById('product-curate-kids-clothing');
                                    const kidsToysToggle = document.getElementById('product-curate-kids-toys');
                                    if (kidsElectronicsToggle) kidsElectronicsToggle.checked = curatedPages.includes('kids-electronics');
                                    if (kidsClothingToggle) kidsClothingToggle.checked = curatedPages.includes('kids-clothing');
                                    if (kidsToysToggle) kidsToysToggle.checked = curatedPages.includes('kids-toys');
                                    const trendingToggle = document.getElementById('product-curate-trending');
                                    const newArrivalsToggle = document.getElementById('product-curate-new-arrivals');
                                    const combosToggle = document.getElementById('product-curate-combos');
                                    if (trendingToggle) trendingToggle.checked = curatedPages.includes('trending');
                                    if (newArrivalsToggle) newArrivalsToggle.checked = curatedPages.includes('new-arrivals');
                                    if (combosToggle) {
                                        combosToggle.checked = curatedPages.includes('combos');
                                        combosToggle.dispatchEvent(new Event('change'));

                                        if (curatedPages.includes('combos')) {
                                            document.getElementById('product-comboSalePrice').value = productToEdit.currentPrice;
                                        }

                                        if (productToEdit.comboEndDate) {
                                           document.getElementById('product-comboEndDate').value = new Date(productToEdit.comboEndDate).toISOString().slice(0, 16);
                                        }
                                        // If this product already has comboProductIds, populate selection and update UI
                                        if (productToEdit.comboProductIds && Array.isArray(productToEdit.comboProductIds) && productToEdit.comboProductIds.length > 0) {
                                            selectedComboProducts = productToEdit.comboProductIds.map(pid => allProducts.find(p => p.productId === pid)).filter(Boolean);
                                            updateComboSelectionDisplay();
                                            generateAndDisplayComboImage();
                                        }
                                    }
                    
                    // Populate clothing filters
                    const filters = productToEdit.clothingFilters || [];
                                    const mapSet = (id, key) => { const el = document.getElementById(id); if (el) el.checked = filters.includes(key); };
                    mapSet('product-filter-tops','tops');
                    mapSet('product-filter-bottoms','bottoms');
                    mapSet('product-filter-official','official');
                    mapSet('product-filter-traditional','traditional');
                    mapSet('product-filter-shoes','shoes');
                                    mapSet('product-filter-accessories','accessories');
                                    mapSet('product-filter-furniture','furniture');
                                    mapSet('product-filter-appliances','appliances');
                    
                    // Populate colors
                    const colors = productToEdit.colors || [];
                    for (let i = 0; i < 3; i++) {
                        const colorInput = document.getElementById(`product-color-${i + 1}`);
                        if (colorInput) {
                            colorInput.value = colors[i] || '';
                        }
                    }
                    // Populate color toggle
                    const enableColorsToggle = document.getElementById('enable-product-colors');
                    const colorsSection = document.getElementById('product-colors-section');
                    const colorsEnabledValue = productToEdit.colorsEnabled !== undefined ? productToEdit.colorsEnabled : true;
                    if (enableColorsToggle) {
                        enableColorsToggle.checked = colorsEnabledValue;
                    }
                    if (colorsSection) {
                        colorsSection.style.display = colorsEnabledValue ? 'block' : 'none';
                    }
                    // Update color preview
                    try { 
                        const updateColorPreviewFn = document.querySelector('#product-form') ? (() => {
                            const colorsPreview = document.getElementById('product-colors-preview');
                            if (!colorsPreview) return;
                            colorsPreview.innerHTML = '';
                            ['product-color-1', 'product-color-2', 'product-color-3'].forEach(id => {
                                const input = document.getElementById(id);
                                if (input && input.value.trim()) {
                                    const colorValue = input.value.trim();
                                    const circle = document.createElement('div');
                                    circle.style.width = '50px';
                                    circle.style.height = '50px';
                                    circle.style.borderRadius = '50%';
                                    circle.style.border = '2px solid #d2d2d7';
                                    circle.style.cursor = 'pointer';
                                    circle.title = colorValue;
                                    try {
                                        circle.style.backgroundColor = colorValue;
                                    } catch (e) {
                                        circle.style.backgroundColor = '#cccccc';
                                    }
                                    colorsPreview.appendChild(circle);
                                }
                            });
                        }) : null;
                        if (updateColorPreviewFn) updateColorPreviewFn();
                    } catch (err) {}

                    // Populate AI features
                    const features = productToEdit.features || [];
                    const featuresContainer = document.getElementById('product-features-container');
                    if (featuresContainer && features.length > 0) {
                        featuresContainer.innerHTML = '';
                        features.forEach((feature, index) => {
                            const featureDiv = document.createElement('div');
                            featureDiv.style.cssText = 'display:flex; gap:8px; margin-bottom:8px; align-items:center;';
                            
                            const input = document.createElement('input');
                            input.type = 'text';
                            input.value = feature;
                            input.className = 'ai-feature-input';
                            input.style.cssText = 'flex:1; padding:8px; border:1px solid #ddd; border-radius:4px; font-size:0.9rem;';
                            
                            const removeBtn = document.createElement('button');
                            removeBtn.type = 'button';
                            removeBtn.textContent = '✕';
                            removeBtn.style.cssText = 'padding:6px 12px; background-color:#ff4444; color:white; border:none; border-radius:4px; cursor:pointer; font-weight:bold;';
                            removeBtn.onclick = (e) => {
                                e.preventDefault();
                                featureDiv.remove();
                            };
                            
                            featureDiv.appendChild(input);
                            featureDiv.appendChild(removeBtn);
                            featuresContainer.appendChild(featureDiv);
                        });
                    }
                    // Populate Gift Card fields if main admin
                    if (isMainAdmin) {
                        const giftCardEnabledToggle = document.getElementById('product-giftCardEnabled');
                        const giftCardConfig = document.getElementById('gift-card-config-section');
                        const giftCardType = document.getElementById('product-giftCardType');
                        const giftCardValue = document.getElementById('product-giftCardValue');

                        giftCardEnabledToggle.checked = productToEdit.giftCardEnabled || false;
                        giftCardConfig.style.display = giftCardEnabledToggle.checked ? 'block' : 'none';
                        if (productToEdit.giftCardEnabled) {
                            giftCardType.value = productToEdit.giftCardType || 'percent';
                            giftCardValue.value = productToEdit.giftCardValue || 5;
                            giftCardType.dispatchEvent(new Event('change'));
                        }
                    }

                    
                    // Update save button state after populating
                    try { updateSaveButtonState(); } catch (err) {}
                    // Show Cancel button and update form heading
                    document.getElementById('cancel-edit-btn').style.display = 'inline-block';
                    document.querySelector('form h3').textContent = 'Edit Product';
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }
            }

            if (deleteBtn) {
                const mongoId = deleteBtn.dataset.id;
                if (confirm('Are you sure you want to delete this product?')) {
                    try {
                        await api.deleteProduct(mongoId);
                        alert('Product deleted');
                        location.reload(); // Reload to show updated list
                    } catch (err) {
                        alert(`Delete failed: ${err.message}`);
                    }
                }
            }
        });
    }

    // --- Form Submission (Create/Update) ---
        productForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            formInteracted = true; // Mark as interacted to show validation messages
            // Validate curated and filter selections before allowing submit
        const anyCurated = allCuratedIds.some(id => document.getElementById(id)?.checked);
        const anyFilter = formFilterIds.some(id => document.getElementById(id)?.checked);
        // For main admin: no validation required
        // For kids admin: only need curated page (no clothing filters)
        // For other non-main admins: require both curated page and clothing filter
        
        console.log('Form submitted. isMainAdmin:', isMainAdmin, 'isKidsAdmin:', isKidsAdmin, 'anyCurated:', anyCurated, 'anyFilter:', anyFilter);
        
        if (!isMainAdmin && !isKidsAdmin) {
            // Other non-main admins: require both curated page and clothing filter
            const combosChecked = document.getElementById('product-curate-combos')?.checked;
            if (combosChecked) {
                // When combos is selected, only require a curated page (combos) and allow saving without a clothing filter
                if (!anyCurated) {
                    const validationMsg = document.getElementById('product-validation-msg');
                    if (validationMsg) {
                        validationMsg.textContent = 'Please select a curated page before saving the product.';
                        validationMsg.style.display = 'block';
                        validationMsg.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                    console.log('Non-main admin validation failed - combos selected but no curated page');
                    return;
                }
            } else {
                // Default behavior: require both curated page and clothing filter
                if (!anyCurated || !anyFilter) {
                    const validationMsg = document.getElementById('product-validation-msg');
                    if (validationMsg) {
                        if (!anyCurated && !anyFilter) validationMsg.textContent = 'Please select a curated page and a clothing filter before saving the product.';
                        else if (!anyCurated) validationMsg.textContent = 'Please select a curated page before saving the product.';
                        else validationMsg.textContent = 'Please select a clothing filter before saving the product.';
                        validationMsg.style.display = 'block';
                        validationMsg.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                    console.log('Non-main/non-kids admin validation failed');
                    return;
                }
            }
        } else if (isKidsAdmin) {
            // Kids admin: only require curated page
            if (!anyCurated) {
                const validationMsg = document.getElementById('product-validation-msg');
                if (validationMsg) {
                    validationMsg.textContent = 'Please select a curated page before saving the product.';
                    validationMsg.style.display = 'block';
                    validationMsg.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
                console.log('Kids admin validation failed - no curated page selected');
                return;
            }
        }

        // Validate combo expiry date if combo is selected
        const isCombo = document.getElementById('product-curate-combos')?.checked;
        const comboEndDateValue = document.getElementById('product-comboEndDate')?.value;
        if (isCombo && !comboEndDateValue) {
            alert('Please set a sale end date for the Super Combo.');
            document.getElementById('product-comboEndDate')?.focus();
            return;
        }

        // Main admin or kids admin with curated page selected: proceed with save
        console.log('Validation passed, proceeding with save');
        const stockToggle = document.getElementById('product-stockToggle');
        
        // Validate required fields (image may be provided via file upload)
        const productId = document.getElementById('product-id').value.trim();
        const title = document.getElementById('product-title').value.trim();
        let currentPrice;
        let oldPrice;
        const category = document.getElementById('product-category').value.trim();
        let image = document.getElementById('product-image').value.trim();

        // If combo, compute total price from selected products and use as current/old price
        if (isCombo) {
            if (selectedComboProducts.length === 0) {
                alert('Please select at least one product for the combo.');
                return;
            }
            const total = selectedComboProducts.reduce((sum, p) => sum + (parseFloat(p.currentPrice) || 0), 0);
            oldPrice = total;
            currentPrice = document.getElementById('product-comboSalePrice').value;

            if (!currentPrice) {
                alert('Please set a Sale Price for the Super Combo.');
                return;
            }
        } else {
            currentPrice = document.getElementById('product-currentPrice').value;
            oldPrice = document.getElementById('product-oldPrice').value;
        }

        if (!productId || !title || (!isCombo && (!currentPrice || !oldPrice)) || !category) {
            alert('Please fill in all required fields');
            return;
        }
        
        const productData = {
            productId: productId,
            title: title,
            currentPrice: parseFloat(currentPrice),
            oldPrice: parseFloat(oldPrice),
            category: category,
            image: image,
            description: '',
            features: (() => {
                // Collect features from AI features container
                const container = document.getElementById('product-features-container');
                if (!container) return [];
                const inputs = container.querySelectorAll('input[type="text"]');
                return Array.from(inputs).map(input => input.value.trim()).filter(f => f.length > 0);
            })(),
            // genderCategory removed from admin form; backend will use curatedPages instead
            condition: (document.getElementById('product-condition') ? document.getElementById('product-condition').value : undefined),
            stock: stockToggle.checked ? parseInt(document.getElementById('product-stock').value) : undefined,
            onSale: document.getElementById('product-onSale').checked,
            saleStartDate: document.getElementById('product-onSale').checked && document.getElementById('product-saleStartDate').value ? new Date(document.getElementById('product-saleStartDate').value) : undefined,
            saleEndDate: document.getElementById('product-onSale').checked && document.getElementById('product-saleEndDate').value ? new Date(document.getElementById('product-saleEndDate').value) : undefined,
            curatedPages: (() => {
                const map = {
                    'product-curate-womens': 'womens-clothes',
                    'product-curate-mens': 'mens-clothes',
                    'product-curate-livingroom': 'living-room',
                    'product-curate-bedroom': 'bedroom',
                    'product-curate-office': 'office',
                    'product-curate-kitchen': 'kitchen',
                    'product-curate-kids-electronics': 'kids-electronics',
                    'product-curate-kids-clothing': 'kids-clothing',
                    'product-curate-kids-toys': 'kids-toys',
                    'product-curate-trending': 'trending',
                    'product-curate-new-arrivals': 'new-arrivals',
                    'product-curate-combos': 'combos'
                };
                return Object.keys(map).filter(id => document.getElementById(id)?.checked).map(id => map[id]);
            })(),
            clothingFilters: Array.from([
                document.getElementById('product-filter-tops')?.checked ? 'tops' : null,
                document.getElementById('product-filter-bottoms')?.checked ? 'bottoms' : null,
                document.getElementById('product-filter-official')?.checked ? 'official' : null,
                document.getElementById('product-filter-traditional')?.checked ? 'traditional' : null,
                document.getElementById('product-filter-shoes')?.checked ? 'shoes' : null,
                document.getElementById('product-filter-accessories')?.checked ? 'accessories' : null,
                document.getElementById('product-filter-furniture')?.checked ? 'furniture' : null,
                document.getElementById('product-filter-appliances')?.checked ? 'appliances' : null,
            ].filter(p => p !== null)),
            colors: Array.from([
                document.getElementById('product-color-1')?.value.trim() || null,
                document.getElementById('product-color-2')?.value.trim() || null,
                document.getElementById('product-color-3')?.value.trim() || null,
            ].filter(c => c !== null)),
            colorsEnabled: document.getElementById('enable-product-colors')?.checked ?? true,
            comboEndDate: isCombo && comboEndDateValue ? new Date(comboEndDateValue) : undefined,
        };
        
        // Add Gift Card data if main admin
        if(isMainAdmin) {
            const giftCardEnabled = document.getElementById('product-giftCardEnabled')?.checked;
            productData.giftCardEnabled = giftCardEnabled;
            if(giftCardEnabled) {
                productData.giftCardType = document.getElementById('product-giftCardType')?.value || 'percent';
                productData.giftCardValue = parseFloat(document.getElementById('product-giftCardValue')?.value) || 0;
            }
        }


        const hiddenId = document.getElementById('product-id-hidden').value;
        try {
            let filesToUpload = [];

            if (isCombo) {
                if (selectedComboProducts.length === 0) {
                    alert('Please select at least one product for the combo.');
                    return;
                }
                const canvas = document.getElementById('combo-image-canvas');
                const dataURL = canvas.toDataURL('image/jpeg', 0.9);
                const blob = await fetch(dataURL).then(res => res.blob());
                const comboImageFile = new File([blob], `combo-${Date.now()}.jpg`, { type: 'image/jpeg' });
                filesToUpload.push(comboImageFile);
                
                productData.comboProductIds = selectedComboProducts.map(p => p.productId);

            } else {
                 const imageSourcesToUpload = processedImages.length > 0 ? processedImages : [];
                 if (imageSourcesToUpload.length > 0) {
                     for (const dataUrl of imageSourcesToUpload) {
                         const blob = await fetch(dataUrl).then(res => res.blob());
                         const file = new File([blob], `cropped-${Date.now()}.png`, { type: 'image/png' });
                         filesToUpload.push(file);
                     }
                 } else {
                    const imageFilesInput = document.getElementById('product-images');
                    if (imageFilesInput && imageFilesInput.files) {
                        filesToUpload = Array.from(imageFilesInput.files).slice(0, 3);
                    }
                 }
            }

            let uploadedPaths = [];
            if (filesToUpload.length > 0) {
                for (const file of filesToUpload) {
                    const fd = new FormData();
                    fd.append('image', file);
                    const resp = await fetch('/api/upload/product', { method: 'POST', body: fd });
                    if (!resp.ok) {
                        const err = await resp.text();
                        throw new Error('Image upload failed: ' + err);
                    }
                    const json = await resp.json();
                    if (json && json.image) uploadedPaths.push(json.image);
                }
            }
            
            if (uploadedPaths.length > 0) {
                // Uploaded images available (includes generated combo image when creating a combo)
                productData.image = uploadedPaths[0];
                if (isCombo) {
                    // For combos: include generated composite as primary image and add the selected products' images as thumbnails
                    const selectedImages = selectedComboProducts.map(p => p.image).filter(Boolean);
                    productData.thumbnails = [uploadedPaths[0], ...selectedImages];
                } else {
                    productData.thumbnails = uploadedPaths;
                }
            } else if (isCombo) {
                // No uploaded composite image (maybe image URLs were used for selected products)
                const selectedImages = selectedComboProducts.map(p => p.image).filter(Boolean);
                if (selectedImages.length > 0) {
                    // Use first selected product image as primary and include all selected images as thumbnails
                    productData.image = selectedImages[0];
                    productData.thumbnails = selectedImages;
                }
            } else if (!isCombo) {
                const existing = document.getElementById('product-thumbnails-hidden').value;
                if (existing) {
                    try { productData.thumbnails = JSON.parse(existing); if (!productData.image && productData.thumbnails && productData.thumbnails.length > 0) productData.image = productData.thumbnails[0]; } catch (e) {}
                }
            }

            if (!isCombo && !productData.image) {
                alert('Please provide a product image URL or upload at least one image.');
                return;
            }
            
            if (hiddenId) {
                // Update existing product
                console.log('Updating product with MongoDB ID:', hiddenId, 'Data:', productData);
                await api.updateProduct(hiddenId, productData);
                alert('Product updated successfully!');
            } else {
                // Create new product
                console.log('Creating new product with data:', productData);
                await api.createProduct(productData);
                alert('Product created successfully!');
            }
            resetForm();
            location.reload();
        } catch (err) {
            console.error('Error saving product:', err);
            alert(`Error saving product: ${err.message}`);
        }
    });

    // --- Viewer Management for Main Admin ---
    if (isMainAdmin) {
        document.getElementById('add-viewers-form')?.addEventListener('submit', async e => {
            e.preventDefault();
            const productId = document.getElementById('viewers-product').value;
            try {
                await api.addViewer(productId);
                alert('Viewer added!');
                location.reload();
            } catch(err) {
                alert('Failed to add viewer: ' + err.message);
            }
        });

        document.getElementById('viewer-list-admin')?.addEventListener('click', async e => {
            const deleteBtn = e.target.closest('.delete-btn');
            if(deleteBtn) {
                const { productId, viewerId } = deleteBtn.dataset;
                if (confirm('Delete this viewer entry?')) {
                    try {
                        await api.deleteViewerById(productId, viewerId);
                        alert('Viewer deleted.');
                        location.reload();
                    } catch (err) {
                        alert('Failed to delete viewer: ' + err.message);
                    }
                }
            }
        });

        // Delete user handler
        document.getElementById('user-list-admin')?.addEventListener('click', async e => {
            const deleteUserBtn = e.target.closest('.delete-user-btn');
            if(deleteUserBtn) {
                const userId = deleteUserBtn.dataset.userId;
                if (confirm('Are you sure you want to delete this user account? This action cannot be undone.')) {
                    try {
                        await api.deleteUser(userId);
                        alert('User account deleted successfully.');
                        location.reload();
                    } catch (err) {
                        alert('Failed to delete user: ' + err.message);
                    }
                }
            }
        });

        // Seller account switching handler
        document.getElementById('seller-list-admin')?.addEventListener('click', async e => {
            const viewBtn = e.target.closest('.view-seller-btn');
            const sellerItem = e.target.closest('.seller-account-item');

            let sellerEmail = null;
            if (viewBtn) sellerEmail = viewBtn.dataset.sellerEmail;
            else if (sellerItem) sellerEmail = sellerItem.dataset.sellerEmail;

            if (!sellerEmail) return;

            const sellerUser = allUsers.find(u => u.email === sellerEmail);
            if (!sellerUser) return;

            // 1. Save current main admin's info to sessionStorage so we can return later
            let mainAdminInfo = localStorage.getItem('userInfo');
            if (mainAdminInfo) {
                sessionStorage.setItem('mainAdminInfo', mainAdminInfo);
            } else {
                // If the admin is logged in via session cookies (no localStorage userInfo),
                // mark the session so we can restore the admin from the server later.
                sessionStorage.setItem('mainAdminInfo', 'SESSION');
            }

            // 2. Set localStorage to the selected seller's info so UI renders as that seller
            localStorage.setItem('userInfo', JSON.stringify(sellerUser));

            // 3. Navigate explicitly to the admin dashboard and reload to apply the new admin context
            location.hash = '#admin';
            location.reload();
        });
        
        // --- FAQ Management ---
        const faqForm = document.getElementById('faq-form');
        const faqList = document.getElementById('faq-list-admin');

        const resetFaqForm = () => {
            faqForm.reset();
            document.getElementById('faq-id-hidden').value = '';
        };

        if (faqForm) {
            faqForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const id = document.getElementById('faq-id-hidden').value;
                const question = document.getElementById('faq-question').value;
                const answer = document.getElementById('faq-answer').value;

                try {
                    if (id) {
                        await api.updateFAQ(id, { question, answer });
                        alert('FAQ updated successfully!');
                    } else {
                        await api.createFAQ({ question, answer });
                        alert('FAQ created successfully!');
                    }
                    resetFaqForm();
                    location.reload();
                } catch (err) {
                    alert('Failed to save FAQ: ' + err.message);
                }
            });
            document.getElementById('clear-faq-form-btn').addEventListener('click', resetFaqForm);
        }

        if (faqList) {
            faqList.addEventListener('click', async (e) => {
                const editBtn = e.target.closest('.edit-faq-btn');
                const deleteBtn = e.target.closest('.delete-faq-btn');

                if (editBtn) {
                    const faqId = editBtn.dataset.faqId;
                    const faq = allFAQs.find(f => f._id === faqId);
                    if (faq) {
                        document.getElementById('faq-id-hidden').value = faq._id;
                        document.getElementById('faq-question').value = faq.question;
                        document.getElementById('faq-answer').value = faq.answer;
                        faqForm.scrollIntoView({ behavior: 'smooth' });
                    }
                }

                if (deleteBtn) {
                    const faqId = deleteBtn.dataset.faqId;
                    if (confirm('Are you sure you want to delete this FAQ?')) {
                        try {
                            await api.deleteFAQ(faqId);
                            alert('FAQ deleted.');
                            location.reload();
                        } catch (err) {
                            alert('Failed to delete FAQ: ' + err.message);
                        }
                    }
                }
            });
        }
        // --- End FAQ Management ---

        // Transaction details viewer and verify switch
        document.getElementById('transaction-list-admin')?.addEventListener('change', async (e) => {
            if (e.target.classList.contains('verify-switch')) {
                const row = e.target.closest('.transaction-row');
                const transactionId = row.dataset.transactionId;
                const isVerified = e.target.checked;
                try {
                    await api.updateTransaction(transactionId, { verified: isVerified });
                    row.classList.toggle('verified', isVerified);
                } catch (err) {
                    alert('Failed to update transaction status: ' + err.message);
                    e.target.checked = !isVerified; // Revert checkbox on failure
                }
            }
        });

        // Transaction details viewer
        document.getElementById('transaction-list-admin')?.addEventListener('click', async e => {
            const viewBtn = e.target.closest('.view-transaction-btn');
            if (viewBtn) {
                const index = parseInt(viewBtn.dataset.index);
                const transaction = relevantTransactions[index];
                if (transaction) {
                    showTransactionDetailsPopupNew(transaction);
                }
            }
        });


        // Site settings save handler
        const siteSettingsForm = document.getElementById('site-settings-form');
        if (siteSettingsForm) {
            siteSettingsForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const updates = {};
                try {
                    // Handle homepage heroes
                    for (let i=1;i<=4;i++) {
                        const fileInput = document.getElementById(`home-hero-file-${i}`);
                        const urlInput = document.getElementById(`home-hero-url-${i}`);
                        if (fileInput && fileInput.files && fileInput.files[0]) {
                            const uploaded = await api.uploadHero(fileInput.files[0]);
                            if (uploaded && uploaded.image) updates[`home_hero_${i}`] = uploaded.image;
                        } else if (urlInput && urlInput.value) {
                            updates[`home_hero_${i}`] = urlInput.value.trim();
                        }
                    }

                    // Handle category hero images
                    const categoryKeys = Object.keys(categoryData).filter(k => categoryData[k] && categoryData[k].heroImage);
                    for (const k of categoryKeys) {
                        const fileEl = document.getElementById(`cat-hero-file-${k}`);
                        const urlEl = document.getElementById(`cat-hero-url-${k}`);
                        if (fileEl && fileEl.files && fileEl.files[0]) {
                            const uploaded = await api.uploadHero(fileEl.files[0]);
                            if (uploaded && uploaded.image) updates[`heroImage_${k}`] = uploaded.image;
                        } else if (urlEl && urlEl.value) {
                            updates[`heroImage_${k}`] = urlEl.value.trim();
                        }
                    }

                    // Persist updates to server
                    const promises = Object.entries(updates).map(([key, value]) => api.updateSetting(key, value));
                    await Promise.all(promises);

                    // Refresh settings locally and update categoryData
                    const settingsArr = await api.fetchSettings();
                    const settingsMap = {};
                    if (Array.isArray(settingsArr)) settingsArr.forEach(s => settingsMap[s.key] = s.value);
                    updateCategoryData(settingsMap);

                    alert('Site settings saved successfully.');
                } catch (err) {
                    console.error('Failed to save site settings', err);
                    alert('Failed to save settings: ' + (err.message || err));
                }
            });
        }
    } else {
        // Attach event listener for seller's transaction view button
        document.getElementById('transaction-list-admin')?.addEventListener('click', async e => {
            const viewBtn = e.target.closest('.view-transaction-btn');
            if (viewBtn) {
                const index = parseInt(viewBtn.dataset.index);
                const transaction = relevantTransactions[index];
                if (transaction) {
                    showTransactionDetailsPopupNew(transaction);
                }
            }
        });
    }

    // Add listener for the "Back to Main Admin" button if it exists
    const backToAdminBtn = document.getElementById('back-to-main-admin');
    if (backToAdminBtn) {
        backToAdminBtn.addEventListener('click', async () => {
            const mainAdminInfo = sessionStorage.getItem('mainAdminInfo');
            if (!mainAdminInfo) return;

            if (mainAdminInfo === 'SESSION') {
                // Admin logged-in via server session; restore their info from the server
                try {
                    const res = await fetch('/auth/me', { credentials: 'same-origin' });
                    if (!res.ok) throw new Error('Not authenticated');
                    const user = await res.json();
                    const userInfo = user.user || user;
                    localStorage.setItem('userInfo', JSON.stringify({ ...userInfo, token: userInfo.token || null }));
                    sessionStorage.removeItem('mainAdminInfo');
                    location.reload();
                } catch (err) {
                    alert('Failed to restore admin session. Please login again.');
                    sessionStorage.removeItem('mainAdminInfo');
                    location.hash = '#admin-login';
                }
                return;
            }

            // Default behavior: main admin was stored in sessionStorage as JSON
            localStorage.setItem('userInfo', mainAdminInfo);
            sessionStorage.removeItem('mainAdminInfo');
            location.reload();
        });
    }
};


const showTransactionDetailsPopupNew = (transaction) => {
    const itemsHTML = (transaction.items || []).map(item => {
        const colorDisplay = item.selectedColor ? `<span style="display: inline-block; margin-left: 8px; color: #666;">| Color: <span style="display: inline-block; width: 12px; height: 12px; border-radius: 50%; border: 1px solid #999; background-color: ${item.selectedColor.toLowerCase()}; vertical-align: middle; margin: 0 4px;"></span>${item.selectedColor}</span>` : '';
        return `<li>${item.title} (x${item.quantity}) - ${formatCurrency(item.price * item.quantity)}${colorDisplay}</li>`;
    }).join('');
    const popupHTML = `
        <div class="popup-overlay show" id="transaction-details-popup">
            <div class="popup-content">
                <button class="popup-close">&times;</button>
                <h2>Transaction Details</h2>
                <div class="transaction-details-content">
                    <p><strong>Date:</strong> ${transaction.createdAt ? new Date(transaction.createdAt).toLocaleString() : 'N/A'}</p>
                    <p><strong>Customer Name:</strong> ${transaction.customerName}</p>
                    <p><strong>Customer Email:</strong> ${transaction.customerEmail}</p>
                    <p><strong>Delivery Address:</strong> ${transaction.customerAddress}</p>
                    <p><strong>Payment Method:</strong> ${transaction.paymentMethod ? transaction.paymentMethod.toUpperCase() : 'N/A'}</p>
                    <h4>Items Purchased</h4>
                    <ul>${itemsHTML}</ul>
                    <hr style="margin: 15px 0; border: none; border-top: 1px solid #ddd;">
                    <div style="background-color: #f9f9f9; padding: 12px; border-radius: 6px; margin-bottom: 10px;">
                        <p style="margin: 8px 0;"><strong>Subtotal:</strong> ${formatCurrency(transaction.totalAmount || 0)}</p>
                        <p style="margin: 8px 0; background-color: #e8f5e9; padding: 8px; border-radius: 4px; color: #2e7d32;"><strong>Gift Card Earned (5%):</strong> ${formatCurrency(transaction.giftCardEarned || 0)}</p>
                    </div>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', popupHTML);
    const popup = document.getElementById('transaction-details-popup');
    const closePopup = () => {
        popup.classList.remove('show');
        setTimeout(() => popup.remove(), 300);
    };
    popup.querySelector('.popup-close').addEventListener('click', closePopup);
    popup.addEventListener('click', e => { if (e.target === popup) closePopup(); });
};

const showTransactionDetailsPopup = (t) => {
    const itemsHTML = t.items.map(item => `<li>${item.title} (x${item.quantity}) - ${formatCurrency(item.currentPrice * item.quantity)}</li>`).join('');
    const popupHTML = `
        <div class="popup-overlay show" id="transaction-details-popup">
            <div class="popup-content">
                <button class="popup-close">&times;</button>
                <h2>Transaction Details</h2>
                <div class="transaction-details-content">
                    <p><strong>Date:</strong> ${new Date(t.date).toLocaleString()}</p>
                    <p><strong>Customer:</strong> ${t.customer.name} (${t.customer.email})</p>
                    <p><strong>Address:</strong> ${t.customer.address}</p>
                    <h4>Items</h4>
                    <ul>${itemsHTML}</ul>
                    <hr>
                    <p><strong>Subtotal:</strong> ${formatCurrency(t.subtotal)}</p>
                    <p><strong>Gift Reward Earned:</strong> ${formatCurrency(t.giftAmount)}</p>
                    <h3><strong>Total:</strong> ${formatCurrency(t.total)}</h3>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', popupHTML);
    const popup = document.getElementById('transaction-details-popup');
    const closePopup = () => {
        popup.classList.remove('show');
        setTimeout(() => popup.remove(), 300);
    };
    popup.querySelector('.popup-close').addEventListener('click', closePopup);
    popup.addEventListener('click', e => { if (e.target === popup) closePopup(); });
};

export const renderNotFound = () => {
    appRoot.innerHTML = `<div class="page-container" style="text-align: center;"><h2>404 - Page Not Found</h2><p>The page you are looking for does not exist.</p></div>`;
};

export const renderLoginPage = () => {
    appRoot.innerHTML = `
        <div class="page-container" style="max-width: 420px; margin: 4rem auto;">
            <div class="auth-form-container">
                <h2>Login</h2>
                <form id="login-form" class="auth-form">
                    <div id="login-message" class="form-message" aria-live="polite"></div>
                    <div class="form-group"><label for="email">Email</label><input type="email" id="email" required autocomplete="email"></div>
                    <div class="form-group"><label for="password">Password</label><input type="password" id="password" required autocomplete="current-password"></div>
                    <button type="submit" class="btn btn-primary" style="width: 100%;">Login</button>
                </form>
                <p style="margin-top: 1rem; text-align: center;">Don't have an account? <a href="#register">Sign up</a></p>
            </div>
        </div>`;
};

export const renderRegisterPage = () => {
    appRoot.innerHTML = `
        <div class="page-container" style="max-width: 520px; margin: 4rem auto;">
             <div class="auth-form-container">
                <h2>Create an Account</h2>
                <form id="register-form" class="auth-form">
                    <div id="register-message" class="form-message" aria-live="polite"></div>
                    <div class="form-group"><label for="name">Full Name</label><input type="text" id="name" name="name" required></div>
                    <div class="form-group"><label for="email">Email</label><input type="email" id="email" name="email" required></div>
                    <div class="form-group"><label for="password">Password</label><input type="password" id="password" name="password" required></div>
                    <button type="submit" class="btn btn-primary" style="width: 100%;">Sign Up</button>
                </form>
                <p style="margin-top: 1rem; text-align: center;">Already have an account? <a href="#login">Login</a></p>
            </div>
        </div>`;
};

export const renderAdminLoginPage = () => {
    appRoot.innerHTML = `
        <div class="page-container admin-login-container" style="max-width: 400px; margin-top: 5rem;">
            <section class="admin-section">
                <h2>Seller / Admin Login</h2>
                <form id="admin-login-form" class="admin-form">
                    <div id="admin-login-message" class="form-message" aria-live="polite"></div>
                    <div class="form-group"><label for="email">Email Address</label><input type="email" id="email" required></div>
                    <div class="form-group"><label for="password">Password</label><input type="password" id="password" required></div>
                    <button type="submit" class="btn btn-primary" style="width: 100%;">Login</button>
                </form>
                <div style="margin-top: 20px; padding: 15px; background-color: #f5f5f7; border-radius: 8px; font-size: 0.9rem;">
                    <p><strong>Test Admin Accounts:</strong></p>
                    <ul style="margin: 10px 0 0 20px;">
                        <li>admin@example.com / password123</li>
                        <li>clothing@example.com / password123</li>
                        <li>kids@example.com / password123</li>
                        <li>furniture@example.com / password123</li>
                    </ul>
                </div>
            </section>
        </div>
    `;
};

export const renderTermsAndConditionsPage = () => {
    appRoot.innerHTML = `
        <div class="page-hero-header" style="background-image: linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url('https://images.unsplash.com/photo-1556742044-1a5b6a782a29?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80');">
            <h1>Terms & Conditions</h1>
        </div>
        <div class="page-container static-page-content" style="max-width: 960px; display: flex; gap: 2rem;">
            <aside style="flex: 0 0 220px; position: sticky; top: 120px; align-self: flex-start;">
                <h4>Table of contents</h4>
                <ul id="terms-toc" style="list-style: none; padding: 0; font-size: 0.9rem;">
                    <li style="margin-bottom: 0.5rem;"><a href="#welcome">General Terms</a></li>
                    <li style="margin-bottom: 0.5rem;"><a href="#cookies">Cookies</a></li>
                    <li style="margin-bottom: 0.5rem;"><a href="#license">License</a></li>
                    <li style="margin-bottom: 0.5rem;"><a href="#hyperlinking">Hyperlinking to our Content</a></li>
                    <li style="margin-bottom: 0.5rem;"><a href="#iframes">iFrames</a></li>
                    <li style="margin-bottom: 0.5rem;"><a href="#liability">Content Liability</a></li>
                    <li style="margin-bottom: 0.5rem;"><a href="#privacy">Your Privacy</a></li>
                    <li style="margin-bottom: 0.5rem;"><a href="#rights">Reservation of Rights</a></li>
                    <li style="margin-bottom: 0.5rem;"><a href="#removal">Removal of links</a></li>
                    <li style="margin-bottom: 0.5rem;"><a href="#disclaimer">Disclaimer</a></li>
                </ul>
            </aside>
            <div style="flex: 1;">
                <h2 id="welcome">Welcome to NAMIX!</h2>
                <p>These terms and conditions outline the rules and regulations for the use of NAMIX's Website, located at this domain.</p>
                <p>By accessing this website we assume you accept these terms and conditions. Do not continue to use NAMIX if you do not agree to take all of the terms and conditions stated on this page.</p>
                <p>The following terminology applies to these Terms and Conditions, Privacy Statement and Disclaimer Notice and all Agreements: "Client", "You" and "Your" refers to you, the person log on this website and compliant to the Company’s terms and conditions. "The Company", "Ourselves", "We", "Our" and "Us", refers to our Company. "Party", "Parties", or "Us", refers to both the Client and ourselves. All terms refer to the offer, acceptance and consideration of payment necessary to undertake the process of our assistance to the Client in the most appropriate manner for the express purpose of meeting the Client’s needs in respect of provision of the Company’s stated services, in accordance with and subject to, prevailing law of Namibia. Any use of the above terminology or other words in the singular, plural, capitalization and/or he/she or they, are taken as interchangeable and therefore as referring to same.</p>
                
                <h3 id="cookies">Cookies</h3>
                <p>We employ the use of cookies. By accessing NAMIX, you agreed to use cookies in agreement with the NAMIX’s Privacy Policy.</p>
                <p>Most interactive websites use cookies to let us retrieve the user’s details for each visit. Cookies are used by our website to enable the functionality of certain areas to make it easier for people visiting our website. Some of our affiliate/advertising partners may also use cookies.</p>
                
                <h3 id="license">License</h3>
                <p>Unless otherwise stated, NAMIX and/or its licensors own the intellectual property rights for all material on NAMIX. All intellectual property rights are reserved. You may access this from NAMIX for your own personal use subjected to restrictions set in these terms and conditions.</p>
                <p>You must not:</p>
                <ul>
                    <li>Republish material from NAMIX</li>
                    <li>Sell, rent or sub-license material from NAMIX</li>
                    <li>Reproduce, duplicate or copy material from NAMIX</li>
                    <li>Redistribute content from NAMIX</li>
                </ul>
                <p>This Agreement shall begin on the date hereof.</p>
                <p>Parts of this website offer an opportunity for users to post and exchange opinions and information in certain areas of the website. NAMIX does not filter, edit, publish or review Comments prior to their presence on the website. Comments do not reflect the views and opinions of NAMIX, its agents and/or affiliates. Comments reflect the views and opinions of the person who post their views and opinions. To the extent permitted by applicable laws, NAMIX shall not be liable for the Comments or for any liability, damages or expenses caused and/or suffered as a result of any use of and/or posting of and/or appearance of the Comments on this website.</p>
                <p>NAMIX reserves the right to monitor all Comments and to remove any Comments which can be considered inappropriate, offensive or causes breach of these Terms and Conditions.</p>
                <p>You warrant and represent that:</p>
                <ul>
                    <li>You are entitled to post the Comments on our website and have all necessary licenses and consents to do so;</li>
                    <li>The Comments do not invade any intellectual property right, including without limitation copyright, patent or trademark of any third party;</li>
                    <li>The Comments do not contain any defamatory, libelous, offensive, indecent or otherwise unlawful material which is an invasion of privacy</li>
                    <li>The Comments will not be used to solicit or promote business or custom or present commercial activities or unlawful activity.</li>
                </ul>
                <p>You hereby grant NAMIX a non-exclusive license to use, reproduce, edit and authorize others to use, reproduce and edit any of your Comments in any and all forms, formats or media.</p>
                
                <h3 id="hyperlinking">Hyperlinking to our Content</h3>
                <p>The following organizations may link to our Website without prior written approval:</p>
                <ul>
                    <li>Government agencies;</li>
                    <li>Search engines;</li>
                    <li>News organizations;</li>
                    <li>Online directory distributors may link to our Website in the same manner as they hyperlink to the Websites of other listed businesses; and</li>
                    <li>System wide Accredited Businesses except soliciting non-profit organizations, charity shopping malls, and charity fundraising groups which may not hyperlink to our Web site.</li>
                </ul>
                <p>These organizations may link to our home page, to publications or to other Website information so long as the link: (a) is not in any way deceptive; (b) does not falsely imply sponsorship, endorsement or approval of the linking party and its products and/or services; and (c) fits within the context of the linking party’s site.</p>
                <p>We may consider and approve other link requests from the following types of organizations:</p>
                <ul>
                    <li>commonly-known consumer and/or business information sources;</li>
                    <li>dot.com community sites;</li>
                    <li>associations or other groups representing charities;</li>
                    <li>online directory distributors;</li>
                    <li>internet portals;</li>
                    <li>accounting, law and consulting firms; and</li>
                    <li>educational institutions and trade associations.</li>
                </ul>
                <p>We will approve link requests from these organizations if we decide that: (a) the link would not make us look unfavorably to ourselves or to our accredited businesses; (b) the organization does not have any negative records with us; (c) the benefit to us from the visibility of the hyperlink compensates the absence of NAMIX; and (d) the link is in the context of general resource information.</p>
                <p>These organizations may link to our home page so long as the link: (a) is not in any way deceptive; (b) does not falsely imply sponsorship, endorsement or approval of the linking party and its products or services; and (c) fits within the context of the linking party’s site.</p>
                <p>If you are one of the organizations listed in paragraph 2 above and are interested in linking to our website, you must inform us by sending an e-mail to NAMIX. Please include your name, your organization name, contact information as well as the URL of your site, a list of any URLs from which you intend to link to our Website, and a list of the URLs on our site to which you would like to link. Wait 2-3 weeks for a response.</p>
                <p>Approved organizations may hyperlink to our Website as follows:</p>
                <ul>
                    <li>By use of our corporate name; or</li>
                    <li>By use of the uniform resource locator being linked to; or</li>
                    <li>By use of any other description of our Website being linked to that makes sense within the context and format of content on the linking party’s site.</li>
                </ul>
                <p>No use of NAMIX’s logo or other artwork will be allowed for linking absent a trademark license agreement.</p>
                
                <h3 id="iframes">iFrames</h3>
                <p>Without prior approval and written permission, you may not create frames around our Webpages that alter in any way the visual presentation or appearance of our Website.</p>
                
                <h3 id="liability">Content Liability</h3>
                <p>We shall not be hold responsible for any content that appears on your Website. You agree to protect and defend us against all claims that is rising on your Website. No link(s) should appear on any Website that may be interpreted as libelous, obscene or criminal, or which infringes, otherwise violates, or advocates the infringement or other violation of, any third party rights.</p>
                
                <h3 id="privacy">Your Privacy</h3>
                <p>Please read Privacy Policy</p>
                
                <h3 id="rights">Reservation of Rights</h3>
                <p>We reserve the right to request that you remove all links or any particular link to our Website. You approve to immediately remove all links to our Website upon request. We also reserve the right to amen these terms and conditions and it’s linking policy at any time. By continuously linking to our Website, you agree to be bound to and follow these linking terms and conditions.</p>
                
                <h3 id="removal">Removal of links from our website</h3>
                <p>If you find any link on our Website that is offensive for any reason, you are free to contact and inform us any moment. We will consider requests to remove links but we are not obligated to or so or to respond to you directly.</p>
                <p>We do not ensure that the information on this website is correct, we do not warrant its completeness or accuracy; nor do we promise to ensure that the website remains available or that the material on the website is kept up to date.</p>
                
                <h3 id="disclaimer">Disclaimer</h3>
                <p>To the maximum extent permitted by applicable law, we exclude all representations, warranties and conditions relating to our website and the use of this website. Nothing in this disclaimer will:</p>
                <ul>
                    <li>limit or exclude our or your liability for death or personal injury;</li>
                    <li>limit or exclude our or your liability for fraud or fraudulent misrepresentation;</li>
                    <li>limit any of our or your liabilities in any way that is not permitted under applicable law; or</li>
                    <li>exclude any of our or your liabilities that may not be excluded under applicable law.</li>
                </ul>
                <p>The limitations and prohibitions of liability set in this Section and elsewhere in this disclaimer: (a) are subject to the preceding paragraph; and (b) govern all liabilities arising under the disclaimer, including liabilities arising in contract, in tort and for breach of statutory duty.</p>
                <p>As long as the website and the information and services on the website are provided free of charge, we will not be liable for any loss or damage of any nature.</p>
            </div>
        </div>
   `;
    const toc = document.getElementById('terms-toc');
    if (toc) {
        toc.addEventListener('click', function(e) {
            const link = e.target.closest('a');
            if (link && link.hash) {
                e.preventDefault();
                const targetElement = document.querySelector(link.hash);
                if (targetElement) {
                    targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }
        });
    }
};

export const renderCombosPage = (products) => {
    const category = categoryData['combos'];
    const contentHTML = products && products.length > 0 ? `<div class="products-grid">${products.map(p => createProductCard(p)).join('')}</div>` : `<h2>No Combo Deals Available</h2><p>Check back soon for amazing bundles!</p>`;
    appRoot.innerHTML = `<div class="page-hero-header" style="background-image: linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url('${category.heroImage}')"><h1>${category.name}</h1></div><div class="page-container">${contentHTML}</div>`;
    startLiveTimerUpdates();
};

export const renderReviewsPage = () => {
    appRoot.innerHTML = `<div class="page-hero-header" style="background-image: linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url('https://images.unsplash.com/photo-1589463996363-207d5833c88e?auto=format&fit=crop&w=1350&q=80')"><h1>Customer Reviews</h1></div><div class="page-container"><h2>See What Our Customers Say!</h2><p>This section is under development.</p></div>`;
};

export const renderPrivacyPolicyPage = () => {
    appRoot.innerHTML = `<div class="page-hero-header" style="background-image: linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url('https://images.unsplash.com/photo-1558021211-6d140f9ae436?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80')"><h1>Privacy Policy</h1></div><div class="page-container" style="max-width: 800px;"><p><strong>Last updated: January 2026</strong></p><h2>Information Collection and Use</h2><p>We collect several different types of information...</p></div>`;
};

export const renderTermsPage = () => {
    appRoot.innerHTML = `<div class="page-hero-header" style="background-image: linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url('https://images.unsplash.com/photo-1556742044-1a5b6a782a29?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80')"><h1>Terms & Conditions</h1></div><div class="page-container" style="max-width: 800px;"><p><strong>Last updated: January 2026</strong></p><h2>1. Acknowledgment</h2><p>These are the Terms and Conditions governing the use of this Service...</p></div>`;
};

export const renderShippingInfoPage = () => {
    appRoot.innerHTML = `<div class="page-hero-header" style="background-image: linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url('https://images.unsplash.com/photo-1587132137056-bfbf0166836e?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80')"><h1>Delivery Information</h1></div><div class="page-container static-page-content" style="max-width: 800px;"><h2>Delivery Nationwide</h2><p>We are proud to offer free, fast, and reliable delivery to all corners of Namibia...</p></div>`;
};

export const renderReturnsPage = () => {
    appRoot.innerHTML = `<div class="page-hero-header" style="background-image: linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url('https://images.unsplash.com/photo-1563013544-824ae1b704d3?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80')"><h1>Returns Policy</h1></div><div class="page-container static-page-content" style="max-width: 800px;"><h2>15-Day Hassle-Free Returns</h2><p>Your satisfaction is our top priority...</p></div>`;
};

export const renderFaqsPage = async () => {
    appRoot.innerHTML = `<div class="page-hero-header" style="background-image: linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url('https://images.unsplash.com/photo-1516321497487-e288fb19713f?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80')"><h1>Frequently Asked Questions</h1></div><div class="page-container faq-container" style="max-width: 800px;"><p class="faq-loading">Loading FAQs...</p></div>`;

    // Helper to escape HTML to avoid XSS when rendering content from DB
    const escapeHtml = (unsafe) => {
        if (!unsafe && unsafe !== 0) return '';
        return String(unsafe)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    };

    try {
        const faqs = await api.fetchFAQs();
        const container = document.querySelector('.faq-container');
        if (!container) return;

        if (!Array.isArray(faqs) || faqs.length === 0) {
            container.innerHTML = '<p>No FAQs available yet.</p>';
            return;
        }

        container.innerHTML = faqs.map(f => `
            <div class="faq-item">
                <button class="faq-question">${escapeHtml(f.question)}</button>
                <div class="faq-answer" style="max-height:0; overflow:hidden; transition: max-height 0.3s ease;"><p>${escapeHtml(f.answer)}</p></div>
            </div>
        `).join('');

        // Attach toggles for Q/A items
        const questions = container.querySelectorAll('.faq-question');
        questions.forEach(question => {
            question.addEventListener('click', () => {
                const answer = question.nextElementSibling;
                question.classList.toggle('active');
                if (question.classList.contains('active')) {
                    answer.style.maxHeight = answer.scrollHeight + 'px';
                } else {
                    answer.style.maxHeight = 0;
                }
            });
        });
    } catch (err) {
        const container = document.querySelector('.faq-container');
        if (container) container.innerHTML = `<p>Failed to load FAQs: ${err.message || err}</p>`;
        console.error('Failed to render FAQs page:', err);
    }
};

export const initAdminViewers = () => {
    const peakTimes = [
        { label: '6:00 AM', hour: 6, minute: 0 },
        { label: '8:00 AM', hour: 8, minute: 0 },
        { label: '10:00 AM', hour: 10, minute: 0 },
        { label: '12:00 PM (Noon)', hour: 12, minute: 0 },
        { label: '2:00 PM', hour: 14, minute: 0 },
        { label: '4:00 PM', hour: 16, minute: 0 },
        { label: '6:00 PM', hour: 18, minute: 0 },
        { label: '8:00 PM', hour: 20, minute: 0 },
        { label: '10:00 PM', hour: 22, minute: 0 },
    ];
    const peakTimesGrid = document.getElementById('peak-times-grid');
    if (peakTimesGrid) {
        peakTimesGrid.innerHTML = peakTimes.map((time) => `<button type="button" class="peak-time-option" data-hour="${time.hour}" data-minute="${time.minute}">${time.label}</button>`).join('');
        peakTimesGrid.addEventListener('click', (e) => {
            if (e.target.classList.contains('peak-time-option')) {
                e.preventDefault();
                peakTimesGrid.querySelectorAll('.peak-time-option').forEach(btn => btn.classList.remove('selected'));
                e.target.classList.add('selected');
            }
        });
    }
    const addViewersForm = document.getElementById('add-viewers-form');
    // Toggle review fields when checkbox changed
    const addReviewNowCheckbox = document.getElementById('add-review-now');
    const addReviewFields = document.getElementById('add-review-fields');
    if (addReviewNowCheckbox && addReviewFields) {
        addReviewNowCheckbox.addEventListener('change', (e) => {
            addReviewFields.style.display = e.target.checked ? 'block' : 'none';
        });
    }
    if (addViewersForm) {
        addViewersForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const productId = document.getElementById('viewers-product').value;
            const viewerName = document.getElementById('viewer-name')?.value?.trim();
            const addReviewNow = document.getElementById('add-review-now')?.checked;
            const reviewRating = parseInt(document.getElementById('review-rating')?.value || '5');
            const reviewText = (document.getElementById('review-text')?.value || '').trim();
            const selectedBtn = peakTimesGrid?.querySelector('.peak-time-option.selected');
            if (!selectedBtn) { showViewersMessage('Please select a peak time', 'error'); return; }
            const viewTime = { hour: parseInt(selectedBtn.dataset.hour), minute: parseInt(selectedBtn.dataset.minute) };
            try {
                // Step 1: Add the viewer and get the new viewer object back
                const data = await api.addViewer(productId, { name: viewerName || undefined, viewTime });
                const newViewer = data.viewer;

                // Step 2: If review is requested, add it now using the new viewer's ID
                if (addReviewNow && reviewText && newViewer && newViewer._id) {
                    try {
                        await api.addReview(productId, { 
                            author: viewerName || 'Verified Buyer', // Use a more generic author
                            rating: reviewRating, 
                            text: reviewText, 
                            viewerId: newViewer._id // Link the review to the viewer
                        });
                        showViewersMessage(`✓ Viewer and review added successfully! Total viewers: ${data.viewerCount}`, 'success');
                    } catch (revErr) {
                        // If review fails, the viewer was still added. Inform the user.
                        showViewersMessage(`Viewer added, but failed to add review: ${revErr.message || revErr}`, 'error');
                    }
                } else {
                    showViewersMessage(`✓ Viewer added! Total: ${data.viewerCount}`, 'success');
                }

                // Reset form
                addViewersForm.reset();
                peakTimesGrid?.querySelectorAll('.peak-time-option').forEach(btn => btn.classList.remove('selected'));
                if (addReviewFields) addReviewFields.style.display = 'none';

            } catch (error) {
                showViewersMessage('Failed to add viewer: ' + (error.message || ''), 'error');
            }
        });
    }
    function showViewersMessage(message, type) {
        const messageDiv = document.getElementById('viewers-message');
        if (messageDiv) {
            messageDiv.className = type === 'success' ? 'viewer-success-message' : 'viewer-error-message';
            messageDiv.textContent = message;
            messageDiv.style.display = 'block';
            setTimeout(() => { messageDiv.style.display = 'none'; }, 4000);
        }
    }
    // Delegate clicks inside viewer list for add-review actions
    document.getElementById('viewer-list-admin')?.addEventListener('click', async (e) => {
        const addBtn = e.target.closest('.add-review-btn');
        const submitBtn = e.target.closest('.submit-review-btn');
        if (addBtn) {
            const viewerId = addBtn.dataset.viewerId;
            const formEl = document.querySelector(`.add-review-form[data-for-viewer="${viewerId}"]`);
            if (formEl) formEl.style.display = formEl.style.display === 'none' ? 'block' : 'none';
            return;
        }
        if (submitBtn) {
            const productId = submitBtn.dataset.productId;
            const viewerId = submitBtn.dataset.viewerId;
            const formEl = submitBtn.closest('.add-review-form');
            if (!formEl) return;
            const author = formEl.querySelector('.review-author')?.value || '';
            const rating = parseInt(formEl.querySelector('.review-rating')?.value || '5');
            const text = formEl.querySelector('.review-text')?.value || '';
            if (!text || !author) { alert('Please provide reviewer name and review text'); return; }
            try {
                await api.addReview(productId, { author, rating, text, viewerId }); // Pass viewerId here
                alert('Review added successfully');
                location.reload();
            } catch (err) {
                alert('Failed to add review: ' + err.message);
            }
        }
    });
};

export const renderForgotPage = () => {
    appRoot.innerHTML = `
        <div class="page-container" style="max-width: 420px; margin: 4rem auto;">
            <div class="auth-form-container">
                <h2>Reset Password</h2>
                <form id="forgot-form" class="auth-form">
                    <div id="forgot-message" class="form-message" aria-live="polite"></div>
                    <div class="form-group"><label for="email">Email</label><input type="email" id="email" required autocomplete="email"></div>
                    <button type="submit" class="btn btn-primary" style="width: 100%;">Send Reset Link</button>
                </form>
                <p style="margin-top: 1rem; text-align: center;"><a href="#login">Back to Login</a></p>
            </div>
        </div>`;
};

export const renderResetPage = (token = '') => {
    appRoot.innerHTML = `
        <div class="page-container" style="max-width: 420px; margin: 4rem auto;">
            <div class="auth-form-container">
                <h2>Set New Password</h2>
                <form id="reset-form" class="auth-form">
                    <div id="reset-message" class="form-message" aria-live="polite"></div>
                    <div class="form-group"><label for="password">New Password</label><input type="password" id="password" required autocomplete="new-password"></div>
                    <input type="hidden" id="reset-token" value="${token}">
                    <button type="submit" class="btn btn-primary" style="width: 100%;">Reset Password</button>
                </form>
                <p style="margin-top: 1rem; text-align: center;"><a href="#login">Back to Login</a></p>
            </div>
        </div>`;
};