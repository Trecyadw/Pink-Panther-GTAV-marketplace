'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiFetch } from '@/lib/api';
import Navbar from '@/components/Navbar';

export default function RegisterPage() {
  const [form, setForm] = useState({ username: '', password: '', ic_name: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage('');
    setError('');

    try {
      const res = await apiFetch('/auth/register', {
        method: 'POST',
        body: JSON.stringify(form),
      });
      setMessage(res.message || 'Register berhasil');
      setTimeout(() => router.push('/login'), 1000);
    } catch (err: any) {
      setError(err.message);
    }
  }

  return (
    <main className="min-h-screen">
      <Navbar />
      <div className="mx-auto flex max-w-md items-center px-6 py-20">
        <form onSubmit={handleSubmit} className="card w-full p-8 border-pink-900/30">
          <h1 className="text-3xl font-black uppercase text-white drop-shadow-[0_0_10px_rgba(240,98,146,0.3)]">Sign Up</h1>
          <p className="mt-2 text-sm text-zinc-400">Field yang dipakai: username, password, dan nama IC</p>
          <div className="mt-6 space-y-4">
            <input className="input" placeholder="Username" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
            <input className="input" placeholder="Password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
            <input className="input" placeholder="Nama IC" value={form.ic_name} onChange={(e) => setForm({ ...form, ic_name: e.target.value })} />
            {message && <div className="text-sm font-semibold text-[#F06292]">{message}</div>}
            {error && <div className="text-sm text-red-400">{error}</div>}
            <button className="btn-primary w-full">Register</button>
            <p className="text-sm text-zinc-400">
            Sudah punya akun? <Link href="/login" className="text-[#F06292] hover:underline">Login</Link>
            </p>
          </div>
        </form>
      </div>
    </main>
  );
}