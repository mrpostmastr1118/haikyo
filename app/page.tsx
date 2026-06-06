'use client';

import dynamic from 'next/dynamic';
import { useRef, useState, useEffect } from 'react';
import ArticleList, { ArticleListHandle } from '@/components/ArticleList';
import BlogView from '@/components/BlogView';
import { SPOTS, dbSpotToSpot, getArticleRegionKeys, type Spot } from '@/lib/spots';
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

type ViewMode = 'map' | 'blog';
type MobileTab = 'map' | 'list';

const VIEW_TOGGLE: { mode: ViewMode; label: string; icon: string }[] = [
  { mode: 'map',  label: '地図', icon: '🗺' },
  { mode: 'blog', label: 'ブログ', icon: '☰' },
];

export default function Home() {
  const [viewMode, setViewMode] = useState<ViewMode>('map');
  const [activeRegion, setActiveRegion] = useState<string | null>(null);
  const [mobileTab, setMobileTab] = useState<MobileTab>('list');
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

  function handleRegionClick(regionKey: string) {
    setActiveRegion(regionKey);
    setMobileTab('list');
    setTimeout(() => listRef.current?.scrollToRegion(regionKey), 50);
  }

  return (
    <div className="flex flex-col h-full">
      {/* View toggle bar */}
      <div
        className="shrink-0 flex items-center justify-between px-4 md:px-6 py-2"
        style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-sidebar)' }}
      >
        {/* Desktop: view switcher (pill) */}
        <div
          className="flex rounded-full p-0.5"
          style={{ background: 'var(--border)' }}
        >
          {VIEW_TOGGLE.map(({ mode, label, icon }) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
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

      {/* Map view */}
      {viewMode === 'map' && (
        <>
          {/* Mobile tab bar */}
          <div
            className="md:hidden flex shrink-0 text-xs"
            style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-sidebar)' }}
          >
            {(['map', 'list'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setMobileTab(tab)}
                className="flex-1 py-3 tracking-widest transition-colors"
                style={{
                  color: mobileTab === tab ? 'var(--accent)' : 'var(--text-muted)',
                  fontFamily: 'Cormorant Garamond, serif',
                  borderBottom: mobileTab === tab ? '2px solid var(--accent)' : '2px solid transparent',
                }}
              >
                {tab === 'map' ? '地　図' : '記　事'}
              </button>
            ))}
          </div>

          <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden">
            <div className={`relative min-w-0 md:flex-1 ${mobileTab === 'map' ? 'flex-1' : 'hidden md:block'}`}>
              <MapView activeRegion={activeRegion} onRegionClick={handleRegionClick} regionKeys={regionKeys} />
            </div>
            <div
              className={`md:w-[390px] md:shrink-0 ${mobileTab === 'list' ? 'flex-1 overflow-hidden' : 'hidden md:block'}`}
              style={{ borderLeft: '1px solid var(--border)' }}
            >
              <ArticleList ref={listRef} activeRegion={activeRegion} onRegionClick={handleRegionClick} allSpots={allSpots} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
