import React from 'react';
import { Instagram, Heart, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const instaPosts = [
  {
    image: "https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=600&q=80",
    likes: "1.4k",
    tag: "@aura.atelier"
  },
  {
    image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=600&q=80",
    likes: "2.8k",
    tag: "#AuraPearls"
  },
  {
    image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=600&q=80",
    likes: "940",
    tag: "#AntiTarnishGold"
  },
  {
    image: "https://images.unsplash.com/photo-1611591475870-136511a2fef9?auto=format&fit=crop&w=600&q=80",
    likes: "3.1k",
    tag: "#AtelierJewels"
  },
  {
    image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=600&q=80",
    likes: "4.2k",
    tag: "#RoyalEnsemble"
  },
  {
    image: "https://images.unsplash.com/photo-1598560917505-59a3ad559071?auto=format&fit=crop&w=600&q=80",
    likes: "1.9k",
    tag: "#ResinAuraStyle"
  }
];

export const InstagramGallery: React.FC = () => {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.25em] text-gold-700 font-bold mb-2">
            <Instagram className="w-3.5 h-3.5" />
            <span>@AURA.ATELIER</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl text-onyx-950 font-medium">
            Seen on Our Patrons
          </h2>
          <p className="text-stone-500 text-xs sm:text-sm mt-2">
            Tag us in your styling stories to be featured in our permanent collection gallery.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {instaPosts.map((post, idx) => (
            <Link
              key={idx}
              to="/shop"
              className="group relative aspect-square rounded-xl overflow-hidden bg-cream-200 border border-cream-200 shadow-soft block"
            >
              <img
                src={post.image}
                alt="Instagram look"
                className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 text-white p-3 text-center">
                <Instagram className="w-5 h-5 text-gold-300" />
                <span className="text-xs font-semibold">{post.tag}</span>
                <span className="text-[11px] text-stone-300 inline-flex items-center gap-1">
                  <Heart className="w-3 h-3 fill-current text-rose-400" /> {post.likes}
                </span>
                <span className="text-[10px] tracking-wider uppercase font-semibold text-gold-300 mt-1">
                  Shop Look →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

