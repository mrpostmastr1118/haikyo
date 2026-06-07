'use client';

import { useRef, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { Spot } from '@/lib/spots';

interface Props {
  spots: Spot[];
  regionLabel: string;
  onClose: () => void;
}

function SpotCard({ spot }: { spot: Spot }) {
  return (
    <Link
      href={`/articles/${spot.id}`}
      className="flex gap-3 py-3 group"
      style={{ borderBottom: '1px solid var(--border)' }}
    >
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

function SheetContent({ spots, regionLabel, onClose }: Props) {
  const [visible, setVisible] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [translateY, setTranslateY] = useState(0);
  const startYRef = useRef<number | null>(null);
  const dragYRef = useRef(0);

  // slide in
  useEffect(() => {
    const id = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(id);
  }, []);

  function dismiss() {
    setVisible(false);
    setTimeout(onClose, 300);
  }

  function onTouchStart(e: React.TouchEvent) {
    startYRef.current = e.touches[0].clientY;
    setDragging(true);
  }

  function onTouchMove(e: React.TouchEvent) {
    if (startYRef.current === null) return;
    const dy = Math.max(0, e.touches[0].clientY - startYRef.current);
    dragYRef.current = dy;
    setTranslateY(dy);
  }

  function onTouchEnd() {
    setDragging(false);
    if (dragYRef.current > 80) {
      dismiss();
    } else {
      setTranslateY(0);
    }
    dragYRef.current = 0;
    startYRef.current = null;
  }

  const sheetY = visible ? translateY : 500;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={dismiss}
        style={{
          position: 'fixed', inset: 0, zIndex: 9998,
          background: 'rgba(44,36,23,0.3)',
          opacity: visible ? 1 : 0,
          transition: 'opacity 0.3s ease',
        }}
      />

      {/* Sheet */}
      <div
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        style={{
          position: 'fixed',
          left: 0, right: 0, bottom: 0,
          zIndex: 9999,
          background: 'var(--bg-sidebar)',
          borderRadius: '20px 20px 0 0',
          maxHeight: '72vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 -4px 32px rgba(44,36,23,0.18)',
          transform: `translateY(${sheetY}px)`,
          transition: dragging ? 'none' : 'transform 0.3s cubic-bezier(0.32,0.72,0,1)',
        }}
      >
        {/* Drag handle */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 8px' }}>
          <div style={{ width: 40, height: 4, borderRadius: 2, background: 'var(--border)' }} />
        </div>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px 12px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
          <div>
            <p style={{ fontSize: '0.7rem', letterSpacing: '0.15em', color: 'var(--accent)', fontFamily: 'Cormorant Garamond, serif', marginBottom: 2 }}>
              {regionLabel}
            </p>
            <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'Noto Serif JP, serif', fontWeight: 300 }}>
              {spots.length}件の記録
            </p>
          </div>
          <button
            onClick={dismiss}
            style={{
              width: 32, height: 32,
              borderRadius: '50%',
              background: 'var(--border)',
              color: 'var(--text-muted)',
              fontSize: 14,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: 'none', cursor: 'pointer',
            }}
          >
            ✕
          </button>
        </div>

        {/* Articles */}
        <div style={{ overflowY: 'auto', flex: 1, padding: '0 20px' }}>
          {spots.map((spot) => (
            <SpotCard key={spot.id} spot={spot} />
          ))}
          <div style={{ height: 16 }} />
        </div>
      </div>
    </>
  );
}

export default function BottomSheet(props: Props) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  // Portal: document.body直下にレンダリングしてoverflow-hiddenの影響を受けない
  return createPortal(<SheetContent {...props} />, document.body);
}
