export const API_PATHS = {
  // --- 🔐 AUTH ROUTES ---
  AUTH: {
    REGISTER: "/api/auth/register", //
    LOGIN: "/api/auth/login", //
    GET_PROFILE: "/api/user/profile", //
    UPDATE_PROFILE: "/api/user/profile", //
  },

  // --- 📦 PRODUCT ROUTES ---
  PRODUCTS: {
    GET_ALL: "/api/products", //
    GET_BY_ID: (id) => `/api/products/${id}`, //
    CREATE: "/api/products", //
    UPDATE: (id) => `/api/products/${id}`, //
    DELETE: (id) => `/api/products/${id}`, //
  },

  // --- 🛒 USER & CART ROUTES ---
  USER: {
    GET_CART: "/api/user/cart", //
    UPDATE_CART: "/api/user/cart", //
    REMOVE_FROM_CART: (id) => `/api/user/cart/${id}`, //
    GET_ADDRESSES: "/api/user/address", //
    ADD_ADDRESS: "/api/user/address", //
    DELETE_ADDRESS: (id) => `/api/user/address/${id}`, //
  },

  // --- 💳 ORDER & PAYMENT ROUTES ---
  ORDERS: {
    CHECKOUT: "/api/orders/checkout", //
    VERIFY_PAYMENT: "/api/orders/verify", //
    MY_ORDERS: "/api/orders/my-orders", //
    GET_BY_ID: (id) => `/api/orders/${id}`, //
    SELLER_SALES: "/api/orders/seller-sales", //
    UPDATE_STATUS: (id) => `/api/orders/item/${id}/status`, //
  },

  // --- ⭐ REVIEW ROUTES ---
  REVIEWS: {
    POST_REVIEW: "/api/reviews", //
    GET_PRODUCT_REVIEWS: (productId) => `/api/reviews/${productId}`, //
    DELETE_REVIEW: (id) => `/api/reviews/${id}`, //
    SELLER_RESPONSE: (id) => `/api/reviews/${id}/response`, //
  },

  // --- ⚠️ COMPLAINT ROUTES ---
  COMPLAINTS: {
    CREATE: "/api/complaints", //
    GET_ALL: "/api/complaints", //
    MY_COMPLAINTS: "/api/complaints/my", //
    GET_BY_ID: (id) => `/api/complaints/${id}`, //
    RESOLVE: (id) => `/api/complaints/${id}/resolve`, //
  },

  // --- 🛡️ ADMIN ROUTES ---
  ADMIN: {
    GET_USERS: "/api/admin/users", //
    TOGGLE_STATUS: (id) => `/api/admin/toggle-status/${id}`, //
    BUYER_HISTORY: (id) => `/api/admin/buyer-history/${id}`, //
    BUYER_SPENDING: (id) => `/api/admin/buyer-spending/${id}`, //
    SELLER_SALES_CHART: (id) => `/api/admin/seller-sales/${id}`, //
    SELLER_HISTORY: (id) => `/api/admin/seller-history/${id}`, //
    PENDING_PAYOUTS: "/api/admin/payouts/pending", //
    PROCESS_PAYOUT: "/api/admin/payouts/process", //
  },
};
