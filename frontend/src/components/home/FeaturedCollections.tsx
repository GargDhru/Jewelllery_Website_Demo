import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';

const collections = [
  {
    title: "The Royal Heritage Ensemble",
    subtitle: "Kundan Polki & Meenakari Heirloom Sets",
    description: "Centuries-old Indian regal aesthetics modernized for the contemporary bride and festive celebrations.",
    image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=1200&q=80",
    link: "/category/jewellery-sets",
    tag: "WEDDING & CELEBRATION"
  },
  {
    title: "Baroque Pearl & Resin Atelier",
    subtitle: "Organic Sculptures & 24K Gold Leaf",
    description: "Directly inspired by ResionAura handcrafted heritage. High-clarity crystalline resin encapsulating shimmering botanicals.",
    image: "https://images.unsplash.com/photo-1598560917505-59a3ad559071?auto=format&fit=crop&w=1200&q=80",
    link: "/category/bracelets",
    tag: "HANDCRAFTED ARTISAN"
  },
  {
    title: "The Daily Anti-Tarnish Vault",
    subtitle: "18K Gold PVD Vacuum Plated Essentials",
    description: "Chunky croissant rings, herringbone chains, and celestial huggies you never need to take off.",
    image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=1200&q=80",
    link: "/category/rings",
    tag: "WATERPROOF & EVERYDAY"
  }
];

export const FeaturedCollections: React.FC = () => {
  return (
    <section className="py-20 bg-cream-100/60 border-y border-cream-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-14">
          <span className="text-xs uppercase tracking-[0.3em] text-gold-700 font-bold block mb-2">
            Curated Lookbooks
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl text-onyx-950 font-medium">
            Featured Collections
          </h2>
          <div className="w-16 h-0.5 bg-gold-500 mx-auto mt-4" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {collections.map((col, index) => (
            <div
              key={index}
              className="group relative flex flex-col bg-white rounded-2xl overflow-hidden shadow-soft hover:shadow-luxury-hover border border-cream-200/90 transition-all duration-500"
            >
              <div className="relative aspect-[3/4] overflow-hidden bg-cream-200">
                <img
                  src={col.image}
                  alt={col.title}
                  className="w-full h-full object-cover object-center group-hover:scale-108 transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white border border-white/30 text-[10px] font-bold tracking-widest uppercase">
                    {col.tag}
                  </span>
                </div>

                <div className="absolute bottom-6 inset-x-6 text-white space-y-2">
                  <span className="text-gold-300 text-xs tracking-wider block font-medium">
                    {col.subtitle}
                  </span>
                  <h3 className="font-serif text-2xl font-medium leading-tight">
                    {col.title}
                  </h3>
                  <p className="text-stone-300 text-xs line-clamp-2 font-light">
                    {col.description}
                  </p>
                  <div className="pt-2">
                    <Link
                      to={col.link}
                      className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-gold-300 group-hover:text-gold-400 group-hover:translate-x-1 transition-all"
                    >
                      <span>Explore Collection</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

