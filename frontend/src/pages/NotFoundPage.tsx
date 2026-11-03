import React from 'react';
import { useLocation } from 'react-router';
import { Compass, Leaf } from 'lucide-react';
import { PageContainer } from '@/components/layout/Page';
import { ButtonLink } from '@/components/domain/ButtonLink';

export default function NotFoundPage(): React.JSX.Element {
  const location = useLocation();

  return (
    <PageContainer width="narrow" className="flex min-h-[65vh] flex-col items-center justify-center py-16 text-center">
      <Compass className="mb-5 size-10 text-accent" aria-hidden="true" />
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-fg-3">Lỗi 404</p>
      <h1 className="mt-3 text-[34px] leading-tight font-semibold tracking-[-0.035em] text-fg md:text-5xl">
        Không tìm thấy trang
      </h1>
      <p className="mt-4 max-w-md text-base leading-relaxed text-fg-2">
        Đường dẫn <span className="break-all font-mono text-fg">{location.pathname}</span> không có trong BioNexus. Có thể
        trang đã được dời đi hoặc đường dẫn bị gõ sai.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <ButtonLink to="/" pill>
          Về trang chủ
        </ButtonLink>
        <ButtonLink to="/species" variant="secondary" pill>
          <Leaf className="size-4" aria-hidden="true" />
          <span>Bách khoa loài</span>
        </ButtonLink>
        <ButtonLink to="/products" variant="ghost" pill>
          Sàn sinh vật cảnh
        </ButtonLink>
      </div>
    </PageContainer>
  );
}
