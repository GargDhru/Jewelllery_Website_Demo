import React, { useState } from 'react';
import { MessageCircle, X } from 'lucide-react';

export const WhatsAppButton: React.FC = () => {
  const [showTooltip, setShowTooltip] = useState(true);
  const phoneNumber = "919876543210";
  const defaultMessage = encodeURIComponent("Hello Aura Atelier! I would like assistance with jewellery styling and custom orders.");
  const waUrl = `https://wa.me/${phoneNumber}?text=${defaultMessage}`;

  return (
    <div className="fixed bottom-20 lg:bottom-8 right-6 z-40 flex items-center gap-3">
      {showTooltip && (
        <div className="hidden sm:flex items-center gap-2 bg-white px-3.5 py-2 rounded-full shadow-luxury border border-cream-200 text-xs text-onyx-950 font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Jewellery Stylist Online</span>
          <button
            onClick={() => setShowTooltip(false)}
            className="text-stone-400 hover:text-stone-800 ml-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      <a
        href={waUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="w-13 h-13 p-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full shadow-luxury-hover flex items-center justify-center transition-transform hover:scale-110 group relative"
        title="Chat with WhatsApp Concierge"
      >
        <MessageCircle className="w-6 h-6 fill-current" />
        <span className="absolute -top-1 -right-1 w-3 h-3 bg-gold-400 rounded-full border-2 border-white"></span>
      </a>
    </div>
  );
};

