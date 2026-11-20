import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Product } from '../../types';
import { ProductCard } from '../product/ProductCard';

interface BestSellersProps {
  products: Product[];
  onQuickView: (product: Product) => void;
}

export const BestSellersSection: React.FC<BestSellersProps> = ({ products, onQuickView }) => {
  const [activeTab, setActiveTab] = useState('All');

  const tabs = ['All', 'Earrings', 'Necklaces', 'Rings', 'Bracelets'];

  const filteredProducts = activeTab === 'All'
    ? products.slice(0, 8)
    : products.filter((p) => p.category?.name.toLowerCase() === activeTab.toLowerCase()).slice(0, 8);

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <span className="text-xs uppercase tracking-[0.3em] text-gold-700 font-bold block mb-2">
              Patron Favorites
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl text-onyx-950 font-medium">
              Best-Selling Creations
            </h2>
            <div className="w-16 h-0.5 bg-gold-500 mt-3" />
          </div>

          {/* Filter Tabs */}
          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-full text-xs font-semibold tracking-wider transition-all ${
                  activeTab === tab
                    ? 'bg-onyx-950 text-cream-50 shadow-sm'
                    : 'bg-cream-100 text-stone-600 hover:text-onyx-950 hover:bg-cream-200'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Product Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onQuickView={onQuickView}
            />
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link
            to="/shop?sort=bestselling"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-cream-100 border border-cream-300 text-onyx-950 text-xs font-semibold tracking-[0.2em] uppercase rounded-lg hover:bg-gold-500 hover:text-white hover:border-gold-500 transition-all shadow-sm"
          >
            <span>View All Best Sellers</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
};

