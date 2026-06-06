'use client';

import { useState } from 'react';

interface Props {
  url: string;
  title: string;
}

export default function ShareButtons({ url, title }: Props) {
  const [copied, setCopied] = useState(false);

  const encoded = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(`${title} | PATINA`);

  function copyUrl() {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  const btnBase = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 16px',
    borderRadius: '4px',
    fontSize: '0.75rem',
    letterSpacing: '0.08em',
    fontFamily: 'Cormorant Garamond, serif',
    cursor: 'pointer',
    border: '1px solid var(--border)',
    background: 'transparent',
    color: 'var(--text-muted)',
    textDecoration: 'none',
    transition: 'opacity 0.15s',
  } as React.CSSProperties;

  return (
    <div className="flex flex-wrap gap-3 pt-2">
      <a
        href={`https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encoded}`}
        target="_blank"
        rel="noopener noreferrer"
        style={btnBase}
      >
        ✕ でシェア
      </a>
      <a
        href={`https://social-plugins.line.me/lineit/share?url=${encoded}`}
        target="_blank"
        rel="noopener noreferrer"
        style={btnBase}
      >
        LINE でシェア
      </a>
      <button onClick={copyUrl} style={btnBase}>
        {copied ? '✓ コピーしました' : 'URLをコピー'}
      </button>
    </div>
  );
}
