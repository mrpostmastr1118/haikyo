'use client';

import Link from 'next/link';
import { Spot } from '@/lib/spots';

interface Props {
  allSpots: Spot[];
}

function BlogCard({ spot }: { spot: Spot }) {
  return (
    <Link href={`/articles/${spot.id}`} className="group block">
      <article
        className="overflow-hidden rounded-lg transition-shadow duration-300 hover:shadow-md"
        style={{ border: '1px solid var(--border)', background: 'var(--bg-sidebar)' }}
      >
        {/* Image */}
        <div className="overflow-hidden" style={{ aspectRatio: '4/3' }}>
          <img
            src={spot.images[0]}
            alt={spot.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            style={{ filter: 'sepia(12%) saturate(85%)' }}
          />
        </div>

        {/* Content */}
        <div className="p-4">
          <p
            className="text-xs mb-1.5 tracking-wider"
            style={{ color: 'var(--accent)', fontFamily: 'Cormorant Garamond, serif' }}
          >
            {spot.locationLabel}
          </p>
          <h2
            className="text-base leading-snug mb-2"
            style={{ color: 'var(--text)', fontFamily: 'Cormorant Garamond, serif', fontWeight: 400 }}
          >
            {spot.name}
          </h2>
          <p
            className="text-xs leading-relaxed line-clamp-3 mb-3"
            style={{ color: 'var(--text-muted)', fontFamily: 'Noto Serif JP, serif', fontWeight: 300 }}
          >
            {spot.excerpt}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {spot.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="text-xs px-2 py-0.5 rounded-full"
                style={{ background: 'var(--border)', color: 'var(--text-muted)' }}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </article>
    </Link>
  );
}

export default function BlogView({ allSpots }: Props) {
  return (
    <div className="h-full overflow-y-auto" style={{ background: 'var(--bg)' }}>
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-8">
          <p
            className="text-xs tracking-[0.3em] mb-2"
            style={{ color: 'var(--accent)', fontFamily: 'Cormorant Garamond, serif' }}
          >
            ハイキャー
          </p>
          <h1
            className="text-3xl md:text-4xl font-light"
            style={{ fontFamily: 'Cormorant Garamond, serif', color: 'var(--text)' }}
          >
            廃墟・遺構を、地図でめぐる。
          </h1>
          <p className="mt-2 text-xs" style={{ color: 'var(--text-muted)', fontFamily: 'Noto Serif JP, serif', fontWeight: 300 }}>
            {allSpots.length} 件の記録
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {allSpots.map((spot) => (
            <BlogCard key={spot.id} spot={spot} />
          ))}
        </div>
      </div>
    </div>
  );
}
