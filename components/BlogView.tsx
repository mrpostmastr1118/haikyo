'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Spot } from '@/lib/spots';

interface Props {
  allSpots: Spot[];
}

type FilterType = 'all' | 'month' | 'tag' | 'region';
interface Filter { type: FilterType; value: string }

function toYearMonth(dateStr: string) {
  const [y, m] = dateStr.split('-');
  return `${y}年${parseInt(m)}月`;
}

function BlogCard({ spot }: { spot: Spot }) {
  return (
    <Link href={`/articles/${spot.id}`} className="group block">
      <article
        className="overflow-hidden rounded-lg transition-shadow duration-300 hover:shadow-md h-full flex flex-col"
        style={{ border: '1px solid var(--border)', background: 'var(--bg-sidebar)' }}
      >
        <div className="overflow-hidden shrink-0" style={{ aspectRatio: '4/3' }}>
          <img
            src={spot.images[0]}
            alt={spot.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            style={{ filter: 'sepia(12%) saturate(85%)' }}
          />
        </div>
        <div className="p-4 flex flex-col flex-1">
          <p className="text-xs mb-1.5" style={{ color: 'var(--text-muted)', fontFamily: 'Cormorant Garamond, serif' }}>
            {toYearMonth(spot.publishedAt)} · {spot.locationLabel}
          </p>
          <h2 className="text-base leading-snug mb-2 flex-1" style={{ color: 'var(--text)', fontFamily: 'Cormorant Garamond, serif', fontWeight: 400 }}>
            {spot.name}
          </h2>
          <p className="text-xs leading-relaxed line-clamp-2 mb-3" style={{ color: 'var(--text-muted)', fontFamily: 'Noto Serif JP, serif', fontWeight: 300 }}>
            {spot.excerpt}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {spot.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'var(--border)', color: 'var(--text-muted)' }}>
                {tag}
              </span>
            ))}
          </div>
        </div>
      </article>
    </Link>
  );
}

function SidebarSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <p className="text-xs tracking-widest mb-3 pb-2" style={{ color: 'var(--text-muted)', fontFamily: 'Cormorant Garamond, serif', letterSpacing: '0.15em', borderBottom: '1px solid var(--border)' }}>
        {title}
      </p>
      {children}
    </div>
  );
}

function SidebarLink({ label, count, active, onClick }: { label: string; count: number; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-between py-1.5 text-left transition-opacity hover:opacity-70 group"
    >
      <span className="text-xs" style={{
        color: active ? 'var(--accent)' : 'var(--text)',
        fontFamily: 'Noto Serif JP, serif',
        fontWeight: active ? 400 : 300,
      }}>
        {active && <span className="mr-1" style={{ color: 'var(--accent)' }}>›</span>}
        {label}
      </span>
      <span className="text-xs px-1.5 py-0.5 rounded-full" style={{ background: 'var(--border)', color: 'var(--text-muted)', minWidth: '20px', textAlign: 'center' }}>
        {count}
      </span>
    </button>
  );
}

export default function BlogView({ allSpots }: Props) {
  const [filter, setFilter] = useState<Filter>({ type: 'all', value: '' });
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // 集計
  const months = useMemo(() => {
    const map = new Map<string, number>();
    allSpots.forEach((s) => {
      const ym = toYearMonth(s.publishedAt);
      map.set(ym, (map.get(ym) ?? 0) + 1);
    });
    return Array.from(map.entries()).sort((a, b) => b[0].localeCompare(a[0]));
  }, [allSpots]);

  const tags = useMemo(() => {
    const map = new Map<string, number>();
    allSpots.forEach((s) => s.tags.forEach((t) => map.set(t, (map.get(t) ?? 0) + 1)));
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
  }, [allSpots]);

  const regions = useMemo(() => {
    const map = new Map<string, number>();
    allSpots.forEach((s) => map.set(s.regionLabel, (map.get(s.regionLabel) ?? 0) + 1));
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
  }, [allSpots]);

  // フィルタリング
  const filtered = useMemo(() => {
    if (filter.type === 'all') return allSpots;
    if (filter.type === 'month') return allSpots.filter((s) => toYearMonth(s.publishedAt) === filter.value);
    if (filter.type === 'tag') return allSpots.filter((s) => s.tags.includes(filter.value));
    if (filter.type === 'region') return allSpots.filter((s) => s.regionLabel === filter.value);
    return allSpots;
  }, [allSpots, filter]);

  function setF(type: FilterType, value: string) {
    setFilter((prev) => prev.type === type && prev.value === value ? { type: 'all', value: '' } : { type, value });
    setSidebarOpen(false);
  }

  const sidebar = (
    <aside className="shrink-0 md:w-52" style={{ fontFamily: 'Noto Serif JP, serif' }}>
      <SidebarSection title="ALL POSTS">
        <SidebarLink label="すべての記事" count={allSpots.length} active={filter.type === 'all'} onClick={() => setFilter({ type: 'all', value: '' })} />
      </SidebarSection>

      <SidebarSection title="ARCHIVE">
        {months.map(([ym, count]) => (
          <SidebarLink key={ym} label={ym} count={count} active={filter.type === 'month' && filter.value === ym} onClick={() => setF('month', ym)} />
        ))}
      </SidebarSection>

      <SidebarSection title="CATEGORY">
        {tags.map(([tag, count]) => (
          <SidebarLink key={tag} label={tag} count={count} active={filter.type === 'tag' && filter.value === tag} onClick={() => setF('tag', tag)} />
        ))}
      </SidebarSection>

      <SidebarSection title="REGION">
        {regions.map(([region, count]) => (
          <SidebarLink key={region} label={region} count={count} active={filter.type === 'region' && filter.value === region} onClick={() => setF('region', region)} />
        ))}
      </SidebarSection>
    </aside>
  );

  return (
    <div className="h-full overflow-y-auto" style={{ background: 'var(--bg)' }}>
      <div className="max-w-6xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="flex items-end justify-between mb-6">
          <div>
            {filter.type !== 'all' && (
              <p className="text-xs mb-1" style={{ color: 'var(--accent)', fontFamily: 'Cormorant Garamond, serif' }}>
                {filter.value} の記事
              </p>
            )}
            <p className="text-xs" style={{ color: 'var(--text-muted)', fontFamily: 'Noto Serif JP, serif', fontWeight: 300 }}>
              {filtered.length} 件{filter.type !== 'all' && <button onClick={() => setFilter({ type: 'all', value: '' })} className="ml-2 underline text-xs" style={{ color: 'var(--accent)' }}>すべて表示</button>}
            </p>
          </div>
          {/* Mobile sidebar toggle */}
          <button
            className="md:hidden text-xs px-3 py-1.5 rounded"
            style={{ border: '1px solid var(--border)', color: 'var(--text-muted)', fontFamily: 'Noto Serif JP, serif' }}
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? '閉じる' : '絞り込み ▾'}
          </button>
        </div>

        {/* Mobile sidebar */}
        {sidebarOpen && (
          <div className="md:hidden mb-6 p-4 rounded-lg" style={{ background: 'var(--bg-sidebar)', border: '1px solid var(--border)' }}>
            {sidebar}
          </div>
        )}

        {/* Main layout */}
        <div className="flex gap-8">
          {/* Article grid */}
          <div className="flex-1 min-w-0">
            {filtered.length === 0 ? (
              <div className="text-center py-16" style={{ color: 'var(--text-muted)' }}>
                <p className="text-sm">該当する記事がありません</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {filtered.map((spot) => <BlogCard key={spot.id} spot={spot} />)}
              </div>
            )}
          </div>

          {/* Desktop sidebar */}
          <div className="hidden md:block">
            {sidebar}
          </div>
        </div>
      </div>
    </div>
  );
}
