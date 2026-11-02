import React from 'react';
import { Link } from 'react-router';
import { Dna, ArrowLeft, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export const SpeciesNotFound: React.FC = () => {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center p-8 text-center max-w-xl mx-auto">
      <div className="flex size-16 items-center justify-center rounded-2xl border border-line bg-surface-2 text-accent mb-4 shadow-xl">
        <Dna className="size-8 opacity-75" />
      </div>

      <span className="rounded-full border border-line bg-surface px-3 py-1 text-[11px] font-mono uppercase tracking-widest text-accent mb-2">
        404 · Hồ sơ không tồn tại
      </span>

      <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-fg font-sans mb-2">
        Không tìm thấy loài sinh vật này
      </h2>

      <p className="text-xs sm:text-sm text-fg-2 leading-relaxed mb-6">
        Mã loài sinh vật cảnh bạn đang tìm kiếm không tồn tại trong danh mục bảo tồn của BioNexus hoặc đường dẫn đã thay đổi.
      </p>

      <div className="flex items-center gap-3">
        <Link to="/species">
          <Button variant="primary" className="gap-2">
            <ArrowLeft className="size-4" />
            Về Bách khoa loài
          </Button>
        </Link>
        <Link to="/taxonomy">
          <Button variant="secondary" className="gap-2">
            <RotateCcw className="size-4" />
            Duyệt Cây phân loại
          </Button>
        </Link>
      </div>
    </div>
  );
};
