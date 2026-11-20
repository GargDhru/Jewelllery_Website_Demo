import React, { createContext, useContext, useState, useEffect } from 'react';
import { Cart, CartItem, Product } from '../types';
import { cartApi, couponApi } from '../services/api';

interface AppliedCoupon {
  code: string;
  discount_amount: number;
  discount_type: string;
  discount_value: number;
  message: string;
}

interface CartContextType {
  cart: Cart | null;
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  shippingFee: number;
  totalAmount: number;
  freeShippingThreshold: number;
  freeShippingProgress: number;
  appliedCoupon: AppliedCoupon | null;
  isLoading: boolean;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  addItem: (product: Product, variantId?: string, quantity?: number) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  applyCoupon: (code: string) => Promise<{ success: boolean; message: string }>;
  removeCoupon: () => void;
  shippingMethod: 'standard' | 'express';
  setShippingMethod: (method: 'standard' | 'express') => void;
  isGiftWrap: boolean;
  setIsGiftWrap: (wrap: boolean) => void;
  giftNote: string;
  setGiftNote: (note: string) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<Cart | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(() => {
    try {
      const saved = localStorage.getItem('aura_applied_coupon');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [shippingMethod, setShippingMethod] = useState<'standard' | 'express'>('standard');
  const [isGiftWrap, setIsGiftWrap] = useState<boolean>(false);
  const [giftNote, setGiftNote] = useState<string>('');

  const freeShippingThreshold = 1999;

  // Load Cart
  const loadCart = async () => {
    try {
      setIsLoading(true);
      const data = await cartApi.get();
      setCart(data);
    } catch (err) {
      console.error('Failed to load cart:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCart();
  }, []);

  useEffect(() => {
    if (appliedCoupon) {
      localStorage.setItem('aura_applied_coupon', JSON.stringify(appliedCoupon));
    } else {
      localStorage.removeItem('aura_applied_coupon');
    }
  }, [appliedCoupon]);

  const items = cart?.items || [];
  const itemCount = cart?.items_count || 0;
  const rawSubtotal = cart?.subtotal || 0;
  const giftWrapFee = isGiftWrap ? 99 : 0;
  const subtotal = rawSubtotal + giftWrapFee;

  // Dynamic calculations
  let discountAmount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.discount_type === 'percentage') {
      discountAmount = (subtotal * appliedCoupon.discount_value) / 100;
    } else {
      discountAmount = appliedCoupon.discount_amount;
    }
  }
  discountAmount = Math.min(discountAmount, subtotal);

  const discountedSubtotal = Math.max(0, subtotal - discountAmount);

  // Free shipping check
  let shippingFee = 0;
  if (shippingMethod === 'express') {
    shippingFee = 199;
  } else {
    shippingFee = discountedSubtotal >= freeShippingThreshold ? 0 : 149;
  }

  // GST 3%
  const taxAmount = Math.round(discountedSubtotal * 0.03 * 100) / 100;
  const totalAmount = Math.round((discountedSubtotal + taxAmount + shippingFee) * 100) / 100;

  const freeShippingProgress = Math.min(100, Math.round((discountedSubtotal / freeShippingThreshold) * 100));

  const addItem = async (product: Product, variantId?: string, quantity = 1) => {
    try {
      const updatedCart = await cartApi.addItem(product.id, variantId, quantity);
      setCart(updatedCart);
      setIsCartOpen(true);
    } catch (err: any) {
      console.error('Failed to add item to cart:', err);
      throw err;
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    try {
      const updatedCart = await cartApi.updateItem(itemId, quantity);
      setCart(updatedCart);
    } catch (err) {
      console.error('Failed to update cart item:', err);
    }
  };

  const removeItem = async (itemId: string) => {
    try {
      const updatedCart = await cartApi.removeItem(itemId);
      setCart(updatedCart);
    } catch (err) {
      console.error('Failed to remove cart item:', err);
    }
  };

  const clearCart = async () => {
    try {
      const updatedCart = await cartApi.clear();
      setCart(updatedCart);
      setAppliedCoupon(null);
    } catch (err) {
      console.error('Failed to clear cart:', err);
    }
  };

  const applyCoupon = async (code: string) => {
    try {
      const res = await couponApi.validate(code, subtotal);
      if (res.valid) {
        setAppliedCoupon({
          code: res.code,
          discount_amount: res.discount_amount,
          discount_type: res.discount_type,
          discount_value: res.discount_value,
          message: res.message,
        });
        return { success: true, message: res.message };
      } else {
        return { success: false, message: res.message };
      }
    } catch (err: any) {
      return { success: false, message: 'Could not apply coupon at this time.' };
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        items,
        itemCount,
        subtotal,
        discountAmount,
        taxAmount,
        shippingFee,
        totalAmount,
        freeShippingThreshold,
        freeShippingProgress,
        appliedCoupon,
        isLoading,
        isCartOpen,
        setIsCartOpen,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
        applyCoupon,
        removeCoupon,
        shippingMethod,
        setShippingMethod,
        isGiftWrap,
        setIsGiftWrap,
        giftNote,
        setGiftNote,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

