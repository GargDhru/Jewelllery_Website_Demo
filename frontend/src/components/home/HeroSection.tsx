import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, ChevronLeft, ChevronRight, ShieldCheck } from 'lucide-react';

const heroSlides = [
  {
    title: "Handcrafted Elegance. Everlasting Radiance.",
    subtitle: "Artisanal 18K gold plated demi-fine jewellery and crystalline resin creations designed for the discerning contemporary woman.",
    image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=1920&q=85",
    ctaPrimary: "Explore Best Sellers",
    linkPrimary: "/shop?sort=bestselling",
    ctaSecondary: "New Arrivals",
    linkSecondary: "/shop?new=true",
    badge: "THE HERITAGE COLLECTION"
  },
  {
    title: "The Poetry of Baroque Pearls & 24K Gold Leaf",
    subtitle: "Organic freshwater pearls married with sculptural anti-tarnish silhouettes and hand-poured optical resin.",
    image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=1920&q=85",
    ctaPrimary: "Shop Chokers & Necklaces",
    linkPrimary: "/category/necklaces",
    ctaSecondary: "Atelier Story",
    linkSecondary: "/about",
    badge: "SIGNATURE RESION AURA PIECES"
  },
  {
    title: "100% Anti-Tarnish & Waterproof Luxury",
    subtitle: "Dipped in 18K gold PVD vacuum coating. Wear to the ocean, pool, and soirée without losing a single sparkle.",
    image: "https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=1920&q=85",
    ctaPrimary: "Discover Earrings",
    linkPrimary: "/category/earrings",
    ctaSecondary: "View Bridal Sets",
    linkSecondary: "/category/jewellery-sets",
    badge: "1-YEAR COLOR WARRANTY"
  }
];

export const HeroSection: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const slide = heroSlides[currentSlide];

  return (
    <div className="relative h-[85vh] min-h-[580px] max-h-[820px] w-full overflow-hidden bg-onyx-950">
      {/* Background Images with Fade */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="absolute inset-0"
        >
          <img
            src={slide.image}
            alt={slide.title}
            className="w-full h-full object-cover object-center"
          />
          {/* Luxury Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/50 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-onyx-950/80 via-transparent to-black/30" />
        </motion.div>
      </AnimatePresence>

      {/* Hero Content */}
      <div className="relative h-full max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 flex items-center">
        <div className="max-w-2xl space-y-6">
          <motion.div
            key={`badge-${currentSlide}`}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gold-500/20 border border-gold-400/40 backdrop-blur-md text-gold-300 text-[11px] font-semibold tracking-[0.25em] uppercase"
          >
            <Sparkles className="w-3.5 h-3.5 text-gold-400" />
            <span>{slide.badge}</span>
          </motion.div>

          <motion.h1
            key={`title-${currentSlide}`}
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.7 }}
            className="font-serif text-4xl sm:text-5xl lg:text-6xl font-medium tracking-tight text-cream-50 leading-[1.12]"
          >
            {slide.title}
          </motion.h1>

          <motion.p
            key={`desc-${currentSlide}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.7 }}
            className="text-stone-300 text-sm sm:text-base leading-relaxed max-w-xl font-light"
          >
            {slide.subtitle}
          </motion.p>

          <motion.div
            key={`actions-${currentSlide}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.7 }}
            className="flex flex-wrap items-center gap-4 pt-4"
          >
            <Link
              to={slide.linkPrimary}
              className="px-8 py-4 bg-gold-500 text-onyx-950 font-semibold text-xs tracking-[0.2em] uppercase rounded-lg hover:bg-gold-400 transition-all shadow-luxury hover:shadow-luxury-hover flex items-center gap-2 group"
            >
              <span>{slide.ctaPrimary}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              to={slide.linkSecondary}
              className="px-7 py-4 bg-white/10 hover:bg-white/20 text-cream-100 backdrop-blur-md border border-white/20 font-medium text-xs tracking-[0.2em] uppercase rounded-lg transition-all"
            >
              {slide.ctaSecondary}
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Slide Navigation Dots & Arrows */}
      <div className="absolute bottom-8 right-8 z-20 flex items-center gap-3">
        <button
          onClick={() => setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length)}
          className="w-10 h-10 rounded-full bg-black/40 hover:bg-gold-500 hover:text-black text-white backdrop-blur-md border border-white/20 flex items-center justify-center transition-all"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          onClick={() => setCurrentSlide((prev) => (prev + 1) % heroSlides.length)}
          className="w-10 h-10 rounded-full bg-black/40 hover:bg-gold-500 hover:text-black text-white backdrop-blur-md border border-white/20 flex items-center justify-center transition-all"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Indicators */}
      <div className="absolute bottom-8 left-8 z-20 flex gap-2">
        {heroSlides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentSlide(i)}
            className={`h-1.5 rounded-full transition-all duration-500 ${
              currentSlide === i ? 'w-10 bg-gold-400' : 'w-3 bg-white/30 hover:bg-white/60'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

