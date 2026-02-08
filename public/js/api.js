// js/api.js

// Re-usable function to get token
const getToken = () => {
    try {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        if (userInfo && userInfo.token) {
            return userInfo.token;
        }
    } catch (e) {
        console.error('Error getting token:', e);
    }
    return null;
};

export const fetchProducts = async (category = '', keyword = '', curated = '') => {
  try {
    let url = `/api/products?`;
    if (category) url += `category=${encodeURIComponent(category)}&`;
    if (keyword) url += `keyword=${encodeURIComponent(keyword)}&`;
    if (curated) url += `curated=${encodeURIComponent(curated)}&`;
    
    const response = await fetch(url);
    if (!response.ok) throw new Error('Network response was not ok');
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch products:', error);
    return [];
  }
};

export const fetchProductById = async (productId) => {
  try {
    const response = await fetch(`/api/products/${productId}`);
    if (!response.ok) {
        if(response.status === 404) return null;
        throw new Error('Network response was not ok');
    }
    return await response.json();
  } catch (error) {
    console.error(`Failed to fetch product ${productId}:`, error);
    return null;
  }
};

export const createProduct = async (productData) => {
    const token = getToken();
    const headers = { 
      'Content-Type': 'application/json'
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch('/api/products', {
      method: 'POST',
      headers: headers,
      credentials: 'same-origin',
      body: JSON.stringify(productData),
    });
    if (!response.ok) {
      let errorMsg = 'Failed to create product';
      try {
        const errorData = await response.json();
        errorMsg = errorData.message || errorMsg;
      } catch (e) {
        // Response wasn't JSON, use default message
      }
      throw new Error(`${response.status}: ${errorMsg}`);
    }
    return await response.json();
};

export const updateProduct = async (productId, productData) => {
    // FIX: productId here is the MongoDB _id
    const token = getToken();
    const headers = { 
      'Content-Type': 'application/json'
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(`/api/products/${productId}`, {
      method: 'PUT',
      headers: headers,
      credentials: 'same-origin',
      body: JSON.stringify(productData),
    });
    if (!response.ok) {
      let errorMsg = 'Failed to update product';
      try {
        const errorData = await response.json();
        errorMsg = errorData.message || errorMsg;
      } catch (e) {
        // Response wasn't JSON, use default message
      }
      throw new Error(`${response.status}: ${errorMsg}`);
    }
    return await response.json();
};

export const deleteProduct = async (productId) => {
    // FIX: productId here is the MongoDB _id
    const token = getToken();
    const headers = { 
        'Content-Type': 'application/json'
    };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(`/api/products/${productId}`, { 
        method: 'DELETE',
        headers: headers,
        credentials: 'same-origin'
    });
    if (!response.ok) {
      let errorMsg = 'Failed to delete product';
      try {
        const errorData = await response.json();
        errorMsg = errorData.message || errorMsg;
      } catch (e) {
        // Response wasn't JSON, use default message
      }
      throw new Error(`${response.status}: ${errorMsg}`);
    }
    return await response.json();
};


// --- User & Admin API Calls ---

export const loginUser = async (email, password) => {
    const response = await fetch('/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
    });
    if (!response.ok) {
        const { message } = await response.json();
        throw new Error(message || 'Login failed');
    }
    return await response.json();
};

export const registerUser = async (name, email, password) => {
    const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
    });
    if (!response.ok) {
        const { message } = await response.json();
        throw new Error(message || 'Registration failed');
    }
    return await response.json();
};

export const fetchAllUsers = async () => {
    const token = getToken();
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const response = await fetch('/api/users', {
        headers,
        credentials: 'same-origin'
    });
    if (!response.ok) {
        throw new Error('Unauthorized to fetch users');
    }
    return await response.json();
};

export const deleteUser = async (userId) => {
    const token = getToken();
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
        headers,
        credentials: 'same-origin'
    });
    if (!response.ok) {
        let err = 'Failed to delete user';
        try { const data = await response.json(); err = data.message || err; } catch(e){}
        throw new Error(err);
    }
    return await response.json();
};

// --- Viewer API Calls ---
export const addViewer = async (productId, opts = {}) => {
  const body = {
    viewTime: opts.viewTime || new Date(),
  };
  if (opts.name) body.name = opts.name;
  const response = await fetch(`/api/products/${productId}/viewers`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json'
    },
    credentials: 'same-origin',
    body: JSON.stringify(body)
  });
    if (!response.ok) {
        throw new Error('Failed to add viewer');
    }
    return await response.json();
};

export const addReview = async (productId, review) => {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json'
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const response = await fetch(`/api/products/${productId}/reviews`, {
    method: 'POST',
    headers: headers,
    credentials: 'same-origin',
    body: JSON.stringify(review)
  });
  if (!response.ok) {
    let msg = 'Failed to add review';
    try { const data = await response.json(); msg = data.message || msg; } catch(e){}
    throw new Error(msg);
  }
  return await response.json();
};

export const fetchAllViewers = async () => {
    const response = await fetch('/api/products/viewers/all', {
        headers: { 'Authorization': `Bearer ${getToken()}` }
    });
    if (!response.ok) {
        throw new Error('Unauthorized to fetch viewers');
    }
    return await response.json();
};

export const deleteViewerById = async (productId, viewerId) => {
    const token = getToken();
    const headers = { 
        'Content-Type': 'application/json'
    };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(`/api/products/${productId}/viewers/${viewerId}`, {
        method: 'DELETE',
        headers: headers,
        credentials: 'same-origin'
    });
    if (!response.ok) {
        throw new Error('Failed to delete viewer');
    }
    return await response.json();
};

// --- Gift Card Balance ---
export const fetchGiftCardBalance = async () => {
    try {
        const response = await fetch('/api/users/balance', {
            headers: { 'Content-Type': 'application/json' },
            credentials: 'same-origin' // Important for session-based auth
        });
        if (!response.ok) {
            // If user is not logged in, API returns 401, treat as 0 balance
            if (response.status === 401) return { balance: 0 };
            throw new Error('Could not fetch balance');
        }
        return await response.json();
    } catch (error) {
        console.error('Failed to fetch gift card balance:', error);
        return { balance: 0 }; // Return 0 balance on any error
    }
};

// Session-based auth endpoints
export const sessionLogin = async (email, password) => {
  const response = await fetch('/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  if (!response.ok) {
    const { message } = await response.json().catch(() => ({}));
    throw new Error(message || 'Login failed');
  }
  return await response.json();
};

export const sessionSignup = async (name, email, password) => {
  const response = await fetch('/auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password })
  });
  if (!response.ok) {
    const { message } = await response.json().catch(() => ({}));
    throw new Error(message || 'Signup failed');
  }
  return await response.json();
};

export const sessionLogout = async () => {
  const response = await fetch('/auth/logout', { method: 'POST' });
  if (!response.ok) throw new Error('Logout failed');
  return await response.json();
};

export const forgotPassword = async (email) => {
  const response = await fetch('/auth/forgot', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email })
  });
  if (!response.ok) throw new Error('Failed');
  return await response.json();
};

export const resetPassword = async (token, password) => {
  const response = await fetch(`/auth/reset/${token}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password }) });
  if (!response.ok) {
    const { message } = await response.json().catch(() => ({}));
    throw new Error(message || 'Failed');
  }
  return await response.json();
};

// Settings endpoints
export const fetchSettings = async () => {
  const response = await fetch('/api/settings', { headers: { 'Content-Type': 'application/json' }, credentials: 'same-origin' });
  if (!response.ok) throw new Error('Failed to fetch settings');
  return await response.json();
};

export const updateSetting = async (key, value) => {
  const token = getToken();
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const response = await fetch('/api/settings', {
    method: 'PUT',
    headers: headers,
    credentials: 'same-origin',
    body: JSON.stringify({ key, value }),
  });
  if (!response.ok) {
    let err = 'Failed to update setting';
    try { const data = await response.json(); err = data.message || err; } catch(e){}
    throw new Error(err);
  }
  return await response.json();
};

export const uploadHero = async (file) => {
  const fd = new FormData();
  fd.append('image', file);
  const response = await fetch('/api/upload/hero', { method: 'POST', body: fd, credentials: 'same-origin' });
  if (!response.ok) {
    let text = await response.text().catch(()=>'Upload failed');
    throw new Error(text || 'Hero upload failed');
  }
  return await response.json();
};

// --- FAQ API Calls ---
export const fetchFAQs = async () => {
    try {
        const response = await fetch('/api/faqs');
        if (!response.ok) throw new Error('Network response was not ok');
        return await response.json();
    } catch (error) {
        console.error('Failed to fetch FAQs:', error);
        return [];
    }
};

export const createFAQ = async (faqData) => {
    const token = getToken();
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const response = await fetch('/api/faqs', {
        method: 'POST',
        headers,
        credentials: 'same-origin',
        body: JSON.stringify(faqData),
    });
    if (!response.ok) {
        let err = 'Failed to create FAQ';
        try { const data = await response.json(); err = data.message || err; } catch(e){}
        throw new Error(err);
    }
    return await response.json();
};

export const updateFAQ = async (id, faqData) => {
    const token = getToken();
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const response = await fetch(`/api/faqs/${id}`, {
        method: 'PUT',
        headers,
        credentials: 'same-origin',
        body: JSON.stringify(faqData),
    });
    if (!response.ok) {
        let err = 'Failed to update FAQ';
        try { const data = await response.json(); err = data.message || err; } catch(e){}
        throw new Error(err);
    }
    return await response.json();
};

export const deleteFAQ = async (id) => {
    const token = getToken();
    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const response = await fetch(`/api/faqs/${id}`, {
        method: 'DELETE',
        headers,
        credentials: 'same-origin'
    });
    if (!response.ok) {
        let err = 'Failed to delete FAQ';
        try { const data = await response.json(); err = data.message || err;} catch(e){}
        throw new Error(err);
    }
    return await response.json();
};

// --- Transaction API Calls ---
export const updateTransaction = async (id, transactionData) => {
    const token = getToken();
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const response = await fetch(`/api/transactions/${id}`, {
        method: 'PUT',
        headers,
        credentials: 'same-origin',
        body: JSON.stringify(transactionData),
    });
    if (!response.ok) {
        let err = 'Failed to update transaction';
        try { const data = await response.json(); err = data.message || err; } catch(e){}
        throw new Error(err);
    }
    return await response.json();
};