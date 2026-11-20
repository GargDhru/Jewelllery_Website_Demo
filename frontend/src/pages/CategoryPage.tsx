import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Sparkles, ArrowLeft, Filter, SlidersHorizontal } from 'lucide-react';
import { categoryApi, productApi } from '../services/api';
import { Category, Product } from '../types';
import { ProductCard } from '../components/product/ProductCard';
import { QuickViewModal } from '../components/product/QuickViewModal';
import { FilterSidebar } from '../components/product/FilterSidebar';

export const CategoryPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [category, setCategory] = useState<Category | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Filters specific to this category page
  const [filters, setFilters] = useState({
    category: slug || '',
    minPrice: 500,
    maxPrice: 15000,
    color: '',
    material: '',
    inStock: false,
    sort: 'featured',
  });

  useEffect(() => {
    setFilters((prev) => ({ ...prev, category: slug || '' }));
  }, [slug]);

  useEffect(() => {
    const fetchCategoryAndProducts = async () => {
      if (!slug) return;
      try {
        setLoading(true);
        const [cats, catData] = await Promise.all([
          categoryApi.getAll(),
          categoryApi.getBySlug(slug).catch(() => null),
        ]);
        setCategories(cats);
        setCategory(catData);

        const prods = await productApi.getAll({
          category: slug,
          min_price: filters.minPrice,
          max_price: filters.maxPrice,
          color: filters.color,
          material: filters.material,
          in_stock: filters.inStock ? true : undefined,
          sort: filters.sort,
        });
        setProducts(prods);
      } catch (err) {
        console.error('Failed to load category data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryAndProducts();
  }, [slug, filters]);

  const handleFilterChange = (updated: Partial<typeof filters>) => {
    setFilters((prev) => ({ ...prev, ...updated }));
  };

  const handleResetFilters = () => {
    setFilters({
      category: slug || '',
      minPrice: 500,
      maxPrice: 15000,
      color: '',
      material: '',
      inStock: false,
      sort: 'featured',
    });
  };

  const bannerImg = category?.banner_url || category?.image_url || 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=1600&q=80';

  return (
    <div className="min-h-screen bg-cream-50">
      {/* Category Hero Banner */}
      <div className="relative h-64 sm:h-80 w-full overflow-hidden bg-onyx-950">
        <img
          src={bannerImg}
          alt={category?.name || 'Category Banner'}
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/55 to-black/30" />

        <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-center text-white">
          <Link
            to="/shop"
            className="inline-flex items-center gap-1.5 text-xs text-gold-300 hover:text-white uppercase tracking-widest font-semibold mb-3 w-fit"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>All Categories</span>
          </Link>
          <h1 className="font-serif text-3xl sm:text-5xl font-medium tracking-tight">
            {category?.name || slug}
          </h1>
          <p className="text-xs sm:text-sm text-stone-300 max-w-xl mt-2 font-light">
            {category?.description || 'Handcrafted luxury pieces finished in 18K anti-tarnish gold plating.'}
          </p>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex justify-between items-center mb-6">
          <p className="text-xs text-stone-500 font-medium">
            Showing <strong className="text-onyx-950">{products.length}</strong> creations in {category?.name || slug}
          </p>

          <button
            onClick={() => setIsMobileFilterOpen(true)}
            className="lg:hidden flex items-center gap-2 px-3 py-1.5 bg-white border border-cream-300 rounded-lg text-xs font-semibold text-stone-700"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-gold-600" />
            <span>Filters</span>
          </button>
        </div>

        <div className="flex gap-8">
          {/* Desktop Filter Sidebar */}
          <FilterSidebar
            categories={categories}
            filters={{ ...filters, search: '' }}
            onFilterChange={handleFilterChange}
            onReset={handleResetFilters}
            isMobileOpen={isMobileFilterOpen}
            onCloseMobile={() => setIsMobileFilterOpen(false)}
          />

          {/* Product Grid */}
          <div className="flex-1">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="animate-pulse bg-white rounded-xl p-4 border border-cream-200">
                    <div className="aspect-[4/5] bg-cream-200 rounded-lg mb-4" />
                    <div className="h-4 bg-cream-200 rounded w-3/4 mb-2" />
                    <div className="h-4 bg-cream-200 rounded w-1/2" />
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-cream-200 shadow-soft">
                <Sparkles className="w-8 h-8 text-gold-600 mx-auto mb-3" />
                <h3 className="font-serif text-xl font-medium text-onyx-950 mb-2">
                  No pieces currently found in this category
                </h3>
                <p className="text-xs text-stone-500 mb-6">
                  Try adjusting your filter options or browse all available items.
                </p>
                <Link
                  to="/shop"
                  className="px-6 py-2.5 bg-onyx-950 text-cream-50 text-xs font-semibold uppercase tracking-widest rounded-lg hover:bg-gold-600 transition-colors"
                >
                  Explore All Jewellery
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onQuickView={(p) => setQuickViewProduct(p)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <QuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />
    </div>
  );
};

