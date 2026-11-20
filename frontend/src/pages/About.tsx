import React from 'react';
import { Sparkles, ShieldCheck, Heart, Award, Gem, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export const About: React.FC = () => {
  return (
    <div className="min-h-screen bg-cream-50 py-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs uppercase tracking-[0.3em] text-gold-700 font-bold block mb-2">
            The Resion Aura Heritage
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl font-medium text-onyx-950">
            The Art of Modern Handcrafted Adornment
          </h1>
          <div className="w-16 h-0.5 bg-gold-500 mx-auto mt-4" />
          <p className="text-stone-600 text-sm sm:text-base mt-4 leading-relaxed">
            Born out of a desire to create demi-fine jewellery that blends heirloom luxury aesthetics with contemporary durability and waterproof performance.
          </p>
        </div>

        {/* Hero image showcase */}
        <div className="aspect-[16/9] rounded-3xl overflow-hidden shadow-luxury border-4 border-white mb-16 bg-cream-200">
          <img
            src="https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=1600&q=85"
            alt="Atelier workspace"
            className="w-full h-full object-cover object-center"
          />
        </div>

        {/* Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          <div className="bg-white p-8 rounded-2xl border border-cream-200 shadow-soft">
            <div className="w-12 h-12 rounded-full bg-cream-100 text-gold-600 flex items-center justify-center mb-4">
              <Gem className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-xl font-semibold text-onyx-950 mb-2">Crystalline Resin & Gold Foil</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Carrying forward the signature ResionAura craft, our master artisans hand-pour optical grade resin embedding real 24K gold flakes, creating one-of-a-kind wearable sculptures.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl border border-cream-200 shadow-soft">
            <div className="w-12 h-12 rounded-full bg-cream-100 text-gold-600 flex items-center justify-center mb-4">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-xl font-semibold text-onyx-950 mb-2">18K PVD Anti-Tarnish</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Physical Vapor Deposition (PVD) bonds real 18-karat gold onto surgical-grade stainless steel in a vacuum chamber, creating a barrier 10x more resilient than standard electroplating.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl border border-cream-200 shadow-soft">
            <div className="w-12 h-12 rounded-full bg-cream-100 text-gold-600 flex items-center justify-center mb-4">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-xl font-semibold text-onyx-950 mb-2">365-Day Guarantee</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              We stand unreservedly behind our finish. Every piece carries our 1-Year color and lustre guarantee. If your piece ever discolors, we replace or replate it free of charge.
            </p>
          </div>
        </div>

        {/* Story details */}
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-cream-200 shadow-soft space-y-6 text-stone-700 text-sm leading-relaxed">
          <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-onyx-950">
            A Manifesto for Everyday Splendor
          </h2>
          <p>
            For generations, fine jewelry was locked away in safe deposit vaults, brought out only for a handful of weddings or formal dinners. The rest of the year, women wore flimsy fashion jewelry that oxidized, tarnished within weeks, and left green residue on skin.
          </p>
          <p>
            Aura Atelier bridges this divide. We engineer pieces that exude the majesty of antique Kundan Polki and royal Mediterranean chokers, while remaining lightweight, hypoallergenic, and completely waterproof for gym workouts, sea swims, and casual brunches.
          </p>
          <div className="pt-4 border-t border-cream-100 flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full border border-gold-500 bg-onyx-950 flex items-center justify-center text-gold-400 font-serif font-bold">
                A
              </div>
              <div>
                <p className="font-serif font-bold text-sm text-onyx-950">AURA ATELIER</p>
                <p className="text-xs text-stone-400">Handcrafted Demi-Fine Jewellery</p>
              </div>
            </div>

            <Link
              to="/shop"
              className="px-6 py-3 bg-onyx-950 text-cream-50 text-xs font-semibold uppercase tracking-widest rounded-lg hover:bg-gold-600 transition-colors"
            >
              Discover The Vault
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

