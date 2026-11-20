import React, { useState, useEffect } from 'react';
import {
  Plus, Search, Edit2, Trash2, Check, X, Sparkles, Filter, AlertCircle
} from 'lucide-react';
import { productApi, categoryApi } from '../../services/api';
import { Product, Category } from '../../types';
import { useCurrency } from '../../context/CurrencyContext';
import { useToast } from '../../context/ToastContext';

export const AdminProducts: React.FC = () => {
  const { formatPrice } = useCurrency();
  const toast = useToast();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCat, setSelectedCat] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    sku: '',
    category_id: '',
    price: 1999,
    compare_at_price: 2999,
    cost_price: 600,
    stock_quantity: 20,
    short_description: '',
    description: '',
    material: 'Stainless Steel & AAA Grade Zirconia',
    plating: '18K Gold PVD Anti-Tarnish',
    color: 'Champagne Gold',
    dimensions: '',
    weight: '',
    is_featured: false,
    is_trending: false,
    is_new_arrival: true,
    is_active: true,
    images: '',
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [prods, cats] = await Promise.all([
        productApi.getAll({ limit: 100 }),
        categoryApi.getAll(true),
      ]);
      setProducts(prods);
      setCategories(cats);
    } catch (err) {
      console.error('Failed to load products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openCreateModal = () => {
    setEditingProduct(null);
    setFormData({
      title: '',
      slug: '',
      sku: `AURA-${Date.now().toString().slice(-4)}`,
      category_id: categories[0]?.id || '',
      price: 2499,
      compare_at_price: 3899,
      cost_price: 750,
      stock_quantity: 25,
      short_description: '',
      description: '',
      material: 'Stainless Steel & AAA Grade Zirconia',
      plating: '18K Gold PVD Anti-Tarnish',
      color: 'Champagne Gold',
      dimensions: 'Standard fit',
      weight: '12 grams',
      is_featured: false,
      is_trending: false,
      is_new_arrival: true,
      is_active: true,
      images: 'https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=800&q=80',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (prod: Product) => {
    setEditingProduct(prod);
    setFormData({
      title: prod.title,
      slug: prod.slug,
      sku: prod.sku,
      category_id: prod.category_id || '',
      price: prod.price,
      compare_at_price: prod.compare_at_price || 0,
      cost_price: prod.cost_price || 0,
      stock_quantity: prod.stock_quantity,
      short_description: prod.short_description || '',
      description: prod.description || '',
      material: prod.material,
      plating: prod.plating,
      color: prod.color,
      dimensions: prod.dimensions || '',
      weight: prod.weight || '',
      is_featured: prod.is_featured,
      is_trending: prod.is_trending,
      is_new_arrival: prod.is_new_arrival,
      is_active: prod.is_active,
      images: prod.images?.map((i) => i.image_url).join('\n') || '',
    });
    setIsModalOpen(true);
  };

  const handleTitleChange = (val: string) => {
    const generatedSlug = val
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
    setFormData((prev) => ({
      ...prev,
      title: val,
      slug: editingProduct ? prev.slug : generatedSlug,
    }));
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const imgUrls = formData.images
        .split(/[\n,]/)
        .map((s) => s.trim())
        .filter(Boolean);

      const payload = {
        title: formData.title,
        slug: formData.slug,
        sku: formData.sku,
        category_id: formData.category_id || null,
        price: Number(formData.price),
        compare_at_price: Number(formData.compare_at_price) || null,
        cost_price: Number(formData.cost_price) || null,
        stock_quantity: Number(formData.stock_quantity),
        short_description: formData.short_description,
        description: formData.description,
        material: formData.material,
        plating: formData.plating,
        color: formData.color,
        dimensions: formData.dimensions,
        weight: formData.weight,
        is_featured: formData.is_featured,
        is_trending: formData.is_trending,
        is_new_arrival: formData.is_new_arrival,
        is_active: formData.is_active,
        images: imgUrls,
        variants: [
          {
            title: `${formData.color} / Standard`,
            color: formData.color,
            size: 'Standard',
            price: Number(formData.price),
            stock_quantity: Number(formData.stock_quantity),
            is_active: true,
          },
        ],
      };

      if (editingProduct) {
        await productApi.update(editingProduct.id, payload);
        toast.success(`Product "${formData.title}" updated successfully!`);
      } else {
        await productApi.create(payload);
        toast.success(`Product "${formData.title}" created successfully!`);
      }

      setIsModalOpen(false);
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to save product');
    }
  };

  const handleDeleteProduct = async (prod: Product) => {
    if (!window.confirm(`Are you sure you wish to delete "${prod.title}"?`)) return;
    try {
      await productApi.delete(prod.id);
      setProducts(products.filter((p) => p.id !== prod.id));
      toast.success('Product deleted successfully');
    } catch {
      toast.error('Failed to delete product');
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCat ? p.category_id === selectedCat : true;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-semibold text-onyx-950">
            Jewellery Catalog & Inventory
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Manage your piece listings, image assets, stock levels, and pricing.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-5 py-2.5 bg-onyx-950 text-cream-50 text-xs font-semibold uppercase tracking-wider rounded-lg hover:bg-gold-600 transition-colors shadow-sm w-fit"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm flex flex-col sm:flex-row items-center gap-4 justify-between">
        <div className="relative flex-1 max-w-sm w-full">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by title or SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs focus:outline-none focus:border-gold-500"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select
            value={selectedCat}
            onChange={(e) => setSelectedCat(e.target.value)}
            className="px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs font-medium text-stone-700 focus:outline-none"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-stone-50 text-stone-500 uppercase tracking-wider text-[10px] border-b border-stone-200">
              <tr>
                <th className="py-3 px-4">Item</th>
                <th className="py-3 px-4">SKU</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Price / MRP</th>
                <th className="py-3 px-4">Stock Level</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredProducts.map((p) => (
                <tr key={p.id} className="hover:bg-stone-50 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={p.images?.[0]?.image_url || 'https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=80&q=80'}
                        alt=""
                        className="w-10 h-12 rounded object-cover border border-stone-200 bg-stone-100 shrink-0"
                      />
                      <div>
                        <h4 className="font-semibold text-onyx-950 line-clamp-1">{p.title}</h4>
                        <span className="text-[11px] text-stone-400">{p.material}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-mono font-medium text-stone-600">{p.sku}</td>
                  <td className="py-3 px-4 text-stone-700">{p.category?.name || '—'}</td>
                  <td className="py-3 px-4">
                    <span className="font-bold text-onyx-950">{formatPrice(p.price)}</span>
                    {p.compare_at_price && p.compare_at_price > p.price && (
                      <span className="text-[10px] text-stone-400 line-through block">
                        {formatPrice(p.compare_at_price)}
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`font-semibold ${
                        p.stock_quantity < 10 ? 'text-amber-600 font-bold' : 'text-stone-800'
                      }`}
                    >
                      {p.stock_quantity} units
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        p.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-100 text-stone-500'
                      }`}
                    >
                      {p.is_active ? 'Active' : 'Draft'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right space-x-2">
                    <button
                      onClick={() => openEditModal(p)}
                      className="p-1.5 text-stone-500 hover:text-gold-700 hover:bg-stone-100 rounded"
                      title="Edit Product"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(p)}
                      className="p-1.5 text-stone-500 hover:text-red-600 hover:bg-red-50 rounded"
                      title="Delete Product"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl border border-stone-200 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-stone-200 mb-6">
              <h3 className="font-serif text-xl font-semibold text-onyx-950">
                {editingProduct ? 'Edit Jewellery Piece' : 'Add New Atelier Piece'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-full text-stone-400 hover:text-stone-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-stone-600 font-semibold mb-1">Product Title *</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-gold-500"
                    placeholder="e.g. Aura Soleil Chandelier Earrings"
                  />
                </div>

                <div>
                  <label className="block text-stone-600 font-semibold mb-1">Slug *</label>
                  <input
                    type="text"
                    required
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg font-mono text-[11px]"
                  />
                </div>

                <div>
                  <label className="block text-stone-600 font-semibold mb-1">SKU Code *</label>
                  <input
                    type="text"
                    required
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg font-mono text-[11px]"
                  />
                </div>

                <div>
                  <label className="block text-stone-600 font-semibold mb-1">Category *</label>
                  <select
                    value={formData.category_id}
                    onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-stone-600 font-semibold mb-1">Stock Quantity *</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={formData.stock_quantity}
                    onChange={(e) => setFormData({ ...formData, stock_quantity: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-stone-600 font-semibold mb-1">Selling Price (INR ₹) *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-stone-600 font-semibold mb-1">Compare MRP (Strike-through)</label>
                  <input
                    type="number"
                    min={0}
                    value={formData.compare_at_price}
                    onChange={(e) => setFormData({ ...formData, compare_at_price: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-stone-600 font-semibold mb-1">
                    Image URLs (One per line or comma-separated) *
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={formData.images}
                    onChange={(e) => setFormData({ ...formData, images: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg font-mono text-[11px]"
                    placeholder="https://images.unsplash.com/photo-..."
                  />
                </div>

                <div>
                  <label className="block text-stone-600 font-semibold mb-1">Product Color / Finish</label>
                  <select
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs"
                  >
                    <option value="Gold">Gold</option>
                    <option value="Champagne Gold">Champagne Gold</option>
                    <option value="Rose Gold">Rose Gold</option>
                    <option value="Silver">Silver</option>
                    <option value="Platinum Silver">Platinum Silver</option>
                    <option value="Antique Gold">Antique Gold</option>
                    <option value="Black">Black</option>
                    <option value="White">White</option>
                    <option value="Pearl White">Pearl White</option>
                    <option value="Emerald Green Paint">Emerald Green Paint</option>
                    <option value="Multicolour">Multicolour</option>
                  </select>
                </div>

                <div>
                  <label className="block text-stone-600 font-semibold mb-1">Dimensions / Sizing</label>
                  <input
                    type="text"
                    value={formData.dimensions}
                    onChange={(e) => setFormData({ ...formData, dimensions: e.target.value })}
                    placeholder="e.g. 45 cm + 5 cm or Ring Size 6, 7, 8"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-stone-600 font-semibold mb-1">Material Base</label>
                  <input
                    type="text"
                    value={formData.material}
                    onChange={(e) => setFormData({ ...formData, material: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-stone-600 font-semibold mb-1">Plating & Durability</label>
                  <input
                    type="text"
                    value={formData.plating}
                    onChange={(e) => setFormData({ ...formData, plating: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-stone-600 font-semibold mb-1">Full Description</label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg"
                  />
                </div>

                {/* Flags checkboxes */}
                <div className="sm:col-span-2 flex flex-wrap gap-4 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_featured}
                      onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                      className="rounded text-gold-600"
                    />
                    <span>Featured in Best Sellers</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_new_arrival}
                      onChange={(e) => setFormData({ ...formData, is_new_arrival: e.target.checked })}
                      className="rounded text-gold-600"
                    />
                    <span>New Arrival Badge</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                      className="rounded text-gold-600"
                    />
                    <span>Active for Sale</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-stone-300 text-stone-700 rounded-lg hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-onyx-950 text-cream-50 font-semibold uppercase tracking-wider rounded-lg hover:bg-gold-600 transition-colors"
                >
                  Save Piece
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

