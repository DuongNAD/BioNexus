import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { IucnBadge, IUCN_SPECS, type ConservationStatus } from '@/components/ui/IucnBadge';
import { StatusPill, type BusinessStatus } from '@/components/ui/StatusPill';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/Dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs';
import { Skeleton } from '@/components/ui/Skeleton';
import { Kbd } from '@/components/ui/Kbd';
import { Price } from '@/components/ui/Price';
import { Photo } from '@/components/media/Photo';
import { PhotoCredit } from '@/components/media/PhotoCredit';
import { PHOTOS } from '@/content/photos';
import { Search, Sparkles, AlertCircle, ShoppingCart } from 'lucide-react';

export default function UIPreview(): React.JSX.Element {
  const [btnLoading, setBtnLoading] = useState(false);
  const [selectVal, setSelectVal] = useState('reptilia');

  const iucnCodes: ConservationStatus[] = ['LC', 'NT', 'VU', 'EN', 'CR', 'EW', 'EX'];
  const businessStatuses: BusinessStatus[] = [
    'PENDING',
    'APPROVED',
    'ACTIVE',
    'COMPLETED',
    'REJECTED',
    'BANNED',
    'CANCELLED',
    'SOLD_OUT',
    'INACTIVE',
  ];

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 space-y-16">
      {/* Header */}
      <div className="border-b border-line pb-8">
        <span className="rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-accent">
          Thiết kế Mẫu R · Bio-Luxury Tối
        </span>
        <h1 className="mt-4 text-4xl md:text-5xl font-bold tracking-tight text-fg font-sans">
          Bảng Duyệt Hệ Thống Giao Diện & Thành Phần UI
        </h1>
        <p className="mt-3 text-base text-fg-2 max-w-2xl">
          Trưng bày toàn diện bảng token màu sắc, thang 7 cấp bảo tồn IUCN, typography 3 font và 13 thành phần UI nguyên tử theo chuẩn thiết kế mẫu R.
        </p>
      </div>

      {/* 1. IUCN 7-Color Conservation Scale */}
      <section className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-fg tracking-tight">
            1. Thang 7 Cấp Độ Bảo Tồn IUCN
          </h2>
          <p className="text-sm text-fg-3">
            Huy hiệu phân loại bảo tồn chuẩn quốc tế với chấm tròn màu, mã viết tắt in hoa và nhãn tiếng Việt có dấu. Lưu ý cấp EX (Tuyệt chủng) có viền trắng mảnh nổi trên nền đen.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 p-6 rounded-2xl border border-line bg-surface">
          {iucnCodes.map((code) => (
            <IucnBadge key={code} code={code} size="md" />
          ))}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {iucnCodes.map((code) => {
            const spec = IUCN_SPECS[code];
            return (
              <div
                key={code}
                className="rounded-xl border border-line bg-surface-2 p-3 text-center flex flex-col items-center gap-2"
              >
                <div
                  className="h-6 w-6 rounded-full border border-white/20"
                  style={{ backgroundColor: spec.color }}
                />
                <span className="font-bold text-xs text-fg">{code}</span>
                <span className="text-[10px] text-fg-3">{spec.label}</span>
              </div>
            );
          })}
        </div>
      </section>

      {/* 2. Business Status Pills */}
      <section className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-fg tracking-tight">
            2. Trạng Thái Nghiệp Vụ (StatusPill)
          </h2>
          <p className="text-sm text-fg-3">
            Hiển thị trạng thái đơn hàng, sản phẩm kiểm duyệt, tài khoản shop với nền mờ 12% alpha và chữ cùng tông màu.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 p-6 rounded-2xl border border-line bg-surface">
          {businessStatuses.map((st) => (
            <StatusPill key={st} status={st} size="md" />
          ))}
        </div>
      </section>

      {/* 3. Typography Hierarchy */}
      <section className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-fg tracking-tight">
            3. Phân Cấp Typography 3 Họ Font
          </h2>
          <p className="text-sm text-fg-3">
            Be Vietnam Pro (sans-serif), Cormorant Garamond (serif italic cho tên khoa học), JetBrains Mono (monospace cho mã đơn và số liệu).
          </p>
        </div>

        <div className="rounded-2xl border border-line bg-surface p-6 space-y-4">
          <div>
            <span className="text-xs font-mono text-fg-mute">Display XL (84px/44px)</span>
            <p className="text-3xl md:text-5xl font-semibold text-fg tracking-tight">
              Mọi loài đều có quỹ đạo riêng trong sinh quyển
            </p>
          </div>
          <div className="pt-2 border-t border-line/40">
            <span className="text-xs font-mono text-fg-mute">Tên khoa học (Cormorant Garamond 500 Italic)</span>
            <p className="text-2xl font-serif italic text-accent">
              Ambystoma mexicanum · Nepenthes rajah · Python regius
            </p>
          </div>
          <div className="pt-2 border-t border-line/40">
            <span className="text-xs font-mono text-fg-mute">Mã & Số liệu (JetBrains Mono tabular-nums)</span>
            <p className="text-base font-mono text-fg-2">
              ORD-2026-0001 · 21.0285° N, 105.8542° E · Số lượng: 02 cá thể
            </p>
          </div>
        </div>
      </section>

      {/* 4. Buttons & Badges */}
      <section className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-fg tracking-tight">
            4. Nút Bấm Tương Tác (Buttons & Badges)
          </h2>
          <p className="text-sm text-fg-3">
            Hỗ trợ 6 biến thể (primary, secondary, outline, ghost, danger, icon) và trạng thái loading spinner.
          </p>
        </div>

        <div className="rounded-2xl border border-line bg-surface p-6 space-y-6">
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="primary">Primary Button</Button>
            <Button variant="secondary">Secondary Button</Button>
            <Button variant="outline">Outline Button</Button>
            <Button variant="ghost">Ghost Button</Button>
            <Button variant="danger">Danger Button</Button>
            <Button
              variant="primary"
              isLoading={btnLoading}
              onClick={() => {
                setBtnLoading(true);
                setTimeout(() => setBtnLoading(false), 2000);
              }}
            >
              {btnLoading ? 'Đang xử lý...' : 'Bấm thử Loading'}
            </Button>
            <Button variant="primary" pill leftIcon={<Sparkles className="h-4 w-4" />}>
              Pill Icon
            </Button>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-line/40">
            <Badge variant="default">Default Badge</Badge>
            <Badge variant="accent">Accent Badge</Badge>
            <Badge variant="success">Success Badge</Badge>
            <Badge variant="warning">Warning Badge</Badge>
            <Badge variant="danger">Danger Badge</Badge>
            <Kbd>⌘K</Kbd>
            <Kbd>Esc</Kbd>
          </div>
        </div>
      </section>

      {/* 5. Form Inputs */}
      <section className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-fg tracking-tight">
            5. Ô Nhập Liệu Form (Input, Textarea, Select)
          </h2>
          <p className="text-sm text-fg-3">
            Focus ring 2px xanh ngọc cách 3px, kiểm soát aria-invalid, autofill fix cho nền tối.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 rounded-2xl border border-line bg-surface p-6">
          <Input
            label="Tên loài sinh học"
            placeholder="Ví dụ: Kỳ giông Axolotl"
            leftIcon={<Search className="h-4 w-4" />}
            helperText="Nhập tên thường gọi hoặc tên khoa học."
          />
          <Input
            label="Địa chỉ email"
            type="email"
            defaultValue="invalid-email"
            error="Định dạng email không hợp lệ."
            leftIcon={<AlertCircle className="h-4 w-4" />}
          />
          <Select
            label="Lớp sinh học"
            value={selectVal}
            onChange={(e) => setSelectVal(e.target.value)}
            options={[
              { value: 'amphibia', label: 'Amphibia (Lớp Lưỡng cư)' },
              { value: 'reptilia', label: 'Reptilia (Lớp Bò sát)' },
              { value: 'magnoliopsida', label: 'Magnoliopsida (Lớp Ngọc lan)' },
            ]}
          />
          <div className="md:col-span-3">
            <Textarea
              label="Mô tả đặc điểm cá thể"
              placeholder="Nhập ghi chú tình trạng sức khỏe, nguồn gốc xuất xứ giống nhân tạo..."
              rows={3}
            />
          </div>
        </div>
      </section>

      {/* 6. Card, Tabs & Dialog */}
      <section className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-fg tracking-tight">
            6. Thành Phần Khối (Card, Tabs, Modal Dialog, Price)
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1 */}
          <Card interactive glow className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-accent uppercase tracking-wider">
                Thẻ tương tác Glow
              </span>
              <Price amount={1850000} size="md" />
            </div>
            <h3 className="text-lg font-bold text-fg">
              Ambystoma mexicanum · Axolotl
            </h3>
            <p className="text-xs text-fg-2">
              Kỳ giông Mexico đột biến Leucistic nuôi sinh sản nhân tạo thế hệ F2 có đầy đủ hồ sơ nguồn gốc.
            </p>
            <div className="flex items-center gap-2 pt-2">
              <IucnBadge code="CR" size="sm" />
              <StatusPill status="APPROVED" size="sm" />
            </div>
          </Card>

          {/* Card 2: Dialog Modal */}
          <Card className="flex flex-col justify-between space-y-4">
            <div>
              <h3 className="text-lg font-bold text-fg">Hộp Thoại Modal Accessible</h3>
              <p className="text-xs text-fg-2 mt-1">
                Bẫy focus bàn phím chuẩn WAI-ARIA, đóng bằng phím Escape hoặc click overlay.
              </p>
            </div>

            <Dialog>
              <DialogTrigger asChild>
                <Button variant="primary">Mở Hộp Thoại Kiểm Thử</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Xác nhận Đặt Hàng Sinh Vật Cảnh</DialogTitle>
                  <DialogDescription>
                    Vui lòng kiểm tra kỹ thông tin pháp lý của cá thể trước khi gửi giao dịch.
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-3 text-xs text-fg-2">
                  <div className="rounded-lg border border-line bg-surface p-3 flex justify-between items-center">
                    <span>Axolotl Leucistic F2</span>
                    <Price amount={1850000} />
                  </div>
                  <p className="text-[11px] text-fg-3">
                    Đơn hàng được lưu vào hệ sinh thái mock MSW 2 và trừ tồn kho tự động.
                  </p>
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline">Hủy bỏ</Button>
                  </DialogClose>
                  <Button variant="primary" leftIcon={<ShoppingCart className="h-4 w-4" />}>
                    Xác nhận đặt hàng
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </Card>
        </div>

        {/* Tabs Demo */}
        <div className="rounded-2xl border border-line bg-surface p-6">
          <Tabs defaultValue="overview">
            <TabsList>
              <TabsTrigger value="overview">Tổng quan</TabsTrigger>
              <TabsTrigger value="taxonomy">Phân loại học</TabsTrigger>
              <TabsTrigger value="skeleton">Khung xương Skeleton</TabsTrigger>
            </TabsList>
            <TabsContent value="overview" className="text-sm text-fg-2">
              BioNexus số hóa sinh quyển với cấu trúc phân cấp 6 bậc, kết nối hồ sơ khoa học tạp chí với sàn cá thể nhân giống hợp pháp.
            </TabsContent>
            <TabsContent value="taxonomy" className="text-sm text-fg-2">
              Hệ thống 6 cấp: Giới (Kingdom) → Ngành (Phylum) → Lớp (Class) → Bộ (Order) → Họ (Family) → Chi (Genus) → Loài (Species).
            </TabsContent>
            <TabsContent value="skeleton" className="space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-10 w-32" />
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* 7. Real Photos Demo */}
      <section className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-fg tracking-tight">
            7. Thành Phần Hiển Thị Ảnh Thật & Ghi Công (Photo + PhotoCredit)
          </h2>
          <p className="text-sm text-fg-3">
            Hỗ trợ thẻ picture đa định dạng (AVIF, WebP, JPG), placeholder mờ chống giật bố cục (CLS = 0) và chip ghi công bản quyền tự do.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {['axolotl/hero-1', 'nepenthes-rajah/hero-1', 'ball-python/hero-1'].map((photoId) => {
            const p = PHOTOS[photoId];
            if (!p) return null;
            return (
              <div key={photoId} className="group relative rounded-2xl overflow-hidden border border-line bg-surface">
                <Photo photo={p} className="aspect-video w-full" />
                <PhotoCredit credit={p.credit} variant="hover-chip" />
                <div className="p-4">
                  <h4 className="text-sm font-semibold text-fg">{p.title}</h4>
                  <p className="text-xs font-serif italic text-accent">{p.scientificName}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
