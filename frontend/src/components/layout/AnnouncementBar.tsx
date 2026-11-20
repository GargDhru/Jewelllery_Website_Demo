import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ShieldCheck, Gift, Truck } from 'lucide-react';

const announcements = [
  { text: "Complimentary Luxury Insured Delivery on orders above ₹1,999", icon: Truck },
  { text: "18K Gold PVD Anti-Tarnish | 1-Year Guarantee on Lustre", icon: ShieldCheck },
  { text: "Special Welcome Gift: Use code WELCOME10 for 10% off your first order", icon: Gift },
  { text: "Handcrafted in Small Batches with Real Baroque Pearls & Gold Leaf", icon: Sparkles }
];

export const AnnouncementBar: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % announcements.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  const current = announcements[currentIndex];
  const IconComponent = current.icon;

  return (
    <div className="bg-onyx-950 text-cream-100 text-xs py-2 px-4 border-b border-gold-500/20 tracking-wider">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="hidden md:flex items-center gap-2 text-stone-400">
          <span className="w-1.5 h-1.5 rounded-full bg-gold-400 animate-pulse"></span>
          <span>ATELIER EDITION</span>
        </div>

        <div className="flex-1 flex justify-center items-center overflow-hidden h-5">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="flex items-center gap-2 text-center font-medium"
            >
              <IconComponent className="w-3.5 h-3.5 text-gold-400 shrink-0" />
              <span className="truncate">{current.text}</span>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="hidden md:flex items-center gap-4 text-stone-400 text-[11px]">
          <span className="hover:text-gold-300 transition-colors cursor-pointer">Support: concierge@auraatelier.com</span>
        </div>
      </div>
    </div>
  );
};

