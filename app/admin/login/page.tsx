'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [pw, setPw] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: pw }),
    });
    if (res.ok) {
      router.push('/admin/articles');
    } else {
      const d = await res.json();
      setError(d.error);
    }
    setLoading(false);
  }

  return (
    <div className="min-h-full flex items-center justify-center" style={{ background: 'var(--bg)' }}>
      <div className="w-full max-w-sm px-8 py-10 rounded-lg" style={{ background: 'var(--bg-sidebar)', border: '1px solid var(--border)' }}>
        <p className="text-xs tracking-[0.3em] mb-6 text-center" style={{ color: 'var(--accent)', fontFamily: 'Cormorant Garamond, serif' }}>
          不思議な空間をまとめているブログ 管理画面
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            placeholder="パスワード"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            required
            className="w-full px-4 py-3 text-sm rounded outline-none"
            style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)', fontFamily: 'Noto Serif JP, serif' }}
          />
          {error && <p className="text-xs text-red-500">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 text-sm tracking-widest rounded disabled:opacity-40"
            style={{ background: 'var(--accent)', color: '#FAF7F2', fontFamily: 'Cormorant Garamond, serif', border: 'none', cursor: 'pointer' }}
          >
            {loading ? 'ログイン中...' : 'ログイン'}
          </button>
        </form>
      </div>
    </div>
  );
}
