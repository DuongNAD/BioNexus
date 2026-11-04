import React, { useState } from 'react';
import { Link } from 'react-router';
import { ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Price } from '@/components/ui/Price';
import { IucnBadge } from '@/components/ui/IucnBadge';
import { SPECIES_EXTRAS } from '@/content/species-extras';
import { cn } from '@/lib/cn';
import type { ProductViewModel } from '@/api/adapters';
import { catalogPhotoPath } from '@/api/catalog';

export interface ProductCardProps {
  product: ProductViewModel;
  onAddToCart?: (productId: number, event: React.MouseEvent<HTMLButtonElement>) => void;
  enableHoverFlip?: boolean;
}

/**
 * Thẻ sản phẩm: ảnh thật đứng đầu, một lớp viền, giá và một nút "Thêm giỏ".
 * Tên sản phẩm là link phủ cả thẻ (::after) nên bàn phím chỉ có một điểm dừng cho việc mở chi tiết.
 */
export const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart, enableHoverFlip = true }) => {
  const [isHovered, setIsHovered] = useState(false);

  // Ảnh chân dung của loài hiện khi rê chuột, giúp so cá thể với mẫu chuẩn
  const extras = product.speciesScientificName ? SPECIES_EXTRAS[product.speciesScientificName] : undefined;
  // Loài catalog: ảnh thẻ đã là portrait của loài nên lật sang ảnh hero
  const secondaryImage = extras?.slug
    ? `photos/${extras.slug}/portrait-960.webp`
    : product.speciesScientificName
      ? catalogPhotoPath(product.speciesScientificName, 'hero')
      : null;
  const showFlip = enableHoverFlip && isHovered && secondaryImage && secondaryImage !== product.displayImage;

  const handleAction = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    onAddToCart?.(product.id, e);
  };

  const stockLabel = product.isOutOfStock
    ? 'Hết hàng'
    : product.stockQuantity <= 2
      ? `Chỉ còn ${product.stockQuantity} cá thể`
      : `Còn ${product.stockQuantity} cá thể`;

  return (
    <article
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative flex h-full flex-col overflow-hidden rounded-[20px] border border-line bg-surface transition-colors duration-300 hover:border-line-strong focus-within:border-accent/60"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-bg-raised sm:aspect-[4/5]">
        <img
          src={product.displayImage}
          alt={product.productName}
          loading="lazy"
          className={cn(
            'size-full object-cover transition-all duration-500 ease-out motion-reduce:transition-none',
            showFlip ? 'opacity-0' : 'opacity-100 group-hover:scale-105 motion-reduce:group-hover:scale-100',
            product.isOutOfStock && 'grayscale opacity-60'
          )}
        />
        {secondaryImage && (
          <img
            src={secondaryImage}
            alt=""
            aria-hidden="true"
            loading="lazy"
            className={cn(
              'pointer-events-none absolute inset-0 size-full object-cover transition-opacity duration-500 motion-reduce:transition-none',
              showFlip ? 'opacity-100' : 'opacity-0'
            )}
          />
        )}
        {product.conservationStatus && (
          <IucnBadge
            code={product.conservationStatus}
            domestic={product.isDomestic}
            size="md"
            showLabel={false}
            onMedia
            className="absolute top-3 left-3"
          />
        )}
      </div>

      <div className="flex flex-1 flex-col p-4 md:p-5">
        <p className="truncate text-sm text-fg-3">{product.displayShopName}</p>
        <h3 className="mt-1 line-clamp-2 text-base leading-snug font-semibold text-fg transition-colors group-hover:text-accent">
          <Link
            to={`/products/${product.id}`}
            className="after:absolute after:inset-0 after:z-0 after:content-[''] focus-visible:underline focus-visible:outline-none"
          >
            {product.productName}
          </Link>
        </h3>
        {product.speciesScientificName && (
          <p className="mt-0.5 truncate font-serif text-[15px] text-fg-3 italic">{product.speciesScientificName}</p>
        )}

        <div className="mt-auto flex items-end justify-between gap-3 pt-4">
          <div className="min-w-0">
            <Price amount={product.price} size="lg" className="text-fg" />
            <p
              className={cn(
                'mt-0.5 text-xs',
                product.isOutOfStock ? 'text-fg-3' : product.stockQuantity <= 2 ? 'text-warm' : 'text-fg-3'
              )}
            >
              {stockLabel}
            </p>
          </div>

          {onAddToCart && (
            <Button
              size="sm"
              pill
              variant={product.isAvailable ? 'primary' : 'secondary'}
              className="relative z-10 shrink-0 gap-1.5"
              disabled={!product.isAvailable}
              onClick={handleAction}
              aria-label={`Thêm ${product.productName} vào giỏ hàng`}
            >
              <ShoppingBag className="size-3.5" aria-hidden="true" />
              Thêm giỏ
            </Button>
          )}
        </div>
      </div>
    </article>
  );
};
