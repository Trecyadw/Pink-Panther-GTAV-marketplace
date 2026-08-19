'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import ProductCard from '@/components/ProductCard';
import { apiFetch } from '@/lib/api';
import { getUser } from '@/lib/auth';

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [message, setMessage] = useState('');
  const router = useRouter();

  useEffect(() => {
    const user = getUser();
    if (!user) {
      router.replace('/login');
      return;
    }
    apiFetch('/products').then(setProducts).catch((e) => setMessage(e.message));
  }, [router]);

  async function handleOrder(productId: number) {
    const user = getUser();
    if (!user) {
      router.push('/login');
      return;
    }

    try {
      const qtyStr = window.prompt('Masukkan qty sesuai max order produk:', '1');
      if (!qtyStr) return;
      const qty = Number(qtyStr);

      await apiFetch('/orders', {
        method: 'POST',
        body: JSON.stringify({
          items: [{ product_id: productId, qty }],
          notes: 'Order from web - Include 30% tax / Need 200 Metal Scrap per order',
        }),
      });
      setMessage('Order berhasil dibuat');
    } catch (err: any) {
      setMessage(err.message);
    }
  }

  // LOGIKA PENGELOMPOKKAN PRODUK BERDASARKAN GANG
  const groupedProducts = products.reduce((acc: Record<string, any[]>, product: any) => {
    // Gunakan property gang dari database, jika tidak ada/kosong, masuk ke 'Lainnya'
    const gangName = product.gang || 'Lainnya';
    
    if (!acc[gangName]) {
      acc[gangName] = [];
    }
    acc[gangName].push(product);
    return acc;
  }, {});

  return (
    <main className="min-h-screen pb-20">
      <Navbar />
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h1 className="text-4xl font-black uppercase text-white drop-shadow-[0_0_10px_rgba(240,98,146,0.3)]">Products</h1>
            <p className="mt-2 text-zinc-300">
              Pilih produk dan buat order. Harga sudah include 30% tax dan tiap order membutuhkan 200 Metal Scrap.
            </p>
          </div>
        </div>

        <div className="mb-10 card p-4 text-sm text-zinc-300 border-pink-900/30">
          <div className="font-semibold text-[#F06292]">Supply Notes</div>
          <div className="mt-2">- Harga pada list produk sudah include 30% Tax</div>
          <div>- Need 200 Metal Scrap per order</div>
          <div>- Tiap produk memiliki batas max order masing-masing</div>
        </div>

        {message && <div className="mb-8 text-sm font-semibold text-[#F06292]">{message}</div>}

        {/* RENDER GROUPED PRODUCTS (SLIDER) */}
        <div className="space-y-12">
          {Object.entries(groupedProducts).map(([gang, gangProducts]) => (
            <div key={gang} className="rounded-2xl border border-zinc-800 bg-black/40 p-6 hover:border-[#F06292]/30 transition-colors">
              
              {/* HEADER GANG & TOMBOL LIHAT SEMUA */}
              <div className="mb-6 flex items-end justify-between border-b border-zinc-800 pb-4">
                <h2 className="text-2xl font-black uppercase tracking-wider text-[#F06292] drop-shadow-[0_0_5px_rgba(240,98,146,0.5)]">
                  {gang}
                </h2>
                <Link 
                  href={`/products?gang=${gang}`} 
                  className="text-sm font-semibold text-zinc-400 transition-colors hover:text-[#F06292]"
                >
                  Lihat Semua &rarr;
                </Link>
              </div>

              {/* CONTAINER SLIDER HORIZONTAL */}
              <div className="flex snap-x snap-mandatory gap-6 overflow-x-auto pb-4 [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-zinc-700 [&::-webkit-scrollbar-track]:bg-zinc-900 hover:[&::-webkit-scrollbar-thumb]:bg-[#F06292]/50">
                {(gangProducts as any[]).map((product: any) => (
                  <div key={product.id} className="min-w-[280px] shrink-0 snap-start md:min-w-[320px]">
                    <ProductCard product={product} onOrder={handleOrder} />
                  </div>
                ))}
              </div>

            </div>
          ))}

          {/* Jika belum ada produk sama sekali */}
          {products.length === 0 && !message && (
            <div className="text-center text-zinc-500 mt-10">Belum ada produk yang tersedia.</div>
          )}
        </div>
      </div>
    </main>
  );
}