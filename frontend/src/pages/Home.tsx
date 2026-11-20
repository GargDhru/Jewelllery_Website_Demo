import React, { useState, useEffect } from 'react';
import { HeroSection } from '../components/home/HeroSection';
import { CategoryGrid } from '../components/home/CategoryGrid';
import { BestSellersSection } from '../components/home/BestSellersSection';
import { FeaturedCollections } from '../components/home/FeaturedCollections';
import { BrandStorySection } from '../components/home/BrandStorySection';
import { CustomerReviewsSection } from '../components/home/CustomerReviewsSection';
import { InstagramGallery } from '../components/home/InstagramGallery';
import { QuickViewModal } from '../components/product/QuickViewModal';
import { ProductCard } from '../components/product/ProductCard';
import { categoryApi, productApi } from '../services/api';
import { Category, Product } from '../types';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';

export const Home: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [cats, prods, newProds] = await Promise.all([
          categoryApi.getAll(),
          productApi.getAll({ limit: 12 }),
          productApi.getAll({ is_new_arrival: true, limit: 4 }),
        ]);
        setCategories(cats);
        setProducts(prods);
        setNewArrivals(newProds);
      } catch (err) {
        console.error('Failed to load home page data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-cream-50">
      {/* Hero Banner */}
      <HeroSection />

      {/* Category Grid */}
      <CategoryGrid categories={categories} />

      {/* Best Sellers with Tabs */}
      <BestSellersSection
        products={products}
        onQuickView={(p) => setQuickViewProduct(p)}
      />

      {/* Featured Editorial Lookbooks */}
      <FeaturedCollections />

      {/* New Arrivals Showcase */}
      {newArrivals.length > 0 && (
        <section className="py-20 bg-cream-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row items-baseline justify-between mb-10 gap-3">
              <div>
                <span className="text-xs uppercase tracking-[0.3em] text-gold-700 font-bold block mb-1">
                  Fresh from Atelier
                </span>
                <h2 className="font-serif text-3xl sm:text-4xl text-onyx-950 font-medium">
                  New Seasonal Drops
                </h2>
                <div className="w-16 h-0.5 bg-gold-500 mt-2" />
              </div>

              <Link
                to="/shop?new=true"
                className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest text-gold-700 font-bold hover:text-gold-900 transition-colors"
              >
                <span>View All New Arrivals</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {newArrivals.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onQuickView={(p) => setQuickViewProduct(p)}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Brand & Craftsmanship Story */}
      <BrandStorySection />

      {/* Customer Reviews & Testimonials */}
      <CustomerReviewsSection />

      {/* Instagram Live Gallery */}
      <InstagramGallery />

      {/* Quick View Lightbox Modal */}
      <QuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />
    </div>
  );
};

