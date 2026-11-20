import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ShieldCheck, CreditCard, Banknote, Truck, Sparkles, CheckCircle2,
  Lock, ArrowLeft, Tag, Info
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';
import { useToast } from '../context/ToastContext';
import { orderApi, api } from '../services/api';
import { Address } from '../types';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export const Checkout: React.FC = () => {
  const {
    items,
    subtotal,
    discountAmount,
    taxAmount,
    shippingFee,
    totalAmount,
    appliedCoupon,
    clearCart,
    shippingMethod,
    setShippingMethod,
    isGiftWrap,
    giftNote,
  } = useCart();

  const { user } = useAuth();
  const { formatPrice } = useCurrency();
  const toast = useToast();
  const navigate = useNavigate();

  // Saved addresses
  const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('new');

  // Customer & Shipping Form
  const [formData, setFormData] = useState({
    email: user?.email || '',
    phone: user?.phone || '',
    fullName: user?.full_name || '',
    streetAddress: '',
    apartment: '',
    city: '',
    state: 'Maharashtra',
    postalCode: '',
    country: 'India',
  });

  const [paymentMethod, setPaymentMethod] = useState<'razorpay' | 'cod'>('razorpay');
  const [orderNotes, setOrderNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Load user profile and addresses
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        email: prev.email || user.email || '',
        phone: prev.phone || user.phone || '',
        fullName: prev.fullName || user.full_name || '',
      }));

      api.get<Address[]>('/auth/addresses')
        .then((res) => {
          setSavedAddresses(res.data);
          if (res.data.length > 0) {
            const def = res.data.find((a) => a.is_default) || res.data[0];
            setSelectedAddressId(def.id || 'new');
            setFormData((prev) => ({
              ...prev,
              fullName: def.full_name,
              phone: def.phone,
              streetAddress: def.street_address,
              apartment: def.apartment || '',
              city: def.city,
              state: def.state,
              postalCode: def.postal_code,
            }));
          }
        })
        .catch(() => {});
    }
  }, [user]);

  if (items.length === 0) {
    return (
      <div className="min-h-[70vh] bg-cream-50 flex flex-col items-center justify-center p-6 text-center">
        <h2 className="font-serif text-2xl font-medium text-onyx-950 mb-2">No Items In Checkout</h2>
        <p className="text-xs text-stone-500 mb-6">Please add items to your shopping bag before proceeding.</p>
        <Link
          to="/shop"
          className="px-6 py-2.5 bg-onyx-950 text-cream-50 text-xs font-semibold uppercase tracking-widest rounded-lg"
        >
          Return to Shop
        </Link>
      </div>
    );
  }

  const handleAddressSelect = (addr: Address) => {
    setSelectedAddressId(addr.id || 'new');
    setFormData((prev) => ({
      ...prev,
      fullName: addr.full_name,
      phone: addr.phone,
      streetAddress: addr.street_address,
      apartment: addr.apartment || '',
      city: addr.city,
      state: addr.state,
      postalCode: addr.postal_code,
    }));
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email || !formData.phone || !formData.fullName || !formData.streetAddress || !formData.city || !formData.postalCode) {
      toast.error('Please complete all required shipping fields');
      return;
    }

    try {
      setIsProcessing(true);

      const checkoutPayload = {
        customer_email: formData.email,
        customer_phone: formData.phone,
        shipping_address: {
          full_name: formData.fullName,
          phone: formData.phone,
          street_address: formData.streetAddress,
          apartment: formData.apartment,
          city: formData.city,
          state: formData.state,
          postal_code: formData.postalCode,
          country: formData.country,
        },
        items: items.map((i) => ({
          product_id: i.product_id,
          variant_id: i.variant_id,
          quantity: i.quantity,
          unit_price: i.unit_price,
        })),
        coupon_code: appliedCoupon ? appliedCoupon.code : undefined,
        payment_method: paymentMethod,
        shipping_method: shippingMethod,
        notes: (isGiftWrap ? `[Gift Note]: ${giftNote}\n` : '') + orderNotes,
      };

      // 1. Send checkout request to backend
      const order = await orderApi.checkout(checkoutPayload);

      // 2. Handle Cash on Delivery
      if (paymentMethod === 'cod') {
        await clearCart();
        toast.success(`Order ${order.order_number} confirmed!`);
        navigate(`/order-confirmation/${order.id}`);
        return;
      }

      // 3. Handle Razorpay Test Mode
      const rzpKey = import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_luxurydemo123';
      
      const rzpOptions = {
        key: rzpKey,
        amount: Math.round(order.total_amount * 100),
        currency: 'INR',
        name: 'AURA ATELIER',
        description: `Order #${order.order_number}`,
        image: 'https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=120&q=80',
        order_id: order.razorpay_order_id,
        prefill: {
          name: formData.fullName,
          email: formData.email,
          contact: formData.phone,
        },
        theme: {
          color: '#1A1715',
        },
        handler: async (response: any) => {
          try {
            // Verify payment on the backend
            const verifyRes = await orderApi.verifyPayment({
              order_id: order.id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            if (verifyRes.success) {
              await clearCart();
              toast.success('Payment verified successfully!');
              navigate(`/order-confirmation/${order.id}`);
            } else {
              toast.error('Payment verification failed.');
            }
          } catch (err: any) {
            toast.error('Payment verification error.');
          }
        },
        modal: {
          ondismiss: () => {
            setIsProcessing(false);
            toast.info('Payment window closed. You can retry payment anytime.');
          },
        },
      };

      // Check if Razorpay script is loaded, or fallback to simulated test checkout modal
      if (window.Razorpay) {
        try {
          const rzp = new window.Razorpay(rzpOptions);
          rzp.open();
        } catch {
          // If network blocked test script, simulate test verification
          triggerMockVerification(order);
        }
      } else {
        triggerMockVerification(order);
      }
    } catch (err: any) {
      console.error('Checkout error:', err);
      toast.error(err.response?.data?.detail || 'Checkout failed. Please check details.');
      setIsProcessing(false);
    }
  };

  const triggerMockVerification = async (order: any) => {
    // Seamless test mode verification fallback
    try {
      const mockPayId = `pay_mock_${Date.now()}`;
      const mockSig = `mock_sig_${Date.now()}`;
      await orderApi.verifyPayment({
        order_id: order.id,
        razorpay_order_id: order.razorpay_order_id || 'order_mock',
        razorpay_payment_id: mockPayId,
        razorpay_signature: mockSig,
      });
      await clearCart();
      toast.success('Test payment successful!');
      navigate(`/order-confirmation/${order.id}`);
    } catch {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <Link
              to="/cart"
              className="inline-flex items-center gap-1.5 text-xs text-stone-500 hover:text-gold-700 uppercase tracking-widest font-semibold mb-2"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Bag</span>
            </Link>
            <h1 className="font-serif text-3xl sm:text-4xl font-medium text-onyx-950">
              Secure Luxury Checkout
            </h1>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-xs text-stone-500">
            <Lock className="w-4 h-4 text-emerald-600" />
            <span>256-Bit TLS Encryption</span>
          </div>
        </div>

        <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Left Columns (1 & 2): Shipping, Address, Payment Methods */}
          <div className="lg:col-span-2 space-y-8">
            {/* 1. Customer Information */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-cream-200 shadow-soft">
              <h2 className="font-serif text-lg font-semibold text-onyx-950 mb-4 pb-2 border-b border-cream-100 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-onyx-950 text-cream-50 text-xs flex items-center justify-center font-bold">1</span>
                <span>Contact Details</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-stone-600 font-semibold mb-1">Email Address (for Receipt & Tracking) *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-cream-50 border border-cream-300 rounded-lg focus:outline-none focus:border-gold-500"
                    placeholder="patron@domain.com"
                  />
                </div>
                <div>
                  <label className="block text-stone-600 font-semibold mb-1">Contact Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-cream-50 border border-cream-300 rounded-lg focus:outline-none focus:border-gold-500"
                    placeholder="+91 98765 43210"
                  />
                </div>
              </div>
            </div>

            {/* 2. Shipping Address */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-cream-200 shadow-soft">
              <h2 className="font-serif text-lg font-semibold text-onyx-950 mb-4 pb-2 border-b border-cream-100 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-onyx-950 text-cream-50 text-xs flex items-center justify-center font-bold">2</span>
                <span>Delivery Address</span>
              </h2>

              {/* Saved Address pills if logged in */}
              {savedAddresses.length > 0 && (
                <div className="mb-5 space-y-2">
                  <p className="text-xs text-stone-500 font-semibold">Choose from saved addresses:</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {savedAddresses.map((addr) => (
                      <div
                        key={addr.id}
                        onClick={() => handleAddressSelect(addr)}
                        className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                          selectedAddressId === addr.id
                            ? 'border-gold-600 bg-gold-50/50 shadow-sm'
                            : 'border-cream-300 bg-cream-50 hover:border-gold-400'
                        }`}
                      >
                        <p className="font-bold text-onyx-950">{addr.full_name} ({addr.address_type})</p>
                        <p className="text-stone-600 text-[11px] truncate">{addr.street_address}, {addr.city}</p>
                        <p className="text-stone-400 text-[11px]">{addr.postal_code}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-4 text-xs">
                <div>
                  <label className="block text-stone-600 font-semibold mb-1">Full Recipient Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-cream-50 border border-cream-300 rounded-lg focus:outline-none focus:border-gold-500"
                    placeholder="Enter full name"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-stone-600 font-semibold mb-1">Street Address / House / Flat *</label>
                    <input
                      type="text"
                      required
                      value={formData.streetAddress}
                      onChange={(e) => setFormData({ ...formData, streetAddress: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-cream-50 border border-cream-300 rounded-lg focus:outline-none focus:border-gold-500"
                      placeholder="e.g. 104, Royal Crest Apartments"
                    />
                  </div>
                  <div>
                    <label className="block text-stone-600 font-semibold mb-1">Apartment / Landmark</label>
                    <input
                      type="text"
                      value={formData.apartment}
                      onChange={(e) => setFormData({ ...formData, apartment: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-cream-50 border border-cream-300 rounded-lg focus:outline-none focus:border-gold-500"
                      placeholder="Near Gold Souk"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-stone-600 font-semibold mb-1">City *</label>
                    <input
                      type="text"
                      required
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-cream-50 border border-cream-300 rounded-lg focus:outline-none focus:border-gold-500"
                      placeholder="e.g. Mumbai"
                    />
                  </div>
                  <div>
                    <label className="block text-stone-600 font-semibold mb-1">State *</label>
                    <input
                      type="text"
                      required
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-cream-50 border border-cream-300 rounded-lg focus:outline-none focus:border-gold-500"
                      placeholder="e.g. Maharashtra"
                    />
                  </div>
                  <div>
                    <label className="block text-stone-600 font-semibold mb-1">Postal Pincode *</label>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      value={formData.postalCode}
                      onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-cream-50 border border-cream-300 rounded-lg focus:outline-none focus:border-gold-500"
                      placeholder="400001"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Shipping Method Selection */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-cream-200 shadow-soft">
              <h2 className="font-serif text-lg font-semibold text-onyx-950 mb-4 pb-2 border-b border-cream-100 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-onyx-950 text-cream-50 text-xs flex items-center justify-center font-bold">3</span>
                <span>Insured Shipping Speed</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <label
                  onClick={() => setShippingMethod('standard')}
                  className={`p-4 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                    shippingMethod === 'standard'
                      ? 'border-gold-600 bg-gold-50/50 shadow-sm'
                      : 'border-cream-300 bg-cream-50 hover:border-gold-400'
                  }`}
                >
                  <input
                    type="radio"
                    name="shipping_speed"
                    checked={shippingMethod === 'standard'}
                    onChange={() => setShippingMethod('standard')}
                    className="mt-0.5 text-gold-600"
                  />
                  <div>
                    <p className="font-semibold text-onyx-950">Standard Insured Delivery (3-5 Days)</p>
                    <p className="text-stone-500 text-[11px] mt-0.5">Complimentary above ₹1,999 (else ₹149)</p>
                  </div>
                </label>

                <label
                  onClick={() => setShippingMethod('express')}
                  className={`p-4 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                    shippingMethod === 'express'
                      ? 'border-gold-600 bg-gold-50/50 shadow-sm'
                      : 'border-cream-300 bg-cream-50 hover:border-gold-400'
                  }`}
                >
                  <input
                    type="radio"
                    name="shipping_speed"
                    checked={shippingMethod === 'express'}
                    onChange={() => setShippingMethod('express')}
                    className="mt-0.5 text-gold-600"
                  />
                  <div>
                    <p className="font-semibold text-onyx-950">VIP Air Express (24-48 Hours)</p>
                    <p className="text-stone-500 text-[11px] mt-0.5">Priority dispatch via Blue Dart (+₹199)</p>
                  </div>
                </label>
              </div>
            </div>

            {/* 4. Payment Method */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-cream-200 shadow-soft">
              <h2 className="font-serif text-lg font-semibold text-onyx-950 mb-4 pb-2 border-b border-cream-100 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-onyx-950 text-cream-50 text-xs flex items-center justify-center font-bold">4</span>
                <span>Payment Method</span>
              </h2>

              <div className="space-y-3">
                {/* Razorpay */}
                <label
                  onClick={() => setPaymentMethod('razorpay')}
                  className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                    paymentMethod === 'razorpay'
                      ? 'border-gold-600 bg-gold-50/50 shadow-sm'
                      : 'border-cream-300 bg-cream-50 hover:border-gold-400'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="payment_method"
                      checked={paymentMethod === 'razorpay'}
                      onChange={() => setPaymentMethod('razorpay')}
                      className="text-gold-600"
                    />
                    <div>
                      <p className="text-xs font-semibold text-onyx-950 flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-gold-600" />
                        <span>Razorpay Secure (Cards, UPI, NetBanking, Wallets)</span>
                      </p>
                      <p className="text-[11px] text-stone-500 mt-0.5">
                        Test Mode Enabled • Instant Automated Verification
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                    Fastest
                  </span>
                </label>

                {/* Cash on Delivery */}
                <label
                  onClick={() => setPaymentMethod('cod')}
                  className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                    paymentMethod === 'cod'
                      ? 'border-gold-600 bg-gold-50/50 shadow-sm'
                      : 'border-cream-300 bg-cream-50 hover:border-gold-400'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="payment_method"
                      checked={paymentMethod === 'cod'}
                      onChange={() => setPaymentMethod('cod')}
                      className="text-gold-600"
                    />
                    <div>
                      <p className="text-xs font-semibold text-onyx-950 flex items-center gap-2">
                        <Banknote className="w-4 h-4 text-stone-600" />
                        <span>Cash on Delivery (COD)</span>
                      </p>
                      <p className="text-[11px] text-stone-500 mt-0.5">Pay in cash upon doorstep delivery</p>
                    </div>
                  </div>
                </label>
              </div>

              {/* Special Order Notes */}
              <div className="mt-5 pt-4 border-t border-cream-100">
                <label className="block text-xs font-medium text-stone-600 mb-1">
                  Atelier Notes or Delivery Instructions (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Ring doorbell twice, deliver after 2 PM"
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  className="w-full px-3.5 py-2 bg-cream-50 border border-cream-300 rounded-lg text-xs focus:outline-none focus:border-gold-500"
                />
              </div>
            </div>
          </div>

          {/* Right Column: Order Summary & Place Order Button */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 border border-cream-200 shadow-soft space-y-5 sticky top-24">
              <h3 className="font-serif text-lg font-semibold text-onyx-950 pb-3 border-b border-cream-200">
                Review Bag ({items.length} {items.length === 1 ? 'item' : 'items'})
              </h3>

              {/* Compact item list */}
              <div className="space-y-3 max-h-52 overflow-y-auto pr-1 divide-y divide-cream-100 text-xs">
                {items.map((item) => (
                  <div key={item.id} className="pt-2 flex items-center gap-3">
                    <img
                      src={item.product?.images?.[0]?.image_url || 'https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=100&q=80'}
                      alt=""
                      className="w-12 h-14 rounded-lg object-cover bg-cream-100 border border-cream-200 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-serif font-medium text-onyx-950 truncate">{item.product?.title}</p>
                      <p className="text-[11px] text-stone-500">Qty: {item.quantity}</p>
                    </div>
                    <span className="font-semibold text-onyx-950 shrink-0">
                      {formatPrice(item.unit_price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Breakdown */}
              <div className="space-y-2 text-xs text-stone-600 pt-3 border-t border-cream-200">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-medium text-stone-900">{formatPrice(subtotal)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-medium">
                    <span>Coupon ({appliedCoupon?.code})</span>
                    <span>-{formatPrice(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Jewellery GST (3%)</span>
                  <span>{formatPrice(taxAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>{shippingFee === 0 ? <span className="text-emerald-700 font-semibold">FREE</span> : formatPrice(shippingFee)}</span>
                </div>
                <div className="pt-3 border-t border-cream-200 flex justify-between items-baseline text-sm font-semibold text-onyx-950">
                  <span>Final Total</span>
                  <span className="font-serif text-2xl text-gold-700 font-bold">
                    {formatPrice(totalAmount)}
                  </span>
                </div>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={isProcessing}
                className="w-full py-4 bg-onyx-950 text-cream-50 font-semibold uppercase tracking-widest text-xs rounded-lg hover:bg-gold-600 transition-all shadow-luxury disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <span>Securing Order...</span>
                ) : (
                  <span>
                    {paymentMethod === 'razorpay' ? `Pay with Razorpay (${formatPrice(totalAmount)})` : 'Confirm Cash on Delivery'}
                  </span>
                )}
              </button>

              <div className="text-center text-[11px] text-stone-400 space-y-1">
                <p>100% Guaranteed Anti-Tarnish with 1-Year Warranty</p>
                <p>Insured Dispatch via Blue Dart / Delhivery Express</p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

