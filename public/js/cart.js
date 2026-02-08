// js/cart.js
// Update will be handled by ui.js updateFloatingCartButton function
let updateCartIcon = () => {
    // Placeholder - will be set by ui.js
};

export const setCartUpdateCallback = (callback) => {
    updateCartIcon = callback;
};

export const CartManager = (() => {
    let cart = JSON.parse(localStorage.getItem('namixCart')) || [];

    const save = () => {
        localStorage.setItem('namixCart', JSON.stringify(cart));
        updateCartIcon();
    };

    const addItem = async (productId, quantity = 1, selectedColor = null) => {
        // We need to get product details from API to show alert
        const response = await fetch(`/api/products/${productId}`);
        const product = await response.json();
        
        const existingItem = cart.find(item => item.id === productId && item.selectedColor === selectedColor);
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            cart.push({ id: productId, quantity: quantity, price: product.currentPrice, image: product.image, title: product.title, selectedColor: selectedColor });
        }
        save();
        alert(`${product.title} added to cart!`);
    };
    
    const updateQuantity = (productId, newQuantity) => {
        const item = cart.find(item => item.id === productId);
        if (item) {
            if (newQuantity <= 0) removeItem(productId);
            else item.quantity = newQuantity;
            save();
        }
    };
    
    const removeItem = (productId) => {
        cart = cart.filter(item => item.id !== productId);
        save();
    };
    
    return { 
        addItem, 
        updateQuantity, 
        removeItem, 
        getCart: () => cart, 
        clearCart: () => { cart = []; save(); }, 
        getCartCount: () => cart.reduce((total, item) => total + item.quantity, 0) 
    };
})();

// The problematic initial call that ran too early has been removed from this file.