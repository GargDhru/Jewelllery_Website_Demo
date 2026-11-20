import React, { useState, useEffect } from 'react';
import { Star, Check, X, Trash2, MessageSquare, ShieldCheck } from 'lucide-react';
import { reviewApi } from '../../services/api';
import { Review } from '../../types';
import { useToast } from '../../context/ToastContext';

export const AdminReviews: React.FC = () => {
  const toast = useToast();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const data = await reviewApi.adminGetAll(statusFilter || undefined);
      setReviews(data);
    } catch {
      toast.error('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [statusFilter]);

  const handleModerate = async (reviewId: string, status: 'approved' | 'rejected') => {
    try {
      await reviewApi.adminModerate(reviewId, status);
      setReviews(reviews.map((r) => (r.id === reviewId ? { ...r, status } : r)));
      toast.success(`Review ${status}`);
    } catch {
      toast.error('Failed to moderate review');
    }
  };

  const handleDelete = async (reviewId: string) => {
    if (!window.confirm('Delete review permanently?')) return;
    try {
      await reviewApi.adminDelete(reviewId);
      setReviews(reviews.filter((r) => r.id !== reviewId));
      toast.success('Review deleted');
    } catch {
      toast.error('Failed to delete review');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-semibold text-onyx-950">
            Customer Review Moderation
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Review customer ratings, testimonials, and verify patron feedback.
          </p>
        </div>

        <div className="flex gap-2">
          {['', 'approved', 'pending', 'rejected'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                statusFilter === st
                  ? 'bg-onyx-950 text-cream-50'
                  : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-50'
              }`}
            >
              {st || 'All Reviews'}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm divide-y divide-stone-100 overflow-hidden">
        {reviews.length === 0 ? (
          <div className="p-12 text-center text-xs text-stone-400">No customer reviews found.</div>
        ) : (
          reviews.map((rev) => (
            <div key={rev.id} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
              <div className="space-y-1.5 max-w-xl">
                <div className="flex items-center gap-2">
                  <div className="flex text-amber-400">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-current" />
                    ))}
                  </div>
                  <span className="font-bold text-onyx-950">{rev.customer_name}</span>
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                    rev.status === 'approved' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {rev.status}
                  </span>
                </div>
                {rev.title && <h4 className="font-serif font-bold text-sm text-onyx-950">{rev.title}</h4>}
                <p className="text-stone-600 leading-relaxed italic">"{rev.comment}"</p>
                <span className="text-[11px] text-stone-400 block">
                  Submitted {new Date(rev.created_at).toLocaleDateString()}
                </span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {rev.status !== 'approved' && (
                  <button
                    onClick={() => handleModerate(rev.id, 'approved')}
                    className="p-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg flex items-center gap-1 font-semibold"
                    title="Approve"
                  >
                    <Check className="w-4 h-4" />
                    <span>Approve</span>
                  </button>
                )}
                {rev.status !== 'rejected' && (
                  <button
                    onClick={() => handleModerate(rev.id, 'rejected')}
                    className="p-2 bg-stone-100 text-stone-700 hover:bg-stone-200 rounded-lg flex items-center gap-1"
                    title="Reject"
                  >
                    <X className="w-4 h-4" />
                    <span>Reject</span>
                  </button>
                )}
                <button
                  onClick={() => handleDelete(rev.id)}
                  className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

