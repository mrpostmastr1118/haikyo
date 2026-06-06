'use client';

import { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import Link from 'next/link';
import { getRegionGroups, Spot } from '@/lib/spots';

export interface ArticleListHandle {
  scrollToRegion: (regionKey: string) => void;
}

interface Props {
  activeRegion: string | null;
  onRegionClick: (regionKey: string) => void;
}

function ArticleCard({ spot, isOpen, onToggle }: { spot: Spot; isOpen: boolean; onToggle: () => void }) {
  return (
    <article
      className="border-b last:border-b-0 transition-colors"
      style={{ borderColor: 'var(--border)' }}
    >
      <button
        onClick={onToggle}
        className="w-full text-left flex gap-3 py-4 px-1 group"
      >
        <div
          className="shrink-0 w-20 h-16 rounded overflow-hidden"
          style={{ filter: 'sepia(15%) saturate(85%)' }}
        >
          <img src={spot.image} alt={spot.name} className="w-full h-full object-cover" />
        </div>
        <div className="flex-1 min-w-0 flex flex-col justify-center">
          <p className="text-xs mb-0.5 truncate" style={{ color: 'var(--accent)', fontFamily: 'Cormorant Garamond, serif', letterSpacing: '0.04em' }}>
            {spot.locationLabel}
          </p>
          <p className="text-sm leading-snug mb-1" style={{ color: 'var(--text)', fontFamily: 'Noto Serif JP, serif', fontWeight: 300 }}>
            {spot.name}
          </p>
          <p className="text-xs leading-relaxed line-clamp-2" style={{ color: 'var(--text-muted)', fontFamily: 'Noto Serif JP, serif', fontWeight: 300 }}>
            {spot.excerpt}
          </p>
        </div>
        <span
          className="shrink-0 self-center text-lg leading-none transition-transform duration-300"
          style={{ color: 'var(--text-muted)', transform: isOpen ? 'rotate(90deg)' : 'none' }}
        >
          ›
        </span>
      </button>

      {isOpen && (
        <div className="pb-5 px-1">
          <div className="rounded overflow-hidden mb-4" style={{ aspectRatio: '16/9' }}>
            <img src={spot.image} alt={spot.name} className="w-full h-full object-cover" style={{ filter: 'sepia(10%) saturate(80%)' }} />
          </div>
          {spot.year_abandoned && (
            <p className="text-xs mb-3" style={{ color: 'var(--text-muted)', fontFamily: 'Cormorant Garamond, serif', letterSpacing: '0.1em' }}>
              廃墟化: {spot.year_abandoned}年
            </p>
          )}
          <p className="text-sm italic mb-4 leading-relaxed" style={{ color: 'var(--accent)', fontFamily: 'Cormorant Garamond, serif' }}>
            {spot.excerpt}
          </p>
          <p className="text-sm leading-loose line-clamp-4" style={{ color: 'var(--text)', fontFamily: 'Noto Serif JP, serif', fontWeight: 300 }}>
            {spot.body.split('\n\n')[0]}
          </p>
          <div className="flex flex-wrap gap-2 mt-4 mb-4">
            {spot.tags.map((tag) => (
              <span key={tag} className="text-xs px-3 py-1 rounded-full" style={{ background: 'var(--border)', color: 'var(--text-muted)' }}>
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

const ArticleList = forwardRef<ArticleListHandle, Props>(function ArticleList({ activeRegion, onRegionClick }, ref) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [openSpotId, setOpenSpotId] = useState<string | null>(null);
  const groups = getRegionGroups();

  useImperativeHandle(ref, () => ({
    scrollToRegion(regionKey: string) {
      const el = scrollRef.current?.querySelector(`[data-region="${regionKey}"]`) as HTMLElement | null;
      if (el && scrollRef.current) {
        const offset = el.offsetTop - 16;
        scrollRef.current.scrollTo({ top: offset, behavior: 'smooth' });
      }
    },
  }));

  return (
    <div className="flex flex-col h-full" style={{ background: 'var(--bg-sidebar)' }}>
      {/* Fixed header */}
      <div className="shrink-0 px-7 pt-7 pb-5" style={{ borderBottom: '1px solid var(--border)' }}>
        <p className="text-xs tracking-[0.3em] mb-2" style={{ color: 'var(--accent)', fontFamily: 'Cormorant Garamond, serif' }}>
          ハイキャー
        </p>
        <h1 className="text-2xl font-light leading-tight mb-2" style={{ fontFamily: 'Cormorant Garamond, serif', color: 'var(--text)' }}>
          廃墟・遺構を、地図でめぐる。
        </h1>
        <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)', fontFamily: 'Noto Serif JP, serif', fontWeight: 300 }}>
          地図の地域をクリックするとその場所の記録へ移動します
        </p>
      </div>

      {/* Scrollable list */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-7 py-2">
        {groups.map(({ regionKey, regionLabel, spots }) => (
          <section key={regionKey} data-region={regionKey} className="mb-2">
            {/* Region section header */}
            <button
              onClick={() => onRegionClick(regionKey)}
              className="w-full flex items-center gap-2 pt-4 pb-2 text-left group"
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
              <span className="text-xs ml-1" style={{ color: 'var(--text-muted)', opacity: 0.6 }}>
                {spots.length}件
              </span>
            </button>

            {/* Article cards in this region */}
            <div
              className="rounded-lg overflow-hidden px-3"
              style={{
                background: activeRegion === regionKey ? 'rgba(139,100,53,0.05)' : 'transparent',
                border: activeRegion === regionKey ? '1px solid var(--border)' : '1px solid transparent',
                transition: 'all 0.2s',
              }}
            >
              {spots.map((spot) => (
                <ArticleCard
                  key={spot.id}
                  spot={spot}
                  isOpen={openSpotId === spot.id}
                  onToggle={() => setOpenSpotId(openSpotId === spot.id ? null : spot.id)}
                />
              ))}
            </div>
          </section>
        ))}

        <div className="h-8" />
      </div>
    </div>
  );
});

export default ArticleList;
