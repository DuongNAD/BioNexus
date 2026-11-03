import React, { useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import {
  Store,
  ShieldCheck,
  ShoppingBag,
  Zap,
  AlertTriangle,
  ChevronRight,
  Info,
  CheckCircle2,
  Share2,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Price } from '@/components/ui/Price';
import { Badge } from '@/components/ui/Badge';
import { IucnBadge } from '@/components/ui/IucnBadge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/Dialog';
import { NumberStepper } from '@/components/ui/NumberStepper';
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
      list.push({ src: product.displayImage, alt: product.productName, label: 'Ảnh cá thể thực tế' });
    }
    if (species?.heroPhoto) {
      list.push({ src: species.heroPhoto, alt: `${species.displayName} - Mẫu chuẩn loài`, label: 'Mẫu chuẩn loài' });
    }
    if (species?.galleryPhotos && species.galleryPhotos.length > 0) {
      species.galleryPhotos.slice(0, 2).forEach((g, idx) => {
        list.push({ src: g, alt: `${species.displayName} ảnh ${idx + 1}`, label: 'Sinh cảnh chuẩn' });
      });
    }
    return list;
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 space-y-4">
            <div className="aspect-[4/3] rounded-2xl bg-surface animate-pulse" />
            <div className="flex gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="size-20 rounded-xl bg-surface animate-pulse" />
              ))}
            </div>
          </div>
          <div className="lg:col-span-5 space-y-4">
            <div className="h-6 w-1/3 bg-surface animate-pulse rounded" />
            <div className="h-10 w-3/4 bg-surface animate-pulse rounded" />
            <div className="h-8 w-1/2 bg-surface animate-pulse rounded" />
            <div className="h-32 w-full bg-surface animate-pulse rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  // Chỉ 400/404 mới là "không tìm thấy"; lỗi mạng hay 500 thì cho thử lại
  const isNotFound =
    !isValidId ||
    (productError instanceof ApiError && (productError.status === 404 || productError.status === 400)) ||
    (!productError && !product);
  if (productError && !isNotFound) {
    return (
      <div className="px-4 py-16">
        <QueryErrorState
          title="Không tải được thông tin sinh vật cảnh"
          error={productError}
          onRetry={() => refetchProduct()}
          isRetrying={isProductRefetching}
        />
      </div>
    );
  }

  if (isNotFound || !product) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center max-w-md mx-auto">
        <div className="size-16 rounded-full bg-surface-2 border border-line flex items-center justify-center text-accent mb-4">
          <AlertTriangle className="size-8" aria-hidden="true" />
        </div>
        <h1 className="text-2xl font-bold text-fg">Không tìm thấy sinh vật cảnh</h1>
        <p className="mt-2 text-sm text-fg-2">
          Cá thể này không tồn tại, đã ngừng bán hoặc đang trong trạng thái chờ kiểm duyệt sinh học.
        </p>
        <ButtonLink to="/products" variant="primary" pill className="mt-6">
          ← Khám phá cá thể khác
        </ButtonLink>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg text-fg pb-24 md:pb-16">
      {/* 1. Breadcrumb điều hướng sinh học */}
      <nav aria-label="Breadcrumb" className="border-b border-line bg-bg-raised/50 py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center gap-1.5 text-xs text-fg-3 overflow-x-auto whitespace-nowrap">
          <Link to="/products" className="hover:text-accent transition-colors">
            Cửa hàng
          </Link>
          <ChevronRight className="size-3 shrink-0" />
          {species?.group && (
            <>
              <Link to={`/products?group=${encodeURIComponent(species.group)}`} className="hover:text-accent transition-colors">
                {species.group}
              </Link>
              <ChevronRight className="size-3 shrink-0" />
            </>
          )}
          {species && (
            <>
              <Link to={`/species/${species.id}`} className="hover:text-accent transition-colors font-serif italic">
                {species.displayName} ({species.scientificName})
              </Link>
              <ChevronRight className="size-3 shrink-0" />
            </>
          )}
          <span className="text-fg font-medium truncate max-w-[200px]">{product.productName}</span>
        </div>
      </nav>

      {/* 2. Bố cục chính 12 cột: 7 Trái (Hình ảnh) / 5 Phải (Mua sắm dính) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* CỘT TRÁI 7/12: Khảo sát hình ảnh + Kính lúp + Thumbnail Strip */}
          <div className="lg:col-span-7 space-y-4">
            {/* Kính lúp phóng đại 2.5x */}
            <div className="relative aspect-[4/3] w-full rounded-2xl overflow-hidden border border-line bg-surface-2 shadow-2xl">
              <LensMagnifier
                src={activePhoto.src}
                alt={activePhoto.alt}
                zoomLevel={2.5}
                lensSize={160}
                onOpenLightbox={lightboxPhotos.length > 0 ? () => setIsLightboxOpen(true) : undefined}
                className="size-full"
              />

              {/* Tag F2+ CITES góc trên */}
              <div className="absolute top-4 left-4 z-10 flex gap-2">
                <Badge variant="accent" className="bg-black/70 backdrop-blur-md border border-accent/40 font-mono text-xs">
                  <ShieldCheck className="size-3.5 mr-1 text-accent" /> F2+ Nhân tạo
                </Badge>
                {product.conservationStatus && (
                  <IucnBadge code={product.conservationStatus} size="sm" showLabel={true} className="bg-black/80" />
                )}
              </div>
            </div>

            {/* Dải ảnh nhỏ đối soát hình thái loài */}
            {galleryPhotos.length > 1 && (
              <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-thin">
                {galleryPhotos.map((photo, index) => {
                  const isSelected = index === selectedPhotoIndex;
                  return (
                    <button
                      key={index}
                      type="button"
                      aria-label={`Xem ảnh ${index + 1}: ${photo.label || photo.alt}`}
                      aria-pressed={isSelected}
                      onClick={() => setSelectedPhotoIndex(index)}
                      className={`relative size-20 md:size-24 rounded-xl overflow-hidden border-2 transition-all shrink-0 bg-surface-2 ${
                        isSelected
                          ? 'border-accent shadow-[0_0_12px_rgba(110,231,183,0.4)] scale-102'
                          : 'border-line hover:border-accent/40 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={photo.src} alt="" className="size-full object-cover" />
                      {photo.label && (
                        <span className="absolute bottom-0 inset-x-0 bg-black/80 text-[9px] text-center text-fg-2 py-0.5 font-mono truncate px-1">
                          {photo.label}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* CỘT PHẢI 5/12: Khung thông tin mua sắm & Thẩm định pháp lý (DÍNH) */}
          <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
            {/* Header thông tin cá thể */}
            <div>
              <div className="flex items-center justify-between text-xs text-fg-3 mb-2">
                <span className="font-mono text-accent">Mã cá thể: PRD-{product.id.toString().padStart(4, '0')}</span>
                <button
                  type="button"
                  onClick={() => void handleShare()}
                  className="flex items-center gap-1 text-fg-3 hover:text-accent transition-colors"
                  aria-label="Chia sẻ thông tin cá thể"
                >
                  <Share2 className="size-3.5" />
                  <span>Chia sẻ</span>
                </button>
              </div>

              <h1 className="text-2xl md:text-3xl font-bold text-fg tracking-tight font-sans">
                {product.productName}
              </h1>

              {product.speciesScientificName && (
                <p className="mt-1 text-sm italic text-fg-3 font-serif">
                  {product.speciesScientificName} {species?.displayName && `· ${species.displayName}`}
                </p>
              )}
            </div>

            {/* Khối Cửa hàng (ShopChip) */}
            <div className="flex items-center justify-between rounded-xl border border-line bg-surface-1/60 backdrop-blur-md p-3.5">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-xl border border-accent/30 bg-accent/10 text-accent">
                  <Store className="size-5" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-semibold text-fg">{product.displayShopName}</span>
                    <span title="Trại nhân giống F2+ đã kiểm duyệt">
                      <ShieldCheck className="size-3.5 text-accent" />
                    </span>
                  </div>
                  <span className="text-[11px] text-fg-3">Cơ sở nhân giống sinh thái chứng nhận</span>
                </div>
              </div>

            </div>

            {/* Bảng giá & Tồn kho */}
            <div className="rounded-2xl border border-line bg-surface-1/80 backdrop-blur-md p-5 space-y-3">
              <div className="flex items-baseline justify-between">
                <span className="text-xs text-fg-3 uppercase tracking-wider font-mono">Giá niêm yết:</span>
                <Price amount={product.price} size="lg" className="text-3xl text-accent" />
              </div>

              {/* Chỉ báo trạng thái kho */}
              <div className="pt-2 border-t border-line/40">
                {isOutOfStock ? (
                  <div className="rounded-xl border border-line bg-surface-2 p-3 text-xs text-fg-3 flex items-center gap-2">
                    <Info className="size-4 shrink-0" />
                    <span>Cá thể này hiện đã hết hàng hoặc ngừng mở bán.</span>
                  </div>
                ) : availableStock <= 2 ? (
                  <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-300 flex items-center gap-2 font-medium">
                    <AlertTriangle className="size-4 shrink-0 text-amber-400" />
                    <span>Chỉ còn {availableStock} cá thể cuối cùng sẵn sàng xuất chuồng!</span>
                  </div>
                ) : (
                  <div className="text-xs text-emerald-400 flex items-center gap-1.5 font-medium">
                    <CheckCircle2 className="size-3.5" />
                    <span>Còn {availableStock} cá thể sẵn sàng xuất chuồng</span>
                  </div>
                )}

                {inCartQty > 0 && !isOutOfStock && (
                  <p className="mt-1 text-[11px] text-fg-3 font-mono">
                    (Bạn đã có {inCartQty} cá thể trong giỏ hàng)
                  </p>
                )}
              </div>

              {/* Cảnh báo nếu sở hữu shop */}
              {isOwner && (
                <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-300 flex items-center gap-2">
                  <AlertTriangle className="size-4 shrink-0" />
                  <span>Đây là sản phẩm của chính shop bạn. Bạn không thể tự mua sản phẩm của mình.</span>
                </div>
              )}

              {/* Bộ tăng giảm số lượng & Nút hành động */}
              {!isOutOfStock && !isOwner && (
                <div className="pt-3 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-fg-2 font-medium">Số lượng cá thể:</span>
                    <NumberStepper
                      value={quantity}
                      min={1}
                      max={Math.max(1, remainingPurchasable)}
                      onChange={setQuantity}
                      disabled={isReachedCartLimit}
                    />
                  </div>

                  {isReachedCartLimit ? (
                    <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-2.5 text-center text-xs text-amber-300">
                      Bạn đã thêm toàn bộ số lượng có sẵn trong kho vào giỏ hàng.
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <Button
                        size="lg"
                        pill
                        variant="primary"
                        onClick={handleAddToCart}
                        disabled={addToCartMutation.isPending || isReachedCartLimit}
                        className="gap-2 shadow-[var(--glow-accent-btn)]"
                      >
                        <ShoppingBag className="size-4" />
                        <span>Thêm vào giỏ</span>
                      </Button>

                      <Button
                        size="lg"
                        pill
                        variant="secondary"
                        onClick={handleBuyNow}
                        disabled={isReachedCartLimit}
                        className="gap-2"
                      >
                        <Zap className="size-4 text-accent" />
                        <span>Mua ngay</span>
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Khối 3 cam kết chuẩn mẫu R */}
            <div className="rounded-2xl border border-line/60 bg-surface-1/40 backdrop-blur-md p-4 space-y-3">
              <h4 className="text-xs uppercase font-mono font-bold tracking-wider text-accent border-b border-line/40 pb-2">
                Cam kết chuẩn bảo tồn BioNexus
              </h4>
              {SHIPPING_AND_CARE_COPY.commitments.map((c) => (
                <div key={c.id} className="flex items-start gap-2.5 text-xs">
                  <CheckCircle2 className="size-4 text-accent shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-fg block">{c.title}</span>
                    <span className="text-fg-3 text-[11px] leading-relaxed">{c.description}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 3. Hệ thống Tabs thông tin chuyên sâu */}
        <section className="mt-16 pt-8 border-t border-line">
          <Tabs defaultValue="description" className="w-full">
            <TabsList className="mb-6 flex-wrap">
              <TabsTrigger value="description">Mô tả cá thể</TabsTrigger>
              <TabsTrigger value="species">Về loài này (Hồ sơ sinh học)</TabsTrigger>
              <TabsTrigger value="shipping">Vận chuyển & Chăm sóc</TabsTrigger>
            </TabsList>

            {/* Tab 1: Mô tả cá thể */}
            <TabsContent value="description" className="space-y-4 max-w-3xl">
              <div className="rounded-2xl border border-line bg-surface-1/60 p-6 space-y-4">
                <h3 className="text-lg font-bold text-fg">Thông tin chi tiết cá thể</h3>
                <p className="text-sm text-fg-2 leading-relaxed whitespace-pre-line">
                  {product.description}
                </p>

                <div className="rounded-xl border border-line bg-surface-2/60 p-4 mt-6 text-xs text-fg-3 space-y-2">
                  <span className="font-bold text-fg block font-mono">Quy định nhận hàng & bảo hành:</span>
                  <p>
                    Quý khách vui lòng quay video unboxing liền mạch từ lúc nhận gói hàng còn nguyên niêm phong đến khi kiểm tra thể trạng cá thể để được hưởng chính sách bảo hành sinh học trong vòng 48 giờ.
                  </p>
                </div>
              </div>
            </TabsContent>

            {/* Tab 2: Về loài này */}
            <TabsContent value="species" className="space-y-6 max-w-3xl">
              {species ? (
                <div className="rounded-2xl border border-line bg-surface-1/60 p-6 space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-line/60 pb-4">
                    <div>
                      <h3 className="text-xl font-bold text-fg font-sans">{species.displayName}</h3>
                      <p className="text-sm italic text-fg-3 font-serif">{species.scientificName}</p>
                    </div>
                    <IucnBadge code={species.conservationStatus} size="md" />
                  </div>

                  <p className="text-sm text-fg-2 leading-relaxed">{species.description}</p>

                  {/* Thông số môi trường sống */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div className="rounded-xl border border-line bg-surface-2 p-3 text-center">
                      <span className="text-[11px] text-fg-3 block">Nhiệt độ sinh cảnh</span>
                      <span className="text-sm font-mono font-bold text-accent">
                        {species.parsedSpecs?.tempMin || '--'}°C – {species.parsedSpecs?.tempMax || '--'}°C
                      </span>
                    </div>
                    <div className="rounded-xl border border-line bg-surface-2 p-3 text-center">
                      <span className="text-[11px] text-fg-3 block">Độ ẩm tối ưu</span>
                      <span className="text-sm font-mono font-bold text-accent">
                        {species.parsedSpecs?.humidMin || '--'}% – {species.parsedSpecs?.humidMax || '--'}%
                      </span>
                    </div>
                    <div className="rounded-xl border border-line bg-surface-2 p-3 text-center col-span-2 sm:col-span-1">
                      <span className="text-[11px] text-fg-3 block">Bản địa</span>
                      <span className="text-xs font-semibold text-fg truncate block">
                        {species.origin?.place || 'Châu Á'}
                      </span>
                    </div>
                  </div>

                  <div className="pt-2">
                    <ButtonLink to={`/species/${species.id}`} variant="secondary" size="sm" pill className="gap-2">
                      <span>Xem chuyên khảo Bách khoa toàn thư →</span>
                    </ButtonLink>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-fg-3">Đang đồng bộ hồ sơ bách khoa...</p>
              )}
            </TabsContent>

            {/* Tab 3: Vận chuyển & Chăm sóc */}
            <TabsContent value="shipping" className="space-y-6 max-w-3xl">
              <div className="rounded-2xl border border-line bg-surface-1/60 p-6 space-y-6">
                <h3 className="text-lg font-bold text-fg">Quy trình đóng gói & Vận chuyển sinh học</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {SHIPPING_AND_CARE_COPY.shippingProcess.map((step) => (
                    <div key={step.step} className="rounded-xl border border-line bg-surface-2 p-4 space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="flex size-6 items-center justify-center rounded-full bg-accent/20 text-accent font-mono text-xs font-bold">
                          {step.step}
                        </span>
                        <h4 className="font-semibold text-fg text-sm">{step.title}</h4>
                      </div>
                      <p className="text-xs text-fg-3 leading-relaxed pl-8">{step.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </section>

        {/* 4. Cá thể khác cùng loài & Gợi ý */}
        {relatedProducts.length > 0 && (
          <section className="mt-16 pt-10 border-t border-line">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-fg font-sans">Cá thể khác cùng loài</h3>
                <p className="text-xs text-fg-3 mt-1">Các cá thể thuần chủng khác đang được mở bán trên sàn</p>
              </div>
              <Link to={`/products?speciesId=${product.speciesId}`} className="text-xs text-accent hover:underline font-mono">
                Xem tất cả →
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* 5. Mobile Sticky Bottom Bar */}
      <div className="md:hidden fixed bottom-0 inset-x-0 z-40 border-t border-line bg-bg-raised/95 backdrop-blur-xl p-3 flex items-center justify-between gap-3 shadow-2xl">
        <div>
          <span className="text-[10px] text-fg-3 uppercase font-mono block">Giá:</span>
          <Price amount={product.price} size="sm" className="text-accent" />
        </div>

        <div className="flex items-center gap-2">
          {!isOutOfStock && !isOwner && !isReachedCartLimit && (
            <Button
              size="sm"
              pill
              variant="primary"
              onClick={handleAddToCart}
              disabled={addToCartMutation.isPending}
              className="text-xs gap-1.5"
            >
              <ShoppingBag className="size-3.5" aria-hidden="true" />
              <span>Thêm giỏ</span>
            </Button>
          )}

          {!isOutOfStock && !isOwner && (
            <Button size="sm" pill variant="secondary" onClick={handleBuyNow} className="text-xs">
              Mua ngay
            </Button>
          )}

          {(isOutOfStock || isReachedCartLimit) && (
            <span className="text-xs font-mono text-fg-3 bg-surface-2 px-3 py-1.5 rounded-full border border-line">
              {isOutOfStock ? 'Hết hàng' : 'Đã đạt giới hạn'}
            </span>
          )}
        </div>
      </div>

      {/* Lightbox Modal phóng to ảnh */}
      <Lightbox
        photos={lightboxPhotos}
        isOpen={isLightboxOpen}
        onClose={() => setIsLightboxOpen(false)}
      />

      {/* Dialog yêu cầu đăng nhập */}
      <Dialog open={isLoginDialogOpen} onOpenChange={setIsLoginDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Đăng nhập để tiếp tục mua sắm</DialogTitle>
            <DialogDescription>
              Bạn cần có tài khoản BioNexus để lưu giỏ hàng và thực hiện giao dịch sinh vật cảnh có kiểm định.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 gap-2">
            <Button variant="secondary" onClick={() => setIsLoginDialogOpen(false)}>
              Để sau
            </Button>
            <ButtonLink to={`/login?next=${encodeURIComponent(`/products/${productId}`)}`} variant="primary">
              Đăng nhập ngay
            </ButtonLink>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
