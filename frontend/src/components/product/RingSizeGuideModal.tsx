import React, { useState } from 'react';
import { X, Sparkles, Ruler, Check } from 'lucide-react';

interface RingSizeGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RingSizeGuideModal: React.FC<RingSizeGuideModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'ring' | 'necklace' | 'bracelet'>('ring');

  if (!isOpen) return null;

  const ringSizes = [
    { us: '5', in: '9-10', mm: '15.7 mm', circum: '49.3 mm' },
    { us: '6', in: '11-12', mm: '16.5 mm', circum: '51.8 mm' },
    { us: '7', in: '13-14', mm: '17.3 mm', circum: '54.4 mm' },
    { us: '8', in: '15-16', mm: '18.1 mm', circum: '56.9 mm' },
    { us: '9', in: '17-18', mm: '19.0 mm', circum: '59.5 mm' },
    { us: '10', in: '19-20', mm: '19.8 mm', circum: '62.1 mm' },
  ];

  const necklaceLengths = [
    { length: '14" (35 cm)', style: 'Collar', desc: 'Sits snugly around the base of the throat. Ideal for open necklines.' },
    { length: '16" (40 cm)', style: 'Choker', desc: 'Rests gently on the collarbone. Perfect for everyday wear and pendants.' },
    { length: '18" (45 cm)', style: 'Princess', desc: 'Falls just below the collarbone. Our most popular universal length.' },
    { length: '20" (50 cm)', style: 'Matinee', desc: 'Reaches the plunge neckline. Magnificent for layering.' },
    { length: '24" (60 cm)', style: 'Opera', desc: 'Dramatic statement length draping over blouses and dresses.' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl border border-cream-200 my-8">
        <div className="flex items-center justify-between pb-4 border-b border-cream-200 mb-6">
          <div className="flex items-center gap-2">
            <Ruler className="w-5 h-5 text-gold-600" />
            <h3 className="font-serif text-xl font-semibold text-onyx-950">
              Atelier Size & Measurement Guide
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-stone-400 hover:text-onyx-950"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-cream-200 gap-6 text-xs font-semibold uppercase tracking-wider mb-6">
          <button
            onClick={() => setActiveTab('ring')}
            className={`pb-2.5 border-b-2 transition-all ${
              activeTab === 'ring' ? 'border-gold-600 text-gold-700 font-bold' : 'border-transparent text-stone-400 hover:text-stone-700'
            }`}
          >
            Ring Sizing
          </button>
          <button
            onClick={() => setActiveTab('necklace')}
            className={`pb-2.5 border-b-2 transition-all ${
              activeTab === 'necklace' ? 'border-gold-600 text-gold-700 font-bold' : 'border-transparent text-stone-400 hover:text-stone-700'
            }`}
          >
            Necklace Draping
          </button>
          <button
            onClick={() => setActiveTab('bracelet')}
            className={`pb-2.5 border-b-2 transition-all ${
              activeTab === 'bracelet' ? 'border-gold-600 text-gold-700 font-bold' : 'border-transparent text-stone-400 hover:text-stone-700'
            }`}
          >
            Wrist & Cuffs
          </button>
        </div>

        {/* Content */}
        {activeTab === 'ring' && (
          <div className="space-y-4 text-xs">
            <p className="text-stone-600 leading-relaxed">
              To measure your finger, wrap a strip of paper around the base of your intended finger, mark where the ends meet, and measure the length in millimeters to find your circumference.
            </p>
            <div className="border border-cream-200 rounded-xl overflow-hidden">
              <table className="w-full text-xs text-left">
                <thead className="bg-cream-100 text-stone-700 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-2.5 px-3">US Size</th>
                    <th className="py-2.5 px-3">Indian Size</th>
                    <th className="py-2.5 px-3">Inner Diameter</th>
                    <th className="py-2.5 px-3">Circumference</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cream-100">
                  {ringSizes.map((s) => (
                    <tr key={s.us} className="hover:bg-cream-50">
                      <td className="py-2 px-3 font-bold text-onyx-950">Size {s.us}</td>
                      <td className="py-2 px-3">{s.in}</td>
                      <td className="py-2 px-3 font-mono">{s.mm}</td>
                      <td className="py-2 px-3 font-mono text-gold-800">{s.circum}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-[11px] text-stone-500 italic">
              Tip: Most of our statement dome rings feature an ergonomic comfort-fit contour. If you are between sizes, we recommend sizing up.
            </p>
          </div>
        )}

        {activeTab === 'necklace' && (
          <div className="space-y-3 text-xs">
            <div className="divide-y divide-cream-200 border border-cream-200 rounded-xl overflow-hidden">
              {necklaceLengths.map((n) => (
                <div key={n.length} className="p-3.5 hover:bg-cream-50">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-serif font-bold text-sm text-onyx-950">{n.style} ({n.length})</span>
                    <span className="text-[10px] uppercase font-bold text-gold-700 bg-gold-50 px-2 py-0.5 rounded">Standard</span>
                  </div>
                  <p className="text-stone-600 text-xs">{n.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'bracelet' && (
          <div className="space-y-4 text-xs text-stone-600 leading-relaxed">
            <p>
              Our cuffs and chain bracelets come with a <strong>4 cm - 5 cm signature extender</strong>, making them universally adjustable from 15 cm up to 21 cm wrist circumferences.
            </p>
            <div className="p-4 bg-cream-50 rounded-xl border border-cream-200 space-y-2">
              <h4 className="font-serif font-semibold text-sm text-onyx-950">Universal Fit Guarantee</h4>
              <p className="text-xs text-stone-500">
                If your bracelet does not sit with the desired drape, our concierge provides complimentary extender extensions or returns within 7 days.
              </p>
            </div>
          </div>
        )}

        <div className="pt-6 mt-6 border-t border-cream-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-onyx-950 text-cream-50 text-xs font-semibold uppercase tracking-wider rounded-lg hover:bg-gold-600 transition-colors"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
};

