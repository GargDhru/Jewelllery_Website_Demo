import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, Plus, Minus, ArrowRight, ShoppingBag, Gift, Tag, Check, Sparkles } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useCurrency } from '../../context/CurrencyContext';

export const CartDrawer: React.FC = () => {
  const {
    isCartOpen,
    setIsCartOpen,
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
    applyCoupon,
    removeCoupon,
    updateQuantity,
    removeItem,
    isGiftWrap,
    setIsGiftWrap,
  } = useCart();

  const { formatPrice } = useCurrency();
  const navigate = useNavigate();
  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    setCouponLoading(true);
    setCouponError('');
    const res = await applyCoupon(couponInput);
    setCouponLoading(false);
    if (!res.success) {
      setCouponError(res.message);
    } else {
      setCouponInput('');
    }
  };

  const handleCheckout = () => {
    setIsCartOpen(false);
    navigate('/checkout');
  };

  const amountNeededForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);

  return (
    <AnimatePresence>
      {isCartOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsCartOpen(false)}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="w-screen max-w-md bg-cream-50 text-onyx-900 shadow-2xl flex flex-col"
            >
              {/* Header */}
              <div className="px-6 py-5 border-b border-cream-200 flex items-center justify-between bg-white">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-gold-600" />
                  <h2 className="font-serif text-xl tracking-wide font-medium">Your Shopping Bag</h2>
                  <span className="text-xs bg-gold-100 text-gold-800 font-semibold px-2 py-0.5 rounded-full">
                    {itemCount}
                  </span>
                </div>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="p-1.5 text-stone-500 hover:text-onyx-950 rounded-full hover:bg-stone-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Free Shipping Indicator */}
              <div className="bg-cream-100 px-6 py-3 border-b border-cream-200 text-xs">
                {amountNeededForFreeShipping > 0 ? (
                  <p className="text-stone-700">
                    Add <span className="font-semibold text-gold-700">{formatPrice(amountNeededForFreeShipping)}</span> more for <span className="font-semibold text-onyx-950">FREE Luxury Delivery</span>
                  </p>
                ) : (
                  <p className="text-emerald-700 font-semibold flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    You unlocked Complimentary Insured Express Delivery!
                  </p>
                )}
                <div className="w-full bg-cream-300 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div
                    className="bg-gold-500 h-full rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${freeShippingProgress}%` }}
                  />
                </div>
              </div>

              {/* Items Container */}
              <div className="flex-1 overflow-y-auto px-6 py-4 divide-y divide-cream-200">
                {items.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center py-12">
                    <div className="w-20 h-20 rounded-full bg-cream-200/60 flex items-center justify-center text-gold-600 mb-4">
                      <ShoppingBag className="w-10 h-10" />
                    </div>
                    <h3 className="font-serif text-2xl mb-2 text-stone-800">Your bag is empty</h3>
                    <p className="text-stone-500 text-sm max-w-xs mb-6">
                      Explore our handcrafted demi-fine jewellery collections to find your perfect statement piece.
                    </p>
                    <button
                      onClick={() => {
                        setIsCartOpen(false);
                        navigate('/shop');
                      }}
                      className="px-6 py-2.5 bg-onyx-950 text-cream-50 font-medium text-xs tracking-widest uppercase rounded hover:bg-gold-600 transition-colors"
                    >
                      Discover Jewellery
                    </button>
                  </div>
                ) : (
                  items.map((item) => (
                    <div key={item.id} className="py-4 flex gap-4">
                      <div className="w-20 h-24 rounded-lg bg-cream-200 overflow-hidden shrink-0 border border-cream-300">
                        <img
                          src={item.product?.images?.[0]?.image_url || 'https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=400&q=80'}
                          alt={item.product?.title || 'Jewellery'}
                          className="w-full h-full object-cover object-center"
                        />
                      </div>
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start gap-2">
                            <h4 className="font-serif font-medium text-sm leading-tight text-onyx-950 line-clamp-1">
                              {item.product?.title}
                            </h4>
                            <button
                              onClick={() => removeItem(item.id)}
                              className="text-stone-400 hover:text-red-500 transition-colors p-0.5"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          {item.variant && (
                            <p className="text-xs text-stone-500 mt-0.5">{item.variant.title}</p>
                          )}
                          <p className="text-xs text-gold-700 font-medium mt-0.5">18K Gold Plated • Anti-Tarnish</p>
                        </div>

                        <div className="flex items-center justify-between mt-3">
                          {/* Quantity control */}
                          <div className="flex items-center border border-stone-300 rounded-md bg-white">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="px-2 py-1 text-stone-600 hover:text-black transition-colors"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="px-2 text-xs font-semibold">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="px-2 py-1 text-stone-600 hover:text-black transition-colors"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                          {/* Price */}
                          <div className="text-right">
                            <span className="font-semibold text-sm text-onyx-950">
                              {formatPrice(item.unit_price * item.quantity)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Bottom Footer Section (if items exist) */}
              {items.length > 0 && (
                <div className="border-t border-cream-200 bg-white p-6 space-y-4 shadow-lg">
                  {/* Gift wrap option */}
                  <div className="flex items-center justify-between text-xs py-1 border-b border-cream-100">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={isGiftWrap}
                        onChange={(e) => setIsGiftWrap(e.target.checked)}
                        className="rounded border-stone-300 text-gold-600 focus:ring-gold-500"
                      />
                      <Gift className="w-3.5 h-3.5 text-gold-600" />
                      <span>Luxury Gift Wrap & Handwritten Card</span>
                    </label>
                    <span className="font-medium text-stone-700">+₹99</span>
                  </div>

                  {/* Coupon section */}
                  {appliedCoupon ? (
                    <div className="flex items-center justify-between bg-gold-50 border border-gold-200 px-3 py-2 rounded-lg text-xs">
                      <div className="flex items-center gap-1.5 text-gold-900 font-medium">
                        <Tag className="w-3.5 h-3.5 text-gold-600" />
                        <span>Code <strong>{appliedCoupon.code}</strong> applied (-{formatPrice(discountAmount)})</span>
                      </div>
                      <button
                        onClick={removeCoupon}
                        className="text-stone-500 hover:text-red-600 font-semibold text-[11px]"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleApplyCoupon} className="flex gap-2">
                      <div className="relative flex-1">
                        <input
                          type="text"
                          placeholder="Coupon Code (e.g. AURA10)"
                          value={couponInput}
                          onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                          className="w-full text-xs uppercase px-3 py-2 border border-cream-300 rounded bg-cream-50 focus:outline-none focus:border-gold-500"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={couponLoading || !couponInput.trim()}
                        className="px-4 py-2 bg-stone-900 text-cream-50 text-xs font-semibold rounded hover:bg-gold-600 transition-colors disabled:opacity-50"
                      >
                        {couponLoading ? '...' : 'Apply'}
                      </button>
                    </form>
                  )}
                  {couponError && <p className="text-red-500 text-[11px]">{couponError}</p>}

                  {/* Calculations */}
                  <div className="space-y-1.5 text-xs text-stone-600">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span className="font-medium text-stone-900">{formatPrice(subtotal)}</span>
                    </div>
                    {discountAmount > 0 && (
                      <div className="flex justify-between text-emerald-700 font-medium">
                        <span>Discount Coupon</span>
                        <span>-{formatPrice(discountAmount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Estimated GST (3%)</span>
                      <span>{formatPrice(taxAmount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Shipping</span>
                      <span>{shippingFee === 0 ? <span className="text-emerald-700 font-semibold">FREE</span> : formatPrice(shippingFee)}</span>
                    </div>
                    <div className="flex justify-between text-sm font-semibold text-onyx-950 pt-2 border-t border-cream-200">
                      <span>Order Total</span>
                      <span className="text-base text-gold-700">{formatPrice(totalAmount)}</span>
                    </div>
                  </div>

                  {/* Checkout Button */}
                  <button
                    onClick={handleCheckout}
                    className="w-full py-3.5 bg-onyx-950 text-cream-50 rounded-lg font-medium text-xs tracking-widest uppercase hover:bg-gold-600 transition-all shadow-luxury flex items-center justify-center gap-2 group"
                  >
                    <span>Proceed to Checkout</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>

                  <div className="text-center">
                    <Link
                      to="/cart"
                      onClick={() => setIsCartOpen(false)}
                      className="text-[11px] text-stone-500 hover:text-onyx-950 underline underline-offset-4"
                    >
                      View Detailed Cart Page
                    </Link>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};

