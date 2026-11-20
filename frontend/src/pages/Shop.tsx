import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, SlidersHorizontal, Grid3X3, LayoutGrid, List, Search, X, Sparkles } from 'lucide-react';
import { categoryApi, productApi } from '../services/api';
import { Category, Product } from '../types';
import { ProductCard } from '../components/product/ProductCard';
import { FilterSidebar } from '../components/product/FilterSidebar';
import { QuickViewModal } from '../components/product/QuickViewModal';
import { useCurrency } from '../context/CurrencyContext';

export const Shop: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { formatPrice } = useCurrency();

  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [layoutMode, setLayoutMode] = useState<'grid4' | 'grid3' | 'list'>('grid4');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 6;

  // Filter state
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    search: searchParams.get('search') || '',
    minPrice: Number(searchParams.get('min_price')) || 500,
    maxPrice: Number(searchParams.get('max_price')) || 15000,
    color: searchParams.get('color') || '',
    material: searchParams.get('material') || '',
    inStock: searchParams.get('in_stock') === 'true',
    sort: searchParams.get('sort') || 'featured',
  });

  // Load Categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const cats = await categoryApi.getAll();
        setCategories(cats);
      } catch (err) {
        console.error('Failed to fetch categories:', err);
      }
    };
    fetchCategories();
  }, []);

  // Update filters if URL parameters change
  useEffect(() => {
    setFilters((prev) => ({
      ...prev,
      category: searchParams.get('category') || '',
      search: searchParams.get('search') || '',
      sort: searchParams.get('sort') || prev.sort,
      inStock: searchParams.get('in_stock') === 'true',
    }));
  }, [searchParams]);

  // Fetch Products based on filters
  useEffect(() => {
    setCurrentPage(1);
    const fetchFilteredProducts = async () => {
      try {
        setLoading(true);
        const params: Record<string, any> = {
          sort: filters.sort,
          min_price: filters.minPrice,
          max_price: filters.maxPrice,
        };

        if (filters.category) params.category = filters.category;
        if (filters.search) params.search = filters.search;
        if (filters.color) params.color = filters.color;
        if (filters.material) params.material = filters.material;
        if (filters.inStock) params.in_stock = true;
        if (searchParams.get('new') === 'true') params.is_new_arrival = true;

        const data = await productApi.getAll(params);
        setProducts(data);
      } catch (err) {
        console.error('Failed to fetch products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFilteredProducts();
  }, [filters, searchParams]);

  const handleFilterChange = (updated: Partial<typeof filters>) => {
    setFilters((prev) => ({ ...prev, ...updated }));
  };

  const handleResetFilters = () => {
    setFilters({
      category: '',
      search: '',
      minPrice: 500,
      maxPrice: 15000,
      color: '',
      material: '',
      inStock: false,
      sort: 'featured',
    });
    setSearchParams({});
  };

  const activeFilterCount =
    (filters.category ? 1 : 0) +
    (filters.search ? 1 : 0) +
    (filters.color ? 1 : 0) +
    (filters.material ? 1 : 0) +
    (filters.inStock ? 1 : 0) +
    (filters.maxPrice < 15000 ? 1 : 0);

  const totalPages = Math.ceil(products.length / itemsPerPage);
  const paginatedProducts = products.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="min-h-screen bg-cream-50 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb & Title */}
        <div className="mb-8">
          <span className="text-xs uppercase tracking-[0.25em] text-gold-700 font-bold block mb-1">
            Artisan Demi-Fine Catalogue
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl text-onyx-950 font-medium">
            {filters.category
              ? `${categories.find((c) => c.slug === filters.category)?.name || 'Jewellery'} Collection`
              : 'The Complete Jewellery Vault'}
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1 max-w-xl">
            Explore 18K gold plated anti-tarnish earrings, necklaces, rings, and handcrafted resin heirlooms with a 1-year guarantee on color and lustre.
          </p>
        </div>

        {/* Top Controls Bar: Search, Filter Toggle, Sort, Layout */}
        <div className="bg-white p-4 rounded-xl border border-cream-200/90 shadow-soft mb-8 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by jewellery title, stone, material..."
              value={filters.search}
              onChange={(e) => handleFilterChange({ search: e.target.value })}
              className="w-full pl-9 pr-4 py-2 bg-cream-50 border border-cream-300 rounded-lg text-xs focus:outline-none focus:border-gold-500"
            />
            {filters.search && (
              <button
                onClick={() => handleFilterChange({ search: '' })}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-black"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center justify-between md:justify-end gap-3 flex-wrap">
            {/* Mobile Filter Toggle */}
            <button
              onClick={() => setIsMobileFilterOpen(true)}
              className="lg:hidden flex items-center gap-2 px-3 py-2 bg-cream-100 border border-cream-300 rounded-lg text-xs font-semibold text-stone-700 hover:bg-cream-200"
            >
              <SlidersHorizontal className="w-4 h-4 text-gold-600" />
              <span>Filters {activeFilterCount > 0 && `(${activeFilterCount})`}</span>
            </button>

            {/* Sort Select */}
            <div className="flex items-center gap-2 text-xs">
              <span className="text-stone-500 hidden sm:inline">Sort:</span>
              <select
                value={filters.sort}
                onChange={(e) => handleFilterChange({ sort: e.target.value })}
                className="px-3 py-2 bg-cream-50 border border-cream-300 rounded-lg text-xs font-medium text-stone-800 focus:outline-none focus:border-gold-500"
              >
                <option value="featured">Featured Curations</option>
                <option value="bestselling">Best Sellers First</option>
                <option value="newest">Newest Arrivals</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>

            {/* Layout Switcher (Desktop) */}
            <div className="hidden sm:flex items-center border border-cream-300 rounded-lg p-0.5 bg-cream-50">
              <button
                onClick={() => setLayoutMode('grid4')}
                className={`p-1.5 rounded ${layoutMode === 'grid4' ? 'bg-white text-gold-700 shadow-sm' : 'text-stone-400 hover:text-stone-700'}`}
                title="4 Columns"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setLayoutMode('grid3')}
                className={`p-1.5 rounded ${layoutMode === 'grid3' ? 'bg-white text-gold-700 shadow-sm' : 'text-stone-400 hover:text-stone-700'}`}
                title="3 Columns"
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setLayoutMode('list')}
                className={`p-1.5 rounded ${layoutMode === 'list' ? 'bg-white text-gold-700 shadow-sm' : 'text-stone-400 hover:text-stone-700'}`}
                title="List View"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Active Filter Pills */}
        {activeFilterCount > 0 && (
          <div className="flex flex-wrap items-center gap-2 mb-6">
            <span className="text-xs text-stone-500 font-medium">Active filters:</span>
            {filters.category && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gold-100 text-gold-900 text-xs font-medium border border-gold-300">
                Category: {categories.find((c) => c.slug === filters.category)?.name || filters.category}
                <button onClick={() => handleFilterChange({ category: '' })}><X className="w-3 h-3" /></button>
              </span>
            )}
            {filters.search && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gold-100 text-gold-900 text-xs font-medium border border-gold-300">
                "{filters.search}"
                <button onClick={() => handleFilterChange({ search: '' })}><X className="w-3 h-3" /></button>
              </span>
            )}
            {filters.color && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gold-100 text-gold-900 text-xs font-medium border border-gold-300">
                Color: {filters.color}
                <button onClick={() => handleFilterChange({ color: '' })}><X className="w-3 h-3" /></button>
              </span>
            )}
            {filters.material && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gold-100 text-gold-900 text-xs font-medium border border-gold-300">
                Material: {filters.material}
                <button onClick={() => handleFilterChange({ material: '' })}><X className="w-3 h-3" /></button>
              </span>
            )}
            {filters.inStock && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-medium border border-emerald-300">
                In Stock Only
                <button onClick={() => handleFilterChange({ inStock: false })}><X className="w-3 h-3" /></button>
              </span>
            )}
            <button
              onClick={handleResetFilters}
              className="text-xs text-stone-500 hover:text-red-600 underline underline-offset-2 ml-2"
            >
              Clear All
            </button>
          </div>
        )}

        {/* Main Content Layout: Sidebar + Grid */}
        <div className="flex gap-8">
          {/* Desktop Filter Sidebar */}
          <FilterSidebar
            categories={categories}
            filters={filters}
            onFilterChange={handleFilterChange}
            onReset={handleResetFilters}
            isMobileOpen={isMobileFilterOpen}
            onCloseMobile={() => setIsMobileFilterOpen(false)}
          />

          {/* Product Grid Area */}
          <div className="flex-1">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="animate-pulse bg-white rounded-xl p-4 border border-cream-200">
                    <div className="aspect-[4/5] bg-cream-200 rounded-lg mb-4" />
                    <div className="h-4 bg-cream-200 rounded w-3/4 mb-2" />
                    <div className="h-4 bg-cream-200 rounded w-1/2 mb-4" />
                    <div className="h-8 bg-cream-200 rounded w-full" />
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-cream-200 shadow-soft">
                <div className="w-16 h-16 rounded-full bg-cream-100 flex items-center justify-center text-gold-600 mx-auto mb-4">
                  <Sparkles className="w-8 h-8" />
                </div>
                <h3 className="font-serif text-2xl font-medium text-onyx-950 mb-2">
                  No matching treasures found
                </h3>
                <p className="text-stone-500 text-xs sm:text-sm max-w-md mx-auto mb-6">
                  We couldn't find any pieces matching your specific filter combination. Try resetting your filters to explore our full collection.
                </p>
                <button
                  onClick={handleResetFilters}
                  className="px-6 py-2.5 bg-onyx-950 text-cream-50 text-xs font-semibold uppercase tracking-widest rounded-lg hover:bg-gold-600 transition-colors"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div
                className={
                  layoutMode === 'grid4'
                    ? 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6'
                    : layoutMode === 'grid3'
                    ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6'
                    : 'flex flex-col gap-4'
                }
              >
                {paginatedProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onQuickView={(p) => setQuickViewProduct(p)}
                  />
                ))}
              </div>
            )}

            {/* Pagination Controls */}
            {!loading && totalPages > 1 && (
              <div className="mt-10 flex items-center justify-center gap-2">
                <button
                  onClick={() => {
                    setCurrentPage((p) => Math.max(1, p - 1));
                    window.scrollTo({ top: 300, behavior: 'smooth' });
                  }}
                  disabled={currentPage === 1}
                  className="px-3.5 py-1.5 border border-cream-300 rounded-lg text-xs font-semibold text-stone-600 hover:bg-cream-100 disabled:opacity-40 transition-colors"
                >
                  Previous
                </button>
                {[...Array(totalPages)].map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setCurrentPage(idx + 1);
                      window.scrollTo({ top: 300, behavior: 'smooth' });
                    }}
                    className={`w-8 h-8 rounded-lg text-xs font-semibold transition-colors ${
                      currentPage === idx + 1
                        ? 'bg-onyx-950 text-cream-50'
                        : 'border border-cream-300 text-stone-700 hover:bg-cream-100'
                    }`}
                  >
                    {idx + 1}
                  </button>
                ))}
                <button
                  onClick={() => {
                    setCurrentPage((p) => Math.min(totalPages, p + 1));
                    window.scrollTo({ top: 300, behavior: 'smooth' });
                  }}
                  disabled={currentPage === totalPages}
                  className="px-3.5 py-1.5 border border-cream-300 rounded-lg text-xs font-semibold text-stone-600 hover:bg-cream-100 disabled:opacity-40 transition-colors"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick View Modal */}
      <QuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />
    </div>
  );
};

