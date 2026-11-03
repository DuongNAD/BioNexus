import React, { useMemo, useState } from 'react';
import { Link } from 'react-router';
import { toast } from 'sonner';
import { Leaf, Plus, Search, ExternalLink, Thermometer, BookOpen, Eye, FileCheck2, Sparkles, RotateCw } from 'lucide-react';
import { useSpeciesList } from '@/api/queries/useSpeciesQueries';
import { useProducts } from '@/api/queries/useProductQueries';
import { useGenusOptions } from '@/api/queries/useAdminQueries';
import { useCreateSpecies } from '@/api/mutations/useAdminMutations';
import { IucnBadge } from '@/components/ui/IucnBadge';
import { ClimateBar } from '@/components/domain/ClimateBar';
import { HumidityGauge } from '@/components/domain/HumidityGauge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/Dialog';
import { parseEnvironmentSpecs } from '@/lib/parseEnvironmentSpecs';
import { SPECIES_EXTRAS } from '@/content/species-extras';
import { PHOTOS } from '@/content/photos';
import type { ConservationStatus, CreateSpeciesRequest } from '@/types/api';

const IUCN_OPTIONS: { status: ConservationStatus; label: string }[] = [
  { status: 'LC', label: 'LC — Ít quan tâm' },
  { status: 'NT', label: 'NT — Sắp bị đe dọa' },
  { status: 'VU', label: 'VU — Sắp nguy cấp' },
  { status: 'EN', label: 'EN — Nguy cấp' },
  { status: 'CR', label: 'CR — Cực kỳ nguy cấp' },
  { status: 'EW', label: 'EW — Tuyệt chủng ngoài tự nhiên' },
  { status: 'EX', label: 'EX — Tuyệt chủng' },
];

// Kích thước trang lớn nhất hợp đồng cho phép: đủ để đếm sản phẩm đang bán theo loài
const PRODUCT_COUNT_PAGE_SIZE = 48;

interface SpeciesFormState {
  nodeId: string;
  scientificName: string;
  commonName: string;
  conservationStatus: ConservationStatus;
  tempMin: string;
  tempMax: string;
  baskMin: string;
  baskMax: string;
  humidMin: string;
  humidMax: string;
  habitat: string;
  description: string;
  imageURL: string;
  referenceURL: string;
}

const EMPTY_FORM: SpeciesFormState = {
  nodeId: '',
  scientificName: '',
  commonName: '',
  conservationStatus: 'LC',
  tempMin: '',
  tempMax: '',
  baskMin: '',
  baskMax: '',
  humidMin: '',
  humidMax: '',
  habitat: '',
  description: '',
  imageURL: '',
  referenceURL: '',
};

type FormErrors = Partial<Record<keyof SpeciesFormState, string>>;

const toNumber = (value: string): number | null => (value.trim() === '' ? null : Number(value));
const isHttpUrl = (value: string) => /^https?:\/\/\S+$/i.test(value);

/** Kiểm tra cặp min/max: cả hai cùng trống hoặc cùng có, và min ≤ max */
function checkRange(
  min: string,
  max: string,
  label: string,
  bounds?: { lo: number; hi: number }
): string | undefined {
  const a = toNumber(min);
  const b = toNumber(max);
  if (a === null && b === null) return undefined;
  if (a === null || b === null) return `Nhập đủ cả hai giá trị ${label}`;
  if (Number.isNaN(a) || Number.isNaN(b)) return `${label} phải là số`;
  if (a > b) return `${label}: giá trị nhỏ nhất phải ≤ giá trị lớn nhất`;
  if (bounds && (a < bounds.lo || b > bounds.hi)) return `${label} phải nằm trong khoảng ${bounds.lo}–${bounds.hi}`;
  return undefined;
}

function validateForm(form: SpeciesFormState, genusName?: string): FormErrors {
  const errors: FormErrors = {};
  if (!form.nodeId) errors.nodeId = 'Chọn chi (cấp GENUS) cho loài';
  const sci = form.scientificName.trim();
  if (!sci) errors.scientificName = 'Nhập tên khoa học';
  else if (!/^[A-Z][a-z]+ [a-z][a-z-]+$/.test(sci)) errors.scientificName = 'Tên khoa học gồm tên chi viết hoa và tên loài viết thường, ví dụ Pogona barbata';
  else if (genusName && !sci.startsWith(`${genusName} `)) errors.scientificName = `Tên khoa học phải bắt đầu bằng tên chi đã chọn (${genusName})`;
  if (!form.commonName.trim()) errors.commonName = 'Nhập tên thường gọi';
  if (form.description.trim().length < 10) errors.description = 'Mô tả cần ít nhất 10 ký tự';

  const tempError = checkRange(form.tempMin, form.tempMax, 'Nhiệt độ', { lo: -10, hi: 60 });
  if (tempError) errors.tempMin = tempError;
  if (toNumber(form.tempMin) === null) errors.tempMin = errors.tempMin ?? 'Nhập khoảng nhiệt độ';
  const baskError = checkRange(form.baskMin, form.baskMax, 'Điểm sưởi', { lo: 0, hi: 70 });
  if (baskError) errors.baskMin = baskError;
  const humidError = checkRange(form.humidMin, form.humidMax, 'Độ ẩm', { lo: 0, hi: 100 });
  if (humidError) errors.humidMin = humidError;

  if (form.imageURL.trim() && !isHttpUrl(form.imageURL.trim())) errors.imageURL = 'URL ảnh phải bắt đầu bằng http:// hoặc https://';
  if (form.referenceURL.trim() && !isHttpUrl(form.referenceURL.trim())) {
    errors.referenceURL = 'URL tham khảo phải bắt đầu bằng http:// hoặc https://';
  }
  return errors;
}

/** Ghép environmentSpecs đúng định dạng seed để parseEnvironmentSpecs đọc lại được */
function buildEnvironmentSpecs(form: SpeciesFormState): string {
  const parts: string[] = [];
  if (form.tempMin.trim() && form.tempMax.trim()) {
    const bask = form.baskMin.trim() && form.baskMax.trim() ? ` (điểm sưởi ${form.baskMin}-${form.baskMax}°C)` : '';
    parts.push(`Nhiệt độ: ${form.tempMin}-${form.tempMax}°C${bask}`);
  }
  if (form.humidMin.trim() && form.humidMax.trim()) parts.push(`Độ ẩm: ${form.humidMin}-${form.humidMax}%`);
  if (form.habitat.trim()) parts.push(`Môi trường: ${form.habitat.trim()}`);
  return parts.join(', ');
}

export default function AdminSpeciesPage(): React.JSX.Element {
  const { data: speciesData, isLoading, isError, refetch } = useSpeciesList();
  // Đếm từ API công khai (chỉ sản phẩm APPROVED): BIOLOGIST không được gọi hàng đợi kiểm duyệt
  const { data: productPage } = useProducts({ size: PRODUCT_COUNT_PAGE_SIZE });
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const genusQuery = useGenusOptions();
  const createSpeciesMutation = useCreateSpecies();

  const speciesList = useMemo(() => speciesData ?? [], [speciesData]);
  const genusOptions = useMemo(() => genusQuery.data ?? [], [genusQuery.data]);
  const genusById = useMemo(() => new Map(genusOptions.map((g) => [g.id, g])), [genusOptions]);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<'ALL' | 'Bò sát' | 'Lưỡng cư' | 'Cây ăn thịt'>('ALL');
  const [formData, setFormData] = useState<SpeciesFormState>(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  const filteredSpecies = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return speciesList.filter((species) => {
      if (selectedGroup !== 'ALL' && SPECIES_EXTRAS[species.scientificName]?.group !== selectedGroup) return false;
      if (!q) return true;
      return species.scientificName.toLowerCase().includes(q) || species.commonName.toLowerCase().includes(q);
    });
  }, [speciesList, selectedGroup, searchQuery]);

  const productCountBySpecies = useMemo(() => {
    const map = new Map<number, number>();
    (productPage?.items ?? []).forEach((p) => map.set(p.speciesId, (map.get(p.speciesId) ?? 0) + 1));
    return map;
  }, [productPage]);

  const previewSpecs = parseEnvironmentSpecs(buildEnvironmentSpecs(formData));
  const humidMin = toNumber(formData.humidMin);
  const humidMax = toNumber(formData.humidMax);
  const selectedGenus = genusById.get(Number(formData.nodeId));

  const updateField = <K extends keyof SpeciesFormState>(key: K, value: SpeciesFormState[K]) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    if (formErrors[key]) setFormErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const handleOpenChange = (open: boolean) => {
    setIsSheetOpen(open);
    if (!open) setFormErrors({});
  };

  const handleCreateSpecies = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors = validateForm(formData, selectedGenus?.scientificName);
    setFormErrors(errors);
    if (Object.values(errors).some(Boolean)) {
      toast.error('Vui lòng kiểm tra lại các trường được đánh dấu');
      return;
    }

    // Gửi đúng những gì người dùng nhập, không tự chèn ảnh hay link giả vào DB
    const payload: CreateSpeciesRequest = {
      nodeId: Number(formData.nodeId),
      scientificName: formData.scientificName.trim(),
      commonName: formData.commonName.trim(),
      conservationStatus: formData.conservationStatus,
      environmentSpecs: buildEnvironmentSpecs(formData),
      description: formData.description.trim(),
      imageURL: formData.imageURL.trim(),
      referenceURL: formData.referenceURL.trim(),
    };

    try {
      await createSpeciesMutation.mutateAsync(payload);
      toast.success(`Đã thêm loài "${payload.scientificName}" vào bách khoa`);
      setIsSheetOpen(false);
      setFormData(EMPTY_FORM);
      setFormErrors({});
    } catch (err) {
      toast.error(err instanceof Error && err.message ? err.message : 'Không thêm được loài mới');
    }
  };

  const fieldError = (key: keyof SpeciesFormState) =>
    formErrors[key] ? (
      <p id={`${key}-error`} role="alert" className="mt-1 text-[11px] font-medium text-danger">
        {formErrors[key]}
      </p>
    ) : null;

  const inputClass = (key: keyof SpeciesFormState) =>
    `w-full rounded-xl border bg-bg-deep p-2.5 text-xs text-fg focus:border-accent focus:outline-none ${
      formErrors[key] ? 'border-danger' : 'border-line'
    }`;

  const a11yProps = (key: keyof SpeciesFormState) => ({
    'aria-invalid': Boolean(formErrors[key]),
    'aria-describedby': formErrors[key] ? `${key}-error` : undefined,
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* 1. Header Trang */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-line pb-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-ocean/30 bg-ocean/10 px-3 py-1 text-xs font-semibold text-ocean mb-1.5">
            <BookOpen className="size-3.5" aria-hidden="true" />
            <span>Danh mục khoa học và phả hệ 6 cấp</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-fg font-sans">Quản trị Bách khoa Toàn thư Loài</h1>
          <p className="text-xs md:text-sm text-fg-3">Chuẩn hóa danh pháp, thông số môi trường sống và mức bảo tồn IUCN.</p>
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

      {/* 2. Thanh lọc & tìm kiếm */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface/80 backdrop-blur-xl p-4 rounded-2xl border border-line">
        <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Lọc theo nhóm sinh học">
          {[
            { id: 'ALL', label: `Tất cả loài (${speciesList.length})` },
            { id: 'Bò sát', label: 'Bò sát' },
            { id: 'Lưỡng cư', label: 'Lưỡng cư' },
            { id: 'Cây ăn thịt', label: 'Cây ăn thịt' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              aria-pressed={selectedGroup === tab.id}
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

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-fg-3" aria-hidden="true" />
          <input
            type="search"
            aria-label="Tìm loài"
            placeholder="Tìm theo tên khoa học, tên gọi..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-line bg-bg-deep/60 pl-9 pr-4 py-2 text-xs text-fg placeholder:text-fg-3 focus:border-accent focus:outline-none"
          />
        </div>
      </div>

      {/* 3. Bảng danh mục loài */}
      <div className="rounded-2xl border border-line bg-surface/90 backdrop-blur-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <caption className="sr-only">Danh mục loài trong bách khoa</caption>
            <thead>
              <tr className="border-b border-line/80 bg-surface-2/60 text-fg-3 uppercase text-[11px] tracking-wider">
                <th scope="col" className="py-3.5 px-4">Loài sinh vật</th>
                <th scope="col" className="py-3.5 px-4">Chi</th>
                <th scope="col" className="py-3.5 px-4">Bảo tồn IUCN</th>
                <th scope="col" className="py-3.5 px-4">Đang bán trên sàn</th>
                <th scope="col" className="py-3.5 px-4">Môi trường sống</th>
                <th scope="col" className="py-3.5 px-4 text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line/40">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-accent text-xs" role="status">
                    Đang nạp danh mục khoa học...
                  </td>
                </tr>
              ) : isError ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-xs text-danger">
                    <div role="alert" className="space-y-3">
                      <p>Không tải được danh mục loài.</p>
                      <button
                        type="button"
                        onClick={() => void refetch()}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-danger/40 px-3 py-1.5 font-semibold hover:bg-danger/15"
                      >
                        <RotateCw className="size-3.5" aria-hidden="true" />
                        <span>Thử lại</span>
                      </button>
                    </div>
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
                  const thumbSrc = photo?.sources.webp[0]?.src || photo?.sources.jpg || sp.heroPhoto;
                  const prodCount = productCountBySpecies.get(sp.id) ?? 0;
                  const genus = genusById.get(sp.nodeId);

                  return (
                    <tr key={sp.id} className="hover:bg-surface-hover/80 transition-colors group">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="size-12 rounded-xl overflow-hidden bg-bg-raised shrink-0 border border-line">
                            <img
                              src={thumbSrc}
                              alt={sp.displayName || sp.commonName}
                              className="size-full object-cover group-hover:scale-105 transition-transform duration-300"
                              loading="lazy"
                            />
                          </div>
                          <div>
                            <p className="font-serif italic font-semibold text-accent text-sm">{sp.scientificName}</p>
                            <p className="text-xs text-fg font-medium mt-0.5">{sp.commonName}</p>
                            <span className="text-[11px] text-fg-3 font-mono">Mã #{sp.id}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        {genus ? (
                          <div>
                            <p className="font-serif italic font-semibold text-fg">{genus.scientificName}</p>
                            <p className="text-[11px] text-fg-3">{genus.commonName}</p>
                          </div>
                        ) : (
                          <span className="text-fg-3">{genusQuery.isLoading ? 'Đang tải...' : 'Chưa rõ'}</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <IucnBadge code={sp.conservationStatus} size="sm" />
                      </td>

                      <td className="py-3.5 px-4 font-mono">
                        {prodCount > 0 ? (
                          <span className="inline-flex items-center gap-1.5 text-success font-semibold">
                            <span className="size-2 rounded-full bg-success" aria-hidden="true" />
                            <span>{prodCount} sản phẩm</span>
                          </span>
                        ) : (
                          <span className="text-fg-3">Chưa có bài bán</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 max-w-xs">
                        <p className="text-fg-2 truncate text-[11px]" title={sp.environmentSpecs}>
                          {sp.environmentSpecs}
                        </p>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {sp.referenceURL && (
                            <a
                              href={sp.referenceURL}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="rounded-lg border border-line bg-surface p-1.5 text-fg-3 hover:text-ocean hover:border-ocean/40 transition-colors"
                              aria-label={`Tra cứu ${sp.scientificName} trên GBIF (mở thẻ mới)`}
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

      {/* 4. Sheet thêm loài: Radix Dialog đặt sát phải (giữ focus, Esc để đóng, trả focus về nút mở) */}
      <Dialog open={isSheetOpen} onOpenChange={handleOpenChange}>
        <DialogContent className="left-auto right-0 top-0 h-full max-h-screen w-full max-w-xl translate-x-0 translate-y-0 overflow-y-auto rounded-none border-y-0 border-r-0 data-[state=closed]:zoom-out-100 data-[state=open]:zoom-in-100">
          <DialogHeader>
            <div className="flex items-center gap-2 border-b border-line pb-4 pr-8">
              <div className="rounded-xl border border-accent/40 bg-accent/10 p-2 text-accent">
                <Leaf className="size-4" aria-hidden="true" />
              </div>
              <div>
                <DialogTitle className="text-lg font-bold text-fg tracking-tight">Thêm hồ sơ loài mới</DialogTitle>
                <DialogDescription className="text-xs text-fg-3">
                  Gắn loài vào một chi (cấp GENUS) và nhập thông số môi trường sống.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <form onSubmit={handleCreateSpecies} className="space-y-6 my-6 text-xs" noValidate>
            {/* Phần 1: Định danh */}
            <fieldset className="space-y-3 rounded-xl border border-line/60 bg-surface/50 p-4">
              <legend className="px-1 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 text-accent">
                <BookOpen className="size-3.5" aria-hidden="true" />
                <span>Phần 1: Định danh và phân loại</span>
              </legend>

              <div>
                <label htmlFor="nodeId" className="text-fg-3 block mb-1">
                  Chi (cấp GENUS)
                </label>
                <select
                  id="nodeId"
                  value={formData.nodeId}
                  onChange={(e) => updateField('nodeId', e.target.value)}
                  disabled={genusQuery.isLoading}
                  className={inputClass('nodeId')}
                  {...a11yProps('nodeId')}
                >
                  <option value="">{genusQuery.isLoading ? 'Đang tải danh sách chi...' : '-- Chọn chi --'}</option>
                  {genusOptions.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.scientificName} ({g.commonName})
                    </option>
                  ))}
                </select>
                {genusQuery.isError && (
                  <p role="alert" className="mt-1 text-[11px] text-danger">
                    Không tải được danh sách chi.{' '}
                    <button type="button" onClick={() => void genusQuery.refetch()} className="underline font-semibold">
                      Thử lại
                    </button>
                  </p>
                )}
                {selectedGenus?.lineage && <p className="text-[11px] text-fg-3 mt-1">{selectedGenus.lineage}</p>}
                {fieldError('nodeId')}
              </div>

              <div>
                <label htmlFor="scientificName" className="text-fg-3 block mb-1">
                  Tên khoa học
                </label>
                <input
                  id="scientificName"
                  type="text"
                  placeholder="Ví dụ: Pogona barbata"
                  value={formData.scientificName}
                  onChange={(e) => updateField('scientificName', e.target.value)}
                  className={`${inputClass('scientificName')} font-serif italic`}
                  {...a11yProps('scientificName')}
                />
                {fieldError('scientificName')}
              </div>

              <div>
                <label htmlFor="commonName" className="text-fg-3 block mb-1">
                  Tên thường gọi (tên tiếng Việt, có thể kèm tên tiếng Anh trong ngoặc)
                </label>
                <input
                  id="commonName"
                  type="text"
                  placeholder="Ví dụ: Rồng râu phương Đông (Eastern Bearded Dragon)"
                  value={formData.commonName}
                  onChange={(e) => updateField('commonName', e.target.value)}
                  className={inputClass('commonName')}
                  {...a11yProps('commonName')}
                />
                {fieldError('commonName')}
              </div>

              <div>
                <label htmlFor="conservationStatus" className="text-fg-3 block mb-1">
                  Mức bảo tồn IUCN
                </label>
                <select
                  id="conservationStatus"
                  value={formData.conservationStatus}
                  onChange={(e) => updateField('conservationStatus', e.target.value as ConservationStatus)}
                  className={inputClass('conservationStatus')}
                >
                  {IUCN_OPTIONS.map((opt) => (
                    <option key={opt.status} value={opt.status}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </fieldset>

            {/* Phần 2: Môi trường sống */}
            <fieldset className="space-y-3 rounded-xl border border-line/60 bg-surface/50 p-4">
              <legend className="px-1 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 text-accent">
                <Thermometer className="size-3.5" aria-hidden="true" />
                <span>Phần 2: Môi trường sống</span>
              </legend>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="tempMin" className="text-fg-3 block mb-1">Nhiệt độ thấp nhất (°C)</label>
                  <input id="tempMin" type="number" inputMode="decimal" value={formData.tempMin} onChange={(e) => updateField('tempMin', e.target.value)} className={inputClass('tempMin')} {...a11yProps('tempMin')} />
                </div>
                <div>
                  <label htmlFor="tempMax" className="text-fg-3 block mb-1">Nhiệt độ cao nhất (°C)</label>
                  <input id="tempMax" type="number" inputMode="decimal" value={formData.tempMax} onChange={(e) => updateField('tempMax', e.target.value)} className={inputClass('tempMin')} />
                </div>
              </div>
              {fieldError('tempMin')}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="baskMin" className="text-fg-3 block mb-1">Điểm sưởi thấp nhất (°C, tùy chọn)</label>
                  <input id="baskMin" type="number" inputMode="decimal" value={formData.baskMin} onChange={(e) => updateField('baskMin', e.target.value)} className={inputClass('baskMin')} {...a11yProps('baskMin')} />
                </div>
                <div>
                  <label htmlFor="baskMax" className="text-fg-3 block mb-1">Điểm sưởi cao nhất (°C, tùy chọn)</label>
                  <input id="baskMax" type="number" inputMode="decimal" value={formData.baskMax} onChange={(e) => updateField('baskMax', e.target.value)} className={inputClass('baskMin')} />
                </div>
              </div>
              {fieldError('baskMin')}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="humidMin" className="text-fg-3 block mb-1">Độ ẩm thấp nhất (%, tùy chọn)</label>
                  <input id="humidMin" type="number" inputMode="decimal" min={0} max={100} value={formData.humidMin} onChange={(e) => updateField('humidMin', e.target.value)} className={inputClass('humidMin')} {...a11yProps('humidMin')} />
                </div>
                <div>
                  <label htmlFor="humidMax" className="text-fg-3 block mb-1">Độ ẩm cao nhất (%, tùy chọn)</label>
                  <input id="humidMax" type="number" inputMode="decimal" min={0} max={100} value={formData.humidMax} onChange={(e) => updateField('humidMax', e.target.value)} className={inputClass('humidMin')} />
                </div>
              </div>
              {fieldError('humidMin')}

              <div>
                <label htmlFor="habitat" className="text-fg-3 block mb-1">Môi trường sống tự nhiên (tùy chọn)</label>
                <input
                  id="habitat"
                  type="text"
                  placeholder="Ví dụ: Rừng mây nhiệt đới độ cao 1.800 m"
                  value={formData.habitat}
                  onChange={(e) => updateField('habitat', e.target.value)}
                  className={inputClass('habitat')}
                />
              </div>

              <div className="pt-2 border-t border-line/30 space-y-2">
                <span className="text-fg-3 block text-[11px]">Xem trước:</span>
                <p className="text-[11px] text-fg-2 font-mono break-words">{buildEnvironmentSpecs(formData) || 'Chưa có thông số'}</p>
                <ClimateBar specs={previewSpecs} />
                {humidMin !== null && humidMax !== null && !Number.isNaN(humidMin) && !Number.isNaN(humidMax) && (
                  <div className="flex justify-center">
                    <HumidityGauge humidMin={humidMin} humidMax={humidMax} className="w-full max-w-xs" />
                  </div>
                )}
              </div>
            </fieldset>

            {/* Phần 3: Mô tả */}
            <fieldset className="space-y-3 rounded-xl border border-line/60 bg-surface/50 p-4">
              <legend className="px-1 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 text-accent">
                <FileCheck2 className="size-3.5" aria-hidden="true" />
                <span>Phần 3: Mô tả sinh học</span>
              </legend>
              <div>
                <label htmlFor="description" className="text-fg-3 block mb-1">Mô tả</label>
                <textarea
                  id="description"
                  rows={4}
                  value={formData.description}
                  onChange={(e) => updateField('description', e.target.value)}
                  placeholder="Đặc điểm hình thái, tập tính kiếm ăn và sinh sản..."
                  className={`${inputClass('description')} placeholder:text-fg-3`}
                  {...a11yProps('description')}
                />
                {fieldError('description')}
              </div>
            </fieldset>

            {/* Phần 4: Ảnh và tham chiếu */}
            <fieldset className="space-y-3 rounded-xl border border-line/60 bg-surface/50 p-4">
              <legend className="px-1 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 text-accent">
                <Sparkles className="size-3.5" aria-hidden="true" />
                <span>Phần 4: Ảnh và tham chiếu khoa học</span>
              </legend>

              <div>
                <label htmlFor="imageURL" className="text-fg-3 block mb-1">URL ảnh đại diện (tùy chọn, ảnh có giấy phép tự do)</label>
                <input
                  id="imageURL"
                  type="url"
                  placeholder="https://upload.wikimedia.org/..."
                  value={formData.imageURL}
                  onChange={(e) => updateField('imageURL', e.target.value)}
                  className={inputClass('imageURL')}
                  {...a11yProps('imageURL')}
                />
                {fieldError('imageURL')}
              </div>

              <div>
                <label htmlFor="referenceURL" className="text-fg-3 block mb-1">URL tham khảo khoa học (GBIF hoặc IUCN, tùy chọn)</label>
                <input
                  id="referenceURL"
                  type="url"
                  placeholder="https://www.gbif.org/species/..."
                  value={formData.referenceURL}
                  onChange={(e) => updateField('referenceURL', e.target.value)}
                  className={inputClass('referenceURL')}
                  {...a11yProps('referenceURL')}
                />
                {fieldError('referenceURL')}
              </div>
            </fieldset>

            <div className="pt-4 border-t border-line flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => handleOpenChange(false)}
                className="rounded-xl border border-line px-4 py-2 text-xs font-semibold text-fg-3 hover:text-fg"
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                disabled={createSpeciesMutation.isPending}
                className="rounded-xl bg-accent px-5 py-2.5 text-xs font-semibold text-accent-ink hover:opacity-90 shadow-[var(--glow-accent-btn)] disabled:opacity-50"
              >
                {createSpeciesMutation.isPending ? 'Đang lưu...' : 'Lưu hồ sơ loài mới'}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
