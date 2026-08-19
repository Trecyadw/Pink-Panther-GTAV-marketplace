'use client';

import Navbar from '@/components/Navbar';
import { getUser } from '@/lib/auth';

export default function DashboardPage() {
  const user = getUser();

  return (
    <main className="min-h-screen">
      <Navbar />
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="card p-8">
          <h1 className="text-3xl font-black uppercase">Welcome, {user?.ic_name || user?.username}</h1>
          <p className="mt-3 text-zinc-300">Role: {user?.role}</p>
          <p className="mt-1 text-zinc-400">Pembayaran order dilakukan di dalam game. Status order akan diupdate oleh admin atau staff.</p>
        </div>
      </div>
    </main>
  );
}
