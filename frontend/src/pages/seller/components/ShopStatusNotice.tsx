import React from 'react';
import { ArrowRight, Clock, Store, XCircle } from 'lucide-react';
import { PageContainer } from '@/components/layout/Page';
import { StatusPill } from '@/components/ui/StatusPill';
import { ButtonLink } from '@/components/domain/ButtonLink';
import type { SellerDto } from '@/types/api';

type NoticeContext = 'dashboard' | 'new-product' | 'apply';

/**
 * Thẻ trạng thái shop dùng chung cho /seller, /seller/products/new và /seller/apply
 * (tài liệu 03 mục 13: shop chưa ACTIVE thì hiện trạng thái kèm hướng dẫn, không hiện form).
 */
export function ShopStatusNotice({ shop, context }: { shop: SellerDto | null; context: NoticeContext }): React.JSX.Element {
  let icon = <Store className="size-10 text-accent" aria-hidden="true" />;
  let title = 'Bạn chưa đăng ký mở shop';
  let body = 'Đăng ký trở thành đối tác nhân giống F2+ để mở gian hàng trên sàn BioNexus.';
  let action = { to: '/seller/apply', label: 'Đăng ký mở shop', primary: true };

  if (shop?.status === 'ACTIVE') {
    title = 'Bạn đã có shop đang hoạt động';
    body = `Shop "${shop.shopName}" đã được Ban Quản trị duyệt.`;
    action = { to: '/seller', label: 'Vào bảng điều khiển shop', primary: true };
  } else if (shop?.status === 'PENDING') {
    icon = <Clock className="size-10 text-warm" aria-hidden="true" />;
    title = context === 'apply' ? 'Hồ sơ mở shop đang được thẩm định' : 'Hồ sơ shop đang chờ duyệt';
    body = `Shop "${shop.shopName}" đang được Ban Quản trị kiểm tra giấy phép. Bạn sẽ đăng bán được ngay khi shop được duyệt.`;
    action = { to: '/account', label: 'Xem trạng thái shop', primary: false };
  } else if (shop?.status === 'REJECTED' || shop?.status === 'BANNED') {
    icon = <XCircle className="size-10 text-danger" aria-hidden="true" />;
    title = shop.status === 'BANNED' ? 'Shop của bạn đang bị khóa' : 'Hồ sơ mở shop chưa được duyệt';
    body = 'Mỗi tài khoản chỉ có một hồ sơ shop. Vui lòng liên hệ Ban Quản trị BioNexus để được hướng dẫn.';
    action = { to: '/account', label: 'Xem hồ sơ tài khoản', primary: false };
  }

  return (
    <PageContainer width="narrow" className="flex min-h-[60vh] flex-col items-center justify-center py-16 text-center">
      <div className="mb-5">{icon}</div>
      {shop && <StatusPill status={shop.status} size="sm" />}
      <h1 className="mt-4 text-[30px] leading-tight font-semibold tracking-[-0.03em] text-fg md:text-[40px]">{title}</h1>
      <p className="mt-4 max-w-md text-base leading-relaxed text-fg-2">{body}</p>
      <ButtonLink to={action.to} variant={action.primary ? 'primary' : 'secondary'} pill className="mt-8">
        <span>{action.label}</span>
        <ArrowRight className="size-4" aria-hidden="true" />
      </ButtonLink>
    </PageContainer>
  );
}
