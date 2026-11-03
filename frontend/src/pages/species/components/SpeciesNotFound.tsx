import React from 'react';
import { Link } from 'react-router';
import { Dna, ArrowLeft, RotateCcw } from 'lucide-react';

export const SpeciesNotFound: React.FC = () => {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center p-8 text-center max-w-xl mx-auto">
      <div className="flex size-16 items-center justify-center rounded-2xl border border-line bg-surface-2 text-accent mb-4 shadow-xl">
        <Dna className="size-8" aria-hidden="true" />
      </div>

      <span className="rounded-full border border-line bg-surface px-3 py-1 text-[11px] font-mono uppercase tracking-widest text-accent mb-2">
        404 · Hồ sơ không tồn tại
      </span>

      <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-fg font-sans mb-2">
        Không tìm thấy loài sinh vật này
      </h1>

      <p className="text-xs sm:text-sm text-fg-2 leading-relaxed mb-6">
        Mã loài sinh vật cảnh bạn đang tìm kiếm không tồn tại trong danh mục bảo tồn của BioNexus hoặc đường dẫn đã thay đổi.
      </p>

      {/* Link mang kiểu nút: tránh lồng <button> trong <a> (một phần tử, một điểm dừng Tab) */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link
          to="/species"
          className="inline-flex h-10 items-center gap-2 rounded-lg bg-accent px-4 text-sm font-semibold text-accent-ink shadow-[var(--glow-accent-btn)] transition-colors hover:bg-white focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Về Bách khoa loài
        </Link>
        <Link
          to="/taxonomy"
          className="inline-flex h-10 items-center gap-2 rounded-lg border border-line bg-surface-hover px-4 text-sm font-medium text-fg transition-colors hover:border-line-strong hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2"
        >
          <RotateCcw className="size-4" aria-hidden="true" />
          Duyệt Cây phân loại
        </Link>
      </div>
    </div>
  );
};
