'use client';

import dynamic from 'next/dynamic';
import { useRef, useState } from 'react';
import ArticleList, { ArticleListHandle } from '@/components/ArticleList';

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

export default function Home() {
  const [activeRegion, setActiveRegion] = useState<string | null>(null);
  const [mobileTab, setMobileTab] = useState<'map' | 'list'>('list');
  const listRef = useRef<ArticleListHandle>(null);

  function handleRegionClick(regionKey: string) {
    setActiveRegion(regionKey);
    setMobileTab('list');
    setTimeout(() => listRef.current?.scrollToRegion(regionKey), 50);
  }

  return (
    <div className="flex flex-col h-full">
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

      {/* Content area — single MapView + single ArticleList, CSS controls layout */}
      <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden">
        {/* Map panel */}
        <div
          className={`relative min-w-0 md:flex-1 ${mobileTab === 'map' ? 'flex-1' : 'hidden md:block'}`}
        >
          <MapView activeRegion={activeRegion} onRegionClick={handleRegionClick} />
        </div>

        {/* Article list panel */}
        <div
          className={`md:w-[390px] md:shrink-0 ${mobileTab === 'list' ? 'flex-1 overflow-hidden' : 'hidden md:block'}`}
          style={{ borderLeft: '1px solid var(--border)' }}
        >
          <ArticleList ref={listRef} activeRegion={activeRegion} onRegionClick={handleRegionClick} />
        </div>
      </div>
    </div>
  );
}
