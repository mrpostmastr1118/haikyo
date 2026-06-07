import PageLayout from '@/components/PageLayout';
import { supabase } from '@/lib/supabase';
import { Block } from '@/components/BlockEditor';

export const metadata = {
  title: 'About — 不思議な空間をまとめているブログ',
};

export const revalidate = 60; // 60秒キャッシュ

async function getAboutBlocks(): Promise<Block[]> {
  const { data } = await supabase.from('settings').select('value').eq('key', 'about').single();
  if (!data?.value || !Array.isArray(data.value) || data.value.length === 0) {
    // デフォルトコンテンツ
    return [{ type: 'text', content: 'このサイトについての説明を管理画面から編集できます。' }];
  }
  return data.value as Block[];
}

function renderBlocks(blocks: Block[]) {
  return blocks.map((block, i) => {
    if (block.type === 'text') {
      return (
        <p key={i} style={{ whiteSpace: 'pre-wrap' }}>
          {block.content}
        </p>
      );
    }
    if (block.type === 'image') {
      return (
        <figure key={i} className="my-4">
          <img src={block.url} alt={block.caption || ''} className="w-full rounded-lg" style={{ filter: 'sepia(8%) saturate(85%)' }} />
          {block.caption && (
            <figcaption className="text-center text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
              {block.caption}
            </figcaption>
          )}
        </figure>
      );
    }
    return null;
  });
}

export default async function AboutPage() {
  const blocks = await getAboutBlocks();

  return (
    <PageLayout title="このサイトについて" subtitle="About 不思議な空間をまとめているブログ">
      {renderBlocks(blocks)}
    </PageLayout>
  );
}
