import React, { useState } from 'react';
import { ShoppingBag, Store, ShieldCheck } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Price } from '@/components/ui/Price';
import { IucnBadge } from '@/components/ui/IucnBadge';
import { SPECIES_EXTRAS } from '@/content/species-extras';
import type { ProductViewModel } from '@/api/adapters';

export interface ProductCardProps {
  product: ProductViewModel;
  onAddToCart?: (productId: number, event: React.MouseEvent<HTMLButtonElement>) => void;
  enableHoverFlip?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onAddToCart,
  enableHoverFlip = true,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  // Tìm ảnh phụ từ SPECIES_EXTRAS nếu có tên khoa học
  const extras = product.speciesScientificName ? SPECIES_EXTRAS[product.speciesScientificName] : undefined;
  const secondaryImage = extras?.portraitPhotoId
    ? `photos/${extras.portraitPhotoId}.webp`
    : extras?.slug
      ? `photos/${extras.slug}/hero-960.webp`
      : null;

  const showFlip = enableHoverFlip && isHovered && secondaryImage && secondaryImage !== product.displayImage;

  const handleCardClick = () => {
    window.location.hash = `#/products/${product.id}`;
  };

  const handleAction = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (onAddToCart) {
      onAddToCart(product.id, e);
    } else {
      window.location.hash = `#/products/${product.id}`;
    }
  };

  return (
    <Card
      padding="none"
      onClick={handleCardClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative cursor-pointer overflow-hidden rounded-2xl border border-line bg-surface-1/70 backdrop-blur-md transition-all duration-300 hover:border-accent/40 hover:-translate-y-1 hover:shadow-xl hover:shadow-accent/5 flex flex-col justify-between"
    >
      <div>
        {/* Vùng ảnh sản phẩm: Tỷ lệ 4:5 chuẩn tạp chí */}
        <div className="relative aspect-[4/5] w-full overflow-hidden bg-surface-2">
          {/* Ảnh chính */}
          <img
            src={product.displayImage}
            alt={product.productName}
            className={`h-full w-full object-cover transition-all duration-500 ease-out ${
              showFlip ? 'opacity-0 scale-95' : 'opacity-100 group-hover:scale-105'
            } ${product.isOutOfStock ? 'grayscale-[80%] opacity-60' : ''}`}
            loading="lazy"
          />

          {/* Ảnh góc 2 (Hover Flip) */}
          {secondaryImage && (
            <img
              src={secondaryImage}
              alt={`${product.productName} - góc chụp đối chiếu`}
              className={`absolute inset-0 h-full w-full object-cover transition-all duration-500 ease-out ${
                showFlip ? 'opacity-100 scale-105' : 'opacity-0 scale-100 pointer-events-none'
              }`}
              loading="lazy"
            />
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent opacity-60" />

          {/* Huy hiệu pháp lý F2+ góc trên trái */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
            <Badge variant="accent" size="sm" className="bg-black/70 backdrop-blur-md text-[10px] uppercase font-mono border border-accent/30">
              <ShieldCheck className="size-3 mr-1 text-accent" /> F2+ Nhân tạo
            </Badge>
          </div>

          {/* Huy hiệu IUCN góc trên phải */}
          {product.conservationStatus && (
            <div className="absolute top-3 right-3 z-10">
              <IucnBadge code={product.conservationStatus} size="sm" showLabel={false} className="bg-black/80 shadow-md" />
            </div>
          )}

          {/* Chỉ báo tồn kho góc dưới ảnh */}
          <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-[11px] font-medium z-10">
            {product.isOutOfStock ? (
              <span className="rounded-md bg-surface-2/90 px-2 py-0.5 text-fg-3 font-mono border border-line">
                Hết hàng
              </span>
            ) : product.stockQuantity <= 2 ? (
              <span className="rounded-md bg-amber-500/20 px-2 py-0.5 text-amber-300 font-mono border border-amber-500/40">
                Chỉ còn {product.stockQuantity} cá thể
              </span>
            ) : (
              <span className="rounded-md bg-emerald-500/20 px-2 py-0.5 text-emerald-300 font-mono border border-emerald-500/40">
                Còn {product.stockQuantity} cá thể
              </span>
            )}

            {showFlip && (
              <span className="text-[10px] text-accent/90 bg-black/60 px-1.5 py-0.5 rounded backdrop-blur-sm">
                Mẫu loài
              </span>
            )}
          </div>
        </div>

        {/* Nội dung thông tin */}
        <div className="p-4">
          <div className="flex items-center gap-1.5 text-xs text-fg-3 mb-1.5">
            <Store className="size-3.5 text-accent shrink-0" />
            <span className="truncate">{product.displayShopName}</span>
          </div>

          <h3 className="font-semibold text-fg text-base line-clamp-1 group-hover:text-accent transition-colors font-sans">
            {product.productName}
          </h3>

          {product.speciesScientificName && (
            <p className="text-xs italic text-fg-mute font-serif line-clamp-1 mt-0.5">
              {product.speciesScientificName}
            </p>
          )}

          <p className="mt-2 text-xs text-fg-2 line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        </div>
      </div>

      {/* Chân thẻ & nút mua */}
      <div className="p-4 pt-0 flex items-center justify-between border-t border-line/40 mt-2">
        <Price amount={product.price} size="md" />

        <Button
          size="sm"
          pill
          variant={product.isAvailable ? 'primary' : 'secondary'}
          className="gap-1.5 font-semibold"
          disabled={!product.isAvailable}
          onClick={handleAction}
          aria-label={onAddToCart ? `Thêm ${product.productName} vào giỏ hàng` : `Xem chi tiết ${product.productName}`}
        >
          <ShoppingBag className="size-3.5" />
          {onAddToCart ? 'Thêm giỏ' : 'Chi tiết'}
        </Button>
      </div>
    </Card>
  );
};
