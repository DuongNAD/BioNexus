import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Compass, ShoppingBag, ArrowRight, MapPin } from 'lucide-react';
import { SceneShell } from '@/components/3d/SceneShell';
import { ParticleMorph } from '@/components/3d/ParticleMorph';
import { HelixScene, HELIX_LEVELS } from '@/components/3d/HelixScene';
import { TAXONOMIC_RANKS, rankIndexForRung } from '@/components/3d/taxonomyRanks';
import { BioEarth } from '@/components/3d/BioEarth/BioEarth';
import {
  DEFAULT_SPECIES_BIOMARKERS,
  VIETNAM_BREEDING_HUBS,
  IUCN_MARKER_COLORS,
  toBioMarker,
} from '@/components/3d/BioEarth/coordinates';
import { useQuality } from '@/components/3d/QualityProvider';
import { IucnBadge } from '@/components/ui/IucnBadge';
import { ProductCard } from '@/components/domain/ProductCard';
import { Skeleton } from '@/components/ui/Skeleton';
import { StatRow } from '@/components/ui/StatRow';
import { ButtonLink } from '@/components/domain/ButtonLink';
import { Eyebrow, Panel } from '@/components/layout/Page';
import { useProducts } from '@/api/queries/useProductQueries';
import { useSpeciesList } from '@/api/queries/useSpeciesQueries';
import { cn } from '@/lib/cn';

// Loài mở màn trên địa cầu: chọn theo tên khoa học vì id trong DB thật có thể khác seed
const DEFAULT_SELECTED_SPECIES = 'Ambystoma mexicanum';

/** Cuộn tới chương; người dùng bật giảm chuyển động thì nhảy thẳng, không cuộn mượt */
function scrollToChapter(idx: number): void {
  const reduceMotion =
    typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.getElementById(`chapter-${idx}`)?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
}

/** Phím tắt trang không được cướp phím khi người dùng đang gõ hoặc dùng tổ hợp phím của trình duyệt */
function shouldIgnoreShortcut(e: KeyboardEvent): boolean {
  if (e.defaultPrevented || e.ctrlKey || e.metaKey || e.altKey || e.shiftKey) return true;
  const target = e.target as HTMLElement | null;
  if (!target) return false;
  const tag = target.tagName;
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || target.isContentEditable;
}

export default function Home(): React.JSX.Element {
  const { config } = useQuality();
  const [activeChapter, setActiveChapter] = useState<number>(0);
  const [selectedScientificName, setSelectedScientificName] = useState<string>(DEFAULT_SELECTED_SPECIES);
  const [activeTaxonIdx, setActiveTaxonIdx] = useState<number>(0);
  const activeRank = TAXONOMIC_RANKS[rankIndexForRung(activeTaxonIdx, HELIX_LEVELS)];

  // Tham chiếu tiến độ cuộn cho 3D scenes
  const genesisProgressRef = useRef<number>(0);
  const helixProgressRef = useRef<number>(0);

  // Tải danh mục sản phẩm kiểm duyệt từ TanStack Query
  const { data: productsData, isLoading: isProductsLoading } = useProducts({ size: 8 });
  const { data: speciesData } = useSpeciesList();

  // Marker địa cầu dựng từ danh sách loài của API; trong lúc chờ thì dùng bộ dựng sẵn
  const earthMarkers = useMemo(() => {
    if (!speciesData || speciesData.length === 0) return DEFAULT_SPECIES_BIOMARKERS;
    const speciesOnSale = new Set(
      (productsData?.items || []).filter((p) => p.status === 'APPROVED').map((p) => p.speciesId)
    );
    return speciesData.map((sp) => toBioMarker(sp, speciesOnSale.has(sp.id)));
  }, [speciesData, productsData?.items]);
  const selectedMarker =
    earthMarkers.find((m) => m.scientificName === selectedScientificName) ?? earthMarkers[0];
  const selectedHub = selectedMarker
    ? VIETNAM_BREEDING_HUBS.find((h) => h.id === selectedMarker.hubId)
    : undefined;

  // Theo dõi tiến độ cuộn cho Genesis và Helix
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const windowH = window.innerHeight;

      // Chương 0: Genesis
      const g0 = Math.min(3, Math.max(0, scrollY / windowH));
      genesisProgressRef.current = g0;

      // Chương 1: Helix
      const chapter1El = document.getElementById('chapter-1');
      if (chapter1El) {
        const rect = chapter1El.getBoundingClientRect();
        const total = rect.height - windowH;
        if (total > 0) {
          const p = Math.min(1, Math.max(0, -rect.top / total));
          helixProgressRef.current = p;
        }
      }

      // Nhận diện chương hiện tại qua vị trí cuộn
      const chapters = [0, 1, 2, 3];
      for (const idx of chapters) {
        const el = document.getElementById(`chapter-${idx}`);
        if (el) {
          const r = el.getBoundingClientRect();
          if (r.top <= windowH * 0.4 && r.bottom >= windowH * 0.4) {
            setActiveChapter(idx);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // PageUp/PageDown chuyển chương. Bỏ phím số một ký tự (WCAG 2.1.4) và để mũi tên cuộn như mặc định
  const activeChapterRef = useRef(0);
  activeChapterRef.current = activeChapter;
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (shouldIgnoreShortcut(e)) return;
      let next: number | null = null;
      if (e.key === 'PageDown') next = Math.min(3, activeChapterRef.current + 1);
      else if (e.key === 'PageUp') next = Math.max(0, activeChapterRef.current - 1);
      if (next === null) return;
      e.preventDefault();
      setActiveChapter(next);
      scrollToChapter(next);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="relative overflow-x-clip bg-[#020605] text-fg selection:bg-accent selection:text-accent-fg">
      {/* 1. Thanh Chấm Chỉ Báo Chương (Chapter Indicator Dots) */}
      <nav
        aria-label="Chỉ báo chương"
        className="fixed top-1/2 right-6 z-40 hidden -translate-y-1/2 flex-col gap-2.5 md:flex"
      >
        {[
          { idx: 0, label: 'Khởi nguyên' },
          { idx: 1, label: 'Bách khoa' },
          { idx: 2, label: 'Hành tinh' },
          { idx: 3, label: 'Cửa hàng' },
        ].map(({ idx, label }) => (
          <button
            key={idx}
            type="button"
            onClick={() => {
              setActiveChapter(idx);
              scrollToChapter(idx);
            }}
            className={cn(
              'group relative flex items-center justify-end transition-all duration-300'
            )}
            aria-label={`Chuyển đến Chương ${idx}: ${label}`}
            aria-current={activeChapter === idx ? 'step' : undefined}
          >
            <span className="pointer-events-none absolute right-6 rounded-md bg-black/80 px-2 py-1 text-xs whitespace-nowrap text-white opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
              {label}
            </span>
            <span
              className={cn(
                'w-2 rounded-full transition-all duration-400',
                activeChapter === idx
                  ? 'h-8 bg-accent shadow-[0_0_12px_rgba(0,210,158,0.7)]'
                  : 'h-2 bg-white/20 hover:bg-white/40'
              )}
            />
          </button>
        ))}
      </nav>

      {/* 2. CHƯƠNG 0: KHỞI NGUYÊN BIONEXUS (Hero Genesis) */}
      <section id="chapter-0" className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Nền 3D Hạt Biến Hình ParticleMorph */}
        <div className="absolute inset-0 z-0">
          <SceneShell
            id="home-genesis"
            posterSrc="posters/home-genesis.webp"
            posterAlt="Khởi nguyên BioNexus - Vũ điệu hạt sáng sinh học"
            className="h-full w-full"
            srDescription="Vũ điệu hạt sáng chuyển đổi giữa thiên hà, ADN và phiến lá quang hợp sinh học."
          >
            {(_tier, handleFirstFrame) => (
              <Canvas
                dpr={config.dpr}
                gl={{ antialias: config.antialias }}
                camera={{ position: [0, 0, 7], fov: 45 }}
                onCreated={() => handleFirstFrame?.()}
              >
                <ParticleMorph progress={genesisProgressRef} />
              </Canvas>
            )}
          </SceneShell>
        </div>

        {/* Lớp phủ mờ bảo đảm độ tương phản chữ WCAG 2.2 AA */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#020605]/40 via-transparent to-[#020605] pointer-events-none z-10" />

        {/* Nội dung tiêu đề chính */}
        <div className="relative z-20 max-w-4xl text-center px-6 pt-24 pb-16">
          <Eyebrow className="mb-6">Bách khoa sinh học · Sàn sinh vật cảnh</Eyebrow>

          <h1 className="text-[44px] leading-[0.95] font-semibold tracking-[-0.05em] text-fg sm:text-[64px] lg:text-[84px]">
            Mọi loài đều có{' '}
            <span className="bg-gradient-to-r from-aurora via-accent-2 to-accent bg-clip-text font-serif font-medium text-transparent italic">
              quỹ đạo riêng.
            </span>
          </h1>

          {/* Trên màn hẹp dải hạt chạy ngang qua đoạn này: thêm nền mờ để chữ vẫn đọc được */}
          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-fg-2 max-md:rounded-[20px] max-md:bg-bg/75 max-md:px-4 max-md:py-3 max-md:backdrop-blur-sm sm:text-lg">
            Cuộn xuống để đi từ một thiên hà hạt sáng đến từng loài: chúng sống ở đâu, thuộc nhánh nào, và cửa hàng nào đang nhân giống có giấy phép.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <ButtonLink to="/taxonomy" size="lg" pill>
              <Compass className="size-4" aria-hidden="true" />
              <span>Khám phá cây phân loại</span>
            </ButtonLink>
            <ButtonLink to="/products" size="lg" variant="secondary" pill className="backdrop-blur-md">
              <ShoppingBag className="size-4" aria-hidden="true" />
              <span>Vào cửa hàng</span>
            </ButtonLink>
          </div>

          <p className="mt-12 text-sm text-fg-3">Cuộn để đổi chương · Rê chuột để đẩy hạt · Bấm để tạo sóng</p>
        </div>
      </section>

      {/* 3. CHƯƠNG 1: BÁCH KHOA SỰ SỐNG (Taxonomy Helix Sticky Story) */}
      <section id="chapter-1" className="relative min-h-[160vh] border-t border-line py-24 px-4 sm:px-6 lg:px-10">
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 lg:grid-cols-12">
          {/* Cột thông tin bên trái */}
          <div className="lg:col-span-5 z-20">
            <Eyebrow>Chương 01 · Phả hệ sự sống</Eyebrow>

            <h2 className="mt-4 text-[30px] leading-[1.05] font-semibold tracking-[-0.04em] text-fg md:text-[44px]">
              Sáu cấp, từ Giới tới <em className="font-serif font-medium text-accent">từng Chi</em>
            </h2>

            <p className="mt-5 text-base leading-relaxed text-fg-2 md:text-lg">
              Giới, Ngành, Lớp, Bộ, Họ, Chi: mỗi loài trong bách khoa nằm ở cuối một nhánh như vậy. Sản phẩm đăng bán phải gắn đúng một loài trong cây.
            </p>

            {/* Cấp đang sáng trên chuỗi xoắn, đọc được bằng trình đọc màn hình */}
            <Panel className="mt-8" aria-live="polite">
              <div className="flex items-baseline justify-between gap-3">
                <Eyebrow tone="muted">{activeRank?.rankVi}</Eyebrow>
                <span className="font-mono text-sm text-fg-3">
                  {(activeRank?.level ?? 0) + 1} / {TAXONOMIC_RANKS.length}
                </span>
              </div>
              <h3 className="mt-3 text-xl font-semibold tracking-[-0.02em] text-fg">{activeRank?.name}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-fg-2">{activeRank?.desc}</p>
            </Panel>

            <StatRow
              className="mt-6"
              items={[
                { label: 'Cấp phân loại', value: TAXONOMIC_RANKS.length },
                { label: 'Loài trong bách khoa', value: speciesData?.length ?? '—' },
              ]}
            />

            <div className="mt-8">
              <ButtonLink to="/taxonomy" variant="secondary" pill>
                <span>Xem cây phân loại</span>
                <ArrowRight className="size-4" aria-hidden="true" />
              </ButtonLink>
            </div>
          </div>

          {/* Cột hiển thị Chuỗi Xoắn 3D bên phải */}
          <div className="relative h-[480px] overflow-hidden rounded-[20px] border border-line bg-bg-deep md:h-[580px] lg:col-span-7">
            <SceneShell
              id="home-helix"
              posterSrc="posters/home-helix.webp"
              posterAlt="Chuỗi xoắn ADN và các nấc thang phân loại học sinh giới"
              className="h-full w-full"
              srDescription="Chuỗi xoắn kép ADN phát quang ngọc bích mô phỏng 6 cấp phân loại: Giới, Ngành, Lớp, Bộ, Họ, Chi."
            >
              {(_tier, handleFirstFrame) => (
                <Canvas
                  dpr={config.dpr}
                  gl={{ antialias: config.antialias }}
                  camera={{ position: [0, 0, 7.5], fov: 42 }}
                  onCreated={() => handleFirstFrame?.()}
                >
                  <ambientLight intensity={0.5} />
                  <pointLight position={[5, 5, 5]} intensity={1.5} color="#5eead4" />
                  <HelixScene
                    progress={helixProgressRef}
                    onActiveTaxon={(idx) => setActiveTaxonIdx(idx)}
                  />
                </Canvas>
              )}
            </SceneShell>
          </div>
        </div>
      </section>

      {/* 4. CHƯƠNG 2: HÀNH TINH BIONEXUS (BioEarth Full Interactive) */}
      <section id="chapter-2" className="relative min-h-screen border-t border-line py-24 px-4 sm:px-6 lg:px-10">
        <div className="mx-auto mb-8 max-w-3xl text-center">
          <Eyebrow>Chương 02 · Hành tinh BioNexus</Eyebrow>
          <h2 className="mt-4 text-[30px] leading-[1.05] font-semibold tracking-[-0.04em] text-fg md:text-[44px]">
            Nhân giống tại Việt Nam, <em className="font-serif font-medium text-accent">gốc gác khắp thế giới</em>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-fg-2">
            Khám phá {earthMarkers.length} loài sinh vật biểu tượng và các cung đường nối nơi bản địa với 3 trung tâm nhân giống tại Việt Nam.
          </p>
        </div>

        {/* Thanh chọn nhanh 9 loài biểu tượng */}
        <div
          role="group"
          aria-label="Chọn loài trên địa cầu"
          className="mx-auto mb-6 flex max-w-6xl items-center gap-2 overflow-x-auto pt-1 pb-3 scrollbar-none md:flex-wrap md:justify-center md:overflow-visible"
        >
          {earthMarkers.map((sp) => {
            const isSelected = selectedMarker?.scientificName === sp.scientificName;
            const dotColor = IUCN_MARKER_COLORS[sp.conservationStatus] || '#00D29E';

            return (
              <button
                key={sp.scientificName}
                type="button"
                aria-pressed={isSelected}
                onClick={() => setSelectedScientificName(sp.scientificName)}
                className={cn(
                  'flex h-9 shrink-0 items-center gap-2 rounded-full border px-4 text-sm whitespace-nowrap transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent',
                  isSelected
                    ? 'border-accent bg-accent/15 text-fg'
                    : 'border-line text-fg-2 hover:border-line-strong hover:text-fg'
                )}
              >
                <span
                  className="size-2 rounded-full shrink-0"
                  style={{ backgroundColor: dotColor }}
                  aria-hidden="true"
                />
                <span>{sp.displayName}</span>
              </button>
            );
          })}
        </div>

        {/* Vùng hiển thị Quả Địa Cầu BioEarth 7 Lớp */}
        <div className="relative mx-auto h-[440px] max-w-6xl overflow-hidden rounded-[20px] border border-line bg-bg-deep md:h-[620px]">
          <SceneShell
            id="home-earth"
            posterSrc="posters/home-earth.webp"
            posterAlt="Quả địa cầu BioEarth nối nơi bản địa của các loài với trại nhân giống tại Việt Nam"
            className="h-full w-full"
            srDescription="Quả địa cầu 3D hiển thị nơi bản địa của các loài sinh vật cảnh và cung bay về Việt Nam. Thông tin loài đang chọn có ở thẻ bên dưới địa cầu."
          >
            {(_tier, handleFirstFrame) => (
              <Canvas
                dpr={config.dpr}
                gl={{ antialias: config.antialias }}
                camera={{ position: [0, 0.5, 6.2], fov: 42 }}
                onCreated={() => handleFirstFrame?.()}
              >
                <ambientLight intensity={0.4} />
                <directionalLight position={[5, 3, 5]} intensity={1.2} />
                <BioEarth
                  speciesList={earthMarkers}
                  breedingHubs={VIETNAM_BREEDING_HUBS}
                  selectedScientificName={selectedMarker?.scientificName}
                  onSelectSpecies={setSelectedScientificName}
                />
                <OrbitControls
                  enableZoom={false}
                  minPolarAngle={Math.PI / 4}
                  maxPolarAngle={(3 * Math.PI) / 4}
                />
              </Canvas>
            )}
          </SceneShell>
        </div>

        {/* Thẻ loài đang chọn bằng DOM thật: tooltip trong canvas bị ẩn với trình đọc màn hình và ở chế độ ảnh tĩnh */}
        {selectedMarker && (
          <div
            aria-live="polite"
            className="mx-auto mt-4 flex max-w-6xl flex-col gap-4 rounded-[20px] border border-line bg-surface p-4 sm:flex-row sm:items-center md:p-5"
          >
            <img
              src={selectedMarker.heroPhoto}
              alt={selectedMarker.displayName}
              className="size-16 shrink-0 rounded-xl object-cover"
              loading="lazy"
            />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-base font-semibold text-fg">{selectedMarker.displayName}</p>
                <IucnBadge code={selectedMarker.conservationStatus} size="sm" />
              </div>
              <p className="font-serif text-base text-accent-2 italic">{selectedMarker.scientificName}</p>
              <p className="mt-1 flex items-center gap-1.5 text-sm text-fg-2">
                <MapPin className="size-3.5 text-accent shrink-0" aria-hidden="true" />
                <span>
                  Bản địa: {selectedMarker.origin.place}
                  {selectedHub ? ` · Nhân giống: ${selectedHub.shopName} (${selectedHub.city})` : ''}
                </span>
              </p>
            </div>
            {selectedMarker.speciesId != null && (
              <ButtonLink to={`/species/${selectedMarker.speciesId}`} variant="secondary" pill className="shrink-0">
                <span>Xem hồ sơ loài</span>
                <ArrowRight className="size-4" aria-hidden="true" />
              </ButtonLink>
            )}
          </div>
        )}

        {/* Chân trang Chương 2: Danh sách 3 Hub tiếp nhận */}
        {/* Ba trung tâm nhân giống: một dải chia cột bằng đường kẻ, không thêm ba khung riêng */}
        <ul className="mx-auto mt-8 grid max-w-6xl divide-y divide-line border-y border-line md:grid-cols-3 md:divide-x md:divide-y-0">
          {VIETNAM_BREEDING_HUBS.map((hub) => (
            <li key={hub.id} className="py-5 md:px-6 md:first:pl-0">
              <p className="flex items-center gap-1.5 text-sm font-medium text-accent">
                <MapPin className="size-4" aria-hidden="true" />
                <span>{hub.city}</span>
              </p>
              <p className="mt-1.5 font-medium text-fg">{hub.shopName}</p>
              <p className="mt-1 text-sm text-fg-3">{hub.specialty}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* 5. CHƯƠNG 3: SÀN SINH VẬT CẢNH & ĐẠO ĐỨC BẢO TỒN (Marketplace) */}
      <section id="chapter-3" className="relative min-h-screen border-t border-line py-24 px-4 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <Eyebrow>Chương 03 · Sàn đã kiểm duyệt</Eyebrow>
              <h2 className="mt-4 text-[30px] leading-[1.05] font-semibold tracking-[-0.04em] text-fg md:text-[44px]">
                Cá thể khỏe mạnh, <em className="font-serif font-medium text-accent">pháp lý rõ ràng</em>
              </h2>
              <p className="mt-4 text-base leading-relaxed text-fg-2">
                Chỉ cá thể nhân giống có giấy tờ nguồn gốc. Mỗi sản phẩm gắn đúng một loài trong bách khoa và qua kiểm duyệt trước khi lên sàn.
              </p>
            </div>
            <ButtonLink to="/products" variant="ghost" pill className="self-start md:self-auto">
              <span>Xem tất cả sản phẩm</span>
              <ArrowRight className="size-4" aria-hidden="true" />
            </ButtonLink>
          </div>

          {/* Lưới sản phẩm đã kiểm duyệt */}
          {isProductsLoading ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4" role="status" aria-label="Đang tải sản phẩm">
              {Array.from({ length: 4 }, (_, i) => (
                <Skeleton key={i} className="h-80 w-full rounded-[20px]" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {productsData?.items?.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          {/* Dải mời tham gia Hành trình 9 loài ngay trước phần kết */}
          <div
            id="home-journey-invite"
            className="relative mt-16 overflow-hidden rounded-[20px] border border-line bg-bg-raised"
          >
            <img
              src={`${import.meta.env.BASE_URL}trip/trail-1600.webp`}
              alt="Lối mòn xuyên rừng nhiệt đới mở đầu Hành trình 9 loài"
              loading="lazy"
              className="absolute inset-0 size-full object-cover opacity-35"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#030b08]/95 via-[#030b08]/80 to-transparent" />
            <div className="relative z-10 p-8 md:p-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
              <div className="max-w-xl">
                <Eyebrow>4 chặng · 9 trạm</Eyebrow>
                <h3 className="mt-4 text-[28px] leading-[1.05] font-semibold tracking-[-0.03em] text-fg md:text-4xl">
                  Hành trình <em className="font-serif font-medium text-accent">9 loài</em> ngoài tự nhiên
                </h3>
                <p className="mt-4 text-base leading-relaxed text-fg-2">
                  Mười ngày đi qua 4 vùng sinh cảnh từ rừng mưa Cát Tiên, đỉnh mây Kinabalu, đầm lầy Bắc Carolina, kênh cổ Xochimilco tới sa mạc Trung Úc và Địa Trung Hải. Đóng đủ 9 con dấu vào sổ hộ chiếu loài để nhận chứng nhận Nhà thám hiểm BioNexus.
                </p>
              </div>
              <ButtonLink to="/tham-hiem" size="lg" pill className="shrink-0">
                <Compass className="size-4" aria-hidden="true" />
                <span>Bắt đầu hành trình</span>
              </ButtonLink>
            </div>
          </div>

          {/* Cam kết bảo tồn và CTA mở shop */}
          {/* Lời mời người bán: nút phụ, vì nút chính của khung nhìn này là Hành trình */}
          <div className="mt-6 flex flex-col items-start justify-between gap-6 border-t border-line pt-8 md:flex-row md:items-center">
            <div className="max-w-xl">
              <Eyebrow tone="muted">Dành cho người bán</Eyebrow>
              <h3 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-fg md:text-[28px]">
                Bạn có trại nhân giống được cấp phép?
              </h3>
              <p className="mt-2 text-base leading-relaxed text-fg-2">
                Mở shop trên BioNexus: hồ sơ được Ban Quản trị kiểm tra, sản phẩm được duyệt trước khi lên sàn. Không nhận động vật khai thác từ tự nhiên.
              </p>
            </div>
            <ButtonLink to="/seller/apply" variant="secondary" size="lg" pill className="shrink-0">
              Nộp hồ sơ mở shop
            </ButtonLink>
          </div>
        </div>
      </section>
    </div>
  );
}
