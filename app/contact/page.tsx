'use client';

import { useState } from 'react';
import PageLayout from '@/components/PageLayout';

export default function ContactPage() {
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', message: '' });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    try {
      const res = await fetch('https://formspree.io/f/xdavadwy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setSent(true);
      } else {
        alert('送信に失敗しました。時間をおいて再度お試しください。');
      }
    } catch {
      alert('通信エラーが発生しました。');
    } finally {
      setSending(false);
    }
  }

  const inputStyle = {
    background: 'transparent',
    border: '1px solid var(--border)',
    borderRadius: '4px',
    color: 'var(--text)',
    fontFamily: 'Noto Serif JP, serif',
    fontWeight: 300,
    fontSize: '0.875rem',
    padding: '10px 12px',
    width: '100%',
    outline: 'none',
  };

  if (sent) {
    return (
      <PageLayout title="お問い合わせ">
        <div className="text-center py-8">
          <p className="text-2xl mb-3" style={{ fontFamily: 'Cormorant Garamond, serif', fontWeight: 300 }}>
            送信完了しました
          </p>
          <p style={{ color: 'var(--text-muted)' }}>
            お問い合わせありがとうございます。内容を確認の上、ご返信いたします。
          </p>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="お問い合わせ" subtitle="Contact">
      <p style={{ color: 'var(--text-muted)' }}>
        掲載場所のご提案、記事に関するご意見、取材・掲載依頼など、お気軽にご連絡ください。
      </p>

      <form onSubmit={handleSubmit} className="space-y-5 mt-2">
        <div className="space-y-1.5">
          <label className="text-xs tracking-widest" style={{ color: 'var(--text-muted)', fontFamily: 'Cormorant Garamond, serif' }}>
            お名前
          </label>
          <input
            type="text"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            style={inputStyle}
            placeholder="山田 太郎"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs tracking-widest" style={{ color: 'var(--text-muted)', fontFamily: 'Cormorant Garamond, serif' }}>
            メールアドレス
          </label>
          <input
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            style={inputStyle}
            placeholder="mail@example.com"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs tracking-widest" style={{ color: 'var(--text-muted)', fontFamily: 'Cormorant Garamond, serif' }}>
            メッセージ
          </label>
          <textarea
            required
            rows={6}
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
            style={{ ...inputStyle, resize: 'vertical' }}
            placeholder="お問い合わせ内容をご記入ください"
          />
        </div>

        <button
          type="submit"
          disabled={sending}
          className="w-full py-3 text-sm tracking-widest transition-opacity hover:opacity-70 disabled:opacity-40"
          style={{
            background: 'var(--accent)',
            color: '#FAF7F2',
            fontFamily: 'Cormorant Garamond, serif',
            border: 'none',
            borderRadius: '4px',
            cursor: sending ? 'not-allowed' : 'pointer',
          }}
        >
          {sending ? '送信中...' : '送　信'}
        </button>
      </form>
    </PageLayout>
  );
}
