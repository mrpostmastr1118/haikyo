import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import sharp from 'sharp';

export const maxDuration = 30;

function isHeic(file: File): boolean {
  return (
    file.type === 'image/heic' ||
    file.type === 'image/heif' ||
    /\.(heic|heif)$/i.test(file.name)
  );
}

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

  if (file.size > 30 * 1024 * 1024) {
    return NextResponse.json({ error: `ファイルが大きすぎます (${Math.round(file.size / 1024 / 1024)}MB)。30MB以下にしてください。` }, { status: 400 });
  }

  let buffer: Buffer = Buffer.from(await file.arrayBuffer()) as Buffer;
  let contentType = file.type || 'image/jpeg';
  let ext = file.name.split('.').pop() ?? 'jpg';

  // HEIC / HEIF → JPEG に自動変換
  if (isHeic(file)) {
    try {
      buffer = await sharp(buffer).jpeg({ quality: 88 }).toBuffer();
      contentType = 'image/jpeg';
      ext = 'jpg';
    } catch (e) {
      return NextResponse.json({ error: `HEIC変換失敗: ${e}` }, { status: 500 });
    }
  } else {
    // その他の画像も念のためsharpで正規化（EXIF回転補正・大きすぎる場合リサイズ）
    try {
      const meta = await sharp(buffer).metadata();
      if ((meta.width ?? 0) > 4000 || (meta.height ?? 0) > 4000) {
        buffer = await sharp(buffer)
          .rotate() // EXIF回転を適用
          .resize(3000, 3000, { fit: 'inside', withoutEnlargement: true })
          .jpeg({ quality: 88 })
          .toBuffer();
        contentType = 'image/jpeg';
        ext = 'jpg';
      } else {
        buffer = await sharp(buffer).rotate().toBuffer(); // EXIF回転のみ適用
      }
    } catch {
      // sharp処理が失敗しても元のバッファで続行
    }
  }

  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const { error } = await supabaseAdmin.storage
    .from('spot-images')
    .upload(filename, buffer, { contentType, upsert: false });

  if (error) {
    console.error('Supabase upload error:', error);
    return NextResponse.json({ error: `Supabase: ${error.message}` }, { status: 500 });
  }

  const { data } = supabaseAdmin.storage.from('spot-images').getPublicUrl(filename);
  return NextResponse.json({ url: data.publicUrl });
}
