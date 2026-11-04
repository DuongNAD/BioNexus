import React from 'react';
import { Link } from 'react-router';
import type { CatalogSpecies } from '@/api/catalog';
import { Eyebrow, Panel, Section } from '@/components/layout/Page';
import { cn } from '@/lib/cn';

const fmt = new Intl.NumberFormat('vi-VN');

function range(min: number | null | undefined, max: number | null | undefined, unit: string): string | null {
  if (min == null && max == null) return null;
  if (min == null || max == null || min === max) return `${fmt.format((min ?? max)!)} ${unit}`;
  return `${fmt.format(min)}–${fmt.format(max)} ${unit}`;
}

/** Kích thước con trưởng thành gộp thành một dòng, ví dụ "15–20 cm · 35–55 g (tính cả đuôi)" */
export function formatCatalogSize(size: CatalogSpecies['size']): string | null {
  if (!size) return null;
  const parts = [
    range(size.lengthCmMin, size.lengthCmMax, 'cm'),
    range(size.weightGMin, size.weightGMax, 'g'),
    size.heightCmMax != null ? `cao tới ${fmt.format(size.heightCmMax)} cm` : null,
  ].filter(Boolean);
  if (!parts.length) return size.noteVi ?? null;
  return parts.join(' · ') + (size.noteVi ? ` (${size.noteVi})` : '');
}

export function formatElevation(dist: CatalogSpecies['distribution']): string | null {
  const e = dist?.elevationM;
  return e ? range(e.min, e.max, 'm') : null;
}

const DIFFICULTY_TONE: Record<string, string> = {
  Dễ: 'border-accent/40 bg-accent/10 text-accent',
  'Trung bình': 'border-warm/40 bg-warm/10 text-warm',
  Khó: 'border-danger/40 bg-danger/10 text-danger',
};

export interface CatalogProfileProps {
  profile: CatalogSpecies;
  displayName: string;
  /** Tra tên khoa học sang id để loài dễ nhầm thành link khi có trong bách khoa */
  speciesIdByName: Map<string, { id: number; displayName: string }>;
}

/** Các khối hồ sơ chỉ loài catalog có: nhận dạng, tập tính, sinh sản, điều thú vị, mối đe doạ, cách nuôi, loài dễ nhầm */
export const CatalogProfile: React.FC<CatalogProfileProps> = ({ profile, displayName, speciesIdByName }) => {
  const traits = [
    { title: 'Nhận dạng', text: profile.identificationVi },
    { title: 'Tập tính', text: profile.behaviorVi },
    { title: 'Sinh sản', text: profile.reproductionVi },
  ].filter((t): t is { title: string; text: string } => Boolean(t.text));
  const care = profile.trade.tradeable ? profile.care : null;
  const careRows = care
    ? [
        { label: 'Chuồng, bể', value: care.enclosureVi },
        { label: 'Ánh sáng', value: care.lightingVi },
        { label: 'Thức ăn', value: care.feedingVi },
        { label: 'Sống chung', value: care.socialVi },
      ].filter((r): r is { label: string; value: string } => Boolean(r.value))
    : [];

  return (
    <>
      {traits.length > 0 && (
        <Section title="Nhận dạng và tập tính">
          <div className={cn('grid gap-4', traits.length > 1 && 'md:grid-cols-2', traits.length > 2 && 'xl:grid-cols-3')}>
            {traits.map((t) => (
              <Panel key={t.title}>
                <h3 className="text-lg font-semibold text-fg">{t.title}</h3>
                <p className="mt-3 text-base leading-relaxed text-fg-2">{t.text}</p>
              </Panel>
            ))}
          </div>
        </Section>
      )}

      {(profile.funFactsVi.length > 0 || profile.threatsVi.length > 0) && (
        <div className="grid gap-4 pt-16 lg:grid-cols-2">
          {profile.funFactsVi.length > 0 && (
            <Panel>
              <Eyebrow>Có thể bạn chưa biết</Eyebrow>
              <ol className="mt-4 space-y-4">
                {profile.funFactsVi.map((fact, i) => (
                  <li key={fact} className="flex gap-4">
                    <span className="font-mono text-sm text-accent" aria-hidden="true">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <p className="text-base leading-relaxed text-fg">{fact}</p>
                  </li>
                ))}
              </ol>
            </Panel>
          )}
          {profile.threatsVi.length > 0 && (
            <Panel>
              <Eyebrow tone="muted">Mối đe doạ chính</Eyebrow>
              <ul className="mt-4 flex flex-wrap gap-2">
                {profile.threatsVi.map((t) => (
                  <li key={t} className="rounded-full border border-line px-3.5 py-1.5 text-sm text-fg">
                    {t}
                  </li>
                ))}
              </ul>
              {profile.populationTrend && profile.populationTrend !== 'Unknown' && (
                <p className="mt-5 text-sm text-fg-2">
                  Quần thể ngoài tự nhiên đang{' '}
                  <span className="font-semibold text-fg">
                    {{ Increasing: 'tăng', Stable: 'ổn định', Decreasing: 'giảm' }[profile.populationTrend]}
                  </span>
                  {profile.iucnAssessedYear ? ` (IUCN đánh giá năm ${profile.iucnAssessedYear}).` : '.'}
                </p>
              )}
            </Panel>
          )}
        </div>
      )}

      {care && careRows.length > 0 && (
        <Section
          title="Hướng dẫn nuôi"
          description={`Tóm tắt điều kiện nuôi ${displayName.toLowerCase()} trong nhà. Tham khảo thêm người nuôi lâu năm trước khi mua.`}
        >
          <Panel>
            <div className="flex flex-wrap items-center gap-3">
              {care.difficulty && (
                <span className={cn('rounded-full border px-3.5 py-1 text-sm font-semibold', DIFFICULTY_TONE[care.difficulty])}>
                  Độ khó: {care.difficulty}
                </span>
              )}
              {care.beginnerFriendly != null && (
                <span className="text-sm text-fg-2">
                  {care.beginnerFriendly ? 'Hợp với người mới nuôi' : 'Nên có kinh nghiệm trước khi nuôi'}
                </span>
              )}
            </div>
            <dl className="mt-5 divide-y divide-line border-y border-line">
              {careRows.map((r) => (
                <div key={r.label} className="grid gap-1 py-3.5 sm:grid-cols-[140px_minmax(0,1fr)] sm:gap-6">
                  <dt className="text-sm text-fg-3">{r.label}</dt>
                  <dd className="text-sm text-fg md:text-base">{r.value}</dd>
                </div>
              ))}
            </dl>
            {care.commonProblemsVi && care.commonProblemsVi.length > 0 && (
              <div className="mt-5">
                <h3 className="text-sm font-semibold text-fg">Lỗi hay gặp</h3>
                <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm text-fg-2">
                  {care.commonProblemsVi.map((p) => (
                    <li key={p}>{p}</li>
                  ))}
                </ul>
              </div>
            )}
          </Panel>
        </Section>
      )}

      {profile.similarSpecies.length > 0 && (
        <Section title="Loài dễ nhầm" description="Những loài trông gần giống, cần xem kỹ trước khi mua hoặc định danh.">
          <ul className="flex flex-wrap gap-2">
            {profile.similarSpecies.map((name) => {
              const match = speciesIdByName.get(name);
              return (
                <li key={name}>
                  {match ? (
                    <Link
                      to={`/species/${match.id}`}
                      className="inline-flex items-center gap-2 rounded-full border border-line px-4 py-2 text-sm text-fg transition-colors hover:border-accent hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                    >
                      <span>{match.displayName}</span>
                      <i className="font-serif text-fg-2">{name}</i>
                    </Link>
                  ) : (
                    <span className="inline-flex rounded-full border border-line px-4 py-2 font-serif text-sm text-fg-2 italic">{name}</span>
                  )}
                </li>
              );
            })}
          </ul>
        </Section>
      )}
    </>
  );
};
