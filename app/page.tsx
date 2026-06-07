'use client';

import dynamic from 'next/dynamic';
import { useRef, useState, useEffect, useMemo } from 'react';
import ArticleList, { ArticleListHandle } from '@/components/ArticleList';
import BottomSheet from '@/components/BottomSheet';
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

export default function Home() {
  const [activeRegion, setActiveRegion] = useState<string | null>(null);
  const [allSpots, setAllSpots] = useState<Spot[]>(SPOTS);
  const listRef = useRef<ArticleListHandle>(null);

  useEffect(() => {
    supabase.from('spots').select('*').eq('published', true)
      .then(({ data }) => {
        if (!data?.length) return;
        const existingIds = new Set(SPOTS.map((s) => s.id));
        const newSpots = data.map(dbSpotToSpot).filter((s) => !existingIds.has(s.id));
        setAllSpots([...SPOTS, ...newSpots]);
      });
  }, []);

  const regionKeys = getArticleRegionKeys(allSpots);

  const bottomSheetSpots = useMemo(() =>
    activeRegion ? allSpots.filter((s) => s.regionKey === activeRegion) : [],
    [activeRegion, allSpots]
  );
  const bottomSheetLabel = useMemo(() =>
    allSpots.find((s) => s.regionKey === activeRegion)?.regionLabel ?? '',
    [activeRegion, allSpots]
  );

  function handleRegionClickDesktop(regionKey: string) {
    setActiveRegion(regionKey);
    setTimeout(() => listRef.current?.scrollToRegion(regionKey), 50);
  }

  return (
    <div className="flex flex-col h-full md:flex-row overflow-hidden">
      {/* Mobile: map full screen + bottom sheet */}
      <div className="md:hidden flex-1 relative">
        <MapView activeRegion={activeRegion} onRegionClick={setActiveRegion} regionKeys={regionKeys} />
        {activeRegion && bottomSheetSpots.length > 0 && (
          <BottomSheet spots={bottomSheetSpots} regionLabel={bottomSheetLabel} onClose={() => setActiveRegion(null)} />
        )}
      </div>

      {/* Desktop: map + sidebar */}
      <div className="hidden md:flex flex-1 overflow-hidden min-h-0">
        <div className="flex-1 relative min-w-0">
          <MapView activeRegion={activeRegion} onRegionClick={handleRegionClickDesktop} regionKeys={regionKeys} />
        </div>
        <div className="w-[390px] shrink-0" style={{ borderLeft: '1px solid var(--border)' }}>
          <ArticleList ref={listRef} activeRegion={activeRegion} onRegionClick={handleRegionClickDesktop} allSpots={allSpots} />
        </div>
      </div>
    </div>
  );
}
