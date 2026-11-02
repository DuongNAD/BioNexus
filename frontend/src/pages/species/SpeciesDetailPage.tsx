import React, { useMemo } from 'react';
import { useParams, Link } from 'react-router';
import { useSpeciesDetail, useSpeciesList } from '@/api/queries/useSpeciesQueries';
import { useTaxonomyDetail } from '@/api/queries/useTaxonomyQueries';
import { useProducts } from '@/api/queries/useProductQueries';
import { SpeciesHeroCover } from './components/SpeciesHeroCover';
import { SpeciesBentoGrid } from './components/SpeciesBentoGrid';
import { SpeciesTaxonomyBeam } from './components/SpeciesTaxonomyBeam';
import { SpeciesNotFound } from './components/SpeciesNotFound';
import { MasonryGallery } from '@/components/domain/MasonryGallery';
import { SpeciesCard } from '@/components/domain/SpeciesCard';
import { ProductCard } from '@/components/domain/ProductCard';
import { normalizeBreadcrumbs } from '@/components/domain/TaxonPath';
import { SEED_TAXONOMY } from '@/mocks/data/taxonomy';
import { Quote, ShoppingBag, Sparkles, ShieldCheck } from 'lucide-react';

export const SpeciesDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const speciesId = id ? parseInt(id, 10) : NaN;
  const isInvalid = isNaN(speciesId) || speciesId <= 0;

  // 1. Nạp chi tiết loài
  const speciesQuery = useSpeciesDetail(speciesId, {
    enabled: !isInvalid,
  });

  const species = speciesQuery.data;

  // 2. Nạp phả hệ breadcrumbs từ nút cha (nodeId)
  const taxonomyQuery = useTaxonomyDetail(species?.nodeId || 0, {
    enabled: Boolean(species?.nodeId),
  });

  // 3. Nạp danh sách sản phẩm để tìm các cá thể đang bán của loài này
  const productsQuery = useProducts({
    speciesId: !isInvalid ? speciesId : undefined,
  });

  // 4. Nạp toàn bộ danh mục loài để tìm loài cùng chi hoặc cùng họ
  const allSpeciesQuery = useSpeciesList();
  const allSpecies = allSpeciesQuery.data || [];

  // Danh sách cá thể APPROVED đang mở bán
  const approvedProducts = useMemo(() => {
    return (productsQuery.data?.items || []).filter((p) => p.status === 'APPROVED');
  }, [productsQuery.data?.items]);

  // Tìm các loài cùng chi (hoặc cùng họ)
  const siblingSpecies = useMemo(() => {
    if (!species) return [];

    // Tìm cùng chi trước
    const sameGenus = allSpecies.filter((s) => s.id !== species.id && s.nodeId === species.nodeId);
    if (sameGenus.length > 0) return sameGenus;

    // Nếu chi chỉ có 1 loài, tìm cùng họ (parent family)
    const currentGenusNode = SEED_TAXONOMY.find((n) => n.id === species.nodeId);
    if (currentGenusNode && currentGenusNode.parentId) {
      const familyNodeId = currentGenusNode.parentId;
      const siblingGenera = SEED_TAXONOMY.filter((n) => n.parentId === familyNodeId).map((n) => n.id);
      return allSpecies.filter((s) => s.id !== species.id && siblingGenera.includes(s.nodeId));
    }

    return allSpecies.filter((s) => s.id !== species.id && s.group === species.group).slice(0, 3);
  }, [species, allSpecies]);

  // Chuỗi phả hệ breadcrumbs
  const breadcrumbs = useMemo(() => {
    const rawCrumb = taxonomyQuery.data?.breadcrumbs || [];
    const parentNode = taxonomyQuery.data?.node;
    return normalizeBreadcrumbs(rawCrumb, parentNode);
  }, [taxonomyQuery.data]);

  // Trạng thái 404 khi mã loài không tồn tại
  if (isInvalid || (speciesQuery.isError && !speciesQuery.isLoading) || (!speciesQuery.isLoading && !species)) {
    return <SpeciesNotFound />;
  }

  if (speciesQuery.isLoading || !species) {
    return (
      <div className="flex min-h-[75vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="size-10 animate-spin rounded-full border-2 border-accent border-t-transparent shadow-[0_0_15px_rgba(110,231,183,0.3)]" />
          <p className="font-mono text-xs text-fg-3 uppercase tracking-widest">
            Đang xuất bản Hồ sơ tạp chí khoa học...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 space-y-12">
      {/* 1. HERO BÌA TẠP CHÍ TOÀN MÀN HÌNH */}
      <SpeciesHeroCover species={species} breadcrumbs={breadcrumbs} />

      {/* 2. BENTO GRID KHOA HỌC (12 CỘT) */}
      <SpeciesBentoGrid species={species} />

      {/* 3. MÔ TẢ SINH HỌC & TRÍCH DẪN LỚN (PULL QUOTE) */}
      <section className="rounded-3xl border border-line bg-surface-1/70 p-6 sm:p-10 backdrop-blur-xl shadow-xl space-y-6">
        <div className="flex items-center gap-2">
          <Sparkles className="size-4 text-accent" />
          <span className="text-[11px] font-mono uppercase tracking-widest text-accent font-semibold">
            Chuyên khảo đặc tính sinh học
          </span>
        </div>

        {/* Trích dẫn lớn Cormorant Garamond */}
        {species.pullQuote && (
          <div className="relative border-l-4 border-accent pl-6 sm:pl-8 py-2">
            <Quote className="absolute -top-3 -left-3 size-6 text-accent/30 pointer-events-none" />
            <blockquote className="font-serif italic text-xl sm:text-2xl text-fg leading-relaxed">
              &quot;{species.pullQuote}&quot;
            </blockquote>
          </div>
        )}

        {/* Đoạn văn Body L */}
        <div className="text-sm sm:text-base text-fg-2 leading-relaxed space-y-4 max-w-4xl font-sans">
          <p>{species.description}</p>

          {/* Bổ sung đặc điểm tập tính & vòng đời nếu có */}
          {(species.diet || species.lifespan || species.activityTime) && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-line/40 text-xs">
              {species.diet && (
                <div className="rounded-xl bg-surface-2/60 p-3 border border-line/30">
                  <span className="font-mono text-[10px] text-fg-3 uppercase block">Chế độ dinh dưỡng</span>
                  <strong className="text-fg mt-1 block">{species.diet}</strong>
                </div>
              )}
              {species.lifespan && (
                <div className="rounded-xl bg-surface-2/60 p-3 border border-line/30">
                  <span className="font-mono text-[10px] text-fg-3 uppercase block">Tuổi thọ trung bình</span>
                  <strong className="text-fg mt-1 block">{species.lifespan}</strong>
                </div>
              )}
              {species.activityTime && (
                <div className="rounded-xl bg-surface-2/60 p-3 border border-line/30">
                  <span className="font-mono text-[10px] text-fg-3 uppercase block">Tập tính hoạt động</span>
                  <strong className="text-fg mt-1 block">{species.activityTime}</strong>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* 4. BỘ ẢNH MASONRY & LIGHTBOX XEM ẢNH NGHỆ THUẬT */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[11px] font-mono uppercase tracking-widest text-accent font-semibold">
              Kho tư liệu hình ảnh
            </span>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-fg font-sans">
              Bộ sưu tập ảnh bản quyền tự do
            </h2>
          </div>
          <p className="text-xs text-fg-3 hidden sm:block">
            Nhấp chuột vào ảnh để mở trình xem lớn (Lightbox)
          </p>
        </div>

        <MasonryGallery photoIds={species.galleryPhotoIds} />
      </section>

      {/* 5. ĐƯỜNG PHÂN LOẠI DỌC NỐI TIA SÁNG */}
      <section className="space-y-3">
        <SpeciesTaxonomyBeam breadcrumbs={breadcrumbs} />
      </section>

      {/* 6. CÁ THỂ THƯƠNG MẠI ĐANG BÁN TRÊN SÀN */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[11px] font-mono uppercase tracking-widest text-accent font-semibold flex items-center gap-1.5">
              <ShieldCheck className="size-3.5 text-accent" />
              Sàn giao dịch sinh vật cảnh
            </span>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-fg font-sans">
              Cá thể nhân giống F2+ đang bán ({approvedProducts.length})
            </h2>
          </div>

          <Link to="/products" className="text-xs text-accent hover:underline font-semibold">
            Xem toàn bộ cửa hàng →
          </Link>
        </div>

        {approvedProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-line bg-surface p-8 text-center text-xs text-fg-3 max-w-lg mx-auto">
            <ShoppingBag className="size-8 text-fg-mute mb-2 opacity-50" />
            <p className="font-semibold text-fg-2">Chưa có cửa hàng nào bán cá thể loài này</p>
            <p className="mt-1 leading-relaxed">
              Các giao dịch cá thể cảnh tại BioNexus bắt buộc phải có giấy phép nhân tạo F2+ và được kiểm duyệt pháp lý.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {approvedProducts.map((prod) => (
              <ProductCard key={prod.id} product={prod} />
            ))}
          </div>
        )}
      </section>

      {/* 7. LOÀI CÙNG CHI HOẶC CÙNG HỌ */}
      {siblingSpecies.length > 0 && (
        <section className="space-y-4 pt-4 border-t border-line/40">
          <div>
            <span className="text-[11px] font-mono uppercase tracking-widest text-accent font-semibold">
              Phả hệ tương đồng
            </span>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-fg font-sans">
              Các loài có quan hệ họ hàng gần
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {siblingSpecies.map((sib) => (
              <SpeciesCard key={sib.id} species={sib} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default SpeciesDetailPage;
