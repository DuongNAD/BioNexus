import React, { useState, useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Compass, ShoppingBag, ArrowRight, ShieldCheck, MapPin, Sparkles as SparklesIcon } from 'lucide-react';
import { SceneShell } from '@/components/3d/SceneShell';
import { ParticleMorph } from '@/components/3d/ParticleMorph';
import { HelixScene, TAXONOMIC_RANKS } from '@/components/3d/HelixScene';
import { BioEarth } from '@/components/3d/BioEarth/BioEarth';
import {
  DEFAULT_SPECIES_BIOMARKERS,
  VIETNAM_BREEDING_HUBS,
  IUCN_MARKER_COLORS,
} from '@/components/3d/BioEarth/coordinates';
import { ProductCard } from '@/components/domain/ProductCard';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { useProducts } from '@/api/queries/useProductQueries';
import { cn } from '@/lib/cn';

export default function Home(): React.JSX.Element {
  const [activeChapter, setActiveChapter] = useState<number>(0);
  const [selectedSpeciesId, setSelectedSpeciesId] = useState<number>(1); // Mặc định Axolotl
  const [activeTaxonIdx, setActiveTaxonIdx] = useState<number>(0);

  // Tham chiếu tiến độ cuộn cho 3D scenes
  const genesisProgressRef = useRef<number>(0);
  const helixProgressRef = useRef<number>(0);

  // Tải danh mục sản phẩm kiểm duyệt từ TanStack Query
  const { data: productsData, isLoading: isProductsLoading } = useProducts({ size: 8 });

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

  // Điều khiển phím tắt chuyển chương (0, 1, 2, 3 và Mũi tên)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['0', '1', '2', '3'].includes(e.key)) {
        const chapterIdx = Number(e.key);
        setActiveChapter(chapterIdx);
        document.getElementById(`chapter-${chapterIdx}`)?.scrollIntoView({ behavior: 'smooth' });
      } else if (e.key === 'ArrowDown' || e.key === 'PageDown') {
        setActiveChapter((prev) => {
          const next = Math.min(3, prev + 1);
          document.getElementById(`chapter-${next}`)?.scrollIntoView({ behavior: 'smooth' });
          return next;
        });
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        setActiveChapter((prev) => {
          const next = Math.max(0, prev - 1);
          document.getElementById(`chapter-${next}`)?.scrollIntoView({ behavior: 'smooth' });
          return next;
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="relative bg-[#020605] text-fg selection:bg-accent selection:text-accent-fg">
      {/* 1. Thanh Chấm Chỉ Báo Chương (Chapter Indicator Dots) */}
      <nav
        aria-label="Chỉ báo chương"
        className="fixed top-1/2 right-6 z-40 -translate-y-1/2 flex flex-col gap-2.5"
      >
        {[
          { idx: 0, label: 'Khởi nguyên' },
          { idx: 1, label: 'Bách khoa' },
          { idx: 2, label: 'Hành tinh' },
          { idx: 3, label: 'Cửa hàng' },
        ].map(({ idx, label }) => (
          <button
            key={idx}
            onClick={() => {
              setActiveChapter(idx);
              document.getElementById(`chapter-${idx}`)?.scrollIntoView({ behavior: 'smooth' });
            }}
            className={cn(
              'group relative flex items-center justify-end transition-all duration-300'
            )}
            aria-label={`Chuyển đến Chương ${idx}: ${label}`}
          >
            <span className="absolute right-6 opacity-0 group-hover:opacity-100 transition-opacity bg-black/80 text-white font-mono text-[10px] uppercase px-2 py-0.5 rounded border border-white/10 pointer-events-none whitespace-nowrap">
              0{idx} · {label}
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
          <div className="inline-flex items-center gap-2 rounded-full border border-accent/40 bg-black/60 px-4 py-1 text-xs font-mono uppercase tracking-widest text-accent backdrop-blur-md mb-6 shadow-lg shadow-accent/10">
            <SparklesIcon className="size-3.5 text-accent animate-pulse" />
            Bách khoa sinh học · Sàn sinh vật cảnh
          </div>

          <h1 className="text-5xl sm:text-7xl lg:text-8xl font-bold tracking-tight text-fg font-sans leading-[1.08]">
            Mọi loài đều có{' '}
            <span className="italic font-serif font-semibold bg-gradient-to-r from-[#c4b5fd] via-[#5eead4] to-[#6ee7b7] bg-clip-text text-transparent">
              quỹ đạo riêng.
            </span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-fg-2 max-w-2xl mx-auto leading-relaxed font-sans">
            Cuộn xuống để đi từ một thiên hà hạt sáng đến từng loài: chúng sống ở đâu, thuộc nhánh nào, và cửa hàng nào đang nhân giống có giấy phép.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Button
              size="lg"
              pill
              className="gap-2 px-8 shadow-xl shadow-accent/25 hover:shadow-accent/40 text-base"
              onClick={() => {
                window.location.hash = '#/taxonomy';
              }}
            >
              <Compass className="size-4" /> Khám phá cây phân loại
            </Button>
            <Button
              size="lg"
              pill
              variant="outline"
              className="gap-2 px-8 border-white/20 hover:bg-white/10 text-base backdrop-blur-md"
              onClick={() => {
                window.location.hash = '#/products';
              }}
            >
              <ShoppingBag className="size-4" /> Vào cửa hàng
            </Button>
          </div>

          <p className="mt-12 text-xs font-mono text-fg-3 uppercase tracking-wider">
            Cuộn để đổi chương · Rê chuột để đẩy hạt · Bấm chuột để tạo sóng
          </p>
        </div>
      </section>

      {/* 3. CHƯƠNG 1: BÁCH KHOA SỰ SỐNG (Taxonomy Helix Sticky Story) */}
      <section id="chapter-1" className="relative min-h-[160vh] py-24 px-6 border-t border-line/40">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Cột thông tin bên trái */}
          <div className="lg:col-span-5 z-20">
            <Badge variant="accent" className="font-mono text-xs uppercase tracking-wider">
              01 · Phả hệ Sự sống
            </Badge>

            <h2 className="mt-4 text-4xl sm:text-5xl lg:text-6xl font-bold font-serif text-fg leading-tight">
              25 bậc phân loại, <span className="text-accent italic">6 cấp chuẩn mực</span>
            </h2>

            <p className="mt-6 text-fg-2 text-base sm:text-lg leading-relaxed">
              Từ Giới Động vật và Thực vật gốc, hệ thống dẫn lối qua Ngành, Lớp, Bộ, Họ tới từng Chi sinh vật. Mọi sản phẩm đăng bán đều phải đối soát chính xác với danh mục bách khoa.
            </p>

            {/* Thẻ nấc phân loại đang kích hoạt */}
            <div className="mt-8 rounded-2xl border border-line bg-surface-1/80 p-5 backdrop-blur-md">
              <div className="flex items-center justify-between text-xs font-mono text-accent pb-2 border-b border-line">
                <span>CẤP BẬC {((TAXONOMIC_RANKS[activeTaxonIdx]?.level ?? 0) + 1)} / 14</span>
                <span className="uppercase">{TAXONOMIC_RANKS[activeTaxonIdx]?.rankVi}</span>
              </div>
              <h3 className="mt-3 text-xl font-bold text-fg">
                {TAXONOMIC_RANKS[activeTaxonIdx]?.name}
              </h3>
              <p className="mt-1 text-sm text-fg-2">
                {TAXONOMIC_RANKS[activeTaxonIdx]?.desc}
              </p>
            </div>

            {/* Số liệu thống kê */}
            <div className="mt-6 grid grid-cols-2 gap-4">
              <div className="rounded-2xl border border-line bg-surface-1/60 p-4">
                <p className="text-3xl font-bold font-mono text-accent">25</p>
                <p className="text-xs text-fg-3 mt-1">Nút phân loại hạt nhân</p>
              </div>
              <div className="rounded-2xl border border-line bg-surface-1/60 p-4">
                <p className="text-3xl font-bold font-mono text-emerald-400">100%</p>
                <p className="text-xs text-fg-3 mt-1">Đối chiếu chuẩn GBIF</p>
              </div>
            </div>

            <div className="mt-8">
              <Button
                pill
                className="gap-2"
                onClick={() => {
                  window.location.hash = '#/taxonomy';
                }}
              >
                Xem toàn bộ phả hệ <ArrowRight className="size-4" />
              </Button>
            </div>
          </div>

          {/* Cột hiển thị Chuỗi Xoắn 3D bên phải */}
          <div className="lg:col-span-7 h-[580px] rounded-3xl border border-line bg-[#030d09]/70 overflow-hidden relative shadow-2xl">
            <SceneShell
              id="home-helix"
              posterSrc="posters/home-helix.webp"
              posterAlt="Chuỗi xoắn ADN và các nấc thang phân loại học sinh giới"
              className="h-full w-full"
              srDescription="Chuỗi xoắn kép ADN phát quang ngọc bích mô phỏng 14 nấc phân loại học sinh giới."
            >
              {(_tier, handleFirstFrame) => (
                <Canvas
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
      <section id="chapter-2" className="relative min-h-screen py-20 px-6 border-t border-line/40">
        <div className="max-w-7xl mx-auto text-center mb-8">
          <Badge variant="accent" className="font-mono text-xs uppercase tracking-wider">
            02 · Hành tinh BioNexus
          </Badge>
          <h2 className="mt-3 text-4xl sm:text-5xl font-bold font-serif text-fg">
            Nhân giống tại Việt Nam, <span className="text-accent italic">gốc gác khắp thế giới</span>
          </h2>
          <p className="mt-3 text-fg-2 max-w-xl mx-auto text-sm sm:text-base">
            Khám phá 9 loài sinh vật biểu tượng và các cung đường di cư sinh học nhân đạo kết nối về 3 trung tâm bảo tồn tại Việt Nam.
          </p>
        </div>

        {/* Thanh chọn nhanh 9 loài biểu tượng */}
        <div className="max-w-5xl mx-auto mb-6 flex items-center gap-2 overflow-x-auto pb-3 pt-1 scrollbar-none">
          {DEFAULT_SPECIES_BIOMARKERS.map((sp) => {
            const isSelected = selectedSpeciesId === sp.speciesId;
            const dotColor = IUCN_MARKER_COLORS[sp.conservationStatus] || '#00D29E';

            return (
              <button
                key={sp.speciesId}
                onClick={() => setSelectedSpeciesId(sp.speciesId)}
                className={cn(
                  'flex items-center gap-2 rounded-full px-4 py-2 text-xs font-medium whitespace-nowrap transition-all border',
                  isSelected
                    ? 'border-accent bg-accent/15 text-accent shadow-md shadow-accent/20'
                    : 'border-line/70 bg-surface-1/70 text-fg-2 hover:border-line hover:bg-surface-2'
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
        <div className="max-w-6xl mx-auto h-[620px] rounded-3xl border border-line bg-[#03130E]/80 overflow-hidden shadow-2xl relative">
          <SceneShell
            id="home-earth"
            posterSrc="posters/home-earth.webp"
            posterAlt="Quả địa cầu BioEarth tương tác 7 lớp kết nối 9 loài bảo tồn toàn cầu"
            className="h-full w-full"
            srDescription="Quả địa cầu BioEarth 3D hiển thị 9 loài sinh vật cảnh bản địa trên thế giới và cung bay về Việt Nam."
          >
            {(_tier, handleFirstFrame) => (
              <Canvas
                camera={{ position: [0, 0.5, 6.2], fov: 42 }}
                onCreated={() => handleFirstFrame?.()}
              >
                <ambientLight intensity={0.4} />
                <directionalLight position={[5, 3, 5]} intensity={1.2} />
                <BioEarth
                  speciesList={DEFAULT_SPECIES_BIOMARKERS}
                  breedingHubs={VIETNAM_BREEDING_HUBS}
                  selectedSpeciesId={selectedSpeciesId}
                  onSelectSpecies={(id) => setSelectedSpeciesId(id)}
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

        {/* Chân trang Chương 2: Danh sách 3 Hub tiếp nhận */}
        <div className="max-w-5xl mx-auto mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          {VIETNAM_BREEDING_HUBS.map((hub) => (
            <div key={hub.id} className="rounded-2xl border border-line bg-surface-1/50 p-4 text-xs">
              <div className="flex items-center gap-1.5 text-accent font-semibold mb-1">
                <MapPin className="size-3.5" />
                <span>{hub.city}</span>
              </div>
              <p className="font-medium text-fg">{hub.shopName}</p>
              <p className="text-fg-3 mt-1">{hub.specialty}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 5. CHƯƠNG 3: SÀN SINH VẬT CẢNH & ĐẠO ĐỨC BẢO TỒN (Marketplace) */}
      <section id="chapter-3" className="relative min-h-screen py-24 px-6 border-t border-line/40">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div>
              <Badge variant="accent" className="font-mono text-xs uppercase tracking-wider">
                03 · Cửa hàng Đã Kiểm Duyệt
              </Badge>
              <h2 className="mt-3 text-4xl sm:text-5xl font-bold font-serif text-fg">
                Cá thể khỏe mạnh, <span className="text-accent italic">pháp lý rõ ràng</span>
              </h2>
              <p className="mt-2 text-fg-2 text-sm sm:text-base">
                100% sinh vật cảnh được nhân giống nhân tạo thế hệ F2+, hồ sơ minh bạch đối soát với danh mục bách khoa.
              </p>
            </div>
            <Button
              variant="outline"
              pill
              className="mt-4 md:mt-0"
              onClick={() => {
                window.location.hash = '#/products';
              }}
            >
              Xem tất cả sản phẩm <ArrowRight className="size-4" />
            </Button>
          </div>

          {/* Lưới sản phẩm đã kiểm duyệt */}
          {isProductsLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 8 }, (_, i) => (
                <div key={i} className="rounded-2xl border border-line p-4 space-y-3">
                  <Skeleton className="aspect-[4/3] w-full rounded-xl" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {productsData?.items?.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          {/* Cam kết bảo tồn và CTA mở shop */}
          <div className="mt-16 rounded-3xl border border-line bg-surface-1 p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl">
            <div className="max-w-xl">
              <div className="flex items-center gap-2 text-accent font-semibold mb-2 text-sm">
                <ShieldCheck className="size-5" /> Tôn chỉ bảo tồn sinh quyển BioNexus
              </div>
              <h3 className="text-2xl sm:text-3xl font-serif font-bold text-fg">
                Bạn là nhà nhân giống có giấy phép hợp pháp?
              </h3>
              <p className="mt-2 text-fg-2 text-sm leading-relaxed">
                Chúng tôi đồng hành cùng các trang trại sinh sản nhân tạo F2+, kiên quyết nói không với động vật khai thác tự nhiên, kiến tạo sàn sinh vật cảnh văn minh chuẩn mực.
              </p>
            </div>
            <Button
              size="lg"
              pill
              className="shrink-0 shadow-lg shadow-accent/20"
              onClick={() => {
                window.location.hash = '#/seller/apply';
              }}
            >
              Nộp hồ sơ mở shop
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
