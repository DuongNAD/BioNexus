import React, { useMemo, useState } from 'react';
import { Link } from 'react-router';
import { toast } from 'sonner';
import { ExternalLink, Plus } from 'lucide-react';
import { useSpeciesList } from '@/api/queries/useSpeciesQueries';
import { useAllApprovedProducts } from '@/api/queries/useProductQueries';
import { useGenusOptions } from '@/api/queries/useAdminQueries';
import { useCreateSpecies } from '@/api/mutations/useAdminMutations';
import { Eyebrow, PageContainer, PageHeader, Panel } from '@/components/layout/Page';
import { QueryErrorState } from '@/components/domain/QueryErrorState';
import { Button } from '@/components/ui/Button';
import { IucnBadge } from '@/components/ui/IucnBadge';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { Skeleton } from '@/components/ui/Skeleton';
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
import { QueueSearch, RangeLine, fieldClass } from './components/AdminKit';
import type { ConservationStatus, CreateSpeciesRequest } from '@/types/api';
import type { SpeciesGroup } from '@/api/adapters';

type GroupFilter = 'ALL' | Exclude<SpeciesGroup, 'Khác'>;

const GROUP_OPTIONS: { value: GroupFilter; label: string }[] = [
  { value: 'ALL', label: 'Tất cả' },
  { value: 'Bò sát', label: 'Bò sát' },
  { value: 'Lưỡng cư', label: 'Lưỡng cư' },
  { value: 'Cá cảnh', label: 'Cá cảnh' },
  { value: 'Động vật không xương sống', label: 'Không xương sống' },
  { value: 'Chim', label: 'Chim' },
  { value: 'Thú', label: 'Thú' },
  { value: 'Cây ăn thịt', label: 'Cây ăn thịt' },
  { value: 'Cây cảnh', label: 'Cây cảnh' },
];

// Hơn 600 loài: bảng hiện từng đợt để không dựng cả nghìn dòng một lúc
const ROWS_STEP = 50;

const IUCN_OPTIONS: { status: ConservationStatus; label: string }[] = [
  { status: 'LC', label: 'LC — Ít quan tâm' },
  { status: 'NT', label: 'NT — Sắp bị đe dọa' },
  { status: 'VU', label: 'VU — Sắp nguy cấp' },
  { status: 'EN', label: 'EN — Nguy cấp' },
  { status: 'CR', label: 'CR — Cực kỳ nguy cấp' },
  { status: 'EW', label: 'EW — Tuyệt chủng ngoài tự nhiên' },
  { status: 'EX', label: 'EX — Tuyệt chủng' },
];


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
  const { data: approvedProducts } = useAllApprovedProducts();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const genusQuery = useGenusOptions();
  const createSpeciesMutation = useCreateSpecies();

  const speciesList = useMemo(() => speciesData ?? [], [speciesData]);
  const genusOptions = useMemo(() => genusQuery.data ?? [], [genusQuery.data]);
  const genusById = useMemo(() => new Map(genusOptions.map((g) => [g.id, g])), [genusOptions]);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<GroupFilter>('ALL');
  const [formData, setFormData] = useState<SpeciesFormState>(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  const filteredSpecies = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return speciesList.filter((species) => {
      if (selectedGroup !== 'ALL' && species.group !== selectedGroup) return false;
      if (!q) return true;
      return species.scientificName.toLowerCase().includes(q) || species.commonName.toLowerCase().includes(q);
    });
  }, [speciesList, selectedGroup, searchQuery]);

  const productCountBySpecies = useMemo(() => {
    const map = new Map<number, number>();
    (approvedProducts ?? []).forEach((p) => map.set(p.speciesId, (map.get(p.speciesId) ?? 0) + 1));
    return map;
  }, [approvedProducts]);

  // Đổi bộ lọc thì quay về đợt đầu
  const filterKey = `${selectedGroup}|${searchQuery}`;
  const [paging, setPaging] = useState({ key: filterKey, count: ROWS_STEP });
  const visibleCount = paging.key === filterKey ? paging.count : ROWS_STEP;
  const visibleSpecies = filteredSpecies.slice(0, visibleCount);

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
      <p id={`${key}-error`} role="alert" className="mt-1.5 text-sm font-medium text-danger">
        {formErrors[key]}
      </p>
    ) : null;

  const a11yProps = (key: keyof SpeciesFormState) => ({
    'aria-invalid': Boolean(formErrors[key]),
    'aria-describedby': formErrors[key] ? `${key}-error` : undefined,
  });

  const thumbOf = (scientificName: string, fallback: string) => {
    const extra = SPECIES_EXTRAS[scientificName];
    const photo = extra?.heroPhotoId ? PHOTOS[extra.heroPhotoId] : undefined;
    return photo?.sources.webp[0]?.src || photo?.sources.jpg || fallback;
  };

  const tempMinNum = toNumber(formData.tempMin);
  const tempMaxNum = toNumber(formData.tempMax);

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Quản trị · Bách khoa"
        title="Quản lý loài"
        description="Danh mục loài trong bách khoa: danh pháp, chi, mức bảo tồn IUCN và số cá thể đang bán."
        actions={
          <Button pill onClick={() => setIsSheetOpen(true)} leftIcon={<Plus className="size-4" aria-hidden="true" />}>
            Thêm loài mới
          </Button>
        }
      />

      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
          <SegmentedControl className="w-max" label="Lọc theo nhóm sinh học" value={selectedGroup} onChange={setSelectedGroup} options={GROUP_OPTIONS} />
        </div>
        <QueueSearch value={searchQuery} onChange={setSearchQuery} label="Tìm loài" placeholder="Tìm theo tên loài" />
      </div>

      {isError ? (
        <QueryErrorState title="Không tải được danh mục loài" onRetry={() => void refetch?.()} />
      ) : (
        <Panel padded={false} className="mb-16 overflow-hidden">
          {isLoading ? (
            <div className="space-y-px p-2" role="status" aria-label="Đang tải danh mục loài">
              {Array.from({ length: 5 }, (_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : filteredSpecies.length === 0 ? (
            <p className="px-5 py-12 text-center text-sm text-fg-2">Không tìm thấy loài nào phù hợp.</p>
          ) : (
            <>
              {/* Desktop: bảng; mobile: danh sách xếp chồng để không tràn ngang */}
              <table className="hidden w-full text-left text-sm md:table">
                <caption className="sr-only">Danh mục loài trong bách khoa</caption>
                <thead>
                  <tr className="border-b border-line text-sm text-fg-3">
                    <th scope="col" className="px-5 py-3.5 font-medium">Loài</th>
                    <th scope="col" className="px-5 py-3.5 font-medium">Chi</th>
                    <th scope="col" className="px-5 py-3.5 font-medium">IUCN</th>
                    <th scope="col" className="px-5 py-3.5 font-medium">Đang bán</th>
                    <th scope="col" className="px-5 py-3.5 text-right font-medium">
                      <span className="sr-only">Liên kết</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {visibleSpecies.map((sp) => {
                    const prodCount = productCountBySpecies.get(sp.id) ?? 0;
                    const genus = genusById.get(sp.nodeId);
                    return (
                      <tr key={sp.id} className="transition-colors hover:bg-surface-hover">
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            <img src={thumbOf(sp.scientificName, sp.cardPhoto)} alt="" className="size-12 shrink-0 rounded-xl object-cover" loading="lazy" />
                            <div className="min-w-0">
                              <p className="truncate font-medium text-fg">{sp.displayName || sp.commonName}</p>
                              <p className="truncate font-serif text-[15px] text-fg-3 italic">{sp.scientificName}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3">
                          {genus ? (
                            <i className="font-serif text-[15px] text-fg-2">{genus.scientificName}</i>
                          ) : (
                            <span className="text-fg-3">{genusQuery.isLoading ? 'Đang tải' : 'Chưa rõ'}</span>
                          )}
                        </td>
                        <td className="px-5 py-3">
                          <IucnBadge code={sp.conservationStatus} size="sm" />
                        </td>
                        <td className="px-5 py-3 font-mono text-fg-2">{prodCount > 0 ? prodCount : '—'}</td>
                        <td className="px-5 py-3">
                          <div className="flex items-center justify-end gap-1">
                            {sp.referenceURL && (
                              <a
                                href={sp.referenceURL}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex size-9 items-center justify-center rounded-full text-fg-3 transition-colors hover:bg-surface-hover hover:text-accent"
                                aria-label={`Tra cứu ${sp.scientificName} trên GBIF (mở thẻ mới)`}
                              >
                                <ExternalLink className="size-4" aria-hidden="true" />
                              </a>
                            )}
                            <Link to={`/species/${sp.id}`} className="rounded-full px-3 py-1.5 text-sm font-medium text-accent hover:bg-accent/10">
                              Hồ sơ
                            </Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              <ul className="divide-y divide-line md:hidden">
                {visibleSpecies.map((sp) => {
                  const prodCount = productCountBySpecies.get(sp.id) ?? 0;
                  return (
                    <li key={sp.id}>
                      <Link to={`/species/${sp.id}`} className="flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-surface-hover">
                        <img src={thumbOf(sp.scientificName, sp.cardPhoto)} alt="" className="size-12 shrink-0 rounded-xl object-cover" loading="lazy" />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate font-medium text-fg">{sp.displayName || sp.commonName}</span>
                          <span className="block truncate font-serif text-[15px] text-fg-3 italic">{sp.scientificName}</span>
                          <span className="mt-1 block text-sm text-fg-3">
                            {prodCount > 0 ? `${prodCount} đang bán` : 'Chưa có cá thể đang bán'}
                          </span>
                        </span>
                        <IucnBadge code={sp.conservationStatus} size="sm" showLabel={false} />
                      </Link>
                    </li>
                  );
                })}
              </ul>
              <div className="flex flex-col items-center gap-3 border-t border-line px-5 py-5">
                <p className="text-sm text-fg-2" aria-live="polite">
                  Đang hiện <span className="font-mono text-fg">{visibleSpecies.length}</span> /{' '}
                  <span className="font-mono text-fg">{filteredSpecies.length}</span> loài
                </p>
                {visibleSpecies.length < filteredSpecies.length && (
                  <Button variant="secondary" pill onClick={() => setPaging({ key: filterKey, count: visibleCount + ROWS_STEP })}>
                    Xem thêm {Math.min(ROWS_STEP, filteredSpecies.length - visibleSpecies.length)} loài
                  </Button>
                )}
              </div>
            </>
          )}
        </Panel>
      )}

      {/* Thêm loài: Radix Dialog đặt sát phải (giữ focus, Esc để đóng, trả focus về nút mở) */}
      <Dialog open={isSheetOpen} onOpenChange={handleOpenChange}>
        <DialogContent className="top-0 right-0 left-auto h-full max-h-screen w-full max-w-xl translate-x-0 translate-y-0 rounded-none border-y-0 border-r-0 data-[state=closed]:zoom-out-100 data-[state=open]:zoom-in-100 sm:rounded-l-[20px]">
          <DialogHeader>
            <DialogTitle>Thêm loài mới</DialogTitle>
            <DialogDescription>Gắn loài vào một chi và nhập điều kiện sống. Các trường tùy chọn có thể bỏ trống.</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateSpecies} className="mt-6 space-y-8" noValidate>
            <fieldset className="space-y-4">
              <legend className="sr-only">Định danh</legend>
              <Eyebrow tone="muted">Định danh</Eyebrow>

              <div>
                <label htmlFor="nodeId" className="mb-1.5 block text-sm text-fg-2">Chi</label>
                <select
                  id="nodeId"
                  value={formData.nodeId}
                  onChange={(e) => updateField('nodeId', e.target.value)}
                  disabled={genusQuery.isLoading}
                  className={fieldClass(!!formErrors.nodeId)}
                  {...a11yProps('nodeId')}
                >
                  <option value="">{genusQuery.isLoading ? 'Đang tải danh sách chi...' : 'Chọn chi'}</option>
                  {genusOptions.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.scientificName} ({g.commonName})
                    </option>
                  ))}
                </select>
                {genusQuery.isError && (
                  <p role="alert" className="mt-1.5 text-sm text-danger">
                    Không tải được danh sách chi.{' '}
                    <button type="button" onClick={() => void genusQuery.refetch()} className="font-semibold underline">
                      Thử lại
                    </button>
                  </p>
                )}
                {selectedGenus?.lineage && <p className="mt-1.5 text-sm text-fg-3">{selectedGenus.lineage}</p>}
                {fieldError('nodeId')}
              </div>

              <div>
                <label htmlFor="scientificName" className="mb-1.5 block text-sm text-fg-2">Tên khoa học</label>
                <input
                  id="scientificName"
                  type="text"
                  placeholder="Ví dụ: Pogona barbata"
                  value={formData.scientificName}
                  onChange={(e) => updateField('scientificName', e.target.value)}
                  className={`${fieldClass(!!formErrors.scientificName)} font-serif text-base italic`}
                  {...a11yProps('scientificName')}
                />
                {fieldError('scientificName')}
              </div>

              <div>
                <label htmlFor="commonName" className="mb-1.5 block text-sm text-fg-2">Tên thường gọi</label>
                <input
                  id="commonName"
                  type="text"
                  placeholder="Ví dụ: Rồng râu phương Đông (Eastern Bearded Dragon)"
                  value={formData.commonName}
                  onChange={(e) => updateField('commonName', e.target.value)}
                  className={fieldClass(!!formErrors.commonName)}
                  {...a11yProps('commonName')}
                />
                {fieldError('commonName')}
              </div>

              <div>
                <label htmlFor="conservationStatus" className="mb-1.5 block text-sm text-fg-2">Mức bảo tồn IUCN</label>
                <select
                  id="conservationStatus"
                  value={formData.conservationStatus}
                  onChange={(e) => updateField('conservationStatus', e.target.value as ConservationStatus)}
                  className={fieldClass()}
                >
                  {IUCN_OPTIONS.map((opt) => (
                    <option key={opt.status} value={opt.status}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </fieldset>

            <fieldset className="space-y-4 border-t border-line pt-6">
              <legend className="sr-only">Điều kiện sống</legend>
              <Eyebrow tone="muted">Điều kiện sống</Eyebrow>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="tempMin" className="mb-1.5 block text-sm text-fg-2">Nhiệt độ thấp nhất (°C)</label>
                  <input id="tempMin" type="number" inputMode="decimal" value={formData.tempMin} onChange={(e) => updateField('tempMin', e.target.value)} className={fieldClass(!!formErrors.tempMin)} {...a11yProps('tempMin')} />
                </div>
                <div>
                  <label htmlFor="tempMax" className="mb-1.5 block text-sm text-fg-2">Nhiệt độ cao nhất (°C)</label>
                  <input id="tempMax" type="number" inputMode="decimal" value={formData.tempMax} onChange={(e) => updateField('tempMax', e.target.value)} className={fieldClass(!!formErrors.tempMin)} />
                </div>
              </div>
              {fieldError('tempMin')}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="baskMin" className="mb-1.5 block text-sm text-fg-2">Điểm sưởi thấp nhất (°C)</label>
                  <input id="baskMin" type="number" inputMode="decimal" placeholder="Tùy chọn" value={formData.baskMin} onChange={(e) => updateField('baskMin', e.target.value)} className={fieldClass(!!formErrors.baskMin)} {...a11yProps('baskMin')} />
                </div>
                <div>
                  <label htmlFor="baskMax" className="mb-1.5 block text-sm text-fg-2">Điểm sưởi cao nhất (°C)</label>
                  <input id="baskMax" type="number" inputMode="decimal" placeholder="Tùy chọn" value={formData.baskMax} onChange={(e) => updateField('baskMax', e.target.value)} className={fieldClass(!!formErrors.baskMin)} />
                </div>
              </div>
              {fieldError('baskMin')}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="humidMin" className="mb-1.5 block text-sm text-fg-2">Độ ẩm thấp nhất (%)</label>
                  <input id="humidMin" type="number" inputMode="decimal" min={0} max={100} placeholder="Tùy chọn" value={formData.humidMin} onChange={(e) => updateField('humidMin', e.target.value)} className={fieldClass(!!formErrors.humidMin)} {...a11yProps('humidMin')} />
                </div>
                <div>
                  <label htmlFor="humidMax" className="mb-1.5 block text-sm text-fg-2">Độ ẩm cao nhất (%)</label>
                  <input id="humidMax" type="number" inputMode="decimal" min={0} max={100} placeholder="Tùy chọn" value={formData.humidMax} onChange={(e) => updateField('humidMax', e.target.value)} className={fieldClass(!!formErrors.humidMin)} />
                </div>
              </div>
              {fieldError('humidMin')}

              <div>
                <label htmlFor="habitat" className="mb-1.5 block text-sm text-fg-2">Môi trường sống tự nhiên (tùy chọn)</label>
                <input
                  id="habitat"
                  type="text"
                  placeholder="Ví dụ: Rừng mây nhiệt đới độ cao 1.800 m"
                  value={formData.habitat}
                  onChange={(e) => updateField('habitat', e.target.value)}
                  className={fieldClass()}
                />
              </div>

              <div className="space-y-3 border-l-2 border-accent/40 pl-4">
                <p className="text-sm text-fg-3">Xem trước</p>
                <p className="font-mono text-sm break-words text-fg-2">{buildEnvironmentSpecs(formData) || 'Chưa có thông số'}</p>
                {tempMinNum !== null && tempMaxNum !== null && !Number.isNaN(tempMinNum) && !Number.isNaN(tempMaxNum) && tempMinNum <= tempMaxNum && (
                  <RangeLine label="Nhiệt độ" min={tempMinNum} max={tempMaxNum} unit="°C" scaleMin={0} scaleMax={45} color="var(--warm)" />
                )}
                {humidMin !== null && humidMax !== null && !Number.isNaN(humidMin) && !Number.isNaN(humidMax) && humidMin <= humidMax && (
                  <RangeLine label="Độ ẩm" min={humidMin} max={humidMax} unit="%" scaleMin={0} scaleMax={100} color="var(--ocean)" />
                )}
                {previewSpecs.habitat && <p className="text-sm text-fg-2">Môi trường: {previewSpecs.habitat}</p>}
              </div>
            </fieldset>

            <fieldset className="space-y-4 border-t border-line pt-6">
              <legend className="sr-only">Mô tả và tham chiếu</legend>
              <Eyebrow tone="muted">Mô tả và tham chiếu</Eyebrow>
              <div>
                <label htmlFor="description" className="mb-1.5 block text-sm text-fg-2">Mô tả</label>
                <textarea
                  id="description"
                  rows={4}
                  value={formData.description}
                  onChange={(e) => updateField('description', e.target.value)}
                  placeholder="Đặc điểm hình thái, tập tính kiếm ăn và sinh sản..."
                  className={`${fieldClass(!!formErrors.description)} h-auto py-3`}
                  {...a11yProps('description')}
                />
                {fieldError('description')}
              </div>

              <div>
                <label htmlFor="imageURL" className="mb-1.5 block text-sm text-fg-2">URL ảnh đại diện (tùy chọn, ảnh có giấy phép tự do)</label>
                <input
                  id="imageURL"
                  type="url"
                  placeholder="https://upload.wikimedia.org/..."
                  value={formData.imageURL}
                  onChange={(e) => updateField('imageURL', e.target.value)}
                  className={fieldClass(!!formErrors.imageURL)}
                  {...a11yProps('imageURL')}
                />
                {fieldError('imageURL')}
              </div>

              <div>
                <label htmlFor="referenceURL" className="mb-1.5 block text-sm text-fg-2">URL tham khảo GBIF hoặc IUCN (tùy chọn)</label>
                <input
                  id="referenceURL"
                  type="url"
                  placeholder="https://www.gbif.org/species/..."
                  value={formData.referenceURL}
                  onChange={(e) => updateField('referenceURL', e.target.value)}
                  className={fieldClass(!!formErrors.referenceURL)}
                  {...a11yProps('referenceURL')}
                />
                {fieldError('referenceURL')}
              </div>
            </fieldset>

            <div className="flex items-center justify-end gap-3 border-t border-line pt-6">
              <Button variant="ghost" pill onClick={() => handleOpenChange(false)}>
                Hủy
              </Button>
              <Button type="submit" pill isLoading={createSpeciesMutation.isPending}>
                Lưu loài mới
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}
