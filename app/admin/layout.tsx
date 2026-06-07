import Link from 'next/link';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-full flex flex-col" style={{ background: '#F5F5F5' }}>
      <header className="shrink-0 flex items-center justify-between px-6 h-12 bg-white border-b border-gray-200">
        <span className="text-sm font-medium text-gray-700">不思議な空間をまとめているブログ 管理画面</span>
        <nav className="flex items-center gap-4">
          <Link href="/admin/articles" className="text-xs text-gray-500 hover:text-gray-800">記事一覧</Link>
          <Link href="/admin/articles/new" className="text-xs bg-amber-700 text-white px-3 py-1.5 rounded hover:bg-amber-800">＋ 新規記事</Link>
          <Link href="/" className="text-xs text-gray-400 hover:text-gray-600">← サイトへ</Link>
        </nav>
      </header>
      <main className="flex-1 min-h-0 overflow-y-auto p-6">
        {children}
      </main>
    </div>
  );
}
