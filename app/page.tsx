'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import { getUser } from '@/lib/auth';

export default function HomePage() {
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    setMounted(true);
    setUser(getUser());
  }, []);

  return (
    <main className="min-h-screen">
      <Navbar />
      <section className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-6 py-16 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
        <div>
          <div className="mb-6 inline-flex rounded-full border border-pink-500/30 bg-pink-500/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-[#F06292]">
            Pink Panther Marketplace
          </div>

          <h1 className="text-5xl font-black uppercase leading-tight text-white md:text-6xl drop-shadow-[0_0_10px_rgba(240,98,146,0.3)]">
            Order & Marketplace System
          </h1>

          <p className="mt-4 max-w-2xl text-lg text-zinc-300">
            Jika ingin melakukan order, silakan register dan login terlebih dahulu. Setelah itu, Anda bisa memilih produk yang dibutuhkan dan membuat pesanan dengan lebih mudah, cepat, dan nyaman.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            {!mounted ? (
              <>
                <Link href="/login" className="btn-primary">
                  Login to Browse Products
                </Link>
                <Link href="/register" className="rounded-xl border border-zinc-700 px-4 py-2 font-semibold text-white hover:border-[#F06292] hover:text-[#F06292] transition-colors">
                  Sign Up
                </Link>
              </>
            ) : (
              <>
                {user ? (
                  <Link href="/products" className="btn-primary">
                    Browse Products
                  </Link>
                ) : (
                  <Link href="/login" className="btn-primary">
                    Login to Browse Products
                  </Link>
                )}
                {!user && (
                  <Link href="/register" className="rounded-xl border border-zinc-700 px-4 py-2 font-semibold text-white hover:border-[#F06292] hover:text-[#F06292] transition-colors">
                    Sign Up
                  </Link>
                )}
              </>
            )}
          </div>

          <div className="mt-10 card p-5 border-pink-900/30">
            <h2 className="text-xl font-bold text-[#F06292]">How It Works</h2>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <div className="rounded-2xl border border-zinc-800 bg-black/40 p-4 hover:border-[#F06292]/50 transition-colors">
                <div className="text-sm text-pink-400">Step 1</div>
                <div className="mt-1 font-semibold text-white">Register / Login</div>
              </div>
              <div className="rounded-2xl border border-zinc-800 bg-black/40 p-4 hover:border-[#F06292]/50 transition-colors">
                <div className="text-sm text-pink-400">Step 2</div>
                <div className="mt-1 font-semibold text-white">Pilih barang dan buat order</div>
              </div>
              <div className="rounded-2xl border border-zinc-800 bg-black/40 p-4 hover:border-[#F06292]/50 transition-colors">
                <div className="text-sm text-pink-400">Step 3</div>
                <div className="mt-1 font-semibold text-white">Pembayaran dilakukan di dalam game</div>
              </div>
              <div className="rounded-2xl border border-zinc-800 bg-black/40 p-4 hover:border-[#F06292]/50 transition-colors">
                <div className="text-sm text-pink-400">Step 4</div>
                <div className="mt-1 font-semibold text-white">Cek status order secara berkala</div>
              </div>
            </div>
          </div>
        </div>

        <div className="card p-6 border-pink-900/30">
          <div className="rounded-[28px] border border-pink-900/50 bg-black/70 p-6 shadow-[0_0_30px_rgba(240,98,146,0.15)] flex justify-center items-center">
            {/* Mengganti logo raksasa menjadi logo Pink Panther */}
            <img src="/logo-pp.png" alt="Pink Panther Logo" className="h-auto w-full max-w-sm drop-shadow-[0_0_15px_rgba(240,98,146,0.5)]" />
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4">
            <Link href="/login" className="rounded-2xl border border-zinc-700 px-4 py-4 text-center text-lg font-semibold text-white hover:border-[#F06292] hover:text-[#F06292] transition-colors">
              Sign In
            </Link>
            <Link href="/register" className="btn-primary flex items-center justify-center text-lg py-4">
              Sign Up
            </Link>
          </div>

          <div className="mt-6 rounded-2xl border border-pink-900/30 bg-black/50 p-5">
            <h3 className="text-lg font-bold text-[#F06292]">Supply Notes</h3>
            <ul className="mt-3 space-y-2 text-sm text-zinc-300">
              <li>- Harga sudah include 30% tax</li>
              <li>- Need 200 Metal Scrap per order</li>
              <li>- Setiap item punya limit max order masing-masing</li>
              <li>- Status order bisa dipantau setelah login</li>
            </ul>
          </div>
        </div>
      </section>
    </main>
  );
}