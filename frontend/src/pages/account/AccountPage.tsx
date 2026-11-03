import React from 'react';
import { Link } from 'react-router';
import { Mail, Phone, MapPin, ArrowRight, Package, Award, Check } from 'lucide-react';
import { PageContainer, PageHeader, Section, Panel, Eyebrow } from '@/components/layout/Page';
import { ButtonLink } from '@/components/domain/ButtonLink';
import { StatusPill } from '@/components/ui/StatusPill';
import { Skeleton } from '@/components/ui/Skeleton';
import { QueryErrorState } from '@/components/domain/QueryErrorState';
import { useMe } from '@/api/queries/useAuthQueries';
import { usePassport } from '@/hooks/usePassport';
import { JOURNEY_SPECIES_BASE, LEG } from '@/content/journey';
import { cn } from '@/lib/cn';
import type { SellerDto } from '@/types/api';

const STATION_LIST = [
  'tram-1',
  'tram-2',
  'tram-3',
  'tram-4',
  'tram-5',
  'tram-6',
  'tram-7',
  'tram-8',
  'tram-9',
] as const;

const PENDING_STEPS = [
  { label: 'Bước 1: Nộp hồ sơ', note: 'Đã tiếp nhận thông tin cơ sở' },
  { label: 'Bước 2: Thẩm định CITES', note: 'Đang đối soát giấy phép nhân giống' },
  { label: 'Bước 3: Kích hoạt shop', note: 'Mở quyền đăng bán' },
];

/** Khối trạng thái shop: mỗi trạng thái một nội dung, cùng một khung */
function ShopStatus({ shop }: { shop: SellerDto | null }): React.JSX.Element {
  if (!shop) {
    return (
      <Panel className="md:p-8">
        <h3 className="text-xl font-semibold tracking-[-0.02em] text-fg">Trở thành Nhà bảo tồn & Đối tác nhân giống BioNexus</h3>
        <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-fg-2">
          BioNexus chỉ nhận cá thể sinh sản nhân tạo từ thế hệ F2 trở lên, có giấy phép rõ ràng. Mở shop để đưa cá thể
          của bạn tới người nuôi trên toàn quốc.
        </p>
        <ul className="mt-5 grid gap-x-6 gap-y-2 text-sm text-fg-2 sm:grid-cols-3">
          {['Hồ sơ giấy phép minh bạch', 'Tiếp cận người nuôi toàn quốc', 'Kiểm duyệt từng cá thể trước khi lên sàn'].map((t) => (
            <li key={t} className="flex items-start gap-2">
              <Check className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden="true" />
              <span>{t}</span>
            </li>
          ))}
        </ul>
        <ButtonLink to="/seller/apply" pill className="mt-6">
          <span>Nộp hồ sơ mở shop ngay</span>
          <ArrowRight className="size-4" aria-hidden="true" />
        </ButtonLink>
      </Panel>
    );
  }

  const head = (
    <div className="flex flex-wrap items-center gap-3">
      <h3 className="text-xl font-semibold tracking-[-0.02em] text-fg">{shop.shopName}</h3>
      <StatusPill status={shop.status} size="sm" />
    </div>
  );

  if (shop.status === 'PENDING') {
    return (
      <Panel className="md:p-8">
        {head}
        <p className="mt-2 text-[15px] text-fg-2">Hồ sơ đang chờ Ban Quản trị BioNexus thẩm định giấy phép cơ sở.</p>
        <ol className="mt-6 grid gap-4 sm:grid-cols-3">
          {PENDING_STEPS.map((step, i) => (
            <li key={step.label} className="flex items-start gap-3">
              <span
                className={cn(
                  'mt-1 size-2.5 shrink-0 rounded-full',
                  i === 0 ? 'bg-accent' : i === 1 ? 'bg-warm' : 'bg-white/20'
                )}
                aria-hidden="true"
              />
              <span>
                <span className={cn('block text-sm font-medium', i === 2 ? 'text-fg-3' : 'text-fg')}>{step.label}</span>
                <span className="block text-sm text-fg-3">{step.note}</span>
              </span>
            </li>
          ))}
        </ol>
        <p className="mt-6 border-t border-line pt-4 text-sm text-fg-3">
          Thời gian thẩm định thường từ 24 đến 48 giờ làm việc.
        </p>
      </Panel>
    );
  }

  if (shop.status === 'ACTIVE') {
    return (
      <Panel className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between md:p-8">
        <div className="min-w-0">
          {head}
          <p className="mt-2 max-w-xl text-[15px] text-fg-2">
            {shop.bio || 'Cơ sở nhân giống đã được Ban Quản trị BioNexus duyệt.'}
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-3">
          <ButtonLink to="/seller/products/new" variant="secondary" pill>
            Đăng cá thể mới
          </ButtonLink>
          <ButtonLink to="/seller" pill>
            <span>Vào Kênh người bán</span>
            <ArrowRight className="size-4" aria-hidden="true" />
          </ButtonLink>
        </div>
      </Panel>
    );
  }

  if (shop.status === 'REJECTED') {
    return (
      <Panel className="md:p-8">
        {head}
        <div className="mt-5 border-l-2 border-danger pl-4">
          <p className="text-sm font-medium text-danger">Lý do chưa phê duyệt:</p>
          {/* rejectionReason là trường đề xuất, backend có thể chưa trả */}
          <p className="mt-1 text-[15px] text-fg-2">{shop.rejectionReason || 'Ban Quản trị chưa ghi lý do cụ thể.'}</p>
        </div>
        <p className="mt-5 text-sm text-fg-3">
          Mỗi tài khoản chỉ có một hồ sơ shop. Vui lòng liên hệ Ban Quản trị BioNexus để được hướng dẫn xử lý.
        </p>
      </Panel>
    );
  }

  // BANNED
  return (
    <Panel className="border-danger/40 md:p-8">
      {head}
      <p className="mt-3 text-[15px] text-fg-2">Shop của bạn đang bị khóa nên không thể đăng bán sản phẩm mới.</p>
      <p className="mt-2 text-sm text-fg-3">Vui lòng liên hệ Ban Quản trị BioNexus để được hướng dẫn.</p>
    </Panel>
  );
}

export default function AccountPage(): React.JSX.Element {
  // Route đã bọc RequireAuth nên ở đây luôn là tài khoản USER
  const { data: me, isLoading, isError, error, refetch, isRefetching } = useMe();
  const { met, firstUnmetStationId } = usePassport(me?.username);

  if (isLoading) {
    return (
      <PageContainer width="default" className="space-y-6 py-12" role="status" aria-label="Đang tải hồ sơ">
        <Skeleton className="h-24 w-2/3" />
        <Skeleton className="h-48 w-full rounded-[20px]" />
        <Skeleton className="h-48 w-full rounded-[20px]" />
      </PageContainer>
    );
  }

  // api/me chưa có ở backend (tài liệu 04): lỗi phải hiện rõ thay vì skeleton quay mãi
  if (isError || !me) {
    return (
      <PageContainer width="default" className="py-16">
        <QueryErrorState title="Không tải được hồ sơ tài khoản" error={error} onRetry={() => refetch()} isRetrying={isRefetching} />
      </PageContainer>
    );
  }

  const shop = me.shop;
  const contactRows = [
    { icon: Mail, label: 'Email', value: me.email },
    { icon: Phone, label: 'Số điện thoại', value: me.phone || 'Chưa cập nhật', mono: true },
    { icon: MapPin, label: 'Địa chỉ giao hàng mặc định', value: me.address || 'Chưa cập nhật' },
  ];

  const journeyCta =
    met.length === 0
      ? { to: '/tham-hiem?chao-mung=1', label: 'Bắt đầu hành trình', primary: true }
      : met.length < 9
        ? { to: `/tham-hiem?tram=${firstUnmetStationId}`, label: 'Đi tiếp hành trình', primary: true }
        : { to: '/tham-hiem?tram=ho-chieu', label: 'Xem lại hộ chiếu', primary: false };

  return (
    <PageContainer width="default" className="pb-20">
      <PageHeader
        eyebrow="Tài khoản"
        title={me.fullName}
        description={<span className="font-mono text-base">@{me.username}</span>}
        meta={
          <>
            <StatusPill status={me.status} size="sm" />
            <span>{shop ? 'Đối tác nhân giống' : 'Thành viên cộng đồng'}</span>
          </>
        }
        actions={
          <ButtonLink to="/orders" variant="secondary" pill>
            <Package className="size-4" aria-hidden="true" />
            <span>Đơn hàng của tôi</span>
          </ButtonLink>
        }
      />

      <Section title="Thông tin liên hệ" className="pt-0 md:pt-0">
        <Panel padded={false}>
          <dl className="divide-y divide-line">
            {contactRows.map(({ icon: Icon, label, value, mono }) => (
              <div key={label} className="flex items-start gap-4 px-5 py-4 md:px-6">
                <Icon className="mt-0.5 size-5 shrink-0 text-accent" aria-hidden="true" />
                <div className="min-w-0">
                  <dt className="text-sm text-fg-3">{label}</dt>
                  <dd className={cn('mt-0.5 break-words text-[15px] text-fg', mono && 'font-mono')}>{value}</dd>
                </div>
              </div>
            ))}
          </dl>
        </Panel>
        <p className="mt-3 text-sm text-fg-3">Muốn đổi email hoặc số điện thoại, vui lòng gửi yêu cầu xác minh tới Ban Quản trị.</p>
      </Section>

      <Section title="Cửa hàng của bạn">
        <ShopStatus shop={shop} />
      </Section>

      <Section
        title="Hộ chiếu loài"
        description={
          met.length === 0
            ? 'Bạn chưa đóng dấu trạm nào trong Hành trình 9 loài.'
            : met.length < 9
              ? `Bạn đã gặp ${met.length} trên 9 loài. Đi tiếp để hoàn thành hộ chiếu.`
              : 'Bạn đã đóng đủ 9 con dấu qua 4 vùng sinh cảnh.'
        }
        actions={
          <ButtonLink to={journeyCta.to} variant={journeyCta.primary ? 'primary' : 'secondary'} pill>
            <span>{journeyCta.label}</span>
            <ArrowRight className="size-4" aria-hidden="true" />
          </ButtonLink>
        }
      >
        <Panel data-testid="account-passport-card" className="md:p-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <Eyebrow tone="muted">Đã đóng dấu</Eyebrow>
              <p className="mt-1 font-mono text-3xl font-medium tabular-nums text-fg">
                {met.length}
                <span className="text-fg-3">/9</span>
              </p>
            </div>
            {met.length >= 9 && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/15 px-3 py-1 text-sm font-medium text-accent">
                <Award className="size-4" aria-hidden="true" />
                Nhà thám hiểm BioNexus
              </span>
            )}
          </div>

          <div
            className="mt-4 grid grid-cols-9 gap-1.5"
            role="img"
            aria-label={`Đã đóng dấu ${met.length} trên 9 trạm`}
          >
            {STATION_LIST.map((stId) => {
              const stamped = met.includes(LEG[stId]?.slug || '');
              return <span key={stId} className={cn('h-1.5 rounded-full', stamped ? 'bg-accent' : 'bg-white/15')} />;
            })}
          </div>

          <ul className="mt-6 grid gap-x-6 sm:grid-cols-2 lg:grid-cols-3">
            {STATION_LIST.map((stId, idx) => {
              const slug = LEG[stId]?.slug || '';
              const sp = JOURNEY_SPECIES_BASE[slug];
              const stamped = met.includes(slug);
              return (
                <li key={stId} className="border-b border-line">
                  <Link
                    to={`/tham-hiem?tram=${stId}`}
                    className="flex items-center justify-between gap-3 py-3 transition-colors hover:text-accent"
                  >
                    <span className="min-w-0">
                      <span className="block text-sm text-fg-3">Trạm {String(idx + 1).padStart(2, '0')}</span>
                      <span className={cn('block truncate text-[15px]', stamped ? 'text-fg' : 'text-fg-2')}>
                        {sp?.name || slug}
                      </span>
                    </span>
                    <span className={cn('shrink-0 text-sm', stamped ? 'text-accent' : 'text-fg-3')}>
                      {stamped ? 'Đã đóng dấu' : 'Chưa gặp'}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </Panel>
      </Section>
    </PageContainer>
  );
}
