import React, { useMemo, useState } from 'react';
import { ExternalLink } from 'lucide-react';
import type { CatalogCredit } from '@/api/catalog';
import { Section } from '@/components/layout/Page';
import { Button } from '@/components/ui/Button';
import { normalizeSearchString } from '@/components/navigation/QuickSearch';

const STEP = 60;

const ROLE_LABEL: Record<CatalogCredit['role'], string> = { hero: 'Ảnh chính', portrait: 'Chân dung', product: 'Ảnh sản phẩm' };

export interface CatalogCreditsProps {
  credits: CatalogCredit[];
  searchQuery: string;
}

/** Nguồn ảnh của loài catalog: hơn nghìn dòng nên hiện dạng danh sách gọn, tải từng đợt */
export const CatalogCredits: React.FC<CatalogCreditsProps> = ({ credits, searchQuery }) => {
  const filtered = useMemo(() => {
    const q = normalizeSearchString(searchQuery);
    if (!q) return credits;
    return credits.filter((c) =>
      [c.scientificName, c.productName ?? '', c.author, c.license].some((t) => normalizeSearchString(t).includes(q))
    );
  }, [credits, searchQuery]);
  const [paging, setPaging] = useState({ key: searchQuery, count: STEP });
  const visibleCount = paging.key === searchQuery ? paging.count : STEP;
  const visible = filtered.slice(0, visibleCount);

  if (credits.length === 0) return null;

  return (
    <Section
      title="Ảnh loài trong bách khoa mở rộng"
      description="Mỗi loài có một ảnh chính và một ảnh chân dung; sản phẩm thú cưng có thêm ảnh riêng của từng giống. Ảnh tải từ Wikimedia Commons, chuyển sang định dạng webp; ảnh chân dung và ảnh sản phẩm được cắt về khung 4:5 khi ảnh gốc khác tỉ lệ."
    >
      {filtered.length === 0 ? (
        <p className="text-sm text-fg-2">Không có ảnh nào khớp từ khoá.</p>
      ) : (
        <>
          <ul className="divide-y divide-line border-y border-line">
            {visible.map((c) => (
              <li key={`${c.scientificName}-${c.role}-${c.productName ?? ''}`} className="flex items-center gap-4 py-3">
                <img
                  src={c.src}
                  alt={`${ROLE_LABEL[c.role]} của ${c.productName ?? c.scientificName}`}
                  loading="lazy"
                  width={56}
                  height={56}
                  className="size-14 shrink-0 rounded-xl border border-line object-cover"
                  style={{ backgroundColor: c.color }}
                />
                <div className="min-w-0 flex-1">
                  {c.productName ? (
                    <p className="truncate text-[15px] text-fg">{c.productName}</p>
                  ) : (
                    <p className="truncate font-serif text-[15px] text-fg italic">{c.scientificName}</p>
                  )}
                  <p className="truncate text-sm text-fg-2">
                    {ROLE_LABEL[c.role]} · Tác giả: <span className="text-fg">{c.author}</span>
                    {c.modified && <span className="text-fg-3"> · đã chỉnh sửa</span>}
                  </p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1 text-sm sm:flex-row sm:items-center sm:gap-4">
                  <a href={c.licenseUrl || 'https://creativecommons.org/licenses/'} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">
                    {c.license}
                  </a>
                  <a href={c.sourceUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-fg-2 hover:text-fg">
                    <span>File gốc</span>
                    <ExternalLink className="size-3.5" aria-hidden="true" />
                    <span className="sr-only">(mở trong thẻ mới)</span>
                  </a>
                </div>
              </li>
            ))}
          </ul>
          <div className="mt-8 flex flex-col items-center gap-3">
            <p className="text-sm text-fg-2" aria-live="polite">
              Đang hiện <span className="font-mono text-fg">{visible.length}</span> /{' '}
              <span className="font-mono text-fg">{filtered.length}</span> ảnh
            </p>
            {visible.length < filtered.length && (
              <Button variant="secondary" pill onClick={() => setPaging({ key: searchQuery, count: visibleCount + STEP })}>
                Xem thêm {Math.min(STEP, filtered.length - visible.length)} ảnh
              </Button>
            )}
          </div>
        </>
      )}
    </Section>
  );
};
