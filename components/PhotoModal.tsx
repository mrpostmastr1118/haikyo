'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { Spot } from '@/lib/spots';
import ImageCarousel from '@/components/ImageCarousel';

interface Props {
  spot: Spot;
  initialImageUrl: string;
  onClose: () => void;
}

function ModalContent({ spot, initialImageUrl, onClose }: Props) {
  const [visible, setVisible] = useState(false);
  const initialIndex = Math.max(0, spot.images.indexOf(initialImageUrl));

  useEffect(() => {
    const id = requestAnimationFrame(() => setVisible(true));
    // キーボードEscで閉じる
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') dismiss(); };
    window.addEventListener('keydown', onKey);
    return () => {
      cancelAnimationFrame(id);
      window.removeEventListener('keydown', onKey);
    };
  }, []);

  function dismiss() {
    setVisible(false);
    setTimeout(onClose, 250);
  }

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={dismiss}
        style={{
          position: 'fixed', inset: 0, zIndex: 9998,
          background: 'rgba(44,36,23,0.6)',
          opacity: visible ? 1 : 0,
          transition: 'opacity 0.25s ease',
        }}
      />

      {/* Modal card */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px',
          pointerEvents: 'none',
        }}
      >
        <div
          style={{
            background: 'var(--bg-sidebar)',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '480px',
            maxHeight: '90vh',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            pointerEvents: 'auto',
            opacity: visible ? 1 : 0,
            transform: visible ? 'scale(1)' : 'scale(0.94)',
            transition: 'opacity 0.25s ease, transform 0.25s ease',
            boxShadow: '0 24px 64px rgba(44,36,23,0.3)',
          }}
        >
          {/* 画像カルーセル */}
          <div className="shrink-0" style={{ aspectRatio: '4/3', overflow: 'hidden' }}>
            <ImageCarousel
              images={spot.images}
              alt={spot.name}
              aspectRatio="4/3"
              interval={5000}
              initialIndex={initialIndex}
            />
          </div>

          {/* 内容 */}
          <div style={{ overflowY: 'auto', padding: '20px 20px 24px', flex: 1 }}>
            {/* 閉じるボタン */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
              <div>
                <p style={{ fontSize: '0.7rem', letterSpacing: '0.1em', color: 'var(--accent)', fontFamily: 'Cormorant Garamond, serif', marginBottom: '4px' }}>
                  {spot.locationLabel}
                </p>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 300, color: 'var(--text)', fontFamily: 'Cormorant Garamond, serif', lineHeight: 1.3 }}>
                  {spot.name}
                </h2>
              </div>
              <button
                onClick={dismiss}
                style={{
                  flexShrink: 0, marginLeft: '12px',
                  width: '28px', height: '28px', borderRadius: '50%',
                  background: 'var(--border)', border: 'none',
                  color: 'var(--text-muted)', fontSize: '13px',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                ✕
              </button>
            </div>

            {spot.year_abandoned && (
              <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'Cormorant Garamond, serif', letterSpacing: '0.1em', marginBottom: '10px' }}>
                廃墟化 {spot.year_abandoned}年
              </p>
            )}

            <p style={{ fontSize: '0.82rem', lineHeight: 1.8, color: 'var(--text-muted)', fontFamily: 'Noto Serif JP, serif', fontWeight: 300, marginBottom: '14px', fontStyle: 'italic' }}>
              {spot.excerpt}
            </p>

            {/* タグ */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '18px' }}>
              {spot.tags.map((tag) => (
                <span key={tag} style={{ fontSize: '0.7rem', padding: '3px 10px', borderRadius: '100px', background: 'var(--border)', color: 'var(--text-muted)', fontFamily: 'Noto Serif JP, serif' }}>
                  {tag}
                </span>
              ))}
            </div>

            {/* 記事へのCTA */}
            <Link
              href={`/articles/${spot.id}`}
              style={{
                display: 'block',
                textAlign: 'center',
                padding: '12px',
                background: 'var(--accent)',
                color: '#FAF7F2',
                borderRadius: '8px',
                fontSize: '0.8rem',
                letterSpacing: '0.12em',
                fontFamily: 'Cormorant Garamond, serif',
                textDecoration: 'none',
                transition: 'opacity 0.15s',
              }}
            >
              記事を読む →
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

export default function PhotoModal(props: Props) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;
  return createPortal(<ModalContent {...props} />, document.body);
}
