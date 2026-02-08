// js/adminAuth.js
// This file handles admin authentication using the real backend user system.
// Admins now login with their email and password, which generates a JWT token.

// Test credentials for demo purposes (these users exist in the database)
const TEST_ADMIN_ACCOUNTS = {
  'admin@example.com': 'password123',  // Main Admin
  'clothing@example.com': 'password123', // Clothing Seller
  'kids@example.com': 'password123',     // Kids Seller
  'furniture@example.com': 'password123' // Furniture Seller
};

// Helper to get admin user info from localStorage
const getAdminInfo = () => {
    try {
        return JSON.parse(localStorage.getItem('userInfo'));
    } catch (e) {
        return null;
    }
};

// Checks if an admin/seller is logged in
export const isLoggedIn = () => {
    const userInfo = getAdminInfo();
    // Direct admin user
    if (userInfo && userInfo.isAdmin === true) return true;
    // Allow main admin to impersonate a seller: if main admin info is stored in sessionStorage,
    // we consider the admin area accessible even if the current local user isn't an admin.
    if (sessionStorage.getItem('mainAdminInfo')) return true;
    return false;
};

// Returns the seller type of the logged-in admin
export const getSellerType = () => {
    const userInfo = getAdminInfo();
    // If we have a localStorage user, prefer its sellerType
    if (userInfo) return userInfo.sellerType || 'admin';

    // If the admin is authenticated via server session, the UI stores
    // a marker in sessionStorage. If that's present, assume admin access
    // so the admin dashboard tabs (Users / Sellers) can render.
    const mainAdminInfo = sessionStorage.getItem('mainAdminInfo');
    if (mainAdminInfo === 'SESSION') return 'admin';

    // If the stored main admin info is a JSON string, try to parse it
    if (mainAdminInfo && mainAdminInfo !== 'SESSION') {
        try {
            const parsed = JSON.parse(mainAdminInfo);
            return parsed.sellerType || 'admin';
        } catch (err) {
            // Fall through
        }
    }

    return null;
};

// Get the authentication token from localStorage or the stored main admin info while impersonating
export const getToken = () => {
    const userInfo = getAdminInfo();
    if (userInfo && userInfo.token) return userInfo.token;

    // If a main admin's info was saved in sessionStorage during impersonation,
    // use its token so admin-only API calls still authenticate while viewing a seller dashboard.
    const mainAdminInfo = sessionStorage.getItem('mainAdminInfo');
    if (mainAdminInfo && mainAdminInfo !== 'SESSION') {
        try {
            const parsed = JSON.parse(mainAdminInfo);
            return parsed.token || null;
        } catch (err) {
            return null;
        }
    }

    return null;
};

// Attempts to log the admin in using session-based backend authentication
export const login = async (email, password) => {
    try {
        const response = await fetch('/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
            credentials: 'same-origin'
        });

        if (!response.ok) {
            const { message } = await response.json().catch(() => ({}));
            throw new Error(message || 'Login failed');
        }

        const data = await response.json();
        const userInfo = data.user || data;

        // Only allow admin users to access admin panel
        if (!userInfo.isAdmin) {
            throw new Error('Only admin users can access the admin panel');
        }

        // Store minimal user info in localStorage (no JWT token)
        localStorage.setItem('userInfo', JSON.stringify(userInfo));
        return true;
    } catch (error) {
        console.error('Admin login failed:', error);
        throw new Error(error.message || 'Login failed. Please check your credentials.');
    }
};

// Logs the admin out
export const logout = () => {
    localStorage.removeItem('userInfo');
    // Redirect to home page after logout
    location.hash = '#home';
};