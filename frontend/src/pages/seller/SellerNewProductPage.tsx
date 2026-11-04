import React from 'react';
import { useNavigate } from 'react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowRight } from 'lucide-react';
import { PageContainer, PageHeader, Panel } from '@/components/layout/Page';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { IucnBadge } from '@/components/ui/IucnBadge';
import { Skeleton } from '@/components/ui/Skeleton';
import { QueryErrorState } from '@/components/domain/QueryErrorState';
import { useMe } from '@/api/queries/useAuthQueries';
import { ApiError } from '@/api/errors';
import { useSpeciesList } from '@/api/queries/useSpeciesQueries';
import { useCreateProduct } from '@/api/mutations/useSellerMutations';
import { formatVnd } from '@/lib/parseEnvironmentSpecs';
import { SPECIES_EXTRAS } from '@/content/species-extras';
import { PRODUCT_PLACEHOLDER_IMAGE, type SpeciesViewModel } from '@/api/adapters';
import { toast } from 'sonner';
import { ShopStatusNotice } from './components/ShopStatusNotice';
import { FormPreview, PreviewMediaCard } from './components/FormPreview';

const newProductSchema = z.object({
  speciesId: z.coerce.number().min(1, 'Vui lòng chọn loài sinh học trong bách khoa'),
  productName: z
    .string()
    .min(5, 'Tên cá thể thương mại phải có ít nhất 5 ký tự')
    .max(100, 'Tên cá thể không được vượt quá 100 ký tự'),
  price: z.coerce.number().min(10000, 'Giá bán niêm yết tối thiểu là 10.000 ₫'),
  stockQuantity: z.coerce
    .number()
    .int('Số lượng phải là số nguyên')
    .min(1, 'Số lượng cá thể đăng bán ban đầu tối thiểu là 1'),
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
  const navigate = useNavigate();
  const { data: me, isLoading: isMeLoading, isError: isMeError, error: meError, refetch: refetchMe } = useMe();
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
      // Không điền sẵn ảnh của một loài cố định: ảnh chỉ được gợi ý sau khi chọn loài
      imageUrl: '',
    },
  });

  const formValues = watch();
  const selectedSpecies = speciesList.find((s: SpeciesViewModel) => s.id === Number(formValues.speciesId));

  // Tự động gợi ý ảnh khi đổi loài
  const handleSpeciesChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const sId = Number(e.target.value);
    setValue('speciesId', sId, { shouldValidate: true });
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
      const created = await createProductMutation.mutateAsync({
        speciesId: values.speciesId,
        productName: values.productName.trim(),
        price: values.price,
        stockQuantity: values.stockQuantity,
        description: values.description.trim(),
        imageUrl: values.imageUrl.trim(),
      });

      toast.success('Đã gửi, đang chờ kiểm duyệt');
      // Tài liệu 03 mục 13: về /seller và tô sáng dòng mới
      navigate(`/seller?moi=${created.id}`);
    } catch (err) {
      if (err instanceof ApiError && err.code === 'SELLER_NOT_ACTIVE') {
        // Shop vừa bị đổi trạng thái: tải lại hồ sơ để hiện thẻ trạng thái thay cho form
        void refetchMe();
      }
      toast.error(err instanceof Error && err.message ? err.message : 'Không thể tạo hồ sơ sản phẩm');
    }
  };

  if (isMeLoading) {
    return (
      <PageContainer className="space-y-6 py-12" role="status" aria-label="Đang kiểm tra shop">
        <Skeleton className="h-24 w-1/2" />
        <Skeleton className="h-96 w-full rounded-[20px]" />
      </PageContainer>
    );
  }

  if (isMeError) {
    return (
      <PageContainer className="py-16">
        <QueryErrorState title="Không tải được thông tin shop" error={meError} onRetry={() => refetchMe()} />
      </PageContainer>
    );
  }

  // Tài liệu 03 mục 13: shop chưa ACTIVE thì hiện trạng thái shop kèm hướng dẫn, không hiện form
  if (!shop || shop.status !== 'ACTIVE') {
    return <ShopStatusNotice shop={shop ?? null} context="new-product" />;
  }

  return (
    <PageContainer className="pb-20">
      <PageHeader
        breadcrumbs={[{ label: 'Kênh người bán', to: '/seller' }, { label: 'Đăng bán cá thể mới' }]}
        eyebrow={shop.shopName}
        title="Đăng bán cá thể mới"
        description="Cá thể lên sàn sau khi kiểm duyệt viên đối chiếu với loài trong bách khoa."
      />

      <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_360px]">
        <Panel className="md:p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
            <Select
              id="speciesId"
              label="Loài trong bách khoa"
              required
              value={formValues.speciesId ? String(formValues.speciesId) : ''}
              onChange={handleSpeciesChange}
              error={errors.speciesId?.message}
              helperText="Cá thể kế thừa mức bảo tồn IUCN và điều kiện sống của loài."
              options={[
                { label: 'Chọn loài', value: '' },
                ...speciesList.map((s: SpeciesViewModel) => ({
                  label: `${s.displayName} (${s.scientificName}) · ${s.conservationStatus}`,
                  value: String(s.id),
                })),
              ]}
            />

            <Input
              id="productName"
              label="Tên thương mại của cá thể"
              required
              {...register('productName')}
              placeholder="Ví dụ: Rồng Úc Hypo Baby (2 tháng tuổi)"
              error={errors.productName?.message}
            />

            <div className="grid gap-6 sm:grid-cols-2">
              <Input
                id="price"
                label="Giá bán (VND)"
                required
                type="number"
                step="10000"
                {...register('price')}
                placeholder="850000"
                error={errors.price?.message}
                helperText={formatVnd(Number(formValues.price) || 0)}
                className="font-mono"
              />
              <Input
                id="stockQuantity"
                label="Số cá thể có sẵn"
                required
                type="number"
                min="1"
                {...register('stockQuantity')}
                placeholder="1"
                error={errors.stockQuantity?.message}
                className="font-mono"
              />
            </div>

            <Input
              id="imageUrl"
              label="Đường dẫn ảnh chụp thực tế"
              required
              {...register('imageUrl')}
              placeholder="photos/axolotl/hero-960.webp hoặc URL ảnh"
              error={errors.imageUrl?.message}
            />

            <Textarea
              id="description"
              label="Mô tả thể trạng và tập tính ăn"
              required
              {...register('description')}
              rows={5}
              placeholder="Độ tuổi, màu sắc (morph), lịch sử lột xác, thức ăn, tình trạng sức khỏe..."
              error={errors.description?.message}
            />

            <p className="text-sm leading-relaxed text-fg-3">
              Sản phẩm mới ở trạng thái chờ duyệt và chỉ hiện trên sàn khi kiểm duyệt viên phê duyệt.
            </p>

            <Button type="submit" size="lg" pill isLoading={createProductMutation.isPending} className="w-full gap-2 sm:w-auto">
              <span>{createProductMutation.isPending ? 'Đang gửi hồ sơ...' : 'Nộp hồ sơ kiểm duyệt'}</span>
              {!createProductMutation.isPending && <ArrowRight className="size-4" aria-hidden="true" />}
            </Button>
          </form>
        </Panel>

        <FormPreview>
          <PreviewMediaCard
            image={formValues.imageUrl || PRODUCT_PLACEHOLDER_IMAGE}
            badge={
              selectedSpecies?.conservationStatus ? (
                <IucnBadge code={selectedSpecies.conservationStatus} size="sm" onMedia />
              ) : undefined
            }
            title={formValues.productName || 'Tên cá thể thương mại'}
            subtitle={selectedSpecies ? <i className="font-serif text-[15px]">{selectedSpecies.scientificName}</i> : shop.shopName}
            footer={
              <>
                <span className="font-mono">{formatVnd(Number(formValues.price) || 0)}</span>
                <span>Còn {formValues.stockQuantity || 1} cá thể</span>
              </>
            }
          />
          <p className="mt-3 text-sm text-fg-3">Thẻ sẽ hiện trên sàn sau khi được duyệt.</p>
        </FormPreview>
      </div>
    </PageContainer>
  );
}
