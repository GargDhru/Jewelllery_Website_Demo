import React, { useState, useEffect, useCallback } from 'react';
import { Users, Mail, Search, ShieldCheck, ShieldX, User, RefreshCw, Trash2 } from 'lucide-react';
import { adminApi, api } from '../../services/api';
import { User as UserType } from '../../types';
import { useToast } from '../../context/ToastContext';

export const AdminCustomers: React.FC = () => {
  const [customers, setCustomers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const toast = useToast();

  const fetchCustomers = useCallback(async (q?: string) => {
    try {
      setLoading(true);
      const data = await adminApi.getCustomers(q);
      setCustomers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCustomers(search || undefined);
    }, 350);
    return () => clearTimeout(timer);
  }, [search, fetchCustomers]);

  const handleToggleStatus = async (customer: UserType) => {
    if (customer.role === 'admin') {
      toast.error('Cannot deactivate admin accounts.');
      return;
    }
    try {
      setTogglingId(customer.id);
      await api.put(`/admin/customers/${customer.id}/toggle-status`);
      setCustomers((prev) =>
        prev.map((c) => c.id === customer.id ? { ...c, is_active: !c.is_active } : c)
      );
      const action = customer.is_active ? 'deactivated' : 'activated';
      toast.success(`Account ${action} successfully`);
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to update account status');
    } finally {
      setTogglingId(null);
    }
  };

  const handleDeleteCustomer = async (customer: UserType) => {
    if (customer.email === 'dhrugar@gmail.com') {
      toast.error('Cannot remove master administrator account.');
      return;
    }
    if (!window.confirm(`Are you sure you want to completely remove account ${customer.email}?`)) {
      return;
    }
    try {
      setDeletingId(customer.id);
      await adminApi.deleteCustomer(customer.id);
      setCustomers((prev) => prev.filter((c) => c.id !== customer.id));
      toast.success(`Account ${customer.email} removed successfully.`);
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to remove account');
    } finally {
      setDeletingId(null);
    }
  };

  const activeCount = customers.filter(c => c.is_active !== false && c.role === 'customer').length;
  const totalCount = customers.filter(c => c.role === 'customer').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-semibold text-onyx-950">
            Registered Patrons
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            {activeCount} active of {totalCount} customers · {customers.filter(c => c.role === 'admin').length} admin accounts
          </p>
        </div>
        <button
          onClick={() => fetchCustomers(search || undefined)}
          className="flex items-center gap-1.5 px-3 py-2 border border-stone-200 rounded-lg text-xs text-stone-600 hover:bg-stone-50"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-sm">
        <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or email..."
          className="w-full pl-9 pr-4 py-2.5 text-xs border border-stone-200 rounded-xl focus:outline-none focus:border-gold-500 bg-white"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 text-xs"
          >
            ✕
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-stone-50 text-stone-500 uppercase tracking-wider text-[10px] border-b border-stone-200">
              <tr>
                <th className="py-3 px-4">Patron Name</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Phone</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Member Since</th>
                <th className="py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-stone-400">Loading customers...</td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-stone-400">
                    {search ? `No customers found matching "${search}"` : 'No registered customers yet'}
                  </td>
                </tr>
              ) : (
                customers.map((c) => (
                  <tr key={c.id} className={`hover:bg-stone-50 transition-colors ${c.is_active === false ? 'opacity-60' : ''}`}>
                    <td className="py-3.5 px-4 font-semibold text-onyx-950">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-cream-200 flex items-center justify-center text-stone-700 text-xs font-bold shrink-0">
                          {c.full_name?.charAt(0)?.toUpperCase() || 'P'}
                        </div>
                        <span>{c.full_name || 'Guest Patron'}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-stone-600">{c.email}</td>
                    <td className="py-3.5 px-4 text-stone-600">{(c as any).phone || '—'}</td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        c.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-cream-100 text-stone-700'
                      }`}>
                        {c.role}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        c.is_active === false ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        {c.is_active === false ? 'Inactive' : 'Active'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-stone-400">
                      {c.created_at ? new Date(c.created_at).toLocaleDateString('en-IN') : '—'}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        {c.role !== 'admin' && (
                          <button
                            onClick={() => handleToggleStatus(c)}
                            disabled={togglingId === c.id}
                            title={c.is_active === false ? 'Activate account' : 'Deactivate account'}
                            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-colors disabled:opacity-50 ${
                              c.is_active === false
                                ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                                : 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200'
                            }`}
                          >
                            {c.is_active === false ? (
                              <><ShieldCheck className="w-3 h-3" /> Activate</>
                            ) : (
                              <><ShieldX className="w-3 h-3" /> Deactivate</>
                            )}
                          </button>
                        )}
                        {c.email !== 'dhrugar@gmail.com' && (
                          <button
                            onClick={() => handleDeleteCustomer(c)}
                            disabled={deletingId === c.id}
                            title="Remove account completely"
                            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors disabled:opacity-50"
                          >
                            <Trash2 className="w-3 h-3" />
                            Remove
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
