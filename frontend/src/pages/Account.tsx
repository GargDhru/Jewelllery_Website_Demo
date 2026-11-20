import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import {
  User as UserIcon, Package, Heart, MapPin, LogOut, Lock,
  Truck, Trash2, Plus, Sparkles, ShieldCheck, Eye, EyeOff,
  AlertCircle, CheckCircle, RefreshCw, RotateCcw
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { useCurrency } from '../context/CurrencyContext';
import { useToast } from '../context/ToastContext';
import { orderApi, api } from '../services/api';
import { Order, Address, Product } from '../types';

export const Account: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'orders';
  const [activeTab, setActiveTab] = useState(initialTab);

  const { user, logout, updateProfile } = useAuth();
  const { wishlist, toggleWishlist } = useWishlist();
  const { addItem } = useCart();
  const { formatPrice } = useCurrency();
  const toast = useToast();
  const navigate = useNavigate();

  const [orders, setOrders] = useState<Order[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [returns, setReturns] = useState<any[]>([]);
  const [loadingReturns, setLoadingReturns] = useState(false);

  // Profile edit state
  const [profileForm, setProfileForm] = useState({
    full_name: user?.full_name || '',
    phone: user?.phone || '',
  });

  // Change Password state
  const [pwForm, setPwForm] = useState({ current_password: '', new_password: '', confirm_password: '' });
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [changingPw, setChangingPw] = useState(false);
  const [pwError, setPwError] = useState('');

  // Return request state
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [returnOrderId, setReturnOrderId] = useState('');
  const [returnReason, setReturnReason] = useState('');
  const [submittingReturn, setSubmittingReturn] = useState(false);

  // Address modal state
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [addressForm, setAddressForm] = useState({
    full_name: '',
    phone: '',
    street_address: '',
    apartment: '',
    city: '',
    state: 'Maharashtra',
    postal_code: '',
    address_type: 'Home' as 'Home' | 'Work' | 'Other',
    is_default: true,
  });

  useEffect(() => {
    if (!user) {
      navigate('/login?redirect=/account');
      return;
    }
    setProfileForm({ full_name: user.full_name || '', phone: user.phone || '' });
    fetchData();
  }, [user, navigate]);

  const fetchData = async () => {
    try {
      setLoadingOrders(true);
      const [ordersData, addressesData] = await Promise.all([
        orderApi.getMyOrders(),
        api.get<Address[]>('/auth/addresses').then((r) => r.data).catch(() => []),
      ]);
      setOrders(ordersData);
      setAddresses(addressesData);
    } catch (err) {
      console.error('Failed to load account data:', err);
    } finally {
      setLoadingOrders(false);
    }
  };

  const fetchReturns = async () => {
    try {
      setLoadingReturns(true);
      const res = await api.get('/orders/my-returns').catch(() => ({ data: [] }));
      setReturns(res.data || []);
    } catch {
      setReturns([]);
    } finally {
      setLoadingReturns(false);
    }
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setSearchParams({ tab });
    if (tab === 'returns') fetchReturns();
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfile(profileForm);
      toast.success('Profile updated successfully');
    } catch {
      toast.error('Failed to update profile');
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwError('');
    if (pwForm.new_password !== pwForm.confirm_password) {
      setPwError('New passwords do not match.');
      return;
    }
    if (pwForm.new_password.length < 8) {
      setPwError('New password must be at least 8 characters.');
      return;
    }
    if (!/[A-Z]/.test(pwForm.new_password) || !/[a-z]/.test(pwForm.new_password) || !/[0-9]/.test(pwForm.new_password)) {
      setPwError('Password must include uppercase, lowercase, and a number.');
      return;
    }
    try {
      setChangingPw(true);
      await api.post('/auth/change-password', {
        current_password: pwForm.current_password,
        new_password: pwForm.new_password,
      });
      toast.success('Password changed successfully. Please sign in again.');
      setPwForm({ current_password: '', new_password: '', confirm_password: '' });
    } catch (err: any) {
      setPwError(err.response?.data?.detail || 'Failed to change password.');
    } finally {
      setChangingPw(false);
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    if (!window.confirm('Cancel this order? Stock will be restored.')) return;
    try {
      await orderApi.cancelOrder(orderId, 'Cancelled by customer');
      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, order_status: 'cancelled' } : o)));
      toast.success('Order cancelled successfully.');
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Could not cancel order.');
    }
  };

  const handleSubmitReturn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!returnReason.trim()) return;
    try {
      setSubmittingReturn(true);
      await api.post(`/orders/${returnOrderId}/return`, { reason: returnReason });
      toast.success('Return request submitted. Our team will review it within 24 hours.');
      setShowReturnModal(false);
      setReturnReason('');
      await fetchReturns();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to submit return request.');
    } finally {
      setSubmittingReturn(false);
    }
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post<Address>('/auth/addresses', addressForm);
      setAddresses([...addresses, res.data]);
      setShowAddressModal(false);
      toast.success('Address saved');
    } catch {
      toast.error('Failed to save address');
    }
  };

  const handleDeleteAddress = async (addressId?: string) => {
    if (!addressId) return;
    try {
      await api.delete(`/auth/addresses/${addressId}`);
      setAddresses(addresses.filter((a) => a.id !== addressId));
      toast.success('Address removed');
    } catch {
      toast.error('Failed to delete address');
    }
  };

  const getStatusBadge = (status: string) => {
    const map: Record<string, string> = {
      delivered: 'bg-emerald-100 text-emerald-800',
      shipped: 'bg-blue-100 text-blue-800',
      confirmed: 'bg-amber-100 text-amber-800',
      cancelled: 'bg-red-100 text-red-800',
      processing: 'bg-purple-100 text-purple-800',
    };
    return (
      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${map[status] || 'bg-stone-100 text-stone-800'}`}>
        {status}
      </span>
    );
  };

  const NAV_TABS = [
    { id: 'orders', label: 'Orders & Tracking', icon: <Package className="w-4 h-4" />, count: orders.length },
    { id: 'wishlist', label: 'Saved Wishlist', icon: <Heart className="w-4 h-4" />, count: wishlist.length },
    { id: 'addresses', label: 'Delivery Addresses', icon: <MapPin className="w-4 h-4" /> },
    { id: 'returns', label: 'Returns & Cancellations', icon: <RotateCcw className="w-4 h-4" /> },
    { id: 'profile', label: 'Profile & Contact', icon: <UserIcon className="w-4 h-4" /> },
    { id: 'password', label: 'Change Password', icon: <Lock className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-cream-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs uppercase tracking-[0.25em] text-gold-700 font-bold block mb-1">Patron Sanctuary</span>
            <h1 className="font-serif text-3xl sm:text-4xl font-medium text-onyx-950">
              Welcome back, {user?.full_name || 'Valued Patron'}
            </h1>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-1.5 px-4 py-2 border border-cream-300 rounded-lg text-xs font-semibold text-stone-600 hover:text-red-600 hover:border-red-300 bg-white transition-colors w-fit"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <aside className="bg-white rounded-2xl p-5 border border-cream-200 shadow-soft h-fit space-y-1">
            {NAV_TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === tab.id ? 'bg-onyx-950 text-cream-50' : 'text-stone-700 hover:bg-cream-100'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  {tab.icon}
                  <span>{tab.label}</span>
                </div>
                {tab.count !== undefined && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/20">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </aside>

          {/* Main Content */}
          <div className="lg:col-span-3">

            {/* ── Orders Tab ─────────────────────────────────────────────── */}
            {activeTab === 'orders' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="font-serif text-2xl font-semibold text-onyx-950">Order History</h2>
                  <span className="text-xs text-stone-500 font-medium">Tracking & status</span>
                </div>

                {loadingOrders ? (
                  <div className="p-12 text-center text-xs text-stone-400">Loading order history...</div>
                ) : orders.length === 0 ? (
                  <div className="bg-white rounded-2xl p-12 text-center border border-cream-200 shadow-soft">
                    <Package className="w-10 h-10 text-gold-600 mx-auto mb-3" />
                    <h3 className="font-serif text-xl font-medium text-onyx-950 mb-1">No Orders Placed Yet</h3>
                    <p className="text-xs text-stone-500 mb-6">Explore our curated jewellery to place your first heirloom order.</p>
                    <Link to="/shop" className="px-6 py-2.5 bg-onyx-950 text-cream-50 text-xs font-semibold uppercase tracking-widest rounded-lg hover:bg-gold-600 transition-colors">
                      Browse Catalogue
                    </Link>
                  </div>
                ) : (
                  orders.map((order) => (
                    <div key={order.id} className="bg-white rounded-2xl p-6 border border-cream-200 shadow-soft space-y-4">
                      <div className="flex flex-wrap items-center justify-between pb-3 border-b border-cream-100 gap-2">
                        <div>
                          <span className="font-mono text-xs font-bold text-onyx-950">{order.order_number}</span>
                          <span className="text-stone-400 text-xs ml-3">{new Date(order.created_at).toLocaleDateString('en-IN')}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          {getStatusBadge(order.order_status)}
                          <span className="font-serif text-sm font-bold text-gold-700">{formatPrice(order.total_amount)}</span>
                        </div>
                      </div>

                      <div className="divide-y divide-cream-100">
                        {order.items.map((item) => (
                          <div key={item.id} className="py-2.5 flex items-center justify-between text-xs">
                            <div className="flex items-center gap-3">
                              <img
                                src={item.image_url || 'https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=80&q=80'}
                                alt=""
                                className="w-10 h-12 rounded object-cover bg-cream-100 border border-cream-200"
                              />
                              <div>
                                <p className="font-medium text-onyx-950">{item.product_title}</p>
                                <span className="text-stone-400 text-[11px]">Qty: {item.quantity}</span>
                              </div>
                            </div>
                            <span className="font-medium text-onyx-950">{formatPrice(item.total_price)}</span>
                          </div>
                        ))}
                      </div>

                      <div className="pt-3 border-t border-cream-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                        <div className="text-stone-500">
                          {order.tracking_number ? (
                            <span>Tracking: <strong className="font-mono text-onyx-950">{order.tracking_number}</strong> ({order.courier_name || 'Express'})</span>
                          ) : (
                            <span>Payment: <strong className="capitalize">{order.payment_method}</strong> ({order.payment_status})</span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 flex-wrap">
                          <Link to={`/order-confirmation/${order.id}`} className="px-3.5 py-1.5 border border-cream-300 rounded-lg font-medium text-stone-700 hover:bg-cream-50">
                            View Receipt
                          </Link>

                          {['pending', 'confirmed'].includes(order.order_status) && (
                            <button onClick={() => handleCancelOrder(order.id)} className="px-3.5 py-1.5 text-red-600 hover:bg-red-50 rounded-lg font-medium border border-red-200">
                              Cancel
                            </button>
                          )}

                          {order.order_status === 'delivered' && (
                            <button
                              onClick={() => { setReturnOrderId(order.id); setShowReturnModal(true); }}
                              className="px-3.5 py-1.5 text-amber-700 hover:bg-amber-50 rounded-lg font-medium border border-amber-200"
                            >
                              Request Return
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* ── Wishlist Tab ──────────────────────────────────────────── */}
            {activeTab === 'wishlist' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="font-serif text-2xl font-semibold text-onyx-950">Saved Wishlist Pieces</h2>
                  <span className="text-xs text-stone-500">{wishlist.length} items saved</span>
                </div>

                {wishlist.length === 0 ? (
                  <div className="bg-white rounded-2xl p-12 text-center border border-cream-200 shadow-soft">
                    <Heart className="w-10 h-10 text-rose-400 mx-auto mb-3" />
                    <h3 className="font-serif text-xl font-medium text-onyx-950 mb-1">Your Wishlist is Empty</h3>
                    <p className="text-xs text-stone-500 mb-6">Click the heart icon on any piece to save it for later.</p>
                    <Link to="/shop" className="px-6 py-2.5 bg-onyx-950 text-cream-50 text-xs font-semibold uppercase tracking-widest rounded-lg hover:bg-gold-600 transition-colors">
                      Discover Collections
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {wishlist.map((prod: Product) => (
                      <div key={prod.id} className="bg-white rounded-xl border border-cream-200 p-4 shadow-soft flex flex-col justify-between">
                        <div className="relative aspect-[4/5] rounded-lg overflow-hidden bg-cream-100 mb-3">
                          <img
                            src={prod.images?.[0]?.image_url || 'https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=400&q=80'}
                            alt={prod.title}
                            className="w-full h-full object-cover"
                          />
                          <button onClick={() => toggleWishlist(prod)} className="absolute top-2 right-2 p-1.5 rounded-full bg-white text-rose-600 shadow-sm">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <div>
                          <h4 className="font-serif font-medium text-sm text-onyx-950 truncate">{prod.title}</h4>
                          <p className="font-serif font-bold text-sm text-gold-700 mt-1">{formatPrice(prod.price)}</p>
                        </div>
                        <button
                          onClick={async () => { await addItem(prod, prod.variants?.[0]?.id, 1); toast.success(`Moved ${prod.title} to bag`); }}
                          className="mt-3 w-full py-2 bg-onyx-950 text-cream-50 rounded-lg text-xs font-semibold uppercase tracking-wider hover:bg-gold-600 transition-colors"
                        >
                          Move to Bag
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── Addresses Tab ─────────────────────────────────────────── */}
            {activeTab === 'addresses' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="font-serif text-2xl font-semibold text-onyx-950">Saved Delivery Addresses</h2>
                  <button
                    onClick={() => setShowAddressModal(true)}
                    className="flex items-center gap-1.5 px-4 py-2 bg-onyx-950 text-cream-50 text-xs font-semibold rounded-lg hover:bg-gold-600 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Address</span>
                  </button>
                </div>

                {addresses.length === 0 && (
                  <div className="bg-white rounded-2xl p-12 text-center border border-cream-200 shadow-soft">
                    <MapPin className="w-10 h-10 text-gold-600 mx-auto mb-3" />
                    <p className="text-xs text-stone-500">No saved addresses. Add one for faster checkout.</p>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {addresses.map((addr) => (
                    <div key={addr.id} className="bg-white p-5 rounded-2xl border border-cream-200 shadow-soft relative flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold text-sm text-onyx-950">{addr.full_name}</span>
                          <span className="text-[10px] uppercase font-bold px-2 py-0.5 bg-cream-100 rounded text-stone-600">{addr.address_type}</span>
                        </div>
                        <p className="text-xs text-stone-600 leading-relaxed">{addr.street_address}{addr.apartment ? `, ${addr.apartment}` : ''}</p>
                        <p className="text-xs text-stone-600">{addr.city}, {addr.state} - {addr.postal_code}</p>
                        <p className="text-xs text-stone-500 mt-2">Phone: {addr.phone}</p>
                      </div>
                      <div className="pt-4 mt-4 border-t border-cream-100 flex justify-end">
                        <button onClick={() => handleDeleteAddress(addr.id)} className="text-stone-400 hover:text-red-600 text-xs flex items-center gap-1">
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add Address Modal */}
                {showAddressModal && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-cream-200 max-h-[90vh] overflow-y-auto">
                      <h3 className="font-serif text-xl font-semibold text-onyx-950 mb-4">Add Shipping Address</h3>
                      <form onSubmit={handleAddAddress} className="space-y-3 text-xs">
                        {[
                          { label: 'Full Name *', key: 'full_name', type: 'text' },
                          { label: 'Phone Number *', key: 'phone', type: 'tel' },
                          { label: 'Street Address *', key: 'street_address', type: 'text' },
                          { label: 'Apartment / Floor (Optional)', key: 'apartment', type: 'text', required: false },
                        ].map(({ label, key, type, required = true }) => (
                          <div key={key}>
                            <label className="block text-stone-600 font-semibold mb-1">{label}</label>
                            <input
                              type={type}
                              required={required}
                              value={(addressForm as any)[key]}
                              onChange={(e) => setAddressForm({ ...addressForm, [key]: e.target.value })}
                              className="w-full px-3 py-2 border border-cream-300 rounded focus:outline-none focus:border-gold-500"
                            />
                          </div>
                        ))}
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-stone-600 font-semibold mb-1">City *</label>
                            <input type="text" required value={addressForm.city} onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })} className="w-full px-3 py-2 border border-cream-300 rounded focus:outline-none focus:border-gold-500" />
                          </div>
                          <div>
                            <label className="block text-stone-600 font-semibold mb-1">PIN Code *</label>
                            <input type="text" required value={addressForm.postal_code} onChange={(e) => setAddressForm({ ...addressForm, postal_code: e.target.value })} className="w-full px-3 py-2 border border-cream-300 rounded focus:outline-none focus:border-gold-500" />
                          </div>
                        </div>
                        <div>
                          <label className="block text-stone-600 font-semibold mb-1">State</label>
                          <select value={addressForm.state} onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })} className="w-full px-3 py-2 border border-cream-300 rounded focus:outline-none focus:border-gold-500">
                            {['Andhra Pradesh','Assam','Bihar','Delhi','Goa','Gujarat','Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh','Uttarakhand','West Bengal'].map(s => <option key={s}>{s}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="block text-stone-600 font-semibold mb-1">Address Type</label>
                          <div className="flex gap-2">
                            {(['Home', 'Work', 'Other'] as const).map((t) => (
                              <button key={t} type="button" onClick={() => setAddressForm({ ...addressForm, address_type: t })} className={`flex-1 py-1.5 rounded border text-xs font-semibold transition-colors ${addressForm.address_type === t ? 'bg-onyx-950 text-cream-50 border-onyx-950' : 'border-cream-300 text-stone-600 hover:border-gold-400'}`}>
                                {t}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div className="flex justify-end gap-2 pt-4">
                          <button type="button" onClick={() => setShowAddressModal(false)} className="px-4 py-2 text-stone-600 hover:bg-cream-100 rounded">Cancel</button>
                          <button type="submit" className="px-5 py-2 bg-onyx-950 text-cream-50 font-semibold rounded hover:bg-gold-600">Save Address</button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── Returns & Cancellations Tab ───────────────────────────── */}
            {activeTab === 'returns' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="font-serif text-2xl font-semibold text-onyx-950">Returns & Cancellations</h2>
                </div>

                <div className="bg-cream-100 border border-cream-300 rounded-xl p-4 text-xs text-stone-600">
                  <p className="font-semibold text-onyx-950 mb-1">Return Policy</p>
                  <p>Returns accepted within 7 days of delivery for unused items in original packaging. To request a return, use the "Request Return" button on a delivered order above, or contact support via WhatsApp.</p>
                </div>

                {loadingReturns ? (
                  <div className="p-8 text-center text-xs text-stone-400">Loading return requests...</div>
                ) : returns.length === 0 ? (
                  <div className="bg-white rounded-2xl p-12 text-center border border-cream-200 shadow-soft">
                    <RotateCcw className="w-10 h-10 text-stone-300 mx-auto mb-3" />
                    <h3 className="font-serif text-xl font-medium text-onyx-950 mb-1">No Return Requests</h3>
                    <p className="text-xs text-stone-500 mb-4">To request a return for a delivered order, go to Orders & Tracking and click "Request Return".</p>
                    <button onClick={() => handleTabChange('orders')} className="text-gold-700 font-semibold text-xs hover:underline">
                      View My Orders
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {returns.map((ret: any) => (
                      <div key={ret.id} className="bg-white rounded-xl p-5 border border-cream-200 shadow-soft text-xs">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-mono text-onyx-950 font-bold">Return #{ret.id?.slice(0, 8)}</span>
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            ret.status === 'approved' ? 'bg-green-100 text-green-800' :
                            ret.status === 'rejected' ? 'bg-red-100 text-red-800' :
                            ret.status === 'refunded' ? 'bg-purple-100 text-purple-800' :
                            'bg-amber-100 text-amber-800'
                          }`}>
                            {ret.status}
                          </span>
                        </div>
                        <p className="text-stone-500"><span className="font-semibold text-stone-700">Reason:</span> {ret.reason}</p>
                        {ret.refund_amount > 0 && (
                          <p className="text-stone-500 mt-1"><span className="font-semibold text-stone-700">Refund Amount:</span> {formatPrice(ret.refund_amount)}</p>
                        )}
                        <p className="text-stone-400 mt-1">Submitted: {new Date(ret.created_at).toLocaleDateString('en-IN')}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── Profile Tab ──────────────────────────────────────────── */}
            {activeTab === 'profile' && (
              <div className="bg-white rounded-2xl p-6 sm:p-8 border border-cream-200 shadow-soft max-w-xl">
                <h2 className="font-serif text-2xl font-semibold text-onyx-950 mb-6">Profile & Contact</h2>
                <form onSubmit={handleProfileSubmit} className="space-y-4 text-xs">
                  <div>
                    <label className="block text-stone-600 font-semibold mb-1">Email Address</label>
                    <input type="email" disabled value={user?.email} className="w-full px-3.5 py-2.5 bg-cream-100 border border-cream-200 rounded-lg text-stone-500 cursor-not-allowed" />
                    <span className="text-[10px] text-stone-400">Account login email cannot be changed.</span>
                  </div>
                  <div>
                    <label className="block text-stone-600 font-semibold mb-1">Full Name</label>
                    <input
                      type="text"
                      value={profileForm.full_name}
                      onChange={(e) => setProfileForm({ ...profileForm, full_name: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-cream-50 border border-cream-300 rounded-lg focus:outline-none focus:border-gold-500"
                    />
                  </div>
                  <div>
                    <label className="block text-stone-600 font-semibold mb-1">Phone Number</label>
                    <input
                      type="tel"
                      value={profileForm.phone}
                      onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-cream-50 border border-cream-300 rounded-lg focus:outline-none focus:border-gold-500"
                    />
                  </div>
                  <div className="pt-2">
                    <button type="submit" className="px-6 py-3 bg-onyx-950 text-cream-50 text-xs font-semibold uppercase tracking-wider rounded-lg hover:bg-gold-600 transition-colors">
                      Update Profile
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* ── Change Password Tab ───────────────────────────────────── */}
            {activeTab === 'password' && (
              <div className="bg-white rounded-2xl p-6 sm:p-8 border border-cream-200 shadow-soft max-w-xl">
                <h2 className="font-serif text-2xl font-semibold text-onyx-950 mb-2">Change Password</h2>
                <p className="text-xs text-stone-500 mb-6">For security, you must enter your current password before setting a new one.</p>

                {pwError && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{pwError}</span>
                  </div>
                )}

                <form onSubmit={handleChangePassword} className="space-y-4 text-xs">
                  {/* Current Password */}
                  <div>
                    <label className="block text-stone-600 font-semibold mb-1">Current Password</label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type={showCurrentPw ? 'text' : 'password'}
                        required
                        value={pwForm.current_password}
                        onChange={(e) => setPwForm({ ...pwForm, current_password: e.target.value })}
                        className="w-full pl-9 pr-10 py-2.5 bg-cream-50 border border-cream-300 rounded-lg focus:outline-none focus:border-gold-500"
                        placeholder="Enter current password"
                      />
                      <button type="button" onClick={() => setShowCurrentPw(!showCurrentPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-onyx-700">
                        {showCurrentPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* New Password */}
                  <div>
                    <label className="block text-stone-600 font-semibold mb-1">New Password</label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type={showNewPw ? 'text' : 'password'}
                        required
                        value={pwForm.new_password}
                        onChange={(e) => setPwForm({ ...pwForm, new_password: e.target.value })}
                        className="w-full pl-9 pr-10 py-2.5 bg-cream-50 border border-cream-300 rounded-lg focus:outline-none focus:border-gold-500"
                        placeholder="Min 8 chars, upper + lower + number"
                      />
                      <button type="button" onClick={() => setShowNewPw(!showNewPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-onyx-700">
                        {showNewPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {/* Strength bars */}
                    {pwForm.new_password && (
                      <div className="mt-2 grid grid-cols-2 gap-1 text-[11px]">
                        {[
                          { met: pwForm.new_password.length >= 8, text: 'Min 8 characters' },
                          { met: /[A-Z]/.test(pwForm.new_password), text: 'Uppercase letter' },
                          { met: /[a-z]/.test(pwForm.new_password), text: 'Lowercase letter' },
                          { met: /[0-9]/.test(pwForm.new_password), text: 'Number (0–9)' },
                        ].map(({ met, text }) => (
                          <div key={text} className={`flex items-center gap-1 ${met ? 'text-green-600' : 'text-stone-400'}`}>
                            <CheckCircle className="w-3 h-3" />
                            <span>{text}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Confirm New Password */}
                  <div>
                    <label className="block text-stone-600 font-semibold mb-1">Confirm New Password</label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type={showConfirmPw ? 'text' : 'password'}
                        required
                        value={pwForm.confirm_password}
                        onChange={(e) => setPwForm({ ...pwForm, confirm_password: e.target.value })}
                        className={`w-full pl-9 pr-10 py-2.5 bg-cream-50 border rounded-lg focus:outline-none transition-colors ${
                          pwForm.confirm_password && pwForm.new_password !== pwForm.confirm_password
                            ? 'border-red-400'
                            : pwForm.confirm_password && pwForm.new_password === pwForm.confirm_password
                            ? 'border-green-400'
                            : 'border-cream-300 focus:border-gold-500'
                        }`}
                        placeholder="Re-enter new password"
                      />
                      <button type="button" onClick={() => setShowConfirmPw(!showConfirmPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-onyx-700">
                        {showConfirmPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {pwForm.confirm_password && pwForm.new_password !== pwForm.confirm_password && (
                      <p className="text-red-500 text-[11px] mt-1">Passwords do not match</p>
                    )}
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={changingPw}
                      className="px-6 py-3 bg-onyx-950 text-cream-50 text-xs font-semibold uppercase tracking-wider rounded-lg hover:bg-gold-600 transition-colors disabled:opacity-50"
                    >
                      {changingPw ? 'Updating...' : 'Update Password'}
                    </button>
                  </div>
                </form>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* Return Request Modal */}
      {showReturnModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-cream-200">
            <h3 className="font-serif text-xl font-semibold text-onyx-950 mb-2">Request a Return</h3>
            <p className="text-xs text-stone-500 mb-4">
              Please describe the reason for your return request. Our team will review it within 24 hours.
            </p>
            <form onSubmit={handleSubmitReturn} className="space-y-4 text-xs">
              <div>
                <label className="block text-stone-600 font-semibold mb-1">Reason for Return *</label>
                <select
                  value={returnReason}
                  onChange={(e) => setReturnReason(e.target.value)}
                  className="w-full px-3 py-2.5 border border-cream-300 rounded-lg focus:outline-none focus:border-gold-500 mb-2"
                >
                  <option value="">Select reason...</option>
                  <option>Item received damaged or defective</option>
                  <option>Wrong item delivered</option>
                  <option>Item does not match description</option>
                  <option>Changed my mind / No longer needed</option>
                  <option>Size or fit issue</option>
                  <option>Other reason</option>
                </select>
                {returnReason === 'Other reason' && (
                  <textarea
                    rows={3}
                    placeholder="Please describe your reason..."
                    className="w-full px-3 py-2 border border-cream-300 rounded-lg focus:outline-none focus:border-gold-500"
                    onChange={(e) => setReturnReason(e.target.value)}
                  />
                )}
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowReturnModal(false)} className="px-4 py-2 text-stone-600 hover:bg-cream-100 rounded">Cancel</button>
                <button type="submit" disabled={submittingReturn || !returnReason} className="px-5 py-2.5 bg-onyx-950 text-cream-50 font-semibold rounded-lg hover:bg-gold-600 disabled:opacity-50">
                  {submittingReturn ? 'Submitting...' : 'Submit Return'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
