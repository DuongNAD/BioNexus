import React from 'react';
import { Link } from 'react-router';
import { Layers, ArrowLeft, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export const TaxonomyNotFound: React.FC = () => {
  return (
    <div className="flex min-h-[55vh] flex-col items-center justify-center p-8 text-center max-w-xl mx-auto">
      <div className="flex size-16 items-center justify-center rounded-2xl border border-line bg-surface-2 text-accent mb-4 shadow-xl">
        <Layers className="size-8 opacity-75" />
      </div>

      <span className="rounded-full border border-line bg-surface px-3 py-1 text-[11px] font-mono uppercase tracking-widest text-accent mb-2">
        404 · Nút phân loại không tồn tại
      </span>

      <h2 className="text-2xl font-bold tracking-tight text-fg font-sans mb-2">
        Không tìm thấy nhánh trong phả hệ
      </h2>

      <p className="text-xs sm:text-sm text-fg-2 leading-relaxed mb-6">
        Mã định danh nút phân loại sinh học này không có trong cơ sở dữ liệu phả hệ của BioNexus hoặc đã được tái cấu trúc theo danh pháp mới.
      </p>

      <div className="flex items-center gap-3">
        <Link to="/taxonomy/1">
          <Button variant="primary" className="gap-2">
            <RotateCcw className="size-4" />
            Về Cây phân loại gốc
          </Button>
        </Link>
        <Link to="/species">
          <Button variant="secondary" className="gap-2">
            <ArrowLeft className="size-4" />
            Tra cứu Bách khoa loài
          </Button>
        </Link>
      </div>
    </div>
  );
};
