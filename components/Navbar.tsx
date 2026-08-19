'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getUser, logout } from '@/lib/auth';

export default function Navbar() {
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    setMounted(true);
    setUser(getUser());
  }, []);

  function handleLogout() {
    logout();
  }

  return (
    <div className="border-b border-zinc-800 bg-black/70 backdrop-blur sticky top-0 z-50">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        
        {/* LOGO & NAMA PINK PANTHER (SHADE 300) */}
        <Link href="/" className="flex items-center gap-3">
          <img 
            src="/logo-pp.png" 
            alt="Pink Panther Logo" 
            className="h-12 w-auto drop-shadow-[0_0_8px_rgba(240,98,146,0.8)]" 
          />
          <span className="text-xl font-black uppercase tracking-widest text-[#F06292] drop-shadow-[0_0_5px_rgba(240,98,146,0.5)]">
            PINK PANTHER
          </span>
        </Link>

        <div className="flex items-center gap-4 text-sm text-zinc-300">
          {!mounted ? (
            <>
              <Link href="/login" className="rounded-xl border border-zinc-700 px-4 py-2 font-semibold text-white transition-colors hover:border-[#F06292] hover:text-[#F06292]">
                Login
              </Link>
              <Link href="/register" className="btn-primary">
                Register
              </Link>
            </>
          ) : (
            <>
              {/* MENU LINKS DENGAN EFEK HOVER PINK 300 */}
              {user && <Link href="/products" className="transition-colors hover:text-[#F06292]">Products</Link>}
              {user && <Link href="/orders" className="transition-colors hover:text-[#F06292]">My Orders</Link>}
              {(user?.role === 'admin' || user?.role === 'staff') && (
                <>
                  <Link href="/admin/products" className="transition-colors hover:text-[#F06292]">Admin Products</Link>
                  <Link href="/admin/orders" className="transition-colors hover:text-[#F06292]">Admin Orders</Link>
                  <Link href="/admin/users" className="transition-colors hover:text-[#F06292]">Admin Users</Link>
                </>
              )}

              {user ? (
                <button onClick={handleLogout} className="btn-primary">
                  Logout
                </button>
              ) : (
                <>
                  <Link href="/login" className="rounded-xl border border-zinc-700 px-4 py-2 font-semibold text-white transition-colors hover:border-[#F06292] hover:text-[#F06292]">
                    Login
                  </Link>
                  <Link href="/register" className="btn-primary">
                    Register
                  </Link>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}