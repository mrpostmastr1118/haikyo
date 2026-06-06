'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { PREFECTURES, COUNTRIES } from '@/lib/regions';

const field = "w-full px-3 py-2.5 text-sm rounded border border-gray-200 bg-white outline-none focus:border-amber-500";
const label = "block text-xs font-medium text-gray-600 mb-1";

export default function NewArticlePage() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    name: '',
    location_label: '',
    region_type: 'prefecture' as 'prefecture' | 'country',
    region_key: '東京都',
    region_label: '東京都',
    lat: '',
    lng: '',
    year_abandoned: '',
    excerpt: '',
    body: '',
    tags: '',
    published: true,
  });

  const [previews, setPreviews] = useState<{ file: File; url: string }[]>([]);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

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
      set('region_key', value);
      set('region_label', value);
    } else {
      const country = COUNTRIES.find((c) => c.code === value);
      set('region_key', value);
      set('region_label', country?.label ?? value);
    }
  }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    const newPreviews = files.map((f) => ({ file: f, url: URL.createObjectURL(f) }));
    setPreviews((prev) => [...prev, ...newPreviews]);
  }

  function removeImage(index: number) {
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (previews.length === 0) { setError('写真を1枚以上追加してください'); return; }
    setError('');
    setUploading(true);

    // Upload photos
    const urls: string[] = [];
    for (const { file } of previews) {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/admin/upload', { method: 'POST', body: fd });
      if (!res.ok) { setError('写真のアップロードに失敗しました'); setUploading(false); return; }
      const { url } = await res.json();
      urls.push(url);
    }

    setUploading(false);
    setSaving(true);

    const payload = {
      name: form.name,
      location_label: form.location_label,
      region_key: form.region_key,
      region_type: form.region_type,
      region_label: form.region_label,
      lat: form.lat ? parseFloat(form.lat) : 0,
      lng: form.lng ? parseFloat(form.lng) : 0,
      year_abandoned: form.year_abandoned ? parseInt(form.year_abandoned) : null,
      excerpt: form.excerpt,
      body: form.body,
      tags: form.tags.split(/[,、]/).map((t) => t.trim()).filter(Boolean),
      images: urls,
      published: form.published,
    };

    const res = await fetch('/api/admin/spots', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    setSaving(false);

    if (res.ok) {
      router.push('/admin/articles');
    } else {
      const d = await res.json();
      setError(d.error ?? '保存に失敗しました');
    }
  }

  const isLoading = uploading || saving;

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-lg font-semibold text-gray-800 mb-6">新規記事を作成</h1>

      <form onSubmit={handleSubmit} className="space-y-5 bg-white rounded-lg border border-gray-200 p-6">

        {/* 写真アップロード */}
        <div>
          <label className={label}>写真（複数可）</label>
          <div
            onClick={() => fileRef.current?.click()}
            className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center cursor-pointer hover:border-amber-400 transition-colors"
          >
            <p className="text-sm text-gray-400">クリックして写真を選択</p>
            <p className="text-xs text-gray-300 mt-1">JPG / PNG / WEBP</p>
          </div>
          <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={onFileChange} />

          {previews.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {previews.map((p, i) => (
                <div key={i} className="relative">
                  <img src={p.url} className="w-20 h-16 object-cover rounded" />
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center leading-none"
                  >
                    ×
                  </button>
                  {i === 0 && <span className="absolute bottom-0 left-0 right-0 text-center text-white text-xs bg-black/40 rounded-b">メイン</span>}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 基本情報 */}
        <div>
          <label className={label}>場所名・記事タイトル <span className="text-red-400">*</span></label>
          <input required className={field} value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="例：時の孤島、軍艦島" />
        </div>

        <div>
          <label className={label}>場所の説明 <span className="text-red-400">*</span></label>
          <input required className={field} value={form.location_label} onChange={(e) => set('location_label', e.target.value)} placeholder="例：長崎県 / 日本" />
        </div>

        {/* 地域選択 */}
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

        {/* 緯度経度 */}
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
        <p className="text-xs text-gray-400 -mt-3">
          <a href="https://maps.google.com" target="_blank" rel="noopener noreferrer" className="text-amber-600 underline">Googleマップ</a>で場所を右クリック → 緯度経度をコピー（省略可）
        </p>

        {/* 廃墟化年 */}
        <div>
          <label className={label}>廃墟化した年（わかれば）</label>
          <input type="number" className={field} value={form.year_abandoned} onChange={(e) => set('year_abandoned', e.target.value)} placeholder="1974" />
        </div>

        {/* 抜粋 */}
        <div>
          <label className={label}>抜粋・リード文 <span className="text-red-400">*</span></label>
          <textarea required rows={2} className={field} value={form.excerpt} onChange={(e) => set('excerpt', e.target.value)} placeholder="一言で表す魅力的な説明（カード表示・OGPに使われます）" />
        </div>

        {/* 本文 */}
        <div>
          <label className={label}>本文 <span className="text-red-400">*</span></label>
          <textarea required rows={8} className={field} value={form.body} onChange={(e) => set('body', e.target.value)} placeholder="記事の本文。空行で段落を区切ってください。" />
        </div>

        {/* タグ */}
        <div>
          <label className={label}>タグ（カンマ区切り）</label>
          <input className={field} value={form.tags} onChange={(e) => set('tags', e.target.value)} placeholder="廃工場, 苔, 近代遺構" />
        </div>

        {/* 公開設定 */}
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={form.published} onChange={(e) => set('published', e.target.checked)} />
          <span className="text-sm text-gray-600">すぐに公開する</span>
        </label>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 text-sm font-medium rounded disabled:opacity-40"
          style={{ background: '#92400e', color: 'white', border: 'none', cursor: isLoading ? 'not-allowed' : 'pointer' }}
        >
          {uploading ? '写真をアップロード中...' : saving ? '保存中...' : '保存して公開'}
        </button>
      </form>
    </div>
  );
}
