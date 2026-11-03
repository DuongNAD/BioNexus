import React from 'react';
import { ArrowLeft, Network } from 'lucide-react';
import { PageContainer } from '@/components/layout/Page';
import { ButtonLink } from '@/components/domain/ButtonLink';

/** 404 của cây phân loại (tài liệu 03 mục 3: "Không tìm thấy nhánh này" kèm nút về gốc) */
export const TaxonomyNotFound: React.FC = () => {
  return (
    <PageContainer width="narrow" className="flex min-h-[60vh] flex-col items-center justify-center py-16 text-center">
      <Network className="mb-5 size-10 text-accent" aria-hidden="true" />
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-fg-3">Lỗi 404</p>
      <h1 className="mt-3 text-[34px] leading-tight font-semibold tracking-[-0.035em] text-fg md:text-5xl">
        Không tìm thấy nhánh này
      </h1>
      <p className="mt-4 max-w-md text-base leading-relaxed text-fg-2">
        Nút phân loại này không có trong bách khoa BioNexus, hoặc đường dẫn đã bị gõ sai.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <ButtonLink to="/taxonomy" pill>
          Về cây phân loại gốc
        </ButtonLink>
        <ButtonLink to="/species" variant="secondary" pill>
          <ArrowLeft className="size-4" aria-hidden="true" />
          <span>Bách khoa loài</span>
        </ButtonLink>
      </div>
    </PageContainer>
  );
};
