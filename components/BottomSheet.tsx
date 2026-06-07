'use client';

import { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import { Spot } from '@/lib/spots';

interface Props {
  spots: Spot[];
  regionLabel: string;
  onClose: () => void;
}

function SpotCard({ spot }: { spot: Spot }) {
  return (
    <Link href={`/articles/${spot.id}`} className="flex gap-3 py-3 group" style={{ borderBottom: '1px solid var(--border)' }}>
      <div className="shrink-0 rounded-lg overflow-hidden" style={{ width: 80, height: 72 }}>
        <img
          src={spot.images[0]}
          alt={spot.name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          style={{ filter: 'sepia(10%) saturate(85%)' }}
        />
      </div>
      <div className="flex-1 min-w-0 flex flex-col justify-center">
        <p className="text-xs mb-0.5" style={{ color: 'var(--accent)', fontFamily: 'Cormorant Garamond, serif', letterSpacing: '0.04em' }}>
          {spot.locationLabel}
        </p>
        <p className="text-sm leading-snug mb-1 font-light" style={{ color: 'var(--text)', fontFamily: 'Noto Serif JP, serif' }}>
          {spot.name}
        </p>
        <p className="text-xs line-clamp-1" style={{ color: 'var(--text-muted)', fontFamily: 'Noto Serif JP, serif', fontWeight: 300 }}>
          {spot.excerpt}
        </p>
      </div>
      <span className="shrink-0 self-center text-lg" style={{ color: 'var(--text-muted)' }}>›</span>
    </Link>
  );
}

export default function BottomSheet({ spots, regionLabel, onClose }: Props) {
  const [translateY, setTranslateY] = useState(300);
  const startYRef = useRef<number | null>(null);
  const currentYRef = useRef(0);

  // slide in on mount
  useEffect(() => {
    const t = requestAnimationFrame(() => setTranslateY(0));
    return () => cancelAnimationFrame(t);
  }, []);

  function dismiss() {
    setTranslateY(400);
    setTimeout(onClose, 280);
  }

  function onTouchStart(e: React.TouchEvent) {
    startYRef.current = e.touches[0].clientY;
  }

  function onTouchMove(e: React.TouchEvent) {
    if (startYRef.current === null) return;
    const dy = e.touches[0].clientY - startYRef.current;
    if (dy > 0) {
      currentYRef.current = dy;
      setTranslateY(dy);
    }
  }

  function onTouchEnd() {
    if (currentYRef.current > 80) {
      dismiss();
    } else {
      setTranslateY(0);
    }
    currentYRef.current = 0;
    startYRef.current = null;
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40"
        style={{ background: 'rgba(44,36,23,0.25)' }}
        onClick={dismiss}
      />

      {/* Sheet */}
      <div
        className="fixed left-0 right-0 bottom-0 z-50 flex flex-col"
        style={{
          background: 'var(--bg-sidebar)',
          borderRadius: '20px 20px 0 0',
          maxHeight: '72vh',
          transform: `translateY(${translateY}px)`,
          transition: translateY === 0 ? 'transform 0.3s cubic-bezier(0.32,0.72,0,1)' : 'none',
          boxShadow: '0 -4px 32px rgba(44,36,23,0.15)',
        }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1 shrink-0">
          <div className="w-10 h-1 rounded-full" style={{ background: 'var(--border)' }} />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 pb-3 pt-1 shrink-0" style={{ borderBottom: '1px solid var(--border)' }}>
          <div>
            <p className="text-xs tracking-widest mb-0.5" style={{ color: 'var(--accent)', fontFamily: 'Cormorant Garamond, serif' }}>
              {regionLabel}
            </p>
            <p className="text-xs" style={{ color: 'var(--text-muted)', fontFamily: 'Noto Serif JP, serif', fontWeight: 300 }}>
              {spots.length}件の記録
            </p>
          </div>
          <button
            onClick={dismiss}
            className="w-8 h-8 flex items-center justify-center rounded-full"
            style={{ background: 'var(--border)', color: 'var(--text-muted)', fontSize: '14px' }}
          >
            ✕
          </button>
        </div>

        {/* Article list */}
        <div className="overflow-y-auto flex-1 px-5">
          {spots.map((spot) => (
            <SpotCard key={spot.id} spot={spot} />
          ))}
          <div className="h-4" />
        </div>
      </div>
    </>
  );
}
