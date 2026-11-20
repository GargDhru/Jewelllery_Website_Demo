import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import {
  CheckCircle2, Package, Truck, Printer, ArrowRight, ShieldCheck,
  Calendar, MapPin, Mail, Sparkles
} from 'lucide-react';
import { orderApi } from '../services/api';
import { Order } from '../types';
import { useCurrency } from '../context/CurrencyContext';

export const OrderConfirmation: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const { formatPrice } = useCurrency();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fire celebration confetti!
    try {
      confetti({
        particleCount: 90,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#D4AF37', '#E8D8C8', '#B89228', '#1A1715'],
      });
    } catch {}

    const fetchOrder = async () => {
      if (!orderId) return;
      try {
        setLoading(true);
        const data = await orderApi.getById(orderId);
        setOrder(data);
      } catch (err) {
        console.error('Failed to load order confirmation:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  const handlePrint = () => {
    window.print();
  };

  if (loading || !order) {
    return (
      <div className="min-h-screen bg-cream-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" />
          <p className="font-serif text-onyx-950 text-sm tracking-widest uppercase">
            Loading Heirlooms Receipt...
          </p>
        </div>
      </div>
    );
  }

  const steps = [
    { title: 'Confirmed', desc: 'Order received & verified', done: true },
    { title: 'Processing', desc: 'Handcrafted & quality inspected', done: order.order_status !== 'pending' },
    { title: 'Shipped', desc: order.courier_name ? `Via ${order.courier_name}` : 'Dispatched with insurance', done: ['shipped', 'delivered'].includes(order.order_status) },
    { title: 'Delivered', desc: 'Arrived at your doorstep', done: order.order_status === 'delivered' },
  ];

  return (
    <div className="min-h-screen bg-cream-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Celebration Header */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 rounded-full bg-gold-500/20 text-gold-600 flex items-center justify-center mx-auto mb-4 border border-gold-400">
            <CheckCircle2 className="w-9 h-9 text-gold-600" />
          </div>
          <span className="text-xs uppercase tracking-[0.3em] text-gold-700 font-bold block mb-1">
            Order Confirmation
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-medium text-onyx-950">
            Thank You for Your Patronage
          </h1>
          <p className="text-stone-500 text-xs sm:text-sm mt-2">
            Your piece is now reserved and being prepared in the atelier. Confirmation has been emailed to <strong>{order.customer_email}</strong>.
          </p>
          <div className="mt-4 inline-block px-4 py-1.5 rounded-full bg-white border border-cream-300 shadow-sm text-xs text-onyx-950">
            Order Reference: <strong className="font-mono text-gold-700">{order.order_number}</strong>
          </div>
        </div>

        {/* Order Stepper Tracker */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-cream-200 shadow-soft mb-8">
          <h3 className="font-serif text-base font-semibold text-onyx-950 mb-6 pb-2 border-b border-cream-100 flex items-center gap-2">
            <Truck className="w-4 h-4 text-gold-600" />
            <span>Fulfillment Timeline</span>
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {steps.map((step, idx) => (
              <div key={idx} className="flex flex-col items-center sm:items-start text-center sm:text-left">
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      step.done
                        ? 'bg-gold-500 text-onyx-950'
                        : 'bg-cream-200 text-stone-400'
                    }`}
                  >
                    {idx + 1}
                  </div>
                  <span className={`text-xs font-semibold ${step.done ? 'text-onyx-950' : 'text-stone-400'}`}>
                    {step.title}
                  </span>
                </div>
                <p className="text-[11px] text-stone-500">{step.desc}</p>
              </div>
            ))}
          </div>

          {order.tracking_number && (
            <div className="mt-6 pt-4 border-t border-cream-100 flex items-center justify-between text-xs bg-cream-50 p-3 rounded-lg">
              <span>Courier: <strong>{order.courier_name || 'Blue Dart Air'}</strong></span>
              <span>Tracking Number: <strong className="font-mono text-gold-700">{order.tracking_number}</strong></span>
            </div>
          )}
        </div>

        {/* Order Summary & Receipt */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-cream-200 shadow-soft mb-8 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-cream-200">
            <div className="flex items-center gap-2">
              <Package className="w-5 h-5 text-gold-600" />
              <h3 className="font-serif text-lg font-semibold text-onyx-950">Atelier Invoice Receipt</h3>
            </div>
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 border border-cream-300 rounded-lg text-xs font-medium text-stone-700 hover:bg-cream-50 flex items-center gap-1.5 transition-colors print:hidden"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Receipt</span>
            </button>
          </div>

          {/* Items Table */}
          <div className="divide-y divide-cream-100">
            {order.items.map((item) => (
              <div key={item.id} className="py-3 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <img
                    src={item.image_url || 'https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=100&q=80'}
                    alt=""
                    className="w-12 h-14 rounded object-cover bg-cream-100 border border-cream-200"
                  />
                  <div>
                    <p className="font-serif font-semibold text-sm text-onyx-950">{item.product_title}</p>
                    {item.variant_title && <p className="text-stone-500 text-[11px]">{item.variant_title}</p>}
                    <span className="text-stone-400 text-[11px]">Qty: {item.quantity} × {formatPrice(item.unit_price)}</span>
                  </div>
                </div>
                <span className="font-serif font-bold text-sm text-onyx-950">
                  {formatPrice(item.total_price)}
                </span>
              </div>
            ))}
          </div>

          {/* Pricing breakdown */}
          <div className="pt-4 border-t border-cream-200 space-y-2 text-xs text-stone-600">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-medium text-stone-900">{formatPrice(order.subtotal)}</span>
            </div>
            {order.discount_amount > 0 && (
              <div className="flex justify-between text-emerald-700 font-medium">
                <span>Coupon Savings ({order.coupon_code})</span>
                <span>-{formatPrice(order.discount_amount)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Jewellery GST (3%)</span>
              <span>{formatPrice(order.tax_amount)}</span>
            </div>
            <div className="flex justify-between">
              <span>Insured Delivery</span>
              <span>{order.shipping_fee === 0 ? 'FREE' : formatPrice(order.shipping_fee)}</span>
            </div>
            <div className="pt-3 border-t border-cream-200 flex justify-between items-baseline text-sm font-semibold text-onyx-950">
              <span>Total Paid</span>
              <span className="font-serif text-2xl text-gold-700 font-bold">{formatPrice(order.total_amount)}</span>
            </div>
          </div>

          {/* Customer & Shipping info */}
          <div className="pt-6 border-t border-cream-200 grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs text-stone-600 bg-cream-50/60 p-4 rounded-xl">
            <div>
              <p className="font-bold text-onyx-950 uppercase tracking-wider text-[11px] mb-1">
                Recipient Details
              </p>
              <p className="font-medium text-stone-900">{order.shipping_address?.full_name}</p>
              <p>{order.shipping_address?.street_address}</p>
              <p>{order.shipping_address?.city}, {order.shipping_address?.state} - {order.shipping_address?.postal_code}</p>
              <p className="text-stone-500 mt-1">Phone: {order.customer_phone}</p>
            </div>
            <div>
              <p className="font-bold text-onyx-950 uppercase tracking-wider text-[11px] mb-1">
                Payment Information
              </p>
              <p className="capitalize">Method: <strong>{order.payment_method === 'razorpay' ? 'Razorpay Secure (Paid)' : 'Cash on Delivery'}</strong></p>
              <p className="capitalize">Status: <strong className="text-emerald-700">{order.payment_status}</strong></p>
              <p className="text-stone-500 mt-1">Date: {new Date(order.created_at).toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 print:hidden">
          <Link
            to="/shop"
            className="w-full sm:w-auto px-8 py-3.5 bg-onyx-950 text-cream-50 text-xs font-semibold uppercase tracking-widest rounded-lg hover:bg-gold-600 transition-colors shadow-luxury text-center flex items-center justify-center gap-2"
          >
            <span>Continue Shopping</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/account?tab=orders"
            className="w-full sm:w-auto px-8 py-3.5 bg-white border border-cream-300 text-stone-800 text-xs font-semibold uppercase tracking-widest rounded-lg hover:bg-cream-100 transition-colors text-center"
          >
            Track in My Account
          </Link>
        </div>
      </div>
    </div>
  );
};

