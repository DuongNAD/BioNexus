import React, { useMemo } from 'react';
import { Link } from 'react-router';
import { ArrowRight } from 'lucide-react';
import { Eyebrow, Panel } from '@/components/layout/Page';
import { IUCN_SPECS, IucnBadge, type ConservationStatus } from '@/components/ui/IucnBadge';
import { StatRow } from '@/components/ui/StatRow';
import { ButtonLink } from '@/components/domain/ButtonLink';
import type { SpeciesViewModel } from '@/api/adapters';

const IUCN_ORDER: ConservationStatus[] = ['CR', 'EN', 'VU', 'NT', 'LC', 'EW', 'EX'];

export interface BranchSummaryProps {
  title: string;
  species: SpeciesViewModel[];
  productCounts: Record<number, number>;
  /** Link "xem tất cả loài": /species?node=:id, hoặc /species ở gốc */
  allSpeciesHref: string;
}

/** Panel tóm tắt nhánh (tài liệu 03 mục 3.4): số loài, số đang bán, ghép ảnh và mức IUCN */
export function BranchSummary({ title, species, productCounts, allSpeciesHref }: BranchSummaryProps): React.JSX.Element {
  const onSale = species.reduce((sum, sp) => sum + (productCounts[sp.id] || 0), 0);

  // Đếm loài theo mức IUCN, nguy cấp nhất đứng trước
  const iucnCounts = useMemo(() => {
    const counts = new Map<ConservationStatus, number>();
    species.forEach((sp) => {
      const code = sp.conservationStatus as ConservationStatus;
      counts.set(code, (counts.get(code) || 0) + 1);
    });
    return IUCN_ORDER.filter((c) => counts.has(c)).map((c) => ({ code: c, count: counts.get(c)! }));
  }, [species]);

  const mosaic = species.slice(0, 4);
  const sorted = useMemo(
    () => [...species].sort((a, b) => IUCN_ORDER.indexOf(a.conservationStatus as ConservationStatus) - IUCN_ORDER.indexOf(b.conservationStatus as ConservationStatus)),
    [species]
  );

  return (
    <Panel className="space-y-6">
      <div>
        <Eyebrow tone="muted">Tóm tắt nhánh</Eyebrow>
        <h2 className="mt-2 text-xl font-semibold tracking-[-0.02em] text-fg">{title}</h2>
      </div>

      {mosaic.length > 0 && (
        // Ảnh ghép chỉ để minh hoạ: tên loài đã có trong danh sách bên dưới
        <div className="grid grid-cols-2 gap-2" aria-hidden="true">
          {mosaic.map((sp) => (
            <img
              key={sp.id}
              src={sp.cardPhoto}
              alt=""
              loading="lazy"
              className="aspect-square w-full rounded-xl object-cover"
              style={{ objectPosition: sp.focus || 'center' }}
            />
          ))}
        </div>
      )}

      <StatRow
        items={[
          { label: 'Loài', value: species.length },
          { label: 'Đang bán', value: onSale },
        ]}
      />

      {iucnCounts.length > 0 && (
        <div>
          <p className="text-sm text-fg-3">Mức bảo tồn IUCN</p>
          <div className="mt-2 flex h-2 overflow-hidden rounded-full bg-surface-2" aria-hidden="true">
            {iucnCounts.map(({ code, count }) => (
              <span key={code} style={{ width: `${(count / species.length) * 100}%`, backgroundColor: IUCN_SPECS[code].color }} />
            ))}
          </div>
          <ul className="mt-3 divide-y divide-line">
            {sorted.slice(0, 6).map((sp) => (
              <li key={sp.id}>
                <Link
                  to={`/species/${sp.id}`}
                  className="flex items-center justify-between gap-3 py-2.5 text-sm transition-colors hover:text-accent"
                >
                  <span className="min-w-0">
                    <span className="block truncate text-fg">{sp.displayName}</span>
                    <span className="block truncate font-serif text-[15px] text-fg-3 italic">{sp.scientificName}</span>
                  </span>
                  <IucnBadge code={sp.conservationStatus} size="sm" showLabel={false} />
                </Link>
              </li>
            ))}
          </ul>
          {sorted.length > 6 && (
            <p className="mt-2 text-sm text-fg-3">và {sorted.length - 6} loài khác</p>
          )}
        </div>
      )}

      <ButtonLink to={allSpeciesHref} variant="secondary" pill className="w-full">
        <span>Xem tất cả loài trong nhánh</span>
        <ArrowRight className="size-4" aria-hidden="true" />
      </ButtonLink>
    </Panel>
  );
}
