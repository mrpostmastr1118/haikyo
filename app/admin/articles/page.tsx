'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { DbSpot } from '@/lib/supabase';

export default function AdminArticlesPage() {
  const [spots, setSpots] = useState<DbSpot[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    const res = await fetch('/api/admin/spots');
    if (res.ok) setSpots(await res.json());
    setLoading(false);
  }

  async function deleteSpot(id: string) {
    if (!confirm('削除しますか？')) return;
    await fetch('/api/admin/spots', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
    setSpots((prev) => prev.filter((s) => s.id !== id));
  }

  useEffect(() => { load(); }, []);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-lg font-semibold text-gray-800">記事一覧</h1>
        <Link href="/admin/articles/new" className="text-sm bg-amber-700 text-white px-4 py-2 rounded hover:bg-amber-800">
          ＋ 新規記事
        </Link>
      </div>

      {loading ? (
        <p className="text-sm text-gray-400">読み込み中...</p>
      ) : spots.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="mb-4">まだ記事がありません</p>
          <Link href="/admin/articles/new" className="text-amber-700 underline text-sm">最初の記事を追加する</Link>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {spots.map((spot, i) => (
            <div key={spot.id} className={`flex items-center gap-4 px-5 py-4 ${i > 0 ? 'border-t border-gray-100' : ''}`}>
              {spot.images[0] && (
                <img src={spot.images[0]} alt="" className="w-14 h-10 object-cover rounded shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">{spot.name}</p>
                <p className="text-xs text-gray-400">{spot.location_label}</p>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${spot.published ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                {spot.published ? '公開中' : '非公開'}
              </span>
              <Link href={`/admin/articles/${spot.id}/edit`} className="text-xs text-amber-600 hover:text-amber-800 shrink-0">
                編集
              </Link>
              <button
                onClick={() => deleteSpot(spot.id)}
                className="text-xs text-red-400 hover:text-red-600 shrink-0"
              >
                削除
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
