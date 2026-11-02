import type { ConservationStatus, SpeciesDto } from '@/types/api';
import { parseEnvironmentSpecs, type ParsedEnvironmentSpecs } from '@/lib/parseEnvironmentSpecs';
import { TRIP_PHOTOS } from './photos';

export interface JourneyChapter {
  n: string;
  title: string;
  range: string;
  place: string;
  entry: string;
  stations: string[];
}

export interface JourneyLeg {
  chapter: string;
  day: string;
  stop?: string;
  slug?: string;
  scientificName?: string;
  place: string;
  ll: readonly [number, number];
  tz: string;
  alt: string;
}

export interface JourneyFlight {
  chapter: string;
  a: number;
  tz: string;
  from: { code: string; city: string; ll: readonly [number, number] };
  to: { code: string; city: string; ll: readonly [number, number] };
}

export interface JourneyRoutePoint {
  id: string;
  slug: string;
  scientificName: string;
  label: string;
  ll: readonly [number, number];
  dx: number;
  dy: number;
  end?: boolean;
}

export interface JourneyTipConfig {
  slug: string;
  scientificName: string;
  n: string;
  t: string;
  d: string;
  cta: string;
  kind:
    | 'species-detail'
    | 'taxonomy'
    | 'iucn-filter'
    | 'quick-search'
    | 'marketplace'
    | 'morphs'
    | 'seller-apply'
    | 'cart'
    | 'orders';
  iucnCode?: ConservationStatus;
}

export interface JourneySpeciesView {
  id: number;
  nodeId: number;
  slug: string;
  name: string;
  sci: string;
  iucn: ConservationStatus;
  temp: string;
  humidity: string;
  habitat: string;
  origin: string;
  desc: string;
  parsedSpecs: ParsedEnvironmentSpecs;
}

export const IUCN_JOURNEY_STYLE: Record<
  ConservationStatus,
  { label: string; dot: string; chip: string }
> = {
  LC: {
    label: 'Ít quan ngại',
    dot: '#4ade80',
    chip: 'text-emerald-300 border-emerald-400/35 bg-emerald-500/12',
  },
  NT: {
    label: 'Sắp bị đe dọa',
    dot: '#a3e635',
    chip: 'text-lime-300 border-lime-400/35 bg-lime-500/12',
  },
  VU: {
    label: 'Sắp nguy cấp',
    dot: '#facc15',
    chip: 'text-amber-200 border-amber-400/35 bg-amber-500/12',
  },
  EN: {
    label: 'Nguy cấp',
    dot: '#fb923c',
    chip: 'text-orange-200 border-orange-400/40 bg-orange-500/15',
  },
  CR: {
    label: 'Cực kỳ nguy cấp',
    dot: '#f87171',
    chip: 'text-red-200 border-red-400/45 bg-red-500/15',
  },
  EW: {
    label: 'Tuyệt chủng ngoài tự nhiên',
    dot: '#9ca3af',
    chip: 'text-gray-200 border-gray-400/35 bg-gray-500/12',
  },
  EX: {
    label: 'Tuyệt chủng',
    dot: '#6b7280',
    chip: 'text-gray-300 border-gray-500/35 bg-gray-600/12',
  },
};

export const JOURNEY_SPECIES_BASE: Record<string, Omit<JourneySpeciesView, 'parsedSpecs'>> = {
  'burmese-python': {
    id: 6,
    nodeId: 20,
    slug: 'burmese-python',
    name: 'Trăn đất',
    sci: 'Python bivittatus',
    iucn: 'VU',
    temp: '26–32°C',
    humidity: '60–80%',
    habitat: 'Rừng nhiệt đới, đầm lầy',
    origin: 'Nam và Đông Nam Á',
    desc: 'Một trong những loài trăn lớn nhất thế giới, bản địa Nam và Đông Nam Á, có ở Việt Nam.',
  },
  'nepenthes-ampullaria': {
    id: 9,
    nodeId: 25,
    slug: 'nepenthes-ampullaria',
    name: 'Nắp ấm Ampullaria',
    sci: 'Nepenthes ampullaria',
    iucn: 'LC',
    temp: '22–32°C',
    humidity: '70–90%',
    habitat: 'Rừng mưa vùng thấp',
    origin: 'Rừng thấp Borneo, Sumatra',
    desc: 'Nắp ấm vùng thấp, túi bẫy tròn mọc thành cụm sát gốc; dễ trồng hơn nhiều loài khác.',
  },
  'nepenthes-rajah': {
    id: 2,
    nodeId: 25,
    slug: 'nepenthes-rajah',
    name: 'Nắp ấm Rajah',
    sci: 'Nepenthes rajah',
    iucn: 'EN',
    temp: '18–26°C ngày, 10–15°C đêm',
    humidity: '80–95%',
    habitat: 'Rừng mây núi cao Borneo',
    origin: 'Núi Kinabalu, Borneo',
    desc: 'Nắp ấm đặc hữu vùng núi Kinabalu và Tambuyukon (Borneo), túi bẫy thuộc hàng lớn nhất trong chi.',
  },
  'venus-flytrap': {
    id: 5,
    nodeId: 26,
    slug: 'venus-flytrap',
    name: 'Cây bắt ruồi Venus',
    sci: 'Dionaea muscipula',
    iucn: 'VU',
    temp: '20–30°C',
    humidity: '50–70%',
    habitat: 'Đầm lầy đất nghèo dinh dưỡng',
    origin: 'Bắc và Nam Carolina (Mỹ)',
    desc: 'Cây ăn thịt với lá bẫy gập lại khi lông cảm ứng bị chạm liên tiếp.',
  },
  axolotl: {
    id: 1,
    nodeId: 24,
    slug: 'axolotl',
    name: 'Axolotl',
    sci: 'Ambystoma mexicanum',
    iucn: 'CR',
    temp: '14–18°C (nước)',
    humidity: 'Thủy sinh',
    habitat: 'Nước ngọt sạch, ít dòng chảy',
    origin: 'Hồ Xochimilco, Mexico',
    desc: 'Kỳ giông thủy sinh đặc hữu hồ Xochimilco (Mexico), giữ mang ngoài suốt đời và có khả năng tái sinh chi.',
  },
  'ball-python': {
    id: 3,
    nodeId: 20,
    slug: 'ball-python',
    name: 'Trăn bóng',
    sci: 'Python regius',
    iucn: 'NT',
    temp: '26–32°C',
    humidity: '50–60%',
    habitat: 'Savan và rừng thưa nhiệt đới',
    origin: 'Tây và Trung Phi',
    desc: 'Loài trăn cỡ nhỏ bản địa Tây và Trung Phi; khi gặp nguy hiểm thường cuộn tròn như quả bóng.',
  },
  'leopard-gecko': {
    id: 4,
    nodeId: 21,
    slug: 'leopard-gecko',
    name: 'Thằn lằn da báo',
    sci: 'Eublepharis macularius',
    iucn: 'LC',
    temp: '26–32°C',
    humidity: '30–40%',
    habitat: 'Bán hoang mạc đá, hoạt động về đêm',
    origin: 'Pakistan, Ấn Độ, Iran',
    desc: 'Thằn lằn ăn côn trùng hoạt động về đêm, có mí mắt động và đuôi tích trữ mỡ.',
  },
  'bearded-dragon': {
    id: 7,
    nodeId: 22,
    slug: 'bearded-dragon',
    name: 'Rồng Úc',
    sci: 'Pogona vitticeps',
    iucn: 'LC',
    temp: '26–32°C (điểm sưởi 38–42°C)',
    humidity: '30–40%',
    habitat: 'Bán hoang mạc, rừng thưa khô',
    origin: 'Miền trung nước Úc',
    desc: 'Thằn lằn bản địa vùng khô hạn nước Úc, hoạt động ban ngày, ăn tạp (côn trùng và rau).',
  },
  'hermann-tortoise': {
    id: 8,
    nodeId: 23,
    slug: 'hermann-tortoise',
    name: 'Rùa Hermann',
    sci: 'Testudo hermanni',
    iucn: 'VU',
    temp: '20–30°C',
    humidity: '40–60%',
    habitat: 'Bụi rậm Địa Trung Hải',
    origin: 'Nam Âu, Địa Trung Hải',
    desc: 'Rùa cạn cỡ nhỏ ở Nam Âu, ăn chủ yếu thực vật, có thể sống nhiều thập kỷ.',
  },
};

export function resolveJourneySpecies(
  slug: string,
  liveSpecies?: SpeciesDto[]
): JourneySpeciesView {
  const base = JOURNEY_SPECIES_BASE[slug] ?? JOURNEY_SPECIES_BASE['axolotl']!;
  const matched = liveSpecies?.find(
    (sp) => sp.scientificName.toLowerCase() === base.sci.toLowerCase()
  );
  const parsedSpecs = parseEnvironmentSpecs(matched?.environmentSpecs ?? `${base.temp}, Độ ẩm: ${base.humidity}`);

  return {
    ...base,
    id: matched?.id ?? base.id,
    nodeId: matched?.nodeId ?? base.nodeId,
    sci: matched?.scientificName ?? base.sci,
    iucn: matched?.conservationStatus ?? base.iucn,
    parsedSpecs,
  };
}

export const CHAPTERS: JourneyChapter[] = [
  {
    n: '01',
    title: 'Rừng mưa Đông Nam Á',
    range: 'Ngày 01–04',
    place: 'Cúc Phương · Cát Tiên · Taman Negara · Borneo',
    entry: 'cua-rung',
    stations: ['tram-1', 'tram-2', 'tram-3'],
  },
  {
    n: '02',
    title: 'Đầm lầy và hồ nước',
    range: 'Ngày 05–06',
    place: 'Bắc Carolina · Xochimilco',
    entry: 'bay-2',
    stations: ['tram-4', 'tram-5'],
  },
  {
    n: '03',
    title: 'Đất khô và savan',
    range: 'Ngày 07–09',
    place: 'Ghana · Balochistan · Trung Úc',
    entry: 'bay-3',
    stations: ['tram-6', 'tram-7', 'tram-8'],
  },
  {
    n: '04',
    title: 'Bụi rậm Địa Trung Hải',
    range: 'Ngày 10',
    place: 'Nam Âu, ven Địa Trung Hải',
    entry: 'bay-4',
    stations: ['tram-9'],
  },
];

export const LEG: Record<string, JourneyLeg> = {
  'cua-rung': {
    chapter: '01',
    day: 'Ngày 01',
    place: 'Vườn quốc gia Cúc Phương, Ninh Bình',
    ll: [20.32, 105.61],
    tz: 'Asia/Ho_Chi_Minh',
    alt: '390 m',
  },
  'tram-1': {
    chapter: '01',
    day: 'Ngày 01',
    stop: 'Trạm 01',
    slug: 'burmese-python',
    scientificName: 'Python bivittatus',
    place: 'Vườn quốc gia Cát Tiên, Đồng Nai',
    ll: [11.42, 107.43],
    tz: 'Asia/Ho_Chi_Minh',
    alt: '—',
  },
  song: {
    chapter: '01',
    day: 'Ngày 02',
    place: 'Sông Tembeling, Taman Negara, Malaysia',
    ll: [4.38, 102.4],
    tz: 'Asia/Kuala_Lumpur',
    alt: '120 m',
  },
  'tram-2': {
    chapter: '01',
    day: 'Ngày 03',
    stop: 'Trạm 02',
    slug: 'nepenthes-ampullaria',
    scientificName: 'Nepenthes ampullaria',
    place: 'Rừng thấp Borneo',
    ll: [1.5, 110.3],
    tz: 'Asia/Kuching',
    alt: 'Vùng thấp',
  },
  'tram-3': {
    chapter: '01',
    day: 'Ngày 04',
    stop: 'Trạm 03',
    slug: 'nepenthes-rajah',
    scientificName: 'Nepenthes rajah',
    place: 'Núi Kinabalu, Sabah',
    ll: [6.08, 116.56],
    tz: 'Asia/Kuching',
    alt: '1.500–2.650 m',
  },
  'bay-2': {
    chapter: '02',
    day: 'Ngày 05',
    place: 'Kota Kinabalu → Wilmington, Bắc Carolina',
    ll: [34.2, -77.9],
    tz: 'America/New_York',
    alt: 'Đang bay',
  },
  'tram-4': {
    chapter: '02',
    day: 'Ngày 05',
    stop: 'Trạm 04',
    slug: 'venus-flytrap',
    scientificName: 'Dionaea muscipula',
    place: 'Green Swamp, Bắc Carolina (Mỹ)',
    ll: [34.2, -77.9],
    tz: 'America/New_York',
    alt: '—',
  },
  'tram-5': {
    chapter: '02',
    day: 'Ngày 06',
    stop: 'Trạm 05',
    slug: 'axolotl',
    scientificName: 'Ambystoma mexicanum',
    place: 'Kênh Xochimilco, Thành phố Mexico',
    ll: [19.27, -99.1],
    tz: 'America/Mexico_City',
    alt: '—',
  },
  'bay-3': {
    chapter: '03',
    day: 'Ngày 07',
    place: 'Thành phố Mexico → Accra, Ghana',
    ll: [8.0, -1.0],
    tz: 'Africa/Accra',
    alt: 'Đang bay',
  },
  'tram-6': {
    chapter: '03',
    day: 'Ngày 07',
    stop: 'Trạm 06',
    slug: 'ball-python',
    scientificName: 'Python regius',
    place: 'Savan phía bắc Ghana',
    ll: [8.0, -1.0],
    tz: 'Africa/Accra',
    alt: '—',
  },
  'tram-7': {
    chapter: '03',
    day: 'Ngày 08',
    stop: 'Trạm 07',
    slug: 'leopard-gecko',
    scientificName: 'Eublepharis macularius',
    place: 'Balochistan, Pakistan',
    ll: [30.0, 67.0],
    tz: 'Asia/Karachi',
    alt: '—',
  },
  'tram-8': {
    chapter: '03',
    day: 'Ngày 09',
    stop: 'Trạm 08',
    slug: 'bearded-dragon',
    scientificName: 'Pogona vitticeps',
    place: 'Miền trung nước Úc',
    ll: [-25.0, 134.0],
    tz: 'Australia/Darwin',
    alt: '—',
  },
  'bay-4': {
    chapter: '04',
    day: 'Ngày 10',
    place: 'Alice Springs → Nam Âu, Địa Trung Hải',
    ll: [41.9, 15.0],
    tz: 'Europe/Rome',
    alt: 'Đang bay',
  },
  'tram-9': {
    chapter: '04',
    day: 'Ngày 10',
    stop: 'Trạm 09',
    slug: 'hermann-tortoise',
    scientificName: 'Testudo hermanni',
    place: 'Bụi rậm Nam Âu, Địa Trung Hải',
    ll: [41.9, 15.0],
    tz: 'Europe/Rome',
    alt: '—',
  },
  ket: {
    chapter: '04',
    day: 'Ngày 10',
    place: 'Khép hành trình · 9/9 trạm',
    ll: [41.9, 15.0],
    tz: 'Europe/Rome',
    alt: '—',
  },
};

export const FLIGHTS: Record<string, JourneyFlight> = {
  'bay-2': {
    chapter: '02',
    a: 4,
    tz: 'America/New_York',
    from: { code: 'BKI', city: 'Kota Kinabalu', ll: [5.94, 116.05] },
    to: { code: 'ILM', city: 'Wilmington, Bắc Carolina', ll: [34.27, -77.9] },
  },
  'bay-3': {
    chapter: '03',
    a: 6,
    tz: 'Africa/Accra',
    from: { code: 'MEX', city: 'Thành phố Mexico', ll: [19.43, -99.13] },
    to: { code: 'ACC', city: 'Accra, Ghana', ll: [5.6, -0.19] },
  },
  'bay-4': {
    chapter: '04',
    a: 9,
    tz: 'Europe/Rome',
    from: { code: 'ASP', city: 'Alice Springs, Úc', ll: [-23.8, 133.9] },
    to: { code: 'FCO', city: 'Rome, Địa Trung Hải', ll: [41.8, 12.25] },
  },
};

export const ROUTE: JourneyRoutePoint[] = [
  { id: 'cua-rung', slug: '', scientificName: '', label: 'Cúc Phương', ll: [20.32, 105.61], dx: -10, dy: -10 },
  { id: 'tram-1', slug: 'burmese-python', scientificName: 'Python bivittatus', label: 'Cát Tiên', ll: [11.42, 107.43], dx: -10, dy: 4 },
  { id: 'song', slug: '', scientificName: '', label: 'Taman Negara', ll: [4.38, 102.4], dx: -10, dy: 12 },
  { id: 'tram-2', slug: 'nepenthes-ampullaria', scientificName: 'Nepenthes ampullaria', label: 'Borneo', ll: [1.5, 110.3], dx: -6, dy: 16 },
  { id: 'tram-3', slug: 'nepenthes-rajah', scientificName: 'Nepenthes rajah', label: 'Kinabalu', ll: [6.08, 116.56], dx: 10, dy: -4 },
  { id: 'tram-4', slug: 'venus-flytrap', scientificName: 'Dionaea muscipula', label: 'Bắc Carolina', ll: [34.2, -77.9], dx: 10, dy: -6, end: true },
  { id: 'tram-5', slug: 'axolotl', scientificName: 'Ambystoma mexicanum', label: 'Xochimilco', ll: [19.27, -99.1], dx: -10, dy: 14 },
  { id: 'tram-6', slug: 'ball-python', scientificName: 'Python regius', label: 'Ghana', ll: [8.0, -1.0], dx: -8, dy: 15, end: true },
  { id: 'tram-7', slug: 'leopard-gecko', scientificName: 'Eublepharis macularius', label: 'Balochistan', ll: [30.0, 67.0], dx: 8, dy: -8 },
  { id: 'tram-8', slug: 'bearded-dragon', scientificName: 'Pogona vitticeps', label: 'Trung Úc', ll: [-25.0, 134.0], dx: 10, dy: 12 },
  { id: 'tram-9', slug: 'hermann-tortoise', scientificName: 'Testudo hermanni', label: 'Địa Trung Hải', ll: [41.9, 15.0], dx: -8, dy: -10, end: true },
];

export const TIPS: Record<string, JourneyTipConfig> = {
  'burmese-python': {
    slug: 'burmese-python',
    scientificName: 'Python bivittatus',
    n: 'Trạm 01',
    t: 'Hồ sơ loài',
    d: 'Mỗi loài có một trang riêng: ảnh lớn, khí hậu nuôi, mức IUCN, vùng bản địa và các cá thể đang bán.',
    cta: 'Xem hồ sơ Trăn đất',
    kind: 'species-detail',
  },
  'nepenthes-ampullaria': {
    slug: 'nepenthes-ampullaria',
    scientificName: 'Nepenthes ampullaria',
    n: 'Trạm 02',
    t: 'Cây phân loại 6 cấp',
    d: 'Bách khoa sắp theo 6 cấp từ Giới tới Chi để bấm theo từng nhánh.',
    cta: 'Mở cây phân loại',
    kind: 'taxonomy',
  },
  'nepenthes-rajah': {
    slug: 'nepenthes-rajah',
    scientificName: 'Nepenthes rajah',
    n: 'Trạm 03',
    t: 'Mức bảo tồn IUCN',
    d: 'Lọc bách khoa theo 5 mức. Nắp ấm Rajah đang ở mức Nguy cấp (EN).',
    cta: 'Lọc bách khoa theo IUCN',
    kind: 'iucn-filter',
    iucnCode: 'EN',
  },
  'venus-flytrap': {
    slug: 'venus-flytrap',
    scientificName: 'Dionaea muscipula',
    n: 'Trạm 04',
    t: 'Tìm nhanh ⌘K',
    d: 'Ở bất kỳ trang nào, nhấn ⌘K để mở hộp tìm kiếm: gõ tên Việt hoặc tên khoa học để nhảy thẳng tới loài hay bậc phân loại.',
    cta: 'Thử nhấn ⌘K',
    kind: 'quick-search',
  },
  axolotl: {
    slug: 'axolotl',
    scientificName: 'Ambystoma mexicanum',
    n: 'Trạm 05',
    t: 'Sàn sinh vật cảnh',
    d: 'Mỗi sản phẩm gắn đúng một loài trong bách khoa, ví dụ:',
    cta: 'Vào cửa hàng',
    kind: 'marketplace',
  },
  'ball-python': {
    slug: 'ball-python',
    scientificName: 'Python regius',
    n: 'Trạm 06',
    t: 'Biến thể màu trên sàn',
    d: 'Ngoài dạng hoang dã, người nuôi gây dựng nhiều biến thể màu. Trên sàn đang có cả dạng thường lẫn Piebald.',
    cta: 'Xem các cá thể Trăn bóng',
    kind: 'morphs',
  },
  'leopard-gecko': {
    slug: 'leopard-gecko',
    scientificName: 'Eublepharis macularius',
    n: 'Trạm 07',
    t: 'Cửa hàng được kiểm duyệt',
    d: 'Người mua có thể nộp đơn mở cửa hàng. Kiểm duyệt viên duyệt từng cửa hàng và từng sản phẩm trước khi lên sàn.',
    cta: 'Tìm hiểu mở cửa hàng',
    kind: 'seller-apply',
  },
  'bearded-dragon': {
    slug: 'bearded-dragon',
    scientificName: 'Pogona vitticeps',
    n: 'Trạm 08',
    t: 'Giỏ hàng và đặt mua',
    d: 'Thêm cá thể vào giỏ, điền địa chỉ nhận hàng và đặt đơn. Tồn kho được giữ trong giao dịch để tránh bán quá số lượng.',
    cta: 'Xem giỏ hàng',
    kind: 'cart',
  },
  'hermann-tortoise': {
    slug: 'hermann-tortoise',
    scientificName: 'Testudo hermanni',
    n: 'Trạm 09',
    t: 'Đơn hàng và đánh giá',
    d: 'Theo dõi trạng thái từng đơn trong tài khoản và đánh giá sản phẩm đã mua.',
    cta: 'Mở tài khoản',
    kind: 'orders',
  },
};

export interface VisaConfig {
  id: string;
  page: 0 | 1;
  x: number;
  y: number;
  rot: number;
  shape: 'circle' | 'rect' | 'oval';
  ink: string;
}

export const VISAS: VisaConfig[] = [
  { id: 'tram-1', page: 0, x: 8, y: 12, rot: -8, shape: 'circle', ink: '#0f766e' },
  { id: 'tram-2', page: 0, x: 52, y: 8, rot: 6, shape: 'rect', ink: '#9a3412' },
  { id: 'tram-3', page: 0, x: 26, y: 40, rot: -3, shape: 'oval', ink: '#1d4ed8' },
  { id: 'tram-4', page: 0, x: 6, y: 68, rot: 9, shape: 'rect', ink: '#6d28d9' },
  { id: 'tram-5', page: 0, x: 54, y: 64, rot: -11, shape: 'circle', ink: '#b91c1c' },
  { id: 'tram-6', page: 1, x: 10, y: 10, rot: 4, shape: 'oval', ink: '#a16207' },
  { id: 'tram-7', page: 1, x: 52, y: 22, rot: -7, shape: 'circle', ink: '#0f766e' },
  { id: 'tram-8', page: 1, x: 12, y: 50, rot: 10, shape: 'rect', ink: '#c2410c' },
  { id: 'tram-9', page: 1, x: 50, y: 64, rot: -5, shape: 'oval', ink: '#1e40af' },
];

export const SHORT_STATION_NAMES: Record<string, string> = {
  'tram-1': 'CÁT TIÊN',
  'tram-2': 'BORNEO',
  'tram-3': 'KINABALU',
  'tram-4': 'CAROLINA',
  'tram-5': 'XOCHIMILCO',
  'tram-6': 'GHANA',
  'tram-7': 'BALOCHISTAN',
  'tram-8': 'TRUNG ÚC',
  'tram-9': 'ĐỊA TRUNG HẢI',
};

// Danh sách 28 ảnh thực địa có đầy đủ bản quyền Wikimedia Commons
export const JOURNEY_CREDITS = Object.entries(TRIP_PHOTOS).map(([key, photo]) => ({
  key,
  title: photo.credit.sourceUrl.split('File:')[1]
    ? decodeURIComponent(photo.credit.sourceUrl.split('File:')[1]!)
    : key,
  author: photo.credit.author,
  license: photo.credit.license,
  source: photo.credit.sourceUrl,
}));

// Bản đồ ảnh nền cho từng mục để tải trước mục kế tiếp khi cuộn qua 60%
export const SECTION_NEXT_PRELOAD: Record<string, string> = {
  'mo-dau': 'trail',
  'tong-quan': 'trail',
  'cua-rung': 'roots',
  'tram-1': 'boat',
  song: 'swamp',
  'tram-2': 'summit',
  'tram-3': 'carolina',
  'bay-2': 'carolina',
  'tram-4': 'xochi',
  'tram-5': 'ghana',
  'bay-3': 'ghana',
  'tram-6': 'baloch',
  'tram-7': 'uluru',
  'tram-8': 'maquis',
  'bay-4': 'maquis',
};
