'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV = [
  { href: '/',        label: 'Home' },
  { href: '/about',   label: 'About' },
  { href: '/privacy', label: 'プライバシーポリシー' },
  { href: '/contact', label: 'お問い合わせ' },
];

const INSTAGRAM_URL = 'https://www.instagram.com/postmaster0517/?hl=ja';

function InstagramIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
      <circle cx="12" cy="12" r="4"/>
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>
    </svg>
  );
}

export default function Header() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      <header
        className="shrink-0 flex items-center justify-between px-5 md:px-8 h-12 z-40 relative"
        style={{ background: 'var(--bg-sidebar)', borderBottom: '1px solid var(--border)' }}
      >
        {/* Logo */}
        <Link
          href="/"
          className="text-sm tracking-[0.3em] font-light"
          style={{ color: 'var(--accent)', fontFamily: 'Cormorant Garamond, serif' }}
          onClick={() => setOpen(false)}
        >
          不思議な空間をまとめているブログ
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-5">
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="transition-opacity hover:opacity-60"
            style={{ color: 'var(--text-muted)' }}
            aria-label="Instagram"
          >
            <InstagramIcon size={18} />
          </a>
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-xs transition-opacity hover:opacity-60"
              style={{
                color: pathname === item.href ? 'var(--accent)' : 'var(--text-muted)',
                fontFamily: 'Noto Serif JP, serif',
                fontWeight: pathname === item.href ? 400 : 300,
                letterSpacing: '0.05em',
              }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Mobile hamburger */}
        <button
          className="md:hidden flex flex-col gap-1.5 p-1"
          onClick={() => setOpen(!open)}
          aria-label="メニュー"
        >
          <span className="block w-5 h-px transition-all duration-200" style={{ background: 'var(--text-muted)', transform: open ? 'translateY(5px) rotate(45deg)' : 'none' }} />
          <span className="block w-5 h-px transition-all duration-200" style={{ background: 'var(--text-muted)', opacity: open ? 0 : 1 }} />
          <span className="block w-5 h-px transition-all duration-200" style={{ background: 'var(--text-muted)', transform: open ? 'translateY(-5px) rotate(-45deg)' : 'none' }} />
        </button>
      </header>

      {/* Mobile dropdown */}
      {open && (
        <div
          className="md:hidden absolute top-12 left-0 right-0 z-50 flex flex-col"
          style={{ background: 'var(--bg-sidebar)', borderBottom: '1px solid var(--border)' }}
        >
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="px-6 py-4 text-sm border-b transition-opacity hover:opacity-60"
              style={{ color: pathname === item.href ? 'var(--accent)' : 'var(--text)', fontFamily: 'Noto Serif JP, serif', fontWeight: 300, borderColor: 'var(--border)' }}
            >
              {item.label}
            </Link>
          ))}
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setOpen(false)}
            className="px-6 py-4 text-sm flex items-center gap-2 transition-opacity hover:opacity-60"
            style={{ color: 'var(--text)', fontFamily: 'Noto Serif JP, serif', fontWeight: 300 }}
          >
            <InstagramIcon size={16} />
            Instagram
          </a>
        </div>
      )}
    </>
  );
}
