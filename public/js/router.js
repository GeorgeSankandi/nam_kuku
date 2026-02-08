import * as api from './api.js';
import * as ui from './ui.js';
import { CartManager } from './cart.js';
import { isLoggedIn as isAdminLoggedIn, getSellerType, getToken } from './adminAuth.js';
import { updateAuthUI } from './auth.js';


// This object maps special category keys to their respective data from categoryData in ui.js
const specialCategories = {
    trending: 'trending',
    'new-arrivals': 'new-arrivals',
    'on-sale': 'on-sale',
    'second-hand': 'second-hand',
    'combos': 'combos'
};

export const handleRouteChange = async () => {
    const hash = location.hash.slice(1) || 'home';
    const parts = hash.split('/');
    const path = parts[0];
    const param = parts[1] || '';

    // Theme Management & UI updates
    document.body.classList.remove('theme-green', 'theme-red', 'theme-yellow', 'admin-mode');
    updateAuthUI();
    
    if (path === 'trending' || path === 'trade-in') {
        document.body.classList.add('theme-green');
    } else if (path === 'on-sale') {
        document.body.classList.add('theme-red');
    } else if (path === 'new-arrivals' || path === 'second-hand') {
        document.body.classList.add('theme-yellow');
    }

    ui.clearRoot(); // Clears the main content area
    window.scrollTo(0, 0);

    // Fetch products for special curated categories
    if (specialCategories[path]) {
        const products = await api.fetchProducts('', '', path); // Use the new API endpoint
        if (path === 'combos') {
            ui.renderCombosPage(products);
        } else {
            ui.renderCategoryPage(products, path);
        }
        return;
    }

    switch (path) {
        case 'home':
            ui.renderHomePage();
            break;
        
        case 'category': { // Use block scope for variable declaration
            const categoryInfo = ui.categoryData[param];
            let categoriesToFetch = [param];

            if (categoryInfo && categoryInfo.subcategories) {
                categoriesToFetch = categoryInfo.subcategories;
            }

            const categoryProducts = await api.fetchProducts(categoriesToFetch.join(','));
            ui.renderCategoryPage(categoryProducts, param);
            break;
        }

        case 'product':
            const product = await api.fetchProductById(param);
            if (product) {
                ui.renderProductPage(product);
            } else {
                ui.renderNotFound();
            }
            break;

        case 'cart':
            const cartItems = CartManager.getCart();
            const detailedCartItems = await Promise.all(
                cartItems.map(async (item) => {
                    const productDetails = await api.fetchProductById(item.id);
                    return {
                        ...productDetails,
                        quantity: item.quantity,
                        selectedColor: item.selectedColor || null
                    };
                })
            );
            ui.renderCartPage(detailedCartItems);
            break;

        case 'checkout':
            const itemsForCheckout = CartManager.getCart();
            const detailedItemsForCheckout = await Promise.all(
                itemsForCheckout.map(async (item) => {
                    const productDetails = await api.fetchProductById(item.id);
                    return { 
                        ...productDetails, 
                        quantity: item.quantity,
                        selectedColor: item.selectedColor || null
                    };
                })
            );
            ui.renderCheckoutPage(detailedItemsForCheckout);
            break;

        case 'search':
            const searchTerm = decodeURIComponent(param);
            const searchResults = await api.fetchProducts('', searchTerm);
            ui.renderCategoryPage(searchResults, null, searchTerm);
            break;

        case 'payment': {
            // #payment or #payment/<method>
            const parts = hash.split('/');
            if (parts.length === 1 || parts[1] === '') {
                ui.renderPaymentOptionsPage();
            } else {
                ui.renderPaymentMethodPage(parts[1]);
            }
            break;
        }

        case 'about':
            ui.renderAboutPage();
            break;

        case 'terms':
        case 'terms-and-conditions':
            ui.renderTermsAndConditionsPage();
            break;

        case 'privacy':
        case 'privacy-policy':
            ui.renderPrivacyPolicyPage();
            break;

        case 'faqs':
            ui.renderFaqsPage();
            break;

        case 'contact':
            ui.renderContactPage();
            break;

        case 'trade-in':
            ui.renderTradeInPage();
            break;

        case 'login':
            ui.renderLoginPage();
            break;

        case 'register':
            ui.renderRegisterPage();
            break;

        case 'forgot':
            ui.renderForgotPage();
            break;

        case 'shipping':
        case 'shipping-info':
        case 'delivery':
        case 'delivery-info':
            ui.renderShippingInfoPage();
            break;

        case 'returns':
        case 'returns-policy':
            ui.renderReturnsPage();
            break;

        case 'reset': {
            // reset route format: #reset/<token>
            const tokenParam = param || '';
            ui.renderResetPage(tokenParam);
            break;
        }

        case 'admin':
            if (isAdminLoggedIn()) {
                document.body.classList.add('admin-mode');
                const sellerType = getSellerType();
                const token = getToken();

                // If token is available (JWT flow), include Authorization header.
                // Otherwise rely on session cookies (Passport) and include credentials.
                const authHeaders = { 'Content-Type': 'application/json' };
                const fetchOpts = token ? { headers: { ...authHeaders, Authorization: `Bearer ${token}` } } : { headers: authHeaders, credentials: 'same-origin' };

                const allProducts = await api.fetchProducts();
                const allFAQs = await api.fetchFAQs();

                // Fetch users from API
                let allUsers = [];
                try {
                    const usersRes = await fetch('/api/users', fetchOpts);
                    if (usersRes.ok) {
                        allUsers = await usersRes.json();
                        if (!allUsers || allUsers.length === 0) {
                            console.warn('Warning: /api/users returned an empty list. This may mean there are no users in the DB or the request was not authorized.');
                        }
                    } else if (usersRes.status === 401) {
                        console.warn('Unauthorized to fetch users:', usersRes.status);
                    }
                } catch (err) {
                    console.warn('Could not fetch users:', err);
                }

                // If the admin opened a link like #admin/seller/<email>, impersonate that seller and reload the admin dashboard as that seller
                if (parts.length >= 3 && parts[1] === 'seller' && getSellerType() === 'admin') {
                    const sellerEmail = decodeURIComponent(parts.slice(2).join('/'));
                    const sellerUser = allUsers.find(u => u.email === sellerEmail);
                    if (sellerUser) {
                        // Save current main admin info so we can return later
                        const mainAdminInfo = localStorage.getItem('userInfo');
                        if (mainAdminInfo) {
                            sessionStorage.setItem('mainAdminInfo', mainAdminInfo);
                        } else {
                            sessionStorage.setItem('mainAdminInfo', 'SESSION');
                        }
                        // Set the selected seller into localStorage and reload to apply their context
                        localStorage.setItem('userInfo', JSON.stringify(sellerUser));
                        location.hash = '#admin';
                        location.reload();
                        return;
                    }
                }

                // Fetch viewers from API
                let allViewers = [];
                if (sellerType === 'admin') {
                    try {
                        const viewersRes = await fetch('/api/products/viewers/all', fetchOpts);
                        if (viewersRes.ok) {
                            allViewers = await viewersRes.json();
                        } else if (viewersRes.status === 401) {
                            console.warn('Unauthorized to fetch viewers:', viewersRes.status);
                        }
                    } catch (err) {
                        console.warn('Could not fetch viewers:', err);
                    }
                }

                // Fetch transactions from API
                let allTransactions = [];
                if (sellerType === 'admin') {
                    try {
                        const transRes = await fetch('/api/transactions', fetchOpts);
                        if (transRes.ok) {
                            allTransactions = await transRes.json();
                        } else if (transRes.status === 401) {
                            console.warn('Unauthorized to fetch transactions:', transRes.status);
                        }
                    } catch (err) {
                        console.warn('Could not fetch transactions:', err);
                    }
                }

                ui.renderAdminPage(allProducts, allUsers, allViewers, allTransactions, allFAQs, {}, sellerType);
            } else {
                location.hash = '#admin-login';
            }
            break;
        
        // THIS IS THE MISSING CASE THAT IS NOW ADDED
        case 'admin-login':
             ui.renderAdminLoginPage();
             break;

        default:
            ui.renderHomePage(); // Fallback to home page
            break;
    }
};