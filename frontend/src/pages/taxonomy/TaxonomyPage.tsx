import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router';
import { AlertTriangle } from 'lucide-react';
import { useTaxonomyTree, useTaxonomyDetail, useTaxonomyChildren, useTaxonomySpecies } from '@/api/queries/useTaxonomyQueries';
import { useSpeciesList } from '@/api/queries/useSpeciesQueries';
import { useProducts } from '@/api/queries/useProductQueries';
import { useTaxonomyChildrenMany, useBranchSpeciesMany } from '@/api/queries/useTaxonomyBranchQueries';
import { ApiError } from '@/api/errors';
import { TaxonomyHeader } from './components/TaxonomyHeader';
import { MillerColumns, type ColumnData } from './components/MillerColumns';
import { TaxonomySidebar } from './components/TaxonomySidebar';
import { TaxonomyHelixView } from './components/TaxonomyHelixView';
import { MobileTaxonomyView } from './components/MobileTaxonomyView';
import { TaxonomyNotFound } from './components/TaxonomyNotFound';
import { normalizeBreadcrumbs } from '@/components/domain/TaxonPath';
import { RANK_INFO } from '@/components/domain/TaxonRankChip';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import type { TaxonomyNodeDto, TaxonomyRank } from '@/types/api';
import type { ThumbnailItem } from './components/ThumbnailStack';

const rankOf = (node: TaxonomyNodeDto): TaxonomyRank => node.rankLevel || node.rank;
const columnTitle = (rank: TaxonomyRank): string => RANK_INFO[rank]?.labelVi ?? rank;

export const TaxonomyPage: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();

  const [viewMode, setViewMode] = useState<'columns' | 'helix'>('columns');

  // 1. Nạp cây phân loại gốc (các nút Giới)
  const treeQuery = useTaxonomyTree();
  const rootNodes = treeQuery.data || [];

  // Không có :id thì mở nút gốc đầu tiên do API trả về (id thật trong DB có thể khác seed)
  const parsedId = id !== undefined ? Number(id) : rootNodes[0]?.id;
  const isInvalidId = id !== undefined && (!Number.isInteger(parsedId) || (parsedId ?? 0) <= 0);
  const activeNodeId = !isInvalidId && parsedId ? parsedId : 0;

  // 2. Nạp chi tiết nút hiện tại & breadcrumbs
  const detailQuery = useTaxonomyDetail(activeNodeId, { enabled: activeNodeId > 0 });

  // 3. Nạp nút con của nút hiện tại
  const childrenQuery = useTaxonomyChildren(activeNodeId, { enabled: activeNodeId > 0 });

  // 4. Nếu nút hiện tại là GENUS, nạp danh sách loài của chi
  const activeNode = detailQuery.data?.node || null;
  const isGenus = activeNode ? rankOf(activeNode) === 'GENUS' : false;
  const genusSpeciesQuery = useTaxonomySpecies(activeNodeId, { enabled: isGenus });

  // 5. Toàn bộ loài dưới nhánh đang chọn (API tự gom cây con)
  const branchQuery = useSpeciesList(activeNode ? { nodeId: activeNode.id } : undefined);
  const branchSpecies = activeNode ? branchQuery.data || [] : [];

  // 6. Sản phẩm đang bán để tính thống kê
  const productsQuery = useProducts();

  // Bản đồ số sản phẩm APPROVED cho từng loài
  const productCounts = useMemo(() => {
    const counts: Record<number, number> = {};
    const approved = (productsQuery.data?.items || []).filter((p) => p.status === 'APPROVED');
    approved.forEach((p) => {
      counts[p.speciesId] = (counts[p.speciesId] || 0) + 1;
    });
    return counts;
  }, [productsQuery.data?.items]);

  // Chuỗi phả hệ chuẩn hoá từ Gốc tới nút hiện tại
  const breadcrumbs = useMemo(() => {
    return normalizeBreadcrumbs(detailQuery.data?.breadcrumbs, activeNode || undefined);
  }, [detailQuery.data?.breadcrumbs, activeNode]);

  // Mỗi cột Miller là danh sách con của một mắt xích (trừ Chi: cột cuối là danh sách loài)
  const crumbIdsWithChildren = useMemo(
    () => breadcrumbs.filter((b) => rankOf(b) !== 'GENUS').map((b) => b.id),
    [breadcrumbs]
  );
  const { childrenById } = useTaxonomyChildrenMany(crumbIdsWithChildren);

  // Dựng cấu trúc các cột Miller dựa trên breadcrumbs
  const columns = useMemo<ColumnData[]>(() => {
    const cols: ColumnData[] = [];
    if (rootNodes.length === 0) return cols;

    const selectedKingdom = breadcrumbs.find((b) => rankOf(b) === 'KINGDOM');
    cols.push({
      rank: 'KINGDOM',
      title: columnTitle('KINGDOM'),
      items: rootNodes,
      selectedId: selectedKingdom ? selectedKingdom.id : null,
    });

    breadcrumbs.forEach((crumb, i) => {
      const children = childrenById[crumb.id];
      if (!children || children.length === 0) return;
      const rank = rankOf(children[0]!);
      cols.push({
        rank,
        title: columnTitle(rank),
        items: children,
        selectedId: breadcrumbs[i + 1]?.id ?? null,
      });
    });

    return cols;
  }, [rootNodes, breadcrumbs, childrenById]);

  // Chồng ảnh thu nhỏ: loài dưới mỗi nút đang hiện trên các cột (và các nhánh con ở mobile)
  const visibleNodeIds = useMemo(() => {
    const ids = new Set<number>();
    columns.forEach((col) => col.items.forEach((n) => ids.add(n.id)));
    (childrenQuery.data || []).forEach((n) => ids.add(n.id));
    return Array.from(ids);
  }, [columns, childrenQuery.data]);
  const branchSpeciesByNode = useBranchSpeciesMany(visibleNodeIds);

  const thumbnailsMap = useMemo(() => {
    const map: Record<number, ThumbnailItem[]> = {};
    Object.entries(branchSpeciesByNode).forEach(([nodeId, list]) => {
      map[Number(nodeId)] = list.map((sp) => ({
        speciesId: sp.id,
        name: sp.displayName,
        url: sp.heroPhoto,
      }));
    });
    return map;
  }, [branchSpeciesByNode]);

  // Tổng số sản phẩm APPROVED trong nhánh
  const totalApprovedProducts = useMemo(() => {
    return branchSpecies.reduce((sum, sp) => sum + (productCounts[sp.id] || 0), 0);
  }, [branchSpecies, productCounts]);

  // Xử lý chọn nút mới -> cập nhật URL
  const handleSelectNode = (node: TaxonomyNodeDto) => {
    navigate(`/taxonomy/${node.id}`);
  };

  // Chỉ báo 404 khi id sai định dạng hoặc API xác nhận không tồn tại; lỗi khác cho phép thử lại
  const detailError = detailQuery.error;
  const isNotFound =
    isInvalidId ||
    (detailError instanceof ApiError && (detailError.status === 404 || detailError.status === 400));
  if (isNotFound) {
    return <TaxonomyNotFound />;
  }

  if (treeQuery.isError || detailQuery.isError) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-16">
        <EmptyState
          icon={<AlertTriangle className="size-7" aria-hidden="true" />}
          title="Không tải được cây phân loại"
          description="Máy chủ BioNexus đang không phản hồi. Vui lòng kiểm tra kết nối rồi thử lại."
          action={{
            label: 'Thử lại',
            onClick: () => {
              void treeQuery.refetch();
              if (activeNodeId > 0) void detailQuery.refetch();
            },
          }}
        />
      </div>
    );
  }

  const isLoadingNode = treeQuery.isLoading || (activeNodeId > 0 && detailQuery.isLoading);

  // Terminal Genus nếu nút chọn là Genus
  const terminalGenus = isGenus ? activeNode : null;
  const terminalSpecies = isGenus ? (genusSpeciesQuery.data || []) : [];

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 space-y-6">
      {/* Header trang, breadcrumbs & Segmented Control */}
      <TaxonomyHeader
        breadcrumbs={breadcrumbs}
        currentNode={activeNode || undefined}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      {isLoadingNode ? (
        <div className="flex gap-4 overflow-hidden" role="status" aria-label="Đang tải cây phân loại">
          {Array.from({ length: 3 }, (_, i) => (
            <Skeleton key={i} className="h-[420px] w-full md:w-72 shrink-0 rounded-2xl" />
          ))}
        </div>
      ) : (
        <>
          {/* Chế độ xem di động (< 768px) */}
          {activeNode && (
            <MobileTaxonomyView
              currentNode={activeNode}
              breadcrumbs={breadcrumbs}
              childrenNodes={childrenQuery.data || []}
              speciesList={terminalSpecies}
              branchSpeciesCount={branchSpecies.length}
              onSelectNode={handleSelectNode}
              thumbnailsMap={thumbnailsMap}
              productCounts={productCounts}
            />
          )}

          {/* Chế độ xem máy tính để bàn (≥ 768px) */}
          <div className="hidden md:flex items-start gap-6">
            <div className="flex-1 min-w-0">
              {viewMode === 'columns' ? (
                <MillerColumns
                  columns={columns}
                  onSelectNode={handleSelectNode}
                  terminalGenus={terminalGenus}
                  terminalSpecies={terminalSpecies}
                  thumbnailsMap={thumbnailsMap}
                  productCounts={productCounts}
                />
              ) : (
                activeNode && (
                  <TaxonomyHelixView
                    activeNode={activeNode}
                    branchSpecies={branchSpecies}
                    productCounts={productCounts}
                  />
                )
              )}
            </div>

            {/* Panel tóm tắt dính bên phải */}
            <div className="sticky top-20">
              <TaxonomySidebar
                activeNode={activeNode}
                branchSpecies={branchSpecies}
                totalApprovedProducts={totalApprovedProducts}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default TaxonomyPage;
