import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Star, Heart, ShoppingBag, Truck, ShieldCheck, RefreshCw, Sparkles,
  Share2, Check, MapPin, Copy, MessageCircle, ArrowRight
} from 'lucide-react';
import { productApi, reviewApi } from '../services/api';
import { Product, Review } from '../types';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useCurrency } from '../context/CurrencyContext';
import { useToast } from '../context/ToastContext';
import { ProductCard } from '../components/product/ProductCard';
import { RingSizeGuideModal } from '../components/product/RingSizeGuideModal';
import { ColorSwatch } from '../components/product/ColorSwatch';

export const ProductDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { addItem, setIsCartOpen } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { formatPrice } = useCurrency();
  const toast = useToast();

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<Product[]>([]);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const [selectedImage, setSelectedImage] = useState<string>('');
  const [selectedVariantId, setSelectedVariantId] = useState<string | undefined>(undefined);
  const [quantity, setQuantity] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<'desc' | 'specs' | 'care' | 'shipping' | 'reviews'>('desc');
  const [isAdding, setIsAdding] = useState(false);

  // Pincode checker state
  const [pincode, setPincode] = useState('');
  const [deliveryDate, setDeliveryDate] = useState<string | null>(null);

  // Review form state
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewName, setReviewName] = useState('');
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  // Zoom magnifier state
  const [zoomPos, setZoomPos] = useState({ x: 0, y: 0, show: false });

  useEffect(() => {
    const fetchProductData = async () => {
      if (!slug) return;
      try {
        setLoading(true);
        const prod = await productApi.getBySlug(slug);
        setProduct(prod);
        setSelectedImage(prod.images?.[0]?.image_url || 'https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=800&q=80');
        setSelectedVariantId(prod.variants?.[0]?.id);

        // Save to recently viewed
        try {
          const viewedRaw = localStorage.getItem('aura_recently_viewed');
          let viewed: Product[] = viewedRaw ? JSON.parse(viewedRaw) : [];
          viewed = [prod, ...viewed.filter((item) => item.id !== prod.id)].slice(0, 6);
          localStorage.setItem('aura_recently_viewed', JSON.stringify(viewed));
          setRecentlyViewed(viewed.filter((item) => item.id !== prod.id));
        } catch (e) {
          console.error(e);
        }

        // Fetch related products & reviews in parallel
        const [related, revs] = await Promise.all([
          productApi.getAll({
            category: prod.category?.slug,
            limit: 4,
          }),
          reviewApi.getByProduct(prod.id),
        ]);
        setRelatedProducts(related.filter((p) => p.id !== prod.id));
        setReviews(revs);
      } catch (err) {
        console.error('Failed to load product:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProductData();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [slug]);

  if (loading || !product) {
    return (
      <div className="min-h-screen bg-cream-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" />
          <p className="font-serif text-onyx-950 text-sm tracking-widest uppercase">
            Curating Atelier Vault...
          </p>
        </div>
      </div>
    );
  }

  const wishlisted = isInWishlist(product.id);
  const discountPercent = product.compare_at_price && product.compare_at_price > product.price
    ? Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100)
    : 0;

  const handleAddToCart = async () => {
    try {
      setIsAdding(true);
      await addItem(product, selectedVariantId, quantity);
      toast.success(`Added ${product.title} to your bag`);
    } catch {
      toast.error('Could not add to bag');
    } finally {
      setIsAdding(false);
    }
  };

  const handleBuyNow = async () => {
    try {
      setIsAdding(true);
      await addItem(product, selectedVariantId, quantity);
      setIsCartOpen(false);
      navigate('/checkout');
    } catch {
      toast.error('Could not proceed to checkout');
    } finally {
      setIsAdding(false);
    }
  };

  const handleCheckPincode = (e: React.FormEvent) => {
    e.preventDefault();
    if (pincode.length !== 6 || isNaN(Number(pincode))) {
      toast.error('Please enter a valid 6-digit postal pincode');
      return;
    }
    const today = new Date();
    const estDate = new Date(today.setDate(today.getDate() + 3));
    setDeliveryDate(estDate.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' }));
    toast.success('Express delivery is available for your location!');
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewComment.trim()) {
      toast.error('Please write a review comment');
      return;
    }
    try {
      setSubmittingReview(true);
      const newRev = await reviewApi.submit({
        product_id: product.id,
        rating: reviewRating,
        title: reviewTitle.trim() || undefined,
        comment: reviewComment.trim(),
        customer_name: reviewName.trim() || undefined,
      });
      setReviews([newRev, ...reviews]);
      setReviewComment('');
      setReviewTitle('');
      setReviewName('');
      toast.success('Thank you! Your verified review has been published.');
    } catch {
      toast.error('Could not submit review at this time.');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleShare = (platform: 'whatsapp' | 'copy') => {
    const url = window.location.href;
    if (platform === 'whatsapp') {
      window.open(`https://wa.me/?text=${encodeURIComponent(`Check out this handcrafted piece from Aura Atelier: ${product.title} ${url}`)}`, '_blank');
    } else {
      navigator.clipboard.writeText(url);
      toast.success('Product link copied to clipboard!');
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomPos({ x, y, show: true });
  };

  return (
    <div className="min-h-screen bg-cream-50 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb Navigation */}
        <nav className="text-xs text-stone-500 mb-8 flex items-center gap-2 overflow-x-auto whitespace-nowrap">
          <Link to="/" className="hover:text-gold-700">Home</Link>
          <span>/</span>
          <Link to="/shop" className="hover:text-gold-700">Jewellery</Link>
          <span>/</span>
          {product.category && (
            <>
              <Link to={`/category/${product.category.slug}`} className="hover:text-gold-700">
                {product.category.name}
              </Link>
              <span>/</span>
            </>
          )}
          <span className="text-onyx-950 font-medium truncate">{product.title}</span>
        </nav>

        {/* Product Grid: Left Image Gallery with Zoom / Right Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 bg-white p-6 sm:p-10 rounded-2xl border border-cream-200 shadow-soft">
          {/* Left Column: Image Gallery with Interactive Hover Zoom */}
          <div className="flex flex-col-reverse sm:flex-row gap-4">
            {/* Thumbnail list */}
            {product.images && product.images.length > 1 && (
              <div className="flex sm:flex-col gap-3 overflow-x-auto sm:overflow-y-auto sm:max-h-[520px] pb-2 sm:pb-0 shrink-0">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(img.image_url)}
                    className={`w-16 h-20 rounded-lg overflow-hidden border-2 shrink-0 transition-all ${
                      selectedImage === img.image_url
                        ? 'border-gold-600 scale-102 shadow-sm'
                        : 'border-transparent opacity-70 hover:opacity-100 hover:border-cream-300'
                    }`}
                  >
                    <img src={img.image_url} alt="" className="w-full h-full object-cover object-center" />
                  </button>
                ))}
              </div>
            )}

            {/* Main Image with Zoom Magnifier */}
            <div
              className="relative flex-1 aspect-[4/5] rounded-xl overflow-hidden bg-cream-100 border border-cream-300 cursor-crosshair select-none"
              onMouseMove={handleMouseMove}
              onMouseLeave={() => setZoomPos((prev) => ({ ...prev, show: false }))}
            >
              {/* Badges */}
              <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
                {product.is_new_arrival && (
                  <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest bg-onyx-950 text-cream-50 rounded">
                    New In
                  </span>
                )}
                {discountPercent > 0 && (
                  <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-gold-600 text-cream-50 rounded">
                    {discountPercent}% OFF
                  </span>
                )}
              </div>

              <img
                src={selectedImage}
                alt={product.title}
                className="w-full h-full object-cover object-center"
              />

              {/* Lens Zoom Overlay */}
              {zoomPos.show && (
                <div
                  className="absolute inset-0 pointer-events-none hidden md:block"
                  style={{
                    backgroundImage: `url(${selectedImage})`,
                    backgroundPosition: `${zoomPos.x}% ${zoomPos.y}%`,
                    backgroundSize: '220%',
                    backgroundRepeat: 'no-repeat',
                  }}
                />
              )}
            </div>
          </div>

          {/* Right Column: Title, Ratings, Price, Options, Purchase Actions */}
          <div className="flex flex-col justify-between space-y-6">
            <div>
              {/* Category, SKU, and Rating */}
              <div className="flex items-center justify-between text-xs text-stone-500 pb-2">
                <span className="uppercase tracking-widest text-gold-700 font-bold">
                  {product.category?.name || 'Artisanal Demi-Fine'}
                </span>
                <span className="text-[11px] text-stone-400">SKU: {product.sku}</span>
              </div>

              <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-onyx-950 leading-tight">
                {product.title}
              </h1>

              {/* Star Rating & Reviews Count */}
              <div className="flex items-center gap-3 mt-2 text-xs text-stone-600">
                <div className="flex items-center gap-1 text-amber-500">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.floor(product.rating) ? 'fill-amber-400 text-amber-400' : 'text-stone-300'
                      }`}
                    />
                  ))}
                  <span className="font-bold text-onyx-950 ml-1">{product.rating.toFixed(1)}</span>
                </div>
                <span>•</span>
                <button
                  onClick={() => setActiveTab('reviews')}
                  className="underline hover:text-gold-700"
                >
                  {product.reviews_count} Verified Customer Reviews
                </button>
              </div>

              {/* Price Block */}
              <div className="mt-5 p-4 rounded-xl bg-cream-50 border border-cream-200 flex items-baseline gap-3">
                <span className="font-serif text-3xl font-bold text-onyx-950">
                  {formatPrice(product.price)}
                </span>
                {product.compare_at_price && product.compare_at_price > product.price && (
                  <span className="text-base text-stone-400 line-through">
                    {formatPrice(product.compare_at_price)}
                  </span>
                )}
                <span className="text-xs text-emerald-700 font-semibold ml-auto">
                  Inclusive of all taxes & free insured delivery
                </span>
              </div>

              {/* Stock availability indicator */}
              <div className="mt-3 flex items-center gap-2 text-xs">
                {product.stock_quantity > 0 ? (
                  <div className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span>Ready to Ship in 24 Hours ({product.stock_quantity} left in stock)</span>
                  </div>
                ) : (
                  <span className="text-red-600 font-semibold">Currently Sold Out (Pre-Order Available)</span>
                )}
              </div>

              {/* Interactive Color & Variant Selector */}
              {product.variants && product.variants.length > 0 && (
                <div className="mt-6 space-y-4 p-4 rounded-2xl bg-cream-50/80 border border-cream-200">
                  {/* Colour Swatches Row */}
                  <div>
                    <div className="flex items-center justify-between mb-2.5">
                      <label className="text-xs font-semibold text-stone-800 uppercase tracking-wider flex items-center gap-1.5">
                        <span>Select Finish / Colour:</span>
                        <span className="text-gold-700 font-bold capitalize">
                          {product.variants.find((v) => v.id === selectedVariantId)?.color || 'Standard Gold'}
                        </span>
                      </label>
                      <button
                        type="button"
                        onClick={() => setIsSizeGuideOpen(true)}
                        className="text-xs text-gold-700 hover:text-gold-800 underline font-medium"
                      >
                        Measurement Guide
                      </button>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      {product.variants.map((v, idx) => {
                        const isSelected = selectedVariantId === v.id;
                        return (
                          <div
                            key={v.id || idx}
                            onClick={() => {
                              setSelectedVariantId(v.id);
                              // Switch display image if variant index correlates with image index
                              if (product.images && product.images[idx % product.images.length]) {
                                setSelectedImage(product.images[idx % product.images.length].image_url);
                              }
                            }}
                            className={`flex items-center gap-2 px-3 py-2 rounded-xl border cursor-pointer transition-all ${
                              isSelected
                                ? 'bg-white border-gold-600 shadow-md ring-1 ring-gold-500'
                                : 'bg-white/60 border-cream-200 hover:bg-white hover:border-gold-300'
                            }`}
                          >
                            <ColorSwatch
                              color={v.color || 'Gold'}
                              isSelected={isSelected}
                              size="sm"
                              stock={v.stock_quantity}
                            />
                            <div className="text-left">
                              <span className="text-xs font-medium text-onyx-950 block leading-tight">
                                {v.color || v.title}
                              </span>
                              {v.size && v.size !== 'Standard' && (
                                <span className="text-[10px] text-stone-400 block">
                                  Size: {v.size}
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Quantity selector & Add to Bag */}
              <div className="mt-6 flex flex-col sm:flex-row gap-4">
                <div className="flex items-center border border-cream-300 rounded-lg bg-cream-50 w-fit">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-4 py-3 text-stone-700 hover:text-black font-bold text-sm"
                  >
                    -
                  </button>
                  <span className="px-4 text-sm font-bold text-onyx-950">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-4 py-3 text-stone-700 hover:text-black font-bold text-sm"
                  >
                    +
                  </button>
                </div>

                <button
                  onClick={handleAddToCart}
                  disabled={isAdding || product.stock_quantity <= 0}
                  className="flex-1 py-3.5 px-6 bg-onyx-950 text-cream-50 rounded-lg text-xs font-semibold uppercase tracking-widest hover:bg-gold-600 transition-colors shadow-luxury flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>{isAdding ? 'Adding to Bag...' : 'Add to Shopping Bag'}</span>
                </button>

                <button
                  onClick={() => toggleWishlist(product)}
                  className={`p-3.5 rounded-lg border transition-colors flex items-center justify-center ${
                    wishlisted
                      ? 'bg-rose-50 border-rose-300 text-rose-600'
                      : 'border-cream-300 text-stone-600 hover:text-rose-600 hover:border-rose-300'
                  }`}
                  title={wishlisted ? 'Remove from Wishlist' : 'Save to Wishlist'}
                >
                  <Heart className={`w-5 h-5 ${wishlisted ? 'fill-current' : ''}`} />
                </button>
              </div>

              {/* Instant Buy Now button */}
              <button
                onClick={handleBuyNow}
                disabled={isAdding || product.stock_quantity <= 0}
                className="w-full mt-3 py-3.5 bg-gold-500 text-onyx-950 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-gold-400 transition-colors shadow-sm disabled:opacity-50"
              >
                Buy Now with 1-Click Checkout
              </button>

              {/* Pincode Estimator */}
              <div className="mt-6 p-4 rounded-xl border border-cream-200 bg-cream-50/70 text-xs space-y-2">
                <span className="font-semibold text-stone-800 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-gold-600" />
                  Check Delivery Date to Your Address:
                </span>
                <form onSubmit={handleCheckPincode} className="flex gap-2">
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="Enter 6-digit Pincode"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                    className="flex-1 px-3 py-2 bg-white border border-cream-300 rounded text-xs focus:outline-none focus:border-gold-500"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-stone-900 text-cream-50 rounded text-xs font-semibold hover:bg-gold-600 transition-colors"
                  >
                    Check
                  </button>
                </form>
                {deliveryDate && (
                  <p className="text-emerald-700 font-semibold pt-1">
                    ✓ Estimated delivery by <strong>{deliveryDate}</strong> with Complimentary Insured Express Shipping.
                  </p>
                )}
              </div>

              {/* Quality & Trust Badges */}
              <div className="mt-6 pt-6 border-t border-cream-200 grid grid-cols-2 gap-4 text-xs text-stone-600">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-gold-600 shrink-0" />
                  <span>1-Year Anti-Tarnish Guarantee</span>
                </div>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-gold-600 shrink-0" />
                  <span>18K Real Gold PVD Coating</span>
                </div>
                <div className="flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 text-gold-600 shrink-0" />
                  <span>7-Day Easy Return / Exchange</span>
                </div>
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-gold-600 shrink-0" />
                  <span>Tamper-Proof Luxury Box</span>
                </div>
              </div>

              {/* Social Share */}
              <div className="mt-6 pt-4 border-t border-cream-100 flex items-center gap-3 text-xs text-stone-500">
                <span className="font-semibold text-stone-700 flex items-center gap-1">
                  <Share2 className="w-3.5 h-3.5" /> Share Piece:
                </span>
                <button
                  onClick={() => handleShare('whatsapp')}
                  className="px-2.5 py-1 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 flex items-center gap-1"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </button>
                <button
                  onClick={() => handleShare('copy')}
                  className="px-2.5 py-1 rounded bg-cream-100 text-stone-700 border border-cream-300 hover:bg-cream-200 flex items-center gap-1"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Link</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Product Information Tabs */}
        <div className="mt-12 bg-white rounded-2xl p-6 sm:p-10 border border-cream-200 shadow-soft">
          <div className="flex border-b border-cream-200 overflow-x-auto gap-8 text-xs font-semibold uppercase tracking-wider">
            <button
              onClick={() => setActiveTab('desc')}
              className={`pb-4 border-b-2 transition-all whitespace-nowrap ${
                activeTab === 'desc' ? 'border-gold-600 text-gold-700 font-bold' : 'border-transparent text-stone-500 hover:text-onyx-950'
              }`}
            >
              Description & Craft
            </button>
            <button
              onClick={() => setActiveTab('specs')}
              className={`pb-4 border-b-2 transition-all whitespace-nowrap ${
                activeTab === 'specs' ? 'border-gold-600 text-gold-700 font-bold' : 'border-transparent text-stone-500 hover:text-onyx-950'
              }`}
            >
              Specifications
            </button>
            <button
              onClick={() => setActiveTab('care')}
              className={`pb-4 border-b-2 transition-all whitespace-nowrap ${
                activeTab === 'care' ? 'border-gold-600 text-gold-700 font-bold' : 'border-transparent text-stone-500 hover:text-onyx-950'
              }`}
            >
              Anti-Tarnish & Care
            </button>
            <button
              onClick={() => setActiveTab('shipping')}
              className={`pb-4 border-b-2 transition-all whitespace-nowrap ${
                activeTab === 'shipping' ? 'border-gold-600 text-gold-700 font-bold' : 'border-transparent text-stone-500 hover:text-onyx-950'
              }`}
            >
              Shipping & 1-Year Guarantee
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`pb-4 border-b-2 transition-all whitespace-nowrap ${
                activeTab === 'reviews' ? 'border-gold-600 text-gold-700 font-bold' : 'border-transparent text-stone-500 hover:text-onyx-950'
              }`}
            >
              Client Reviews ({reviews.length})
            </button>
          </div>

          <div className="py-8">
            {activeTab === 'desc' && (
              <div className="max-w-3xl space-y-4 text-xs sm:text-sm text-stone-700 leading-relaxed">
                <p>{product.description}</p>
                <div className="p-4 bg-cream-50 rounded-xl border border-cream-200 mt-4">
                  <h4 className="font-serif text-base font-semibold text-onyx-950 mb-1">The Atelier Promise</h4>
                  <p className="text-stone-600 text-xs">
                    Each creation undergoes our rigorous 5-step finishing standard: hand-polishing, ultrasonic cleansing, 18K vacuum gold deposition, and an authentic sealant layer ensuring you can wear this piece in water, sweat, and perfumes with total peace of mind.
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'specs' && (
              <div className="max-w-2xl">
                <table className="w-full text-xs divide-y divide-cream-200">
                  <tbody className="divide-y divide-cream-100">
                    <tr><td className="py-2.5 text-stone-500">Base Material</td><td className="py-2.5 font-medium text-onyx-950">{product.material}</td></tr>
                    <tr><td className="py-2.5 text-stone-500">Plating Finish</td><td className="py-2.5 font-medium text-onyx-950">{product.plating}</td></tr>
                    <tr><td className="py-2.5 text-stone-500">Color Tone</td><td className="py-2.5 font-medium text-onyx-950">{product.color}</td></tr>
                    {product.dimensions && <tr><td className="py-2.5 text-stone-500">Dimensions</td><td className="py-2.5 font-medium text-onyx-950">{product.dimensions}</td></tr>}
                    {product.weight && <tr><td className="py-2.5 text-stone-500">Net Weight</td><td className="py-2.5 font-medium text-onyx-950">{product.weight}</td></tr>}
                    <tr><td className="py-2.5 text-stone-500">Hypoallergenic</td><td className="py-2.5 font-medium text-emerald-700">100% Nickel-Free & Lead-Free</td></tr>
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'care' && (
              <div className="max-w-2xl space-y-4 text-xs sm:text-sm text-stone-700 leading-relaxed">
                <p>
                  Our anti-tarnish demi-fine jewelry is formulated for real life. However, to maintain its pristine mirror gleam for decades:
                </p>
                <ul className="list-disc pl-5 space-y-1.5 text-xs text-stone-600">
                  <li>Store separately in the bespoke velvet pouch provided to prevent accidental scratches.</li>
                  <li>Wipe with a clean, dry microfiber cloth after wearing.</li>
                  <li>Safe for showers and gentle hand washing. Avoid chlorine in public swimming pools.</li>
                </ul>
              </div>
            )}

            {activeTab === 'shipping' && (
              <div className="max-w-2xl space-y-3 text-xs sm:text-sm text-stone-700 leading-relaxed">
                <p><strong>Insured Express Delivery:</strong> Dispatches within 24 hours via Blue Dart or Delhivery Air Express. Tracking numbers are sent via SMS and email.</p>
                <p><strong>7-Day Returns & Exchanges:</strong> If you are not entirely mesmerized by your piece, return it within 7 days in original condition for a swift replacement or full refund.</p>
                <p><strong>1-Year Color Warranty:</strong> If your piece loses its gold lustre within 365 days of receipt, our atelier will re-dip or replace it with no questions asked.</p>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="space-y-8">
                {/* Submit Review Form */}
                <div className="bg-cream-50 p-6 rounded-xl border border-cream-200 max-w-xl">
                  <h4 className="font-serif text-lg font-medium text-onyx-950 mb-3">Write a Patron Review</h4>
                  <form onSubmit={handleReviewSubmit} className="space-y-3 text-xs">
                    <div>
                      <label className="block text-stone-600 font-semibold mb-1">Rating</label>
                      <div className="flex gap-1 text-amber-400">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setReviewRating(star)}
                            className="focus:outline-none"
                          >
                            <Star className={`w-5 h-5 ${star <= reviewRating ? 'fill-current' : 'text-stone-300'}`} />
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-stone-600 font-semibold mb-1">Your Name</label>
                        <input
                          type="text"
                          placeholder="e.g. Radhika M."
                          value={reviewName}
                          onChange={(e) => setReviewName(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-cream-300 rounded focus:outline-none focus:border-gold-500"
                        />
                      </div>
                      <div>
                        <label className="block text-stone-600 font-semibold mb-1">Headline</label>
                        <input
                          type="text"
                          placeholder="e.g. Absolute Luxury!"
                          value={reviewTitle}
                          onChange={(e) => setReviewTitle(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-cream-300 rounded focus:outline-none focus:border-gold-500"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-stone-600 font-semibold mb-1">Your Review</label>
                      <textarea
                        rows={3}
                        placeholder="Share your thoughts on the craftsmanship, finish, and feel..."
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-cream-300 rounded focus:outline-none focus:border-gold-500"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={submittingReview}
                      className="px-6 py-2.5 bg-onyx-950 text-cream-50 font-semibold uppercase tracking-widest text-xs rounded hover:bg-gold-600 transition-colors"
                    >
                      {submittingReview ? 'Submitting...' : 'Submit Review'}
                    </button>
                  </form>
                </div>

                {/* Review List */}
                <div className="divide-y divide-cream-200">
                  {reviews.map((rev) => (
                    <div key={rev.id} className="py-4">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-1 text-amber-400">
                          {[...Array(rev.rating)].map((_, i) => (
                            <Star key={i} className="w-3.5 h-3.5 fill-current" />
                          ))}
                        </div>
                        <span className="text-[11px] text-stone-400">
                          {rev.created_at ? new Date(rev.created_at).toLocaleDateString() : 'Verified Buyer'}
                        </span>
                      </div>
                      {rev.title && <h5 className="font-serif font-semibold text-sm text-onyx-950">{rev.title}</h5>}
                      <p className="text-xs text-stone-600 mt-1 leading-relaxed">{rev.comment}</p>
                      <span className="text-[11px] text-stone-400 mt-1 block">By {rev.customer_name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Related Products ("You May Also Adore") */}
        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <div className="text-center mb-10">
              <span className="text-xs uppercase tracking-[0.25em] text-gold-700 font-bold block mb-1">
                Curated Harmonies
              </span>
              <h2 className="font-serif text-3xl font-medium text-onyx-950">
                You May Also Adore
              </h2>
              <div className="w-16 h-0.5 bg-gold-500 mx-auto mt-2" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
        {/* Recently Viewed Products */}
        {recentlyViewed.length > 0 && (
          <div className="mt-16">
            <div className="text-center mb-10">
              <span className="text-xs uppercase tracking-[0.25em] text-gold-700 font-bold block mb-1">
                Your Browsing History
              </span>
              <h2 className="font-serif text-3xl font-medium text-onyx-950">
                Recently Viewed
              </h2>
              <div className="w-16 h-0.5 bg-gold-500 mx-auto mt-2" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {recentlyViewed.slice(0, 4).map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}

        {/* Ring & Jewellery Measurement Guide Modal */}
        <RingSizeGuideModal
          isOpen={isSizeGuideOpen}
          onClose={() => setIsSizeGuideOpen(false)}
        />
      </div>
    </div>
  );
};

