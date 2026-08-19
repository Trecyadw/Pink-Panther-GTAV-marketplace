'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import StatusBadge from '@/components/StatusBadge';

const ORDER_OPTIONS = ['pending', 'processed', 'completed'];
const PAYMENT_OPTIONS = ['unpaid', 'paid_ingame'];

export default function AdminOrdersPage() {
  const [summaryRows, setSummaryRows] = useState<any[]>([]);
  const [allOrders, setAllOrders] = useState<any[]>([]);
  const [message, setMessage] = useState('');
  const [expandedUserId, setExpandedUserId] = useState<number | null>(null);
  const [statusMap, setStatusMap] = useState<Record<number, string>>({});
  const [paymentMap, setPaymentMap] = useState<Record<number, string>>({});

  async function loadData() {
    const [grouped, orders] = await Promise.all([
      apiFetch('/orders/admin/grouped'),
      apiFetch('/orders/admin/all'),
    ]);

    setSummaryRows(grouped);
    setAllOrders(orders);

    const nextStatus: Record<number, string> = {};
    const nextPayment: Record<number, string> = {};

    orders.forEach((order: any) => {
      nextStatus[order.id] = order.order_status;
      nextPayment[order.id] = order.payment_status;
    });

    setStatusMap(nextStatus);
    setPaymentMap(nextPayment);
  }

  useEffect(() => {
    loadData().catch((e) => setMessage(e.message));
  }, []);

  async function saveOrder(orderId: number) {
    try {
      await apiFetch(`/orders/admin/${orderId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({
          order_status: statusMap[orderId],
          payment_status: paymentMap[orderId],
        }),
      });

      setMessage('Status order berhasil diupdate');
      await loadData();
    } catch (err: any) {
      setMessage(err.message);
    }
  }

  async function cancelOrder(orderId: number) {
    try {
      await apiFetch(`/orders/admin/${orderId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({
          order_status: 'cancelled',
          payment_status: paymentMap[orderId],
          note: 'Order dibatalkan admin',
        }),
      });

      setMessage('Order berhasil dibatalkan');
      await loadData();
    } catch (err: any) {
      setMessage(err.message);
    }
  }

  const grandTotalBelanja = summaryRows.reduce(
    (sum, row) => sum + Number(row.total_belanja || 0),
    0
  );

  const grandTotalOrders = summaryRows.reduce(
    (sum, row) => sum + Number(row.total_orders || 0),
    0
  );

  const grandTotalQty = summaryRows.reduce(
    (sum, row) => sum + Number(row.total_qty || 0),
    0
  );

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <h1 className="text-4xl font-black uppercase drop-shadow-[0_0_10px_rgba(240,98,146,0.3)]">Admin Orders</h1>
      {message && <div className="mt-4 text-sm font-semibold text-[#F06292]">{message}</div>}

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-zinc-800 bg-black/70 p-5 shadow-lg border-l-4 border-l-zinc-600">
          <div className="text-sm text-zinc-400">Total Semua Order</div>
          <div className="mt-2 text-3xl font-black text-white">{grandTotalOrders}</div>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-black/70 p-5 shadow-lg border-l-4 border-l-pink-400">
          <div className="text-sm text-zinc-400">Total Semua Item</div>
          <div className="mt-2 text-3xl font-black text-white">{grandTotalQty}</div>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-black/70 p-5 shadow-lg border-l-4 border-l-[#F06292]">
          <div className="text-sm text-zinc-400">Grand Total Belanja</div>
          <div className="mt-2 text-3xl font-black text-[#F06292]">
            ${grandTotalBelanja.toLocaleString('en-US')}
          </div>
        </div>
      </div>

      <div className="mt-6 table-wrap">
        <table className="min-w-full divide-y divide-zinc-800 bg-black/70">
          <thead>
            <tr className="text-left text-sm text-zinc-400">
              <th className="px-4 py-3">User</th>
              <th className="px-4 py-3">IC Name</th>
              <th className="px-4 py-3">Total Orders</th>
              <th className="px-4 py-3">Total Qty</th>
              <th className="px-4 py-3">Total Belanja</th>
              <th className="px-4 py-3">Pending</th>
              <th className="px-4 py-3">Processed</th>
              <th className="px-4 py-3">Completed</th>
              <th className="px-4 py-3">Items</th>
              <th className="px-4 py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {summaryRows.map((row) => (
              <>
                <tr key={row.user_id} className="border-t border-zinc-800 text-sm hover:bg-zinc-900/40 transition-colors">
                  <td className="px-4 py-3 font-medium text-white">{row.username}</td>
                  <td className="px-4 py-3 text-zinc-300">{row.ic_name}</td>
                  <td className="px-4 py-3 text-white">{row.total_orders}</td>
                  <td className="px-4 py-3 text-white">{row.total_qty}</td>
                  <td className="px-4 py-3 font-semibold text-[#F06292]">
                    ${Number(row.total_belanja).toLocaleString('en-US')}
                  </td>
                  <td className="px-4 py-3 text-pink-400">{row.pending_orders}</td>
                  <td className="px-4 py-3 text-blue-400">{row.processed_orders}</td>
                  <td className="px-4 py-3 text-green-400">{row.completed_orders}</td>
                  <td className="px-4 py-3 text-xs text-zinc-400">
                    {row.item_summary || '-'}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() =>
                        setExpandedUserId(expandedUserId === row.user_id ? null : row.user_id)
                      }
                      className="rounded-lg border border-[#F06292]/40 px-3 py-2 text-[#F06292] hover:bg-[#F06292]/10 transition-colors"
                    >
                      {expandedUserId === row.user_id ? 'Hide Detail' : 'Detail'}
                    </button>
                  </td>
                </tr>

                {expandedUserId === row.user_id && (
                  <tr>
                    <td colSpan={10} className="bg-black/40 px-4 py-4">
                      <div className="rounded-xl border border-pink-900/30 bg-black/40 p-4">
                        <div className="mb-3 text-sm font-semibold text-[#F06292]">
                          Detail Orders - {row.username}
                        </div>

                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-zinc-800">
                            <thead>
                              <tr className="text-left text-xs text-zinc-500">
                                <th className="px-3 py-2">Order</th>
                                <th className="px-3 py-2">Items</th>
                                <th className="px-3 py-2">Total</th>
                                <th className="px-3 py-2">Payment</th>
                                <th className="px-3 py-2">Status</th>
                                <th className="px-3 py-2">Update Payment</th>
                                <th className="px-3 py-2">Update Order</th>
                                <th className="px-3 py-2">Action</th>
                              </tr>
                            </thead>
                            <tbody>
                              {allOrders
                                .filter((order) => order.user_id === row.user_id)
                                .map((order) => {
                                  const currentStatus = statusMap[order.id] || order.order_status;
                                  const currentPayment = paymentMap[order.id] || order.payment_status;
                                  const isCancelled =
                                    currentStatus === 'cancelled' || order.order_status === 'cancelled';

                                  return (
                                    <tr key={order.id} className="border-t border-zinc-800 text-xs hover:bg-zinc-900/60 transition-colors">
                                      <td className="px-3 py-2 font-medium text-white">{order.order_code}</td>
                                      <td className="px-3 py-2 text-zinc-400">
                                        {order.item_summary || '-'}
                                      </td>
                                      <td className="px-3 py-2 text-[#F06292] font-semibold">
                                        ${Number(order.total_price).toLocaleString('en-US')}
                                      </td>
                                      <td className="px-3 py-2 uppercase text-white">{order.payment_status}</td>
                                      <td className="px-3 py-2">
                                        <StatusBadge status={order.order_status} />
                                      </td>
                                      <td className="px-3 py-2">
                                        <select
                                          className="rounded-lg border border-zinc-700 bg-zinc-950 px-2 py-1 text-white focus:border-[#F06292] outline-none transition-colors"
                                          value={currentPayment}
                                          onChange={(e) =>
                                            setPaymentMap((prev) => ({
                                              ...prev,
                                              [order.id]: e.target.value,
                                            }))
                                          }
                                          disabled={isCancelled}
                                        >
                                          {PAYMENT_OPTIONS.map((item) => (
                                            <option key={item} value={item}>
                                              {item}
                                            </option>
                                          ))}
                                        </select>
                                      </td>
                                      <td className="px-3 py-2">
                                        <select
                                          className="rounded-lg border border-zinc-700 bg-zinc-950 px-2 py-1 text-white focus:border-[#F06292] outline-none transition-colors"
                                          value={
                                            ORDER_OPTIONS.includes(currentStatus)
                                              ? currentStatus
                                              : 'pending'
                                          }
                                          onChange={(e) =>
                                            setStatusMap((prev) => ({
                                              ...prev,
                                              [order.id]: e.target.value,
                                            }))
                                          }
                                          disabled={isCancelled}
                                        >
                                          {ORDER_OPTIONS.map((item) => (
                                            <option key={item} value={item}>
                                              {item}
                                            </option>
                                          ))}
                                        </select>
                                      </td>
                                      <td className="px-3 py-2">
                                        <div className="flex gap-2">
                                          <button
                                            onClick={() => saveOrder(order.id)}
                                            className="rounded-lg border border-[#F06292]/40 px-2 py-1 text-[#F06292] hover:bg-[#F06292]/10 transition-colors disabled:opacity-50"
                                            disabled={isCancelled}
                                          >
                                            Save
                                          </button>

                                          {!isCancelled && (
                                            <button
                                              onClick={() => cancelOrder(order.id)}
                                              className="rounded-lg border border-red-500/40 px-2 py-1 text-red-400 hover:bg-red-500/10 transition-colors"
                                            >
                                              Cancel
                                            </button>
                                          )}
                                        </div>
                                      </td>
                                    </tr>
                                  );
                                })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}