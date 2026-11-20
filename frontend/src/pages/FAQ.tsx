import React, { useState } from 'react';
import { ChevronDown, ShieldCheck, Truck, RefreshCw, Sparkles, HelpCircle } from 'lucide-react';

const faqs = [
  {
    category: "Anti-Tarnish & Materials",
    questions: [
      {
        q: "What does 18K Gold PVD Anti-Tarnish mean?",
        a: "Physical Vapor Deposition (PVD) is a high-tech vacuum coating process where real 18K gold is vaporized and deposited atom-by-atom onto surgical-grade stainless steel or fine brass. It creates an ultra-durable bond that is 10 times thicker and more wear-resistant than standard electroplating, preventing tarnishing, fading, and discoloration."
      },
      {
        q: "Can I wear this jewellery in the shower, pool, and gym?",
        a: "Yes! All pieces labelled Anti-Tarnish & Waterproof can be worn while taking showers, working out, and washing hands without turning your skin green or losing their golden sheen. For public swimming pools with heavy chlorine, we suggest rinsing with fresh water afterwards."
      },
      {
        q: "Are the baroque pearls genuine freshwater pearls?",
        a: "Yes! We work exclusively with sustainably cultivated organic freshwater pearls. Because they are natural, each pearl possesses unique baroque contours, slight iridescence, and its own individual personality."
      },
      {
        q: "Is the jewellery hypoallergenic?",
        a: "All Aura Atelier demi-fine jewellery is 100% nickel-free, lead-free, and cadmium-free. Safe for even the most delicate and sensitive skin."
      }
    ]
  },
  {
    category: "Shipping & Delivery",
    questions: [
      {
        q: "What are the shipping fees and delivery times?",
        a: "We offer Complimentary Insured Express Shipping on all orders above ₹1,999. For orders below ₹1,999, a flat standard shipping fee of ₹149 applies. Orders are dispatched within 24 hours and typically delivered within 2-4 business days across India via Blue Dart and Delhivery."
      },
      {
        q: "Do you offer Cash on Delivery (COD)?",
        a: "Yes, Cash on Delivery is available across all serviceable postal pincodes in India with zero additional surcharge."
      },
      {
        q: "How can I track my shipment?",
        a: "As soon as your parcel leaves our Mumbai atelier, you will receive an SMS and email notification with your live courier tracking link. You can also view live tracking anytime inside your Patron Account."
      }
    ]
  },
  {
    category: "1-Year Warranty & Returns",
    questions: [
      {
        q: "How does the 365-Day Lustre Warranty work?",
        a: "Every Aura Atelier piece comes with a 1-Year Color Warranty card. If your item discolors or tarnishes under normal wear within 365 days of purchase, send a photo to concierge@auraatelier.com or WhatsApp us, and we will immediately provide a free replacement or re-plating."
      },
      {
        q: "What is your return & exchange policy?",
        a: "We offer a 7-day hassle-free return and exchange window from the date of delivery. Items must be unworn and in their original luxury box packaging."
      }
    ]
  }
];

export const FAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<string | null>("0-0");

  const toggle = (key: string) => {
    setOpenIndex(openIndex === key ? null : key);
  };

  return (
    <div className="min-h-screen bg-cream-50 py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-14">
          <span className="text-xs uppercase tracking-[0.3em] text-gold-700 font-bold block mb-2">
            Client Guidance
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-medium text-onyx-950">
            Frequently Asked Questions
          </h1>
          <div className="w-16 h-0.5 bg-gold-500 mx-auto mt-3" />
          <p className="text-stone-500 text-xs sm:text-sm mt-3">
            Everything you need to know regarding our anti-tarnish science, delivery timelines, and 1-year guarantee.
          </p>
        </div>

        <div className="space-y-10">
          {faqs.map((cat, catIdx) => (
            <div key={catIdx} className="bg-white rounded-3xl p-6 sm:p-8 border border-cream-200 shadow-soft">
              <h2 className="font-serif text-xl font-semibold text-onyx-950 mb-4 pb-2 border-b border-cream-100 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-gold-600" />
                <span>{cat.category}</span>
              </h2>

              <div className="divide-y divide-cream-100">
                {cat.questions.map((item, qIdx) => {
                  const key = `${catIdx}-${qIdx}`;
                  const isOpen = openIndex === key;
                  return (
                    <div key={qIdx} className="py-3.5">
                      <button
                        onClick={() => toggle(key)}
                        className="w-full flex items-center justify-between text-left text-xs sm:text-sm font-semibold text-onyx-950 hover:text-gold-700 transition-colors focus:outline-none gap-4"
                      >
                        <span>{item.q}</span>
                        <ChevronDown className={`w-4 h-4 shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180 text-gold-600' : 'text-stone-400'}`} />
                      </button>

                      {isOpen && (
                        <p className="text-xs text-stone-600 mt-2.5 leading-relaxed pr-6 animate-fadeIn">
                          {item.a}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

