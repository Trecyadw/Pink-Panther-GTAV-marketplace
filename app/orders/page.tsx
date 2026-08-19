'use client';

import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import { apiFetch } from '@/lib/api';
import StatusBadge from '@/components/StatusBadge';

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  async function loadOrders() {
    const data = await apiFetch('/orders/me');
    setOrders(data);
  }

  useEffect(() => {
    loadOrders().catch((e) => setError(e.message));
  }, []);

  async function cancelOrder(orderId: number) {
    try {
      await apiFetch(`/orders/${orderId}/cancel`, {
        method: 'PATCH',
      });

      setMessage('Order berhasil dibatalkan');
      await loadOrders();
    } catch (err: any) {
      setError(err.message);
    }
  }

  const totalOrders = orders.length;
  const totalBelanja = orders.reduce(
    (sum, order) => sum + Number(order.total_price || 0),
    0
  );
  const pendingOrders = orders.filter(
    (order) => order.order_status === 'pending'
  ).length;

  return (
    <main className="min-h-screen">
      <Navbar />
      <div className="mx-auto max-w-7xl px-6 py-10">
        <h1 className="text-4xl font-black uppercase text-white drop-shadow-[0_0_10px_rgba(240,98,146,0.3)]">My Orders</h1>

        {error && <div className="mt-4 text-sm text-red-400">{error}</div>}
        {message && <div className="mt-4 text-sm font-semibold text-[#F06292]">{message}</div>}

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-zinc-800 bg-black/70 p-5 shadow-lg border-l-4 border-l-zinc-600">
            <div className="text-sm text-zinc-400">Total Orders</div>
            <div className="mt-2 text-3xl font-black text-white">{totalOrders}</div>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-black/70 p-5 shadow-lg border-l-4 border-l-[#F06292]">
            <div className="text-sm text-zinc-400">Total Belanja</div>
            <div className="mt-2 text-3xl font-black text-[#F06292]">
              {/* Diubah menjadi lambang Dolar dan format angkanya */}
              ${totalBelanja.toLocaleString('en-US')}
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-black/70 p-5 shadow-lg border-l-4 border-l-pink-400">
            <div className="text-sm text-zinc-400">Pending Orders</div>
            <div className="mt-2 text-3xl font-black text-pink-400">{pendingOrders}</div>
          </div>
        </div>

        <div className="mt-6 table-wrap">
          <table className="min-w-full divide-y divide-zinc-800 bg-black/70">
            <thead>
              <tr className="text-left text-sm text-zinc-400">
                <th className="px-4 py-3">Order</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Payment</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => {
                const canCancel = order.order_status === 'pending';

                return (
                  <tr key={order.id} className="border-t border-zinc-800 text-sm hover:bg-zinc-900/40 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-medium text-white">{order.order_code}</div>
                      {order.item_summary && (
                        <div className="mt-1 text-xs text-zinc-400">
                          {order.item_summary}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 font-semibold text-[#F06292]">
                      {/* Diubah format komanya */}
                      ${Number(order.total_price).toLocaleString('en-US')}
                    </td>
                    <td className="px-4 py-3 uppercase text-white">{order.payment_status}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={order.order_status} />
                    </td>
                    <td className="px-4 py-3 text-white">
                      {new Date(order.created_at).toLocaleString('id-ID')}
                    </td>
                    <td className="px-4 py-3">
                      {canCancel ? (
                        <button
                          onClick={() => cancelOrder(order.id)}
                          className="rounded-lg border border-red-500/40 px-3 py-2 text-red-400 hover:bg-red-500/10 transition-colors"
                        >
                          Cancel
                        </button>
                      ) : (
                        <span className="text-xs text-zinc-500">-</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}