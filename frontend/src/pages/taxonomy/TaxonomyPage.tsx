import React, { useMemo, useState } from 'react';
import { useParams } from 'react-router';
import { Dna, LayoutGrid } from 'lucide-react';
import { useTaxonomyTree, useTaxonomyDetail, useTaxonomyChildren } from '@/api/queries/useTaxonomyQueries';
import { useSpeciesList } from '@/api/queries/useSpeciesQueries';
import { useAllApprovedProducts } from '@/api/queries/useProductQueries';
import { useBranchSpeciesMany } from '@/api/queries/useTaxonomyBranchQueries';
import { ApiError } from '@/api/errors';
import { normalizeBreadcrumbs } from '@/components/domain/TaxonPath';
import { RANK_INFO } from '@/components/domain/TaxonRankChip';
import { QueryErrorState } from '@/components/domain/QueryErrorState';
import { PageContainer, PageHeader, Section, type BreadcrumbItem } from '@/components/layout/Page';
import { MediaCard } from '@/components/media/MediaCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { IucnBadge } from '@/components/ui/IucnBadge';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { Skeleton } from '@/components/ui/Skeleton';
import { PRODUCT_PLACEHOLDER_IMAGE } from '@/api/adapters';
import { RankLadder } from './components/RankLadder';
import { BranchSummary } from './components/BranchSummary';
import { TaxonomyNotFound } from './components/TaxonomyNotFound';
import type { TaxonomyNodeDto, TaxonomyRank } from '@/types/api';

// Chuỗi xoắn 3D kéo theo three.js: chỉ tải khi người dùng bật chế độ này
const TaxonomyHelixView = React.lazy(() =>
  import('./components/TaxonomyHelixView').then((m) => ({ default: m.TaxonomyHelixView }))
);

const rankOf = (node: TaxonomyNodeDto): TaxonomyRank => node.rankLevel || node.rank;
const CHILD_RANK: Partial<Record<TaxonomyRank, TaxonomyRank>> = {
  KINGDOM: 'PHYLUM',
  PHYLUM: 'CLASS',
  CLASS: 'ORDER',
  ORDER: 'FAMILY',
  FAMILY: 'GENUS',
};

/** Tên khoa học in nghiêng chỉ ở cấp Chi (quy ước danh pháp, tài liệu 03 mục 3) */
function ScientificName({ node }: { node: TaxonomyNodeDto }): React.JSX.Element {
  return RANK_INFO[rankOf(node)]?.isItalic ? (
    <i className="font-serif font-medium">{node.scientificName}</i>
  ) : (
    <>{node.scientificName}</>
  );
}

function CardGridSkeleton(): React.JSX.Element {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3" role="status" aria-label="Đang tải các nhánh">
      {Array.from({ length: 3 }, (_, i) => (
        <Skeleton key={i} className="aspect-[4/5] w-full rounded-[20px]" />
      ))}
    </div>
  );
}

export const TaxonomyPage: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const [viewMode, setViewMode] = useState<'cards' | 'helix'>('cards');

  const parsedId = id !== undefined ? Number(id) : undefined;
  const isInvalidId = id !== undefined && (!Number.isInteger(parsedId) || (parsedId ?? 0) <= 0);
  // Không có :id là trang gốc: hiện các Giới do API trả về
  const activeNodeId = !isInvalidId && parsedId ? parsedId : 0;
  const isRoot = activeNodeId === 0;

  const treeQuery = useTaxonomyTree();
  const detailQuery = useTaxonomyDetail(activeNodeId, { enabled: !isRoot });
  const childrenQuery = useTaxonomyChildren(activeNodeId, { enabled: !isRoot });

  const activeNode = isRoot ? null : detailQuery.data?.node ?? null;
  const path = useMemo(
    () => (activeNode ? normalizeBreadcrumbs(detailQuery.data?.breadcrumbs, activeNode) : []),
    [detailQuery.data?.breadcrumbs, activeNode]
  );
  const isGenus = activeNode ? rankOf(activeNode) === 'GENUS' : false;

  // Loài dưới cả nhánh đang xem (API tự gom cây con); ở gốc là toàn bộ loài
  const branchQuery = useSpeciesList(activeNode ? { nodeId: activeNode.id } : undefined);
  const branchSpecies = useMemo(() => branchQuery.data ?? [], [branchQuery.data]);

  // Các nhánh con hiển thị thành thẻ: ở gốc là các Giới
  const childNodes = useMemo(
    () => (isRoot ? treeQuery.data ?? [] : childrenQuery.data ?? []),
    [isRoot, treeQuery.data, childrenQuery.data]
  );
  const childIds = useMemo(() => childNodes.map((n) => n.id), [childNodes]);
  const speciesByChild = useBranchSpeciesMany(childIds);

  // Số cá thể đang bán của từng loài (sàn chỉ trả sản phẩm APPROVED)
  const productsQuery = useAllApprovedProducts();
  const productCounts = useMemo(() => {
    const counts: Record<number, number> = {};
    (productsQuery.data ?? []).forEach((p) => {
      counts[p.speciesId] = (counts[p.speciesId] || 0) + 1;
    });
    return counts;
  }, [productsQuery.data]);

  const detailError = detailQuery.error;
  if (isInvalidId || (detailError instanceof ApiError && (detailError.status === 404 || detailError.status === 400))) {
    return <TaxonomyNotFound />;
  }

  const isLoading = isRoot ? treeQuery.isLoading : detailQuery.isLoading;
  const loadError = isRoot ? treeQuery.isError : detailQuery.isError || childrenQuery.isError;

  const rankInfo = activeNode ? RANK_INFO[rankOf(activeNode)] : null;
  const childRank = activeNode ? CHILD_RANK[rankOf(activeNode)] : 'KINGDOM';
  const childRankLabel = childRank ? RANK_INFO[childRank].labelVi : '';

  const breadcrumbs: BreadcrumbItem[] = [
    { label: 'Cây phân loại', to: '/taxonomy' },
    ...path.map((n) => ({ label: n.scientificName, to: `/taxonomy/${n.id}` })),
  ];

  const meta = activeNode && (
    <>
      <span>
        <span className="font-mono text-fg">{branchSpecies.length}</span> loài trong nhánh
      </span>
      {!isGenus && childNodes.length > 0 && (
        <span>
          <span className="font-mono text-fg">{childNodes.length}</span> {childRankLabel.toLowerCase()} trực thuộc
        </span>
      )}
    </>
  );

  return (
    <PageContainer>
      <PageHeader
        breadcrumbs={isRoot ? undefined : breadcrumbs}
        eyebrow={rankInfo ? `Cấp ${rankInfo.labelVi}` : 'Phân loại 6 cấp'}
        title={activeNode ? <ScientificName node={activeNode} /> : 'Cây phân loại'}
        description={
          activeNode ? (
            <>
              <span className="text-fg">{activeNode.commonName}</span>
              <span className="mt-1 block text-base text-fg-3">{rankInfo?.definition}</span>
            </>
          ) : (
            'Đi từ Giới xuống Ngành, Lớp, Bộ, Họ và Chi để gặp từng loài bằng ảnh thật, kèm mức bảo tồn IUCN.'
          )
        }
        meta={meta}
        actions={
          !isRoot && (
            <SegmentedControl
              label="Chế độ xem"
              value={viewMode}
              onChange={setViewMode}
              options={[
                { value: 'cards', label: 'Thẻ ảnh', icon: <LayoutGrid className="size-4" aria-hidden="true" /> },
                { value: 'helix', label: 'Chuỗi xoắn 3D', icon: <Dna className="size-4" aria-hidden="true" /> },
              ]}
            />
          )
        }
      />

      <RankLadder path={path} />

      {loadError ? (
        <div className="py-16">
          <QueryErrorState
            title="Không tải được cây phân loại"
            onRetry={() => {
              void treeQuery.refetch();
              if (!isRoot) {
                void detailQuery.refetch();
                void childrenQuery.refetch();
              }
            }}
          />
        </div>
      ) : (
        <div className="grid gap-8 pb-20 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-10">
          <div className="min-w-0">
            {viewMode === 'helix' && activeNode ? (
              <Section as="h2" title={`Chuỗi xoắn loài của ${activeNode.scientificName}`}>
                <React.Suspense fallback={<Skeleton className="h-[520px] w-full rounded-[20px]" />}>
                  <TaxonomyHelixView activeNode={activeNode} branchSpecies={branchSpecies} productCounts={productCounts} />
                </React.Suspense>
              </Section>
            ) : isGenus ? (
              <Section
                title={
                  <>
                    Loài thuộc chi <i className="font-serif font-medium">{activeNode?.scientificName}</i>
                  </>
                }
                description="Bấm vào một loài để xem hồ sơ, nơi bản địa và các cá thể nhân giống đang bán."
              >
                {branchQuery.isLoading ? (
                  <CardGridSkeleton />
                ) : branchSpecies.length === 0 ? (
                  <EmptyState title="Chưa có loài nào ở nhánh này" description="Chi này chưa có loài được ghi nhận trong bách khoa." />
                ) : (
                  <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {branchSpecies.map((sp) => {
                      const onSale = productCounts[sp.id] || 0;
                      return (
                        <li key={sp.id}>
                          <MediaCard
                            to={`/species/${sp.id}`}
                            image={sp.cardPhoto}
                            imageAlt={sp.displayName}
                            focus={sp.focus}
                            badge={<IucnBadge code={sp.conservationStatus} size="sm" className="bg-black/60 backdrop-blur-md" />}
                            title={sp.displayName}
                            subtitle={<i className="font-serif text-[15px]">{sp.scientificName}</i>}
                            footer={<span>{onSale > 0 ? `${onSale} cá thể đang bán` : 'Chưa có cá thể đang bán'}</span>}
                          />
                        </li>
                      );
                    })}
                  </ul>
                )}
              </Section>
            ) : (
              <Section
                title={isRoot ? 'Hai giới gốc' : `Các ${childRankLabel.toLowerCase()} trực thuộc`}
                description={
                  childRank && !isRoot
                    ? RANK_INFO[childRank].definition
                    : 'Mọi loài trong BioNexus thuộc một trong hai giới: Động vật hoặc Thực vật.'
                }
              >
                {isLoading || (!isRoot && childrenQuery.isLoading) ? (
                  <CardGridSkeleton />
                ) : childNodes.length === 0 ? (
                  <EmptyState title="Chưa có loài nào ở nhánh này" description="Nhánh này chưa có nhánh con hay loài được ghi nhận." />
                ) : (
                  // Ít nhánh thì thẻ rộng hơn để không bỏ trống nửa trang
                  <ul className={childNodes.length <= 2 ? 'grid gap-4 sm:grid-cols-2' : 'grid gap-4 sm:grid-cols-2 xl:grid-cols-3'}>
                    {childNodes.map((child) => {
                      const species = speciesByChild[child.id] ?? [];
                      // Ảnh đại diện: loài đầu tiên có ảnh thật, không lấy ảnh giữ chỗ
                      const cover = species.find((sp) => sp.cardPhoto !== PRODUCT_PLACEHOLDER_IMAGE) ?? species[0];
                      const onSale = species.reduce((sum, sp) => sum + (productCounts[sp.id] || 0), 0);
                      return (
                        <li key={child.id}>
                          <MediaCard
                            to={`/taxonomy/${child.id}`}
                            aspect={childNodes.length <= 2 ? '4/3' : '4/5'}
                            image={cover?.cardPhoto ?? PRODUCT_PLACEHOLDER_IMAGE}
                            imageAlt={cover ? `Ảnh đại diện nhánh ${child.scientificName}: ${cover.displayName}` : ''}
                            focus={cover?.focus}
                            title={<ScientificName node={child} />}
                            subtitle={child.commonName}
                            footer={
                              <>
                                <span>{species.length} loài</span>
                                {onSale > 0 && <span>{onSale} cá thể đang bán</span>}
                              </>
                            }
                          />
                        </li>
                      );
                    })}
                  </ul>
                )}
              </Section>
            )}
          </div>

          <aside className="lg:sticky lg:top-24 lg:self-start lg:pt-12">
            {branchQuery.isLoading ? (
              <Skeleton className="h-[480px] w-full rounded-[20px]" />
            ) : (
              <BranchSummary
                title={activeNode ? activeNode.commonName : 'Toàn bộ bách khoa'}
                species={branchSpecies}
                productCounts={productCounts}
                allSpeciesHref={activeNode ? `/species?node=${activeNode.id}` : '/species'}
              />
            )}
          </aside>
        </div>
      )}
    </PageContainer>
  );
};

export default TaxonomyPage;
