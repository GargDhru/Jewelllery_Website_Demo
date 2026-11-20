import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, ShieldCheck, Heart, ShoppingBag, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Product } from '../../types';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useCurrency } from '../../context/CurrencyContext';
import { useToast } from '../../context/ToastContext';
import { ColorSwatch } from './ColorSwatch';

interface QuickViewModalProps {
  product: Product | null;
  onClose: () => void;
}

export const QuickViewModal: React.FC<QuickViewModalProps> = ({ product, onClose }) => {
  if (!product) return null;

  const { addItem } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { formatPrice } = useCurrency();
  const toast = useToast();

  const [selectedImage, setSelectedImage] = useState(
    product.images?.[0]?.image_url || 'https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=800&q=80'
  );
  const [selectedVariantId, setSelectedVariantId] = useState(
    product.variants?.[0]?.id || undefined
  );
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);

  const wishlisted = isInWishlist(product.id);

  const handleAddToCart = async () => {
    try {
      setIsAdding(true);
      await addItem(product, selectedVariantId, quantity);
      toast.success(`Added ${product.title} to your bag`);
      onClose();
    } catch {
      toast.error('Could not add to bag');
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden z-10 grid grid-cols-1 md:grid-cols-2"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-white/80 backdrop-blur-md flex items-center justify-center text-stone-500 hover:text-onyx-950 shadow-sm"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Left Column: Images */}
          <div className="p-6 bg-cream-50 flex flex-col justify-between">
            <div className="aspect-[4/5] rounded-xl overflow-hidden bg-cream-200 border border-cream-300">
              <img
                src={selectedImage}
                alt={product.title}
                className="w-full h-full object-cover object-center"
              />
            </div>
            {/* Gallery thumbnails */}
            {product.images && product.images.length > 1 && (
              <div className="flex gap-2 mt-4 overflow-x-auto pb-1">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(img.image_url)}
                    className={`w-14 h-14 rounded-lg overflow-hidden border-2 shrink-0 transition-all ${
                      selectedImage === img.image_url
                        ? 'border-gold-600 scale-105'
                        : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img.image_url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Details */}
          <div className="p-6 md:p-8 flex flex-col justify-between overflow-y-auto max-h-[85vh]">
            <div className="space-y-4">
              <div>
                <span className="text-xs uppercase tracking-widest text-gold-700 font-semibold">
                  {product.category?.name || 'Artisan Collection'}
                </span>
                <h2 className="font-serif text-2xl font-semibold text-onyx-950 mt-1">
                  {product.title}
                </h2>
                <div className="flex items-center gap-2 mt-1.5 text-xs text-stone-500">
                  <div className="flex items-center gap-1 text-amber-500">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <span className="font-semibold text-onyx-950">{product.rating.toFixed(1)}</span>
                  </div>
                  <span>•</span>
                  <span>{product.reviews_count} verified reviews</span>
                  <span>•</span>
                  <span className="text-emerald-700 font-medium">In Stock</span>
                </div>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-3">
                <span className="text-2xl font-serif font-bold text-onyx-950">
                  {formatPrice(product.price)}
                </span>
                {product.compare_at_price && product.compare_at_price > product.price && (
                  <span className="text-sm text-stone-400 line-through">
                    {formatPrice(product.compare_at_price)}
                  </span>
                )}
              </div>

              <p className="text-xs text-stone-600 leading-relaxed">
                {product.short_description || product.description}
              </p>

              {/* Material Specs */}
              <div className="bg-cream-100/70 p-3.5 rounded-xl border border-cream-200 text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-stone-500">Plating:</span>
                  <span className="font-medium text-onyx-950">{product.plating}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Material:</span>
                  <span className="font-medium text-onyx-950">{product.material}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Durability:</span>
                  <span className="font-medium text-emerald-700">100% Anti-Tarnish & Waterproof</span>
                </div>
              </div>

              {/* Variants & Colour Swatches */}
              {product.variants && product.variants.length > 0 && (
                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-2">
                    Finish / Colour:
                    <span className="text-gold-700 font-bold ml-1.5 capitalize">
                      {product.variants.find((v) => v.id === selectedVariantId)?.color || 'Gold'}
                    </span>
                  </label>
                  <div className="flex flex-wrap gap-2.5">
                    {product.variants.map((v, idx) => {
                      const isSelected = selectedVariantId === v.id;
                      return (
                        <button
                          key={v.id || idx}
                          type="button"
                          onClick={() => {
                            setSelectedVariantId(v.id);
                            if (product.images && product.images[idx % product.images.length]) {
                              setSelectedImage(product.images[idx % product.images.length].image_url);
                            }
                          }}
                          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all ${
                            isSelected
                              ? 'bg-white border-gold-600 shadow-sm ring-1 ring-gold-500'
                              : 'bg-white/60 border-cream-300 hover:border-gold-400'
                          }`}
                        >
                          <ColorSwatch color={v.color || 'Gold'} isSelected={isSelected} size="sm" />
                          <span className="text-xs text-onyx-950 font-medium">{v.color || v.title}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Quantity */}
              <div className="flex items-center gap-4 pt-2">
                <div className="flex items-center border border-cream-300 rounded-lg bg-cream-50">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-2 text-stone-600 hover:text-black font-semibold"
                  >
                    -
                  </button>
                  <span className="px-3 text-xs font-bold">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-3 py-2 text-stone-600 hover:text-black font-semibold"
                  >
                    +
                  </button>
                </div>

                <button
                  onClick={() => toggleWishlist(product)}
                  className={`p-2.5 rounded-lg border transition-colors ${
                    wishlisted
                      ? 'bg-rose-50 border-rose-300 text-rose-600'
                      : 'border-cream-300 text-stone-600 hover:text-rose-600 hover:border-rose-300'
                  }`}
                  title="Save to Wishlist"
                >
                  <Heart className={`w-5 h-5 ${wishlisted ? 'fill-current' : ''}`} />
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-6 space-y-3">
              <button
                onClick={handleAddToCart}
                disabled={isAdding}
                className="w-full py-3.5 bg-onyx-950 text-cream-50 rounded-lg text-xs font-semibold uppercase tracking-widest hover:bg-gold-600 transition-colors shadow-luxury flex items-center justify-center gap-2"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>{isAdding ? 'Adding...' : 'Add to Shopping Bag'}</span>
              </button>

              <div className="text-center">
                <Link
                  to={`/product/${product.slug}`}
                  onClick={onClose}
                  className="text-xs text-gold-700 font-semibold hover:underline inline-flex items-center gap-1"
                >
                  <span>View Full Product Specifications</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

