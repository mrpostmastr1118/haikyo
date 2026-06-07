import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { SPOTS } from '@/lib/spots';
import { SITE_URL } from '@/lib/site';
import ShareButtons from '@/components/ShareButtons';
import ImageCarousel from '@/components/ImageCarousel';
import { Block } from '@/components/BlockEditor';

function renderBody(body: string) {
  try {
    const blocks: Block[] = JSON.parse(body);
    if (Array.isArray(blocks)) {
      return (
        <div className="space-y-5">
          {blocks.map((block, i) => {
            if (block.type === 'text') {
              return (
                <p key={i} className="text-sm leading-loose" style={{ color: 'var(--text)', fontFamily: 'Noto Serif JP, serif', fontWeight: 300, whiteSpace: 'pre-wrap' }}>
                  {block.content}
                </p>
              );
            }
            if (block.type === 'image') {
              return (
                <figure key={i} className="my-6">
                  <img src={block.url} alt={block.caption || ''} className="w-full rounded-lg object-cover" style={{ maxHeight: '480px', filter: 'sepia(8%) saturate(85%)' }} />
                  {block.caption && (
                    <figcaption className="text-center text-xs mt-2" style={{ color: 'var(--text-muted)', fontFamily: 'Noto Serif JP, serif', fontWeight: 300 }}>
                      {block.caption}
                    </figcaption>
                  )}
                </figure>
              );
            }
            return null;
          })}
        </div>
      );
    }
  } catch {}
  // fallback: 既存のプレーンテキスト
  return (
    <p className="text-sm leading-loose" style={{ color: 'var(--text)', fontFamily: 'Noto Serif JP, serif', fontWeight: 300, whiteSpace: 'pre-line' }}>
      {body}
    </p>
  );
}

type Params = Promise<{ slug: string }>;

export function generateStaticParams() {
  return SPOTS.map((spot) => ({ slug: spot.id }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const spot = SPOTS.find((s) => s.id === slug);
  if (!spot) return {};

  const url = `${SITE_URL}/articles/${spot.id}`;

  return {
    title: spot.name,
    description: spot.excerpt,
    openGraph: {
      title: spot.name,
      description: spot.excerpt,
      url,
      type: 'article',
      images: [{ url: spot.image, width: 1200, height: 630, alt: spot.name }],
    },
    twitter: {
      card: 'summary_large_image',
      title: spot.name,
      description: spot.excerpt,
      images: [spot.image],
    },
    alternates: { canonical: url },
  };
}

export default async function ArticlePage({ params }: { params: Params }) {
  const { slug } = await params;
  const spot = SPOTS.find((s) => s.id === slug);
  if (!spot) notFound();

  const url = `${SITE_URL}/articles/${spot.id}`;
  const others = SPOTS.filter((s) => s.regionKey === spot.regionKey && s.id !== spot.id);

  return (
    <div className="h-full overflow-y-auto" style={{ background: 'var(--bg)' }}>
      {/* Hero carousel */}
      <div className="relative w-full" style={{ maxHeight: '480px', overflow: 'hidden' }}>
        <ImageCarousel images={spot.images} alt={spot.name} aspectRatio="16/7" interval={5000} />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'linear-gradient(to bottom, transparent 40%, rgba(44,36,23,0.65))' }}
        />
        <div className="absolute bottom-0 left-0 right-0 px-6 md:px-16 pb-8 pointer-events-none">
          <p className="text-xs tracking-widest mb-2" style={{ color: 'rgba(250,247,242,0.8)', fontFamily: 'Cormorant Garamond, serif' }}>
            {spot.locationLabel}
          </p>
          <h1 className="text-3xl md:text-5xl font-light text-white leading-tight" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
            {spot.name}
          </h1>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-6 md:px-8 py-10">
        {/* Back link */}
        <Link
          href="/"
          className="text-xs tracking-widest mb-8 inline-block transition-opacity hover:opacity-60"
          style={{ color: 'var(--text-muted)', fontFamily: 'Cormorant Garamond, serif' }}
        >
          ← 地図に戻る
        </Link>

        {/* Meta */}
        <div className="flex flex-wrap gap-4 mb-8 mt-2">
          {spot.year_abandoned && (
            <span className="text-xs px-3 py-1 rounded-full" style={{ background: 'var(--border)', color: 'var(--text-muted)', fontFamily: 'Cormorant Garamond, serif', letterSpacing: '0.1em' }}>
              廃墟化 {spot.year_abandoned}年
            </span>
          )}
          {spot.tags.map((tag) => (
            <span key={tag} className="text-xs px-3 py-1 rounded-full" style={{ background: 'var(--border)', color: 'var(--text-muted)', fontFamily: 'Noto Serif JP, serif' }}>
              {tag}
            </span>
          ))}
        </div>

        {/* Photo gallery */}
        {spot.images.length > 1 && (
          <div className="grid grid-cols-2 gap-2 mb-8">
            {spot.images.slice(1).map((src, i) => (
              <div key={i} className="rounded overflow-hidden" style={{ aspectRatio: '4/3' }}>
                <img src={src} alt="" className="w-full h-full object-cover" style={{ filter: 'sepia(10%) saturate(80%)' }} />
              </div>
            ))}
          </div>
        )}

        {/* Lead */}
        <p
          className="text-lg md:text-xl leading-relaxed mb-8 italic"
          style={{ color: 'var(--accent)', fontFamily: 'Cormorant Garamond, serif' }}
        >
          {spot.excerpt}
        </p>

        {/* Divider */}
        <div className="mb-8" style={{ borderTop: '1px solid var(--border)' }} />

        {/* Body */}
        {renderBody(spot.body)}

        {/* Share */}
        <div className="mt-12 pt-8" style={{ borderTop: '1px solid var(--border)' }}>
          <p className="text-xs tracking-widest mb-4" style={{ color: 'var(--text-muted)', fontFamily: 'Cormorant Garamond, serif' }}>
            SHARE
          </p>
          <ShareButtons url={url} title={spot.name} />
        </div>

        {/* Related articles in same region */}
        {others.length > 0 && (
          <div className="mt-12 pt-8" style={{ borderTop: '1px solid var(--border)' }}>
            <p className="text-xs tracking-widest mb-6" style={{ color: 'var(--text-muted)', fontFamily: 'Cormorant Garamond, serif' }}>
              同じ地域の記録
            </p>
            <div className="flex flex-col gap-4">
              {others.map((s) => (
                <Link
                  key={s.id}
                  href={`/articles/${s.id}`}
                  className="flex gap-4 group"
                >
                  <div className="w-20 h-16 shrink-0 rounded overflow-hidden">
                    <img src={s.image} alt={s.name} className="w-full h-full object-cover transition-opacity group-hover:opacity-80" style={{ filter: 'sepia(15%) saturate(80%)' }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs mb-1" style={{ color: 'var(--accent)', fontFamily: 'Cormorant Garamond, serif' }}>{s.locationLabel}</p>
                    <p className="text-sm leading-snug" style={{ color: 'var(--text)', fontFamily: 'Noto Serif JP, serif', fontWeight: 300 }}>{s.name}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="mt-12">
          <Link
            href="/"
            className="text-xs tracking-widest transition-opacity hover:opacity-60"
            style={{ color: 'var(--text-muted)', fontFamily: 'Cormorant Garamond, serif' }}
          >
            ← 地図に戻る
          </Link>
        </div>
      </div>
    </div>
  );
}
