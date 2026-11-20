import React from 'react';
import { Star, ShieldCheck, Quote } from 'lucide-react';

const testimonials = [
  {
    name: "Ananya Sharma",
    city: "Mumbai, India",
    rating: 5,
    title: "Breathtaking Craftsmanship!",
    comment: "The chandelier earrings are even more radiant in person. The gold tone isn't too yellow, it's that subtle champagne shade. I wore them to my sister's wedding reception and received compliments all evening!",
    purchased: "Aura Soleil Chandelier Earrings",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80"
  },
  {
    name: "Pooja Singhania",
    city: "New Delhi, India",
    rating: 5,
    title: "100% Anti-Tarnish Tested!",
    comment: "I have worn the paperclip bracelet daily for 3 months straight, including while showering and at the gym. It has not tarnished or turned my skin green at all. Genuinely superior quality.",
    purchased: "Imperial Roman Coin Bracelet",
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80"
  },
  {
    name: "Rhea Kapoor",
    city: "Bengaluru, India",
    rating: 5,
    title: "Luxury Unboxing Experience",
    comment: "The bespoke velvet box, gold foil envelope, and certificate made it feel like receiving a high jewellery parcel from Paris. Impeccable finish and lightweight.",
    purchased: "The Golden Muse Atelier Gift Box",
    image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80"
  }
];

export const CustomerReviewsSection: React.FC = () => {
  return (
    <section className="py-20 bg-cream-50 border-t border-cream-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-14">
          <span className="text-xs uppercase tracking-[0.3em] text-gold-700 font-bold block mb-2">
            Voices of Patronage
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl text-onyx-950 font-medium">
            Loved by Discerning Connoisseurs
          </h2>
          <div className="w-16 h-0.5 bg-gold-500 mx-auto mt-4" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl p-6 sm:p-8 shadow-soft border border-cream-200 flex flex-col justify-between hover:shadow-luxury-hover transition-all duration-300"
            >
              <div>
                {/* Stars & Quote Icon */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-1 text-amber-500">
                    {[...Array(t.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <Quote className="w-6 h-6 text-gold-400/40" />
                </div>

                <h3 className="font-serif text-lg font-semibold text-onyx-950 mb-2">
                  "{t.title}"
                </h3>

                <p className="text-stone-600 text-xs sm:text-sm leading-relaxed mb-6 italic">
                  "{t.comment}"
                </p>
              </div>

              <div className="pt-4 border-t border-cream-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={t.image}
                    alt={t.name}
                    className="w-10 h-10 rounded-full object-cover border border-cream-300"
                  />
                  <div>
                    <h4 className="font-serif font-semibold text-sm text-onyx-950">{t.name}</h4>
                    <p className="text-[11px] text-stone-400">{t.city}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-emerald-700 font-medium bg-emerald-50 px-2 py-1 rounded">
                  <ShieldCheck className="w-3 h-3" />
                  <span>Verified Buyer</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

