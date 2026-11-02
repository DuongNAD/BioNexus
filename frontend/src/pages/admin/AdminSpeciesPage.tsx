import React, { useState, useSyncExternalStore } from 'react';
import { Link } from 'react-router';
import { toast } from 'sonner';
import {
  Leaf,
  Plus,
  Search,
  ExternalLink,
  ShieldAlert,
  Thermometer,
  BookOpen,
  Eye,
  X,
  FileCheck2,
  Sparkles,
} from 'lucide-react';
import { getAuthState, subscribeAuth } from '@/api/authStore';
import { useSpeciesList } from '@/api/queries/useSpeciesQueries';
import { useAdminProducts } from '@/api/queries/useAdminQueries';
import { useCreateSpecies } from '@/api/mutations/useAdminMutations';
import { IucnBadge } from '@/components/ui/IucnBadge';
import { ClimateBar } from '@/components/domain/ClimateBar';
import { HumidityGauge } from '@/components/domain/HumidityGauge';
import { parseEnvironmentSpecs } from '@/lib/parseEnvironmentSpecs';
import { SPECIES_EXTRAS } from '@/content/species-extras';
import { PHOTOS } from '@/content/photos';
import type { ConservationStatus, CreateSpeciesRequest } from '@/types/api';

// 7 Chi (GENUS) hợp lệ từ seed
const VALID_GENUS_NODES = [
  { id: 20, scientificName: 'Python', commonName: 'Chi Trăn hoa', lineage: 'Động vật > Dây sống > Bò sát > Có vảy > Họ Trăn' },
  { id: 21, scientificName: 'Eublepharis', commonName: 'Chi Thằn lằn da báo', lineage: 'Động vật > Dây sống > Bò sát > Có vảy > Họ Thằn lằn mí' },
  { id: 22, scientificName: 'Pogona', commonName: 'Chi Rồng Úc', lineage: 'Động vật > Dây sống > Bò sát > Có vảy > Họ Nhông' },
  { id: 23, scientificName: 'Testudo', commonName: 'Chi Rùa cạn Địa Trung Hải', lineage: 'Động vật > Dây sống > Bò sát > Bộ Rùa > Họ Rùa cạn' },
  { id: 24, scientificName: 'Ambystoma', commonName: 'Chi Kỳ giông viền', lineage: 'Động vật > Dây sống > Lưỡng cư > Có đuôi > Họ Kỳ giông lửa' },
  { id: 25, scientificName: 'Nepenthes', commonName: 'Chi Nắp ấm nhiệt đới', lineage: 'Thực vật > Có mạch > Hai lá mầm > Cẩm chướng > Họ Nắp ấm' },
  { id: 26, scientificName: 'Dionaea', commonName: 'Chi Bắt ruồi', lineage: 'Thực vật > Có mạch > Hai lá mầm > Cẩm chướng > Họ Gọng vó' },
];

const IUCN_OPTIONS: { status: ConservationStatus; label: string }[] = [
  { status: 'LC', label: 'LC — Ít quan tâm (Least Concern)' },
  { status: 'NT', label: 'NT — Sắp bị đe dọa (Near Threatened)' },
  { status: 'VU', label: 'VU — Sắp nguy cấp (Vulnerable)' },
  { status: 'EN', label: 'EN — Nguy cấp (Endangered)' },
  { status: 'CR', label: 'CR — Cực kỳ nguy cấp (Critically Endangered)' },
  { status: 'EW', label: 'EW — Tuyệt chủng ngoài tự nhiên (Extinct in the Wild)' },
  { status: 'EX', label: 'EX — Tuyệt chủng hoàn toàn (Extinct)' },
];

export default function AdminSpeciesPage(): React.JSX.Element {
  const auth = useSyncExternalStore(subscribeAuth, getAuthState);
  const { data: speciesList = [], isLoading } = useSpeciesList();
  const { data: allProducts = [] } = useAdminProducts('ALL');
  const createSpeciesMutation = useCreateSpecies();

  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<'ALL' | 'Bò sát' | 'Lưỡng cư' | 'Cây ăn thịt'>('ALL');
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    nodeId: 22, // Pogona
    scientificName: '',
    commonName: '',
    conservationStatus: 'LC' as ConservationStatus,
    tempMin: 26,
    tempMax: 32,
    baskMin: 38,
    baskMax: 42,
    humidMin: 30,
    humidMax: 40,
    habitat: 'Bán hoang mạc, savan khô',
    description: '',
    imageURL: '',
    referenceURL: '',
  });

  // Phân quyền: Chỉ BIOLOGIST và SUPER_ADMIN
  const userRole = auth.role as string;
  const isAuthorized = auth.token && auth.accountType === 'ADMIN' && (userRole === 'SUPER_ADMIN' || userRole === 'BIOLOGIST');

  if (!isAuthorized) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center p-8 text-center max-w-md mx-auto">
        <div className="size-16 rounded-2xl border border-danger/40 bg-danger/10 flex items-center justify-center text-danger mb-4 shadow-[0_0_25px_rgba(248,113,113,0.2)]">
          <ShieldAlert className="size-8" aria-hidden="true" />
        </div>
        <span className="rounded-full border border-danger/40 bg-danger/15 px-3 py-1 text-xs font-mono font-semibold tracking-wider text-danger uppercase">
          403 Forbidden
        </span>
        <h2 className="mt-4 text-2xl font-bold tracking-tight text-fg font-sans">
          Không đủ quyền truy cập
        </h2>
        <p className="mt-2 text-sm text-fg-2 leading-relaxed">
          Khu vực Quản trị Bách khoa Loài chỉ dành riêng cho Nhà sinh học (Biologist) và Admin Tổng. Tài khoản Kiểm duyệt viên (Moderator) không có quyền can thiệp vào cơ sở dữ liệu phân loại học.
        </p>
        <div className="mt-6 flex gap-3">
          <Link
            to="/admin"
            className="rounded-xl border border-line bg-surface px-4 py-2 text-xs font-semibold text-fg hover:bg-surface-hover"
          >
            Về bảng tổng quan
          </Link>
          <Link
            to="/"
            className="rounded-xl bg-accent px-4 py-2 text-xs font-semibold text-accent-ink hover:opacity-90"
          >
            Về trang chủ sàn
          </Link>
        </div>
      </div>
    );
  }

  // Lọc danh mục loài
  const filteredSpecies = speciesList.filter((species) => {
    const extra = SPECIES_EXTRAS[species.scientificName];
    if (selectedGroup !== 'ALL') {
      if (extra?.group !== selectedGroup) return false;
    }

    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const sci = species.scientificName.toLowerCase();
    const com = species.commonName.toLowerCase();
    return sci.includes(q) || com.includes(q);
  });

  // Đếm số sản phẩm liên kết
  const getProductCountForSpecies = (speciesId: number) => {
    return allProducts.filter((p) => p.speciesId === speciesId && p.status === 'APPROVED').length;
  };

  // Tạo chuỗi environmentSpecs
  const buildEnvironmentSpecsString = () => {
    const parts: string[] = [];
    if (formData.tempMin && formData.tempMax) {
      if (formData.baskMin && formData.baskMax) {
        parts.push(`Nhiệt độ: ${formData.tempMin}-${formData.tempMax}°C (điểm sưởi ${formData.baskMin}-${formData.baskMax}°C)`);
      } else {
        parts.push(`Nhiệt độ: ${formData.tempMin}-${formData.tempMax}°C`);
      }
    }
    if (formData.humidMin && formData.humidMax) {
      parts.push(`Độ ẩm: ${formData.humidMin}-${formData.humidMax}%`);
    }
    if (formData.habitat.trim()) {
      parts.push(`Môi trường: ${formData.habitat.trim()}`);
    }
    return parts.join(', ') || 'Nhiệt độ: 24-30°C, Độ ẩm: 50-60%';
  };

  const currentPreviewSpecs = parseEnvironmentSpecs(buildEnvironmentSpecsString());

  // Submit tạo loài
  const handleCreateSpecies = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.scientificName.trim() || !formData.commonName.trim()) {
      toast.error('Vui lòng nhập tên khoa học và tên thường gọi');
      return;
    }

    const payload: CreateSpeciesRequest = {
      nodeId: Number(formData.nodeId),
      scientificName: formData.scientificName.trim(),
      commonName: formData.commonName.trim(),
      conservationStatus: formData.conservationStatus,
      environmentSpecs: buildEnvironmentSpecsString(),
      description: formData.description.trim() || 'Hồ sơ chuyên khảo sinh học được cập nhật bởi ban cố vấn khoa học BioNexus.',
      imageURL: formData.imageURL.trim() || '/photos/axolotl/hero-960.webp',
      referenceURL: formData.referenceURL.trim() || 'https://www.gbif.org',
    };

    try {
      await createSpeciesMutation.mutateAsync(payload);
      toast.success(`Đã thêm mới loài "${payload.scientificName}" vào Bách khoa toàn thư sinh học!`);
      setIsSheetOpen(false);
      setFormData({
        nodeId: 22,
        scientificName: '',
        commonName: '',
        conservationStatus: 'LC',
        tempMin: 26,
        tempMax: 32,
        baskMin: 38,
        baskMax: 42,
        humidMin: 30,
        humidMax: 40,
        habitat: 'Bán hoang mạc, savan khô',
        description: '',
        imageURL: '',
        referenceURL: '',
      });
    } catch {
      toast.error('Không thể tạo mới loài (tên khoa học có thể đã tồn tại hoặc nhánh không phải cấp Chi)');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* 1. Header Trang */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-line pb-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-ocean/30 bg-ocean/10 px-3 py-1 text-xs font-semibold text-ocean mb-1.5">
            <BookOpen className="size-3.5" aria-hidden="true" />
            <span>Ban Thư Ký Khoa Học & Phả Hệ Sinh Học 6 Cấp</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-fg font-sans">
            Quản trị Bách khoa Toàn thư Loài
          </h1>
          <p className="text-xs md:text-sm text-fg-3">
            Chuẩn hóa danh pháp quốc tế, thông số sinh cảnh vi khí hậu và kết nối mạng lưới bảo tồn IUCN Red List.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsSheetOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-xs font-semibold text-accent-ink hover:opacity-90 shadow-[var(--glow-accent-btn)] transition-all self-start sm:self-auto"
        >
          <Plus className="size-4" aria-hidden="true" />
          <span>Thêm loài mới</span>
        </button>
      </div>

      {/* 2. Thanh lọc & Tìm kiếm */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface/80 backdrop-blur-xl p-4 rounded-2xl border border-line">
        {/* Nhóm sinh học */}
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: 'ALL', label: `Tất cả loài (${speciesList.length})` },
            { id: 'Bò sát', label: 'Bò sát' },
            { id: 'Lưỡng cư', label: 'Lưỡng cư' },
            { id: 'Cây ăn thịt', label: 'Cây ăn thịt' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSelectedGroup(tab.id as typeof selectedGroup)}
              className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
                selectedGroup === tab.id
                  ? 'bg-accent text-accent-ink shadow-[var(--glow-accent-btn)]'
                  : 'border border-line bg-surface text-fg-2 hover:border-line-strong hover:text-fg'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Ô tìm kiếm */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-fg-3" aria-hidden="true" />
          <input
            type="text"
            placeholder="Tìm theo tên khoa học, tên gọi..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-line bg-bg-deep/60 pl-9 pr-4 py-2 text-xs text-fg placeholder:text-fg-mute focus:border-accent focus:outline-none"
          />
        </div>
      </div>

      {/* 3. Bảng Danh Mục Loài Bách Khoa */}
      <div className="rounded-2xl border border-line bg-surface/90 backdrop-blur-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-line/80 bg-surface-2/60 text-fg-3 uppercase font-mono text-[11px] tracking-wider">
                <th className="py-3.5 px-4">Loài sinh vật</th>
                <th className="py-3.5 px-4">Cấp Chi (Genus)</th>
                <th className="py-3.5 px-4">Bảo tồn IUCN</th>
                <th className="py-3.5 px-4">Sản phẩm trên sàn</th>
                <th className="py-3.5 px-4">Thông số vi khí hậu</th>
                <th className="py-3.5 px-4 text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line/40">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-accent text-xs">
                    Đang nạp danh mục khoa học...
                  </td>
                </tr>
              ) : filteredSpecies.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-fg-3 text-xs">
                    Không tìm thấy loài nào phù hợp.
                  </td>
                </tr>
              ) : (
                filteredSpecies.map((sp) => {
                  const extra = SPECIES_EXTRAS[sp.scientificName];
                  const photo = extra?.heroPhotoId ? PHOTOS[extra.heroPhotoId] : undefined;
                  const thumbSrc =
                    photo?.sources.webp[0]?.src || photo?.sources.jpg || sp.imageURL || '/photos/axolotl/hero-960.webp';
                  const prodCount = getProductCountForSpecies(sp.id);

                  // Tìm tên Chi
                  const parentGenus = VALID_GENUS_NODES.find((g) => g.id === sp.nodeId);

                  return (
                    <tr
                      key={sp.id}
                      className="hover:bg-surface-hover/80 transition-colors group"
                    >
                      {/* Cột 1: Thumbnail & Tên */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="size-12 rounded-xl overflow-hidden bg-bg-raised shrink-0 border border-line">
                            <img
                              src={thumbSrc}
                              alt={sp.commonName}
                              className="size-full object-cover group-hover:scale-105 transition-transform duration-300"
                              loading="lazy"
                            />
                          </div>
                          <div>
                            <p className="font-serif italic font-semibold text-accent text-sm">
                              {sp.scientificName}
                            </p>
                            <p className="text-xs text-fg font-medium mt-0.5">
                              {sp.commonName}
                            </p>
                            <span className="text-[10px] text-fg-mute font-mono">
                              ID: #{sp.id}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Cột 2: Chi */}
                      <td className="py-3.5 px-4">
                        <div>
                          <p className="font-serif italic font-semibold text-fg">
                            {parentGenus?.scientificName || 'Chi phân loại'}
                          </p>
                          <p className="text-[11px] text-fg-3">
                            {parentGenus?.commonName || 'GENUS'}
                          </p>
                        </div>
                      </td>

                      {/* Cột 3: IUCN */}
                      <td className="py-3.5 px-4">
                        <IucnBadge code={sp.conservationStatus} size="sm" />
                      </td>

                      {/* Cột 4: Sản phẩm */}
                      <td className="py-3.5 px-4 font-mono">
                        {prodCount > 0 ? (
                          <span className="inline-flex items-center gap-1.5 text-success font-semibold">
                            <span className="size-2 rounded-full bg-success animate-pulse" />
                            <span>{prodCount} cá thể</span>
                          </span>
                        ) : (
                          <span className="text-fg-mute">Chưa có bài bán</span>
                        )}
                      </td>

                      {/* Cột 5: Vi khí hậu */}
                      <td className="py-3.5 px-4 max-w-xs">
                        <p className="text-fg-2 truncate text-[11px]" title={sp.environmentSpecs}>
                          {sp.environmentSpecs}
                        </p>
                      </td>

                      {/* Cột 6: Hành động */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {extra?.gbifUrl && (
                            <a
                              href={extra.gbifUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="rounded-lg border border-line bg-surface p-1.5 text-fg-3 hover:text-ocean hover:border-ocean/40 transition-colors"
                              title="Tra cứu trên GBIF Backbone Taxonomy"
                            >
                              <ExternalLink className="size-3.5" aria-hidden="true" />
                            </a>
                          )}

                          <Link
                            to={`/species/${sp.id}`}
                            className="inline-flex items-center gap-1 rounded-lg border border-line bg-surface px-2.5 py-1 text-xs font-semibold text-fg hover:border-accent hover:text-accent transition-colors"
                          >
                            <Eye className="size-3" aria-hidden="true" />
                            <span>Xem hồ sơ</span>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Slide-over Sheet Form: Thêm Mới Loài Sinh Vật (600px) */}
      {isSheetOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-md animate-fadeIn">
          <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-xl bg-bg-raised border-l border-line shadow-2xl p-6 flex flex-col justify-between overflow-y-auto">
              {/* Header Sheet */}
              <div className="flex items-center justify-between border-b border-line pb-4">
                <div className="flex items-center gap-2">
                  <div className="rounded-xl border border-accent/40 bg-accent/10 p-2 text-accent">
                    <Leaf className="size-4" aria-hidden="true" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-fg tracking-tight">
                      Thêm Mới Hồ Sơ Loài Bách Khoa
                    </h2>
                    <p className="text-xs text-fg-3">
                      Đặc tả phân loại 6 cấp và chuẩn hóa sinh cảnh vi khí hậu
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsSheetOpen(false)}
                  className="rounded-full p-1.5 text-fg-3 hover:text-fg hover:bg-surface transition-colors"
                  aria-label="Đóng bảng"
                >
                  <X className="size-5" aria-hidden="true" />
                </button>
              </div>

              {/* Form Body */}
              <form onSubmit={handleCreateSpecies} className="space-y-6 my-6 text-xs">
                {/* PHÂN ĐOẠN 1: ĐỊNH DANH & PHÂN LOẠI HỌC */}
                <div className="space-y-3 rounded-xl border border-line/60 bg-surface/50 p-4">
                  <h3 className="font-bold text-fg text-xs uppercase tracking-wider flex items-center gap-1.5 text-accent">
                    <BookOpen className="size-3.5" aria-hidden="true" />
                    <span>Phần 1: Định danh & Phân loại học 6 Cấp</span>
                  </h3>

                  {/* Chọn Chi GENUS */}
                  <div>
                    <label htmlFor="genus-node-select" className="text-fg-mute block mb-1">
                      Nhánh phân loại Chi cha (Bắt buộc rank = GENUS):
                    </label>
                    <select
                      id="genus-node-select"
                      value={formData.nodeId}
                      onChange={(e) => setFormData({ ...formData, nodeId: Number(e.target.value) })}
                      className="w-full rounded-xl border border-line bg-bg-deep p-2.5 text-xs text-fg focus:border-accent focus:outline-none"
                    >
                      {VALID_GENUS_NODES.map((g) => (
                        <option key={g.id} value={g.id}>
                          {g.scientificName} ({g.commonName}) — ID: #{g.id}
                        </option>
                      ))}
                    </select>
                    <p className="text-[10px] text-fg-mute mt-1 font-mono">
                      {VALID_GENUS_NODES.find((g) => g.id === formData.nodeId)?.lineage}
                    </p>
                  </div>

                  {/* Tên khoa học */}
                  <div>
                    <label htmlFor="scientific-name-input" className="text-fg-mute block mb-1">
                      Tên khoa học quốc tế (Scientific Name - Binomial):
                    </label>
                    <input
                      id="scientific-name-input"
                      type="text"
                      required
                      placeholder="Ví dụ: Python regius, Pogona barbata..."
                      value={formData.scientificName}
                      onChange={(e) => setFormData({ ...formData, scientificName: e.target.value })}
                      className="w-full rounded-xl border border-line bg-bg-deep p-2.5 text-xs font-serif italic text-accent focus:border-accent focus:outline-none"
                    />
                  </div>

                  {/* Tên thường gọi */}
                  <div>
                    <label htmlFor="common-name-input" className="text-fg-mute block mb-1">
                      Tên thường gọi (Tiếng Việt kèm tên tiếng Anh):
                    </label>
                    <input
                      id="common-name-input"
                      type="text"
                      required
                      placeholder="Ví dụ: Rồng râu phương Đông (Eastern Bearded Dragon)"
                      value={formData.commonName}
                      onChange={(e) => setFormData({ ...formData, commonName: e.target.value })}
                      className="w-full rounded-xl border border-line bg-bg-deep p-2.5 text-xs text-fg focus:border-accent focus:outline-none"
                    />
                  </div>

                  {/* Mức bảo tồn IUCN */}
                  <div>
                    <label htmlFor="iucn-status-select" className="text-fg-mute block mb-1">
                      Mức bảo tồn theo IUCN Red List:
                    </label>
                    <select
                      id="iucn-status-select"
                      value={formData.conservationStatus}
                      onChange={(e) =>
                        setFormData({ ...formData, conservationStatus: e.target.value as ConservationStatus })
                      }
                      className="w-full rounded-xl border border-line bg-bg-deep p-2.5 text-xs text-fg focus:border-accent focus:outline-none"
                    >
                      {IUCN_OPTIONS.map((opt) => (
                        <option key={opt.status} value={opt.status}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* PHÂN ĐOẠN 2: VI KHÍ HẬU & SINH CẢNH */}
                <div className="space-y-3 rounded-xl border border-line/60 bg-surface/50 p-4">
                  <h3 className="font-bold text-fg text-xs uppercase tracking-wider flex items-center gap-1.5 text-accent">
                    <Thermometer className="size-3.5" aria-hidden="true" />
                    <span>Phần 2: Thông số Sinh cảnh & Vi khí hậu</span>
                  </h3>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="temp-min-input" className="text-fg-mute block mb-1">Nhiệt độ min (°C):</label>
                      <input
                        id="temp-min-input"
                        type="number"
                        value={formData.tempMin}
                        onChange={(e) => setFormData({ ...formData, tempMin: Number(e.target.value) })}
                        className="w-full rounded-xl border border-line bg-bg-deep p-2 text-xs text-fg"
                      />
                    </div>
                    <div>
                      <label htmlFor="temp-max-input" className="text-fg-mute block mb-1">Nhiệt độ max (°C):</label>
                      <input
                        id="temp-max-input"
                        type="number"
                        value={formData.tempMax}
                        onChange={(e) => setFormData({ ...formData, tempMax: Number(e.target.value) })}
                        className="w-full rounded-xl border border-line bg-bg-deep p-2 text-xs text-fg"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="humid-min-input" className="text-fg-mute block mb-1">Độ ẩm min (%):</label>
                      <input
                        id="humid-min-input"
                        type="number"
                        value={formData.humidMin}
                        onChange={(e) => setFormData({ ...formData, humidMin: Number(e.target.value) })}
                        className="w-full rounded-xl border border-line bg-bg-deep p-2 text-xs text-fg"
                      />
                    </div>
                    <div>
                      <label htmlFor="humid-max-input" className="text-fg-mute block mb-1">Độ ẩm max (%):</label>
                      <input
                        id="humid-max-input"
                        type="number"
                        value={formData.humidMax}
                        onChange={(e) => setFormData({ ...formData, humidMax: Number(e.target.value) })}
                        className="w-full rounded-xl border border-line bg-bg-deep p-2 text-xs text-fg"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="habitat-input" className="text-fg-mute block mb-1">Sinh cảnh sống tự nhiên:</label>
                    <input
                      id="habitat-input"
                      type="text"
                      placeholder="Ví dụ: Rừng mây nhiệt đới độ cao 1.800m"
                      value={formData.habitat}
                      onChange={(e) => setFormData({ ...formData, habitat: e.target.value })}
                      className="w-full rounded-xl border border-line bg-bg-deep p-2 text-xs text-fg"
                    />
                  </div>

                  {/* Trực quan hóa xem trước vi khí hậu */}
                  <div className="pt-2 border-t border-line/30 space-y-2">
                    <span className="text-fg-mute block text-[10px] font-mono">Xem trước ClimateBar & Độ ẩm:</span>
                    <ClimateBar specs={currentPreviewSpecs} />
                    <div className="flex justify-center">
                      <HumidityGauge
                        humidMin={formData.humidMin}
                        humidMax={formData.humidMax}
                        className="w-full max-w-xs"
                      />
                    </div>
                  </div>
                </div>

                {/* PHÂN ĐOẠN 3: MÔ TẢ HÌNH THÁI */}
                <div className="space-y-3 rounded-xl border border-line/60 bg-surface/50 p-4">
                  <h3 className="font-bold text-fg text-xs uppercase tracking-wider flex items-center gap-1.5 text-accent">
                    <FileCheck2 className="size-3.5" aria-hidden="true" />
                    <span>Phần 3: Chuyên khảo Hình thái & Tập tính</span>
                  </h3>

                  <div>
                    <label htmlFor="description-input" className="text-fg-mute block mb-1">Mô tả sinh học:</label>
                    <textarea
                      id="description-input"
                      rows={4}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Đặc điểm hình thái, màu sắc vảy, tập tính kiếm ăn và sinh sản..."
                      className="w-full rounded-xl border border-line bg-bg-deep p-2.5 text-xs text-fg placeholder:text-fg-mute focus:border-accent focus:outline-none"
                    />
                  </div>
                </div>

                {/* PHÂN ĐOẠN 4: ĐA PHƯƠNG TIỆN & BẢN QUYỀN */}
                <div className="space-y-3 rounded-xl border border-line/60 bg-surface/50 p-4">
                  <h3 className="font-bold text-fg text-xs uppercase tracking-wider flex items-center gap-1.5 text-accent">
                    <Sparkles className="size-3.5" aria-hidden="true" />
                    <span>Phần 4: Đa phương tiện & Tham chiếu Khoa học</span>
                  </h3>

                  <div>
                    <label htmlFor="image-url-input" className="text-fg-mute block mb-1">URL ảnh chuẩn đại diện:</label>
                    <input
                      id="image-url-input"
                      type="text"
                      placeholder="https://... hoặc /photos/bearded-dragon/hero-960.webp"
                      value={formData.imageURL}
                      onChange={(e) => setFormData({ ...formData, imageURL: e.target.value })}
                      className="w-full rounded-xl border border-line bg-bg-deep p-2 text-xs text-fg"
                    />
                  </div>

                  <div>
                    <label htmlFor="reference-url-input" className="text-fg-mute block mb-1">URL tham khảo khoa học (GBIF / IUCN):</label>
                    <input
                      id="reference-url-input"
                      type="text"
                      placeholder="https://www.gbif.org/species/..."
                      value={formData.referenceURL}
                      onChange={(e) => setFormData({ ...formData, referenceURL: e.target.value })}
                      className="w-full rounded-xl border border-line bg-bg-deep p-2 text-xs text-fg"
                    />
                  </div>
                </div>

                {/* Nút hành động */}
                <div className="pt-4 border-t border-line flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsSheetOpen(false)}
                    className="rounded-xl border border-line px-4 py-2 text-xs font-semibold text-fg-3 hover:text-fg"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="submit"
                    disabled={createSpeciesMutation.isPending}
                    className="rounded-xl bg-accent px-5 py-2.5 text-xs font-semibold text-accent-ink hover:opacity-90 shadow-[var(--glow-accent-btn)] disabled:opacity-50"
                  >
                    {createSpeciesMutation.isPending ? 'Đang lưu vào bách khoa...' : 'Lưu hồ sơ loài mới'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
