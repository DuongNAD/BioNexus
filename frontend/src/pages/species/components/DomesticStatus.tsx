import React from 'react';
import type { CatalogSpecies } from '@/api/catalog';
import { IucnBadge } from '@/components/ui/IucnBadge';

export interface DomesticStatusProps {
  displayName: string;
  /** Hồ sơ catalog có thể đang tải: khi đó chỉ hiện phần giải thích chung */
  profile: CatalogSpecies | null;
}

/**
 * Thay thang IUCN cho vật nuôi thuần hoá: IUCN chỉ đánh giá quần thể hoang dã nên chó nhà, mèo nhà... không có mức.
 * Mức trong DB là giá trị giữ chỗ (cột bắt buộc), nên không hiện nó mà nói về loài tổ tiên hoang dã.
 */
export const DomesticStatus: React.FC<DomesticStatusProps> = ({ displayName, profile }) => {
  const ancestor = profile?.wildAncestor;
  return (
    <div className="max-w-3xl space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <IucnBadge code="" domestic size="lg" />
        <p className="text-lg font-semibold text-fg">IUCN không đánh giá dạng thuần hoá</p>
      </div>
      {/* Ghi chú của catalog đã nói về loài tổ tiên thì không lặp câu giải thích chung */}
      <p className="leading-relaxed text-fg-2">
        {profile?.conservationNoteVi ??
          `Sách Đỏ IUCN chỉ đánh giá các quần thể hoang dã. ${displayName} là vật nuôi đã thuần hoá qua nhiều thế hệ nên không có mức bảo tồn riêng.`}
      </p>
      {ancestor && (
        <p className="flex flex-wrap items-center gap-x-2 gap-y-1.5 leading-relaxed text-fg">
          <span>Tổ tiên hoang dã:</span>
          <span className="font-semibold">{ancestor.commonNameVi ?? ancestor.scientificName}</span>
          {ancestor.commonNameVi && <i className="font-serif text-fg-2">{ancestor.scientificName}</i>}
          {ancestor.iucn && <IucnBadge code={ancestor.iucn} size="sm" />}
        </p>
      )}
    </div>
  );
};
