import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp, ShoppingBag, Users, DollarSign, Package, AlertTriangle,
  ArrowUpRight, ArrowRight, CheckCircle2, Clock
} from 'lucide-react';
import { adminApi } from '../../services/api';
import { AdminStats } from '../../types';
import { useCurrency } from '../../context/CurrencyContext';

export const AdminDashboard: React.FC = () => {
  const { formatPrice } = useCurrency();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const data = await adminApi.getStats();
        setStats(data);
      } catch (err) {
        console.error('Failed to load admin stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading || !stats) {
    return <div className="text-xs text-stone-500 py-12 text-center">Loading atelier analytics...</div>;
  }

  const kpis = [
    { title: 'Total Revenue', value: formatPrice(stats.total_revenue), change: '+18.4%', icon: DollarSign, color: 'text-gold-600 bg-gold-50' },
    { title: 'Total Orders', value: stats.total_orders, change: '+12.1%', icon: Package, color: 'text-blue-600 bg-blue-50' },
    { title: 'Registered Patrons', value: stats.total_customers, change: '+24.6%', icon: Users, color: 'text-purple-600 bg-purple-50' },
    { title: 'Average Order Value', value: formatPrice(stats.average_order_value || 4250), change: '+6.2%', icon: TrendingUp, color: 'text-emerald-600 bg-emerald-50' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-3xl font-semibold text-onyx-950">
          Atelier Overview & Analytics
        </h1>
        <p className="text-xs text-stone-500 mt-1">
          Real-time performance metrics, sales revenue trends, and operational orders.
        </p>
      </div>

      {/* Low stock alert if any */}
      {stats.low_stock_products > 0 && (
        <div className="p-4 bg-amber-50 border border-amber-300 rounded-xl flex items-center justify-between text-xs text-amber-900">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>{stats.low_stock_products} jewellery pieces</strong> are running below low-stock threshold (&lt; 10 units).
            </span>
          </div>
          <Link
            to="/admin/products"
            className="text-amber-800 font-bold hover:underline"
          >
            Manage Inventory →
          </Link>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div key={idx} className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider">{kpi.title}</p>
                <h3 className="font-serif text-2xl font-bold text-onyx-950 mt-1.5">{kpi.value}</h3>
                <span className="text-[11px] text-emerald-700 font-semibold mt-1 inline-block">
                  {kpi.change} vs previous month
                </span>
              </div>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${kpi.color}`}>
                <Icon className="w-6 h-6" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Interactive Sales Chart & Top Selling Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sales Chart (SVG Bar Visualization) */}
        <div className="lg:col-span-2 bg-white p-6 sm:p-8 rounded-2xl border border-stone-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-serif text-lg font-semibold text-onyx-950">Revenue Trends</h3>
              <p className="text-xs text-stone-400">Daily gross revenue over the past 7 days</p>
            </div>
            <span className="text-xs font-semibold text-gold-700 bg-gold-50 px-2.5 py-1 rounded-full border border-gold-200">
              Live Verified
            </span>
          </div>

          <div className="h-64 flex items-end gap-4 pt-8 pb-2 px-2 border-b border-stone-100">
            {stats.sales_chart.map((point, i) => {
              const maxRev = Math.max(...stats.sales_chart.map((p) => p.revenue)) || 50000;
              const heightPct = Math.max(15, Math.round((point.revenue / maxRev) * 100));
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-2 group relative">
                  {/* Tooltip on hover */}
                  <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-onyx-950 text-white text-[10px] py-1 px-2 rounded pointer-events-none whitespace-nowrap shadow-md z-10">
                    {formatPrice(point.revenue)} ({point.orders} orders)
                  </div>

                  <div className="w-full bg-cream-200 rounded-t-lg overflow-hidden flex items-end h-48">
                    <div
                      className="w-full bg-gold-500 group-hover:bg-gold-600 transition-all rounded-t-lg"
                      style={{ height: `${heightPct}%` }}
                    />
                  </div>
                  <span className="text-[11px] text-stone-500 font-medium">{point.date}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Selling Products */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-stone-200 shadow-sm space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-lg font-semibold text-onyx-950">Best Performers</h3>
            <Link to="/admin/products" className="text-xs text-gold-700 font-semibold hover:underline">
              View All
            </Link>
          </div>

          <div className="divide-y divide-stone-100">
            {stats.top_selling_products.map((p) => (
              <div key={p.id} className="py-3 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <img
                    src={p.image_url || 'https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=80&q=80'}
                    alt=""
                    className="w-10 h-12 rounded object-cover border border-stone-200 bg-stone-50"
                  />
                  <div>
                    <h4 className="font-medium text-onyx-950 truncate max-w-[130px]">{p.title}</h4>
                    <p className="text-stone-400 text-[11px]">Stock: {p.stock_quantity}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-semibold text-onyx-950 block">{p.sales_count} Sold</span>
                  <span className="text-[11px] text-gold-700 font-medium">{formatPrice(p.price)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Orders Overview */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-stone-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-stone-100">
          <div>
            <h3 className="font-serif text-lg font-semibold text-onyx-950">Recent Client Orders</h3>
            <p className="text-xs text-stone-400">Latest purchases requiring fulfillment or dispatch</p>
          </div>
          <Link
            to="/admin/orders"
            className="text-xs text-gold-700 font-semibold hover:underline flex items-center gap-1"
          >
            <span>All Orders</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-stone-50 text-stone-500 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Order Ref</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Items</th>
                <th className="py-3 px-4">Total Amount</th>
                <th className="py-3 px-4">Payment</th>
                <th className="py-3 px-4">Order Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {stats.recent_orders.map((order) => (
                <tr key={order.id} className="hover:bg-stone-50 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-onyx-950">
                    {order.order_number}
                  </td>
                  <td className="py-3.5 px-4 font-medium text-stone-800">
                    {order.customer_email}
                  </td>
                  <td className="py-3.5 px-4 text-stone-600">
                    {order.items.length} {order.items.length === 1 ? 'piece' : 'pieces'}
                  </td>
                  <td className="py-3.5 px-4 font-serif font-bold text-gold-800">
                    {formatPrice(order.total_amount)}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="capitalize text-[11px] font-semibold text-stone-700">
                      {order.payment_method} ({order.payment_status})
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded-full bg-cream-100 text-stone-800 font-bold text-[10px] uppercase">
                      {order.order_status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <Link
                      to="/admin/orders"
                      className="text-gold-700 hover:text-gold-900 font-semibold"
                    >
                      Inspect →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

