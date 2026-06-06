import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// 公開読み取り用（フロントエンド・サーバー両用）
export const supabase = createClient(url, anon);

export type DbSpot = {
  id: string;
  name: string;
  location_label: string;
  region_key: string;
  region_type: 'prefecture' | 'country';
  region_label: string;
  lat: number;
  lng: number;
  year_abandoned: number | null;
  excerpt: string;
  body: string;
  tags: string[];
  images: string[];
  published: boolean;
  created_at: string;
};
