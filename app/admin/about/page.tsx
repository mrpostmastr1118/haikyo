'use client';

import { useState, useEffect } from 'react';
import BlockEditor, { Block } from '@/components/BlockEditor';

export default function AdminAboutPage() {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch('/api/admin/settings?key=about')
      .then((r) => r.json())
      .then(({ value }) => {
        setBlocks(Array.isArray(value) && value.length > 0 ? value : [{ type: 'text', content: '' }]);
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleSave() {
    setSaving(true);
    const res = await fetch('/api/admin/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key: 'about', value: blocks }),
    });
    setSaving(false);
    if (res.ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    }
  }

  if (loading) return <div className="text-sm text-gray-400 p-4">読み込み中...</div>;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-lg font-semibold text-gray-800">About ページを編集</h1>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-5 py-2 text-sm font-medium rounded disabled:opacity-40 transition-colors"
          style={{ background: '#92400e', color: 'white', border: 'none', cursor: saving ? 'not-allowed' : 'pointer' }}
        >
          {saving ? '保存中...' : saved ? '✓ 保存しました' : '保存'}
        </button>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <p className="text-xs text-gray-400 mb-4">
          テキストと画像を自由に組み合わせて編集できます。サイトの「About」ページに反映されます。
        </p>
        <BlockEditor blocks={blocks} onChange={setBlocks} />
      </div>
    </div>
  );
}
