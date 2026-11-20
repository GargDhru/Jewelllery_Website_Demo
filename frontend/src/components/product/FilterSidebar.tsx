import React from 'react';
import { X, RotateCcw, Check, Sparkles, Filter } from 'lucide-react';
import { Category } from '../../types';
import { useCurrency } from '../../context/CurrencyContext';

interface FilterState {
  category: string;
  minPrice: number;
  maxPrice: number;
  color: string;
  material: string;
  inStock: boolean;
  sort: string;
  search?: string;
}

interface FilterSidebarProps {
  categories: Category[];
  filters: FilterState;
  onFilterChange: (newFilters: Partial<FilterState>) => void;
  onReset: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const FilterSidebar: React.FC<FilterSidebarProps> = ({
  categories,
  filters,
  onFilterChange,
  onReset,
  isMobileOpen,
  onCloseMobile,
}) => {
  const { formatPrice } = useCurrency();

  const colors = [
    { name: 'Gold', value: 'Gold', hex: '#D4AF37' },
    { name: 'Rose Gold', value: 'Rose Gold', hex: '#B76E79' },
    { name: 'Silver', value: 'Silver', hex: '#C0C0C0' },
    { name: 'Antique Gold', value: 'Antique Gold', hex: '#996515' },
    { name: 'Black', value: 'Black', hex: '#171717' },
    { name: 'White', value: 'White', hex: '#FFFFFF' },
    { name: 'Pearl White', value: 'Pearl White', hex: '#F8F6F0' },
    { name: 'Multicolour', value: 'Multicolour', hex: '#F59E0B' },
  ];

  const materials = [
    'Stainless Steel',
    'Freshwater Pearls',
    'Sterling Silver 925',
    'Brass Alloy',
    'Optical Resin',
    'Jadau Kundan',
    'Titanium Steel',
  ];

  const content = (
    <div className="space-y-6 text-xs">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-cream-200">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gold-600" />
          <h3 className="font-serif text-lg font-semibold text-onyx-950">Refine Selection</h3>
        </div>
        <button
          onClick={onReset}
          className="text-stone-500 hover:text-gold-700 flex items-center gap-1 font-medium"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset All</span>
        </button>
      </div>

      {/* Category Filter */}
      <div>
        <h4 className="font-semibold text-onyx-950 uppercase tracking-wider text-[11px] mb-3">
          Jewellery Category
        </h4>
        <div className="space-y-1.5 max-h-48 overflow-y-auto pr-2">
          <label className="flex items-center gap-2 cursor-pointer hover:text-gold-700 py-1">
            <input
              type="radio"
              name="category"
              checked={filters.category === ''}
              onChange={() => onFilterChange({ category: '' })}
              className="text-gold-600 focus:ring-gold-500"
            />
            <span className={filters.category === '' ? 'font-bold text-gold-700' : 'text-stone-700'}>
              All Categories
            </span>
          </label>
          {categories.map((cat) => (
            <label key={cat.id} className="flex items-center gap-2 cursor-pointer hover:text-gold-700 py-1">
              <input
                type="radio"
                name="category"
                checked={filters.category === cat.slug}
                onChange={() => onFilterChange({ category: cat.slug })}
                className="text-gold-600 focus:ring-gold-500"
              />
              <span className={filters.category === cat.slug ? 'font-bold text-gold-700' : 'text-stone-700'}>
                {cat.name}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div className="pt-4 border-t border-cream-200">
        <h4 className="font-semibold text-onyx-950 uppercase tracking-wider text-[11px] mb-3">
          Price Range: {formatPrice(filters.minPrice)} – {formatPrice(filters.maxPrice)}
        </h4>
        <div className="space-y-2">
          <input
            type="range"
            min={500}
            max={15000}
            step={250}
            value={filters.maxPrice}
            onChange={(e) => onFilterChange({ maxPrice: Number(e.target.value) })}
            className="w-full accent-gold-600 cursor-pointer"
          />
          <div className="flex justify-between text-[11px] text-stone-400">
            <span>{formatPrice(500)}</span>
            <span>{formatPrice(15000)}</span>
          </div>
        </div>
      </div>

      {/* Plating / Color */}
      <div className="pt-4 border-t border-cream-200">
        <h4 className="font-semibold text-onyx-950 uppercase tracking-wider text-[11px] mb-3">
          Color / Plating
        </h4>
        <div className="flex flex-wrap gap-2">
          {colors.map((c) => (
            <button
              key={c.value}
              onClick={() => onFilterChange({ color: filters.color === c.value ? '' : c.value })}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border text-[11px] transition-all ${
                filters.color === c.value
                  ? 'border-gold-600 bg-gold-50 text-gold-900 font-semibold'
                  : 'border-cream-300 bg-white text-stone-700 hover:border-gold-400'
              }`}
            >
              <span
                className="w-2.5 h-2.5 rounded-full border border-stone-300"
                style={{ backgroundColor: c.hex }}
              />
              <span>{c.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Material */}
      <div className="pt-4 border-t border-cream-200">
        <h4 className="font-semibold text-onyx-950 uppercase tracking-wider text-[11px] mb-3">
          Craft & Material
        </h4>
        <div className="flex flex-wrap gap-1.5">
          {materials.map((mat) => (
            <button
              key={mat}
              onClick={() => onFilterChange({ material: filters.material === mat ? '' : mat })}
              className={`px-2.5 py-1 rounded text-[11px] border transition-colors ${
                filters.material === mat
                  ? 'bg-onyx-950 text-cream-50 border-onyx-950'
                  : 'bg-white text-stone-700 border-cream-300 hover:border-gold-400'
              }`}
            >
              {mat}
            </button>
          ))}
        </div>
      </div>

      {/* Availability / In Stock */}
      <div className="pt-4 border-t border-cream-200">
        <label className="flex items-center justify-between cursor-pointer py-1">
          <span className="font-semibold text-stone-800">Ready to Ship (In Stock)</span>
          <input
            type="checkbox"
            checked={filters.inStock}
            onChange={(e) => onFilterChange({ inStock: e.target.checked })}
            className="rounded border-stone-300 text-gold-600 focus:ring-gold-500 w-4 h-4"
          />
        </label>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:block w-64 bg-cream-50/60 p-5 rounded-2xl border border-cream-200 shadow-soft h-fit sticky top-24">
        {content}
      </aside>

      {/* Mobile Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden overflow-hidden">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onCloseMobile} />
          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-xs bg-cream-50 shadow-2xl p-6 flex flex-col justify-between overflow-y-auto">
              <div className="flex justify-end pb-2">
                <button
                  onClick={onCloseMobile}
                  className="p-1 rounded-full text-stone-500 hover:text-black"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              {content}
              <div className="pt-6">
                <button
                  onClick={onCloseMobile}
                  className="w-full py-3 bg-onyx-950 text-cream-50 text-xs font-semibold uppercase tracking-widest rounded-lg hover:bg-gold-600 transition-colors"
                >
                  Show Results
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
