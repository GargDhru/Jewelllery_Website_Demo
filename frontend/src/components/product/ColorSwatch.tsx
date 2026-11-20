import React from 'react';

export interface ColorSwatchOption {
  name: string;
  hex: string;
  border?: string;
  gradient?: string;
}

// Maps color names to rich visual hex / gradients matching luxury jewelry tones
export const COLOR_SWATCH_MAP: Record<string, { bg: string; border?: string; gradient?: string }> = {
  'gold': { bg: '#D4AF37', gradient: 'linear-gradient(135deg, #F3E7C4 0%, #D4AF37 50%, #AA7C11 100%)' },
  'champagne gold': { bg: '#D4AF72', gradient: 'linear-gradient(135deg, #FFF1D0 0%, #D4AF72 50%, #B88939 100%)' },
  'rose gold': { bg: '#B76E79', gradient: 'linear-gradient(135deg, #FAD0C4 0%, #B76E79 50%, #8E4450 100%)' },
  'silver': { bg: '#C0C0C0', gradient: 'linear-gradient(135deg, #FFFFFF 0%, #E0E0E0 45%, #9E9E9E 100%)' },
  'platinum silver': { bg: '#E5E4E2', gradient: 'linear-gradient(135deg, #FFFFFF 0%, #E5E4E2 50%, #B0B0B0 100%)' },
  'antique gold': { bg: '#996515', gradient: 'linear-gradient(135deg, #D4AF37 0%, #996515 50%, #5C3D00 100%)' },
  'black': { bg: '#171717', gradient: 'linear-gradient(135deg, #434343 0%, #171717 100%)' },
  'white': { bg: '#FFFFFF', border: '#D1D5DB' },
  'pearl white': { bg: '#F8F6F0', border: '#E5E7EB', gradient: 'radial-gradient(circle, #FFFFFF 20%, #F5F2EB 60%, #E5DFD3 100%)' },
  'emerald green paint': { bg: '#046307', gradient: 'linear-gradient(135deg, #10B981 0%, #047857 50%, #064E3B 100%)' },
  'emerald green': { bg: '#046307', gradient: 'linear-gradient(135deg, #10B981 0%, #047857 50%, #064E3B 100%)' },
  'multicolour': { bg: '#F59E0B', gradient: 'linear-gradient(135deg, #EF4444 0%, #F59E0B 25%, #10B981 50%, #3B82F6 75%, #8B5CF6 100%)' },
};

export const getColorMeta = (colorName: string) => {
  const normalized = (colorName || '').toLowerCase().trim();
  if (COLOR_SWATCH_MAP[normalized]) {
    return COLOR_SWATCH_MAP[normalized];
  }
  // Partial matches
  for (const key of Object.keys(COLOR_SWATCH_MAP)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return COLOR_SWATCH_MAP[key];
    }
  }
  return { bg: '#D4AF72', gradient: 'linear-gradient(135deg, #F3E7C4 0%, #D4AF72 100%)' };
};

interface ColorSwatchProps {
  color: string;
  isSelected?: boolean;
  onClick?: () => void;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  stock?: number;
  disabled?: boolean;
}

export const ColorSwatch: React.FC<ColorSwatchProps> = ({
  color,
  isSelected = false,
  onClick,
  size = 'md',
  showLabel = false,
  stock,
  disabled = false,
}) => {
  const meta = getColorMeta(color);

  const sizeClasses = {
    sm: 'w-5 h-5',
    md: 'w-7 h-7',
    lg: 'w-9 h-9',
  }[size];

  const ringClasses = isSelected
    ? 'ring-2 ring-gold-600 ring-offset-2 ring-offset-white scale-110 shadow-md'
    : 'hover:scale-105 hover:ring-1 hover:ring-stone-400';

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || (stock !== undefined && stock <= 0)}
      title={`${color}${stock !== undefined ? (stock > 0 ? ` (${stock} in stock)` : ' (Out of stock)') : ''}`}
      className={`relative inline-flex items-center gap-2 group transition-all focus:outline-none ${disabled || (stock !== undefined && stock <= 0) ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      <span
        className={`rounded-full shrink-0 transition-transform duration-200 border ${sizeClasses} ${ringClasses}`}
        style={{
          background: meta.gradient || meta.bg,
          borderColor: meta.border || 'rgba(0,0,0,0.1)',
        }}
      >
        {/* Out of stock diagonal line */}
        {stock !== undefined && stock <= 0 && (
          <span className="absolute inset-0 flex items-center justify-center">
            <span className="w-full h-0.5 bg-red-500 rotate-45" />
          </span>
        )}
      </span>

      {showLabel && (
        <span className={`text-xs font-medium capitalize ${isSelected ? 'text-onyx-950 font-semibold' : 'text-stone-600'}`}>
          {color}
        </span>
      )}
    </button>
  );
};

