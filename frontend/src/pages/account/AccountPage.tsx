import React from 'react';
import { Link } from 'react-router';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Store,
  ShieldCheck,
  Clock,
  AlertTriangle,
  XCircle,
  ArrowRight,
  Sparkles,
  Package,
  Stamp,
  Award,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { StatusPill } from '@/components/ui/StatusPill';
import { useMe } from '@/api/queries/useAuthQueries';
import { getStoredToken } from '@/api/authStore';
import { usePassport } from '@/hooks/usePassport';
import { JOURNEY_SPECIES_BASE, LEG } from '@/content/journey';

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

export default function AccountPage(): React.JSX.Element {
  const token = getStoredToken();
  const { data: me, isLoading } = useMe({ enabled: !!token });
  const { met, firstUnmetStationId } = usePassport(me?.username);

  if (!token) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center p-6 text-center">
        <User className="size-12 text-fg-3 mb-3" />
        <h2 className="text-xl font-bold text-fg">Đăng nhập để xem hồ sơ cá nhân</h2>
        <Link to="/login?next=/account" className="mt-4">
          <Button variant="primary" pill>Đăng nhập ngay</Button>
        </Link>
      </div>
    );
  }

  if (isLoading || !me) {
    return (
      <div className="space-y-6 max-w-4xl">
        <div className="h-48 rounded-2xl bg-surface animate-pulse" />
        <div className="h-64 rounded-2xl bg-surface animate-pulse" />
      </div>
    );
  }

  // Lấy 2 chữ cái đầu của họ tên làm avatar
  const initials = me.fullName
    ? me.fullName
        .split(' ')
        .filter(Boolean)
        .slice(-2)
        .map((w) => w[0]?.toUpperCase())
        .join('')
    : me.username.slice(0, 2).toUpperCase();

  const shop = me.shop;

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Tiêu đề */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-fg font-sans">
          Hồ Sơ Thành Viên
        </h1>
        <p className="mt-1 text-xs text-fg-3">
          Thông tin tài khoản và trạng thái liên kết đối tác nhân giống BioNexus
        </p>
      </div>

      {/* 1. Thẻ hồ sơ thành viên (Member Profile Card) */}
      <div className="rounded-2xl border border-line bg-surface-1/70 backdrop-blur-xl p-6 md:p-8 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-line/60 pb-6">
          <div className="flex items-center gap-4">
            {/* Avatar 80px */}
            <div className="size-20 rounded-2xl border-2 border-accent/40 bg-gradient-to-tr from-accent/30 via-accent-2/20 to-black/60 flex items-center justify-center text-accent font-bold text-2xl font-mono shadow-lg shrink-0">
              {initials}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-fg font-sans">{me.fullName}</h2>
                <StatusPill status={me.status} size="sm" />
              </div>
              <span className="text-xs font-mono text-fg-3 block mt-0.5">@{me.username}</span>
              <div className="mt-1.5 flex items-center gap-2">
                <span className="rounded-full border border-line bg-surface px-2.5 py-0.5 text-[11px] font-medium text-fg-2">
                  {shop ? 'Đối tác nhân giống F2+' : 'Thành viên cộng đồng'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link to="/orders">
              <Button size="sm" variant="secondary" pill className="gap-1.5 text-xs">
                <Package className="size-3.5" />
                <span>Xem đơn hàng</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Lưới thông tin chi tiết */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="rounded-xl border border-line bg-surface-2/40 p-3.5 flex items-start gap-3">
            <Mail className="size-4 text-accent shrink-0 mt-0.5" />
            <div>
              <span className="text-fg-3 block text-[11px]">Địa chỉ Email:</span>
              <span className="font-semibold text-fg">{me.email}</span>
            </div>
          </div>

          <div className="rounded-xl border border-line bg-surface-2/40 p-3.5 flex items-start gap-3">
            <Phone className="size-4 text-accent shrink-0 mt-0.5" />
            <div>
              <span className="text-fg-3 block text-[11px]">Số điện thoại:</span>
              <span className="font-semibold text-fg font-mono">{me.phone || 'Chưa cập nhật'}</span>
            </div>
          </div>

          <div className="rounded-xl border border-line bg-surface-2/40 p-3.5 flex items-start gap-3 sm:col-span-2">
            <MapPin className="size-4 text-accent shrink-0 mt-0.5" />
            <div>
              <span className="text-fg-3 block text-[11px]">Địa chỉ giao hàng mặc định:</span>
              <span className="font-semibold text-fg">{me.address || 'Chưa cập nhật'}</span>
            </div>
          </div>
        </div>

        <p className="text-[11px] text-fg-3 leading-relaxed border-t border-line/40 pt-4">
          Thông tin tài khoản được mã hóa và bảo vệ theo tiêu chuẩn BioNexus. Để thay đổi số điện thoại hoặc email liên kết, vui lòng gửi yêu cầu xác minh danh tính.
        </p>
      </div>

      {/* 1b. Thẻ Hộ Chiếu Loài (Species Passport Progress Card) */}
      <div
        data-testid="account-passport-card"
        className="rounded-2xl border border-accent/35 bg-surface-1/80 backdrop-blur-xl p-6 md:p-8 shadow-xl space-y-5"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-line/60 pb-5">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex size-8 items-center justify-center rounded-xl border border-accent/40 bg-accent/15 text-accent">
                <Stamp className="size-4" aria-hidden="true" />
              </span>
              <h3 className="text-lg font-bold text-fg font-sans">Hộ chiếu loài</h3>
              <span className="rounded-full border border-accent/40 bg-accent/10 px-2.5 py-0.5 font-mono text-xs font-semibold text-accent tabular-nums">
                {met.length}/9
              </span>
              {met.length >= 9 && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/40 bg-emerald-500/15 px-3 py-0.5 text-xs font-semibold text-emerald-300">
                  <Award className="size-3.5" aria-hidden="true" />
                  Nhà thám hiểm BioNexus
                </span>
              )}
            </div>
            <p className="text-xs text-fg-2">
              {met.length === 0
                ? 'Bạn chưa đóng dấu trạm nào trong Hành trình 9 loài. Hãy mở hộ chiếu và bắt đầu chuyến đi thực địa qua 4 vùng sinh cảnh.'
                : met.length < 9
                  ? `Bạn đã gặp ${met.length} trên 9 loài trong bách khoa BioNexus. Đi tiếp để hoàn thành sổ hộ chiếu và nhận chứng nhận.`
                  : 'Chúc mừng! Bạn đã đóng đủ 9 con dấu thực địa qua 4 vùng sinh cảnh trên toàn cầu.'}
            </p>
          </div>

          <div className="shrink-0">
            {met.length === 0 ? (
              <Link to="/tham-hiem?chao-mung=1">
                <Button size="sm" variant="primary" pill className="gap-1.5 text-xs font-semibold">
                  <span>Bắt đầu hành trình</span>
                  <ArrowRight className="size-3.5" aria-hidden="true" />
                </Button>
              </Link>
            ) : met.length < 9 ? (
              <Link to={`/tham-hiem?tram=${firstUnmetStationId}`}>
                <Button size="sm" variant="primary" pill className="gap-1.5 text-xs font-semibold">
                  <span>Đi tiếp hành trình</span>
                  <ArrowRight className="size-3.5" aria-hidden="true" />
                </Button>
              </Link>
            ) : (
              <Link to="/tham-hiem?tram=ho-chieu">
                <Button size="sm" variant="secondary" pill className="gap-1.5 text-xs font-semibold">
                  <span>Xem lại hộ chiếu & chứng nhận</span>
                  <ArrowRight className="size-3.5" aria-hidden="true" />
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* 9 chấm tiến độ và lưới 9 trạm loài */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-fg-3">
            <span>Tiến độ đóng dấu thực địa</span>
            <span className="flex items-center gap-1.5" aria-label={`Đã đóng dấu ${met.length} trên 9 trạm`}>
              {STATION_LIST.map((stId) => {
                const slug = LEG[stId]?.slug || '';
                const stamped = met.includes(slug);
                return (
                  <span
                    key={stId}
                    className={`size-2 rounded-full transition-colors ${
                      stamped ? 'bg-accent shadow-[0_0_8px_rgba(110,231,183,0.7)]' : 'bg-white/20'
                    }`}
                  />
                );
              })}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
            {STATION_LIST.map((stId, idx) => {
              const leg = LEG[stId];
              const slug = leg?.slug || '';
              const sp = JOURNEY_SPECIES_BASE[slug];
              const stamped = met.includes(slug);
              return (
                <Link
                  key={stId}
                  to={`/tham-hiem?tram=${stId}`}
                  className={`flex items-center justify-between rounded-xl border px-3 py-2 transition-colors ${
                    stamped
                      ? 'border-accent/40 bg-accent/10 text-fg hover:border-accent'
                      : 'border-line/60 bg-surface-2/30 text-fg-3 hover:border-line hover:text-fg-2'
                  }`}
                >
                  <div className="min-w-0 pr-2">
                    <span className="font-mono text-[10px] uppercase tracking-wider block opacity-70">
                      Trạm 0{idx + 1}
                    </span>
                    <span className="font-semibold truncate block">{sp?.name || slug}</span>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 font-mono text-[10px] ${
                      stamped
                        ? 'bg-accent/20 text-accent font-semibold'
                        : 'bg-white/5 text-fg-3'
                    }`}
                  >
                    {stamped ? 'Đã đóng dấu' : 'Chưa gặp'}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* 2. Khối Trạng thái "Shop Của Bạn" (Dynamic Shop Status Matrix - 5 States) */}
      <div className="space-y-4">
        <h3 className="font-bold text-fg text-base uppercase tracking-wider font-mono">
          Trạng thái Cửa hàng & Cơ sở Nhân giống
        </h3>

        {/* State 1: CHƯA CÓ SHOP */}
        {!shop && (
          <div className="rounded-2xl border border-accent/40 bg-gradient-to-r from-surface-1/90 to-surface-2/70 backdrop-blur-xl p-6 md:p-8 shadow-xl space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <span className="rounded-full border border-accent/40 bg-accent/10 px-3 py-1 text-xs font-mono text-accent">
                  Cơ hội đối tác
                </span>
                <h4 className="text-xl font-bold text-fg mt-3 font-sans">
                  Trở thành Nhà bảo tồn & Đối tác nhân giống BioNexus
                </h4>
                <p className="mt-2 text-xs md:text-sm text-fg-2 max-w-2xl leading-relaxed">
                  BioNexus chỉ tiếp nhận các cá thể sinh vật cảnh sinh sản nhân tạo từ thế hệ F2 trở lên, có giấy phép kiểm dịch và kiểm định nguồn gen rõ ràng. Hãy cùng chúng tôi xây dựng sàn sinh vật cảnh minh bạch và bền vững.
                </p>
              </div>

              <Link to="/seller/apply" className="shrink-0">
                <Button size="lg" pill variant="primary" className="gap-2 font-bold shadow-[var(--glow-accent-btn)]">
                  <span>Nộp hồ sơ mở shop ngay</span>
                  <ArrowRight className="size-4" />
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-line/60 text-xs">
              <div className="flex items-start gap-2.5">
                <ShieldCheck className="size-4 text-accent shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-fg block">Kiểm định F2+ CITES</span>
                  <span className="text-fg-3 text-[11px]">Chứng nhận pháp lý minh bạch cho cơ sở của bạn.</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Sparkles className="size-4 text-accent shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-fg block">Tiếp cận cộng đồng</span>
                  <span className="text-fg-3 text-[11px]">Kết nối trực tiếp người yêu sinh vật cảnh toàn quốc.</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Package className="size-4 text-accent shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-fg block">Vận chuyển chuyên dụng</span>
                  <span className="text-fg-3 text-[11px]">Quy trình đóng gói sinh học bảo vệ cá thể sống.</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* State 2: PENDING (Chờ duyệt) */}
        {shop && shop.status === 'PENDING' && (
          <div className="rounded-2xl border border-amber-500/40 bg-surface-1/90 backdrop-blur-xl p-6 md:p-8 shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-line/60 pb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="text-lg font-bold text-fg">{shop.shopName}</h4>
                  <StatusPill status="PENDING" size="sm" />
                </div>
                <p className="text-xs text-amber-300">
                  Hồ sơ đang chờ Ban Quản trị BioNexus thẩm định giấy phép cơ sở và kiểm dịch thú y.
                </p>
              </div>
            </div>

            {/* Timeline 3 bước */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="flex items-start gap-3">
                <div className="size-8 rounded-full bg-accent/20 border border-accent flex items-center justify-center text-accent shrink-0">
                  <ShieldCheck className="size-4" />
                </div>
                <div>
                  <span className="font-semibold text-fg text-xs block">Bước 1: Nộp hồ sơ</span>
                  <span className="text-[11px] text-fg-3">Đã tiếp nhận thông tin cơ sở</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="size-8 rounded-full bg-amber-500/20 border border-amber-500 flex items-center justify-center text-amber-300 shrink-0 animate-pulse">
                  <Clock className="size-4" />
                </div>
                <div>
                  <span className="font-semibold text-amber-300 text-xs block">Bước 2: Thẩm định CITES</span>
                  <span className="text-[11px] text-fg-3">Đang đối soát giấy phép F2+</span>
                </div>
              </div>

              <div className="flex items-start gap-3 opacity-50">
                <div className="size-8 rounded-full bg-surface-2 border border-line flex items-center justify-center text-fg-3 shrink-0">
                  <Store className="size-4" />
                </div>
                <div>
                  <span className="font-semibold text-fg text-xs block">Bước 3: Kích hoạt shop</span>
                  <span className="text-[11px] text-fg-3">Mở quyền đăng bán sinh vật</span>
                </div>
              </div>
            </div>

            <p className="text-[11px] text-fg-3 pt-2 border-t border-line/40">
              Thời gian kiểm duyệt tiêu chuẩn từ 24 - 48 giờ làm việc. Bạn sẽ nhận được thông báo ngay khi hồ sơ được phê duyệt.
            </p>
          </div>
        )}

        {/* State 3: ACTIVE (Đang hoạt động) */}
        {shop && shop.status === 'ACTIVE' && (
          <div className="rounded-2xl border border-accent/40 bg-surface-1/90 backdrop-blur-xl p-6 md:p-8 shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Store className="size-5 text-accent" />
                  <h4 className="text-xl font-bold text-fg font-sans">{shop.shopName}</h4>
                  <StatusPill status="ACTIVE" size="sm" />
                </div>
                <p className="text-xs text-fg-2 max-w-xl">
                  {shop.bio || 'Cơ sở nhân giống sinh thái đã được cấp chứng nhận kiểm định F2+.'}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Link to="/seller/products/new">
                  <Button size="sm" variant="secondary" pill className="gap-1.5 text-xs">
                    <Sparkles className="size-3.5 text-accent" />
                    <span>Đăng cá thể mới</span>
                  </Button>
                </Link>

                <Link to="/seller">
                  <Button size="sm" variant="primary" pill className="gap-1.5 text-xs font-semibold shadow-[var(--glow-accent-btn)]">
                    <span>Vào Kênh người bán</span>
                    <ArrowRight className="size-3.5" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* State 4: REJECTED (Bị từ chối) */}
        {shop && shop.status === 'REJECTED' && (
          <div className="rounded-2xl border border-red-500/40 bg-surface-1/90 backdrop-blur-xl p-6 space-y-4">
            <div className="flex items-center gap-2">
              <XCircle className="size-5 text-red-400" />
              <h4 className="text-lg font-bold text-fg">{shop.shopName}</h4>
              <StatusPill status="REJECTED" size="sm" />
            </div>

            <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3.5 text-xs text-red-300">
              <span className="font-bold block mb-1">Lý do chưa phê duyệt:</span>
              <p>
                Đường dẫn giấy phép kiểm dịch không hợp lệ hoặc chưa xác thực được nguồn gốc cá thể bố mẹ F1 theo tiêu chuẩn bảo tồn BioNexus.
              </p>
            </div>

            <Link to="/seller/apply">
              <Button size="sm" variant="secondary" pill className="text-xs">
                Nộp lại hồ sơ cấp phép →
              </Button>
            </Link>
          </div>
        )}

        {/* State 5: BANNED (Bị đình chỉ) */}
        {shop && shop.status === 'BANNED' && (
          <div className="rounded-2xl border border-red-700 bg-black/60 p-6 space-y-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="size-5 text-red-500" />
              <h4 className="text-lg font-bold text-fg">{shop.shopName}</h4>
              <StatusPill status="BANNED" size="sm" />
            </div>

            <p className="text-xs text-red-300 leading-relaxed">
              Cơ sở của bạn tạm thời bị khóa do nhận được khiếu nại về nguồn gốc cá thể hoang dã chưa qua kiểm định F2+. Mọi sản phẩm đã bị gỡ khỏi sàn.
            </p>
            <p className="text-[11px] text-fg-3">
              Liên hệ Ban Kiểm duyệt: <span className="font-mono text-accent">kiemduyet@bionexus.vn</span> để gửi bằng chứng đối soát.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
