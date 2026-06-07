import type { Metadata } from 'next';
import { supabase } from '@/lib/supabase';
import { SPOTS, dbSpotToSpot } from '@/lib/spots';
import PhotoView from '@/components/PhotoView';

export const metadata: Metadata = {
  title: '写真 — 不思議な空間をまとめているブログ',
  description: '廃墟・遺構・不思議な空間の写真ギャラリー。',
  openGraph: {
    title: '写真 — 不思議な空間をまとめているブログ',
    description: '廃墟・遺構・不思議な空間の写真ギャラリー',
  },
};

export const revalidate = 60;

export default async function PhotosPage() {
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
      <PhotoView allSpots={allSpots} />
    </div>
  );
}
