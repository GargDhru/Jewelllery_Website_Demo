import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Tag, X, CheckCircle2 } from 'lucide-react';
import { couponApi } from '../../services/api';
import { Coupon } from '../../types';
import { useCurrency } from '../../context/CurrencyContext';
import { useToast } from '../../context/ToastContext';

export const AdminCoupons: React.FC = () => {
  const { formatPrice } = useCurrency();
  const toast = useToast();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discount_type: 'percentage' as 'percentage' | 'flat',
    discount_value: 10,
    min_purchase: 1499,
    max_discount: 1000,
    is_active: true,
  });

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const data = await couponApi.getAll();
      setCoupons(data);
    } catch {
      toast.error('Failed to load coupons');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await couponApi.create({
        ...formData,
        code: formData.code.toUpperCase().trim(),
        discount_value: Number(formData.discount_value),
        min_purchase: Number(formData.min_purchase),
        max_discount: formData.max_discount ? Number(formData.max_discount) : undefined,
      });
      toast.success(`Coupon ${formData.code.toUpperCase()} created!`);
      setIsModalOpen(false);
      fetchCoupons();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to create coupon');
    }
  };

  const handleDelete = async (coupon: Coupon) => {
    if (!window.confirm(`Delete coupon ${coupon.code}?`)) return;
    try {
      await couponApi.delete(coupon.id);
      setCoupons(coupons.filter((c) => c.id !== coupon.id));
      toast.success('Coupon removed');
    } catch {
      toast.error('Failed to delete coupon');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-semibold text-onyx-950">
            Coupons & Promotional Vouchers
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Configure promotional codes, percentage savings, flat discounts, and minimum order requirements.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-onyx-950 text-cream-50 text-xs font-semibold uppercase tracking-wider rounded-lg hover:bg-gold-600 transition-colors shadow-sm w-fit"
        >
          <Plus className="w-4 h-4" />
          <span>Create Coupon</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {coupons.map((c) => (
          <div
            key={c.id}
            className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="font-mono text-base font-bold bg-gold-100 text-gold-900 px-3 py-1 rounded-lg border border-gold-300">
                  {c.code}
                </span>
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  {c.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
              <p className="font-serif text-sm font-semibold text-onyx-950 mb-1">{c.description}</p>
              <div className="text-xs text-stone-600 space-y-1 mt-3 pt-3 border-t border-stone-100">
                <p>
                  Benefit: <strong>{c.discount_type === 'percentage' ? `${c.discount_value}% OFF` : `Flat ${formatPrice(c.discount_value)} OFF`}</strong>
                </p>
                <p>Min Purchase: <strong>{formatPrice(c.min_purchase)}</strong></p>
                {c.max_discount && <p>Max Discount Cap: <strong>{formatPrice(c.max_discount)}</strong></p>}
                <p className="text-[11px] text-stone-400 mt-1">Total Times Redeemed: {c.usage_count} orders</p>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-stone-100 flex justify-end">
              <button
                onClick={() => handleDelete(c)}
                className="text-stone-400 hover:text-red-600 text-xs flex items-center gap-1"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-stone-200">
            <div className="flex items-center justify-between pb-4 border-b border-stone-200 mb-6">
              <h3 className="font-serif text-xl font-semibold text-onyx-950">Create Promo Voucher</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-stone-400 hover:text-black">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-stone-600 font-semibold mb-1">Coupon Code (Uppercase) *</label>
                <input
                  type="text"
                  required
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg font-mono font-bold uppercase"
                  placeholder="e.g. LUXE15"
                />
              </div>

              <div>
                <label className="block text-stone-600 font-semibold mb-1">Description *</label>
                <input
                  type="text"
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg"
                  placeholder="15% off on fine collections"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-stone-600 font-semibold mb-1">Discount Type</label>
                  <select
                    value={formData.discount_type}
                    onChange={(e) => setFormData({ ...formData, discount_type: e.target.value as any })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="flat">Flat Amount (₹)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-stone-600 font-semibold mb-1">Discount Value *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={formData.discount_value}
                    onChange={(e) => setFormData({ ...formData, discount_value: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-stone-600 font-semibold mb-1">Min Order Subtotal (₹)</label>
                  <input
                    type="number"
                    value={formData.min_purchase}
                    onChange={(e) => setFormData({ ...formData, min_purchase: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-stone-600 font-semibold mb-1">Max Cap (Optional ₹)</label>
                  <input
                    type="number"
                    value={formData.max_discount}
                    onChange={(e) => setFormData({ ...formData, max_discount: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-stone-300 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-onyx-950 text-cream-50 font-semibold uppercase tracking-wider rounded"
                >
                  Save Coupon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

