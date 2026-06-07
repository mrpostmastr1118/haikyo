'use client';

import { useEffect } from 'react';

interface Props {
  slot: string;
  style?: React.CSSProperties;
}

declare global {
  interface Window { adsbygoogle: unknown[] }
}

export default function AdSense({ slot, style }: Props) {
  const clientId = process.env.NEXT_PUBLIC_ADSENSE_ID;
  if (!clientId) return null;

  useEffect(() => {
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {}
  }, []);

  return (
    <div style={{ textAlign: 'center', ...style }}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={clientId}
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}
