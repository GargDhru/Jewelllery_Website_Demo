import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Heart, ShoppingBag, User as UserIcon, Menu, X, ChevronDown,
  Sparkles, ShieldCheck, LogOut, Package, Settings, ExternalLink
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useCurrency } from '../../context/CurrencyContext';

interface NavbarProps {
  onOpenSearch?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenSearch }) => {
  const { user, logout, isAdmin } = useAuth();
  const { itemCount, setIsCartOpen } = useCart();
  const { wishlistCount } = useWishlist();
  const { currency, setCurrency } = useCurrency();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsCategoryMenuOpen(false);
    setIsUserMenuOpen(false);
    setIsSearchOpen(false);
  }, [location.pathname]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };

  const categories = [
    { name: "Earrings", slug: "earrings", img: "https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=200&q=80" },
    { name: "Necklaces", slug: "necklaces", img: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=200&q=80" },
    { name: "Rings", slug: "rings", img: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=200&q=80" },
    { name: "Bracelets", slug: "bracelets", img: "https://images.unsplash.com/photo-1611591475870-136511a2fef9?auto=format&fit=crop&w=200&q=80" },
    { name: "Pendant Sets", slug: "pendant-sets", img: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=200&q=80" },
    { name: "Anklets", slug: "anklets", img: "https://images.unsplash.com/photo-1600003014755-ba31aa59c4b6?auto=format&fit=crop&w=200&q=80" },
    { name: "Jewellery Sets", slug: "jewellery-sets", img: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=200&q=80" },
    { name: "Gift Collections", slug: "gift-collections", img: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=200&q=80" },
  ];

  return (
    <>
      <header
        className={`sticky top-0 z-40 w-full transition-all duration-300 ${
          isScrolled
            ? 'bg-cream-50/95 backdrop-blur-md shadow-sm border-b border-cream-200 py-3.5'
            : 'bg-cream-50 border-b border-cream-200/60 py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Mobile Menu Button */}
            <div className="flex items-center lg:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 text-stone-700 hover:text-black focus:outline-none"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>

            {/* Desktop Navigation Links Left */}
            <nav className="hidden lg:flex items-center space-x-7 text-xs font-medium tracking-widest uppercase">
              <Link to="/shop" className="text-stone-800 hover:text-gold-600 transition-colors py-1">
                Shop All
              </Link>

              {/* Categories Dropdown */}
              <div
                className="relative"
                onMouseEnter={() => setIsCategoryMenuOpen(true)}
                onMouseLeave={() => setIsCategoryMenuOpen(false)}
              >
                <button className="flex items-center gap-1 text-stone-800 hover:text-gold-600 transition-colors py-1 focus:outline-none">
                  <span>Categories</span>
                  <ChevronDown className="w-3.5 h-3.5 text-stone-400" />
                </button>

                <AnimatePresence>
                  {isCategoryMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute top-full -left-10 w-[520px] bg-white rounded-xl shadow-luxury-hover border border-cream-200 p-5 grid grid-cols-2 gap-3 z-50"
                    >
                      {categories.map((cat) => (
                        <Link
                          key={cat.slug}
                          to={`/category/${cat.slug}`}
                          className="flex items-center gap-3 p-2 rounded-lg hover:bg-cream-100/70 transition-colors group"
                        >
                          <img
                            src={cat.img}
                            alt={cat.name}
                            className="w-12 h-12 rounded-md object-cover border border-cream-300 group-hover:scale-105 transition-transform"
                          />
                          <div>
                            <p className="font-serif text-sm font-medium text-onyx-950 group-hover:text-gold-700 normal-case">
                              {cat.name}
                            </p>
                            <span className="text-[10px] text-stone-400 tracking-normal normal-case">
                              View Collection →
                            </span>
                          </div>
                        </Link>
                      ))}
                      <div className="col-span-2 pt-2 border-t border-cream-100 flex justify-between items-center text-[11px] normal-case text-stone-500">
                        <span>100% Anti-Tarnish & Waterproof Jewellery</span>
                        <Link to="/shop" className="text-gold-700 font-semibold hover:underline">
                          Browse All Categories
                        </Link>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <Link to="/shop?sort=bestselling" className="text-stone-800 hover:text-gold-600 transition-colors py-1">
                Best Sellers
              </Link>
              <Link to="/shop?new=true" className="text-stone-800 hover:text-gold-600 transition-colors py-1">
                New Arrivals
              </Link>
              <Link to="/about" className="text-stone-800 hover:text-gold-600 transition-colors py-1">
                Atelier Story
              </Link>
            </nav>

            {/* Brand Logo Monogram Center */}
            <div className="flex-1 lg:flex-initial text-center lg:text-center">
              <Link to="/" className="inline-block group">
                <div className="flex items-center justify-center gap-2">
                  <div className="w-8 h-8 rounded-full border border-gold-500/80 bg-onyx-950 flex items-center justify-center text-gold-400 group-hover:rotate-45 transition-transform duration-500 shadow-sm">
                    <Sparkles className="w-4 h-4 text-gold-400" />
                  </div>
                  <div className="text-left">
                    <span className="font-serif tracking-[0.25em] text-2xl font-bold uppercase text-onyx-950 block leading-tight">
                      AURA
                    </span>
                    <span className="text-[9px] tracking-[0.35em] uppercase text-gold-700 block -mt-1 font-semibold">
                      ATELIER
                    </span>
                  </div>
                </div>
              </Link>
            </div>

            {/* Right Side Actions: Currency, Search, Wishlist, Account, Cart */}
            <div className="flex items-center space-x-3 sm:space-x-5">
              {/* Currency Selector */}
              <div className="hidden sm:flex items-center border border-cream-300 rounded-md px-2 py-1 text-[11px] font-semibold bg-white text-stone-700">
                <button
                  onClick={() => setCurrency(currency === 'INR' ? 'USD' : 'INR')}
                  className="hover:text-gold-700 flex items-center gap-1 focus:outline-none"
                  title="Toggle Currency"
                >
                  <span>{currency === 'INR' ? '🇮🇳 INR (₹)' : '🇺🇸 USD ($)'}</span>
                </button>
              </div>

              {/* Search Button */}
              <button
                onClick={() => setIsSearchOpen(true)}
                className="p-1.5 text-stone-700 hover:text-gold-600 transition-colors focus:outline-none"
                title="Search Products"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Wishlist Button */}
              <Link
                to="/account?tab=wishlist"
                className="relative p-1.5 text-stone-700 hover:text-gold-600 transition-colors focus:outline-none"
                title="Wishlist"
              >
                <Heart className="w-5 h-5" />
                {wishlistCount > 0 && (
                  <span className="absolute top-0 right-0 w-4 h-4 rounded-full bg-gold-600 text-cream-50 text-[10px] font-bold flex items-center justify-center">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              {/* User Account Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="p-1.5 text-stone-700 hover:text-gold-600 transition-colors focus:outline-none flex items-center gap-1"
                  title="Account"
                >
                  <UserIcon className="w-5 h-5" />
                  {user && (
                    <span className="hidden md:inline-block text-xs font-semibold max-w-[80px] truncate text-onyx-950">
                      {user.full_name?.split(' ')[0] || 'Patron'}
                    </span>
                  )}
                </button>

                <AnimatePresence>
                  {isUserMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-luxury-hover border border-cream-200 py-2 z-50 text-xs"
                    >
                      {user ? (
                        <>
                          <div className="px-4 py-2 border-b border-cream-100">
                            <p className="font-semibold text-onyx-950 truncate">{user.full_name || 'Valued Patron'}</p>
                            <p className="text-[11px] text-stone-400 truncate">{user.email}</p>
                            {isAdmin && (
                              <span className="inline-block mt-1 px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-bold text-[10px]">
                                Administrator
                              </span>
                            )}
                          </div>
                          <Link
                            to="/account"
                            onClick={() => setIsUserMenuOpen(false)}
                            className="flex items-center gap-2 px-4 py-2.5 text-stone-700 hover:bg-cream-100 hover:text-gold-700"
                          >
                            <UserIcon className="w-4 h-4" />
                            <span>My Profile & Addresses</span>
                          </Link>
                          <Link
                            to="/account?tab=orders"
                            onClick={() => setIsUserMenuOpen(false)}
                            className="flex items-center gap-2 px-4 py-2.5 text-stone-700 hover:bg-cream-100 hover:text-gold-700"
                          >
                            <Package className="w-4 h-4" />
                            <span>Order History & Tracking</span>
                          </Link>
                          {isAdmin && (
                            <Link
                              to="/admin"
                              onClick={() => setIsUserMenuOpen(false)}
                              className="flex items-center gap-2 px-4 py-2.5 text-gold-800 font-semibold bg-gold-50/50 hover:bg-gold-100/70"
                            >
                              <Settings className="w-4 h-4 text-gold-600" />
                              <span>Admin Dashboard</span>
                            </Link>
                          )}
                          <div className="border-t border-cream-100 mt-1 pt-1">
                            <button
                              onClick={() => {
                                logout();
                                setIsUserMenuOpen(false);
                              }}
                              className="w-full flex items-center gap-2 px-4 py-2.5 text-red-600 hover:bg-red-50 text-left"
                            >
                              <LogOut className="w-4 h-4" />
                              <span>Sign Out</span>
                            </button>
                          </div>
                        </>
                      ) : (
                        <div className="p-3 space-y-2">
                          <Link
                            to="/login"
                            onClick={() => setIsUserMenuOpen(false)}
                            className="block w-full py-2 bg-onyx-950 text-cream-50 text-center font-medium rounded hover:bg-gold-600 transition-colors uppercase text-[11px] tracking-wider"
                          >
                            Sign In
                          </Link>
                          <Link
                            to="/register"
                            onClick={() => setIsUserMenuOpen(false)}
                            className="block w-full py-2 border border-cream-300 text-stone-800 text-center font-medium rounded hover:bg-cream-100 transition-colors uppercase text-[11px] tracking-wider"
                          >
                            Create Account
                          </Link>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Shopping Bag Button */}
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative p-2 bg-onyx-950 text-cream-50 rounded-full hover:bg-gold-600 transition-colors shadow-sm focus:outline-none flex items-center justify-center"
                title="Shopping Bag"
              >
                <ShoppingBag className="w-4 h-4" />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-gold-500 text-onyx-950 text-[10px] font-black flex items-center justify-center">
                    {itemCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Search Overlay Modal */}
      <AnimatePresence>
        {isSearchOpen && (
          <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-cream-200 overflow-hidden"
            >
              <div className="p-4 border-b border-cream-200 flex items-center gap-3">
                <Search className="w-5 h-5 text-gold-600 shrink-0" />
                <form onSubmit={handleSearchSubmit} className="flex-1">
                  <input
                    type="text"
                    placeholder="Search rings, choker necklaces, pearl earrings, 18K gold..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    autoFocus
                    className="w-full text-base font-serif text-onyx-950 placeholder:text-stone-400 focus:outline-none"
                  />
                </form>
                <button
                  onClick={() => setIsSearchOpen(false)}
                  className="p-1 text-stone-400 hover:text-black rounded-full"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-5 bg-cream-50 text-xs">
                <p className="font-semibold text-stone-500 uppercase tracking-wider mb-2">Popular Searches</p>
                <div className="flex flex-wrap gap-2">
                  {['Baroque Pearl', 'Solitaire Ring', '18K Gold Choker', 'Tennis Necklace', 'Anti-Tarnish Anklet', 'Emerald Pendant'].map((term) => (
                    <button
                      key={term}
                      onClick={() => {
                        navigate(`/shop?search=${encodeURIComponent(term)}`);
                        setIsSearchOpen(false);
                      }}
                      className="px-3 py-1.5 rounded-full bg-white border border-cream-300 text-stone-700 hover:border-gold-500 hover:text-gold-700 transition-colors"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Mobile Navigation Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-white border-b border-cream-300 px-6 py-5 shadow-xl overflow-hidden"
          >
            <div className="space-y-4 text-sm font-medium">
              <Link to="/shop" className="block text-onyx-950 hover:text-gold-600 uppercase tracking-wider">
                Shop All Jewellery
              </Link>
              <div className="pt-2 border-t border-cream-100">
                <p className="text-xs uppercase tracking-widest text-gold-700 font-bold mb-2">Categories</p>
                <div className="grid grid-cols-2 gap-2 text-xs text-stone-600">
                  {categories.map((c) => (
                    <Link
                      key={c.slug}
                      to={`/category/${c.slug}`}
                      className="py-1 hover:text-gold-700"
                    >
                      {c.name}
                    </Link>
                  ))}
                </div>
              </div>
              <div className="pt-2 border-t border-cream-100 space-y-2">
                <Link to="/shop?sort=bestselling" className="block text-stone-800 hover:text-gold-600">
                  Best Sellers
                </Link>
                <Link to="/shop?new=true" className="block text-stone-800 hover:text-gold-600">
                  New Arrivals
                </Link>
                <Link to="/about" className="block text-stone-800 hover:text-gold-600">
                  Atelier Story & Craftsmanship
                </Link>
                <Link to="/contact" className="block text-stone-800 hover:text-gold-600">
                  Concierge & Care
                </Link>
                {isAdmin && (
                  <Link to="/admin" className="block text-gold-800 font-bold">
                    Admin Dashboard
                  </Link>
                )}
              </div>
              <div className="pt-3 border-t border-cream-100 flex items-center justify-between">
                <span className="text-xs text-stone-500">Currency</span>
                <button
                  onClick={() => setCurrency(currency === 'INR' ? 'USD' : 'INR')}
                  className="text-xs font-semibold text-gold-700 bg-cream-100 px-3 py-1 rounded"
                >
                  {currency === 'INR' ? '🇮🇳 INR (₹)' : '🇺🇸 USD ($)'}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

