'use client';

import { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import Link from 'next/link';
import { getRegionGroups, Spot, SPOTS } from '@/lib/spots';
import ImageCarousel from '@/components/ImageCarousel';

export interface ArticleListHandle {
  scrollToRegion: (regionKey: string) => void;
}

interface Props {
  activeRegion: string | null;
  onRegionClick: (regionKey: string) => void;
  allSpots?: Spot[];
}

function PhotoStrip({ images }: { images: string[] }) {
  if (images.length <= 1) return null;
  return (
    <div
      className="flex gap-1.5 overflow-x-auto pb-1 mt-2"
      style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
    >
      {images.slice(1).map((src, i) => (
        <div key={i} className="shrink-0 rounded overflow-hidden" style={{ width: 96, height: 72 }}>
          <img
            src={src}
            alt=""
            className="w-full h-full object-cover"
            style={{ filter: 'sepia(12%) saturate(85%)' }}
          />
        </div>
      ))}
    </div>
  );
}

function ArticleCard({ spot, isOpen, onToggle }: { spot: Spot; isOpen: boolean; onToggle: () => void }) {
  return (
    <article
      className="overflow-hidden rounded-lg mb-3"
      style={{ border: '1px solid var(--border)', background: isOpen ? 'rgba(139,100,53,0.03)' : 'transparent' }}
    >
      {/* Hero carousel */}
      <div onClick={onToggle} className="cursor-pointer">
        <ImageCarousel images={spot.images} alt={spot.name} aspectRatio="3/2" interval={4000} />
      </div>

      {/* Card info */}
      <button onClick={onToggle} className="w-full text-left block">
        <div className="px-4 pt-3 pb-3 flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-xs mb-1 truncate" style={{ color: 'var(--accent)', fontFamily: 'Cormorant Garamond, serif', letterSpacing: '0.05em' }}>
              {spot.locationLabel}
            </p>
            <p className="text-sm leading-snug font-light" style={{ color: 'var(--text)', fontFamily: 'Noto Serif JP, serif' }}>
              {spot.name}
            </p>
          </div>
          <span
            className="shrink-0 text-xl leading-none mt-0.5 transition-transform duration-300"
            style={{ color: 'var(--text-muted)', transform: isOpen ? 'rotate(90deg)' : 'none' }}
          >
            ›
          </span>
        </div>
      </button>

      {/* Expanded content */}
      {isOpen && (
        <div className="px-4 pb-4">
          {/* 複数写真ストリップ */}
          <PhotoStrip images={spot.images} />

          <p className="text-xs italic leading-relaxed mt-3 mb-3" style={{ color: 'var(--accent)', fontFamily: 'Cormorant Garamond, serif' }}>
            {spot.excerpt}
          </p>

          <p className="text-xs leading-loose line-clamp-4" style={{ color: 'var(--text)', fontFamily: 'Noto Serif JP, serif', fontWeight: 300 }}>
            {spot.body.split('\n\n')[0]}
          </p>

          <div className="flex flex-wrap gap-1.5 mt-3 mb-3">
            {spot.tags.map((tag) => (
              <span key={tag} className="text-xs px-2.5 py-0.5 rounded-full" style={{ background: 'var(--border)', color: 'var(--text-muted)' }}>
                {tag}
              </span>
            ))}
          </div>

          <Link
            href={`/articles/${spot.id}`}
            className="text-xs tracking-widest transition-opacity hover:opacity-60"
            style={{ color: 'var(--accent)', fontFamily: 'Cormorant Garamond, serif' }}
          >
            全文を読む →
          </Link>
        </div>
      )}
    </article>
  );
}

const ArticleList = forwardRef<ArticleListHandle, Props>(function ArticleList({ activeRegion, onRegionClick, allSpots = SPOTS }, ref) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [openSpotId, setOpenSpotId] = useState<string | null>(null);
  const groups = getRegionGroups(allSpots);

  useImperativeHandle(ref, () => ({
    scrollToRegion(regionKey: string) {
      const el = scrollRef.current?.querySelector(`[data-region="${regionKey}"]`) as HTMLElement | null;
      if (el && scrollRef.current) {
        scrollRef.current.scrollTo({ top: el.offsetTop - 16, behavior: 'smooth' });
      }
    },
  }));

  return (
    <div className="flex flex-col h-full" style={{ background: 'var(--bg-sidebar)' }}>
      {/* Fixed header */}
      <div className="shrink-0 px-5 pt-5 pb-4" style={{ borderBottom: '1px solid var(--border)' }}>
        <p className="text-xs tracking-[0.3em] mb-1.5" style={{ color: 'var(--accent)', fontFamily: 'Cormorant Garamond, serif' }}>
          ハイキャー
        </p>
        <h1 className="text-xl font-light leading-tight mb-1.5" style={{ fontFamily: 'Cormorant Garamond, serif', color: 'var(--text)' }}>
          廃墟・遺構を、地図でめぐる。
        </h1>
        <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)', fontFamily: 'Noto Serif JP, serif', fontWeight: 300 }}>
          地図の地域をクリックするとその場所の記録へ移動します
        </p>
      </div>

      {/* Scrollable list */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3">
        {groups.map(({ regionKey, regionLabel, spots }) => (
          <section key={regionKey} data-region={regionKey} className="mb-1">
            {/* Region header */}
            <button
              onClick={() => onRegionClick(regionKey)}
              className="w-full flex items-center gap-2 py-2 text-left group"
            >
              <span
                className="w-2 h-2 rounded-full shrink-0 transition-transform group-hover:scale-125"
                style={{ background: activeRegion === regionKey ? 'var(--pin)' : 'var(--accent-light)' }}
              />
              <span
                className="text-xs tracking-widest uppercase"
                style={{
                  color: activeRegion === regionKey ? 'var(--accent)' : 'var(--text-muted)',
                  fontFamily: 'Cormorant Garamond, serif',
                  letterSpacing: '0.15em',
                }}
              >
                {regionLabel}
              </span>
              <span className="text-xs" style={{ color: 'var(--text-muted)', opacity: 0.5 }}>
                {spots.length}件
              </span>
            </button>

            {spots.map((spot) => (
              <ArticleCard
                key={spot.id}
                spot={spot}
                isOpen={openSpotId === spot.id}
                onToggle={() => setOpenSpotId(openSpotId === spot.id ? null : spot.id)}
              />
            ))}
          </section>
        ))}
        <div className="h-6" />
      </div>
    </div>
  );
});

export default ArticleList;
