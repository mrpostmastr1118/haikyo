import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export const maxDuration = 30; // Vercel timeout延長

export async function POST(req: NextRequest) {
  const session = req.cookies.get('admin_session');
  if (session?.value !== process.env.ADMIN_TOKEN) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch (e) {
    return NextResponse.json({ error: `formData parse failed: ${e}` }, { status: 400 });
  }

  const file = form.get('file') as File | null;
  if (!file) return NextResponse.json({ error: 'No file in request' }, { status: 400 });

  // ファイルサイズチェック（20MB上限）
  if (file.size > 20 * 1024 * 1024) {
    return NextResponse.json({ error: `ファイルサイズが大きすぎます (${Math.round(file.size/1024/1024)}MB)。20MB以下にしてください。` }, { status: 400 });
  }

  const ext = file.name.split('.').pop() ?? 'jpg';
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  let buffer: Buffer;
  try {
    buffer = Buffer.from(await file.arrayBuffer());
  } catch (e) {
    return NextResponse.json({ error: `Buffer変換失敗: ${e}` }, { status: 500 });
  }

  const { error } = await supabaseAdmin.storage
    .from('spot-images')
    .upload(filename, buffer, { contentType: file.type || 'image/jpeg', upsert: false });

  if (error) {
    console.error('Supabase upload error:', error);
    return NextResponse.json({ error: `Supabase: ${error.message}` }, { status: 500 });
  }

  const { data } = supabaseAdmin.storage.from('spot-images').getPublicUrl(filename);
  return NextResponse.json({ url: data.publicUrl });
}
