import Link from 'next/link';

interface Props {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

export default function PageLayout({ title, subtitle, children }: Props) {
  return (
    <div className="h-full overflow-y-auto" style={{ background: 'var(--bg)' }}>
      <div className="max-w-2xl mx-auto px-6 py-12 md:py-16">
        <Link
          href="/"
          className="text-xs tracking-widest mb-8 inline-block transition-opacity hover:opacity-60"
          style={{ color: 'var(--text-muted)', fontFamily: 'Cormorant Garamond, serif' }}
        >
          ← ハイキャー
        </Link>
        <h1
          className="text-3xl md:text-4xl font-light mb-3 leading-tight"
          style={{ fontFamily: 'Cormorant Garamond, serif', color: 'var(--text)' }}
        >
          {title}
        </h1>
        {subtitle && (
          <p className="text-sm mb-10" style={{ color: 'var(--text-muted)', fontFamily: 'Noto Serif JP, serif', fontWeight: 300 }}>
            {subtitle}
          </p>
        )}
        <div
          className="border-t pt-8 text-sm leading-loose space-y-6"
          style={{
            borderColor: 'var(--border)',
            color: 'var(--text)',
            fontFamily: 'Noto Serif JP, serif',
            fontWeight: 300,
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
