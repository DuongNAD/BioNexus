import React, { useMemo } from 'react';
import { useParams } from 'react-router';
import { ArrowRight, ExternalLink, MapPin, ShoppingBag } from 'lucide-react';
import { useSpeciesDetail, useSpeciesList } from '@/api/queries/useSpeciesQueries';
import { useTaxonomyDetail } from '@/api/queries/useTaxonomyQueries';
import { useProducts } from '@/api/queries/useProductQueries';
import { ApiError } from '@/api/errors';
import { useCatalogSpecies } from '@/api/catalog';
import { SpeciesHeroCover, catalogCredit } from './components/SpeciesHeroCover';
import { CatalogProfile, formatCatalogSize, formatElevation } from './components/CatalogProfile';
import { PhotoCredit } from '@/components/media/PhotoCredit';
import { SpeciesTaxonomyBeam } from './components/SpeciesTaxonomyBeam';
import { SpeciesNotFound } from './components/SpeciesNotFound';
import { IucnScale } from './components/IucnScale';
import { MasonryGallery } from '@/components/domain/MasonryGallery';
import { SpeciesCard } from '@/components/domain/SpeciesCard';
import { ProductCard } from '@/components/domain/ProductCard';
import { ClimateBar } from '@/components/domain/ClimateBar';
import { HumidityGauge } from '@/components/domain/HumidityGauge';
import { ButtonLink } from '@/components/domain/ButtonLink';
import { QueryErrorState } from '@/components/domain/QueryErrorState';
import { normalizeBreadcrumbs } from '@/components/domain/TaxonPath';
import { Eyebrow, PageContainer, Panel, Section } from '@/components/layout/Page';
import { Photo } from '@/components/media/Photo';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';

// Địa cầu mini kéo theo three.js: tải sau khi phần chữ của hồ sơ đã hiện
const SpeciesOriginGlobe = React.lazy(() => import('./components/SpeciesOriginGlobe'));

export const SpeciesDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const speciesId = id ? Number(id) : NaN;
  const isInvalid = !Number.isInteger(speciesId) || speciesId <= 0;

  const speciesQuery = useSpeciesDetail(speciesId, { enabled: !isInvalid });
  const species = speciesQuery.data;

  // Phả hệ lấy từ nút Chi của loài
  const taxonomyQuery = useTaxonomyDetail(species?.nodeId || 0, { enabled: Boolean(species?.nodeId) });

  // Cá thể đang bán của loài này (contract: products?speciesId=)
  const productsQuery = useProducts({ speciesId: !isInvalid ? speciesId : undefined, size: 48 });

  // Hồ sơ mở rộng của loài catalog (9 loài gốc dùng species-extras nên không cần)
  const catalogQuery = useCatalogSpecies(species?.scientificName, { enabled: Boolean(species?.isCatalog) });
  const profile = catalogQuery.data ?? null;
  // Cả bách khoa (đã có trong bộ đệm nếu vừa qua trang danh sách) để biến loài dễ nhầm thành link
  const allSpeciesQuery = useSpeciesList(undefined);
  const speciesIdByName = useMemo(
    () => new Map((allSpeciesQuery.data || []).map((s) => [s.scientificName, { id: s.id, displayName: s.displayName }])),
    [allSpeciesQuery.data]
  );

  // Loài họ hàng: cùng chi trước, không có thì cùng họ (nút cha của chi lấy từ API)
  const genusNode = taxonomyQuery.data?.node;
  const familyNodeId = genusNode?.parentId ?? undefined;
  const sameGenusQuery = useSpeciesList(species?.nodeId ? { nodeId: species.nodeId } : undefined);
  const sameFamilyQuery = useSpeciesList(familyNodeId ? { nodeId: familyNodeId } : undefined);

  const approvedProducts = useMemo(
    () => (productsQuery.data?.items || []).filter((p) => p.status === 'APPROVED'),
    [productsQuery.data?.items]
  );

  const siblingSpecies = useMemo(() => {
    if (!species) return [];
    const sameGenus = (species.nodeId ? sameGenusQuery.data || [] : []).filter((s) => s.id !== species.id);
    if (sameGenus.length > 0) return sameGenus.slice(0, 8);
    if (!familyNodeId) return [];
    return (sameFamilyQuery.data || []).filter((s) => s.id !== species.id).slice(0, 4);
  }, [species, sameGenusQuery.data, sameFamilyQuery.data, familyNodeId]);

  const breadcrumbs = useMemo(
    () => normalizeBreadcrumbs(taxonomyQuery.data?.breadcrumbs || [], taxonomyQuery.data?.node),
    [taxonomyQuery.data]
  );

  // Chỉ báo 404 khi id sai hoặc API xác nhận không tồn tại; lỗi mạng hay 500 thì cho thử lại
  const loadError = speciesQuery.error;
  const isNotFound =
    isInvalid ||
    (loadError instanceof ApiError && (loadError.status === 404 || loadError.status === 400)) ||
    (speciesQuery.isSuccess && !species);
  if (isNotFound) {
    return <SpeciesNotFound />;
  }

  if (speciesQuery.isError) {
    return (
      <PageContainer className="py-24">
        <QueryErrorState
          title="Không tải được hồ sơ loài"
          error={speciesQuery.error}
          onRetry={() => void speciesQuery.refetch()}
          isRetrying={speciesQuery.isFetching}
        />
      </PageContainer>
    );
  }

  if (speciesQuery.isLoading || !species) {
    return (
      <div role="status" aria-label="Đang tải hồ sơ loài">
        <Skeleton className="h-[72vh] w-full rounded-none" />
        <PageContainer className="space-y-4 py-12">
          <Skeleton className="h-8 w-1/2" />
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-5 w-2/3" />
        </PageContainer>
      </div>
    );
  }

  const specs = species.parsedSpecs;
  const pullQuote = species.pullQuote ?? profile?.pullQuoteVi ?? undefined;
  const facts = [
    { label: 'Tên gọi khác', value: profile?.otherNamesVi.join(', ') },
    { label: 'Môi trường sống', value: specs.habitat },
    { label: 'Nơi bản địa', value: profile?.distribution?.nativeRangeVi ?? species.origin.place },
    { label: 'Độ cao', value: formatElevation(profile?.distribution ?? null) },
    { label: 'Kiểu sinh cảnh', value: profile?.habitatTypesVi.join(', ') },
    { label: 'Kích thước', value: formatCatalogSize(profile?.size ?? null) },
    { label: 'Chế độ ăn', value: species.diet ?? profile?.dietVi },
    { label: 'Tuổi thọ', value: species.lifespan ?? profile?.lifespanVi },
    { label: 'Thời gian hoạt động', value: species.activityTime ?? profile?.activityTimeVi },
  ].filter((f): f is { label: string; value: string } => Boolean(f.value));
  const portrait = profile?.photos.portrait;
  const externalLinks = [
    { label: 'Hồ sơ loài trên GBIF', href: species.gbifUrl },
    { label: 'Sách Đỏ IUCN', href: profile?.iucnUrl },
    { label: 'Wikipedia tiếng Việt', href: profile?.wikipediaVi },
    { label: 'Wikipedia tiếng Anh', href: profile?.wikipediaEn },
  ].filter((l): l is { label: string; href: string } => Boolean(l.href));

  return (
    <>
      <SpeciesHeroCover species={species} breadcrumbs={breadcrumbs} catalogHero={profile?.photos.hero} />

      <PageContainer className="pb-20">
        {/* 1. Đặc điểm sinh học và điều kiện sống */}
        <div className="grid gap-10 pt-12 pb-4 md:pt-16 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-14">
          <div className="min-w-0">
            <Eyebrow className="mb-4">Đặc điểm sinh học</Eyebrow>
            {pullQuote && (
              <blockquote className="font-serif text-2xl leading-snug text-fg italic md:text-[34px] md:leading-[1.2]">
                {pullQuote}
              </blockquote>
            )}
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-fg-2 md:text-lg">{species.description}</p>

            {facts.length > 0 && (
              <dl className="mt-8 max-w-2xl divide-y divide-line border-y border-line">
                {facts.map((f) => (
                  <div key={f.label} className="grid gap-1 py-3.5 sm:grid-cols-[160px_minmax(0,1fr)] sm:gap-6">
                    <dt className="text-sm text-fg-3">{f.label}</dt>
                    <dd className="text-sm text-fg md:text-base">{f.value}</dd>
                  </div>
                ))}
              </dl>
            )}
          </div>

          <aside className="lg:sticky lg:top-24 lg:self-start">
            <Panel className="space-y-6">
              <div>
                <Eyebrow tone="muted">Điều kiện nuôi</Eyebrow>
                <p className="mt-2 text-sm text-fg-3">Khoảng thích nghi lấy từ hồ sơ khoa học của loài.</p>
              </div>
              <ClimateBar specs={specs} />
              <div className="border-t border-line pt-6">
                <HumidityGauge
                  humidMin={specs.humidMin}
                  humidMax={specs.humidMax}
                  notApplicable={specs.humidityNotApplicable}
                />
              </div>
              {externalLinks.length > 0 && (
                <ul className="divide-y divide-line border-t border-line">
                  {externalLinks.map((l) => (
                    <li key={l.label}>
                      <a
                        href={l.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between gap-3 py-3.5 text-sm text-fg-2 transition-colors hover:text-fg"
                      >
                        <span>{l.label}</span>
                        <ExternalLink className="size-4 shrink-0" aria-hidden="true" />
                        <span className="sr-only">(mở trong thẻ mới)</span>
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </Panel>
          </aside>
        </div>

        {/* 2. Nơi bản địa */}
        <Section title="Nơi bản địa" description={`Ngoài tự nhiên, ${species.displayName.toLowerCase()} sống ở ${species.origin.place}.`}>
          <div className="grid gap-4 md:grid-cols-2">
            <div data-theme="dark" className="relative h-[340px] overflow-hidden rounded-[20px] border border-line bg-bg-deep md:h-[400px]">
              <React.Suspense fallback={<Skeleton className="size-full rounded-none" />}>
                <SpeciesOriginGlobe species={species} />
              </React.Suspense>
              <p className="pointer-events-none absolute right-4 bottom-4 left-4 z-30 flex items-center justify-between gap-3 rounded-xl bg-black/65 px-4 py-2.5 text-sm text-white/85 backdrop-blur-md">
                <span className="flex min-w-0 items-center gap-2">
                  <MapPin className="size-4 shrink-0 text-accent" aria-hidden="true" />
                  <span className="truncate">{species.origin.place}</span>
                </span>
                <span className="shrink-0 font-mono text-xs text-white/70">
                  {species.nativeCoordsFormatted || `${species.origin.lat}°, ${species.origin.lng}°`}
                </span>
              </p>
            </div>
            {!species.habitatPhotoId && portrait && (
              <figure className="group relative h-[340px] overflow-hidden rounded-[20px] border border-line md:h-[400px]" style={{ backgroundColor: portrait.color }}>
                <img
                  src={portrait.src}
                  alt={`Chân dung ${species.displayName} (${species.scientificName})`}
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
                <PhotoCredit credit={catalogCredit(portrait)} variant="hover-chip" className="top-2.5 bottom-auto" />
              </figure>
            )}
            {species.habitatPhotoId && (
              <figure className="relative h-[340px] overflow-hidden rounded-[20px] border border-line md:h-[400px]">
                <Photo
                  id={species.habitatPhotoId}
                  alt={`Sinh cảnh tự nhiên của ${species.displayName} tại ${species.origin.place}`}
                  className="h-full w-full rounded-none border-0"
                  imgClassName="h-full w-full object-cover"
                />
                <figcaption className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 to-transparent p-5 pt-16 text-sm text-white/85">
                  Sinh cảnh tự nhiên
                </figcaption>
              </figure>
            )}
          </div>
        </Section>

        {/* 3. Mức bảo tồn */}
        <Section title="Mức bảo tồn IUCN">
          <IucnScale currentStatus={species.conservationStatus} explanation={species.conservationNote ?? profile?.conservationNoteVi ?? undefined} />
        </Section>

        {profile && <CatalogProfile profile={profile} displayName={species.displayName} speciesIdByName={speciesIdByName} />}

        {/* 4. Thư viện ảnh */}
        {species.galleryPhotoIds && species.galleryPhotoIds.length > 0 && (
          <Section title="Thư viện ảnh" description="Ảnh thật có giấy phép tự do. Bấm vào ảnh để xem lớn kèm tác giả và giấy phép.">
            <MasonryGallery photoIds={species.galleryPhotoIds} />
          </Section>
        )}

        {/* 5. Vị trí trong cây phân loại */}
        {breadcrumbs.length > 0 && (
          <Section title="Vị trí trong cây phân loại">
            <SpeciesTaxonomyBeam breadcrumbs={breadcrumbs} speciesName={species.scientificName} />
          </Section>
        )}

        {/* 6. Cá thể đang bán */}
        <Section
          title="Cá thể đang bán"
          description="Chỉ cá thể nhân giống có giấy tờ, đã qua kiểm duyệt mới lên sàn."
          actions={
            <ButtonLink to="/products" variant="ghost" pill>
              <span>Xem cửa hàng</span>
              <ArrowRight className="size-4" aria-hidden="true" />
            </ButtonLink>
          }
        >
          {productsQuery.isLoading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" role="status" aria-label="Đang tải sản phẩm">
              {Array.from({ length: 3 }, (_, i) => (
                <Skeleton key={i} className="h-80 w-full rounded-[20px]" />
              ))}
            </div>
          ) : productsQuery.isError ? (
            <QueryErrorState
              title="Không tải được cá thể đang bán"
              error={productsQuery.error}
              onRetry={() => void productsQuery.refetch()}
            />
          ) : approvedProducts.length === 0 ? (
            <EmptyState
              icon={<ShoppingBag aria-hidden="true" />}
              title="Chưa có cửa hàng nào bán loài này"
              description="Khi một cửa hàng nhân giống được duyệt đăng bán, cá thể sẽ hiện ở đây."
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {approvedProducts.map((prod) => (
                <ProductCard key={prod.id} product={prod} />
              ))}
            </div>
          )}
        </Section>

        {/* 7. Loài họ hàng */}
        {siblingSpecies.length > 0 && (
          <Section title="Loài họ hàng gần" description="Cùng chi, hoặc cùng họ khi chi chỉ có một loài.">
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {siblingSpecies.map((sib) => (
                <li key={sib.id}>
                  <SpeciesCard species={sib} />
                </li>
              ))}
            </ul>
          </Section>
        )}
      </PageContainer>
    </>
  );
};

export default SpeciesDetailPage;
