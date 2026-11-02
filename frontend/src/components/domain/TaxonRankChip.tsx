import React from 'react';
import type { TaxonomyRank } from '@/types/api';
import { cn } from '@/lib/cn';

export interface TaxonRankChipProps {
  rank: TaxonomyRank | 'SPECIES';
  className?: string;
  showHelp?: boolean;
}

export const RANK_INFO: Record<
  TaxonomyRank | 'SPECIES',
  { labelVi: string; labelEn: string; definition: string; isItalic: boolean }
> = {
  KINGDOM: {
    labelVi: 'Giới',
    labelEn: 'KINGDOM',
    definition: 'Bậc phân loại sinh học tối cao phân chia sinh giới thành các giới sinh vật lớn.',
    isItalic: false,
  },
  PHYLUM: {
    labelVi: 'Ngành',
    labelEn: 'PHYLUM',
    definition: 'Tập hợp các lớp sinh vật có chung một sơ đồ cấu trúc cơ thể và nguồn gốc phát sinh tiến hóa.',
    isItalic: false,
  },
  CLASS: {
    labelVi: 'Lớp',
    labelEn: 'CLASS',
    definition: 'Nhóm các bộ sinh vật chia sẻ những đặc điểm thích nghi giải phẫu học và sinh lý học then chốt.',
    isItalic: false,
  },
  ORDER: {
    labelVi: 'Bộ',
    labelEn: 'ORDER',
    definition: 'Nhóm các họ sinh vật có chung nguồn gốc tổ tiên và hướng thích nghi sinh thái chuyên biệt.',
    isItalic: false,
  },
  FAMILY: {
    labelVi: 'Họ',
    labelEn: 'FAMILY',
    definition: 'Tập hợp các chi có mối quan hệ tiến hóa rất gần gũi, chia sẻ cấu tạo hình thái tương tự.',
    isItalic: false,
  },
  GENUS: {
    labelVi: 'Chi',
    labelEn: 'GENUS',
    definition: 'Đơn vị phân loại cơ bản nhóm các loài cực kỳ gần gũi về cấu trúc gen và hình thái học.',
    isItalic: true,
  },
  SPECIES: {
    labelVi: 'Loài',
    labelEn: 'SPECIES',
    definition: 'Đơn vị phân loại học cơ sở bao gồm các cá thể có khả năng giao phối sinh ra thế hệ sau hữu thụ.',
    isItalic: true,
  },
};

export const TaxonRankChip: React.FC<TaxonRankChipProps> = ({
  rank,
  className = '',
  showHelp = true,
}) => {
  const info = RANK_INFO[rank] || {
    labelVi: rank,
    labelEn: rank,
    definition: '',
    isItalic: false,
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border border-line bg-surface-2/80 px-2.5 py-0.5 text-[11px] font-mono tracking-wider text-accent backdrop-blur-md',
        className
      )}
      title={showHelp ? info.definition : undefined}
    >
      <span className="font-semibold text-fg-1">{info.labelVi}</span>
      <span className="text-fg-mute">·</span>
      <span className="text-accent-2 font-medium">{info.labelEn}</span>
    </span>
  );
};
