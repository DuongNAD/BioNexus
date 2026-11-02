// frontend/src/content/species-extras.ts
// Hồ sơ mở rộng & dữ liệu tạp chí khoa học cho 9 loài sinh vật cảnh BioNexus

export interface SpeciesExtra {
  id: number;
  scientificName: string;
  slug: string;
  group: 'Bò sát' | 'Lưỡng cư' | 'Cây ăn thịt';
  origin: { lat: number; lng: number; place: string };
  nativeCoordsFormatted: string;
  hubId: string;
  heroPhotoId: string;
  portraitPhotoId: string;
  habitatPhotoId: string;
  galleryPhotoIds: string[];
  focus: string; // CSS objectPosition cho ảnh hero
  conservationNote: string;
  pullQuote: string;
  gbifUrl: string;
  hubName: string;
  diet?: string;
  lifespan?: string;
  activityTime?: string;
}

export const SPECIES_EXTRAS: Record<string, SpeciesExtra> = {
  'Ambystoma mexicanum': {
    id: 1,
    scientificName: 'Ambystoma mexicanum',
    slug: 'axolotl',
    group: 'Lưỡng cư',
    origin: { lat: 19.26, lng: -99.1, place: 'Hồ Xochimilco, Thung lũng Mexico' },
    nativeCoordsFormatted: '19.26° N, 99.10° W',
    hubId: 'HUB-SGN',
    hubName: 'BioGreen Exotic (TP.HCM)',
    heroPhotoId: 'axolotl/hero-1',
    portraitPhotoId: 'axolotl/portrait-1',
    habitatPhotoId: 'axolotl/habitat-1',
    galleryPhotoIds: [
      'axolotl/hero-1',
      'axolotl/portrait-1',
      'axolotl/habitat-1',
      'prod-axolotl-1',
      'biome/peat-swamp-waters',
      'biome/macro-leaf-droplet',
    ],
    focus: '62% 48%',
    conservationNote:
      'Cực kỳ nguy cấp ngoài tự nhiên do mất môi trường sống tại hệ thống kênh Xochimilco và ô nhiễm nguồn nước đô thị; phụ thuộc hoàn toàn vào các chương trình nhân giống bảo tồn nhân tạo.',
    pullQuote:
      'Hiện tượng giữ lại hình thái ấu trùng suốt vòng đời (neoteny) biến Axolotl thành một trong những sinh vật kỳ bí và quý giá nhất của sinh học phát triển hiện đại.',
    gbifUrl: 'https://www.gbif.org/species/2431969',
    diet: 'Động vật ăn thịt nhỏ, giun huyết, trùn chỉ',
    lifespan: '10–15 năm',
    activityTime: 'Về đêm / Chạng vạng',
  },
  'Nepenthes rajah': {
    id: 2,
    scientificName: 'Nepenthes rajah',
    slug: 'nepenthes-rajah',
    group: 'Cây ăn thịt',
    origin: { lat: 6.08, lng: 116.56, place: 'Núi Kinabalu, Sabah, Borneo' },
    nativeCoordsFormatted: '6.08° N, 116.56° E',
    hubId: 'HUB-DAD',
    hubName: 'Carnivora Garden (Đà Nẵng)',
    heroPhotoId: 'nepenthes-rajah/hero-1',
    portraitPhotoId: 'nepenthes-rajah/portrait-1',
    habitatPhotoId: 'nepenthes-rajah/habitat-1',
    galleryPhotoIds: [
      'nepenthes-rajah/hero-1',
      'nepenthes-rajah/portrait-1',
      'nepenthes-rajah/habitat-1',
      'prod-nepenthes-rajah-1',
      'biome/cloud-forest-mist',
      'biome/macro-moss-fern',
    ],
    focus: '50% 50%',
    conservationNote:
      'Loài thực vật ăn thịt đặc hữu vùng núi cao Kinabalu, bị đe dọa nghiêm trọng bởi nạn thu hái bất hợp pháp và biến đổi khí hậu làm thu hẹp vành đai rừng mây.',
    pullQuote:
      'Với bình ấm khổng lồ chứa tới 3.5 lít dịch tiêu hóa, Nepenthes rajah là minh chứng ngoạn mục cho sự thích nghi đỉnh cao của thế giới thực vật nghèo dinh dưỡng.',
    gbifUrl: 'https://www.gbif.org/species/3753587',
    diet: 'Côn trùng, động vật nhỏ rơi vào bình',
    lifespan: 'Nhiều thập kỷ',
    activityTime: 'Thụ động liên tục',
  },
  'Python regius': {
    id: 3,
    scientificName: 'Python regius',
    slug: 'ball-python',
    group: 'Bò sát',
    origin: { lat: 8.0, lng: -1.0, place: 'Thảo nguyên Savan Tây & Trung Phi' },
    nativeCoordsFormatted: '8.00° N, 1.00° W',
    hubId: 'HUB-SGN',
    hubName: 'BioGreen Exotic (TP.HCM)',
    heroPhotoId: 'ball-python/hero-1',
    portraitPhotoId: 'ball-python/portrait-1',
    habitatPhotoId: 'ball-python/habitat-1',
    galleryPhotoIds: [
      'ball-python/hero-1',
      'ball-python/portrait-1',
      'ball-python/habitat-1',
      'prod-ball-python-1',
      'biome/desert-savanna-sunset',
      'biome/rainforest-canopy',
    ],
    focus: '55% 45%',
    conservationNote:
      'Số lượng tự nhiên suy giảm do săn bắt thương mại da trăn và vật nuôi quốc tế; đã được kiểm soát nhân giống F2+ thành công rộng rãi trên toàn cầu.',
    pullQuote:
      'Bản tính hiền hòa cùng tập tính tự vệ cuộn tròn như quả cầu biến trăn bóng trở thành đại sứ hoàn hảo đưa con người đến gần hơn với thế giới bò sát.',
    gbifUrl: 'https://www.gbif.org/species/2465191',
    diet: 'Động vật gặm nhấm nhỏ',
    lifespan: '20–30 năm',
    activityTime: 'Về đêm',
  },
  'Eublepharis macularius': {
    id: 4,
    scientificName: 'Eublepharis macularius',
    slug: 'leopard-gecko',
    group: 'Bò sát',
    origin: { lat: 30.0, lng: 67.0, place: 'Vùng khô cằn Pakistan, Afghanistan & Tây Bắc Ấn Độ' },
    nativeCoordsFormatted: '30.00° N, 67.00° E',
    hubId: 'HUB-SGN',
    hubName: 'BioGreen Exotic (TP.HCM)',
    heroPhotoId: 'leopard-gecko/hero-1',
    portraitPhotoId: 'leopard-gecko/portrait-1',
    habitatPhotoId: 'leopard-gecko/habitat-1',
    galleryPhotoIds: [
      'leopard-gecko/hero-1',
      'leopard-gecko/portrait-1',
      'leopard-gecko/habitat-1',
      'prod-gecko-1',
      'prod-gecko-2',
      'biome/desert-savanna-sunset',
    ],
    focus: '50% 50%',
    conservationNote:
      'Quần thể hoang dã ổn định tại vùng bán sa mạc đá sỏi Trung Á; là một trong những loài thằn lằn được thuần dưỡng và nhân giống nhân tạo hoàn thiện nhất.',
    pullQuote:
      'Đôi mí mắt cử động linh hoạt và chiếc đuôi mọng mỡ trữ dưỡng chất tạo nên diện mạo cuốn hút đặc trưng của cư dân màn đêm vùng bán sa mạc.',
    gbifUrl: 'https://www.gbif.org/species/2464731',
    diet: 'Côn trùng sống (dế, sâu bột, gián Dubia)',
    lifespan: '15–20 năm',
    activityTime: 'Về đêm / Hoàng hôn',
  },
  'Dionaea muscipula': {
    id: 5,
    scientificName: 'Dionaea muscipula',
    slug: 'venus-flytrap',
    group: 'Cây ăn thịt',
    origin: { lat: 34.2, lng: -77.9, place: 'Đầm lầy ven biển Bắc & Nam Carolina, Hoa Kỳ' },
    nativeCoordsFormatted: '34.20° N, 77.90° W',
    hubId: 'HUB-DAD',
    hubName: 'Carnivora Garden (Đà Nẵng)',
    heroPhotoId: 'venus-flytrap/hero-1',
    portraitPhotoId: 'venus-flytrap/portrait-1',
    habitatPhotoId: 'venus-flytrap/habitat-1',
    galleryPhotoIds: [
      'venus-flytrap/hero-1',
      'venus-flytrap/portrait-1',
      'venus-flytrap/habitat-1',
      'prod-venus-flytrap-1',
      'biome/peat-swamp-waters',
      'biome/macro-leaf-droplet',
    ],
    focus: '48% 52%',
    conservationNote:
      'Phân bố địa lý tự nhiên vô cùng hẹp trong bán kính 100km quanh duyên hải Carolina; suy thoái môi trường đất ngập nước đe dọa sinh tồn loài trong tự nhiên.',
    pullQuote:
      'Tốc độ khép bẫy chỉ 1/10 giây được kích hoạt bởi cơ chế điện sinh học tinh vi đã khiến Charles Darwin từng thốt lên đây là một trong những loài cây kỳ diệu nhất thế giới.',
    gbifUrl: 'https://www.gbif.org/species/3190822',
    diet: 'Côn trùng sống (ruồi, nhện nhỏ)',
    lifespan: '20+ năm trong điều kiện tối ưu',
    activityTime: 'Kích hoạt ban ngày',
  },
  'Python bivittatus': {
    id: 6,
    scientificName: 'Python bivittatus',
    slug: 'burmese-python',
    group: 'Bò sát',
    origin: { lat: 21.9, lng: 95.9, place: 'Rừng nhiệt đới Nam & Đông Nam Á (kể cả Việt Nam)' },
    nativeCoordsFormatted: '21.90° N, 95.90° E',
    hubId: 'HUB-SGN',
    hubName: 'BioGreen Exotic (TP.HCM)',
    heroPhotoId: 'burmese-python/hero-1',
    portraitPhotoId: 'burmese-python/portrait-1',
    habitatPhotoId: 'burmese-python/habitat-1',
    galleryPhotoIds: [
      'burmese-python/hero-1',
      'burmese-python/portrait-1',
      'burmese-python/habitat-1',
      'prod-burmese-python-1',
      'biome/rainforest-canopy',
      'biome/coral-reef-deep',
    ],
    focus: '52% 48%',
    conservationNote:
      'Thuộc Phụ lục II CITES và nhóm động vật rừng nguy cấp tại Việt Nam; việc khai thác tự nhiên bị nghiêm cấm, chỉ cho phép giao dịch cá thể sinh sản nhân tạo có kiểm định nguồn gốc.',
    pullQuote:
      'Sức mạnh phi thường và những hoa văn cẩm thạch hoàn mỹ tôn vinh vị thế của loài trăn khổng lồ bản địa rừng nhiệt đới phương Nam.',
    gbifUrl: 'https://www.gbif.org/species/7542289',
    diet: 'Động vật có vú, chim nhỏ',
    lifespan: '20–25 năm',
    activityTime: 'Về đêm / Bán thủy sinh',
  },
  'Pogona vitticeps': {
    id: 7,
    scientificName: 'Pogona vitticeps',
    slug: 'bearded-dragon',
    group: 'Bò sát',
    origin: { lat: -25.0, lng: 134.0, place: 'Vùng bán hoang mạc & cây bụi Miền trung nước Úc' },
    nativeCoordsFormatted: '-25.00° S, 134.00° E',
    hubId: 'HUB-SGN',
    hubName: 'BioGreen Exotic (TP.HCM)',
    heroPhotoId: 'bearded-dragon/hero-1',
    portraitPhotoId: 'bearded-dragon/portrait-1',
    habitatPhotoId: 'bearded-dragon/habitat-1',
    galleryPhotoIds: [
      'bearded-dragon/hero-1',
      'bearded-dragon/portrait-1',
      'bearded-dragon/habitat-1',
      'prod-bearded-dragon-1',
      'biome/desert-savanna-sunset',
      'biome/fireflies-night',
    ],
    focus: '50% 45%',
    conservationNote:
      'Quần thể hoang dã rộng lớn và an toàn tại lục địa Úc; chính phủ Úc cấm xuất khẩu mẫu vật tự nhiên từ những năm 1960, mọi cá thể nuôi cảnh hiện tại đều bắt nguồn từ nhân giống nhân tạo hợp pháp.',
    pullQuote:
      'Túi gai xòe rộng dưới cổ cùng hành vi vẫy tay chào đồng loại thể hiện ngôn ngữ giao tiếp xã hội phong phú bậc nhất thế giới bò sát.',
    gbifUrl: 'https://www.gbif.org/species/2465806',
    diet: 'Tạp ăn (côn trùng sống 70% khi non, rau xanh 80% khi trưởng thành)',
    lifespan: '10–15 năm',
    activityTime: 'Ban ngày',
  },
  'Testudo hermanni': {
    id: 8,
    scientificName: 'Testudo hermanni',
    slug: 'hermann-tortoise',
    group: 'Bò sát',
    origin: { lat: 41.9, lng: 15.0, place: 'Rừng sồi & cây bụi Địa Trung Hải, Nam Âu' },
    nativeCoordsFormatted: '41.90° N, 15.00° E',
    hubId: 'HUB-SGN',
    hubName: 'BioGreen Exotic (TP.HCM)',
    heroPhotoId: 'hermann-tortoise/hero-1',
    portraitPhotoId: 'hermann-tortoise/portrait-1',
    habitatPhotoId: 'hermann-tortoise/habitat-1',
    galleryPhotoIds: [
      'hermann-tortoise/hero-1',
      'hermann-tortoise/portrait-1',
      'hermann-tortoise/habitat-1',
      'prod-hermann-tortoise-1',
      'biome/desert-savanna-sunset',
      'biome/macro-moss-fern',
    ],
    focus: '48% 50%',
    conservationNote:
      'Bị đe dọa do suy giảm sinh cảnh rừng ven Địa Trung Hải và cháy rừng mùa hè; nằm trong danh mục bảo vệ nghiêm ngặt của Liên minh Châu Âu.',
    pullQuote:
      'Chiếc mai vòm vàng điểm đốm đen vững chãi cùng tuổi thọ vượt nửa thế kỷ là biểu trưng trường tồn của sức sống vùng đất Địa Trung Hải nắng gió.',
    gbifUrl: 'https://www.gbif.org/species/2442111',
    diet: '100% thảo mộc, bồ công anh, cỏ dại giàu canxi, xơ cao',
    lifespan: '50–80+ năm',
    activityTime: 'Ban ngày',
  },
  'Nepenthes ampullaria': {
    id: 9,
    scientificName: 'Nepenthes ampullaria',
    slug: 'nepenthes-ampullaria',
    group: 'Cây ăn thịt',
    origin: { lat: 1.5, lng: 110.3, place: 'Rừng đầm lầy than bùn đất thấp Borneo, Sumatra & Malaysia' },
    nativeCoordsFormatted: '1.50° N, 110.30° E',
    hubId: 'HUB-DAD',
    hubName: 'Carnivora Garden (Đà Nẵng)',
    heroPhotoId: 'nepenthes-ampullaria/hero-1',
    portraitPhotoId: 'nepenthes-ampullaria/portrait-1',
    habitatPhotoId: 'nepenthes-ampullaria/habitat-1',
    galleryPhotoIds: [
      'nepenthes-ampullaria/hero-1',
      'nepenthes-ampullaria/portrait-1',
      'nepenthes-ampullaria/habitat-1',
      'prod-nepenthes-ampullaria-1',
      'biome/peat-swamp-waters',
      'biome/rainforest-canopy',
    ],
    focus: '50% 50%',
    conservationNote:
      'Phân bố rộng tại các vùng đất thấp ẩm ướt Đông Nam Á, quần thể hoang dã dồi dào nhưng cần bảo vệ các vùng sinh cảnh đất than bùn trước nạn phá rừng.',
    pullQuote:
      'Sự chuyển hướng tiến hóa từ bẫy côn trùng sang thu gom mùn lá rụng khiến những cụm ấm tròn xoe dưới mặt đất trở thành một mắt xích sinh thái vô cùng đặc biệt.',
    gbifUrl: 'https://www.gbif.org/species/3753696',
    diet: 'Mùn hữu cơ lá cây rụng (detritivore) và một lượng nhỏ côn trùng',
    lifespan: 'Nhiều thập kỷ',
    activityTime: 'Thụ động liên tục',
  },
};

export function getSpeciesExtra(scientificNameOrId: string | number): SpeciesExtra | undefined {
  if (typeof scientificNameOrId === 'number') {
    return Object.values(SPECIES_EXTRAS).find((sp) => sp.id === scientificNameOrId);
  }
  return SPECIES_EXTRAS[scientificNameOrId];
}
