'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import { saveAuth } from '@/lib/auth';
import Navbar from '@/components/Navbar';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    try {
      const res = await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      });
      saveAuth(res.token, res.user);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message);
    }
  }

  return (
    <main className="min-h-screen">
      <Navbar />
      <div className="mx-auto flex max-w-md items-center px-6 py-20">
        <form onSubmit={handleSubmit} className="card w-full p-8">
          <h1 className="text-3xl font-black uppercase">Sign In</h1>
          <p className="mt-2 text-sm text-zinc-400">Field yang dipakai: username dan password</p>
          <div className="mt-6 space-y-4">
            <input className="input" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
            <input className="input" placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            {error && <div className="text-sm text-red-400">{error}</div>}
            <button className="btn-primary w-full">Login</button>
            <p className="text-sm text-zinc-400">
              Belum punya akun? <a href="/register" className="text-amber-400">Register</a>
            </p>
          </div>
        </form>
      </div>
    </main>
  );
}
