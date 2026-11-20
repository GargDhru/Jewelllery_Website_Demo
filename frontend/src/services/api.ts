import axios from 'axios';
import {
  Category, Product, Cart, User, Address, Order, Coupon, Review, Banner, AdminStats
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Helper for unique guest session
export const getSessionId = (): string => {
  let sessionId = localStorage.getItem('aura_session_id');
  if (!sessionId) {
    sessionId = 'sess_' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
    localStorage.setItem('aura_session_id', sessionId);
  }
  return sessionId;
};

// Request interceptor for token & session
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('aura_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  config.headers['x-session-id'] = getSessionId();
  return config;
});

// Category Services
export const categoryApi = {
  getAll: async (includeInactive = false) => {
    const res = await api.get<Category[]>(`/categories?include_inactive=${includeInactive}`);
    return res.data;
  },
  getBySlug: async (slugOrId: string) => {
    const res = await api.get<Category>(`/categories/${slugOrId}`);
    return res.data;
  },
  create: async (data: Partial<Category>) => {
    const res = await api.post<Category>('/categories', data);
    return res.data;
  },
  update: async (id: string, data: Partial<Category>) => {
    const res = await api.put<Category>(`/categories/${id}`, data);
    return res.data;
  },
  delete: async (id: string) => {
    const res = await api.delete(`/categories/${id}`);
    return res.data;
  },
};

// Product Services
export const productApi = {
  getAll: async (params?: Record<string, any>) => {
    const res = await api.get<Product[]>('/products', { params });
    return res.data;
  },
  getBySlug: async (slugOrId: string) => {
    const res = await api.get<Product>(`/products/${slugOrId}`);
    return res.data;
  },
  create: async (data: any) => {
    const res = await api.post<Product>('/products', data);
    return res.data;
  },
  update: async (id: string, data: any) => {
    const res = await api.put<Product>(`/products/${id}`, data);
    return res.data;
  },
  delete: async (id: string) => {
    const res = await api.delete(`/products/${id}`);
    return res.data;
  },
};

// Cart Services
export const cartApi = {
  get: async () => {
    const res = await api.get<Cart>('/cart');
    return res.data;
  },
  addItem: async (productId: string, variantId?: string, quantity = 1) => {
    const res = await api.post<Cart>('/cart/items', {
      product_id: productId,
      variant_id: variantId,
      quantity,
    });
    return res.data;
  },
  updateItem: async (itemId: string, quantity: number) => {
    const res = await api.put<Cart>(`/cart/items/${itemId}`, { quantity });
    return res.data;
  },
  removeItem: async (itemId: string) => {
    const res = await api.delete<Cart>(`/cart/items/${itemId}`);
    return res.data;
  },
  clear: async () => {
    const res = await api.delete<Cart>('/cart/clear');
    return res.data;
  },
};

// Coupon Services
export const couponApi = {
  getAll: async () => {
    const res = await api.get<Coupon[]>('/coupons');
    return res.data;
  },
  validate: async (code: string, subtotal: number) => {
    const res = await api.post<{
      valid: boolean;
      code: string;
      discount_amount: number;
      discount_type: string;
      discount_value: number;
      message: string;
    }>('/coupons/validate', { code, subtotal });
    return res.data;
  },
  create: async (data: Partial<Coupon>) => {
    const res = await api.post<Coupon>('/coupons', data);
    return res.data;
  },
  delete: async (id: string) => {
    const res = await api.delete(`/coupons/${id}`);
    return res.data;
  },
};

// Order & Checkout Services
export const orderApi = {
  checkout: async (data: any) => {
    const res = await api.post<Order>('/orders/checkout', data);
    return res.data;
  },
  verifyPayment: async (data: {
    order_id: string;
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }) => {
    const res = await api.post<{
      success: boolean;
      message: string;
      order_id: string;
      payment_status: string;
    }>('/orders/verify-payment', data);
    return res.data;
  },
  getMyOrders: async () => {
    const res = await api.get<Order[]>('/orders/my-orders');
    return res.data;
  },
  getById: async (orderIdOrNumber: string) => {
    const res = await api.get<Order>(`/orders/${orderIdOrNumber}`);
    return res.data;
  },
  cancelOrder: async (orderId: string, reason?: string) => {
    const res = await api.post(`/orders/${orderId}/cancel`, { reason });
    return res.data;
  },
  updateStatus: async (orderId: string, data: any) => {
    const res = await api.put<Order>(`/orders/${orderId}/status`, data);
    return res.data;
  },
};

// Review Services
export const reviewApi = {
  getByProduct: async (productId: string) => {
    const res = await api.get<Review[]>(`/reviews/product/${productId}`);
    return res.data;
  },
  submit: async (data: {
    product_id: string;
    rating: number;
    title?: string;
    comment: string;
    customer_name?: string;
  }) => {
    const res = await api.post<Review>('/reviews', data);
    return res.data;
  },
  adminGetAll: async (statusFilter?: string) => {
    const res = await api.get<Review[]>('/reviews/admin/all', {
      params: { status_filter: statusFilter },
    });
    return res.data;
  },
  adminModerate: async (reviewId: string, newStatus: string) => {
    const res = await api.put(`/reviews/admin/${reviewId}/status`, null, {
      params: { new_status: newStatus },
    });
    return res.data;
  },
  adminDelete: async (reviewId: string) => {
    const res = await api.delete(`/reviews/admin/${reviewId}`);
    return res.data;
  },
};

// Banner Services
export const bannerApi = {
  getAll: async () => {
    const res = await api.get<Banner[]>('/banners');
    return res.data;
  },
  create: async (data: Partial<Banner>) => {
    const res = await api.post<Banner>('/banners', data);
    return res.data;
  },
  delete: async (id: string) => {
    const res = await api.delete(`/banners/${id}`);
    return res.data;
  },
};

// Admin Services
export const adminApi = {
  getStats: async () => {
    const res = await api.get<AdminStats>('/admin/stats');
    return res.data;
  },
  getAllOrders: async (statusFilter?: string) => {
    const res = await api.get<Order[]>('/admin/orders', {
      params: { status_filter: statusFilter },
    });
    return res.data;
  },
  getCustomers: async (search?: string) => {
    const res = await api.get<User[]>('/admin/customers', {
      params: search ? { search } : undefined,
    });
    return res.data;
  },
};

