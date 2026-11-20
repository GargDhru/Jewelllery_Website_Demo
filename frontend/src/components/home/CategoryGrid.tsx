import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { Category } from '../../types';

interface CategoryGridProps {
  categories: Category[];
}

export const CategoryGrid: React.FC<CategoryGridProps> = ({ categories }) => {
  return (
    <section className="py-20 bg-cream-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-xl mx-auto mb-14">
          <span className="text-xs uppercase tracking-[0.3em] text-gold-700 font-bold block mb-2">
            Curated Adornments
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl text-onyx-950 font-medium">
            Shop by Category
          </h2>
          <div className="w-16 h-0.5 bg-gold-500 mx-auto mt-4" />
          <p className="text-stone-500 text-xs sm:text-sm mt-3 leading-relaxed">
            From regal bridal ensembles to everyday anti-tarnish essentials, explore our dedicated jewellery vaults.
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 sm:gap-6">
          {categories.slice(0, 10).map((cat) => (
            <Link
              key={cat.id}
              to={`/category/${cat.slug}`}
              className="group flex flex-col items-center text-center p-3 sm:p-4 rounded-2xl bg-white border border-cream-200/80 shadow-soft hover:shadow-luxury-hover hover:border-gold-300 transition-all duration-300"
            >
              <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden bg-cream-200 p-1 border-2 border-gold-400/30 group-hover:border-gold-500 transition-all mb-3.5">
                <img
                  src={cat.image_url || 'https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=400&q=80'}
                  alt={cat.name}
                  className="w-full h-full rounded-full object-cover object-center group-hover:scale-115 transition-transform duration-500"
                />
              </div>

              <h3 className="font-serif text-sm sm:text-base font-semibold text-onyx-950 group-hover:text-gold-700 transition-colors">
                {cat.name}
              </h3>
              <span className="text-[11px] text-stone-400 group-hover:text-stone-600 transition-colors mt-0.5 inline-flex items-center gap-0.5">
                Explore <ArrowUpRight className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

