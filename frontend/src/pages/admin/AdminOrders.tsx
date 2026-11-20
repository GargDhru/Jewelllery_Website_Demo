import React, { useState, useEffect } from 'react';
import {
  Package, Search, Eye, CheckCircle2, Truck, X, Clock, AlertTriangle, ExternalLink
} from 'lucide-react';
import { adminApi, orderApi } from '../../services/api';
import { Order } from '../../types';
import { useCurrency } from '../../context/CurrencyContext';
import { useToast } from '../../context/ToastContext';

export const AdminOrders: React.FC = () => {
  const { formatPrice } = useCurrency();
  const toast = useToast();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Selected Order Modal
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [editStatus, setEditStatus] = useState('');
  const [editPaymentStatus, setEditPaymentStatus] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [courierName, setCourierName] = useState('');

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getAllOrders(statusFilter === 'all' ? undefined : statusFilter);
      setOrders(data);
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const openOrderModal = (order: Order) => {
    setSelectedOrder(order);
    setEditStatus(order.order_status);
    setEditPaymentStatus(order.payment_status);
    setTrackingNumber(order.tracking_number || '');
    setCourierName(order.courier_name || 'Blue Dart Express');
  };

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;
    try {
      setUpdatingStatus(true);
      const updated = await orderApi.updateStatus(selectedOrder.id, {
        order_status: editStatus,
        payment_status: editPaymentStatus,
        tracking_number: trackingNumber,
        courier_name: courierName,
      });
      setSelectedOrder(updated);
      setOrders(orders.map((o) => (o.id === updated.id ? updated : o)));
      toast.success(`Order ${updated.order_number} status updated to ${editStatus}`);
    } catch {
      toast.error('Failed to update status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const filteredOrders = orders.filter((o) =>
    o.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.customer_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.customer_phone.includes(searchTerm)
  );

  const statuses = ['all', 'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-semibold text-onyx-950">
          Order Processing & Dispatch
        </h1>
        <p className="text-xs text-stone-500 mt-1">
          Review customer orders, update delivery tracking numbers, and manage payments.
        </p>
      </div>

      {/* Tabs and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm space-y-4">
        <div className="flex flex-wrap gap-2">
          {statuses.map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                statusFilter === st
                  ? 'bg-onyx-950 text-cream-50'
                  : 'bg-stone-50 text-stone-600 hover:bg-stone-100'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        <div className="relative max-w-sm">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by order #, email, phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs focus:outline-none focus:border-gold-500"
          />
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-stone-50 text-stone-500 uppercase tracking-wider text-[10px] border-b border-stone-200">
              <tr>
                <th className="py-3 px-4">Order Ref</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Customer Details</th>
                <th className="py-3 px-4">Total</th>
                <th className="py-3 px-4">Payment</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-stone-50 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-onyx-950">
                    {order.order_number}
                  </td>
                  <td className="py-3.5 px-4 text-stone-500">
                    {new Date(order.created_at).toLocaleDateString()}
                  </td>
                  <td className="py-3.5 px-4">
                    <p className="font-semibold text-onyx-950">{order.shipping_address?.full_name}</p>
                    <p className="text-[11px] text-stone-400">{order.customer_email}</p>
                  </td>
                  <td className="py-3.5 px-4 font-serif font-bold text-gold-800">
                    {formatPrice(order.total_amount)}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="capitalize font-medium text-stone-700">
                      {order.payment_method} ({order.payment_status})
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-cream-100 text-stone-800">
                      {order.order_status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => openOrderModal(order)}
                      className="px-3 py-1.5 bg-stone-100 hover:bg-gold-500 hover:text-white rounded text-stone-700 font-semibold transition-colors"
                    >
                      Manage
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detailed Order Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-3xl w-full shadow-2xl border border-stone-200 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-stone-200 mb-6">
              <div>
                <h3 className="font-serif text-xl font-semibold text-onyx-950">
                  Order #{selectedOrder.order_number}
                </h3>
                <span className="text-stone-400 text-xs">
                  Created {new Date(selectedOrder.created_at).toLocaleString()}
                </span>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1 rounded-full text-stone-400 hover:text-stone-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs mb-6">
              {/* Customer and Address */}
              <div className="bg-stone-50 p-4 rounded-xl border border-stone-200">
                <h4 className="font-semibold text-onyx-950 uppercase tracking-wider text-[11px] mb-2">
                  Recipient & Address
                </h4>
                <p className="font-bold text-stone-800">{selectedOrder.shipping_address?.full_name}</p>
                <p>{selectedOrder.shipping_address?.street_address}</p>
                <p>
                  {selectedOrder.shipping_address?.city}, {selectedOrder.shipping_address?.state} -{' '}
                  {selectedOrder.shipping_address?.postal_code}
                </p>
                <p className="mt-2 text-stone-500">Phone: {selectedOrder.customer_phone}</p>
                <p className="text-stone-500">Email: {selectedOrder.customer_email}</p>
              </div>

              {/* Order Notes & Payment */}
              <div className="bg-stone-50 p-4 rounded-xl border border-stone-200">
                <h4 className="font-semibold text-onyx-950 uppercase tracking-wider text-[11px] mb-2">
                  Payment & Notes
                </h4>
                <p>Payment Method: <strong className="capitalize">{selectedOrder.payment_method}</strong></p>
                <p>Payment Status: <strong className="capitalize">{selectedOrder.payment_status}</strong></p>
                {selectedOrder.notes && (
                  <p className="mt-2 text-stone-700 bg-white p-2 rounded border border-stone-200">
                    <strong>Note:</strong> {selectedOrder.notes}
                  </p>
                )}
              </div>
            </div>

            {/* Items */}
            <div className="border border-stone-200 rounded-xl overflow-hidden mb-6">
              <table className="w-full text-xs text-left">
                <thead className="bg-stone-50 text-stone-500 border-b border-stone-200">
                  <tr>
                    <th className="py-2.5 px-4">Item</th>
                    <th className="py-2.5 px-4">Qty</th>
                    <th className="py-2.5 px-4">Unit Price</th>
                    <th className="py-2.5 px-4 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {selectedOrder.items.map((i) => (
                    <tr key={i.id}>
                      <td className="py-2.5 px-4 font-medium text-onyx-950">{i.product_title}</td>
                      <td className="py-2.5 px-4">{i.quantity}</td>
                      <td className="py-2.5 px-4">{formatPrice(i.unit_price)}</td>
                      <td className="py-2.5 px-4 text-right font-semibold">{formatPrice(i.total_price)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Status Update Form */}
            <form onSubmit={handleUpdateStatus} className="bg-cream-50 p-4 rounded-xl border border-cream-200 space-y-4 text-xs">
              <h4 className="font-semibold text-onyx-950 uppercase tracking-wider text-[11px]">
                Update Fulfillment & Dispatch
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-stone-600 font-semibold mb-1">Order Status</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-cream-300 rounded focus:outline-none"
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="processing">Processing in Atelier</option>
                    <option value="shipped">Shipped & In Transit</option>
                    <option value="delivered">Delivered to Patron</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                <div>
                  <label className="block text-stone-600 font-semibold mb-1">Payment Status</label>
                  <select
                    value={editPaymentStatus}
                    onChange={(e) => setEditPaymentStatus(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-cream-300 rounded focus:outline-none"
                  >
                    <option value="pending">Pending</option>
                    <option value="paid">Paid</option>
                    <option value="failed">Failed</option>
                    <option value="refunded">Refunded</option>
                  </select>
                </div>

                <div>
                  <label className="block text-stone-600 font-semibold mb-1">Courier Service</label>
                  <input
                    type="text"
                    value={courierName}
                    onChange={(e) => setCourierName(e.target.value)}
                    placeholder="e.g. Blue Dart Express"
                    className="w-full px-3 py-2 bg-white border border-cream-300 rounded focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-stone-600 font-semibold mb-1">Airway Bill / Tracking Number</label>
                  <input
                    type="text"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    placeholder="e.g. BD789456123IN"
                    className="w-full px-3 py-2 bg-white border border-cream-300 rounded focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="submit"
                  disabled={updatingStatus}
                  className="px-6 py-2.5 bg-onyx-950 text-cream-50 font-semibold uppercase tracking-wider rounded-lg hover:bg-gold-600 transition-colors"
                >
                  {updatingStatus ? 'Saving...' : 'Update Order Status'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

