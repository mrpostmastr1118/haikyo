'use client';

import dynamic from 'next/dynamic';
import { useRef, useState, useEffect, useMemo } from 'react';
import ArticleList, { ArticleListHandle } from '@/components/ArticleList';
import BlogView from '@/components/BlogView';
import PhotoView from '@/components/PhotoView';
import BottomSheet from '@/components/BottomSheet';
import { SPOTS, dbSpotToSpot, getArticleRegionKeys, getRegionGroups, type Spot } from '@/lib/spots';
import { supabase } from '@/lib/supabase';

const MapView = dynamic(() => import('@/components/MapView'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center" style={{ background: '#E8E2D8' }}>
      <p className="text-sm tracking-widest" style={{ color: '#8C7B68', fontFamily: 'Cormorant Garamond, serif' }}>
        地図を読み込んでいます...
      </p>
    </div>
  ),
});

type ViewMode = 'map' | 'blog' | 'photo';

const VIEW_TOGGLE: { mode: ViewMode; label: string; icon: string }[] = [
  { mode: 'map',   label: '地図', icon: '🗺' },
  { mode: 'blog',  label: 'ブログ', icon: '☰' },
  { mode: 'photo', label: '写真', icon: '◼' },
];

export default function Home() {
  const [viewMode, setViewMode] = useState<ViewMode>('map');
  const [activeRegion, setActiveRegion] = useState<string | null>(null);
  const [allSpots, setAllSpots] = useState<Spot[]>(SPOTS);
  const listRef = useRef<ArticleListHandle>(null);

  useEffect(() => {
    supabase
      .from('spots')
      .select('*')
      .eq('published', true)
      .then(({ data }) => {
        if (!data || data.length === 0) return;
        const dbSpots = data.map(dbSpotToSpot);
        const existingIds = new Set(SPOTS.map((s) => s.id));
        const newSpots = dbSpots.filter((s) => !existingIds.has(s.id));
        setAllSpots([...SPOTS, ...newSpots]);
      });
  }, []);

  const regionKeys = getArticleRegionKeys(allSpots);

  // モバイルのボトムシート用
  const bottomSheetSpots = useMemo(() => {
    if (!activeRegion) return [];
    return allSpots.filter((s) => s.regionKey === activeRegion);
  }, [activeRegion, allSpots]);

  const bottomSheetLabel = useMemo(() => {
    if (!activeRegion) return '';
    return allSpots.find((s) => s.regionKey === activeRegion)?.regionLabel ?? activeRegion;
  }, [activeRegion, allSpots]);

  // デスクトップ：地図クリック → 右パネルスクロール
  function handleRegionClickDesktop(regionKey: string) {
    setActiveRegion(regionKey);
    setTimeout(() => listRef.current?.scrollToRegion(regionKey), 50);
  }

  // モバイル：地図クリック → ボトムシート
  function handleRegionClickMobile(regionKey: string) {
    setActiveRegion(regionKey);
  }

  return (
    <div className="flex flex-col h-full">
      {/* View toggle bar */}
      <div
        className="shrink-0 flex items-center justify-between px-4 md:px-6 py-2"
        style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-sidebar)' }}
      >
        <div className="flex rounded-full p-0.5" style={{ background: 'var(--border)' }}>
          {VIEW_TOGGLE.map(({ mode, label, icon }) => (
            <button
              key={mode}
              onClick={() => { setViewMode(mode); setActiveRegion(null); }}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs transition-all"
              style={{
                background: viewMode === mode ? 'var(--bg-sidebar)' : 'transparent',
                color: viewMode === mode ? 'var(--accent)' : 'var(--text-muted)',
                fontFamily: 'Noto Serif JP, serif',
                fontWeight: viewMode === mode ? 400 : 300,
                boxShadow: viewMode === mode ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
              }}
            >
              <span>{icon}</span>
              <span>{label}</span>
            </button>
          ))}
        </div>
        <p className="text-xs hidden md:block" style={{ color: 'var(--text-muted)', fontFamily: 'Noto Serif JP, serif', fontWeight: 300 }}>
          {allSpots.length} 件の記録
        </p>
      </div>

      {/* Blog view */}
      {viewMode === 'blog' && (
        <div className="flex-1 overflow-hidden">
          <BlogView allSpots={allSpots} />
        </div>
      )}

      {/* Photo view */}
      {viewMode === 'photo' && (
        <div className="flex-1 overflow-hidden">
          <PhotoView allSpots={allSpots} />
        </div>
      )}

      {/* Map view */}
      {viewMode === 'map' && (
        <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden">

          {/* ── Mobile: map full screen + bottom sheet ── */}
          <div className="md:hidden flex-1 relative">
            <MapView
              activeRegion={activeRegion}
              onRegionClick={handleRegionClickMobile}
              regionKeys={regionKeys}
            />
            {activeRegion && bottomSheetSpots.length > 0 && (
              <BottomSheet
                spots={bottomSheetSpots}
                regionLabel={bottomSheetLabel}
                onClose={() => setActiveRegion(null)}
              />
            )}
          </div>

          {/* ── Desktop: map + sidebar ── */}
          <div className="hidden md:flex flex-1 overflow-hidden min-h-0">
            <div className="flex-1 relative min-w-0">
              <MapView
                activeRegion={activeRegion}
                onRegionClick={handleRegionClickDesktop}
                regionKeys={regionKeys}
              />
            </div>
            <div
              className="w-[390px] shrink-0"
              style={{ borderLeft: '1px solid var(--border)' }}
            >
              <ArticleList
                ref={listRef}
                activeRegion={activeRegion}
                onRegionClick={handleRegionClickDesktop}
                allSpots={allSpots}
              />
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
