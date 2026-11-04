import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { Stamp } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/cn';
import { Logo } from '@/components/ui/Logo';
import { QuickSearch } from '@/components/navigation/QuickSearch';
import { useQueries } from '@tanstack/react-query';
import { useSpeciesList } from '@/api/queries/useSpeciesQueries';
import { useProducts } from '@/api/queries/useProductQueries';
import { useAddToCart } from '@/api/mutations/useCartMutations';
import { useAuthState } from '@/api/queries/useAuthQueries';
import { api } from '@/api/client';
import { queryKeys } from '@/api/keys';
import { ApiError } from '@/api/errors';
import type { TaxonomyDetailDto } from '@/types/api';
import { JOURNEY_SPECIES_BASE } from '@/content/journey';
import { PassportProvider, usePassport } from '@/hooks/usePassport';
import { ChapterRail } from '@/components/journey/ChapterRail';
import { Hud } from '@/components/journey/Hud';
import { useJourneyReducedMotion } from '@/components/journey/useScrub';
import { WelcomeSection } from './WelcomeSection';
import { Gate, River, Station1, Station2, Station3 } from './RainforestChapter';
import { Flight } from './FlightSection';
import { Axolotl, Venus } from './WetlandsChapter';
import { BallPython, Dragon, Gecko } from './DrylandsChapter';
import { Hermann } from './MediterraneanChapter';
import { Certificate, PassportBook, Recap } from './FinaleSection';
import { Kinship } from './KinshipSection';

const SECTIONS = [
  'mo-dau',
  'tong-quan',
  'cua-rung',
  'tram-1',
  'song',
  'tram-2',
  'tram-3',
  'bay-2',
  'tram-4',
  'tram-5',
  'bay-3',
  'tram-6',
  'tram-7',
  'tram-8',
  'bay-4',
  'tram-9',
  'ket',
  'ho-chieu',
  'ho-hang',
] as const;

const ORDERED_SLUGS = Object.keys(JOURNEY_SPECIES_BASE);

function JourneyHeader({ onSkip }: { onSkip: () => void }): React.JSX.Element {
  const { met, isWelcomeMode, setWelcomeMode } = usePassport();

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-40 flex items-center justify-between px-4 py-3 md:px-6 md:py-4">
      <a
        href="#/"
        className="pointer-events-auto flex items-center gap-2.5 text-sm font-semibold tracking-tight text-white"
      >
        <Logo className="size-5 text-[#6ee7b7]" />
        <span>BioNexus</span>
        <span className="hidden text-white/35 sm:inline">/</span>
        <span className="hidden font-normal text-white/75 sm:inline">Hành trình 9 loài</span>
      </a>

      <div className="pointer-events-auto flex items-center gap-2">
        <div
          role="group"
          aria-label="Chế độ xem"
          className="glass hidden items-center rounded-full p-1 text-xs md:flex"
        >
          <button
            type="button"
            onClick={() => setWelcomeMode(false)}
            className={cn(
              'rounded-full px-3 py-1 transition',
              !isWelcomeMode
                ? 'bg-white/15 font-medium text-white'
                : 'text-white/65 hover:text-white'
            )}
          >
            Khách
          </button>
          <button
            type="button"
            onClick={() => setWelcomeMode(true)}
            className={cn(
              'rounded-full px-3 py-1 transition',
              isWelcomeMode
                ? 'bg-white/15 font-medium text-white'
                : 'text-white/65 hover:text-white'
            )}
          >
            Người mới đăng ký
          </button>
        </div>

        {isWelcomeMode && (
          <button
            type="button"
            onClick={onSkip}
            className="hidden rounded-full px-3 py-1.5 text-xs text-white/75 transition hover:bg-white/10 hover:text-white sm:inline-block"
          >
            Bỏ qua chuyến đi
          </button>
        )}

        <a
          href="#ho-chieu"
          onClick={(e) => {
            e.preventDefault();
            document.getElementById('ho-chieu')?.scrollIntoView({ behavior: 'smooth' });
          }}
          className="glass flex items-center gap-2.5 rounded-full px-3.5 py-1.5 text-xs font-medium"
          aria-label={`Hộ chiếu loài: đã đóng dấu ${met.length} trên 9 trạm`}
        >
          <Stamp className="size-3.5 text-[#6ee7b7]" aria-hidden="true" />
          <span className="flex gap-1" aria-hidden="true">
            {ORDERED_SLUGS.map((slug) => (
              <span
                key={slug}
                className={cn(
                  'size-1.5 rounded-full transition',
                  met.includes(slug) ? 'bg-[#6ee7b7]' : 'bg-white/25'
                )}
              />
            ))}
          </span>
          <span className="font-mono tabular-nums">{met.length}/9</span>
        </a>
      </div>
    </header>
  );
}

function JourneyContent(): React.JSX.Element {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { met, markSkipped, lastAnnouncement } = usePassport();
  const reduced = useJourneyReducedMotion();
  const [active, setActive] = useState<string>('mo-dau');

  const auth = useAuthState();
  const { data: liveSpecies } = useSpeciesList();
  const { data: productsPage } = useProducts({ size: 48 });
  const addToCart = useAddToCart();

  // Breadcrumbs của từng chi cho biết id thật của mọi nút từ Giới tới Chi (không đoán id)
  const genusIds = useMemo(
    () => Array.from(new Set((liveSpecies ?? []).map((sp) => sp.nodeId))),
    [liveSpecies]
  );
  const genusDetails = useQueries({
    queries: genusIds.map((nodeId) => ({
      queryKey: queryKeys.taxonomy.detail(nodeId),
      queryFn: async () => (await api<TaxonomyDetailDto>(`taxonomy/${nodeId}`)).data,
      staleTime: 10 * 60 * 1000,
    })),
  });
  const genusDetailsKey = genusDetails.map((q) => q.dataUpdatedAt).join(',');
  const taxonIdMap = useMemo(() => {
    const map: Record<string, number> = {};
    for (const q of genusDetails) {
      if (!q.data) continue;
      for (const node of [...q.data.breadcrumbs, q.data.node]) {
        map[node.scientificName] = node.id;
      }
    }
    return map;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [genusDetailsKey]);

  // Số nút phân loại có loài (seed: 25); chưa tải xong thì để WelcomeSection dùng giá trị mặc định
  const taxonomyCount = Object.keys(taxonIdMap).length || undefined;
  const approvedProductCount = productsPage?.total;

  const handleSkip = useCallback(() => {
    markSkipped();
    navigate('/');
  }, [markSkipped, navigate]);

  const handleAddCartProduct = useCallback(
    (productId: number, productName: string) => {
      // Chỉ tài khoản người mua mới có giỏ: khách được mời đăng nhập, không báo thành công giả
      if (!auth.token || auth.accountType !== 'USER') {
        toast.info('Đăng nhập tài khoản người mua để thêm vào giỏ', {
          action: {
            label: 'Đăng nhập',
            onClick: () => navigate(`/login?next=${encodeURIComponent('/tham-hiem')}`),
          },
        });
        return;
      }
      addToCart.mutate(
        { productId, quantity: 1 },
        {
          onSuccess: () => {
            toast.success(`Đã thêm “${productName}” vào giỏ`);
          },
          onError: (err) => {
            toast.error(err instanceof ApiError ? err.message : `Chưa thêm được “${productName}” vào giỏ`);
          },
        }
      );
    },
    [addToCart, auth.token, auth.accountType, navigate]
  );

  // Nhảy tới trạm được yêu cầu qua query ?tram=tram-X (từ trang /account "Đi tiếp hành trình")
  useEffect(() => {
    const targetStation = searchParams.get('tram');
    if (targetStation) {
      const timer = setTimeout(() => {
        document.getElementById(targetStation)?.scrollIntoView({ behavior: 'smooth' });
      }, 120);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [searchParams]);

  // Xác định mục đang chiếm giữa màn hình để cập nhật HUD và thanh chặng
  useEffect(() => {
    let raf = 0;
    const check = () => {
      raf = 0;
      const mid = window.innerHeight * 0.5;
      for (const id of SECTIONS) {
        const el = document.getElementById(id);
        if (!el) continue;
        const r = el.getBoundingClientRect();
        if (r.top <= mid && r.bottom >= mid) {
          setActive(id);
          return;
        }
      }
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(check);
    };
    check();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  return (
    <div
      // Hành trình là trải nghiệm ảnh và 3D toàn màn hình nên luôn tối, kể cả khi người dùng chọn giao diện sáng
      data-theme="dark"
      data-reduced-motion={reduced ? 'true' : 'false'}
      className="expedition bg-[#040a07] text-[#edf5f0] selection:bg-[#6ee7b7] selection:text-[#03140d]"
    >
      {/* Vùng thông báo aria-live khi đóng dấu loài mới */}
      <div role="status" aria-live="polite" className="sr-only">
        {lastAnnouncement}
      </div>

      <JourneyHeader onSkip={handleSkip} />
      <Hud active={active} liveSpecies={liveSpecies} />
      <ChapterRail active={active} met={met} liveSpecies={liveSpecies} />

      <main>
        <WelcomeSection
          onSkip={handleSkip}
          speciesCount={liveSpecies?.length || 9}
          taxonomyCount={taxonomyCount}
          approvedProductCount={approvedProductCount}
        />
        <Gate liveSpecies={liveSpecies} />
        <Station1 liveSpecies={liveSpecies} />
        <River />
        <Station2 liveSpecies={liveSpecies} />
        <Station3 liveSpecies={liveSpecies} />
        <Flight id="bay-2" liveSpecies={liveSpecies} />
        <Venus liveSpecies={liveSpecies} />
        <Axolotl liveSpecies={liveSpecies} />
        <Flight id="bay-3" liveSpecies={liveSpecies} />
        <BallPython liveSpecies={liveSpecies} />
        <Gecko liveSpecies={liveSpecies} />
        <Dragon liveSpecies={liveSpecies} />
        <Flight id="bay-4" liveSpecies={liveSpecies} />
        <Hermann liveSpecies={liveSpecies} />
        <Recap />
        <PassportBook liveSpecies={liveSpecies} />
        <Kinship liveSpecies={liveSpecies} taxonIdMap={taxonIdMap} />
        <Certificate
          liveProducts={productsPage?.items}
          liveSpecies={liveSpecies}
          onAddCartProduct={handleAddCartProduct}
        />
      </main>
    </div>
  );
}

export default function JourneyPage(): React.JSX.Element {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const welcomeParam = searchParams.get('chao-mung') === '1';

  const handleWelcomeModeChange = useCallback(
    (welcome: boolean) => {
      const next = new URLSearchParams(searchParams);
      if (welcome) {
        next.set('chao-mung', '1');
      } else {
        next.delete('chao-mung');
      }
      setSearchParams(next, { replace: true });
    },
    [searchParams, setSearchParams]
  );

  return (
    <PassportProvider
      initialWelcomeMode={welcomeParam}
      onWelcomeModeChange={handleWelcomeModeChange}
      onOpenQuickSearch={() => setIsSearchOpen(true)}
    >
      <JourneyContent />
      <QuickSearch isOpen={isSearchOpen} onOpen={() => setIsSearchOpen(true)} onClose={() => setIsSearchOpen(false)} />
    </PassportProvider>
  );
}
