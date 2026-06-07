import type { Metadata } from 'next';
import { supabase } from '@/lib/supabase';
import { SPOTS, dbSpotToSpot } from '@/lib/spots';
import BlogView from '@/components/BlogView';

export const metadata: Metadata = {
  title: 'ブログ — 不思議な空間をまとめているブログ',
  description: '廃墟・遺構・不思議な空間の記事一覧。地域・カテゴリ・月別で絞り込めます。',
  openGraph: {
    title: 'ブログ — 不思議な空間をまとめているブログ',
    description: '廃墟・遺構・不思議な空間の記事一覧',
  },
};

export const revalidate = 60;

export default async function BlogPage() {
  const { data } = await supabase
    .from('spots')
    .select('*')
    .eq('published', true)
    .order('created_at', { ascending: false });

  const existingIds = new Set(SPOTS.map((s) => s.id));
  const dbSpots = (data ?? []).map(dbSpotToSpot).filter((s) => !existingIds.has(s.id));
  const allSpots = [...SPOTS, ...dbSpots];

  return (
    <div className="h-full overflow-hidden">
      <BlogView allSpots={allSpots} />
    </div>
  );
}
