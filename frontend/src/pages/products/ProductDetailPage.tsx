import React, { useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import { Store, ShoppingBag, AlertTriangle, Info, CheckCircle2, Share2, ArrowRight, SearchX } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Price } from '@/components/ui/Price';
import { IucnBadge } from '@/components/ui/IucnBadge';
import { Skeleton } from '@/components/ui/Skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/Dialog';
import { NumberStepper } from '@/components/ui/NumberStepper';
import { PageContainer, Breadcrumbs, Section, type BreadcrumbItem } from '@/components/layout/Page';
import { LensMagnifier } from '@/components/domain/LensMagnifier';
import { Lightbox } from '@/components/domain/Lightbox';
import { ProductCard } from '@/components/domain/ProductCard';
import { triggerFlyToCart } from '@/components/domain/FlyToCart';
import { ButtonLink } from '@/components/domain/ButtonLink';
import { QueryErrorState } from '@/components/domain/QueryErrorState';
import { useProductDetail, useProducts } from '@/api/queries/useProductQueries';
import { useSpeciesDetail } from '@/api/queries/useSpeciesQueries';
import { useCart } from '@/api/queries/useCartQueries';
import { useMe, useAuthState } from '@/api/queries/useAuthQueries';
import { useAddToCart } from '@/api/mutations/useCartMutations';
import { PRODUCT_PLACEHOLDER_IMAGE } from '@/api/adapters';
import { ApiError } from '@/api/errors';
import { SHIPPING_AND_CARE_COPY } from '@/content/copy';
import { SPECIES_EXTRAS } from '@/content/species-extras';
import { PHOTOS, type PhotoMetadata } from '@/content/photos';
import { cn } from '@/lib/cn';
import { toast } from 'sonner';

export default function ProductDetailPage(): React.JSX.Element {
  const { id } = useParams<{ id: string }>();
  const productId = Number(id);
  const isValidId = Number.isInteger(productId) && productId > 0;
  const navigate = useNavigate();

  const [quantity, setQuantity] = useState(1);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isLoginDialogOpen, setIsLoginDialogOpen] = useState(false);

  // Queries
  const {
    data: product,
    isLoading: isProductLoading,
    error: productError,
    refetch: refetchProduct,
    isRefetching: isProductRefetching,
  } = useProductDetail(productId, { enabled: isValidId });
  const { data: species } = useSpeciesDetail(product?.speciesId || 0, {
    enabled: !!product?.speciesId,
  });

  const auth = useAuthState();
  const token = auth.token;
  // useMe/useCart tự tắt với khách và tài khoản admin
  const { data: me } = useMe();
  const { data: cart } = useCart();
  const addToCartMutation = useAddToCart();

  // Related products query (other products of same species)
  const { data: relatedSpeciesPage } = useProducts({
    speciesId: product?.speciesId,
    size: 5,
  });

  const relatedProducts = useMemo(() => {
    return (relatedSpeciesPage?.items || []).filter((p) => p.id !== productId).slice(0, 4);
  }, [relatedSpeciesPage, productId]);

  // Tính số lượng cá thể này đã có trong giỏ hàng
  const inCartItem = cart?.items.find((i) => i.productId === productId);
  const inCartQty = inCartItem?.quantity || 0;
  const availableStock = product ? product.stockQuantity : 0;
  const remainingPurchasable = Math.max(0, availableStock - inCartQty);

  // Danh sách ảnh: Ảnh sản phẩm + Ảnh đối soát bách khoa
  const galleryPhotos = useMemo(() => {
    const list: { src: string; alt: string; label?: string }[] = [];
    if (product?.displayImage) {
      list.push({ src: product.displayImage, alt: product.productName, label: 'Ảnh cá thể' });
    }
    if (species?.heroPhoto) {
      list.push({ src: species.heroPhoto, alt: `${species.displayName} - Mẫu chuẩn loài`, label: 'Mẫu chuẩn của loài' });
    }
    if (species?.galleryPhotos && species.galleryPhotos.length > 0) {
      species.galleryPhotos.slice(0, 2).forEach((g, idx) => {
        list.push({ src: g, alt: `${species.displayName} ảnh ${idx + 1}`, label: 'Ảnh loài' });
      });
    }
    // Loài catalog: ảnh cá thể chính là ảnh portrait của loài, bỏ ảnh trùng và ảnh giữ chỗ lặp lại
    const seen = new Set<string>();
    return list.filter((p) => {
      if (seen.has(p.src) || (p.src === PRODUCT_PLACEHOLDER_IMAGE && seen.size > 0)) return false;
      seen.add(p.src);
      return true;
    });
  }, [product, species]);

  const activePhoto = galleryPhotos[selectedPhotoIndex] || galleryPhotos[0] || {
    src: PRODUCT_PLACEHOLDER_IMAGE,
    alt: 'Ảnh sản phẩm',
  };

  // Chuẩn bị metadata cho Lightbox
  const lightboxPhotos: PhotoMetadata[] = useMemo(() => {
    if (!species?.scientificName) return [];
    const extra = SPECIES_EXTRAS[species.scientificName];
    if (extra?.heroPhotoId && PHOTOS[extra.heroPhotoId]) {
      const p = PHOTOS[extra.heroPhotoId];
      return p ? [p] : [];
    }
    // Loài không có ảnh đã ghi nguồn thì không mở Lightbox, tránh hiện ảnh của loài khác
    return [];
  }, [species]);

  // Kiểm tra quyền mua & sở hữu
  const isOwner = Boolean(me?.shop?.id && product && me.shop.id === product.sellerProfileId);
  const isOutOfStock = Boolean(product && (product.isOutOfStock || availableStock <= 0));
  const isReachedCartLimit = Boolean(product && inCartQty >= availableStock);

  // Thêm vào giỏ hàng
  const handleAddToCart = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!token) {
      setIsLoginDialogOpen(true);
      return;
    }
    if (auth.accountType !== 'USER') {
      toast.error('Tài khoản quản trị không dùng được giỏ hàng.');
      return;
    }
    if (addToCartMutation.isPending) return;
    if (isOwner) {
      toast.error('Bạn không thể mua sản phẩm của chính shop mình');
      return;
    }
    if (isOutOfStock || isReachedCartLimit) {
      toast.error('Sản phẩm đã hết hàng hoặc đã đạt giới hạn kho');
      return;
    }

    triggerFlyToCart(e, product?.displayImage);

    addToCartMutation.mutate(
      { productId, quantity },
      {
        onSuccess: () => {
          toast.success(`Đã thêm ${quantity} cá thể "${product?.productName}" vào giỏ`);
          setQuantity(1);
        },
        onError: (err) => {
          toast.error(err.message || 'Không thể thêm vào giỏ hàng');
        },
      }
    );
  };

  // Mua ngay
  const handleBuyNow = () => {
    if (!token) {
      setIsLoginDialogOpen(true);
      return;
    }
    if (auth.accountType !== 'USER') {
      toast.error('Tài khoản quản trị không đặt hàng được.');
      return;
    }
    if (isOwner) {
      toast.error('Bạn không thể mua sản phẩm của chính shop mình');
      return;
    }
    if (isOutOfStock) {
      toast.error('Sản phẩm đã hết hàng');
      return;
    }
    navigate(`/checkout?productId=${productId}&quantity=${quantity}`);
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title: product?.productName, url: window.location.href });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast.success('Đã sao chép liên kết cá thể');
      }
    } catch (err) {
      // Người dùng đóng bảng chia sẻ (AbortError) thì không phải lỗi
      if (err instanceof DOMException && err.name === 'AbortError') return;
      toast.error('Không chia sẻ được liên kết. Hãy sao chép địa chỉ trên thanh trình duyệt.');
    }
  };

  if (isProductLoading) {
    return (
      <PageContainer className="pt-10 pb-20 md:pt-16" role="status" aria-label="Đang tải thông tin cá thể">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-14">
          <div className="space-y-3">
            <Skeleton className="aspect-[4/3] w-full rounded-[20px]" />
            <div className="flex gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="size-20 rounded-xl" />
              ))}
            </div>
          </div>
          <div className="space-y-4">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-12 w-3/4" />
            <Skeleton className="h-10 w-1/2" />
            <Skeleton className="h-40 w-full rounded-[20px]" />
          </div>
        </div>
      </PageContainer>
    );
  }

  // Chỉ 400/404 mới là "không tìm thấy"; lỗi mạng hay 500 thì cho thử lại
  const isNotFound =
    !isValidId ||
    (productError instanceof ApiError && (productError.status === 404 || productError.status === 400)) ||
    (!productError && !product);
  if (productError && !isNotFound) {
    return (
      <PageContainer className="py-16">
        <QueryErrorState
          title="Không tải được thông tin sinh vật cảnh"
          error={productError}
          onRetry={() => refetchProduct()}
          isRetrying={isProductRefetching}
        />
      </PageContainer>
    );
  }

  if (isNotFound || !product) {
    return (
      <PageContainer width="narrow" className="flex min-h-[60vh] flex-col items-center justify-center py-16 text-center">
        <SearchX className="mb-5 size-10 text-accent" aria-hidden="true" />
        <p className="text-xs font-semibold tracking-[0.2em] text-fg-3 uppercase">Lỗi 404</p>
        <h1 className="mt-3 text-[34px] leading-tight font-semibold tracking-[-0.035em] text-fg md:text-5xl">
          Không tìm thấy sinh vật cảnh
        </h1>
        <p className="mt-4 max-w-md text-base leading-relaxed text-fg-2">
          Cá thể này không tồn tại, đã ngừng bán hoặc đang chờ kiểm duyệt.
        </p>
        <ButtonLink to="/products" pill className="mt-8">
          Xem các cá thể khác
        </ButtonLink>
      </PageContainer>
    );
  }

  const specs = species?.parsedSpecs;
  const tempText = specs?.tempMin != null && specs?.tempMax != null ? `${specs.tempMin}–${specs.tempMax}°C` : null;
  const humidText = specs?.humidityNotApplicable
    ? 'Sống dưới nước'
    : specs?.humidMin != null && specs?.humidMax != null
      ? `${specs.humidMin}–${specs.humidMax}%`
      : null;
  const canBuy = !isOutOfStock && !isOwner;

  const breadcrumbs: BreadcrumbItem[] = [
    { label: 'Sàn sinh vật cảnh', to: '/products' },
    ...(species ? [{ label: species.displayName, to: `/products?speciesId=${species.id}` }] : []),
    { label: product.productName },
  ];

  return (
    <PageContainer className="pb-28 md:pb-20">
      <Breadcrumbs items={breadcrumbs} className="pt-8 md:pt-12" />

      <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-14">
        {/* Ảnh: ảnh cá thể thật trước, sau đó là ảnh mẫu chuẩn của loài để đối chiếu */}
        <div className="min-w-0 space-y-3">
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[20px] border border-line bg-bg-raised">
            <LensMagnifier
              src={activePhoto.src}
              alt={activePhoto.alt}
              zoomLevel={2.5}
              lensSize={160}
              onOpenLightbox={lightboxPhotos.length > 0 ? () => setIsLightboxOpen(true) : undefined}
              className="size-full"
            />
            {activePhoto.label && (
              <span className="pointer-events-none absolute bottom-3 left-3 rounded-full bg-black/65 px-3 py-1 text-xs text-white/90 backdrop-blur-md">
                {activePhoto.label}
              </span>
            )}
          </div>

          {galleryPhotos.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-1">
              {galleryPhotos.map((photo, index) => {
                const isSelected = index === selectedPhotoIndex;
                return (
                  <button
                    key={index}
                    type="button"
                    aria-label={`Xem ảnh ${index + 1}: ${photo.label || photo.alt}`}
                    aria-pressed={isSelected}
                    onClick={() => setSelectedPhotoIndex(index)}
                    className={cn(
                      'size-20 shrink-0 overflow-hidden rounded-xl border-2 bg-bg-raised transition-opacity md:size-24',
                      isSelected ? 'border-accent' : 'border-transparent opacity-60 hover:opacity-100'
                    )}
                  >
                    <img src={photo.src} alt="" className="size-full object-cover" />
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Thông tin và mua hàng */}
        <div className="min-w-0 lg:sticky lg:top-24 lg:self-start">
          <div className="flex items-center justify-between gap-3 text-sm text-fg-3">
            <span>
              Mã cá thể <span className="font-mono text-fg-2">PRD-{product.id.toString().padStart(4, '0')}</span>
            </span>
            <button
              type="button"
              onClick={() => void handleShare()}
              className="inline-flex items-center gap-1.5 rounded-full px-2 py-1 transition-colors hover:text-accent"
              aria-label="Chia sẻ liên kết cá thể"
            >
              <Share2 className="size-4" aria-hidden="true" />
              <span>Chia sẻ</span>
            </button>
          </div>

          <h1 className="mt-3 text-[30px] leading-[1.1] font-semibold tracking-[-0.03em] text-fg text-balance md:text-[40px]">
            {product.productName}
          </h1>

          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2">
            {species ? (
              <Link to={`/species/${species.id}`} className="text-fg-2 transition-colors hover:text-accent">
                <i className="font-serif text-lg">{species.scientificName}</i>
                <span className="text-fg-3"> · {species.displayName}</span>
              </Link>
            ) : (
              product.speciesScientificName && (
                <i className="font-serif text-lg text-fg-2">{product.speciesScientificName}</i>
              )
            )}
            {product.conservationStatus && <IucnBadge code={product.conservationStatus} size="md" />}
          </div>

          <div className="mt-8">
            <Price amount={product.price} size="lg" className="text-3xl text-fg md:text-4xl" />
            <p
              className={cn(
                'mt-2 flex items-center gap-2 text-sm',
                isOutOfStock ? 'text-fg-3' : availableStock <= 2 ? 'text-warm' : 'text-success'
              )}
            >
              {isOutOfStock ? (
                <Info className="size-4 shrink-0" aria-hidden="true" />
              ) : availableStock <= 2 ? (
                <AlertTriangle className="size-4 shrink-0" aria-hidden="true" />
              ) : (
                <CheckCircle2 className="size-4 shrink-0" aria-hidden="true" />
              )}
              <span>
                {isOutOfStock
                  ? 'Cá thể này đã hết hàng hoặc ngừng mở bán.'
                  : availableStock <= 2
                    ? `Chỉ còn ${availableStock} cá thể`
                    : `Còn ${availableStock} cá thể sẵn sàng giao`}
              </span>
            </p>
            {inCartQty > 0 && !isOutOfStock && (
              <p className="mt-1 text-sm text-fg-3">Bạn đã có {inCartQty} cá thể trong giỏ hàng.</p>
            )}
          </div>

          {isOwner && (
            <p className="mt-6 flex items-start gap-2 text-sm text-warm">
              <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              <span>Đây là sản phẩm của chính shop bạn, nên bạn không thể tự mua.</span>
            </p>
          )}

          {canBuy && (
            <div className="mt-8 space-y-4">
              <div className="flex items-center justify-between gap-4">
                <span className="text-sm text-fg-2">Số lượng</span>
                <NumberStepper
                  value={quantity}
                  min={1}
                  max={Math.max(1, remainingPurchasable)}
                  onChange={setQuantity}
                  disabled={isReachedCartLimit}
                  aria-label="Số lượng cá thể"
                />
              </div>

              {isReachedCartLimit ? (
                <p className="text-sm text-warm">Bạn đã thêm toàn bộ số lượng còn trong kho vào giỏ hàng.</p>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    size="lg"
                    pill
                    variant="primary"
                    onClick={handleAddToCart}
                    disabled={addToCartMutation.isPending || isReachedCartLimit}
                    className="gap-2"
                  >
                    <ShoppingBag className="size-4" aria-hidden="true" />
                    <span>Thêm vào giỏ</span>
                  </Button>
                  <Button size="lg" pill variant="secondary" onClick={handleBuyNow} disabled={isReachedCartLimit}>
                    Mua ngay
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Cửa hàng và cam kết: một khối liền, ngăn bằng đường kẻ mảnh */}
          <div className="mt-10 divide-y divide-line border-t border-line">
            <div className="flex items-center gap-3 py-4">
              <Store className="size-5 shrink-0 text-accent" aria-hidden="true" />
              <div className="min-w-0">
                <p className="truncate font-semibold text-fg">{product.displayShopName}</p>
                <p className="text-sm text-fg-3">Cơ sở nhân giống đã được Ban Quản trị duyệt</p>
              </div>
            </div>
            <ul className="space-y-3 py-4">
              {SHIPPING_AND_CARE_COPY.commitments.map((c) => (
                <li key={c.id} className="flex items-start gap-3 text-sm">
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden="true" />
                  <span className="text-fg-2">
                    <span className="font-medium text-fg">{c.title}.</span> {c.description}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="mt-16 grid grid-cols-1 gap-x-14 border-t border-line lg:grid-cols-2">
        <Section title="Mô tả cá thể" className="border-b border-line lg:border-b-0">
          <p className="leading-relaxed whitespace-pre-line text-fg-2">{product.description}</p>
          <p className="mt-4 text-sm leading-relaxed text-fg-3">
            Khi nhận hàng, hãy quay video mở hộp liền mạch từ lúc gói còn niêm phong tới khi kiểm tra cá thể để được
            bảo hành sức khỏe trong 48 giờ.
          </p>
        </Section>

        <Section
          title={species ? `Về loài ${species.displayName}` : 'Về loài này'}
          actions={
            species && (
              <Link to={`/species/${species.id}`} className="inline-flex items-center gap-1 text-sm text-accent hover:underline">
                Hồ sơ loài
                <ArrowRight className="size-3.5" aria-hidden="true" />
              </Link>
            )
          }
        >
          {species ? (
            <>
              <p className="leading-relaxed text-fg-2">{species.description}</p>
              <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3">
                {tempText && (
                  <div>
                    <dt className="text-sm text-fg-3">Nhiệt độ</dt>
                    <dd className="mt-1 font-mono text-lg text-fg">{tempText}</dd>
                  </div>
                )}
                {humidText && (
                  <div>
                    <dt className="text-sm text-fg-3">Độ ẩm</dt>
                    <dd className={cn('mt-1 text-lg text-fg', !specs?.humidityNotApplicable && 'font-mono')}>{humidText}</dd>
                  </div>
                )}
                {species.origin?.place && (
                  <div className="col-span-2 sm:col-span-1">
                    <dt className="text-sm text-fg-3">Bản địa</dt>
                    <dd className="mt-1 text-fg">{species.origin.place}</dd>
                  </div>
                )}
              </dl>
            </>
          ) : (
            <p className="text-sm text-fg-3">Đang tải hồ sơ loài...</p>
          )}
        </Section>
      </div>

      <Section title="Đóng gói và vận chuyển" className="border-t border-line">
        <ol className="grid gap-x-10 gap-y-6 sm:grid-cols-2 lg:grid-cols-4">
          {SHIPPING_AND_CARE_COPY.shippingProcess.map((step) => (
            <li key={step.step}>
              <span className="font-mono text-sm text-accent">0{step.step}</span>
              <h3 className="mt-2 font-semibold text-fg">{step.title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-fg-3">{step.description}</p>
            </li>
          ))}
        </ol>
      </Section>

      {relatedProducts.length > 0 && (
        <Section
          title="Cá thể khác cùng loài"
          className="border-t border-line"
          actions={
            <Link
              to={`/products?speciesId=${product.speciesId}`}
              className="inline-flex items-center gap-1 text-sm text-accent hover:underline"
            >
              Xem tất cả
              <ArrowRight className="size-3.5" aria-hidden="true" />
            </Link>
          }
        >
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 md:gap-6">
            {relatedProducts.map((p) => (
              <li key={p.id}>
                <ProductCard product={p} />
              </li>
            ))}
          </ul>
        </Section>
      )}

      {/* Thanh mua dính đáy màn hình trên mobile */}
      <div className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-between gap-3 border-t border-line bg-bg-raised/95 px-4 py-3 backdrop-blur-xl md:hidden">
        <Price amount={product.price} size="lg" className="text-fg" />
        <div className="flex items-center gap-2">
          {canBuy && !isReachedCartLimit && (
            <Button
              size="sm"
              pill
              variant="primary"
              onClick={handleAddToCart}
              disabled={addToCartMutation.isPending}
              className="gap-1.5"
            >
              <ShoppingBag className="size-3.5" aria-hidden="true" />
              <span>Thêm giỏ</span>
            </Button>
          )}
          {canBuy && (
            <Button size="sm" pill variant="secondary" onClick={handleBuyNow}>
              Mua ngay
            </Button>
          )}
          {(isOutOfStock || isReachedCartLimit) && (
            <span className="rounded-full border border-line px-3 py-1.5 text-sm text-fg-3">
              {isOutOfStock ? 'Hết hàng' : 'Đã đủ số lượng'}
            </span>
          )}
        </div>
      </div>

      <Lightbox photos={lightboxPhotos} isOpen={isLightboxOpen} onClose={() => setIsLightboxOpen(false)} />

      <Dialog open={isLoginDialogOpen} onOpenChange={setIsLoginDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Đăng nhập để mua sinh vật cảnh</DialogTitle>
            <DialogDescription>
              Bạn cần tài khoản BioNexus để lưu giỏ hàng và đặt mua cá thể đã được kiểm duyệt.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 gap-2">
            <Button variant="secondary" pill onClick={() => setIsLoginDialogOpen(false)}>
              Để sau
            </Button>
            <ButtonLink to={`/login?next=${encodeURIComponent(`/products/${productId}`)}`} pill>
              Đăng nhập
            </ButtonLink>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}
