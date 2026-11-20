import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Compass, Heart, ShoppingBag, User } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';

export const MobileNav: React.FC = () => {
  const location = useLocation();
  const { itemCount, setIsCartOpen } = useCart();
  const { wishlistCount } = useWishlist();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-cream-200 px-4 py-2 shadow-lg">
      <div className="flex items-center justify-around">
        <Link
          to="/"
          className={`flex flex-col items-center gap-1 py-1 px-3 text-[10px] font-medium transition-colors ${
            isActive('/') ? 'text-gold-700 font-bold' : 'text-stone-500 hover:text-stone-900'
          }`}
        >
          <Home className="w-4 h-4" />
          <span>Home</span>
        </Link>

        <Link
          to="/shop"
          className={`flex flex-col items-center gap-1 py-1 px-3 text-[10px] font-medium transition-colors ${
            isActive('/shop') ? 'text-gold-700 font-bold' : 'text-stone-500 hover:text-stone-900'
          }`}
        >
          <Compass className="w-4 h-4" />
          <span>Shop</span>
        </Link>

        <Link
          to="/account?tab=wishlist"
          className={`relative flex flex-col items-center gap-1 py-1 px-3 text-[10px] font-medium transition-colors ${
            location.search.includes('tab=wishlist') ? 'text-gold-700 font-bold' : 'text-stone-500 hover:text-stone-900'
          }`}
        >
          <Heart className="w-4 h-4" />
          <span>Wishlist</span>
          {wishlistCount > 0 && (
            <span className="absolute top-0 right-2 w-3.5 h-3.5 rounded-full bg-gold-600 text-cream-50 text-[9px] font-bold flex items-center justify-center">
              {wishlistCount}
            </span>
          )}
        </Link>

        <button
          onClick={() => setIsCartOpen(true)}
          className="relative flex flex-col items-center gap-1 py-1 px-3 text-[10px] font-medium text-stone-500 hover:text-stone-900 focus:outline-none"
        >
          <ShoppingBag className="w-4 h-4 text-onyx-950" />
          <span>Bag</span>
          {itemCount > 0 && (
            <span className="absolute top-0 right-2 w-3.5 h-3.5 rounded-full bg-gold-600 text-cream-50 text-[9px] font-bold flex items-center justify-center">
              {itemCount}
            </span>
          )}
        </button>

        <Link
          to="/account"
          className={`flex flex-col items-center gap-1 py-1 px-3 text-[10px] font-medium transition-colors ${
            isActive('/account') ? 'text-gold-700 font-bold' : 'text-stone-500 hover:text-stone-900'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Account</span>
        </Link>
      </div>
    </div>
  );
};

