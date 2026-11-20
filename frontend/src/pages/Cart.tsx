import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, Gift, Sparkles, Tag, ShieldCheck } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useCurrency } from '../context/CurrencyContext';

export const Cart: React.FC = () => {
  const {
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
    clearCart,
    isGiftWrap,
    setIsGiftWrap,
    giftNote,
    setGiftNote,
  } = useCart();

  const { formatPrice } = useCurrency();
  const navigate = useNavigate();
  const [couponCode, setCouponCode] = useState('');
  const [couponError, setCouponError] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    setCouponError('');
    const res = await applyCoupon(couponCode);
    setCouponLoading(false);
    if (!res.success) {
      setCouponError(res.message);
    } else {
      setCouponCode('');
    }
  };

  const amountNeeded = Math.max(0, freeShippingThreshold - subtotal);

  if (items.length === 0) {
    return (
      <div className="min-h-[70vh] bg-cream-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 rounded-full bg-cream-200 flex items-center justify-center text-gold-600 mb-4">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h2 className="font-serif text-3xl font-medium text-onyx-950 mb-2">Your Shopping Bag is Empty</h2>
        <p className="text-stone-500 text-sm max-w-sm mb-6">
          Explore our handcrafted demi-fine creations and timeless resin heirlooms to find your statement piece.
        </p>
        <Link
          to="/shop"
          className="px-8 py-3.5 bg-onyx-950 text-cream-50 text-xs font-semibold uppercase tracking-widest rounded-lg hover:bg-gold-600 transition-colors shadow-luxury"
        >
          Explore Collection
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <span className="text-xs uppercase tracking-[0.25em] text-gold-700 font-bold block mb-1">
            Order Review
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-medium text-onyx-950">
            Shopping Bag ({itemCount} {itemCount === 1 ? 'Piece' : 'Pieces'})
          </h1>
        </div>

        {/* Free Shipping Alert Bar */}
        <div className="mb-8 p-4 rounded-xl bg-white border border-cream-200 shadow-soft">
          <div className="flex items-center justify-between text-xs mb-2">
            {amountNeeded > 0 ? (
              <span className="text-stone-700">
                Add <strong className="text-gold-700">{formatPrice(amountNeeded)}</strong> more to unlock <strong className="text-onyx-950">Complimentary Luxury Delivery</strong>
              </span>
            ) : (
              <span className="text-emerald-700 font-semibold flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" />
                Congratulations! You unlocked Free Insured Express Delivery.
              </span>
            )}
            <span className="font-bold text-stone-600">{freeShippingProgress}%</span>
          </div>
          <div className="w-full bg-cream-200 h-2 rounded-full overflow-hidden">
            <div
              className="bg-gold-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${freeShippingProgress}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Left Column: Items Table */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-2xl border border-cream-200 shadow-soft divide-y divide-cream-200 overflow-hidden">
              {items.map((item) => (
                <div key={item.id} className="p-6 flex flex-col sm:flex-row gap-5 items-start sm:items-center justify-between">
                  <div className="flex gap-4 items-center">
                    <img
                      src={item.product?.images?.[0]?.image_url || 'https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=400&q=80'}
                      alt={item.product?.title}
                      className="w-20 h-24 rounded-xl object-cover object-center bg-cream-100 border border-cream-300 shrink-0"
                    />
                    <div>
                      <Link
                        to={`/product/${item.product?.slug}`}
                        className="font-serif text-base font-semibold text-onyx-950 hover:text-gold-700 transition-colors"
                      >
                        {item.product?.title}
                      </Link>
                      {item.variant && (
                        <p className="text-xs text-stone-500 mt-0.5">{item.variant.title}</p>
                      )}
                      <p className="text-[11px] text-gold-700 font-medium mt-0.5">
                        18K Gold Plated • Anti-Tarnish
                      </p>
                      <span className="text-sm font-semibold text-onyx-950 sm:hidden block mt-2">
                        {formatPrice(item.unit_price * item.quantity)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-end">
                    {/* Quantity Selector */}
                    <div className="flex items-center border border-cream-300 rounded-lg bg-cream-50">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="px-3 py-1.5 text-stone-600 hover:text-black font-bold text-xs"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="px-3 text-xs font-bold">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="px-3 py-1.5 text-stone-600 hover:text-black font-bold text-xs"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Total Price */}
                    <span className="hidden sm:block font-serif text-base font-bold text-onyx-950 min-w-[90px] text-right">
                      {formatPrice(item.unit_price * item.quantity)}
                    </span>

                    {/* Delete item */}
                    <button
                      onClick={() => removeItem(item.id)}
                      className="p-1.5 text-stone-400 hover:text-red-600 transition-colors"
                      title="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Gift Wrap Card */}
            <div className="bg-white rounded-2xl p-6 border border-cream-200 shadow-soft">
              <label className="flex items-center justify-between cursor-pointer">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={isGiftWrap}
                    onChange={(e) => setIsGiftWrap(e.target.checked)}
                    className="rounded text-gold-600 focus:ring-gold-500 w-4 h-4"
                  />
                  <div>
                    <h4 className="font-serif text-sm font-semibold text-onyx-950 flex items-center gap-1.5">
                      <Gift className="w-4 h-4 text-gold-600" />
                      Luxury Atelier Gift Wrap (+₹99)
                    </h4>
                    <p className="text-xs text-stone-500">Includes handcrafted champagne box, gold foil seal & handwritten card</p>
                  </div>
                </div>
                <span className="font-semibold text-xs text-stone-800">₹99</span>
              </label>

              {isGiftWrap && (
                <div className="mt-4 pt-4 border-t border-cream-100">
                  <label className="block text-xs font-medium text-stone-700 mb-1">
                    Your Personalized Gift Message:
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Write a message to be hand-lettered on gold foil cardstock..."
                    value={giftNote}
                    onChange={(e) => setGiftNote(e.target.value)}
                    className="w-full p-2.5 bg-cream-50 border border-cream-300 rounded-lg text-xs focus:outline-none focus:border-gold-500"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Order Summary & Coupon */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 border border-cream-200 shadow-soft space-y-4">
              <h3 className="font-serif text-lg font-semibold text-onyx-950 pb-3 border-b border-cream-200">
                Order Summary
              </h3>

              {/* Coupon Form */}
              {appliedCoupon ? (
                <div className="p-3 bg-gold-50 border border-gold-300 rounded-xl flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-gold-900 font-medium">
                    <Tag className="w-4 h-4 text-gold-600" />
                    <span>Coupon <strong>{appliedCoupon.code}</strong> applied</span>
                  </div>
                  <button
                    onClick={removeCoupon}
                    className="text-stone-500 hover:text-red-600 font-bold text-[11px]"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="space-y-1">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Coupon Code (e.g. AURA10)"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      className="flex-1 uppercase text-xs px-3 py-2.5 bg-cream-50 border border-cream-300 rounded-lg focus:outline-none focus:border-gold-500"
                    />
                    <button
                      type="submit"
                      disabled={couponLoading || !couponCode.trim()}
                      className="px-4 py-2.5 bg-onyx-950 text-cream-50 text-xs font-semibold rounded-lg hover:bg-gold-600 transition-colors disabled:opacity-50"
                    >
                      {couponLoading ? '...' : 'Apply'}
                    </button>
                  </div>
                  {couponError && <p className="text-red-500 text-[11px] pt-1">{couponError}</p>}
                </form>
              )}

              {/* Calculations breakdown */}
              <div className="space-y-2 text-xs text-stone-600 pt-2 border-t border-cream-100">
                <div className="flex justify-between">
                  <span>Bag Subtotal</span>
                  <span className="font-medium text-stone-900">{formatPrice(subtotal)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-medium">
                    <span>Coupon Discount</span>
                    <span>-{formatPrice(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Jewellery GST (3%)</span>
                  <span>{formatPrice(taxAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Insured Express Shipping</span>
                  <span>
                    {shippingFee === 0 ? (
                      <span className="text-emerald-700 font-semibold">FREE</span>
                    ) : (
                      formatPrice(shippingFee)
                    )}
                  </span>
                </div>

                <div className="pt-3 border-t border-cream-200 flex justify-between items-baseline text-sm font-semibold text-onyx-950">
                  <span>Total Payable</span>
                  <span className="font-serif text-2xl text-gold-700 font-bold">
                    {formatPrice(totalAmount)}
                  </span>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                onClick={() => navigate('/checkout')}
                className="w-full py-4 bg-onyx-950 text-cream-50 rounded-lg text-xs font-semibold uppercase tracking-widest hover:bg-gold-600 transition-all shadow-luxury flex items-center justify-center gap-2 group"
              >
                <span>Proceed to Secure Checkout</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <div className="flex items-center justify-center gap-2 text-[11px] text-stone-400 pt-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Encrypted 256-Bit SSL Checkout Protection</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

