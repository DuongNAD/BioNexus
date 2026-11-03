import React from 'react';
import { Link } from 'react-router';
import { Layers, ArrowLeft, RotateCcw } from 'lucide-react';

export const TaxonomyNotFound: React.FC = () => {
  return (
    <div className="flex min-h-[55vh] flex-col items-center justify-center p-8 text-center max-w-xl mx-auto">
      <div className="flex size-16 items-center justify-center rounded-2xl border border-line bg-surface-2 text-accent mb-4 shadow-xl">
        <Layers className="size-8" aria-hidden="true" />
      </div>

      <span className="rounded-full border border-line bg-surface px-3 py-1 text-[11px] font-mono uppercase tracking-widest text-accent mb-2">
        404 · Nút phân loại không tồn tại
      </span>

      <h1 className="text-2xl font-bold tracking-tight text-fg font-sans mb-2">
        Không tìm thấy nhánh trong phả hệ
      </h1>

      <p className="text-xs sm:text-sm text-fg-2 leading-relaxed mb-6">
        Mã định danh nút phân loại sinh học này không có trong cơ sở dữ liệu phả hệ của BioNexus hoặc đã được tái cấu trúc theo danh pháp mới.
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link
          to="/taxonomy"
          className="inline-flex h-10 items-center gap-2 rounded-lg bg-accent px-4 text-sm font-semibold text-accent-ink shadow-[var(--glow-accent-btn)] transition-colors hover:bg-white focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2"
        >
          <RotateCcw className="size-4" aria-hidden="true" />
          Về Cây phân loại gốc
        </Link>
        <Link
          to="/species"
          className="inline-flex h-10 items-center gap-2 rounded-lg border border-line bg-surface-hover px-4 text-sm font-medium text-fg transition-colors hover:border-line-strong hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Tra cứu Bách khoa loài
        </Link>
      </div>
    </div>
  );
};
