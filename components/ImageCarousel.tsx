'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

interface Props {
  images: string[];
  alt?: string;
  aspectRatio?: string;
  interval?: number;
  initialIndex?: number;
}

export default function ImageCarousel({ images, alt = '', aspectRatio = '3/2', interval = 4000, initialIndex = 0 }: Props) {
  const [current, setCurrent] = useState(initialIndex);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const next = useCallback(() => setCurrent((i) => (i + 1) % images.length), [images.length]);
  const prev = useCallback(() => setCurrent((i) => (i - 1 + images.length) % images.length), [images.length]);

  useEffect(() => {
    if (images.length <= 1 || paused) return;
    timerRef.current = setInterval(next, interval);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [next, interval, images.length, paused]);

  if (images.length === 0) return null;

  if (images.length === 1) {
    return (
      <div className="w-full overflow-hidden" style={{ aspectRatio }}>
        <img src={images[0]} alt={alt} className="w-full h-full object-cover" style={{ filter: 'sepia(12%) saturate(85%)' }} />
      </div>
    );
  }

  return (
    <div
      className="relative w-full overflow-hidden group"
      style={{ aspectRatio }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Images */}
      {images.map((src, i) => (
        <img
          key={src}
          src={src}
          alt={alt}
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-700"
          style={{
            opacity: i === current ? 1 : 0,
            filter: 'sepia(12%) saturate(85%)',
          }}
        />
      ))}

      {/* Left / Right buttons */}
      <button
        onClick={(e) => { e.stopPropagation(); prev(); }}
        className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ background: 'rgba(44,36,23,0.55)', color: '#FAF7F2', fontSize: '14px' }}
        aria-label="前の画像"
      >
        ‹
      </button>
      <button
        onClick={(e) => { e.stopPropagation(); next(); }}
        className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ background: 'rgba(44,36,23,0.55)', color: '#FAF7F2', fontSize: '14px' }}
        aria-label="次の画像"
      >
        ›
      </button>

      {/* Dots */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
        {images.map((_, i) => (
          <button
            key={i}
            onClick={(e) => { e.stopPropagation(); setCurrent(i); }}
            className="w-1.5 h-1.5 rounded-full transition-all"
            style={{ background: i === current ? '#FAF7F2' : 'rgba(250,247,242,0.4)' }}
            aria-label={`画像 ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
