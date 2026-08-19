'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { getUser } from '@/lib/auth';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const user = getUser();
    if (!user) {
      router.replace('/login');
      return;
    }
    if (user.role !== 'admin' && user.role !== 'staff') {
      router.replace('/dashboard');
      return;
    }
    setAllowed(true);
    setChecking(false);
  }, [router]);

  if (checking) {
    return (
      <main className="flex min-h-screen items-center justify-center text-white">
        <div className="text-zinc-400">Checking access...</div>
      </main>
    );
  }

  if (!allowed) return null;

  return (
    <main className="min-h-screen">
      <Navbar />
      {children}
    </main>
  );
}
