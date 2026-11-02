import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useTaxonomyTree, useTaxonomyDetail, useTaxonomyChildren, useTaxonomySpecies } from '@/api/queries/useTaxonomyQueries';
import { useProducts } from '@/api/queries/useProductQueries';
import { TaxonomyHeader } from './components/TaxonomyHeader';
import { MillerColumns, type ColumnData } from './components/MillerColumns';
import { TaxonomySidebar } from './components/TaxonomySidebar';
import { TaxonomyHelixView } from './components/TaxonomyHelixView';
import { MobileTaxonomyView } from './components/MobileTaxonomyView';
import { TaxonomyNotFound } from './components/TaxonomyNotFound';
import { normalizeBreadcrumbs } from '@/components/domain/TaxonPath';
import { SEED_SPECIES } from '@/mocks/data/species';
import { SEED_TAXONOMY } from '@/mocks/data/taxonomy';
import { SPECIES_EXTRAS, extractNames } from '@/api/adapters';
import type { TaxonomyNodeDto, SpeciesDto } from '@/types/api';
import type { ThumbnailItem } from './components/ThumbnailStack';

export const TaxonomyPage: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();

  // Mặc định chọn nút Giới Động vật (id: 1) nếu truy cập /taxonomy
  const activeNodeId = id ? parseInt(id, 10) : 1;
  const isInvalidId = isNaN(activeNodeId) || activeNodeId <= 0;

  const [viewMode, setViewMode] = useState<'columns' | 'helix'>('columns');

  // 1. Nạp cây phân loại gốc (2 Giới: Animalia, Plantae)
  const treeQuery = useTaxonomyTree();

  // 2. Nạp chi tiết nút hiện tại & breadcrumbs
  const detailQuery = useTaxonomyDetail(activeNodeId, {
    enabled: !isInvalidId,
  });

  // 3. Nạp nút con của nút hiện tại
  const childrenQuery = useTaxonomyChildren(activeNodeId, {
    enabled: !isInvalidId,
  });

  // 4. Nếu nút hiện tại là GENUS, nạp danh sách loài của chi
  const activeNode = detailQuery.data?.node || null;
  const isGenus = activeNode?.rankLevel === 'GENUS' || activeNode?.rank === 'GENUS';
  const genusSpeciesQuery = useTaxonomySpecies(activeNodeId, {
    enabled: isGenus,
  });

  // 5. Nạp danh sách sản phẩm để tính thống kê và thumbnail stack
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

  // Bản đồ thumbnail 3 loài tiêu biểu cho từng nút phân loại
  const thumbnailsMap = useMemo(() => {
    const map: Record<number, ThumbnailItem[]> = {};

    // Tìm tất cả các loài con cháu nằm dưới từng nút
    SEED_TAXONOMY.forEach((node) => {
      const descendants: ThumbnailItem[] = [];

      // Nếu là GENUS, lấy loài có nodeId === node.id
      SEED_SPECIES.forEach((sp) => {
        // Kiểm tra xem loài có thuộc nhánh của node không
        let currNodeId: number | null = sp.nodeId;
        let isDescendant = false;

        while (currNodeId !== null && currNodeId !== undefined) {
          if (currNodeId === node.id) {
            isDescendant = true;
            break;
          }
          const parent = SEED_TAXONOMY.find((n) => n.id === currNodeId);
          currNodeId = parent ? parent.parentId : null;
        }

        if (isDescendant) {
          const extra = SPECIES_EXTRAS[sp.scientificName];
          const url = extra ? `photos/${extra.slug}/hero-960.webp` : (sp.imageURL || '');
          descendants.push({
            speciesId: sp.id,
            name: extractNames(sp.commonName).displayName,
            url: url || '',
          });
        }
      });

      map[node.id] = descendants;
    });

    return map;
  }, []);

  // Chuỗi phả hệ chuẩn hoá từ Gốc tới nút hiện tại
  const breadcrumbs = useMemo(() => {
    return normalizeBreadcrumbs(detailQuery.data?.breadcrumbs, activeNode || undefined);
  }, [detailQuery.data?.breadcrumbs, activeNode]);

  // Các loài nằm dưới toàn bộ nhánh đang chọn (phục vụ sidebar & 3D helix)
  const branchSpecies = useMemo<SpeciesDto[]>(() => {
    if (!activeNode) return [];
    return SEED_SPECIES.filter((sp) => {
      let currNodeId: number | null = sp.nodeId;
      while (currNodeId !== null && currNodeId !== undefined) {
        if (currNodeId === activeNode.id) return true;
        const parent = SEED_TAXONOMY.find((n) => n.id === currNodeId);
        currNodeId = parent ? parent.parentId : null;
      }
      return false;
    });
  }, [activeNode]);

  // Tổng số sản phẩm APPROVED trong nhánh
  const totalApprovedProducts = useMemo(() => {
    return branchSpecies.reduce((sum, sp) => sum + (productCounts[sp.id] || 0), 0);
  }, [branchSpecies, productCounts]);

  // Dựng cấu trúc các cột Miller dựa trên breadcrumbs
  const columns = useMemo<ColumnData[]>(() => {
    const cols: ColumnData[] = [];
    const rootNodes = treeQuery.data || [];

    if (rootNodes.length === 0) return cols;

    // Cột 0: Giới (KINGDOM)
    const selectedKingdom = breadcrumbs.find((b) => b.rankLevel === 'KINGDOM' || b.rank === 'KINGDOM');
    cols.push({
      rank: 'KINGDOM',
      title: 'Giới · KINGDOM',
      items: rootNodes,
      selectedId: selectedKingdom ? selectedKingdom.id : null,
    });

    // Các cột tiếp theo dựa vào breadcrumbs
    for (let i = 0; i < breadcrumbs.length; i++) {
      const crumb = breadcrumbs[i];
      if (!crumb) continue;

      // Tìm các con trực tiếp của crumb từ SEED_TAXONOMY
      const children = SEED_TAXONOMY.filter((n) => n.parentId === crumb.id);

      if (children.length > 0) {
        const nextCrumb = breadcrumbs[i + 1];
        const rawRank = children[0]?.rank || 'PHYLUM';
        const formattedChildren: TaxonomyNodeDto[] = children.map((c) => ({
          ...c,
          rank: c.rank,
          rankLevel: c.rank,
        }));

        cols.push({
          rank: rawRank,
          title: `${rawRank}`,
          items: formattedChildren,
          selectedId: nextCrumb ? nextCrumb.id : null,
        });
      }
    }

    return cols;
  }, [treeQuery.data, breadcrumbs]);

  // Xử lý chọn nút mới -> cập nhật URL
  const handleSelectNode = (node: TaxonomyNodeDto) => {
    navigate(`/taxonomy/${node.id}`);
  };

  // Trạng thái 404 khi ID không hợp lệ hoặc API trả lỗi không tìm thấy
  if (isInvalidId || (detailQuery.isError && !detailQuery.isLoading)) {
    return <TaxonomyNotFound />;
  }

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

      {/* Chế độ xem di động (< 768px) */}
      {activeNode && (
        <MobileTaxonomyView
          currentNode={activeNode}
          breadcrumbs={breadcrumbs}
          childrenNodes={childrenQuery.data || []}
          speciesList={terminalSpecies}
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
    </div>
  );
};

export default TaxonomyPage;
