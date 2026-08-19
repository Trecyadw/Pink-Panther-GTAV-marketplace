'use client';

import { useEffect, useMemo, useState } from 'react';
import { apiFetch } from '@/lib/api';

type UserRow = {
  id: number;
  username: string;
  ic_name: string;
  role: 'member' | 'staff' | 'admin';
  is_active: number;
  created_at: string;
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [query, setQuery] = useState('');
  const [message, setMessage] = useState('');

  async function loadUsers() {
    const data = await apiFetch('/users/admin/all');
    setUsers(data);
  }

  useEffect(() => {
    loadUsers().catch((e) => setMessage(e.message));
  }, []);

  const filteredUsers = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (u) =>
        u.username.toLowerCase().includes(q) ||
        u.ic_name.toLowerCase().includes(q) ||
        u.role.toLowerCase().includes(q)
    );
  }, [users, query]);

  async function handleRoleChange(userId: number, currentRole: string) {
    const role = window.prompt('Role baru? member / staff / admin', currentRole);
    if (!role) return;

    try {
      await apiFetch(`/users/admin/${userId}/role`, {
        method: 'PATCH',
        body: JSON.stringify({ role }),
      });
      setMessage('Role user berhasil diupdate');
      loadUsers();
    } catch (err: any) {
      setMessage(err.message);
    }
  }

  async function handleToggleActive(userId: number) {
    try {
      await apiFetch(`/users/admin/${userId}/toggle-active`, {
        method: 'PATCH',
      });
      setMessage('Status user berhasil diupdate');
      loadUsers();
    } catch (err: any) {
      setMessage(err.message);
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-4xl font-black uppercase drop-shadow-[0_0_10px_rgba(240,98,146,0.3)]">Admin Users</h1>
          <p className="mt-2 text-zinc-300">
            Manage user, ubah role member/staff/admin, dan aktif/nonaktif akun.
          </p>
        </div>

        <input
          className="input max-w-sm"
          placeholder="Cari username / nama IC / role"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {message && <div className="mb-4 text-sm font-semibold text-[#F06292]">{message}</div>}

      <div className="table-wrap">
        <table className="min-w-full divide-y divide-zinc-800 bg-black/70">
          <thead>
            <tr className="text-left text-sm text-zinc-400">
              <th className="px-4 py-3">Username</th>
              <th className="px-4 py-3">Nama IC</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Created</th>
              <th className="px-4 py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user.id} className="border-t border-zinc-800 text-sm hover:bg-zinc-900/40 transition-colors">
                <td className="px-4 py-3 font-medium text-white">{user.username}</td>
                <td className="px-4 py-3 text-white">{user.ic_name}</td>
                <td className="px-4 py-3 uppercase text-[#F06292] font-semibold">{user.role}</td>
                <td className="px-4 py-3">
                  {user.is_active ? (
                    <span className="rounded-full border border-green-500/30 bg-green-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-green-300">
                      Active
                    </span>
                  ) : (
                    <span className="rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-red-300">
                      Inactive
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-white">{new Date(user.created_at).toLocaleString()}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => handleRoleChange(user.id, user.role)}
                      className="rounded-lg border border-[#F06292]/40 px-3 py-1 text-[#F06292] hover:bg-[#F06292]/10 transition-colors"
                    >
                      Change Role
                    </button>
                    <button
                      onClick={() => handleToggleActive(user.id)}
                      className="rounded-lg border border-zinc-600 px-3 py-1 text-zinc-200 hover:bg-zinc-800 transition-colors"
                    >
                      {user.is_active ? 'Disable' : 'Enable'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {!filteredUsers.length && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-zinc-400">
                  Tidak ada user yang cocok.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}