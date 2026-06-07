'use client';

import { useRef, useEffect } from 'react';

export type Block =
  | { type: 'text'; content: string }
  | { type: 'image'; url: string; caption: string };

interface Props {
  blocks: Block[];
  onChange: (blocks: Block[]) => void;
}

function AutoTextarea({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  const ref = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    if (ref.current) {
      ref.current.style.height = 'auto';
      ref.current.style.height = ref.current.scrollHeight + 'px';
    }
  }, [value]);

  return (
    <textarea
      ref={ref}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={2}
      className="w-full resize-none outline-none text-sm leading-relaxed bg-transparent"
      style={{ color: '#374151', fontFamily: 'Noto Serif JP, serif', fontWeight: 300, minHeight: '60px' }}
    />
  );
}

export default function BlockEditor({ blocks, onChange }: Props) {
  const fileRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [uploading, setUploading] = [false, () => {}]; // placeholder

  function update(index: number, patch: Partial<Block>) {
    const next = blocks.map((b, i) => i === index ? { ...b, ...patch } as Block : b);
    onChange(next);
  }

  function remove(index: number) {
    onChange(blocks.filter((_, i) => i !== index));
  }

  function moveUp(index: number) {
    if (index === 0) return;
    const next = [...blocks];
    [next[index - 1], next[index]] = [next[index], next[index - 1]];
    onChange(next);
  }

  function moveDown(index: number) {
    if (index === blocks.length - 1) return;
    const next = [...blocks];
    [next[index], next[index + 1]] = [next[index + 1], next[index]];
    onChange(next);
  }

  function addText() {
    onChange([...blocks, { type: 'text', content: '' }]);
  }

  function addImage() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/admin/upload', { method: 'POST', body: fd });
      if (res.ok) {
        const { url } = await res.json();
        onChange([...blocks, { type: 'image', url, caption: '' }]);
      }
    };
    input.click();
  }

  async function replaceImage(index: number) {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/admin/upload', { method: 'POST', body: fd });
      if (res.ok) {
        const { url } = await res.json();
        update(index, { url } as Partial<Block>);
      }
    };
    input.click();
  }

  const btnStyle = "text-xs px-1.5 py-1 rounded text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors";

  return (
    <div className="space-y-2">
      {blocks.length === 0 && (
        <div className="text-center py-8 text-gray-300 text-sm border-2 border-dashed border-gray-200 rounded-lg">
          下のボタンでブロックを追加してください
        </div>
      )}

      {blocks.map((block, i) => (
        <div
          key={i}
          className="group relative rounded-lg border border-gray-100 bg-white hover:border-gray-200 transition-colors"
        >
          {/* Block toolbar */}
          <div className="absolute top-2 right-2 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <button type="button" onClick={() => moveUp(i)} className={btnStyle} title="上へ">↑</button>
            <button type="button" onClick={() => moveDown(i)} className={btnStyle} title="下へ">↓</button>
            <button type="button" onClick={() => remove(i)} className="text-xs px-1.5 py-1 rounded text-red-300 hover:text-red-500 hover:bg-red-50 transition-colors" title="削除">✕</button>
          </div>

          {block.type === 'text' && (
            <div className="px-4 py-3 pr-20">
              <div className="flex items-start gap-2">
                <span className="text-gray-200 text-xs mt-1 shrink-0 select-none">¶</span>
                <AutoTextarea
                  value={block.content}
                  onChange={(v) => update(i, { content: v })}
                  placeholder="テキストを入力..."
                />
              </div>
            </div>
          )}

          {block.type === 'image' && (
            <div className="p-3 pr-20">
              {block.url ? (
                <div>
                  <img
                    src={block.url}
                    alt=""
                    className="w-full rounded object-cover mb-2"
                    style={{ maxHeight: '300px', filter: 'sepia(5%) saturate(90%)' }}
                  />
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={block.caption}
                      onChange={(e) => update(i, { caption: e.target.value })}
                      placeholder="キャプション（任意）"
                      className="flex-1 text-xs outline-none border-b border-gray-100 pb-1 text-gray-500"
                    />
                    <button type="button" onClick={() => replaceImage(i)} className="text-xs text-amber-600 hover:underline shrink-0">
                      画像を変更
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => replaceImage(i)}
                  className="w-full border-2 border-dashed border-gray-200 rounded py-6 text-gray-300 text-sm hover:border-amber-300 hover:text-amber-400 transition-colors"
                >
                  クリックして画像を選択
                </button>
              )}
            </div>
          )}
        </div>
      ))}

      {/* Add block buttons */}
      <div className="flex gap-2 pt-1">
        <button
          type="button"
          onClick={addText}
          className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg border border-dashed border-gray-200 text-gray-400 hover:border-amber-400 hover:text-amber-600 transition-colors"
        >
          <span className="text-base leading-none">¶</span> テキスト追加
        </button>
        <button
          type="button"
          onClick={addImage}
          className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg border border-dashed border-gray-200 text-gray-400 hover:border-amber-400 hover:text-amber-600 transition-colors"
        >
          <span className="text-base leading-none">🖼</span> 画像を挿入
        </button>
      </div>
    </div>
  );
}
