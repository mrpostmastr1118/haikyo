'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { PREFECTURES, COUNTRIES } from '@/lib/regions';
import BlockEditor, { Block } from '@/components/BlockEditor';
import ImageDropZone from '@/components/ImageDropZone';

const field = "w-full px-3 py-2.5 text-sm rounded border border-gray-200 bg-white outline-none focus:border-amber-500";
const label = "block text-xs font-medium text-gray-600 mb-1";

type ImageItem = { type: 'existing'; url: string } | { type: 'new'; file: File; url: string };

export default function EditArticlePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    name: '', location_label: '',
    region_type: 'prefecture' as 'prefecture' | 'country',
    region_key: '東京都', region_label: '東京都',
    lat: '', lng: '', year_abandoned: '', excerpt: '', tags: '', published: true,
  });
  const [blocks, setBlocks] = useState<Block[]>([{ type: 'text', content: '' }]);
  const [images, setImages] = useState<ImageItem[]>([]);

  useEffect(() => {
    fetch(`/api/admin/spots?id=${id}`)
      .then((r) => r.json())
      .then((spot) => {
        setForm({
          name: spot.name,
          location_label: spot.location_label,
          region_type: spot.region_type,
          region_key: spot.region_key,
          region_label: spot.region_label,
          lat: spot.lat?.toString() ?? '',
          lng: spot.lng?.toString() ?? '',
          year_abandoned: spot.year_abandoned?.toString() ?? '',
          excerpt: spot.excerpt,
          tags: (spot.tags ?? []).join(', '),
          published: spot.published,
        });
        // 既存画像をセット
        setImages((spot.images ?? []).map((url: string) => ({ type: 'existing', url })));
        // body をブロックに変換
        try {
          const parsed = JSON.parse(spot.body);
          if (Array.isArray(parsed)) { setBlocks(parsed); return; }
        } catch {}
        setBlocks([{ type: 'text', content: spot.body ?? '' }]);
      })
      .finally(() => setLoading(false));
  }, [id]);

  function set(key: string, value: string | boolean) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function onRegionTypeChange(type: 'prefecture' | 'country') {
    const defaultKey = type === 'prefecture' ? '東京都' : 'USA';
    const defaultLabel = type === 'prefecture' ? '東京都' : 'アメリカ合衆国';
    setForm((prev) => ({ ...prev, region_type: type, region_key: defaultKey, region_label: defaultLabel }));
  }

  function onRegionChange(value: string) {
    if (form.region_type === 'prefecture') {
      set('region_key', value); set('region_label', value);
    } else {
      const country = COUNTRIES.find((c) => c.code === value);
      set('region_key', value); set('region_label', country?.label ?? value);
    }
  }

  function removeImage(index: number) {
    setImages((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setUploading(true);

    // 新規画像をアップロード
    const uploadedUrls: string[] = [];
    for (const img of images) {
      if (img.type === 'new') {
        const fd = new FormData();
        fd.append('file', img.file);
        const res = await fetch('/api/admin/upload', { method: 'POST', body: fd });
        const json = await res.json();
        if (!res.ok) { setError(`アップロード失敗: ${json.error}`); setUploading(false); return; }
        uploadedUrls.push(json.url);
      }
    }

    setUploading(false);
    setSaving(true);

    const allImageUrls = images.map((img) =>
      img.type === 'existing' ? img.url : uploadedUrls.shift()!
    );

    const payload = {
      id,
      name: form.name,
      location_label: form.location_label,
      region_key: form.region_key,
      region_type: form.region_type,
      region_label: form.region_label,
      lat: form.lat ? parseFloat(form.lat) : 0,
      lng: form.lng ? parseFloat(form.lng) : 0,
      year_abandoned: form.year_abandoned ? parseInt(form.year_abandoned) : null,
      excerpt: form.excerpt,
      body: JSON.stringify(blocks.filter((b) => b.type === 'image' || (b.type === 'text' && (b as {type:'text';content:string}).content.trim()))),
      tags: form.tags.split(/[,、]/).map((t) => t.trim()).filter(Boolean),
      images: allImageUrls,
      published: form.published,
    };

    const res = await fetch('/api/admin/spots', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    setSaving(false);
    if (res.ok) { router.push('/admin/articles'); }
    else { const d = await res.json(); setError(d.error ?? '保存失敗'); }
  }

  if (loading) return <div className="text-sm text-gray-400 p-6">読み込み中...</div>;

  const isLoading = uploading || saving;

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-lg font-semibold text-gray-800 mb-6">記事を編集</h1>

      <form onSubmit={handleSubmit} className="space-y-5 bg-white rounded-lg border border-gray-200 p-6">

        {/* 写真 */}
        <div>
          <label className={label}>写真</label>
          {images.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {images.map((img, i) => (
                <div key={i} className="relative">
                  <img src={img.url} className="w-20 h-16 object-cover rounded" />
                  <button type="button" onClick={() => removeImage(i)}
                    className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center">
                    ×
                  </button>
                  {i === 0 && <span className="absolute bottom-0 left-0 right-0 text-center text-white text-xs bg-black/40 rounded-b">メイン</span>}
                </div>
              ))}
            </div>
          )}
          <ImageDropZone multiple onFiles={(files) => {
            const newImgs = files.map((f) => ({ type: 'new' as const, file: f, url: URL.createObjectURL(f) }));
            setImages((prev) => [...prev, ...newImgs]);
          }} label="写真を追加（クリックまたはD&D）" />
        </div>

        <div>
          <label className={label}>場所名・記事タイトル <span className="text-red-400">*</span></label>
          <input required className={field} value={form.name} onChange={(e) => set('name', e.target.value)} />
        </div>

        <div>
          <label className={label}>場所の説明 <span className="text-red-400">*</span></label>
          <input required className={field} value={form.location_label} onChange={(e) => set('location_label', e.target.value)} />
        </div>

        <div>
          <label className={label}>地域タイプ</label>
          <div className="flex gap-4 mb-2">
            {(['prefecture', 'country'] as const).map((t) => (
              <label key={t} className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                <input type="radio" checked={form.region_type === t} onChange={() => onRegionTypeChange(t)} />
                {t === 'prefecture' ? '日本（都道府県）' : '海外（国）'}
              </label>
            ))}
          </div>
          {form.region_type === 'prefecture' ? (
            <select className={field} value={form.region_key} onChange={(e) => onRegionChange(e.target.value)}>
              {PREFECTURES.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          ) : (
            <select className={field} value={form.region_key} onChange={(e) => onRegionChange(e.target.value)}>
              {COUNTRIES.map((c) => <option key={c.code} value={c.code}>{c.label}</option>)}
            </select>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={label}>緯度（任意）</label>
            <input type="number" step="any" className={field} value={form.lat} onChange={(e) => set('lat', e.target.value)} placeholder="35.6762" />
          </div>
          <div>
            <label className={label}>経度（任意）</label>
            <input type="number" step="any" className={field} value={form.lng} onChange={(e) => set('lng', e.target.value)} placeholder="139.6503" />
          </div>
        </div>

        <div>
          <label className={label}>廃墟化した年（任意）</label>
          <input type="number" className={field} value={form.year_abandoned} onChange={(e) => set('year_abandoned', e.target.value)} />
        </div>

        <div>
          <label className={label}>抜粋 <span className="text-red-400">*</span></label>
          <textarea required rows={2} className={field} value={form.excerpt} onChange={(e) => set('excerpt', e.target.value)} />
        </div>

        <div>
          <label className={label}>本文</label>
          <BlockEditor blocks={blocks} onChange={setBlocks} />
        </div>

        <div>
          <label className={label}>タグ（カンマ区切り）</label>
          <input className={field} value={form.tags} onChange={(e) => set('tags', e.target.value)} />
        </div>

        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={form.published} onChange={(e) => set('published', e.target.checked)} />
          <span className="text-sm text-gray-600">公開する</span>
        </label>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <div className="flex gap-3">
          <button type="button" onClick={() => router.push('/admin/articles')}
            className="flex-1 py-3 text-sm rounded border border-gray-200 text-gray-500 hover:bg-gray-50">
            キャンセル
          </button>
          <button type="submit" disabled={isLoading}
            className="flex-1 py-3 text-sm font-medium rounded disabled:opacity-40"
            style={{ background: '#92400e', color: 'white', border: 'none', cursor: isLoading ? 'not-allowed' : 'pointer' }}>
            {uploading ? '写真をアップロード中...' : saving ? '保存中...' : '更新して保存'}
          </button>
        </div>
      </form>
    </div>
  );
}
