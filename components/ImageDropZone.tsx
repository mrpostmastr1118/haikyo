'use client';

import { useState, useRef } from 'react';

interface Props {
  onFiles: (files: File[]) => void;
  multiple?: boolean;
  label?: string;
  compact?: boolean;
}

export default function ImageDropZone({ onFiles, multiple = true, label, compact = false }: Props) {
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  let leaveTimer: ReturnType<typeof setTimeout>;

  function handleFiles(files: File[]) {
    const images = files.filter((f) => f.type.startsWith('image/'));
    if (images.length > 0) onFiles(images);
  }

  function onDragOver(e: React.DragEvent) {
    e.preventDefault();
    clearTimeout(leaveTimer);
    setDragging(true);
  }

  function onDragLeave() {
    leaveTimer = setTimeout(() => setDragging(false), 80);
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    handleFiles(Array.from(e.dataTransfer.files));
  }

  return (
    <div
      onClick={() => fileRef.current?.click()}
      onDragOver={onDragOver}
      onDragEnter={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      style={{
        border: `2px dashed ${dragging ? '#b45309' : '#e5e7eb'}`,
        borderRadius: 8,
        padding: compact ? '16px' : '24px 16px',
        textAlign: 'center',
        cursor: 'pointer',
        background: dragging ? 'rgba(180,83,9,0.05)' : 'transparent',
        transition: 'border-color 0.15s, background 0.15s',
        userSelect: 'none',
      }}
    >
      <p style={{ fontSize: compact ? '0.75rem' : '0.875rem', color: dragging ? '#b45309' : '#9ca3af', fontWeight: 500 }}>
        {dragging ? '📥 ここにドロップ！' : (label ?? 'クリック または ドラッグ＆ドロップ')}
      </p>
      {!compact && (
        <p style={{ fontSize: '0.7rem', color: '#d1d5db', marginTop: 4 }}>
          JPG / PNG / WEBP（複数可）
        </p>
      )}
      <input
        ref={fileRef}
        type="file"
        accept="image/*,.heic,.heif"
        multiple={multiple}
        style={{ display: 'none' }}
        onChange={(e) => {
          handleFiles(Array.from(e.target.files ?? []));
          e.target.value = '';
        }}
      />
    </div>
  );
}
