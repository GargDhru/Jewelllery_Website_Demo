import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Shield, Heart, Award, ArrowRight } from 'lucide-react';

export const BrandStorySection: React.FC = () => {
  return (
    <section className="py-24 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Images collage */}
          <div className="relative">
            <div className="relative z-10 w-4/5 aspect-[4/5] rounded-2xl overflow-hidden shadow-luxury border-4 border-white">
              <img
                src="https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=1000&q=80"
                alt="Jewellery Craftsmanship"
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Secondary overlapping image */}
            <div className="absolute -bottom-8 -right-4 w-3/5 aspect-square rounded-2xl overflow-hidden shadow-2xl border-4 border-white z-20 hidden sm:block">
              <img
                src="https://images.unsplash.com/photo-1598560917505-59a3ad559071?auto=format&fit=crop&w=800&q=80"
                alt="Resin and gold foil craftsmanship"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Experience badge */}
            <div className="absolute top-8 right-2 sm:right-6 z-30 bg-onyx-950 text-cream-50 p-4 rounded-xl shadow-luxury border border-gold-500/30 text-center">
              <span className="font-serif text-3xl font-bold text-gold-400 block leading-none">100%</span>
              <span className="text-[10px] tracking-wider uppercase font-semibold text-stone-300">Anti-Tarnish</span>
            </div>
          </div>

          {/* Text Content */}
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 text-gold-700 text-xs uppercase tracking-[0.25em] font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>THE RESION AURA HERITAGE</span>
            </div>

            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-medium text-onyx-950 leading-tight">
              Where Ancient Artisanship Meets Modern Lustre
            </h2>

            <div className="w-16 h-0.5 bg-gold-500" />

            <p className="text-stone-600 text-sm sm:text-base leading-relaxed">
              At Aura Atelier, jewellery is neither disposable fast-fashion nor an untouchable vault relic. Inspired by the organic resin artistry of ResionAura, our atelier pairs hand-poured optical resin with 18K gold PVD physical vapor deposition.
            </p>

            <p className="text-stone-600 text-sm sm:text-base leading-relaxed">
              Every curve is hand-sculpted, every freshwater baroque pearl uniquely chosen, and every stone precision-set by master artisans with over two decades of jewelry lineage.
            </p>

            {/* Feature Metrics */}
            <div className="grid grid-cols-2 gap-6 pt-4 border-t border-cream-200">
              <div>
                <span className="font-serif text-2xl sm:text-3xl font-bold text-onyx-950 block">25,000+</span>
                <span className="text-xs text-stone-500">Heirlooms Delivered Worldwide</span>
              </div>
              <div>
                <span className="font-serif text-2xl sm:text-3xl font-bold text-onyx-950 block">365 Days</span>
                <span className="text-xs text-stone-500">Full Colour & Lustre Warranty</span>
              </div>
            </div>

            <div className="pt-4">
              <Link
                to="/about"
                className="inline-flex items-center gap-2 px-8 py-3.5 bg-onyx-950 text-cream-50 text-xs font-semibold uppercase tracking-[0.2em] rounded-lg hover:bg-gold-600 transition-colors shadow-luxury"
              >
                <span>Read Full Atelier Manifesto</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

