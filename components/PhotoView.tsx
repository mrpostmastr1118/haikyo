'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Spot } from '@/lib/spots';

interface PhotoItem {
  url: string;
  spotId: string;
  spotName: string;
  locationLabel: string;
  regionLabel: string;
}

interface Props {
  allSpots: Spot[];
}

function PhotoCard({ item }: { item: PhotoItem }) {
  const [hovered, setHovered] = useState(false);

  return (
    <Link href={`/articles/${item.spotId}`} className="block relative overflow-hidden" style={{ aspectRatio: '1/1' }}>
      <img
        src={item.url}
        alt={item.spotName}
        className="w-full h-full object-cover transition-transform duration-500"
        style={{
          filter: 'sepia(10%) saturate(88%)',
          transform: hovered ? 'scale(1.06)' : 'scale(1)',
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      />
      {/* Hover overlay */}
      <div
        className="absolute inset-0 flex flex-col justify-end p-3 transition-opacity duration-300"
        style={{
          background: 'linear-gradient(to top, rgba(44,36,23,0.75) 0%, transparent 60%)',
          opacity: hovered ? 1 : 0,
        }}
      >
        <p className="text-white text-xs leading-snug font-light" style={{ fontFamily: 'Noto Serif JP, serif' }}>
          {item.spotName}
        </p>
        <p className="text-xs mt-0.5" style={{ color: 'rgba(250,247,242,0.7)', fontFamily: 'Cormorant Garamond, serif', fontSize: '0.65rem', letterSpacing: '0.05em' }}>
          {item.locationLabel}
        </p>
      </div>
    </Link>
  );
}

export default function PhotoView({ allSpots }: Props) {
  const [filterRegion, setFilterRegion] = useState<string | null>(null);

  // 全スポットの全写真をフラット化
  const allPhotos = useMemo<PhotoItem[]>(() => {
    const src = filterRegion
      ? allSpots.filter((s) => s.regionLabel === filterRegion)
      : allSpots;
    return src.flatMap((spot) =>
      spot.images.map((url) => ({
        url,
        spotId: spot.id,
        spotName: spot.name,
        locationLabel: spot.locationLabel,
        regionLabel: spot.regionLabel,
      }))
    );
  }, [allSpots, filterRegion]);

  // 地域一覧
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
          className="shrink-0 text-xs px-3 py-1 rounded-full transition-all"
          style={{
            background: filterRegion === null ? 'var(--accent)' : 'var(--border)',
            color: filterRegion === null ? '#FAF7F2' : 'var(--text-muted)',
            fontFamily: 'Noto Serif JP, serif',
            fontWeight: 300,
          }}
        >
          すべて
        </button>
        {regions.map((r) => (
          <button
            key={r}
            onClick={() => setFilterRegion(filterRegion === r ? null : r)}
            className="shrink-0 text-xs px-3 py-1 rounded-full transition-all"
            style={{
              background: filterRegion === r ? 'var(--accent)' : 'var(--border)',
              color: filterRegion === r ? '#FAF7F2' : 'var(--text-muted)',
              fontFamily: 'Noto Serif JP, serif',
              fontWeight: 300,
            }}
          >
            {r}
          </button>
        ))}
      </div>

      {/* 写真グリッド */}
      <div className="flex-1 overflow-y-auto">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '2px',
          }}
        >
          {allPhotos.map((item, i) => (
            <PhotoCard key={`${item.spotId}-${i}`} item={item} />
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
      <div
        className="shrink-0 text-center py-2"
        style={{ borderTop: '1px solid var(--border)' }}
      >
        <p className="text-xs" style={{ color: 'var(--text-muted)', fontFamily: 'Cormorant Garamond, serif' }}>
          {allPhotos.length} 枚の写真
        </p>
      </div>
    </div>
  );
}
