import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, ShoppingBag, Eye, Star, Sparkles } from 'lucide-react';
import { Product } from '../../types';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useCurrency } from '../../context/CurrencyContext';
import { useToast } from '../../context/ToastContext';
import { ColorSwatch } from './ColorSwatch';

interface ProductCardProps {
  product: Product;
  onQuickView?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onQuickView }) => {
  const { addItem } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { formatPrice } = useCurrency();
  const toast = useToast();
  const [isHovered, setIsHovered] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  const wishlisted = isInWishlist(product.id);

  const primaryImage = product.images?.[0]?.image_url || 'https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=600&q=80';
  const secondaryImage = product.images?.[1]?.image_url || primaryImage;

  const discountPercent = product.compare_at_price && product.compare_at_price > product.price
    ? Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100)
    : 0;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      setIsAdding(true);
      await addItem(product, product.variants?.[0]?.id, 1);
      toast.success(`Added ${product.title} to your bag`);
    } catch (err: any) {
      toast.error('Could not add to bag');
    } finally {
      setIsAdding(false);
    }
  };

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
    if (!wishlisted) {
      toast.success(`Saved to your wishlist`);
    }
  };

  return (
    <div
      className="group relative flex flex-col bg-white rounded-xl overflow-hidden border border-cream-200/80 shadow-soft hover:shadow-luxury-hover transition-all duration-300"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container */}
      <Link to={`/product/${product.slug}`} className="relative aspect-[4/5] overflow-hidden bg-cream-100 block">
        {/* Badges */}
        <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
          {product.is_new_arrival && (
            <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest bg-onyx-950 text-cream-50 rounded">
              New
            </span>
          )}
          {discountPercent > 0 && (
            <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-gold-600 text-cream-50 rounded">
              {discountPercent}% OFF
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={handleWishlistToggle}
          className={`absolute top-3 right-3 z-10 w-8 h-8 rounded-full flex items-center justify-center transition-all ${
            wishlisted
              ? 'bg-rose-50 text-rose-600 shadow-md scale-105'
              : 'bg-white/80 backdrop-blur-sm text-stone-600 hover:text-rose-600 hover:bg-white shadow-sm'
          }`}
          title={wishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
        >
          <Heart className={`w-4 h-4 ${wishlisted ? 'fill-current' : ''}`} />
        </button>

        {/* Product Images with Crossfade */}
        <img
          src={primaryImage}
          alt={product.title}
          className={`w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105 ${
            isHovered && secondaryImage !== primaryImage ? 'opacity-0' : 'opacity-100'
          }`}
        />
        {secondaryImage !== primaryImage && (
          <img
            src={secondaryImage}
            alt={`${product.title} alternate view`}
            className={`absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-700 ease-out group-hover:scale-105 ${
              isHovered ? 'opacity-100' : 'opacity-0'
            }`}
          />
        )}

        {/* Quick View Button on Hover */}
        {onQuickView && (
          <div className="absolute inset-x-0 bottom-3 flex justify-center px-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onQuickView(product);
              }}
              className="w-full py-2 bg-white/95 backdrop-blur-md text-onyx-950 text-xs font-semibold rounded shadow-md hover:bg-gold-600 hover:text-white transition-colors flex items-center justify-center gap-1.5"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Quick Preview</span>
            </button>
          </div>
        )}
      </Link>

      {/* Details Container */}
      <div className="p-4 flex flex-col flex-1 justify-between">
        <div>
          {/* Category & Rating */}
          <div className="flex items-center justify-between text-[11px] text-stone-500 mb-1">
            <span className="uppercase tracking-wider text-gold-700 font-medium">
              {product.category?.name || 'Fine Jewellery'}
            </span>
            <div className="flex items-center gap-1 text-amber-600 font-semibold">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span>{product.rating.toFixed(1)}</span>
              <span className="text-stone-400 text-[10px]">({product.reviews_count})</span>
            </div>
          </div>

          {/* Product Title */}
          <Link to={`/product/${product.slug}`}>
            <h3 className="font-serif text-base font-medium text-onyx-950 group-hover:text-gold-700 transition-colors line-clamp-1 leading-snug">
              {product.title}
            </h3>
          </Link>

          {/* Features highlight */}
          <p className="text-[11px] text-stone-500 mt-1 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-gold-500 shrink-0" />
            <span className="truncate">{product.plating || '18K Gold Plated • Anti-Tarnish'}</span>
          </p>

          {/* Color swatches preview */}
          {product.variants && product.variants.length > 0 && (
            <div className="mt-2.5 flex items-center gap-1.5 flex-wrap">
              {product.variants.slice(0, 5).map((v, i) => (
                <ColorSwatch
                  key={v.id || i}
                  color={v.color || 'Gold'}
                  size="sm"
                />
              ))}
              {product.variants.length > 5 && (
                <span className="text-[10px] text-stone-400 font-medium">
                  +{product.variants.length - 5}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Price & Add to Bag */}
        <div className="mt-4 pt-3 border-t border-cream-100 flex items-center justify-between">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="font-semibold text-base text-onyx-950">
                {formatPrice(product.price)}
              </span>
              {product.compare_at_price && product.compare_at_price > product.price && (
                <span className="text-xs text-stone-400 line-through">
                  {formatPrice(product.compare_at_price)}
                </span>
              )}
            </div>
            <span className="text-[10px] text-emerald-700 font-medium block">Free Insured Shipping</span>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={isAdding || product.stock_quantity <= 0}
            className="p-2.5 bg-cream-100 text-onyx-950 rounded-lg hover:bg-gold-600 hover:text-white transition-colors focus:outline-none disabled:opacity-50"
            title={product.stock_quantity <= 0 ? "Out of Stock" : "Add to Bag"}
          >
            <ShoppingBag className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

