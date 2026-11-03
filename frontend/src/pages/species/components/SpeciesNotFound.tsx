import React from 'react';
import { Leaf } from 'lucide-react';
import { PageContainer } from '@/components/layout/Page';
import { ButtonLink } from '@/components/domain/ButtonLink';

/** 404 của hồ sơ loài: cùng kiểu với trang không tìm thấy của cây phân loại */
export const SpeciesNotFound: React.FC = () => {
  return (
    <PageContainer width="narrow" className="flex min-h-[60vh] flex-col items-center justify-center py-16 text-center">
      <Leaf className="mb-5 size-10 text-accent" aria-hidden="true" />
      <p className="text-xs font-semibold tracking-[0.2em] text-fg-3 uppercase">Lỗi 404</p>
      <h1 className="mt-3 text-[34px] leading-tight font-semibold tracking-[-0.035em] text-fg md:text-5xl">
        Không tìm thấy loài này
      </h1>
      <p className="mt-4 max-w-md text-base leading-relaxed text-fg-2">
        Loài này không có trong bách khoa BioNexus, hoặc đường dẫn đã bị gõ sai.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <ButtonLink to="/species" pill>
          Về Bách khoa loài
        </ButtonLink>
        <ButtonLink to="/taxonomy" variant="secondary" pill>
          Duyệt cây phân loại
        </ButtonLink>
      </div>
    </PageContainer>
  );
};
