import React, { useState } from 'react';
import { Mail, Phone, MapPin, MessageCircle, Clock, Send, Sparkles } from 'lucide-react';
import { useToast } from '../context/ToastContext';

export const Contact: React.FC = () => {
  const toast = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'Styling Assistance',
    message: '',
  });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      toast.error('Please complete all required fields');
      return;
    }
    setSent(true);
    toast.success('Your enquiry has been received by our private concierge. We will respond within 4 hours.');
  };

  return (
    <div className="min-h-screen bg-cream-50 py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-14">
          <span className="text-xs uppercase tracking-[0.3em] text-gold-700 font-bold block mb-2">
            Private Concierge
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-medium text-onyx-950">
            We Are At Your Service
          </h1>
          <div className="w-16 h-0.5 bg-gold-500 mx-auto mt-3" />
          <p className="text-stone-500 text-xs sm:text-sm mt-3">
            Whether you require personal styling advice, bridal party curations, or custom sizing assistance, our atelier stylists are delighted to assist.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Left Column: Contact Cards */}
          <div className="space-y-4">
            <div className="bg-white p-6 rounded-2xl border border-cream-200 shadow-soft space-y-3">
              <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <MessageCircle className="w-5 h-5" />
              </div>
              <h3 className="font-serif font-semibold text-base text-onyx-950">WhatsApp Concierge</h3>
              <p className="text-xs text-stone-500 leading-relaxed">
                Connect directly with our head stylist for instant photos, custom requests, and real-time guidance.
              </p>
              <a
                href="https://wa.me/919876543210"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-emerald-700 font-bold hover:underline pt-1"
              >
                <span>Chat on WhatsApp (+91 98765 43210)</span>
              </a>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-cream-200 shadow-soft space-y-3">
              <div className="w-10 h-10 rounded-full bg-cream-100 text-gold-600 flex items-center justify-center">
                <Mail className="w-5 h-5" />
              </div>
              <h3 className="font-serif font-semibold text-base text-onyx-950">Email Enquiries</h3>
              <p className="text-xs text-stone-500 leading-relaxed">
                For order modifications, corporate gifting, or wholesale showroom enquiries.
              </p>
              <a
                href="mailto:concierge@auraatelier.com"
                className="inline-flex items-center gap-1.5 text-xs text-gold-700 font-bold hover:underline pt-1"
              >
                <span>concierge@auraatelier.com</span>
              </a>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-cream-200 shadow-soft space-y-3">
              <div className="w-10 h-10 rounded-full bg-cream-100 text-gold-600 flex items-center justify-center">
                <MapPin className="w-5 h-5" />
              </div>
              <h3 className="font-serif font-semibold text-base text-onyx-950">Atelier Studio</h3>
              <p className="text-xs text-stone-500 leading-relaxed">
                Aura Atelier House, Heritage Lane, Bandra West, Mumbai 400050, India.
              </p>
              <p className="text-[11px] text-stone-400 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> Monday to Saturday: 10:00 AM – 7:30 PM IST
              </p>
            </div>
          </div>

          {/* Right Column: Contact Form */}
          <div className="lg:col-span-2 bg-white rounded-3xl p-8 sm:p-10 border border-cream-200 shadow-soft">
            <h2 className="font-serif text-2xl font-semibold text-onyx-950 mb-2">
              Send a Private Message
            </h2>
            <p className="text-xs text-stone-500 mb-6">
              Fill in your details and an atelier representative will contact you promptly.
            </p>

            {sent ? (
              <div className="p-8 text-center bg-cream-50 rounded-2xl border border-cream-300 space-y-3">
                <Sparkles className="w-8 h-8 text-gold-600 mx-auto" />
                <h3 className="font-serif text-xl font-semibold text-onyx-950">Message Received</h3>
                <p className="text-xs text-stone-600 max-w-sm mx-auto">
                  Thank you for reaching out. A dedicated jewellery specialist has been assigned to your request and will reach out via WhatsApp/email shortly.
                </p>
                <button
                  onClick={() => setSent(false)}
                  className="mt-4 px-6 py-2 bg-onyx-950 text-cream-50 rounded text-xs font-semibold uppercase tracking-wider hover:bg-gold-600"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-stone-600 font-semibold mb-1">Your Full Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-cream-50 border border-cream-300 rounded-lg focus:outline-none focus:border-gold-500"
                      placeholder="e.g. Maharani Devika"
                    />
                  </div>
                  <div>
                    <label className="block text-stone-600 font-semibold mb-1">Email Address *</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-cream-50 border border-cream-300 rounded-lg focus:outline-none focus:border-gold-500"
                      placeholder="devika@domain.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-stone-600 font-semibold mb-1">Phone Number (WhatsApp preferred)</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-cream-50 border border-cream-300 rounded-lg focus:outline-none focus:border-gold-500"
                      placeholder="+91 98765 43210"
                    />
                  </div>
                  <div>
                    <label className="block text-stone-600 font-semibold mb-1">Enquiry Subject</label>
                    <select
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-cream-50 border border-cream-300 rounded-lg focus:outline-none focus:border-gold-500"
                    >
                      <option value="Styling Assistance">Jewellery Styling Advice</option>
                      <option value="Bridal Customization">Bridal / Wedding Trousseau</option>
                      <option value="Order Status">Order Tracking / Status</option>
                      <option value="Warranty & Replacement">Anti-Tarnish 1-Year Guarantee</option>
                      <option value="Bespoke Gifting">Corporate / Bridesmaid Gifting</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-stone-600 font-semibold mb-1">Your Message *</label>
                  <textarea
                    rows={4}
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-cream-50 border border-cream-300 rounded-lg focus:outline-none focus:border-gold-500"
                    placeholder="Tell us how we can assist you with your adornment choices..."
                  />
                </div>

                <button
                  type="submit"
                  className="px-8 py-3.5 bg-onyx-950 text-cream-50 text-xs font-semibold uppercase tracking-widest rounded-lg hover:bg-gold-600 transition-colors shadow-luxury flex items-center gap-2"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Concierge Message</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

