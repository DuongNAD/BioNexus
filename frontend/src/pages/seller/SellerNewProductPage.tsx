import React from 'react';
import { Link } from 'react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  ArrowRight,
  ShieldCheck,
  Store,
  ArrowLeft,
  Image as ImageIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Price } from '@/components/ui/Price';
import { Badge } from '@/components/ui/Badge';
import { IucnBadge } from '@/components/ui/IucnBadge';
import { useMe } from '@/api/queries/useAuthQueries';
import { useSpeciesList } from '@/api/queries/useSpeciesQueries';
import { useCreateProduct } from '@/api/mutations/useSellerMutations';
import { formatVnd } from '@/lib/parseEnvironmentSpecs';
import { SPECIES_EXTRAS } from '@/content/species-extras';
import type { SpeciesViewModel } from '@/api/adapters';
import { toast } from 'sonner';

const newProductSchema = z.object({
  speciesId: z.coerce.number().min(1, 'Vui lòng chọn loài sinh học trong bách khoa'),
  productName: z
    .string()
    .min(5, 'Tên cá thể thương mại phải có ít nhất 5 ký tự')
    .max(100, 'Tên cá thể không được vượt quá 100 ký tự'),
  price: z.coerce.number().min(10000, 'Giá bán niêm yết tối thiểu là 10.000 ₫'),
  stockQuantity: z.coerce.number().min(1, 'Số lượng cá thể đăng bán ban đầu tối thiểu là 1'),
  description: z
    .string()
    .min(20, 'Mô tả chi tiết thể trạng cá thể cần tối thiểu 20 ký tự')
    .max(1000, 'Mô tả không được vượt quá 1000 ký tự'),
  imageUrl: z
    .string()
    .min(5, 'Vui lòng nhập đường dẫn ảnh chụp thực tế cá thể hoặc chọn ảnh mẫu'),
});

type NewProductFormData = z.infer<typeof newProductSchema>;

export default function SellerNewProductPage(): React.JSX.Element {
  const { data: me } = useMe();
  const shop = me?.shop;

  const { data: speciesList = [] } = useSpeciesList();
  const createProductMutation = useCreateProduct();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<NewProductFormData>({
    resolver: zodResolver(newProductSchema),
    defaultValues: {
      speciesId: 0,
      productName: '',
      price: 500000,
      stockQuantity: 1,
      description: '',
      imageUrl: 'photos/axolotl/hero-960.webp',
    },
  });

  const formValues = watch();

  // Tìm loài đã chọn
  const selectedSpecies = speciesList.find((s: SpeciesViewModel) => s.id === Number(formValues.speciesId));

  // Tự động gợi ý ảnh khi đổi loài
  const handleSpeciesChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const sId = Number(e.target.value);
    setValue('speciesId', sId);
    const sp = speciesList.find((s: SpeciesViewModel) => s.id === sId);
    if (sp) {
      const extra = SPECIES_EXTRAS[sp.scientificName];
      if (extra?.slug) {
        setValue('imageUrl', `photos/${extra.slug}/hero-960.webp`);
      }
    }
  };

  const onSubmit = async (values: NewProductFormData) => {
    try {
      await createProductMutation.mutateAsync({
        speciesId: values.speciesId,
        productName: values.productName.trim(),
        price: values.price,
        stockQuantity: values.stockQuantity,
        description: values.description.trim(),
        imageUrl: values.imageUrl.trim(),
      });

      toast.success('Đã gửi thông tin cá thể lên hàng đợi kiểm duyệt Admin (PENDING)!');
      window.location.hash = '#/seller';
    } catch (err: any) {
      toast.error(err.message || 'Không thể tạo hồ sơ sản phẩm');
    }
  };

  // Kiểm tra quyền
  if (!shop || shop.status !== 'ACTIVE') {
    return (
      <div className="rounded-2xl border border-line bg-surface p-8 text-center max-w-lg mx-auto space-y-4">
        <Store className="size-12 text-fg-3 mx-auto" />
        <h2 className="text-xl font-bold text-fg">Chưa được cấp phép đăng bán</h2>
        <p className="text-xs text-fg-2">
          Chỉ các cơ sở nhân giống có trạng thái hoạt động (ACTIVE) mới được niêm yết cá thể lên sàn BioNexus.
        </p>
        <Link to="/seller">
          <Button variant="primary" pill>Về Kênh người bán</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl">
      <div>
        <Link to="/seller" className="inline-flex items-center gap-1.5 text-xs text-fg-3 hover:text-accent transition-colors mb-2">
          <ArrowLeft className="size-3.5" />
          <span>Quay lại Bảng điều khiển Shop</span>
        </Link>
        <h1 className="text-2xl font-bold tracking-tight text-fg font-sans">
          Đăng Ký Cá Thể Sinh Vật Cảnh Mới
        </h1>
        <p className="mt-1 text-xs text-fg-3">
          Thông tin cá thể sẽ được đối soát sinh học và kích hoạt mở bán sau khi được kiểm duyệt viên phê duyệt
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Cột trái (60% Form) */}
        <div className="lg:col-span-7">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="rounded-2xl border border-line bg-surface-1/70 backdrop-blur-xl p-6 md:p-8 shadow-xl space-y-5"
          >
            {/* 1. Chọn loài bách khoa */}
            <div>
              <label htmlFor="speciesId" className="block text-xs font-medium text-fg-2 mb-1.5">
                Loài sinh học trong Bách khoa toàn thư *
              </label>
              <Select
                id="speciesId"
                value={formValues.speciesId ? String(formValues.speciesId) : ''}
                onChange={handleSpeciesChange}
                error={errors.speciesId?.message}
                options={[
                  { label: '-- Chọn loài để đối soát bảo tồn --', value: '' },
                  ...speciesList.map((s: SpeciesViewModel) => ({
                    label: `${s.commonName} (${s.scientificName}) [${s.conservationStatus}]`,
                    value: String(s.id),
                  })),
                ]}
                className="text-xs"
              />
              <p className="mt-1 text-[11px] text-fg-3">
                Mỗi cá thể bán ra đều kế thừa bậc bảo tồn IUCN và chỉ số sinh cảnh từ bách khoa BioNexus.
              </p>
            </div>

            {/* 2. Tên thương mại */}
            <div>
              <label htmlFor="productName" className="block text-xs font-medium text-fg-2 mb-1.5">
                Tên thương mại của cá thể *
              </label>
              <Input
                id="productName"
                {...register('productName')}
                placeholder="Ví dụ: Rồng Úc Hypo Baby (2 tháng tuổi)"
                error={errors.productName?.message}
                className="text-xs"
              />
            </div>

            {/* 3. Giá & Số lượng tồn kho */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="price" className="block text-xs font-medium text-fg-2 mb-1.5">
                  Giá bán niêm yết (VND) *
                </label>
                <Input
                  id="price"
                  type="number"
                  step="10000"
                  {...register('price')}
                  placeholder="850000"
                  error={errors.price?.message}
                  className="text-xs font-mono"
                />
                <span className="text-[11px] text-accent font-mono block mt-1">
                  {formatVnd(Number(formValues.price) || 0)}
                </span>
              </div>

              <div>
                <label htmlFor="stockQuantity" className="block text-xs font-medium text-fg-2 mb-1.5">
                  Số lượng cá thể có sẵn *
                </label>
                <Input
                  id="stockQuantity"
                  type="number"
                  min="1"
                  {...register('stockQuantity')}
                  placeholder="1"
                  error={errors.stockQuantity?.message}
                  className="text-xs font-mono"
                />
              </div>
            </div>

            {/* 4. Ảnh cá thể */}
            <div>
              <label htmlFor="imageUrl" className="block text-xs font-medium text-fg-2 mb-1.5">
                Đường dẫn ảnh chụp thực tế cá thể *
              </label>
              <div className="relative">
                <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-fg-3" />
                <Input
                  id="imageUrl"
                  {...register('imageUrl')}
                  placeholder="photos/axolotl/hero-960.webp hoặc URL ảnh..."
                  error={errors.imageUrl?.message}
                  className="pl-9 text-xs"
                />
              </div>
            </div>

            {/* 5. Mô tả cá thể */}
            <div>
              <label htmlFor="description" className="block text-xs font-medium text-fg-2 mb-1.5">
                Mô tả chi tiết thể trạng & tập tính ăn *
              </label>
              <Textarea
                id="description"
                {...register('description')}
                rows={4}
                placeholder="Độ tuổi, morph màu sắc, lịch sử lột xác, thói quen ăn uống (dế, sâu, thức ăn đông lạnh), tình trạng sức khỏe..."
                error={errors.description?.message}
                className="text-xs"
              />
            </div>

            <div className="rounded-xl border border-line bg-surface-2/40 p-3.5 text-xs text-fg-3 flex items-start gap-2.5">
              <ShieldCheck className="size-4 text-accent shrink-0 mt-0.5" />
              <span>
                Sản phẩm sau khi nộp sẽ ở trạng thái <span className="font-mono text-amber-300">PENDING</span> và chỉ xuất hiện trên sàn công khai khi được kiểm duyệt viên phê duyệt.
              </span>
            </div>

            <Button
              type="submit"
              size="lg"
              pill
              variant="primary"
              disabled={createProductMutation.isPending}
              className="w-full gap-2 font-bold shadow-[var(--glow-accent-btn)]"
            >
              {createProductMutation.isPending ? (
                <div className="size-4 animate-spin rounded-full border-2 border-accent-ink border-t-transparent" />
              ) : (
                <ArrowRight className="size-4" />
              )}
              <span>{createProductMutation.isPending ? 'Đang gửi hồ sơ...' : 'Nộp hồ sơ kiểm duyệt'}</span>
            </Button>
          </form>
        </div>

        {/* Cột phải (40% Live Sticky Preview): Xem trước thẻ ProductCard */}
        <aside className="lg:col-span-5 sticky top-24 space-y-4">
          <span className="text-xs uppercase font-mono font-bold tracking-wider text-accent block">
            Xem trước hiển thị trên sàn (Live Sticky Preview)
          </span>

          <div className="relative rounded-2xl overflow-hidden border-2 border-dashed border-accent/40 bg-surface-1 p-3 shadow-2xl">
            {/* Watermark xem trước */}
            <div className="absolute top-6 right-6 z-20 pointer-events-none">
              <span className="rounded-full bg-amber-500/20 border border-amber-500/40 px-2.5 py-0.5 text-[10px] font-mono text-amber-300 font-bold backdrop-blur-md">
                BẢN XEM TRƯỚC · PENDING
              </span>
            </div>

            {/* Khung thẻ giả lập ProductCard */}
            <div className="rounded-xl overflow-hidden bg-surface-2 border border-line flex flex-col justify-between">
              <div className="relative aspect-[4/5] w-full overflow-hidden bg-black/40">
                <img
                  src={formValues.imageUrl || 'photos/product-placeholder.webp'}
                  alt={formValues.productName || 'Xem trước cá thể'}
                  className="size-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />

                <div className="absolute top-3 left-3">
                  <Badge variant="accent" size="sm" className="bg-black/70 backdrop-blur-md text-[10px] uppercase font-mono border border-accent/30">
                    <ShieldCheck className="size-3 mr-1 text-accent" /> F2+ Nhân tạo
                  </Badge>
                </div>

                {selectedSpecies?.conservationStatus && (
                  <div className="absolute top-3 right-3">
                    <IucnBadge code={selectedSpecies.conservationStatus} size="sm" showLabel={false} />
                  </div>
                )}

                <div className="absolute bottom-2.5 left-3 text-[11px] font-medium text-emerald-300 bg-emerald-500/20 border border-emerald-500/30 px-2 py-0.5 rounded-md font-mono">
                  Còn {formValues.stockQuantity || 1} cá thể
                </div>
              </div>

              <div className="p-4 space-y-2">
                <div className="flex items-center gap-1.5 text-xs text-fg-3">
                  <Store className="size-3.5 text-accent shrink-0" />
                  <span className="truncate">{shop.shopName}</span>
                </div>

                <h4 className="font-semibold text-fg text-base line-clamp-1 font-sans">
                  {formValues.productName || 'Tên cá thể thương mại'}
                </h4>

                {selectedSpecies && (
                  <p className="text-xs italic text-fg-mute font-serif line-clamp-1">
                    {selectedSpecies.scientificName} · {selectedSpecies.commonName}
                  </p>
                )}

                <p className="text-xs text-fg-2 line-clamp-2 leading-relaxed">
                  {formValues.description || 'Mô tả chi tiết thể trạng cá thể sẽ xuất hiện tại đây...'}
                </p>
              </div>

              <div className="p-4 pt-0 flex items-center justify-between border-t border-line/40 mt-2">
                <Price amount={Number(formValues.price) || 0} size="md" />
                <Button size="sm" pill variant="secondary" disabled className="text-xs">
                  Thêm giỏ
                </Button>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
