'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';

const emptyForm = {
  gang: '', 
  category_id: '',
  item_class: '',
  name: '',
  description: '',
  price: 0,
  stock: 0,
  max_order_qty: 1,
  order_unit: 'pcs',
  image_url: '',
  is_active: true,
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [form, setForm] = useState<any>(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [message, setMessage] = useState('');

  async function loadProducts() {
    const data = await apiFetch('/products/admin');
    setProducts(data);
  }

  useEffect(() => {
    loadProducts().catch((e) => setMessage(e.message));
  }, []);

  function startEdit(product: any) {
    setEditingId(product.id);
    setForm({
      gang: product.gang || '', 
      category_id: product.category_id ? String(product.category_id) : '',
      item_class: product.item_class || '',
      name: product.name || '',
      description: product.description || '',
      price: Number(product.price || 0),
      stock: Number(product.stock || 0),
      max_order_qty: Number(product.max_order_qty || 1),
      order_unit: product.order_unit || 'pcs',
      image_url: product.image_url || '',
      is_active: !!product.is_active,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(emptyForm);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        category_id: form.category_id ? Number(form.category_id) : null,
      };

      if (editingId) {
        await apiFetch(`/products/${editingId}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
        setMessage('Produk berhasil diupdate');
      } else {
        await apiFetch('/products', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        setMessage('Produk berhasil dibuat');
      }

      setEditingId(null);
      setForm(emptyForm);
      loadProducts();
    } catch (err: any) {
      setMessage(err.message);
    }
  }

  async function handleRestock(id: number) {
    const qty = Number(window.prompt('Qty restock?', '1'));
    if (!qty) return;
    try {
      await apiFetch(`/products/${id}/restock`, {
        method: 'POST',
        body: JSON.stringify({ qty, note: 'Restock via admin panel' }),
      });
      setMessage('Restock berhasil');
      loadProducts();
    } catch (err: any) {
      setMessage(err.message);
    }
  }

  async function handleToggleActive(product: any) {
    try {
      await apiFetch(`/products/${product.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          ...product,
          gang: product.gang, 
          category_id: product.category_id,
          item_class: product.item_class,
          name: product.name,
          description: product.description,
          price: product.price,
          stock: product.stock,
          max_order_qty: product.max_order_qty,
          order_unit: product.order_unit,
          image_url: product.image_url,
          is_active: !product.is_active,
        }),
      });
      setMessage(`Produk ${!product.is_active ? 'diaktifkan' : 'dinonaktifkan'}`);
      loadProducts();
    } catch (err: any) {
      setMessage(err.message);
    }
  }

  return (
    <div className="mx-auto grid max-w-7xl gap-8 px-6 py-10 lg:grid-cols-[420px_1fr]">
      <form onSubmit={handleSubmit} className="card p-6 border-pink-900/30">
        <h2 className="text-2xl font-black uppercase text-white drop-shadow-[0_0_5px_rgba(240,98,146,0.3)]">{editingId ? 'Edit Product' : 'Add Product'}</h2>
        <div className="mt-6 space-y-4">
          
          {/* Dropdown Gang */}
          <select 
            className="input w-full" 
            value={form.gang} 
            onChange={(e) => setForm({ ...form, gang: e.target.value })}
            required
          >
            <option value="" disabled>-- Pilih Supply Gang --</option>
            <option value="4BLOODS">4BLOODS</option>
            <option value="HT">HIGH TABLE (HT)</option>
            <option value="BURGENK">BURGENK</option>
            <option value="HOMIES">PINK PANTHER (HOMIES)</option>
            <option value="BOA">BOA</option>
            <option value="Lainnya">Lainnya</option>
          </select>

          <input className="input" placeholder="Category ID (1 Weapon / 2 Ammo / 3 Vest / 4 Utility)" value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })} />
          <input className="input" placeholder="Item Class (optional)" value={form.item_class} onChange={(e) => setForm({ ...form, item_class: e.target.value })} />
          <input className="input" placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <textarea className="input min-h-28" placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <input className="input" type="number" placeholder="Price" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} />
          <input className="input" type="number" placeholder="Stock" value={form.stock} onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })} />
          <input className="input" type="number" placeholder="Max Order Qty" value={form.max_order_qty} onChange={(e) => setForm({ ...form, max_order_qty: Number(e.target.value) })} />
          <input className="input" placeholder="Order Unit (pcs / pax)" value={form.order_unit} onChange={(e) => setForm({ ...form, order_unit: e.target.value })} />
          <input className="input" placeholder="Image URL" value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} />
          <label className="flex items-center gap-3 text-sm text-zinc-300">
            <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="accent-[#F06292]" />
            Active Product
          </label>
          <div className="flex gap-3">
            <button className="btn-primary flex-1">{editingId ? 'Update Product' : 'Save Product'}</button>
            {editingId && (
              <button type="button" onClick={cancelEdit} className="rounded-xl border border-zinc-700 px-4 py-2 font-semibold text-white hover:bg-zinc-800 transition-colors">
                Cancel
              </button>
            )}
          </div>
          {message && <div className="text-sm font-semibold text-[#F06292]">{message}</div>}
        </div>
      </form>

      <div className="card overflow-hidden border-pink-900/30">
        <div className="border-b border-zinc-800 px-6 py-4">
          <h2 className="text-2xl font-black uppercase text-white drop-shadow-[0_0_5px_rgba(240,98,146,0.3)]">Manage Products</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-zinc-800 bg-black/70">
            <thead>
              <tr className="text-left text-sm text-zinc-400">
                <th className="px-4 py-3">Gang</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Class</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Stock</th>
                <th className="px-4 py-3">Max Order</th>
                <th className="px-4 py-3">Active</th>
                <th className="px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="border-t border-zinc-800 text-sm hover:bg-zinc-900/40 transition-colors">
                  <td className="px-4 py-3 font-semibold text-[#F06292]">{product.gang || '-'}</td>
                  <td className="px-4 py-3 text-white">{product.name}</td>
                  <td className="px-4 py-3 text-zinc-300">{product.item_class || '-'}</td>
                  <td className="px-4 py-3 text-[#F06292] font-medium">${Number(product.price).toLocaleString('en-US')}</td>
                  <td className="px-4 py-3 text-white">{product.stock}</td>
                  <td className="px-4 py-3 text-zinc-300">{product.max_order_qty} {product.order_unit || 'pcs'}</td>
                  <td className="px-4 py-3">
                    {product.is_active ? (
                       <span className="text-green-400">Yes</span>
                    ) : (
                       <span className="text-red-400">No</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <button onClick={() => handleRestock(product.id)} className="rounded-lg border border-[#F06292]/40 px-3 py-1 text-[#F06292] hover:bg-[#F06292]/10 transition-colors">
                        Restock
                      </button>
                      <button onClick={() => startEdit(product)} className="rounded-lg border border-zinc-600 px-3 py-1 text-zinc-200 hover:bg-zinc-800 transition-colors">
                        Edit
                      </button>
                      <button onClick={() => handleToggleActive(product)} className="rounded-lg border border-red-500/40 px-3 py-1 text-red-400 hover:bg-red-500/10 transition-colors">
                        {product.is_active ? 'Disable' : 'Enable'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}