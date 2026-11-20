import React, { useState, useEffect } from 'react';
import { Plus, Trash2, ImageIcon, X } from 'lucide-react';
import { bannerApi } from '../../services/api';
import { Banner } from '../../types';
import { useToast } from '../../context/ToastContext';

export const AdminBanners: React.FC = () => {
  const toast = useToast();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    image_url: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=1800&q=80',
    cta_text: 'Explore Collection',
    cta_link: '/shop',
    display_order: 1,
    is_active: true,
  });

  const fetchBanners = async () => {
    try {
      setLoading(true);
      const data = await bannerApi.getAll();
      setBanners(data);
    } catch {
      toast.error('Failed to load banners');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await bannerApi.create(formData);
      toast.success('Homepage banner created!');
      setIsModalOpen(false);
      fetchBanners();
    } catch {
      toast.error('Failed to create banner');
    }
  };

  const handleDelete = async (bannerId: string) => {
    if (!window.confirm('Delete banner?')) return;
    try {
      await bannerApi.delete(bannerId);
      setBanners(banners.filter((b) => b.id !== bannerId));
      toast.success('Banner deleted');
    } catch {
      toast.error('Failed to delete banner');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-semibold text-onyx-950">
            Homepage Hero Banners
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Manage high-impact editorial imagery and seasonal showcase slides.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-onyx-950 text-cream-50 text-xs font-semibold uppercase tracking-wider rounded-lg hover:bg-gold-600 transition-colors shadow-sm w-fit"
        >
          <Plus className="w-4 h-4" />
          <span>Add Hero Slide</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {banners.map((b) => (
          <div key={b.id} className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm flex flex-col justify-between">
            <div className="h-48 relative bg-stone-100 overflow-hidden">
              <img src={b.image_url} alt={b.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-4 text-white">
                <div>
                  <h3 className="font-serif text-lg font-semibold">{b.title}</h3>
                  <p className="text-xs text-stone-300 line-clamp-1">{b.subtitle}</p>
                </div>
              </div>
            </div>
            <div className="p-4 flex items-center justify-between text-xs border-t border-stone-100">
              <span className="text-stone-500">CTA: <strong>{b.cta_text}</strong> ({b.cta_link})</span>
              <button
                onClick={() => handleDelete(b.id)}
                className="text-stone-400 hover:text-red-600 p-1 rounded"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-stone-200">
            <div className="flex items-center justify-between pb-4 border-b border-stone-200 mb-6">
              <h3 className="font-serif text-xl font-semibold text-onyx-950">Add Hero Banner</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-stone-400 hover:text-black">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-stone-600 font-semibold mb-1">Headline Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-stone-600 font-semibold mb-1">Subtitle / Manifesto</label>
                <textarea
                  rows={2}
                  value={formData.subtitle}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-stone-600 font-semibold mb-1">Image URL *</label>
                <input
                  type="url"
                  required
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg font-mono text-[11px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-stone-600 font-semibold mb-1">Button Text</label>
                  <input
                    type="text"
                    value={formData.cta_text}
                    onChange={(e) => setFormData({ ...formData, cta_text: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-stone-600 font-semibold mb-1">Button Link</label>
                  <input
                    type="text"
                    value={formData.cta_link}
                    onChange={(e) => setFormData({ ...formData, cta_link: e.target.value })}
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
                  Save Slide
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

