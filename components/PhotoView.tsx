'use client';

import { useState, useMemo } from 'react';
import { Spot } from '@/lib/spots';
import PhotoModal from '@/components/PhotoModal';

interface PhotoItem {
  url: string;
  spot: Spot;
}

interface Props {
  allSpots: Spot[];
}

export default function PhotoView({ allSpots }: Props) {
  const [filterRegion, setFilterRegion] = useState<string | null>(null);
  const [selected, setSelected] = useState<PhotoItem | null>(null);

  const allPhotos = useMemo<PhotoItem[]>(() => {
    const src = filterRegion
      ? allSpots.filter((s) => s.regionLabel === filterRegion)
      : allSpots;
    return src.flatMap((spot) =>
      spot.images.map((url) => ({ url, spot }))
    );
  }, [allSpots, filterRegion]);

  const regions = useMemo(() => {
    const set = new Set(allSpots.map((s) => s.regionLabel));
    return Array.from(set);
  }, [allSpots]);

  return (
    <div className="h-full flex flex-col" style={{ background: 'var(--bg)' }}>
      {/* 地域フィルター */}
      <div
        className="shrink-0 flex items-center gap-2 px-4 py-2 overflow-x-auto"
        style={{ borderBottom: '1px solid var(--border)', scrollbarWidth: 'none' }}
      >
        <button
          onClick={() => setFilterRegion(null)}
          className="shrink-0 text-xs px-3 py-1.5 rounded-full transition-all"
          style={{
            background: filterRegion === null ? 'var(--accent)' : 'var(--border)',
            color: filterRegion === null ? '#FAF7F2' : 'var(--text-muted)',
            fontFamily: 'Noto Serif JP, serif', fontWeight: 300,
          }}
        >
          すべて
        </button>
        {regions.map((r) => (
          <button
            key={r}
            onClick={() => setFilterRegion(filterRegion === r ? null : r)}
            className="shrink-0 text-xs px-3 py-1.5 rounded-full transition-all"
            style={{
              background: filterRegion === r ? 'var(--accent)' : 'var(--border)',
              color: filterRegion === r ? '#FAF7F2' : 'var(--text-muted)',
              fontFamily: 'Noto Serif JP, serif', fontWeight: 300,
            }}
          >
            {r}
          </button>
        ))}
      </div>

      {/* 写真グリッド */}
      <div className="flex-1 overflow-y-auto">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2px' }}>
          {allPhotos.map((item, i) => (
            <button
              key={`${item.spot.id}-${i}`}
              onClick={() => setSelected(item)}
              className="block relative overflow-hidden group"
              style={{ aspectRatio: '1/1', padding: 0, border: 'none', cursor: 'pointer' }}
            >
              <img
                src={item.url}
                alt={item.spot.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                style={{ filter: 'sepia(10%) saturate(88%)' }}
              />
              {/* ホバーオーバーレイ */}
              <div
                className="absolute inset-0 flex flex-col justify-end p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                style={{ background: 'linear-gradient(to top, rgba(44,36,23,0.7) 0%, transparent 60%)' }}
              >
                <p className="text-white text-xs leading-snug text-left" style={{ fontFamily: 'Noto Serif JP, serif', fontWeight: 300 }}>
                  {item.spot.name}
                </p>
              </div>
            </button>
          ))}
        </div>

        {allPhotos.length === 0 && (
          <div className="flex items-center justify-center h-48">
            <p className="text-sm" style={{ color: 'var(--text-muted)', fontFamily: 'Noto Serif JP, serif', fontWeight: 300 }}>
              写真がありません
            </p>
          </div>
        )}
      </div>

      {/* 件数 */}
      <div className="shrink-0 text-center py-2" style={{ borderTop: '1px solid var(--border)' }}>
        <p className="text-xs" style={{ color: 'var(--text-muted)', fontFamily: 'Cormorant Garamond, serif' }}>
          {allPhotos.length} 枚の写真
        </p>
      </div>

      {/* プレビューモーダル */}
      {selected && (
        <PhotoModal
          spot={selected.spot}
          initialImageUrl={selected.url}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}
