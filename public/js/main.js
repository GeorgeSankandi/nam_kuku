// js/main.js
import { handleRouteChange } from './router.js';
import { CartManager } from './cart.js';
import { initFloatingCart } from './ui.js';
import { initChatbot } from './chatbot.js';
import { login as adminLogin, logout as adminLogout } from './adminAuth.js';
import { login, register, logout, updateAuthUI } from './auth.js';


// --- Initial Load & Route Changes ---
window.addEventListener('hashchange', handleRouteChange);
window.addEventListener('load', () => {
    updateAuthUI(); // Check user auth status on page load
    handleRouteChange(); // Handle initial page load
    initChatbot(); // Initialize the chatbot
    initFloatingCart(); // Initialize the floating cart badge
});

// --- Event Delegation for the whole app ---
document.body.addEventListener('click', e => {
    // Add to Cart button
    const addToCartBtn = e.target.closest('.add-to-cart-btn');
    if (addToCartBtn) {
        e.preventDefault();
        const productId = addToCartBtn.dataset.id;
        // Check for selected color
        const selectedColorSwatch = document.querySelector('.color-swatch.selected');
        const selectedColor = selectedColorSwatch ? selectedColorSwatch.dataset.color : null;
        CartManager.addItem(productId, 1, selectedColor);
    }

    // User logout link
    if (e.target.id === 'logout-link') {
        e.preventDefault();
        logout();
    }

    // Admin/Seller logout button (inside dashboard)
    const adminLogoutBtn = e.target.closest('#logout-btn');
    if (adminLogoutBtn) {
        e.preventDefault();
        adminLogout();
    }
});

document.body.addEventListener('submit', async e => {
    // THIS LINE IS THE CRITICAL FIX. It prevents the page from reloading on form submission.
    e.preventDefault(); 

    // Handle Admin & Seller Login
    if (e.target.id === 'admin-login-form') {
        const email = e.target.elements.email.value;
        const password = e.target.elements.password.value;
        const msgEl = document.getElementById('admin-login-message');
        msgEl.textContent = '';
        try {
            const success = await adminLogin(email, password);
            if (success) {
                msgEl.textContent = 'Logged in';
                msgEl.classList.remove('error');
                msgEl.classList.add('success');
                setTimeout(() => { location.hash = '#admin'; }, 300);
            }
        } catch (err) {
            msgEl.textContent = err.message || 'Login failed. Please check your credentials.';
            msgEl.classList.remove('success');
            msgEl.classList.add('error');
        }
    }
    
    // Handle Customer Login
    if (e.target.id === 'login-form') {
        const email = e.target.elements.email.value;
        const password = e.target.elements.password.value;
        const msgEl = document.getElementById('login-message');
        msgEl.textContent = '';
        try {
            const api = await import('./api.js');
            const res = await api.sessionLogin(email, password);
            const userInfo = res.user || res;
            localStorage.setItem('userInfo', JSON.stringify({ ...userInfo, token: null }));
            updateAuthUI();
            msgEl.textContent = 'Logged in';
            msgEl.classList.remove('error');
            msgEl.classList.add('success');
            setTimeout(() => { location.hash = '#home'; }, 400);
        } catch (err) {
            msgEl.textContent = err.message || 'Login failed. Please check your credentials.';
            msgEl.classList.remove('success');
            msgEl.classList.add('error');
        }
    }

    // Handle Customer Registration
    if (e.target.id === 'register-form') {
        const name = e.target.elements.name.value;
        const email = e.target.elements.email.value;
        const password = e.target.elements.password.value;
        const msgEl = document.getElementById('register-message');
        msgEl.textContent = '';
        try {
            const api = await import('./api.js');
            const res = await api.sessionSignup(name, email, password);
            const userInfo = res.user || res;
            localStorage.setItem('userInfo', JSON.stringify({ ...userInfo, token: null }));
            updateAuthUI();
            msgEl.textContent = 'Account created';
            msgEl.classList.remove('error');
            msgEl.classList.add('success');
            setTimeout(() => { location.hash = '#home'; }, 400);
        } catch (err) {
            msgEl.textContent = err.message || 'Registration failed. Please try again.';
            msgEl.classList.remove('success');
            msgEl.classList.add('error');
        }
    }

    // Handle Forgot Password request
    if (e.target.id === 'forgot-form') {
        const email = e.target.elements.email.value;
        const msgEl = document.getElementById('forgot-message');
        msgEl.textContent = '';
        try {
            const res = await (await import('./api.js')).forgotPassword(email);
            msgEl.textContent = res.message || 'If that email exists, a reset link was sent.';
            msgEl.classList.remove('error');
            msgEl.classList.add('success');
            // do not immediately redirect — let user read message
        } catch (err) {
            msgEl.textContent = err.message || 'Failed to request password reset.';
            msgEl.classList.remove('success');
            msgEl.classList.add('error');
        }
    }

    // Handle Reset Password form
    if (e.target.id === 'reset-form') {
        const password = e.target.elements.password.value;
        const token = e.target.elements['reset-token'] ? e.target.elements['reset-token'].value : '';
        const msgEl = document.getElementById('reset-message');
        msgEl.textContent = '';
        if (!token) {
            msgEl.textContent = 'Reset token missing.';
            msgEl.classList.add('error');
            return;
        }
        try {
            const res = await (await import('./api.js')).resetPassword(token, password);
            msgEl.textContent = res.message || 'Password reset successful.';
            msgEl.classList.remove('error');
            msgEl.classList.add('success');
            setTimeout(() => { location.hash = '#login'; }, 1200);
        } catch (err) {
            msgEl.textContent = err.message || 'Failed to reset password.';
            msgEl.classList.remove('success');
            msgEl.classList.add('error');
        }
    }
});


// --- Search Input ---
const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');

const performSearch = () => {
    const searchTerm = searchInput.value.trim();
    if (searchTerm) {
        location.hash = `#search/${encodeURIComponent(searchTerm)}`;
    }
};

if (searchInput) {
    searchInput.addEventListener('keypress', e => {
        if (e.key === 'Enter') {
            performSearch();
        }
    });
}
if (searchBtn) {
    searchBtn.addEventListener('click', performSearch);
}