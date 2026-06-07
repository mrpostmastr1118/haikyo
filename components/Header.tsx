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
        <nav className="hidden md:flex items-center gap-6">
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
          <span
            className="block w-5 h-px transition-all duration-200"
            style={{
              background: 'var(--text-muted)',
              transform: open ? 'translateY(5px) rotate(45deg)' : 'none',
            }}
          />
          <span
            className="block w-5 h-px transition-all duration-200"
            style={{
              background: 'var(--text-muted)',
              opacity: open ? 0 : 1,
            }}
          />
          <span
            className="block w-5 h-px transition-all duration-200"
            style={{
              background: 'var(--text-muted)',
              transform: open ? 'translateY(-5px) rotate(-45deg)' : 'none',
            }}
          />
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
              style={{
                color: pathname === item.href ? 'var(--accent)' : 'var(--text)',
                fontFamily: 'Noto Serif JP, serif',
                fontWeight: 300,
                borderColor: 'var(--border)',
              }}
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
