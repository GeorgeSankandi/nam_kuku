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

// Track intervals to clean them up on navigation
let liveViewerInterval = null;

// Standard Clothing Sizes for Admin Dropdown
const STANDARD_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', 'UK 4', 'UK 6', 'UK 8', 'UK 10', 'UK 12', 'UK 14', 'One Size', '2-3Y', '3-4Y', '4-5Y', '5-6Y', '7-8Y', '9-10Y', '11-12Y', '13-14Y'];

// Set up cart update callback
setCartUpdateCallback(() => {
    updateFloatingCartButton();
});

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
    'clothes': { name: 'Clothing', heroImage: 'https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=1350&q=80', subcategories: ['womens-clothes', 'mens-clothes'] },
    'womens-clothing': { name: "Women's Clothes", parent: 'clothing', heroImage: 'https://images.unsplash.com/photo-1572804013427-4d7ca726b655?auto=format&fit=crop&w=1350&q=80' },
    'mens-clothing': { name: "Men's Clothes", parent: 'clothing', heroImage: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=1350&q=80' },
    'womens-clothes': { name: "Women's Clothes", parent: 'clothing', heroImage: 'https://images.unsplash.com/photo-1572804013427-4d7ca726b655?auto=format&fit=crop&w=1350&q=80' },
    'mens-clothes': { name: "Men's Clothes", parent: 'clothing', heroImage: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=1350&q=80' },
    'kids': { name: 'For Kids', heroImage: 'https://images.unsplash.com/photo-1518831004940-a39c9a0a4176?auto=format&fit=crop&w=1350&q=80' },
    'furniture': { name: 'Furniture', heroImage: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1350&q=80', subcategories: ['chairs', 'tables', 'sofas'] },
    'furnitures': { name: 'Furniture', heroImage: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1350&q=80', subcategories: ['living-room','bedroom','office'] },
    'chairs': { name: 'Chairs', parent: 'furniture', heroImage: 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&w=1350&q=80' },
    'tables': { name: 'Tables', parent: 'furniture', heroImage: 'https://images.unsplash.com/photo-1604014237800-1c9102c219da?auto=format&fit=crop&w=1350&q=80' },
    'sofas': { name: 'Sofas', parent: 'furniture', heroImage: 'https://images.unsplash.com/photo-1540574163026-6addeaabfcdb?auto=format&fit=crop&w=1350&q=80' },
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

const PEAK_ACTIVITY_TIMES = [
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

export const updateCategoryData = (settings) => {
    for (const key in settings) {
        if (key.startsWith('heroImage_') && categoryData[key.replace('heroImage_', '')]) {
            categoryData[key.replace('heroImage_', '')].heroImage = settings[key];
        }
    }
};

// Safe getter for appRoot to ensure it exists before use
const getAppRoot = () => {
    const root = document.getElementById('app-root');
    if (!root) {
        console.error('CRITICAL: #app-root element not found in DOM.');
        // Fallback: create main if missing
        const main = document.createElement('main');
        main.id = 'app-root';
        document.body.appendChild(main);
        return main;
    }
    return root;
};

export const clearRoot = () => {
    if (liveViewerInterval) {
        clearInterval(liveViewerInterval);
        liveViewerInterval = null;
    }
    const root = getAppRoot();
    if (root) root.innerHTML = '';
};

// --- Floating Cart Button ---
export const updateFloatingCartButton = () => {
    const cartCount = CartManager.getCartCount();
    const isUserLoggedIn = isLoggedIn();

    const headerCart = document.getElementById('header-cart-btn') || document.querySelector('.cart');
    if (headerCart) {
        const hb = headerCart.querySelector('.cart-badge');
        if (hb) hb.textContent = cartCount;
        // Always ensure the floating cart is visible
        headerCart.classList.remove('hidden');
    }
};

export const initFloatingCart = () => {
    updateFloatingCartButton();
};

const formatCurrency = (amount) => `N$${(Number(amount) || 0).toLocaleString()}`;

export const calculateTimeRemaining = (endDate) => {
    if (!endDate) return null;
    const now = new Date();
    const end = new Date(endDate);
    const diff = end - now;
    
    if (diff <= 0) return null;
    
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
    
    if (product.stock !== undefined && product.stock !== null) {
        leftTags += `<div class="product-tag stock-badge" style="background: linear-gradient(135deg, #cb152d, #ff6b6b);">${product.stock} left</div>`;
    }

    if (product.curatedPages && product.curatedPages.includes('combos')) {
        rightTags += `<div class="product-tag combo-tag">COMBO</div>`;
    }

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

// --- STATIC PAGE RENDERERS ---

export const renderShippingInfoPage = () => {
    getAppRoot().innerHTML = `
        <div class="corporate-minimalist-hero">
            <h1>Delivery & Shipping</h1>
        </div>
        <div class="corporate-minimalist-container">
            <h3>Our Commitment to You</h3>
            <p>At NamKuku, we are dedicated to delivering your new tech and lifestyle products as quickly, safely, and efficiently as possible. Understanding that receiving your items promptly is a crucial part of the online shopping experience, we have streamlined our logistics to serve every corner of Namibia. We proudly offer complimentary express shipping on every single order, with no minimum purchase required.</p>
            
            <h3>Nationwide Delivery Times</h3>
            <p>Our delivery network is optimized to provide the best possible service times across the country. Your delivery window will depend on your location:</p>
            <ul>
                <li><strong>Windhoek & Surrounding Areas:</strong> Expect your order to arrive on the same day if placed before 12:00 PM on a business day, or on the next business day if placed in the afternoon.</li>
                <li><strong>Major Towns (e.g., Swakopmund, Walvis Bay, Oshakati, Rundu):</strong> Deliveries to major urban centers are typically completed within 2 to 3 business days.</li>
                <li><strong>Remote & Outlying Areas:</strong> For customers in more remote locations, we estimate a delivery time of 3 to 5 business days. We are committed to reaching you, no matter where you are.</li>
            </ul>

            <h3>Our Trusted Courier Partners</h3>
            <p>To ensure your products arrive in pristine condition, we have partnered with a selection of Namibia's most reliable courier services. Our primary logistics partners include Nampost Courier, known for its extensive nationwide network, and several specialized private logistics companies for high-value or fragile items. Each order is fully insured and tracked from the moment it leaves our facility until it is safely in your hands. You will receive a tracking number via email as soon as your order is dispatched.</p>
        </div>
    `;
};

export const renderReturnsPage = () => {
    getAppRoot().innerHTML = `
        <div class="corporate-minimalist-hero">
            <h1>Returns & Warranty Policy</h1>
        </div>
        <div class="corporate-minimalist-container">
            <h3>15-Day Satisfaction Guarantee</h3>
            <p>Your satisfaction is our top priority. If you are not completely happy with your purchase for any reason, you are welcome to return it within 15 calendar days of receipt. We offer a full refund, exchange, or store credit, provided the item is returned in its original, unopened, and unused condition with all packaging and accessories intact. Please note that for a return to be processed, the item must be in a re-sellable state.</p>
            
            <h3>Comprehensive Warranty Coverage</h3>
            <p>Shop with confidence knowing your purchases are protected.</p>
            <ul>
                <li><strong>New Products:</strong> All brand-new products sold by NamKuku come with a standard 1-year manufacturer's warranty. This warranty covers any defects in material or workmanship under normal use during the warranty period.</li>
                <li><strong>Pre-Owned (Second-Hand) Items:</strong> Our "Renewed Premium" and other pre-owned items undergo rigorous testing and are backed by a comprehensive 6-month warranty. This warranty covers all functional and mechanical defects that are not a result of accidental damage or misuse.</li>
            </ul>

            <h3>Initiating a Return</h3>
            <p>To start a return or warranty claim, please send an email to our dedicated support team at <a href="mailto:support@namkuku.com">support@namkuku.com</a>. Kindly include your order number, the name of the product, and a brief description of the issue. Our team will guide you through the next steps within one business day.</p>
        </div>
    `;
};

export const renderTermsAndConditionsPage = () => {
    getAppRoot().innerHTML = `
        <div class="corporate-minimalist-hero">
            <h1>Terms & Conditions</h1>
        </div>
        <div class="corporate-minimalist-container">
            <h3>1. Agreement to Terms</h3>
            <p>Welcome to NamKuku. By accessing our website, creating an account, or making a purchase, you agree to be bound by these Terms and Conditions and our Privacy Policy. These terms apply to all visitors, users, and others who wish to access or use the service.</p>
            
            <h3>2. Pricing and Payment</h3>
            <p>All prices listed on the NamKuku online store are in Namibian Dollars (NAD) and are inclusive of Value-Added Tax (VAT) where applicable. We strive for accuracy but reserve the right to correct any errors in pricing or product information at any time without prior notice. Payment must be made in full before an order is dispatched.</p>

            <h3>3. Intellectual Property</h3>
            <p>The NamKuku brand, logo, and all content on this website, including text, graphics, and images, are the exclusive property of NamKuku and are protected by copyright and other intellectual property laws. Unauthorized use is strictly prohibited.</p>
        </div>
    `;
};

export const renderPrivacyPolicyPage = () => {
    getAppRoot().innerHTML = `
        <div class="corporate-minimalist-hero">
            <h1>Privacy Policy</h1>
        </div>
        <div class="corporate-minimalist-container">
            <h3>Our Commitment to Your Privacy</h3>
            <p>Your privacy is of paramount importance to us at NamKuku. This Privacy Policy outlines the types of personal information we collect, how it is used, and the steps we take to ensure your data is handled securely and responsibly.</p>
            
            <h3>Information We Collect</h3>
            <p>We collect information you provide directly to us when you create an account, place an order, or contact customer support. This may include:</p>
            <ul>
                <li>Your name, email address, and physical address.</li>
                <li>Payment information (handled securely by our payment processors).</li>
                <li>Order history and product interests.</li>
            </ul>

            <h3>How We Use Your Data</h3>
            <p>We use the information we collect to process your transactions, provide you with order updates, and continuously improve our services and product offerings. We are committed to never selling or renting your personal data to third-party marketers. Your information is only shared with essential partners, such as courier services, for the sole purpose of fulfilling your order.</p>
        </div>
    `;
};

export const renderContactPage = () => {
    getAppRoot().innerHTML = `
        <div class="corporate-minimalist-hero">
            <h1>Contact Us</h1>
        </div>
        <div class="corporate-minimalist-container">
            <h3>Get In Touch</h3>
            <p>Whether you have a question about a product, need assistance with an order, or just want to provide feedback, our team is ready to help. Please use the form below or contact us directly through one of the channels listed.</p>
            
            <div class="contact-form-section">
                <div class="contact-details">
                    <ul>
                        <li><i class="fas fa-envelope"></i> <div><strong>Email</strong><br>support@namkuku.com</div></li>
                        <li><i class="fas fa-phone-alt"></i> <div><strong>Phone</strong><br>+264 81 123 4567</div></li>
                        <li><i class="fas fa-map-marker-alt"></i> <div><strong>Address</strong><br>12 Independence Ave, Windhoek</div></li>
                    </ul>
                </div>
                <form class="contact-form">
                    <div class="form-group">
                        <label for="contact-name">Full Name</label>
                        <input type="text" id="contact-name" required>
                    </div>
                    <div class="form-group">
                        <label for="contact-email">Email Address</label>
                        <input type="email" id="contact-email" required>
                    </div>
                    <div class="form-group">
                        <label for="contact-message">Message</label>
                        <textarea id="contact-message" rows="6" required></textarea>
                    </div>
                    <button type="submit" class="btn btn-primary">Send Message</button>
                </form>
            </div>
        </div>
    `;
};

export const renderHowToSellPage = () => {
    getAppRoot().innerHTML = `
        <div class="corporate-minimalist-hero">
            <h1>Sell on NamKuku</h1>
            <p style="opacity: 0.9; margin-top: 10px; font-size: 1.2rem;">Join Namibia's premium marketplace as a verified reseller.</p>
        </div>
        <div class="corporate-minimalist-container">
            <h3>How to Join</h3>
            <div class="steps-grid">
                <div class="step-card">
                    <div class="step-icon"><i class="fas fa-user-plus"></i></div>
                    <h3 style="margin-top: 1rem;">1. Register</h3>
                    <p>Create an account and select your seller type (Clothes, Furniture, etc.).</p>
                </div>
                <div class="step-card">
                    <div class="step-icon"><i class="fas fa-clock"></i></div>
                    <h3 style="margin-top: 1rem;">2. Get Approved</h3>
                    <p>Wait for admin approval. We verify all sellers to ensure quality.</p>
                </div>
                <div class="step-card">
                    <div class="step-icon"><i class="fas fa-store"></i></div>
                    <h3 style="margin-top: 1rem;">3. Start Selling</h3>
                    <p>Access your dashboard to list products, manage stock, and track sales.</p>
                </div>
            </div>
            
            <div style="text-align: center; margin-top: 4rem; padding-top: 2rem; border-top: 1px solid #eee;">
                <h3 style="text-align: center; border: none; margin-bottom: 1rem;">Ready to grow your business?</h3>
                <a href="#register" class="btn btn-primary" style="padding: 15px 50px; font-size: 1.1rem; display: inline-flex; text-decoration: none;">Register Now</a>
            </div>
        </div>
    `;
};

export const renderTradeInPage = () => {
    getAppRoot().innerHTML = `
        <div class="page-hero-header static-page-hero">
            <h1>Trade-In Program</h1>
        </div>
        <div class="page-container static-page-container">
            <p>Upgrade to the latest tech for less by trading in your old device.</p>
            <h3>How it works:</h3>
            <ul>
                <li>Bring your device to our Windhoek store for assessment.</li>
                <li>We'll offer you a credit value based on the device's condition.</li>
                <li>Use that credit instantly towards your new purchase.</li>
            </ul>
        </div>
    `;
};

export const renderFaqsPage = async () => {
    let faqs = [];
    try {
        faqs = await api.fetchFAQs();
    } catch (e) {
        console.error(e);
    }

    const faqItems = faqs.length > 0
        ? faqs.map(f => `
            <div class="faq-item">
                <button class="faq-question">${f.question}</button>
                <div class="faq-answer"><p>${f.answer}</p></div>
            </div>`).join('')
        : '<p>No FAQs available at the moment.</p>';

    getAppRoot().innerHTML = `
        <div class="page-hero-header static-page-hero">
            <h1>Frequently Asked Questions</h1>
        </div>
        <div class="page-container static-page-container faq-container">
            ${faqItems}
        </div>
    `;
    
    // Attach event listeners for accordion behavior
    document.querySelectorAll('.faq-question').forEach(btn => {
        btn.addEventListener('click', () => {
            btn.classList.toggle('active');
            const ans = btn.nextElementSibling;
            if (btn.classList.contains('active')) {
                ans.style.maxHeight = ans.scrollHeight + 'px';
            } else {
                ans.style.maxHeight = 0;
            }
        });
    });
};

export const renderAboutPage = async () => {
    let aboutImage = 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1350&q=80'; // Default
    try {
        const settings = await api.fetchSettings();
        // The API returns an array of objects: [{ key: 'about_us_image', value: '...' }, ...]
        if (Array.isArray(settings)) {
            const storedImg = settings.find(s => s.key === 'about_us_image');
            if (storedImg && storedImg.value) aboutImage = storedImg.value;
        }
    } catch (e) { 
        console.error('Failed to load about us image', e); 
    }

    getAppRoot().innerHTML = `
        <div class="corporate-minimalist-hero">
            <h1>About NamKuku</h1>
        </div>
        <div class="corporate-minimalist-container">
            <div class="about-content-wrapper">
                <div class="about-text">
                    <h3>Who We Are</h3>
                    <p>NamKuku is Namibia's premier online destination for high-quality electronics, fashion, and furniture. We are dedicated to providing a seamless shopping experience with trusted products and exceptional customer service.</p>
                    <h3 style="margin-top: 1.5rem;">Our Mission</h3>
                    <p>Founded with a vision to connect Namibians with the best global technology and lifestyle brands, we pride ourselves on authenticity, reliability, and innovation. Whether you are looking for the latest smartphone, comfortable furniture, or trendy fashion, NamKuku is your trusted partner.</p>
                </div>
                <div class="about-image-container">
                    <img src="${aboutImage}" alt="About NamKuku">
                </div>
            </div>
            
            <div class="values-section">
                <h3>Our Core Values</h3>
                <div class="values-grid">
                    <div class="value-card">
                        <div class="value-icon"><i class="fas fa-check-circle"></i></div>
                        <h4>Authenticity</h4>
                        <p>We guarantee 100% genuine products sourced directly from trusted suppliers.</p>
                    </div>
                    <div class="value-card">
                        <div class="value-icon"><i class="fas fa-shipping-fast"></i></div>
                        <h4>Speed</h4>
                        <p>Express nationwide delivery ensures your products reach you when you need them.</p>
                    </div>
                    <div class="value-card">
                        <div class="value-icon"><i class="fas fa-headset"></i></div>
                        <h4>Service</h4>
                        <p>Our dedicated support team is available 24/7 to assist with any queries.</p>
                    </div>
                    <div class="value-card">
                        <div class="value-icon"><i class="fas fa-shield-alt"></i></div>
                        <h4>Trust</h4>
                        <p>Secure payments and a transparent return policy for your peace of mind.</p>
                    </div>
                </div>
            </div>
        </div>
    `;
};

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

    const closeBtn = document.getElementById('popup-close-btn');
    if(closeBtn) closeBtn.addEventListener('click', closePopup);
    
    const shopBtn = document.getElementById('popup-shop-now-btn');
    if(shopBtn) shopBtn.addEventListener('click', closePopup);
    
    popup.addEventListener('click', e => {
        if (e.target === popup) closePopup();
    });
};

export const renderHomePage = async () => {
    let reviewsCardsHTML = '';
    try {
        const products = await api.fetchProducts();
        if(products) {
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
        }
    } catch (err) {
        reviewsCardsHTML = '<p>Could not load reviews.</p>';
    }

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

    const appRoot = getAppRoot();
    if(appRoot) {
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
        const nextBtn = document.querySelector('.next');
        const prevBtn = document.querySelector('.prev');
        if(nextBtn) nextBtn.addEventListener('click', () => showSlide(currentSlide + 1));
        if(prevBtn) prevBtn.addEventListener('click', () => showSlide(currentSlide - 1));
        setInterval(() => showSlide(currentSlide + 1), 5000);

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
    }
};

export const renderCategoryPage = (products, categoryKey, searchTerm = '') => {
    const category = categoryData[categoryKey];
    let title = "Search Results";
    let heroHTML = '';

    if (category) {
        title = category.name;
        heroHTML = `<div class="page-hero-header" style="background-image: linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url('${category.heroImage}')"><h1>${category.name}</h1></div>`;
    }

    const isClothesLanding = categoryKey === 'clothes' || categoryKey === 'clothing';
    const productGridHTML = products && products.length > 0 ? products.map(p => createProductCard(p)).join('') : (isClothesLanding ? `<h3>No clothes available at the moment.</h3>` : `<h3>No products found ${searchTerm ? `for "${searchTerm}"` : 'in this category yet'}.</h3>`);

    let clothingOptionsHTML = '';
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

    let secondHandFilterHTML = '';
    if (categoryKey === 'second-hand') {
        secondHandFilterHTML = `
            <div class="filter-group">
                <label for="second-hand-category-filter">Category:</label>
                <select id="second-hand-category-filter">
                    <option value="all">All Categories</option>
                    <option value="phones">Phones</option>
                    <option value="tablets">Tablets</option>
                    <option value="computers">Laptops & Computers</option>
                    <option value="gaming">Gaming</option>
                    <option value="furniture">Furniture</option>
                </select>
            </div>
        `;
    }

    // New filter for curated pages
    let curatedPageFilterHTML = '';
    if (['new-arrivals', 'combos', 'trending'].includes(categoryKey)) {
        curatedPageFilterHTML = `
            <div class="filter-group">
                <label for="curated-page-category-filter">Category:</label>
                <select id="curated-page-category-filter">
                    <option value="all">All Categories</option>
                    <option value="phones">Phones</option>
                    <option value="tablets">Tablets</option>
                    <option value="laptops">Laptops & Computers</option>
                    <option value="gaming">Gaming</option>
                    <option value="furniture">Furniture</option>
                </select>
            </div>
        `;
    }

    const filterControlsHTML = `
        <div class="filter-controls">
            ${secondHandFilterHTML}
            ${curatedPageFilterHTML}
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

    getAppRoot().innerHTML = `
        ${heroHTML}
        <div class="page-container">
            ${searchTerm ? `<h2>Search results for: "${searchTerm}"</h2>` : ''}
            ${filterControlsHTML}
            <div class="products-grid" style="margin-top: 1rem;">
                ${productGridHTML}
            </div>
        </div>
    `;
    
    let currentDisplayed = Array.isArray(products) ? [...products] : [];

    // Attach event listener for the new curated page filter
    const curatedPageFilter = document.getElementById('curated-page-category-filter');
    if (curatedPageFilter) {
        curatedPageFilter.addEventListener('change', (e) => {
            const filterVal = e.target.value;
            let filteredProducts;
            if (filterVal === 'all') {
                filteredProducts = [...products];
            } else {
                filteredProducts = products.filter(p => {
                    const cat = (p.category || '').toLowerCase();
                    const parentCat = categoryData[cat]?.parent?.toLowerCase();
                    if (filterVal === 'phones') return cat.includes('phone') || parentCat === 'phones';
                    if (filterVal === 'tablets') return cat.includes('tab') || parentCat === 'tablets';
                    if (filterVal === 'laptops') return ['laptops', 'computers'].includes(parentCat) || ['macbooks', 'dell-laptops', 'hp-laptops', 'imacs', 'hp-aio'].includes(cat);
                    if (filterVal === 'gaming') return parentCat === 'gaming' || cat.includes('gaming');
                    if (filterVal === 'furniture') return parentCat === 'furniture' || ['furniture', 'furnitures'].includes(cat);
                    return false;
                });
            }
            currentDisplayed = filteredProducts;
            const newGridHTML = currentDisplayed.length > 0 
                ? currentDisplayed.map(p => createProductCard(p)).join('') 
                : '<h3>No products found in this category.</h3>';
            
            document.querySelector('.products-grid').innerHTML = newGridHTML;
            document.getElementById('sort-by').value = 'default';
            startLiveTimerUpdates();
        });
    }

    if (categoryKey === 'second-hand') {
        const secondHandFilter = document.getElementById('second-hand-category-filter');
        if (secondHandFilter) {
            secondHandFilter.addEventListener('change', (e) => {
                const filterVal = e.target.value;
                if (filterVal === 'all') {
                    currentDisplayed = [...products];
                } else {
                    currentDisplayed = products.filter(p => {
                        const cat = (p.category || '').toLowerCase();
                        if (filterVal === 'phones') return cat.includes('phone') || cat === 'iphones';
                        if (filterVal === 'tablets') return cat.includes('tablet') || cat.includes('ipad') || cat.includes('tab');
                        if (filterVal === 'computers') return cat.includes('laptop') || cat.includes('macbook') || cat.includes('imac') || cat.includes('aio') || cat.includes('computer');
                        if (filterVal === 'gaming') return cat.includes('game') || cat.includes('gaming') || cat.includes('playstation') || cat.includes('xbox') || cat.includes('nintendo');
                        if (filterVal === 'furniture') return cat.includes('furniture') || cat.includes('chair') || cat.includes('sofa') || cat.includes('table') || cat.includes('living') || cat.includes('bed') || cat.includes('office') || cat.includes('kitchen');
                        return false;
                    });
                }
                
                const sortBy = document.getElementById('sort-by');
                if(sortBy) sortBy.value = 'default';

                const newGridHTML = currentDisplayed.length > 0 
                    ? currentDisplayed.map(p => createProductCard(p)).join('') 
                    : '<h3>No products found in this category.</h3>';
                
                document.querySelector('.products-grid').innerHTML = newGridHTML;
                startLiveTimerUpdates();
            });
        }
    }

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

    const sortByEl = document.getElementById('sort-by');
    if (sortByEl) {
        sortByEl.addEventListener('change', (e) => {
            const val = e.target.value;

            if (val.startsWith('filter-')) {
                const key = val.replace('filter-', '');
                if (key === 'default') {
                    currentDisplayed = Array.isArray(products) ? [...products] : [];
                } else {
                    const keywords = filterMap[key] || [];
                    if (key === 'furniture' || key === 'appliances') {
                        currentDisplayed = (products || []).filter(p => {
                            const filtersArr = Array.isArray(p.clothingFilters) ? p.clothingFilters.map(x => (x||'').toLowerCase()) : [];
                            if (filtersArr.includes(key)) return true;
                            const singular = key.replace(/s$/,'');
                            if (filtersArr.includes(singular)) return true;
                            if (filtersArr.includes(key + 's')) return true;
                            if (key === 'appliances' && (filtersArr.includes('appliance') || filtersArr.includes('appliances'))) return true;
                            return false;
                        });
                    } else {
                        currentDisplayed = (products || []).filter(p => {
                            const title = (p.title || '').toLowerCase();
                            const cat = (p.category || '').toLowerCase();
                            const filtersArr = Array.isArray(p.clothingFilters) ? p.clothingFilters.map(x => (x||'').toLowerCase()) : [];
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

            const [sortBy, order] = val.split('-');
            let sortedProducts = [...currentDisplayed];
            if (sortBy === 'price') {
                sortedProducts.sort((a, b) => order === 'asc' ? a.currentPrice - b.currentPrice : b.currentPrice - a.currentPrice);
            } else if (sortBy === 'name') {
                sortedProducts.sort((a, b) => order === 'asc' ? a.title.localeCompare(b.title) : b.title.localeCompare(a.title));
            } else if (val === 'default') {
                if (categoryKey === 'second-hand') {
                     sortedProducts = Array.isArray(products) ? [...products] : [];
                     const catFilter = document.getElementById('second-hand-category-filter');
                     if(catFilter) catFilter.value = 'all';
                } else {
                     sortedProducts = Array.isArray(products) ? [...products] : [];
                }
            }

            const newGridHTML = sortedProducts.map(p => createProductCard(p)).join('');
            document.querySelector('.products-grid').innerHTML = newGridHTML;
            startLiveTimerUpdates();
        });
    }

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
};

export const renderProductPage = async (product) => {
    if (!product) { getAppRoot().innerHTML = '<h2>Product not found</h2>'; return; }

    let similarProducts = [];
    try {
        similarProducts = await api.fetchProducts(product.category);
    } catch (err) {
        console.warn('Could not fetch similar products by category', err);
    }

    let filteredSimilar = (similarProducts || [])
        .filter(p => p.productId !== product.productId)
        .slice(0, 4);

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

    let fiveStarReviews = [];
    if (product.reviews && product.reviews.length > 0) {
        fiveStarReviews = product.reviews.filter(r => r.rating === 5 && r.viewerId);
    }
    const viewerLinkedReviews = (product.reviews || []).filter(r => r.viewerId);
    const textReviews = viewerLinkedReviews.filter(r => r.text && r.text.trim().length > 0);
    const reviewsHTML = textReviews.length > 0
        ? textReviews.map(review => `<div class="review"><div class="product-rating">${renderStars(review.rating)}</div><p class="review-author">by ${review.author}</p><p>${review.text}</p></div>`).join('')
        : '<p>0 reviews</p>';

    let fiveStarSectionHTML = '';
    if (fiveStarReviews.length > 0) {
        fiveStarSectionHTML = `
            <section class="five-star-reviews">
                <h3>5-Star Reviews (${fiveStarReviews.length})</h3>
                ${fiveStarReviews.map(r => `<div class="review"><div class="product-rating">${renderStars(r.rating)}</div><p class="review-author">by ${r.author}</p><p>${r.text}</p></div>`).join('')}
            </section>
        `;
    }
        
    const featuresListHTML = product.features && product.features.length > 0
        ? `<ul>${product.features.map(feature => `<li>${feature}</li>`).join('')}</ul>`
        : '';

    const descriptionParagraphHTML = product.description
        ? `<p>${product.description}</p>`
        : `<p>Experience the best with the ${product.title}. This premium product offers exceptional performance and value, backed by our comprehensive warranty. Perfect for both work and play, it's the smart choice for any tech enthusiast.</p>`;

    const colorOptionsHTML = product.colorsEnabled && product.colors && product.colors.length > 0
        ? `<div class="color-options"><h4>Available Colors:</h4><div class="color-swatches">${product.colors.map((color, idx) => `<button type="button" class="color-swatch ${idx === 0 ? 'selected' : ''}" data-color="${color}" style="background-color: ${color.toLowerCase()};" title="${color}" aria-label="Select ${color} color"></button>`).join('')}</div></div>`
        : '';
    
    const hasSizes = product.sizes && product.sizes.length > 0;
    const sizeOptionsHTML = hasSizes
        ? `<div class="size-options" style="margin: 1.5rem 0; padding: 1.2rem; background-color: var(--background-light); border-radius: 12px;">
            <h4 style="margin-bottom: 1rem;">Available Sizes:</h4>
            <div class="size-selectors" style="display: flex; gap: 10px; flex-wrap: wrap;">
                ${product.sizes.map((size, idx) => `
                    <button type="button" class="size-btn ${idx === 0 ? 'selected' : ''}" data-size="${size}" style="padding: 10px 15px; border: 2px solid var(--border-color); background: white; border-radius: 8px; cursor: pointer; font-weight: 600; min-width: 45px;">${size}</button>
                `).join('')}
            </div>
           </div>`
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
        } else {
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
    const isActuallyOnSale = savedAmount > 0;

    getAppRoot().innerHTML = `
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
                ${sizeOptionsHTML}

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
                
                <button class="add-to-cart-btn" id="btn-add-cart-detail" ${product.stock !== undefined && product.stock <= 0 ? 'disabled' : ''}>
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
    
    const backBtn = document.getElementById('back-to-products');
    if (backBtn) {
        backBtn.addEventListener('click', (e) => {
            e.preventDefault();
            try { sessionStorage.setItem('focusProduct', product.productId); } catch (err) {}
            history.back();
        });
    }

    const thumbnails = document.querySelectorAll('.thumbnail');
    thumbnails.forEach(thumb => {
        thumb.addEventListener('click', () => {
            document.getElementById('main-image').src = thumb.dataset.full;
            thumbnails.forEach(t => t.classList.remove('active'));
            thumb.classList.add('active');
        });
    });

    const colorSwatches = document.querySelectorAll('.color-swatch');
    colorSwatches.forEach(swatch => {
        swatch.addEventListener('click', (e) => {
            e.preventDefault();
            colorSwatches.forEach(s => s.classList.remove('selected'));
            swatch.classList.add('selected');
        });
    });

    const sizeBtns = document.querySelectorAll('.size-btn');
    sizeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            sizeBtns.forEach(b => {
                b.classList.remove('selected');
                b.style.borderColor = 'var(--border-color)';
                b.style.color = 'var(--text-dark)';
                b.style.backgroundColor = 'white';
            });
            btn.classList.add('selected');
            btn.style.borderColor = 'var(--corporate-blue)';
            btn.style.color = 'var(--white)';
            btn.style.backgroundColor = 'var(--corporate-blue)';
        });
    });
    if(sizeBtns.length > 0) {
        const firstBtn = sizeBtns[0];
        firstBtn.classList.add('selected');
        firstBtn.style.borderColor = 'var(--corporate-blue)';
        firstBtn.style.color = 'var(--white)';
        firstBtn.style.backgroundColor = 'var(--corporate-blue)';
    }

    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            tabButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
            document.getElementById(button.dataset.tab).classList.add('active');
        });
    });

    const addToCartBtn = document.getElementById('btn-add-cart-detail');
    if (addToCartBtn) {
        addToCartBtn.addEventListener('click', () => {
            const selectedColorEl = document.querySelector('.color-swatch.selected');
            const selectedSizeEl = document.querySelector('.size-btn.selected');
            
            const color = selectedColorEl ? selectedColorEl.dataset.color : null;
            const size = selectedSizeEl ? selectedSizeEl.dataset.size : null;

            if (product.colors && product.colors.length > 0 && !color) {
                alert('Please select a color.');
                return;
            }
            if (product.sizes && product.sizes.length > 0 && !size) {
                alert('Please select a size.');
                return;
            }

            CartManager.addItem(product.productId, 1, color, size);
        });
    }

    try {
        const viewerResponse = await fetch(`/api/products/${product.productId}/viewers`);
        if (viewerResponse.ok) {
            const viewerData = await viewerResponse.json();
            const viewerDisplay = document.getElementById('image-viewer-count');
            if (viewerDisplay && viewerData && viewerData.viewerCount !== undefined && viewerData.viewerCount !== null) {
                
                // --- LIVE FLUCTUATION LOGIC ---
                // Start with the actual count from DB (seeded by Admin)
                let currentViewers = viewerData.viewerCount;
                const baseCount = currentViewers; // Keep reference to base to prevent drifting too far

                // Function to update the display
                const updateDisplay = (count) => {
                    const label = count === 1 ? 'person viewing' : 'people viewing';
                    viewerDisplay.innerHTML = `<i class="fas fa-eye"></i> ${count} ${label}`;
                    viewerDisplay.style.display = 'flex';
                };

                // Initial display
                updateDisplay(currentViewers);

                // Start fluctuating interval
                if (liveViewerInterval) clearInterval(liveViewerInterval);
                
                liveViewerInterval = setInterval(() => {
                    // Randomly decide to increase or decrease
                    const change = Math.floor(Math.random() * 3) + 1; // Change by 1, 2, or 3
                    const increase = Math.random() > 0.5;

                    if (increase) {
                        currentViewers += change;
                    } else {
                        currentViewers -= change;
                    }

                    // Bounds checking:
                    // 1. Don't go below 1
                    if (currentViewers < 1) currentViewers = 1;
                    
                    // 2. Don't drift too far from reality (e.g. +/- 50% or +15 max)
                    // If base is 0 (no viewers), simulated traffic might jump to 1-3 but shouldn't go to 100.
                    const maxAllowed = Math.max(baseCount * 1.5, baseCount + 15);
                    if (currentViewers > maxAllowed) currentViewers = Math.floor(maxAllowed);

                    updateDisplay(currentViewers);
                }, 4000); // Update every 4 seconds
            }
        }
    } catch (err) {
        console.warn('Could not fetch viewer count', err);
    }
    
    startLiveTimerUpdates();
};

export const renderCartPage = (detailedCartItems) => {
    const validItems = Array.isArray(detailedCartItems) 
        ? detailedCartItems.filter(item => item && item.productId && typeof item.currentPrice === 'number') 
        : [];

    let subtotal = 0;
    const itemsHTML = validItems.length > 0 ? validItems.map(item => {
        const itemTotal = item.currentPrice * item.quantity;
        subtotal += itemTotal;
        const savedPerUnit = (item.oldPrice || 0) - (item.currentPrice || 0);
        const savedAmount = savedPerUnit > 0 ? savedPerUnit * item.quantity : 0;
        const isActuallyOnSale = savedAmount > 0;
        const stockInfo = item.stock !== undefined ? `<span class="cart-item-stock in-stock">${item.stock} left</span>` : '';
        const colorDisplay = item.selectedColor ? `<div style="display: flex; align-items: center; gap: 8px; margin-top: 5px;"><span style="font-size: 0.85rem; color: #666;">Color:</span><div style="width: 20px; height: 20px; border-radius: 50%; border: 1px solid #ddd; background-color: ${item.selectedColor.toLowerCase()}; cursor: help;" title="${item.selectedColor}"></div><span style="font-size: 0.85rem; font-weight: 500;">${item.selectedColor}</span></div>` : '';
        const sizeDisplay = item.selectedSize ? `<div style="margin-top: 2px; font-size: 0.85rem; color: #666;">Size: <strong>${item.selectedSize}</strong></div>` : '';

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
                    ${sizeDisplay}
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

    getAppRoot().innerHTML = `
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
                    ${validItems.length > 0 ? `<a href="#checkout" class="btn btn-primary">Proceed to Checkout →</a>` : ''}
                </div>
            </div>
        </div>`;
    
    getAppRoot().addEventListener('click', async (e) => {
        const quantityBtn = e.target.closest('.quantity-change');
        if (quantityBtn) {
            e.preventDefault();
            const productId = quantityBtn.dataset.id;
            const change = parseInt(quantityBtn.dataset.change);
            const currentItem = validItems.find(item => item.productId === productId);
            if (currentItem) {
                const newQuantity = currentItem.quantity + change;
                if (newQuantity > 0) {
                    CartManager.updateQuantity(productId, newQuantity);
                    const cartItem = document.querySelector(`[data-product-id="${productId}"]`);
                    if (cartItem) {
                        const quantityDisplay = cartItem.querySelector('.quantity-display');
                        const newItemTotal = currentItem.currentPrice * newQuantity;
                        quantityDisplay.textContent = newQuantity;
                        const itemPriceText = cartItem.querySelector('.cart-item-details > div:nth-child(2)');
                        if (itemPriceText) {
                            itemPriceText.innerHTML = `${formatCurrency(currentItem.currentPrice)} x ${newQuantity} = <strong>${formatCurrency(newItemTotal)}</strong>`;
                        }
                        updateCartSummary(validItems);
                    }
                    currentItem.quantity = newQuantity;
                } else {
                    CartManager.removeItem(productId);
                    const cartItem = document.querySelector(`[data-product-id="${productId}"]`);
                    if (cartItem) {
                        cartItem.remove();
                        const updatedItems = validItems.filter(item => item.productId !== productId);
                        if (updatedItems.length === 0) {
                            const cartSection = document.querySelector('.cart-section');
                            if (cartSection) {
                                cartSection.innerHTML = '<p>Your cart is empty.</p><div class="action-buttons"><a href="#home" class="btn btn-outline">← Continue Shopping</a></div>';
                            }
                        } else {
                            updateCartSummary(updatedItems);
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
                const cartItem = document.querySelector(`[data-product-id="${productId}"]`);
                if (cartItem) {
                    cartItem.remove();
                    const updatedItems = validItems.filter(item => item.productId !== productId);
                    if (updatedItems.length === 0) {
                        const cartSection = document.querySelector('.cart-section');
                        if (cartSection) {
                            cartSection.innerHTML = '<p>Your cart is empty.</p><div class="action-buttons"><a href="#home" class="btn btn-outline">← Continue Shopping</a></div>';
                        }
                    } else {
                        updateCartSummary(updatedItems);
                    }
                }
            }
        }
    });
};

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

    getAppRoot().innerHTML = `
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

        try {
            sessionStorage.setItem('pendingOrder', JSON.stringify(pendingOrder));
            location.hash = '#payment';
        } catch (err) {
            console.error('Could not prepare payment options:', err);
            alert('Could not proceed to payment. Please try again.');
        }
    });
};

export const renderPaymentOptionsPage = () => {
    const pending = sessionStorage.getItem('pendingOrder');
    if (!pending) {
        location.hash = '#checkout';
        return;
    }

    getAppRoot().innerHTML = `
        <div class="page-hero-header" style="background-image: linear-gradient(rgba(0,0,0,0.25), rgba(0,0,0,0.25)), url('https://images.unsplash.com/photo-1542223616-4a4b2f9b4b9f?auto=format&fit=crop&w=1350&q=80')"><h1>Choose Payment Method</h1></div>
        <div class="page-container" style="max-width: 900px; margin-top: 2rem;">
            <p style="text-align: center; font-size: 1.1rem; color: var(--text-light); margin-bottom: 2.5rem;">Please choose how you'd like to complete your order. Your transaction will be finalized on the next step.</p>
            <div class="payment-options-grid">
                <a href="#payment/eft" class="payment-option-card">
                    <div class="icon-wrapper"><i class="fas fa-university"></i></div>
                    <h3>Direct Bank Transfer (EFT)</h3>
                    <p>Pay securely from your bank account.</p>
                </a>
                <a href="#payment/ewallet" class="payment-option-card">
                    <div class="icon-wrapper"><i class="fas fa-wallet"></i></div>
                    <h3>E-Wallet or Blue Wallet</h3>
                    <p>Use your preferred mobile wallet app.</p>
                </a>
                <a href="#payment/layby" class="payment-option-card">
                    <div class="icon-wrapper"><i class="fas fa-calendar-alt"></i></div>
                    <h3>Lay-by</h3>
                    <p>Pay over 3 months, interest-free.</p>
                </a>
                <a href="#payment/tradein" class="payment-option-card">
                    <div class="icon-wrapper"><i class="fas fa-exchange-alt"></i></div>
                    <h3>Trade-in Credit</h3>
                    <p>Apply credit from your old device.</p>
                </a>
            </div>
        </div>
    `;
};

// --- RENDER PAYMENT METHOD PAGE (With Carousel) ---

export const renderPaymentMethodPage = async (method) => {
    const pending = sessionStorage.getItem('pendingOrder');
    if (!pending) { location.hash = '#checkout'; return; }
    const order = JSON.parse(pending);

    const methodMap = {
        eft: { title: 'Direct Bank Transfer (EFT)', icon: 'fas fa-university' },
        ewallet: { title: 'E-Wallet / Blue Wallet', icon: 'fas fa-wallet' },
        layby: { title: 'Lay-by', icon: 'fas fa-calendar-alt' },
        tradein: { title: 'Trade-in Credit', icon: 'fas fa-exchange-alt' },
    };

    const info = methodMap[method] || { title: method, icon: 'fas fa-credit-card' };

    let instructionsHTML = '';
    if (method === 'eft') {
        instructionsHTML = `
            <h4>How to Pay via EFT</h4>
            <p>Use the bank details below and email your proof of payment to payments@namkuku.com.</p>
            <ul class="payment-details-list">
                <li><strong>Bank:</strong> <span>FNB Namibia</span></li>
                <li><strong>Account Name:</strong> <span>NamKuku Tech</span></li>
                <li><strong>Account Number:</strong> <span class="monospaced">62201234567</span></li>
                <li><strong>Reference:</strong> <span class="highlight-ref">${order.customerName}</span></li>
            </ul>
            <p class="note-text">Once payment is confirmed we'll dispatch your order. usually takes 1-2 business days.</p>
        `;
    } else if (method === 'ewallet') {
        instructionsHTML = `
            <h4>Pay with E-Wallet</h4>
            <p>Transfer the total to the NamKuku merchant account using your preferred app.</p>
            <ul class="payment-details-list">
                <li><strong>Number:</strong> <span class="monospaced">081 123 4567</span></li>
                <li><strong>Ref:</strong> <span>${order.customerName}</span></li>
            </ul>
            <p class="note-text">Send a screenshot of the successful transfer to payments@namkuku.com to speed up processing.</p>
        `;
    } else if (method === 'layby') {
        instructionsHTML = `
            <h4>Lay-by Instructions</h4>
            <p>To arrange a Lay-by, we require a 20% deposit.</p>
            <ul class="payment-details-list">
                <li><strong>Deposit:</strong> <span>${formatCurrency(order.totalAmount * 0.2)}</span></li>
                <li><strong>Balance:</strong> <span>${formatCurrency(order.totalAmount * 0.8)}</span></li>
            </ul>
            <p class="note-text">Contact sales@namkuku.com or call us to finalize your payment plan.</p>
        `;
    } else if (method === 'tradein') {
        instructionsHTML = `
            <h4>Apply Trade-in Credit</h4>
            <p>Use our Trade-in flow to value your old device. Once accepted, credit is applied.</p>
            <p class="note-text">Complete the trade-in submission and then press Complete Order to confirm.</p>
        `;
    } else {
        instructionsHTML = `<p>Instructions for ${info.title} will be provided here.</p>`;
    }

    // --- CAROUSEL LOGIC ---
    let carouselHTML = '';
    
    // REQUEST: Only display on the first two (EFT and E-Wallet)
    if (method === 'eft' || method === 'ewallet') {
        const defaultPaymentCarouselImages = [
            'https://images.unsplash.com/photo-1542223616-4a4b2f9b4b9f?auto=format&fit=crop&w=400&q=80',
            'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=400&q=80',
            'https://images.unsplash.com/photo-1523206489230-c012c64b2b48?auto=format&fit=crop&w=400&q=80',
            'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=400&q=80'
        ];

        try {
            const settingsArr = await api.fetchSettings();
            const settingsMap = {};
            if (Array.isArray(settingsArr)) {
                settingsArr.forEach(s => settingsMap[s.key] = s.value);
            }

            const uploadedImages = [1, 2, 3, 4]
                .map(i => settingsMap[`payment_carousel_${i}`])
                .filter(url => url && url.length > 0);

            // Use uploaded images if available, otherwise use defaults
            const displayImages = uploadedImages.length > 0 ? uploadedImages : defaultPaymentCarouselImages;

            if (displayImages.length > 0) {
                carouselHTML = `
                    <div class="payment-carousel-container" style="margin-top: 3rem; border-top: 1px solid #eee; padding-top: 2rem;">
                        <div class="carousel-wrapper">
                            <div class="home-category-carousel" style="justify-content: center; flex-wrap: wrap; gap: 15px; padding: 0;">
                                ${displayImages.map(img => `
                                    <div class="item" style="background-image: url('${img}'); flex: 0 0 200px; height: 150px; background-size: cover; background-position: center; border-radius: 8px; box-shadow: var(--shadow-soft);"></div>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                `;
            }
        } catch (err) {
            console.warn("Failed to load payment carousel images", err);
            // Fallback if API fails completely
            carouselHTML = `
                <div class="payment-carousel-container" style="margin-top: 3rem; border-top: 1px solid #eee; padding-top: 2rem;">
                    <div class="carousel-wrapper">
                        <div class="home-category-carousel" style="justify-content: center; flex-wrap: wrap; gap: 15px; padding: 0;">
                            ${defaultPaymentCarouselImages.map(img => `
                                <div class="item" style="background-image: url('${img}'); flex: 0 0 200px; height: 150px; background-size: cover; background-position: center; border-radius: 8px; box-shadow: var(--shadow-soft);"></div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            `;
        }
    }

    getAppRoot().innerHTML = `
        <div class="page-hero-header payment-hero" style="background-image: linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url('https://images.unsplash.com/photo-1581091012184-7f8f0e6f8f3f?auto=format&fit=crop&w=1350&q=80')">
            <h1>${info.title}</h1>
        </div>
        <div class="page-container payment-method-wrapper">
            <div class="payment-detail">
                <div class="payment-summary">
                    <span class="label">Order Total</span>
                    <span class="amount">${formatCurrency(order.totalAmount)}</span>
                </div>
                
                <div class="payment-instructions-body">
                    ${instructionsHTML}
                </div>

                <div class="payment-actions">
                    <button id="complete-order-btn" class="btn btn-primary">Complete Order</button>
                    <a href="#payment" class="btn btn-outline">Back</a>
                </div>

                ${carouselHTML}
            </div>
        </div>
    `;

    document.getElementById('complete-order-btn').addEventListener('click', async () => {
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

export const renderAdminLoginPage = () => {
    getAppRoot().innerHTML = `
        <div class="page-container" style="max-width: 500px; margin-top: 3rem;">
            <div style="background: var(--white); padding: 2.5rem; border-radius: var(--border-radius); box-shadow: var(--shadow-medium);">
                <h1 style="text-align: center; color: var(--corporate-blue); margin-bottom: 2rem;">Admin / Seller Portal</h1>
                <form id="admin-login-form">
                    <div class="form-group">
                        <label for="email">Email Address</label>
                        <input type="email" id="email" name="email" required autocomplete="email">
                    </div>
                    <div class="form-group">
                        <label for="password">Password</label>
                        <input type="password" id="password" name="password" required autocomplete="current-password">
                    </div>
                    <div id="admin-login-message" class="form-message error" style="text-align: center;"></div>
                    <button type="submit" class="btn btn-primary" style="width: 100%; margin-top: 1rem; padding: 15px;">Sign In</button>
                </form>
            </div>
        </div>
    `;
    const msgEl = document.getElementById('admin-login-message');
    if (msgEl) {
        msgEl.textContent = '';
    }
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
            <button class="admin-tab-btn" data-tab="page-settings">Page Settings</button>
            <button class="admin-tab-btn" data-tab="simulate-views">Simulate Views</button>
        ` : ''}
    `;

    // Render checkbox options for sizes (replacing the old select)
    const sizeCheckboxesHTML = STANDARD_SIZES.map(size => `
        <label class="size-checkbox-item" style="cursor: pointer; user-select: none; display: inline-flex; align-items: center; margin: 4px;">
            <input type="checkbox" class="size-checkbox-input" value="${size}" style="display:none;">
            <span class="size-chip" style="padding: 6px 12px; border: 1px solid #ccc; border-radius: 20px; display: inline-block; transition: all 0.2s; font-size: 0.9rem;">${size}</span>
        </label>
    `).join('');

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
        sellerListHTML = `<li style="padding: 15px; border-bottom: 1px solid #eee; color:#666;">No reseller accounts found.</li>`;
    } else {
        sellerListHTML = sellerAccounts.map(u => {
            const isApproved = u.isApproved === true;
            const isPending = u.isApproved === false;
            let statusBadge;

            if (isApproved) {
                statusBadge = `<span class="status-badge" style="background: #e6ffed; color: #065f46; padding: 4px 8px; border-radius: 4px; font-size: 0.8rem; font-weight: bold;">Active</span>`;
            } else if (isPending) {
                statusBadge = `<span class="status-badge" style="background: #fff5f5; color: #c53030; padding: 4px 8px; border-radius: 4px; font-size: 0.8rem; font-weight: bold;">Pending Approval</span>`;
            } else {
                statusBadge = `<span class="status-badge" style="background: #e0e0e0; color: #333; padding: 4px 8px; border-radius: 4px; font-size: 0.8rem; font-weight: bold;">Deactivated</span>`;
            }

            const approvalControl = `
                <label class="verify-switch switch" title="${isApproved ? 'Deactivate' : 'Approve'} Account">
                    <input type="checkbox" class="seller-approve-toggle" data-user-id="${u._id}" ${isApproved ? 'checked' : ''}>
                    <span class="slider round"></span>
                </label>
            `;

            return `<li style="padding: 15px; border-bottom: 1px solid #eee; display:flex; justify-content:space-between; align-items:center;" class="seller-account-item">
                <div class="user-info">
                    <div style="font-weight: 600; display:flex; align-items:center; gap:10px;">${u.name} ${statusBadge}</div>
                    <span style="font-size: 0.9rem; color: #666;">${u.email} | Type: <strong>${u.sellerType}</strong></span>
                </div>
                <div class="actions" style="display:flex; gap:20px; align-items:center;">
                    ${approvalControl}
                    <button type="button" class="view-seller-btn" data-seller-email="${u.email}" style="background: none; border: none; color: var(--corporate-blue); cursor: pointer;" title="Impersonate Seller"><i class="fas fa-sign-in-alt"></i></button>
                    <a class="seller-dashboard-link" href="#admin/seller/${encodeURIComponent(u.email)}" target="_blank" rel="noopener noreferrer" style="color:var(--corporate-blue); text-decoration:none;" title="Open in New Tab"><i class="fas fa-external-link-alt"></i></a>
                    <button class="delete-user-btn" data-user-id="${u._id}" style="color: var(--danger-red); background:none; border:none; cursor:pointer;" title="Delete User"><i class="fas fa-trash"></i></button>
                </div>
            </li>`;
        }).join('');
    }

    const viewerListHTML = (allViewers || []).flatMap(p => {
        const reviewsByViewerId = {};
        (p.reviews || []).forEach(r => { if (r.viewerId) reviewsByViewerId[r.viewerId.toString()] = r; });
        return (p.viewers || []).map(v => {
            const viewerName = v.name ? v.name : 'Anonymous';
            const review = reviewsByViewerId[v._id.toString()];
            const hasReview = !!review;
            const reviewStatus = hasReview ? `<span style="color: var(--success-green); font-weight: 600; display:flex; align-items:center; gap: 5px;"><i class="fas fa-check-circle"></i> Review Added</span>` : '';
            const reviewDetails = hasReview ? `<div class="review-details" style="margin-top:4px; font-size:0.95em; color:#444; background:#f8f8f8; padding:6px 10px; border-radius:6px;"><strong>Review:</strong> ${review.text}<br/><strong>Rating:</strong> ${review.rating} ★</div>` : '';
            return `<li><div class="viewer-info">${p.title}<span>${viewerName}</span><span>Viewed At: ${new Date(v.viewedAt).toLocaleString()}</span></div><div class="actions" style="display:flex; align-items:center; gap: 15px; flex-direction:column; align-items:flex-start;">${reviewStatus}${reviewDetails}<button class="delete-btn" data-product-id="${p._id}" data-viewer-id="${v._id}"><i class="fas fa-trash"></i> Delete</button></div></li>`;
        });
    }).join('') || "<li>No viewers found.</li>";
    
    const relevantTransactions = isMainAdmin ? allTransactions : allTransactions.filter(transaction => transaction.items.some(item => { const product = allProducts.find(p => p.productId === item.productId); return product && (product.category === mappedSellerCategory || (categoryData[product.category] && categoryData[product.category].parent === mappedSellerCategory)); }));

    const faqListHTML = allFAQs.map(faq => `<li><div class="faq-info"><strong>Q:</strong> ${faq.question}<p style="margin-left: 20px; color: #555;"><strong>A:</strong> ${faq.answer}</p></div><div class="actions"><button class="edit-faq-btn" data-faq-id="${faq._id}"><i class="fas fa-edit"></i> Edit</button><button class="delete-faq-btn" data-faq-id="${faq._id}"><i class="fas fa-trash"></i> Delete</button></div></li>`).join('');

    const transactionsListHTML = (relevantTransactions || []).length > 0 ? (() => {
        const totalRevenue = (relevantTransactions || []).reduce((sum, t) => sum + (t.totalAmount || 0), 0);
        return `<table class="transactions-table" style="width: 100%; border-collapse: collapse; margin-top: 15px;"><thead><tr style="background-color: #f0f0f0; border-bottom: 2px solid var(--border-color);"><th style="padding: 10px; text-align: left; border: 1px solid var(--border-color);">Customer</th><th style="padding: 10px; text-align: left; border: 1px solid var(--border-color);">Email</th><th style="padding: 10px; text-align: right; border: 1px solid var(--border-color);">Total</th><th style="padding: 10px; text-align: left; border: 1px solid var(--border-color);">Date</th><th style="padding: 10px; text-align: center; border: 1px solid var(--border-color);">Details</th><th style="padding: 10px; text-align: center; border: 1px solid var(--border-color);">Verified</th></tr></thead><tbody>${(relevantTransactions || []).map((t, idx) => `<tr class="transaction-row ${t.verified ? 'verified' : ''}" data-transaction-id="${t._id}"><td style="padding: 10px; border: 1px solid var(--border-color);">${t.customerName || 'N/A'}</td><td style="padding: 10px; border: 1px solid var(--border-color);">${t.customerEmail || 'N/A'}</td><td style="padding: 10px; border: 1px solid var(--border-color); text-align: right;"><strong>${formatCurrency(t.totalAmount || 0)}</strong></td><td style="padding: 10px; border: 1px solid var(--border-color);">${t.createdAt ? new Date(t.createdAt).toLocaleDateString() : 'N/A'}</td><td style="padding: 10px; border: 1px solid var(--border-color); text-align: center;"><button class="view-transaction-btn" data-index="${idx}" style="padding: 6px 12px; background-color: var(--corporate-blue); color: white; border: none; border-radius: 4px; cursor: pointer;"><i class="fas fa-eye"></i></button></td><td style="padding: 10px; border: 1px solid var(--border-color); text-align: center;"><label class="verify-switch switch"><input type="checkbox" class="verify-switch" ${t.verified ? 'checked' : ''}><span class="slider round"></span></label></td></tr>`).join('')}</tbody><tfoot><tr style="background-color: #f0f0f0; border-top: 2px solid var(--border-color); font-weight: bold;"><td colspan="2" style="padding: 15px 10px; border: 1px solid var(--border-color); text-align: right;"><strong>TOTAL REVENUE:</strong></td><td style="padding: 15px 10px; border: 1px solid var(--border-color); text-align: right; background-color: #c8e6c9;"><strong style="color: #1b5e20; font-size: 1.1rem;">${formatCurrency(totalRevenue)}</strong></td><td colspan="3" style="padding: 15px 10px; border: 1px solid var(--border-color);"></td></tr></tfoot></table>`;
    })() : '<p>No transactions yet.</p>';
    
    const productOptions = allProducts.map(p => `<option value="${p.productId}">${p.title}</option>`).join('');
    
    const backToAdminButton = sessionStorage.getItem('mainAdminInfo') 
        ? `<button id="back-to-main-admin" class="btn btn-primary" style="margin-bottom: 1rem; background-color: var(--corporate-gold); color: #333;"><i class="fas fa-arrow-left"></i> Return to Main Admin Dashboard</button>` 
        : '';

    getAppRoot().innerHTML = `
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
                            ${isMainAdmin ? `
                            <div id="ai-image-section" style="margin-top:1.5rem; padding:1rem; background-color:#f0f7ff; border-radius:8px; border-left:4px solid var(--corporate-blue); grid-column: 1 / -1;">
                                <h3 style="margin-top:0; margin-bottom:1rem; color:var(--corporate-blue);">🤖 AI-Powered Image Search</h3>
                                <p style="margin:0.5rem 0 0.5rem 0; font-size:0.9rem; color:#666;">Enter a title and click search to find product images.</p>
                                <button type="button" id="ai-search-images-btn" style="padding:8px 16px; background-color:var(--corporate-blue); color:white; border:none; border-radius:4px; cursor:pointer; font-weight:600;">Search Images from Title</button>
                                <div id="ai-images-status" style="margin-top:10px; font-size:0.9rem; color:#666; min-height: 20px;"></div>
                            </div>
                            ` : ''}
                            <div class="form-group"><label for="product-currentPrice">Current Price</label><input type="number" id="product-currentPrice" required></div>
                            <div class="form-group"><label for="product-oldPrice">Old Price</label><input type="number" id="product-oldPrice" required></div>
                            <div class="form-group"><label for="product-category">Category</label><input type="text" id="product-category" value="${isMainAdmin ? '' : mappedSellerCategory}" ${!isMainAdmin ? 'readonly' : ''} required></div>
                            <div class="form-group" id="product-image-url-group"><label for="product-image">Main Image URL (Optional if uploading)</label><input type="text" id="product-image"></div>
                            <div id="carousel-image-urls" class="form-group full-width">
                                <label>Carousel Image URLs (up to 4)</label>
                                <div class="form-grid">
                                    <input type="text" id="carousel-url-1" placeholder="Carousel Image 1 URL">
                                    <input type="text" id="carousel-url-2" placeholder="Carousel Image 2 URL">
                                    <input type="text" id="carousel-url-3" placeholder="Carousel Image 3 URL">
                                    <input type="text" id="carousel-url-4" placeholder="Carousel Image 4 URL">
                                </div>
                            </div>
                            <div class="form-group"><label for="product-description">Description</label><textarea id="product-description" placeholder="Enter product description (optional - AI will generate if blank)" rows="4"></textarea><div id="ai-desc-status" style="font-size:0.85rem; margin-top:5px; font-style:italic;"></div></div>
                            <div class="form-group" id="product-images-upload-group"><label id="product-images-label">Or Upload up to 3 images</label><input type="file" id="product-images" accept="image/*" multiple></div>
                            <div id="product-images-preview" class="images-preview" style="display:flex; gap:8px; margin-top:8px;"></div>
                            <input type="hidden" id="product-thumbnails-hidden">
                            <div class="form-group"><label>Track Stock?</label><input type="checkbox" id="product-stockToggle"></div>
                            <div class="form-group" id="stock-field-group" style="display: none;"><label for="product-stock">Stock Amount</label><input type="number" id="product-stock" value="10" min="0" step="1"></div>
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
                            
                            <!-- CLOTHING SIZE SECTION -->
                            ${isClothesAdmin ? `
                            <div id="clothing-size-section" style="margin-top: 1.5rem; padding: 1rem; background-color: #f9f9f9; border-radius: 8px;">
                                <label style="display:block; margin-bottom: 10px; font-weight: 600;">Available Clothing Sizes (Click to select multiple)</label>
                                <div id="size-checkbox-container" style="display: flex; flex-wrap: wrap; gap: 5px;">
                                    ${sizeCheckboxesHTML}
                                </div>
                                <select id="product-sizes-select" multiple class="admin-input" style="display:none;">
                                    ${STANDARD_SIZES.map(size => `<option value="${size}">${size}</option>`).join('')}
                                </select>
                            </div>
                            ` : ''}

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
                                <input type="number" id="product-comboSalePrice">
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
                        
                        <h3 style="margin-top: 1rem;">Payment Success Page Carousel</h3>
                        <div style="margin-bottom: 1rem;">Images to show on the confirmation page after selecting payment method (1 to 4 images).</div>
                        <div class="form-grid">
                            ${[1,2,3,4].map(i => `
                                <div class="form-group">
                                    <label for="payment-carousel-url-${i}">Image ${i} URL</label>
                                    <input type="text" id="payment-carousel-url-${i}" name="payment_carousel_${i}" placeholder="Image URL" value="${(settings && Array.isArray(settings) ? (settings.find(s=>s.key==='payment_carousel_' + i)?.value || '') : '')}">
                                    <label for="payment-carousel-file-${i}">Or upload file</label>
                                    <input type="file" id="payment-carousel-file-${i}" accept="image/*">
                                </div>
                            `).join('')}
                        </div>

                        <div style="margin-top: 1rem;"><button class="btn btn-primary" type="submit">Save Site Settings</button></div>
                    </form>
                </section></div>
                <div id="page-settings" class="admin-tab-content">
                    <section class="admin-section">
                        <h2>Page-Specific Images</h2>
                        <form id="page-settings-form">
                            <h3>About Us Page Image</h3>
                            <div class="form-group">
                                <label for="about-us-image-file">Upload New Image</label>
                                <input type="file" id="about-us-image-file-tab" accept="image/*">
                                <p style="font-size: 0.9rem; color: #666; margin-top: 5px;">Current Image:</p>
                                <img id="about-us-image-preview-tab" src="${(settings && Array.isArray(settings) ? (settings.find(s => s.key === 'about_us_image')?.value || 'https://via.placeholder.com/150') : 'https://via.placeholder.com/150')}" alt="About Us Preview" style="width: 200px; height: auto; margin-top: 10px; border-radius: 8px; border: 1px solid #ddd;">
                            </div>
                            <button type="submit" class="btn btn-primary">Save Page Settings</button>
                        </form>
                    </section>
                </div>
                <div id="simulate-views" class="admin-tab-content">
                    <section class="admin-section">
                        <h2>One-Month Traffic Simulation</h2>
                        <p>This tool will simulate one month of user traffic based on predefined personas and peak times. It will create "viewer" entries for various products to make the site look more active. This process can take a minute to complete.</p>
                        <button id="start-simulation-btn" class="btn btn-primary">Start One-Month Simulation</button>
                        <div id="simulation-log" style="margin-top: 20px; background: #f0f0f0; border: 1px solid #ccc; border-radius: 8px; padding: 15px; height: 300px; overflow-y: auto; font-family: monospace; white-space: pre-wrap;">Simulation log will appear here...</div>
                    </section>
                </div>
            ` : ''}
        </div>`;
    
    attachAdminEventListeners(isMainAdmin, allProducts, relevantTransactions, allFAQs);
    if (isMainAdmin) {
        initAdminViewers();
    }
};

const attachAdminEventListeners = (isMainAdmin, allProducts, relevantTransactions, allFAQs) => {
    const adminContainer = document.querySelector('.admin-container');
    if (!adminContainer) return;

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
    let selectedComboProducts = [];

    const resetForm = () => {
        productForm.reset();
        document.getElementById('product-id-hidden').value = '';
        const categoryInput = document.getElementById('product-category');
        if (!isMainAdmin) {
            const st = getSellerType();
            const map = { 'clothes': 'clothing', 'cloth': 'clothing', 'furnitures': 'furniture', 'furniture': 'furniture', 'kids': 'kids' };
            categoryInput.value = map[st] || st || '';
        }
        
        const stockToggle = document.getElementById('product-stockToggle');
        const stockFieldGroup = document.getElementById('stock-field-group');
        if (stockToggle) stockToggle.checked = false;
        if (stockFieldGroup) stockFieldGroup.style.display = 'none';

        const saleDatesSection = document.getElementById('sale-dates-section');
        if (saleDatesSection) {
            saleDatesSection.style.display = 'none';
        }
        document.getElementById('product-saleStartDate').value = '';
        document.getElementById('product-saleEndDate').value = '';
        const imagesPreview = document.getElementById('product-images-preview');
        if (imagesPreview) imagesPreview.innerHTML = '';
        const thumbsHidden = document.getElementById('product-thumbnails-hidden');
        if (thumbsHidden) thumbsHidden.value = '';
        const curatedIds = [
            'product-curate-womens', 'product-curate-mens', 'product-curate-livingroom', 'product-curate-bedroom',
            'product-curate-office', 'product-curate-kitchen', 'product-curate-kids-electronics',
            'product-curate-kids-clothing', 'product-curate-kids-toys'
        ];
        curatedIds.forEach(id => { const el = document.getElementById(id); if (el) el.checked = false; });
        
        ['product-filter-tops','product-filter-bottoms','product-filter-official','product-filter-traditional','product-filter-shoes','product-filter-accessories','product-filter-furniture','product-filter-appliances'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.checked = false;
        });
        ['product-color-1', 'product-color-2', 'product-color-3'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.value = '';
        });
        const colorsPreview = document.getElementById('product-colors-preview');
        if (colorsPreview) colorsPreview.innerHTML = '';
        const enableColorsToggle = document.getElementById('enable-product-colors');
        const colorsSection = document.getElementById('product-colors-section');
        if (enableColorsToggle) {
            enableColorsToggle.checked = false;
        }
        if (colorsSection) {
            colorsSection.style.display = 'none';
        }
        for (let i = 1; i <= 4; i++) {
            const input = document.getElementById(`carousel-url-${i}`);
            if (input) input.value = '';
        }
    
        const aiImagesStatus = document.getElementById('ai-images-status');
        if (aiImagesStatus) aiImagesStatus.textContent = '';
        const featuresContainer = document.getElementById('product-features-container');
        if (featuresContainer) {
            featuresContainer.innerHTML = '<p style="font-size:0.9rem; color:#999; margin:0;">No features yet. Generate some using the button below.</p>';
        }
        const aiStatusDiv = document.getElementById('ai-features-status');
        if (aiStatusDiv) {
            aiStatusDiv.textContent = '';
            aiStatusDiv.style.display = 'none';
        }
        const descEl = document.getElementById('product-description');
        if (descEl) descEl.value = '';
        const aiDescStatus = document.getElementById('ai-desc-status');
        if (aiDescStatus) aiDescStatus.textContent = '';

        // Reset the size checkboxes
        const sizeCheckboxes = document.querySelectorAll('.size-checkbox-input');
        sizeCheckboxes.forEach(cb => {
            cb.checked = false;
            const span = cb.nextElementSibling;
            if(span) {
                span.style.backgroundColor = 'transparent';
                span.style.color = 'var(--text-dark)';
                span.style.borderColor = '#ccc';
            }
        });
        const hiddenSelect = document.getElementById('product-sizes-select');
        if(hiddenSelect) {
             Array.from(hiddenSelect.options).forEach(opt => opt.selected = false);
        }

        const validationMsg = document.getElementById('product-validation-msg');
        if (validationMsg) { validationMsg.textContent = ''; validationMsg.style.display = 'none'; }
        
        const comboToggle = document.getElementById('product-curate-combos');
        const comboSalePriceInput = document.getElementById('product-comboSalePrice');
        if (comboToggle) {
            comboToggle.checked = false;
            comboToggle.dispatchEvent(new Event('change'));
        }
        if (comboSalePriceInput) comboSalePriceInput.value = '';
        const giftCardToggle = document.getElementById('product-giftCardEnabled');
        const giftCardConfigSection = document.getElementById('gift-card-config-section');
        if(giftCardToggle) giftCardToggle.checked = false;
        if(giftCardConfigSection) giftCardConfigSection.style.display = 'none';
    };
    
    resetForm();

    document.getElementById('clear-form-btn').addEventListener('click', resetForm);
    
    document.getElementById('cancel-edit-btn').addEventListener('click', () => {
        document.getElementById('product-id-hidden').value = '';
        resetForm();
        document.getElementById('cancel-edit-btn').style.display = 'none';
        document.querySelector('form h3').textContent = 'Add New Product';
    });

    // --- NEW: Handle category input change for clothes products ---
    const categoryInput = document.getElementById('product-category');
    if (categoryInput) {
        categoryInput.addEventListener('input', () => {
            const isClothes = ['clothes', 'clothing', 'womens-clothes', 'mens-clothes'].includes(categoryInput.value.toLowerCase());
            const imageUrlGroup = document.getElementById('product-image-url-group');
            const carouselUrlGroup = document.getElementById('carousel-image-urls');
            const uploadLabel = document.getElementById('product-images-label');

            if (isClothes) {
                if (imageUrlGroup) imageUrlGroup.style.display = 'none';
                if (carouselUrlGroup) carouselUrlGroup.style.display = 'none';
                if (uploadLabel) uploadLabel.textContent = 'Upload up to 3 images (Required for new clothes products)';
            } else {
                if (imageUrlGroup) imageUrlGroup.style.display = '';
                if (carouselUrlGroup) carouselUrlGroup.style.display = '';
                if (uploadLabel) uploadLabel.textContent = 'Or Upload up to 3 images';
            }
        });
    }

    // Handle Size Checkbox Clicks and Sync with Hidden Select
    const sizeContainer = document.getElementById('size-checkbox-container');
    if (sizeContainer) {
        sizeContainer.addEventListener('change', (e) => {
            if (e.target.classList.contains('size-checkbox-input')) {
                const checkbox = e.target;
                const value = checkbox.value;
                const isChecked = checkbox.checked;
                
                // Update Visual Style
                const span = checkbox.nextElementSibling;
                if(span) {
                    if (isChecked) {
                        span.style.backgroundColor = 'var(--corporate-blue)';
                        span.style.color = 'white';
                        span.style.borderColor = 'var(--corporate-blue)';
                    } else {
                        span.style.backgroundColor = 'transparent';
                        span.style.color = 'var(--text-dark)';
                        span.style.borderColor = '#ccc';
                    }
                }

                // Sync with Hidden Select
                const hiddenSelect = document.getElementById('product-sizes-select');
                if (hiddenSelect) {
                    const option = Array.from(hiddenSelect.options).find(opt => opt.value === value);
                    if (option) {
                        option.selected = isChecked;
                    }
                }
            }
        });
    }

    const stockToggle = document.getElementById('product-stockToggle');
    const stockFieldGroup = document.getElementById('stock-field-group');
    if (stockToggle) {
        stockToggle.addEventListener('change', (e) => {
            if (e.target.checked) {
                stockFieldGroup.style.display = 'block';
            } else {
                stockFieldGroup.style.display = 'none';
            }
        });
    }

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
    
    const processNextImage = () => {
        if (currentImageIndex >= filesToProcess.length) {
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
    
    const showImageCropperModal = (imageSrc) => {
        const modal = document.getElementById('image-cropper-modal');
        const cropperImg = document.getElementById('cropper-image');
        const cropConfirmBtn = document.getElementById('crop-confirm-btn');
        const cropCancelBtn = document.getElementById('crop-cancel-btn');
        
        cropperImg.src = imageSrc;
        modal.classList.add('active');
        
        if (cropper) {
            cropper.destroy();
        }
        
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
        
        const handleCropCancel = () => {
            modal.classList.remove('active');
            cropConfirmBtn.removeEventListener('click', handleCropConfirm);
            cropCancelBtn.removeEventListener('click', handleCropCancel);
            
            filesToProcess = [];
            processedImages = [];
            currentImageIndex = 0;
            imagesInput.value = '';
        };
        
        cropConfirmBtn.addEventListener('click', handleCropConfirm);
        cropCancelBtn.addEventListener('click', handleCropCancel);
    };
    
    const onSaleToggle = document.getElementById('product-onSale');
    const saleDatesSection = document.getElementById('sale-dates-section');
    if (onSaleToggle && saleDatesSection) {
        onSaleToggle.addEventListener('change', (e) => {
            saleDatesSection.style.display = e.target.checked ? 'block' : 'none';
        });
    }

    const enableColorsToggle = document.getElementById('enable-product-colors');
    const colorsSection = document.getElementById('product-colors-section');
    if (enableColorsToggle && colorsSection) {
        enableColorsToggle.addEventListener('change', (e) => {
            colorsSection.style.display = e.target.checked ? 'block' : 'none';
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

    const featuresContainer = document.getElementById('product-features-container');
    const aiStatusDiv = document.getElementById('ai-features-status');
    const aiGenerateFeaturesBtn = document.getElementById('ai-generate-features-btn');
    const aiClearFeaturesBtn = document.getElementById('ai-clear-features-btn');

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
            removeBtn.onclick = (e) => { e.preventDefault(); featureDiv.remove(); };
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
            if (!isMainAdmin) return;
            if (aiGenerateFeaturesBtn) aiGenerateFeaturesBtn.disabled = true;
            setStatus('⏳ Generating features using Gemini AI...', false);
            const response = await fetch('/api/ai/generate-features', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
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

    if (aiClearFeaturesBtn) {
        aiClearFeaturesBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (featuresContainer) {
                featuresContainer.innerHTML = '<p style="font-size:0.9rem; color:#999; margin:0;">No features yet. Generate some using the button below.</p>';
            }
            setStatus('');
        });
    }

    const productTitleInput = document.getElementById('product-title');
    const descriptionInput = document.getElementById('product-description');
    const aiDescStatus = document.getElementById('ai-desc-status');
    const aiFeaturesStatus = document.getElementById('ai-features-status'); 
    
    let autoGenTimer;

    if (productTitleInput) {
        productTitleInput.addEventListener('input', (e) => {
            const titleValue = e.target.value.trim();
            
            if (autoGenTimer) clearTimeout(autoGenTimer);

            if (titleValue.length < 5) {
                 if(aiDescStatus) aiDescStatus.textContent = '';
                 return;
            }

            if (aiDescStatus && (!descriptionInput.value || descriptionInput.dataset.autoGenerated)) {
                aiDescStatus.textContent = 'Typing...';
                aiDescStatus.style.color = '#666';
            }

            autoGenTimer = setTimeout(async () => {
                if (!isMainAdmin) {
                    console.log('AI Auto-generation skipped: Not Main Admin');
                    return;
                }

                console.log('⚡ Triggering AI Auto-generation for:', titleValue);

                if (descriptionInput && (descriptionInput.value.trim() === '' || descriptionInput.dataset.autoGenerated === "true")) {
                    if(aiDescStatus) {
                        aiDescStatus.textContent = '✨ Generating unique description...';
                        aiDescStatus.style.color = 'var(--corporate-blue)';
                    }

                    try {
                        const res = await fetch('/api/ai/generate-description', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ title: titleValue })
                        });
                        const data = await res.json();
                        
                        if (data.success && data.description) {
                            descriptionInput.value = data.description;
                            descriptionInput.dataset.autoGenerated = "true";
                            if(aiDescStatus) {
                                aiDescStatus.textContent = '✓ Description generated';
                                aiDescStatus.style.color = 'green';
                                setTimeout(() => { if(aiDescStatus) aiDescStatus.textContent = ''; }, 4000);
                            }
                        }
                    } catch (err) {
                        console.error('AI Description Error:', err);
                        if(aiDescStatus) aiDescStatus.textContent = '❌ Generation failed';
                    }
                }

                const existingFeatures = featuresContainer ? featuresContainer.querySelectorAll('.ai-feature-input') : [];
                
                if (featuresContainer && existingFeatures.length === 0) {
                    if (aiFeaturesStatus) {
                        aiFeaturesStatus.style.display = 'block';
                        aiFeaturesStatus.textContent = '✨ Generating features...';
                        aiFeaturesStatus.style.color = 'var(--corporate-blue)';
                    }

                    await generateFeatures(); 
                    
                    if (aiFeaturesStatus) {
                        setTimeout(() => { aiFeaturesStatus.style.display = 'none'; }, 4000);
                    }
                }

            }, 1500);
        });

        if (descriptionInput) {
            descriptionInput.addEventListener('input', () => {
                if (descriptionInput.value.trim().length > 0) {
                    delete descriptionInput.dataset.autoGenerated;
                }
            });
        }
    }

    const aiSearchImagesBtn = document.getElementById('ai-search-images-btn');

    const runImageSearch = async () => {
        const titleValue = productTitleInput.value.trim();
        const imagesStatusDiv = document.getElementById('ai-images-status');
        const mainImageUrlInput = document.getElementById('product-image');
        const carouselUrlInputs = [
            document.getElementById('carousel-url-1'),
            document.getElementById('carousel-url-2'),
            document.getElementById('carousel-url-3'),
            document.getElementById('carousel-url-4'),
        ];
        
        if (titleValue.length < 3) {
            if (imagesStatusDiv) {
                imagesStatusDiv.textContent = 'Please enter a longer title to search for images.';
                imagesStatusDiv.style.color = '#d32f2f';
            }
            return;
        }
        
        if (imagesStatusDiv) {
            imagesStatusDiv.textContent = '⏳ Searching for images...';
            imagesStatusDiv.style.color = 'var(--corporate-blue)';
        }
        if (aiSearchImagesBtn) aiSearchImagesBtn.disabled = true;

        try {
            const response = await fetch('/api/ai/generate-images', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title: titleValue })
            });
            const data = await response.json();

            if (data.success && data.images && data.images.length > 0) {
                 if (mainImageUrlInput) mainImageUrlInput.value = data.images[0] || '';
                 carouselUrlInputs.forEach((input, i) => {
                     if (input) input.value = data.images[i+1] || '';
                 });
                 if (imagesStatusDiv) {
                     imagesStatusDiv.textContent = `✓ Found ${data.images.length} images! Fields populated.`;
                     imagesStatusDiv.style.color = '#2e7d32';
                 }
            } else {
                 if (imagesStatusDiv) {
                     imagesStatusDiv.textContent = '❌ No images found. Please try a different title or add URLs manually.';
                     imagesStatusDiv.style.color = '#d32f2f';
                 }
            }
        } catch (err) {
            console.error(err);
            if (imagesStatusDiv) {
                imagesStatusDiv.textContent = `Error: ${err.message || 'Image search failed. Check server logs and API keys.'}`;
                imagesStatusDiv.style.color = '#d32f2f';
            }
        } finally {
            if (aiSearchImagesBtn) aiSearchImagesBtn.disabled = false;
        }
    };
    
    if (aiSearchImagesBtn) {
        aiSearchImagesBtn.addEventListener('click', (e) => {
            e.preventDefault();
            runImageSearch();
        });
    }

    const allCuratedIds = [
        'product-curate-womens', 'product-curate-mens',
        'product-curate-livingroom', 'product-curate-bedroom', 'product-curate-office', 'product-curate-kitchen',
        'product-curate-kids-electronics', 'product-curate-kids-clothing', 'product-curate-kids-toys',
        'product-curate-trending', 'product-curate-new-arrivals', 'product-curate-combos'
    ];

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

    const saveBtn = document.getElementById('product-save-btn');
    let formInteracted = false; 
    const updateSaveButtonState = () => {
        if (!saveBtn) return;
        const anyCurated = allCuratedIds.some(id => document.getElementById(id)?.checked);
        const anyFilter = formFilterIds.some(id => document.getElementById(id)?.checked);
        const validationMsg = document.getElementById('product-validation-msg');
        
        const mainAdminCheck = isMainAdmin === true;
        const kidsAdminCheck = isKidsAdmin === true;
        
        if (mainAdminCheck) {
            saveBtn.disabled = false;
            if (validationMsg) {
                validationMsg.textContent = '';
                validationMsg.style.display = 'none';
            }
        } else if (kidsAdminCheck) {
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
            const combosChecked = document.getElementById('product-curate-combos')?.checked;
            if (combosChecked) {
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

    allCuratedIds.forEach(id => { const el = document.getElementById(id); if (el) el.addEventListener('change', () => { formInteracted = true; updateSaveButtonState(); }); });
    formFilterIds.forEach(id => { const el = document.getElementById(id); if (el) el.addEventListener('change', () => { formInteracted = true; updateSaveButtonState(); }); });

    updateSaveButtonState();
    document.getElementById('clear-form-btn')?.addEventListener('click', updateSaveButtonState);
    document.getElementById('cancel-edit-btn')?.addEventListener('click', updateSaveButtonState);
    
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

        const comboTotalValue = document.getElementById('combo-total-value');
        const total = selectedComboProducts.reduce((sum, p) => sum + (parseFloat(p.currentPrice) || 0), 0);
        if (comboTotalValue) comboTotalValue.textContent = total.toFixed(2);

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
            const topRowTotalWidth = itemWidth * 2 + gap;
            const topRowStartX = (width - topRowTotalWidth) / 2;
            drawImageInBox(images[0], topRowStartX, gap, itemWidth, itemHeight);
            drawImageInBox(images[1], topRowStartX + itemWidth + gap, gap, itemWidth, itemHeight);
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
                    const placeholderImg = new Image();
                    placeholderImg.width = 100;
                    placeholderImg.height = 100;
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
            ctx.fillStyle = '#ccc';
            ctx.font = '14px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('Preview will update when images load', comboCanvas.width / 2, comboCanvas.height / 2);
        }
    };

    const setComboUIState = (enabled) => {
        if (comboBuilderSection) comboBuilderSection.style.display = enabled ? 'block' : 'none';
        if (comboExpirySection) comboExpirySection.style.display = enabled ? 'block' : 'none';
        if (comboEndDateInput) comboEndDateInput.required = enabled;

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

        const currentPriceInput = document.getElementById('product-currentPrice');
        const oldPriceInput = document.getElementById('product-oldPrice');
        const imageInput = document.getElementById('product-image');
        const comboSalePriceInputEl = document.getElementById('product-comboSalePrice'); 

        if (currentPriceInput) currentPriceInput.required = !enabled;
        if (oldPriceInput) oldPriceInput.required = !enabled;
        if (imageInput) imageInput.required = !enabled;
        
        if (comboSalePriceInputEl) comboSalePriceInputEl.required = enabled;
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
            updateSaveButtonState();
        });
    }

    setComboUIState(false);

    if (comboProductSearch) {
        comboProductSearch.addEventListener('input', (e) => populateComboProductList(e.target.value));
    }

    if (comboSelectedPreview) {
        comboSelectedPreview.addEventListener('click', (e) => {
            const removeBtn = e.target.closest('.combo-remove-btn');
            const replaceBtn = e.target.closest('.combo-replace-btn');

            if (removeBtn) {
                e.preventDefault();
                const productId = removeBtn.dataset.productId;
                selectedComboProducts = selectedComboProducts.filter(p => p.productId !== productId);
                const checkbox = document.getElementById(`combo-prod-${productId}`);
                if (checkbox) checkbox.checked = false;
                updateComboSelectionDisplay();
                generateAndDisplayComboImage();
            }

            if (replaceBtn) {
                e.preventDefault();
                const productId = replaceBtn.dataset.productId;
                const index = parseInt(replaceBtn.dataset.index, 10);
                
                comboProductSearch.focus();
                comboProductSearch.value = '';
                populateComboProductList('');
                
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

                if (window.comboReplaceIndex !== undefined && e.target.checked) {
                    selectedComboProducts.splice(window.comboReplaceIndex, 1);
                    selectedComboProducts.push(product);
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
};

const initAdminViewers = () => {
    const addViewerForm = document.getElementById('add-viewers-form');
    if (!addViewerForm) return;

    const addReviewToggle = document.getElementById('add-review-now');
    const reviewFields = document.getElementById('add-review-fields');
    const peakTimesGrid = document.getElementById('peak-times-grid');
    const viewersMessage = document.getElementById('viewers-message');
    
    peakTimesGrid.innerHTML = PEAK_ACTIVITY_TIMES.map(time => 
        `<button type="button" class="peak-time-option" data-hour="${time.hour}" data-minute="${time.minute}">${time.label}</button>`
    ).join('');

    addReviewToggle.addEventListener('change', () => {
        reviewFields.style.display = addReviewToggle.checked ? 'block' : 'none';
    });

    peakTimesGrid.addEventListener('click', (e) => {
        if (e.target.classList.contains('peak-time-option')) {
            peakTimesGrid.querySelectorAll('.selected').forEach(btn => btn.classList.remove('selected'));
            e.target.classList.add('selected');
        }
    });

    addViewerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const productId = document.getElementById('viewers-product').value;
        const viewerName = document.getElementById('viewer-name').value.trim();
        const shouldAddReview = addReviewToggle.checked;
        
        let viewTime = null;
        const selectedTimeBtn = peakTimesGrid.querySelector('.selected');
        if (selectedTimeBtn) {
            viewTime = {
                hour: parseInt(selectedTimeBtn.dataset.hour),
                minute: parseInt(selectedTimeBtn.dataset.minute)
            };
        }

        try {
            const addViewerResponse = await api.addViewer(productId, {
                name: viewerName || undefined,
                viewTime: viewTime
            });

            if (!addViewerResponse || !addViewerResponse.viewer || !addViewerResponse.viewer._id) {
                throw new Error('Failed to get viewer ID after creation.');
            }

            const newViewerId = addViewerResponse.viewer._id;
            let successMessage = 'Viewer added successfully!';

            if (shouldAddReview) {
                const rating = parseInt(document.getElementById('review-rating').value);
                const text = document.getElementById('review-text').value.trim();

                if (!text) {
                    throw new Error('Review text is required when adding a review.');
                }

                await api.addReview(productId, {
                    author: viewerName || 'Anonymous',
                    rating: rating,
                    text: text,
                    viewerId: newViewerId
                });
                successMessage += ' Review also added!';
            }
            
            alert(successMessage);
            location.reload();

        } catch (err) {
            console.error('Failed to add viewer/review:', err);
            alert('Error: ' + err.message);
        }
    });
};


export const initMobileNav = () => {
    const navItems = document.querySelectorAll('.mobile-nav-item');
    const navLinks = document.querySelectorAll('.mobile-nav-link');

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault(); 
            e.stopPropagation(); 

            const parentItem = link.parentElement;
            const isOpen = parentItem.classList.contains('open');

            navItems.forEach(item => item.classList.remove('open'));

            if (!isOpen) {
                parentItem.classList.add('open');
            }
        });
    });

    const dropUpLinks = document.querySelectorAll('.mobile-dropup-menu a');
    dropUpLinks.forEach(link => {
        link.addEventListener('click', () => {
            navItems.forEach(item => item.classList.remove('open'));
        });
    });

    document.addEventListener('click', (e) => {
        if (!e.target.closest('.mobile-bottom-nav')) {
            navItems.forEach(item => item.classList.remove('open'));
        }
    });
};

export const initHamburgerMenu = () => {
    const hamburgerBtn = document.querySelector('.hamburger-btn');
    const closeMenuBtn = document.querySelector('.close-menu-btn');
    const sideMenu = document.querySelector('.mobile-side-menu');
    const overlay = document.querySelector('.mobile-side-menu-overlay');
    const menuLinks = document.querySelectorAll('.mobile-menu-links a');

    if (!hamburgerBtn || !sideMenu || !overlay) return;

    const openMenu = () => {
        sideMenu.classList.add('active');
        overlay.classList.add('active');
    };

    const closeMenu = () => {
        sideMenu.classList.remove('active');
        overlay.classList.remove('active');
    };

    hamburgerBtn.addEventListener('click', (e) => {
        e.preventDefault();
        openMenu();
    });

    closeMenuBtn.addEventListener('click', (e) => {
        e.preventDefault();
        closeMenu();
    });

    overlay.addEventListener('click', closeMenu);

    menuLinks.forEach(link => {
        link.addEventListener('click', closeMenu);
    });
};

// --- AUTH RENDERERS (Added back) ---

export const renderLoginPage = () => {
    getAppRoot().innerHTML = `
        <div class="page-container" style="max-width: 500px; margin-top: 3rem;">
            <div style="background: var(--white); padding: 2.5rem; border-radius: var(--border-radius); box-shadow: var(--shadow-medium);">
                <h1 style="text-align: center; color: var(--corporate-blue); margin-bottom: 2rem;">Welcome Back</h1>
                <form id="login-form">
                    <div class="form-group">
                        <label for="email">Email Address</label>
                        <input type="email" id="email" name="email" required autocomplete="email">
                    </div>
                    <div class="form-group">
                        <label for="password">Password</label>
                        <input type="password" id="password" name="password" required autocomplete="current-password">
                    </div>
                    <div id="login-message" class="form-message" style="text-align: center;"></div>
                    <button type="submit" class="btn btn-primary" style="width: 100%; margin-top: 1rem; padding: 15px;">Login</button>
                    <div style="text-align: center; margin-top: 1.5rem;">
                        <a href="#forgot" style="color: var(--text-light); text-decoration: none; font-size: 0.9rem;">Forgot Password?</a>
                        <br><br>
                        <span style="color: var(--text-light);">New here? </span><a href="#register" style="color: var(--corporate-blue); font-weight: 600; text-decoration: none;">Create an account</a>
                    </div>
                </form>
            </div>
        </div>
    `;
};

export const renderRegisterPage = () => {
    getAppRoot().innerHTML = `
        <div class="page-container" style="max-width: 500px; margin-top: 3rem;">
            <div style="background: var(--white); padding: 2.5rem; border-radius: var(--border-radius); box-shadow: var(--shadow-medium);">
                <h1 style="text-align: center; color: var(--corporate-blue); margin-bottom: 2rem;">Create Account</h1>
                <form id="register-form">
                    <div class="form-group">
                        <label for="name">Full Name</label>
                        <input type="text" id="name" name="name" required autocomplete="name">
                    </div>
                    <div class="form-group">
                        <label for="email">Email Address</label>
                        <input type="email" id="email" name="email" required autocomplete="email">
                    </div>
                    <div class="form-group">
                        <label for="password">Password</label>
                        <input type="password" id="password" name="password" required autocomplete="new-password">
                    </div>
                    <div class="form-group">
                        <label for="sellerType">Account Type</label>
                        <select id="sellerType" name="sellerType" style="width: 100%; padding: 12px; border: 1px solid var(--border-color); border-radius: 8px;">
                            <option value="customer">Customer (Buy Products)</option>
                            <option value="clothes">Clothing Reseller</option>
                            <option value="furniture">Furniture Reseller</option>
                            <option value="kids">Kids Store Reseller</option>
                        </select>
                        <small style="display:block; margin-top:5px; color:#666; font-size:0.85rem;">Reseller accounts require admin approval before logging in.</small>
                    </div>
                    <div id="register-message" class="form-message" style="text-align: center;"></div>
                    <button type="submit" class="btn btn-primary" style="width: 100%; margin-top: 1rem; padding: 15px;">Sign Up</button>
                    <div style="text-align: center; margin-top: 1.5rem;">
                        <span style="color: var(--text-light);">Already have an account? </span><a href="#login" style="color: var(--corporate-blue); font-weight: 600; text-decoration: none;">Login</a>
                    </div>
                </form>
            </div>
        </div>
    `;
};

export const renderForgotPage = () => {
    getAppRoot().innerHTML = `
        <div class="page-container" style="max-width: 500px; margin-top: 3rem;">
            <div style="background: var(--white); padding: 2.5rem; border-radius: var(--border-radius); box-shadow: var(--shadow-medium);">
                <h1 style="text-align: center; color: var(--corporate-blue); margin-bottom: 2rem;">Reset Password</h1>
                <form id="forgot-form">
                    <div class="form-group">
                        <label for="email">Email Address</label>
                        <input type="email" id="email" name="email" required autocomplete="email">
                    </div>
                    <div id="forgot-message" class="form-message" style="text-align: center;"></div>
                    <button type="submit" class="btn btn-primary" style="width: 100%; margin-top: 1rem; padding: 15px;">Send Reset Link</button>
                    <div style="text-align: center; margin-top: 1.5rem;">
                        <a href="#login" style="color: var(--corporate-blue); font-weight: 600; text-decoration: none;">Back to Login</a>
                    </div>
                </form>
            </div>
        </div>
    `;
};

export const renderResetPage = (token) => {
    getAppRoot().innerHTML = `
        <div class="page-container" style="max-width: 500px; margin-top: 3rem;">
            <div style="background: var(--white); padding: 2.5rem; border-radius: var(--border-radius); box-shadow: var(--shadow-medium);">
                <h1 style="text-align: center; color: var(--corporate-blue); margin-bottom: 2rem;">Set New Password</h1>
                <form id="reset-form">
                    <input type="hidden" name="reset-token" value="${token}">
                    <div class="form-group">
                        <label for="password">New Password</label>
                        <input type="password" id="password" name="password" required autocomplete="new-password">
                    </div>
                    <div id="reset-message" class="form-message" style="text-align: center;"></div>
                    <button type="submit" class="btn btn-primary" style="width: 100%; margin-top: 1rem; padding: 15px;">Update Password</button>
                </form>
            </div>
        </div>
    `;
};

// --- NEW FUNCTION: RENDER COMBOS PAGE ---
export const renderCombosPage = (products) => {
    // This is essentially just calling renderCategoryPage, but we define it 
    // because the router explicitly tries to call ui.renderCombosPage(products).
    // "combos" is treated as a special category key in renderCategoryPage already.
    renderCategoryPage(products, 'combos');
};

// --- EXPORTED HELPER FUNCTIONS FOR MAIN.JS ---

export const populateProductForm = (productToEdit, allProducts) => {
    const resetForm = () => {
        const productForm = document.getElementById('product-form');
        if(productForm) productForm.reset();
        
        document.getElementById('product-id-hidden').value = '';
        
        const stockToggle = document.getElementById('product-stockToggle');
        const stockFieldGroup = document.getElementById('stock-field-group');
        if (stockToggle) stockToggle.checked = false;
        if (stockFieldGroup) stockFieldGroup.style.display = 'none';

        const saleDatesSection = document.getElementById('sale-dates-section');
        if (saleDatesSection) saleDatesSection.style.display = 'none';
        
        const imagesPreview = document.getElementById('product-images-preview');
        if (imagesPreview) imagesPreview.innerHTML = '';
        
        const curatedIds = [
            'product-curate-womens', 'product-curate-mens', 'product-curate-livingroom', 'product-curate-bedroom',
            'product-curate-office', 'product-curate-kitchen', 'product-curate-kids-electronics',
            'product-curate-kids-clothing', 'product-curate-kids-toys'
        ];
        curatedIds.forEach(id => { const el = document.getElementById(id); if (el) el.checked = false; });
        
        ['product-filter-tops','product-filter-bottoms','product-filter-official','product-filter-traditional','product-filter-shoes','product-filter-accessories','product-filter-furniture','product-filter-appliances'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.checked = false;
        });
        
        ['product-color-1', 'product-color-2', 'product-color-3'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.value = '';
        });
        const colorsPreview = document.getElementById('product-colors-preview');
        if (colorsPreview) colorsPreview.innerHTML = '';
        const enableColorsToggle = document.getElementById('enable-product-colors');
        const colorsSection = document.getElementById('product-colors-section');
        if (enableColorsToggle) enableColorsToggle.checked = false;
        if (colorsSection) colorsSection.style.display = 'none';
        
        for (let i = 1; i <= 4; i++) {
            const input = document.getElementById(`carousel-url-${i}`);
            if (input) input.value = '';
        }
        
        const featuresContainer = document.getElementById('product-features-container');
        if (featuresContainer) featuresContainer.innerHTML = '<p style="font-size:0.9rem; color:#999; margin:0;">No features yet. Generate some using the button below.</p>';
        
        const sizeSelect = document.getElementById('product-sizes-select');
        if (sizeSelect) sizeSelect.selectedIndex = -1;

        // Reset the size checkboxes
        const sizeCheckboxes = document.querySelectorAll('.size-checkbox-input');
        sizeCheckboxes.forEach(cb => {
            cb.checked = false;
            const span = cb.nextElementSibling;
            if(span) {
                span.style.backgroundColor = 'transparent';
                span.style.color = 'var(--text-dark)';
                span.style.borderColor = '#ccc';
            }
        });
    };

    resetForm();
    
    document.getElementById('product-id-hidden').value = productToEdit._id;
    const productsTabBtn = document.querySelector('.admin-tab-btn[data-tab="products"]');
    if (productsTabBtn) productsTabBtn.click();
    
    document.getElementById('product-id').value = productToEdit.productId;
    document.getElementById('product-title').value = productToEdit.title;
    document.getElementById('product-currentPrice').value = productToEdit.currentPrice;
    document.getElementById('product-oldPrice').value = productToEdit.oldPrice;
    document.getElementById('product-category').value = productToEdit.category;
    document.getElementById('product-image').value = productToEdit.image;
    
    const descEl = document.getElementById('product-description');
    if (descEl) descEl.value = productToEdit.description || '';
    
    const carouselUrlInputs = [
        document.getElementById('carousel-url-1'),
        document.getElementById('carousel-url-2'),
        document.getElementById('carousel-url-3'),
        document.getElementById('carousel-url-4'),
    ];
    carouselUrlInputs.forEach(input => input.value = '');

    if (productToEdit.thumbnails && productToEdit.thumbnails.length > 1) {
        productToEdit.thumbnails.slice(1, 5).forEach((url, index) => {
            if (carouselUrlInputs[index]) {
                carouselUrlInputs[index].value = url;
            }
        });
    }
    const condEl = document.getElementById('product-condition');
    if (condEl) condEl.value = productToEdit.condition || 'new';
    
    const stockToggle = document.getElementById('product-stockToggle');
    const stockFieldGroup = document.getElementById('stock-field-group');
    if (productToEdit.stock !== undefined && productToEdit.stock !== null) {
        stockToggle.checked = true;
        stockFieldGroup.style.display = 'block';
        document.getElementById('product-stock').value = productToEdit.stock;
    } else {
        stockToggle.checked = false;
        stockFieldGroup.style.display = 'none';
    }

    document.getElementById('product-onSale').checked = productToEdit.onSale || false;
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
    
    const curatedPages = productToEdit.curatedPages || [];
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
    }
    
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
    
    const colors = productToEdit.colors || [];
    for (let i = 0; i < 3; i++) {
        const colorInput = document.getElementById(`product-color-${i + 1}`);
        if (colorInput) {
            colorInput.value = colors[i] || '';
        }
    }
    
    const enableColorsToggle = document.getElementById('enable-product-colors');
    const colorsSection = document.getElementById('product-colors-section');
    const colorsEnabledValue = productToEdit.colorsEnabled !== undefined ? productToEdit.colorsEnabled : true;
    if (enableColorsToggle) {
        enableColorsToggle.checked = colorsEnabledValue;
    }
    if (colorsSection) {
        colorsSection.style.display = colorsEnabledValue ? 'block' : 'none';
    }
    
    // Trigger update color preview manually if needed, logic is in change handler
    const colorsPreview = document.getElementById('product-colors-preview');
    if (colorsPreview) {
        colorsPreview.innerHTML = '';
        ['product-color-1', 'product-color-2', 'product-color-3'].forEach(id => {
            const input = document.getElementById(id);
            if (input && input.value.trim()) {
                const circle = document.createElement('div');
                circle.style.cssText = `width: 50px; height: 50px; border-radius: 50%; border: 2px solid #d2d2d7; background-color: ${input.value.trim()};`;
                colorsPreview.appendChild(circle);
            }
        });
    }

    const featuresContainer = document.getElementById('product-features-container');
    const features = productToEdit.features || [];
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

    if (productToEdit.sizes && productToEdit.sizes.length > 0) {
        const hiddenSelect = document.getElementById('product-sizes-select');
        const sizeCheckboxes = document.querySelectorAll('.size-checkbox-input');
        
        if (hiddenSelect) {
            // First clear all
             Array.from(hiddenSelect.options).forEach(opt => opt.selected = false);
            
            // Set based on product sizes
            productToEdit.sizes.forEach(size => {
                // Update hidden select
                const option = Array.from(hiddenSelect.options).find(opt => opt.value === size);
                if (option) option.selected = true;

                // Update visual checkbox
                sizeCheckboxes.forEach(cb => {
                    if (cb.value === size) {
                        cb.checked = true;
                        const span = cb.nextElementSibling;
                        if(span) {
                            span.style.backgroundColor = 'var(--corporate-blue)';
                            span.style.color = 'white';
                            span.style.borderColor = 'var(--corporate-blue)';
                        }
                    }
                });
            });
        }
    } else {
        const sizeSelect = document.getElementById('product-sizes-select');
        if (sizeSelect) sizeSelect.selectedIndex = -1;
    }
    
    document.getElementById('cancel-edit-btn').style.display = 'inline-block';
    document.querySelector('form h3').textContent = 'Edit Product';
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

export const showTransactionDetailsPopup = (transaction) => {
    // This function mimics showTransactionDetailsPopupNew logic
    const popupHTML = `
        <div class="popup-overlay" id="transaction-details-popup">
            <div class="popup-content" style="max-width: 600px; text-align: left;">
                <button class="popup-close" id="popup-close-transaction">&times;</button>
                <h2 style="color: var(--corporate-blue); margin-bottom: 15px;">Transaction Details</h2>
                <div class="transaction-details-content" style="max-height: 400px; overflow-y: auto;">
                    <p><strong>Order ID:</strong> ${transaction._id}</p>
                    <p><strong>Date:</strong> ${new Date(transaction.createdAt).toLocaleString()}</p>
                    <p><strong>Customer:</strong> ${transaction.customerName}</p>
                    <p><strong>Email:</strong> ${transaction.customerEmail}</p>
                    <p><strong>Address:</strong> ${transaction.customerAddress}</p>
                    <p><strong>Payment Method:</strong> ${transaction.paymentMethod}</p>
                    <p><strong>Status:</strong> ${transaction.verified ? '<span style="color:green; font-weight:bold;">Verified</span>' : '<span style="color:orange; font-weight:bold;">Pending</span>'}</p>
                    
                    <h4 style="margin-top: 20px; border-bottom: 1px solid #eee; padding-bottom: 5px;">Items Ordered</h4>
                    <ul style="list-style: none; padding: 0;">
                        ${transaction.items.map(item => `
                            <li style="padding: 10px 0; border-bottom: 1px solid #f0f0f0; display: flex; justify-content: space-between;">
                                <span>${item.quantity}x <strong>${item.title}</strong> ${item.selectedColor ? `(${item.selectedColor})` : ''}</span>
                                <span>${formatCurrency(item.price * item.quantity)}</span>
                            </li>
                        `).join('')}
                    </ul>
                    
                    <div style="margin-top: 20px; font-size: 1.2rem; text-align: right;">
                        <strong>Total: ${formatCurrency(transaction.totalAmount)}</strong>
                    </div>
                    ${transaction.giftCardEarned > 0 ? `<p style="text-align: right; color: var(--success-green); font-size: 0.9rem;">Gift Card Earned: ${formatCurrency(transaction.giftCardEarned)}</p>` : ''}
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', popupHTML);
    const popup = document.getElementById('transaction-details-popup');
    setTimeout(() => popup.classList.add('show'), 100);

    const closePopup = () => {
        popup.classList.remove('show');
        setTimeout(() => popup.remove(), 300);
    };

    document.getElementById('popup-close-transaction').addEventListener('click', closePopup);
    popup.addEventListener('click', e => {
        if (e.target === popup) closePopup();
    });
};