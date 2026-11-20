import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles, ShieldCheck, Truck, RefreshCw, Heart, Send,
  Instagram, Facebook, MessageCircle, Mail, Phone, MapPin
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export const Footer: React.FC = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const toast = useToast();

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      toast.error('Please provide a valid email address');
      return;
    }
    setSubscribed(true);
    toast.success('Welcome to the Atelier! Use code WELCOME10 for 10% off your first purchase.');
    setEmail('');
  };

  return (
    <footer className="bg-onyx-950 text-cream-100 pt-16 pb-12 border-t border-gold-500/20">
      {/* Top Value Pillars */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 border-b border-stone-800">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center md:text-left">
          <div className="flex flex-col md:flex-row items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-onyx-900 border border-gold-500/30 flex items-center justify-center text-gold-400 shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-serif font-medium text-sm text-cream-50">18K PVD Anti-Tarnish</h4>
              <p className="text-xs text-stone-400">1-year color warranty on all pieces</p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-onyx-900 border border-gold-500/30 flex items-center justify-center text-gold-400 shrink-0">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-serif font-medium text-sm text-cream-50">Complimentary Delivery</h4>
              <p className="text-xs text-stone-400">Insured express shipping above ₹1,999</p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-onyx-900 border border-gold-500/30 flex items-center justify-center text-gold-400 shrink-0">
              <RefreshCw className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-serif font-medium text-sm text-cream-50">Hassle-Free Returns</h4>
              <p className="text-xs text-stone-400">7-day easy exchange & dedicated support</p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-onyx-900 border border-gold-500/30 flex items-center justify-center text-gold-400 shrink-0">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-serif font-medium text-sm text-cream-50">Luxury Gift Packaging</h4>
              <p className="text-xs text-stone-400">Bespoke velvet box & certificate</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full border border-gold-400/80 bg-onyx-900 flex items-center justify-center text-gold-400">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <div>
                <span className="font-serif tracking-[0.25em] text-xl font-bold uppercase text-cream-50 block leading-tight">
                  AURA
                </span>
                <span className="text-[8px] tracking-[0.35em] uppercase text-gold-400 block -mt-1 font-semibold">
                  ATELIER
                </span>
              </div>
            </div>
            <p className="text-xs leading-relaxed text-stone-400 max-w-sm">
              Makers of artisanal demi-fine and resin adornments. Inspired by classical antiquity and modern high-fashion aesthetics, we create timeless pieces meant to be lived in, loved, and treasured.
            </p>
            <div className="pt-2 flex items-center gap-3 text-stone-400">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-full border border-stone-800 flex items-center justify-center hover:text-gold-400 hover:border-gold-500 transition-colors"
                title="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="https://wa.me/919876543210"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-full border border-stone-800 flex items-center justify-center hover:text-emerald-400 hover:border-emerald-500 transition-colors"
                title="WhatsApp Concierge"
              >
                <MessageCircle className="w-4 h-4" />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-full border border-stone-800 flex items-center justify-center hover:text-gold-400 hover:border-gold-500 transition-colors"
                title="Facebook"
              >
                <Facebook className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Categories */}
          <div>
            <h5 className="font-serif text-sm uppercase tracking-wider text-cream-50 font-medium mb-4">
              Collections
            </h5>
            <ul className="space-y-2.5 text-xs text-stone-400">
              <li><Link to="/category/earrings" className="hover:text-gold-400 transition-colors">Earrings & Studs</Link></li>
              <li><Link to="/category/necklaces" className="hover:text-gold-400 transition-colors">Chokers & Necklaces</Link></li>
              <li><Link to="/category/rings" className="hover:text-gold-400 transition-colors">Solitaire & Dome Rings</Link></li>
              <li><Link to="/category/bracelets" className="hover:text-gold-400 transition-colors">Bracelets & Cuffs</Link></li>
              <li><Link to="/category/pendant-sets" className="hover:text-gold-400 transition-colors">Pendant Chains</Link></li>
              <li><Link to="/category/jewellery-sets" className="hover:text-gold-400 transition-colors">Royal Bridal Sets</Link></li>
              <li><Link to="/category/gift-collections" className="hover:text-gold-400 transition-colors">Curated Gift Boxes</Link></li>
            </ul>
          </div>

          {/* Client Care */}
          <div>
            <h5 className="font-serif text-sm uppercase tracking-wider text-cream-50 font-medium mb-4">
              Client Care
            </h5>
            <ul className="space-y-2.5 text-xs text-stone-400">
              <li><Link to="/account?tab=orders" className="hover:text-gold-400 transition-colors">Track Your Shipment</Link></li>
              <li><Link to="/faq" className="hover:text-gold-400 transition-colors">Care Guide & Anti-Tarnish</Link></li>
              <li><Link to="/faq#shipping" className="hover:text-gold-400 transition-colors">Shipping & Delivery Rates</Link></li>
              <li><Link to="/faq#returns" className="hover:text-gold-400 transition-colors">Returns & Exchange Policy</Link></li>
              <li><Link to="/about" className="hover:text-gold-400 transition-colors">The Atelier Story</Link></li>
              <li><Link to="/contact" className="hover:text-gold-400 transition-colors">Contact Concierge</Link></li>
            </ul>
          </div>

          {/* Newsletter Form */}
          <div>
            <h5 className="font-serif text-sm uppercase tracking-wider text-cream-50 font-medium mb-4">
              Atelier Gazette
            </h5>
            <p className="text-xs text-stone-400 mb-3">
              Join our salon of connoisseurs. Receive private collection previews and an instant 10% voucher code.
            </p>
            {subscribed ? (
              <div className="p-3 bg-stone-900 border border-gold-500/40 rounded-lg text-xs text-gold-300">
                ✓ Thank you for subscribing! Your voucher code is <strong className="text-white">WELCOME10</strong>.
              </div>
            ) : (
              <form onSubmit={handleNewsletterSubmit} className="space-y-2">
                <div className="relative">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 bg-onyx-900 border border-stone-800 rounded-lg text-cream-100 placeholder:text-stone-500 focus:outline-none focus:border-gold-500 transition-colors"
                  />
                  <button
                    type="submit"
                    className="absolute right-1.5 top-1.5 p-1.5 bg-gold-500 text-onyx-950 rounded hover:bg-gold-400 transition-colors"
                    title="Subscribe"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
                <span className="text-[10px] text-stone-500 block">We respect your privacy. Unsubscribe anytime.</span>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Payment Partners & Bottom Line */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 border-t border-stone-800 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-stone-500">
        <div>
          © {new Date().getFullYear()} AURA ATELIER Luxury Jewellery. All Rights Reserved. Inspired by ResionAura aesthetic.
        </div>

        {/* Payment Methods */}
        <div className="flex items-center gap-3">
          <span className="text-[11px] text-stone-400">Secured with 256-bit SSL:</span>
          <div className="flex items-center gap-2 text-[10px] font-bold text-stone-400">
            <span className="px-2 py-0.5 rounded bg-stone-900 border border-stone-800">RAZORPAY</span>
            <span className="px-2 py-0.5 rounded bg-stone-900 border border-stone-800">UPI</span>
            <span className="px-2 py-0.5 rounded bg-stone-900 border border-stone-800">VISA</span>
            <span className="px-2 py-0.5 rounded bg-stone-900 border border-stone-800">MASTERCARD</span>
            <span className="px-2 py-0.5 rounded bg-stone-900 border border-stone-800">CASH ON DELIVERY</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

