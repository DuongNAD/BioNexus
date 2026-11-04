import React, { useState, useEffect } from 'react';
import { Search, ExternalLink } from 'lucide-react';
import { PHOTOS, type PhotoMetadata } from '@/content/photos';
import { Photo } from '@/components/media/Photo';
import { PageContainer, PageHeader, Section } from '@/components/layout/Page';
import { StatRow } from '@/components/ui/StatRow';
import { EmptyState } from '@/components/ui/EmptyState';
import { cn } from '@/lib/cn';
import { useCatalogCredits } from '@/api/catalog';
import { CatalogCredits } from './components/CatalogCredits';

// Vai trò ảnh hiển thị bằng tiếng Việt thay cho mã nội bộ (hero, portrait...)
const PHOTO_ROLE_LABELS: Record<string, string> = {
  hero: 'Ảnh chính',
  portrait: 'Chân dung',
  gallery: 'Bộ sưu tập',
  habitat: 'Môi trường sống',
  product: 'Sản phẩm',
  biome: 'Sinh cảnh',
};

type CreditFilter = 'all' | 'species' | 'product' | 'biome';

const SPECIES_ROLES = new Set(['hero', 'portrait', 'habitat', 'gallery']);

export default function Credits(): React.JSX.Element {
  const [filter, setFilter] = useState<CreditFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    document.title = 'Ghi công & Bản quyền Hình ảnh | BioNexus';
  }, []);

  const photoList: PhotoMetadata[] = Object.values(PHOTOS);
  const catalogCredits = useCatalogCredits().data ?? [];
  const authorCount = new Set([...photoList.map((p) => p.credit.author), ...catalogCredits.map((c) => c.author)]).size;

  const filteredPhotos = photoList.filter((p) => {
    const matchesFilter =
      filter === 'all' ? true : filter === 'species' ? SPECIES_ROLES.has(p.role) : p.role === filter;
    if (!matchesFilter) return false;

    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.title.toLowerCase().includes(q) ||
      (p.scientificName && p.scientificName.toLowerCase().includes(q)) ||
      p.credit.author.toLowerCase().includes(q) ||
      p.credit.license.toLowerCase().includes(q)
    );
  });

  const filters: { value: CreditFilter; label: string }[] = [
    { value: 'all', label: `Tất cả (${photoList.length})` },
    { value: 'species', label: 'Bách khoa loài' },
    { value: 'product', label: 'Sản phẩm' },
    { value: 'biome', label: 'Sinh cảnh' },
  ];

  return (
    <PageContainer className="pb-20">
      <PageHeader
        eyebrow="Wikimedia Commons"
        title="Ghi công & Bản quyền ảnh"
        description="Mọi ảnh trong BioNexus là ảnh sinh vật thật, giấy phép tự do, ghi rõ tác giả và nguồn. Cảm ơn các nhiếp ảnh gia và cộng đồng Wikimedia Commons."
      />

      <StatRow
        className="border-y border-line py-2"
        items={[
          { label: 'Tác phẩm nguồn', value: photoList.length + catalogCredits.length },
          { label: 'Tác giả', value: authorCount },
          { label: 'Ảnh tạo bằng AI', value: 0 },
          { label: 'Giấy phép', value: 'CC', hint: 'CC0, CC BY, CC BY-SA' },
        ]}
      />

      <Section
        title="Danh sách ảnh"
        actions={
          <label className="relative block w-full sm:w-72">
            <span className="sr-only">Tìm theo loài, tác giả hoặc giấy phép</span>
            <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-fg-3" aria-hidden="true" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo loài, tác giả, giấy phép..."
              className="h-11 w-full rounded-full border border-line bg-white/[0.04] pr-4 pl-10 text-[15px] text-fg placeholder:text-fg-3 hover:border-line-strong focus:border-accent focus:ring-2 focus:ring-accent/40 focus:outline-none"
            />
          </label>
        }
      >
        <div className="mb-6 flex flex-wrap gap-2" role="group" aria-label="Lọc theo nhóm ảnh">
          {filters.map((f) => (
            <button
              key={f.value}
              type="button"
              aria-pressed={filter === f.value}
              onClick={() => setFilter(f.value)}
              className={cn(
                'h-9 rounded-full px-4 text-sm font-medium transition-colors',
                filter === f.value ? 'bg-accent text-accent-ink' : 'border border-line text-fg-2 hover:border-line-strong hover:text-fg'
              )}
            >
              {f.label}
            </button>
          ))}
        </div>

        {filteredPhotos.length === 0 ? (
          <EmptyState title="Không có ảnh phù hợp" description="Thử từ khóa khác hoặc chọn lại nhóm ảnh." />
        ) : (
          <ul className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {filteredPhotos.map((photo) => (
              <li key={photo.id}>
                <figure>
                  <div className="relative aspect-[4/3] overflow-hidden rounded-[20px] border border-line bg-bg-raised">
                    <Photo photo={photo} className="size-full object-cover" />
                    <span className="absolute top-3 left-3 rounded-full bg-black/65 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-md">
                      {PHOTO_ROLE_LABELS[photo.role] ?? photo.role}
                    </span>
                  </div>
                  <figcaption className="mt-4">
                    <p className="font-medium text-fg">{photo.title}</p>
                    {photo.scientificName && (
                      <p className="font-serif text-[15px] text-fg-3 italic">{photo.scientificName}</p>
                    )}
                    <p className="mt-2 text-sm text-fg-2">
                      Tác giả: <span className="text-fg">{photo.credit.author}</span>
                    </p>
                    <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                      <a
                        href={photo.credit.licenseUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-accent hover:underline"
                      >
                        {photo.credit.license}
                      </a>
                      <a
                        href={photo.credit.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-fg-3 hover:text-fg"
                      >
                        <span>Xem file gốc</span>
                        <ExternalLink className="size-3.5" aria-hidden="true" />
                      </a>
                    </p>
                  </figcaption>
                </figure>
              </li>
            ))}
          </ul>
        )}
      </Section>

      <CatalogCredits credits={catalogCredits} searchQuery={searchQuery} />
    </PageContainer>
  );
}
