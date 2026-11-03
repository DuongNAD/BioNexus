// frontend/src/content/species-extras.ts
// Hồ sơ mở rộng & dữ liệu tạp chí khoa học cho 9 loài sinh vật cảnh BioNexus.
// Mọi trường bổ sung ngoài DTO (conservationNote, pullQuote, diet, lifespan, activityTime, origin)
// đều được dẫn xuất trực tiếp từ database/seed_data.sql (description, environmentSpecs, conservationStatus, Products)
// và docs/frontend/07-hanh-trinh.md (trạm hành trình 9 loài).

export interface SpeciesExtra {
  scientificName: string;
  slug: string;
  group: 'Bò sát' | 'Lưỡng cư' | 'Cây ăn thịt';
  region: string;
  origin: { lat: number; lng: number; place: string };
  nativeCoordsFormatted: string;
  hubId: string;
  hubName: string;
  heroPhotoId: string;
  portraitPhotoId: string;
  habitatPhotoId: string;
  galleryPhotoIds: string[];
  focus: string; // CSS objectPosition cho ảnh hero
  conservationNote: string;
  pullQuote: string;
  diet?: string;
  lifespan?: string;
  activityTime?: string;
}

export const SPECIES_EXTRAS: Record<string, SpeciesExtra> = {
  // Nguồn: database/seed_data.sql (Species ID 6: Ambystoma mexicanum, CR — "Loài lưỡng cư giữ lại đặc điểm ấu trùng suốt đời (neoteny).
  // Cực kỳ nguy cấp ngoài tự nhiên, chỉ còn tại hồ Xochimilco"; environmentSpecs: "Nhiệt độ nước: 14-18°C, pH: 7.4-7.6,
  // Môi trường: Nước ngọt hoàn toàn, lọc yếu, không nền sỏi nhỏ") & docs/frontend/07-hanh-trinh.md (Trạm 05: Hồ Xochimilco, Mexico).
  'Ambystoma mexicanum': {
    scientificName: 'Ambystoma mexicanum',
    slug: 'axolotl',
    group: 'Lưỡng cư',
    region: 'Hồ Xochimilco, Mexico',
    origin: { lat: 19.26, lng: -99.1, place: 'Hồ Xochimilco, Thung lũng Mexico' },
    nativeCoordsFormatted: '19.26° N, 99.10° W',
    hubId: 'HUB-SGN',
    hubName: 'BioGreen Exotic (TP.HCM)',
    heroPhotoId: 'axolotl/hero-1',
    portraitPhotoId: 'axolotl/portrait-1',
    habitatPhotoId: 'axolotl/habitat-1',
    galleryPhotoIds: [
      'axolotl/gallery-1',
      'axolotl/gallery-2',
      'axolotl/gallery-3',
    ],
    focus: '52% 48%',
    conservationNote:
      'Xếp hạng Cực kỳ nguy cấp (CR): ngoài tự nhiên hiện chỉ còn phân bố tại hệ thống kênh hồ Xochimilco (Mexico), đòi hỏi môi trường nước ngọt mát 14–18°C, pH 7.4–7.6 và dòng lọc yếu.',
    pullQuote:
      'Loài lưỡng cư giữ lại đặc điểm ấu trùng suốt đời (neoteny), sống hoàn toàn dưới nước ngọt với ba cặp mang ngoài dạng lông vũ.',
  },

  // Nguồn: database/seed_data.sql (Species ID 7: Nepenthes rajah, EN — "Cây ăn thịt cao sơn đặc hữu núi Kinabalu, Borneo.
  // Bình ấm lớn tới 41cm, có thể bẫy được động vật có xương sống nhỏ"; environmentSpecs: "Nhiệt độ: ngày 20-25°C, đêm 10-15°C,
  // Độ ẩm: 75-90%, Ánh sáng: tán xạ mạnh, Giá thể: dớn + perlite thoát nước") & docs/frontend/07-hanh-trinh.md (Trạm 03: Núi Kinabalu).
  'Nepenthes rajah': {
    scientificName: 'Nepenthes rajah',
    slug: 'nepenthes-rajah',
    group: 'Cây ăn thịt',
    region: 'Núi Kinabalu, Sabah, Borneo',
    origin: { lat: 6.08, lng: 116.56, place: 'Núi Kinabalu, Sabah, Borneo' },
    nativeCoordsFormatted: '6.08° N, 116.56° E',
    hubId: 'HUB-DAD',
    hubName: 'Carnivora Garden (Đà Nẵng)',
    heroPhotoId: 'nepenthes-rajah/hero-1',
    portraitPhotoId: 'nepenthes-rajah/portrait-1',
    habitatPhotoId: 'nepenthes-rajah/habitat-1',
    galleryPhotoIds: [
      'nepenthes-rajah/gallery-1',
      'nepenthes-rajah/gallery-2',
      'nepenthes-rajah/gallery-3',
    ],
    focus: '52% 50%',
    conservationNote:
      'Xếp hạng Nguy cấp (EN): loài cây ăn thịt cao sơn đặc hữu của núi Kinabalu (Borneo), chỉ sinh trưởng nơi có biên độ nhiệt ngày 20–25°C, đêm hạ xuống 10–15°C và độ ẩm 75–90%.',
    pullQuote:
      'Cây ăn thịt cao sơn đặc hữu núi Kinabalu với chiếc bình ấm lớn tới 41 cm, có khả năng bẫy cả côn trùng lẫn động vật có xương sống nhỏ.',
    // Nguồn diet: database/seed_data.sql ("Cây ăn thịt cao sơn... có thể bẫy được động vật có xương sống nhỏ")
    diet: 'Côn trùng và động vật nhỏ rơi vào bình bẫy',
  },

  // Nguồn: database/seed_data.sql (Species ID 3: Python regius, NT — "Loài trăn nhỏ có tập tính cuộn tròn như quả bóng khi tự vệ.
  // Bản tính hiền lành, nhiều biến dị màu (morph) nhân giống nhân tạo"; environmentSpecs: "Nhiệt độ: 26-32°C (điểm sưởi 32-34°C),
  // Độ ẩm: 55-65%, Chuồng: hộp chuyên dụng có hang trú hai đầu"; Products: "ăn chuột tốt") & docs/frontend/07-hanh-trinh.md (Trạm 06: Tây Phi).
  'Python regius': {
    scientificName: 'Python regius',
    slug: 'ball-python',
    group: 'Bò sát',
    region: 'Thảo nguyên Tây và Trung Phi',
    origin: { lat: 8.0, lng: -1.0, place: 'Thảo nguyên Savan Tây & Trung Phi' },
    nativeCoordsFormatted: '8.00° N, 1.00° W',
    hubId: 'HUB-SGN',
    hubName: 'BioGreen Exotic (TP.HCM)',
    heroPhotoId: 'ball-python/hero-1',
    portraitPhotoId: 'ball-python/portrait-1',
    habitatPhotoId: 'ball-python/habitat-1',
    galleryPhotoIds: [
      'ball-python/gallery-1',
      'ball-python/gallery-2',
      'ball-python/gallery-3',
    ],
    focus: '50% 50%',
    conservationNote:
      'Xếp hạng Sắp bị đe dọa (NT): loài trăn bản địa thảo nguyên Tây và Trung Phi; các cá thể nuôi cảnh hiện được nhân giống nhân tạo với nhiều biến dị màu (morph) trong điều kiện nhiệt độ 26–32°C và độ ẩm 55–65%.',
    pullQuote:
      'Loài trăn nhỏ bản tính hiền lành, có tập tính cuộn tròn cơ thể như một quả bóng và giấu đầu vào giữa khi tự vệ.',
    // Nguồn diet: database/seed_data.sql (Products: "Trăn bóng Pastel... ăn chuột tốt")
    diet: 'Chuột và động vật gặm nhấm nhỏ',
  },

  // Nguồn: database/seed_data.sql (Species ID 1: Eublepharis macularius, LC — "Thằn lằn mí mắt nguồn gốc Trung Á, hoạt động hoàng hôn và ban đêm.
  // Dễ nuôi, đuôi tích trữ mỡ, không có đĩa bám ở chân"; environmentSpecs: "Nhiệt độ: 24-30°C (điểm sưởi 31-33°C), Độ ẩm: 30-40% (hang ẩm 70-80%)";
  // Products: "ăn dế tốt") & docs/frontend/07-hanh-trinh.md (Trạm 07: Pakistan — Afghanistan).
  'Eublepharis macularius': {
    scientificName: 'Eublepharis macularius',
    slug: 'leopard-gecko',
    group: 'Bò sát',
    region: 'Pakistan, Afghanistan và Tây Bắc Ấn Độ',
    origin: { lat: 30.0, lng: 67.0, place: 'Vùng khô cằn Pakistan, Afghanistan & Tây Bắc Ấn Độ' },
    nativeCoordsFormatted: '30.00° N, 67.00° E',
    hubId: 'HUB-SGN',
    hubName: 'BioGreen Exotic (TP.HCM)',
    heroPhotoId: 'leopard-gecko/hero-1',
    portraitPhotoId: 'leopard-gecko/portrait-1',
    habitatPhotoId: 'leopard-gecko/habitat-1',
    galleryPhotoIds: [
      'leopard-gecko/gallery-1',
      'leopard-gecko/gallery-2',
      'leopard-gecko/gallery-3',
    ],
    focus: '52% 48%',
    conservationNote:
      'Xếp hạng Ít lo ngại (LC): thằn lằn mí mắt có nguồn gốc vùng khô cằn Trung Á và Nam Á, thích nghi với độ ẩm thấp 30–40% kèm hang trú ẩm 70–80% để hỗ trợ lột xác.',
    pullQuote:
      'Thằn lằn mí mắt hoạt động vào lúc hoàng hôn và ban đêm, tích trữ năng lượng ở phần đuôi mọng và di chuyển trên mặt đất không cần đĩa bám.',
    // Nguồn diet & activityTime: database/seed_data.sql (Products: "ăn dế tốt"; Species description: "hoạt động hoàng hôn và ban đêm")
    diet: 'Dế và côn trùng nhỏ',
    activityTime: 'Hoàng hôn và ban đêm',
  },

  // Nguồn: database/seed_data.sql (Species ID 9: Dionaea muscipula, VU — "Cây ăn thịt nổi tiếng với phiến lá gập lại cực nhanh khi con mồi chạm vào lông cảm giác hai lần.
  // Đặc hữu duyên hải Bắc và Nam Carolina"; environmentSpecs: "Nhiệt độ: 21-35°C (ngủ đông 5-10°C), Độ ẩm: 50-70%, Ánh sáng: nắng trực tiếp ≥4h,
  // Nước: thẩm thấu ngược hoặc nước mưa") & docs/frontend/07-hanh-trinh.md (Trạm 04: Bắc và Nam Carolina).
  'Dionaea muscipula': {
    scientificName: 'Dionaea muscipula',
    slug: 'venus-flytrap',
    group: 'Cây ăn thịt',
    region: 'Duyên hải Bắc và Nam Carolina, Hoa Kỳ',
    origin: { lat: 34.2, lng: -77.9, place: 'Đầm lầy ven biển Bắc & Nam Carolina, Hoa Kỳ' },
    nativeCoordsFormatted: '34.20° N, 77.90° W',
    hubId: 'HUB-DAD',
    hubName: 'Carnivora Garden (Đà Nẵng)',
    heroPhotoId: 'venus-flytrap/hero-1',
    portraitPhotoId: 'venus-flytrap/portrait-1',
    habitatPhotoId: 'venus-flytrap/habitat-1',
    galleryPhotoIds: [
      'venus-flytrap/gallery-1',
      'venus-flytrap/gallery-2',
      'venus-flytrap/gallery-3',
    ],
    focus: '50% 50%',
    conservationNote:
      'Xếp hạng Sắp nguy cấp (VU): loài thực vật ăn thịt đặc hữu vùng duyên hải Bắc và Nam Carolina (Hoa Kỳ), cần tối thiểu 4 giờ nắng trực tiếp mỗi ngày, nước mưa hoặc nước thẩm thấu ngược và kỳ ngủ đông 5–10°C.',
    pullQuote:
      'Phiến lá bẫy gập lại cực nhanh khi con mồi chạm liên tiếp hai lần vào các sợi lông cảm giác bên trong lòng bẫy.',
    // Nguồn diet: database/seed_data.sql ("Cây ăn thịt nổi tiếng với phiến lá gập lại cực nhanh khi con mồi chạm vào lông cảm giác hai lần")
    diet: 'Côn trùng chạm vào lông cảm giác trong bẫy lá',
  },

  // Nguồn: database/seed_data.sql (Species ID 4: Python bivittatus, VU — "Một trong những loài trăn lớn nhất thế giới, bản địa Đông Nam Á kể cả Việt Nam.
  // Cần diện tích nuôi lớn và kinh nghiệm chuyên sâu"; environmentSpecs: "Nhiệt độ: 26-32°C (điểm sưởi 35°C), Độ ẩm: 60-75%,
  // Chuồng: chuồng cỡ lớn kiên cố, khay nước đủ ngâm toàn thân") & docs/frontend/07-hanh-trinh.md (Trạm 01: Đông Nam Á).
  'Python bivittatus': {
    scientificName: 'Python bivittatus',
    slug: 'burmese-python',
    group: 'Bò sát',
    region: 'Nam và Đông Nam Á',
    origin: { lat: 21.9, lng: 95.9, place: 'Rừng nhiệt đới Nam & Đông Nam Á (kể cả Việt Nam)' },
    nativeCoordsFormatted: '21.90° N, 95.90° E',
    hubId: 'HUB-SGN',
    hubName: 'BioGreen Exotic (TP.HCM)',
    heroPhotoId: 'burmese-python/hero-1',
    portraitPhotoId: 'burmese-python/portrait-1',
    habitatPhotoId: 'burmese-python/habitat-1',
    galleryPhotoIds: [
      'burmese-python/gallery-1',
      'burmese-python/gallery-2',
      'biome/cuc-phuong-rainforest-trail',
    ],
    focus: '52% 50%',
    conservationNote:
      'Xếp hạng Sắp nguy cấp (VU): loài trăn lớn bản địa rừng nhiệt đới Đông Nam Á (bao gồm Việt Nam); đòi hỏi chuồng nuôi cỡ lớn kiên cố, khay nước đủ ngâm toàn thân và người nuôi có kinh nghiệm chuyên sâu.',
    pullQuote:
      'Một trong những loài trăn lớn nhất thế giới bản địa rừng nhiệt đới Đông Nam Á, gắn liền với sinh cảnh rừng ẩm và nguồn nước ngọt.',
  },

  // Nguồn: database/seed_data.sql (Species ID 2: Pogona vitticeps, LC — "Loài thằn lằn bản địa bán sa mạc Úc. Rất dạn người, có túi gai dưới cổ xòe ra khi kích động hoặc phơi nắng";
  // environmentSpecs: "Nhiệt độ: 24-29°C (điểm sưởi 38-42°C, đêm >18°C), Độ ẩm: 30-40%, Đèn: bắt buộc UVB 10.0 hoặc 12-14%";
  // Products: "Cá thể ăn dế và rau tốt") & docs/frontend/07-hanh-trinh.md (Trạm 08: Miền Trung nước Úc).
  'Pogona vitticeps': {
    scientificName: 'Pogona vitticeps',
    slug: 'bearded-dragon',
    group: 'Bò sát',
    region: 'Miền Trung nước Úc',
    origin: { lat: -25.0, lng: 134.0, place: 'Vùng bán hoang mạc & cây bụi Miền trung nước Úc' },
    nativeCoordsFormatted: '25.00° S, 134.00° E',
    hubId: 'HUB-SGN',
    hubName: 'BioGreen Exotic (TP.HCM)',
    heroPhotoId: 'bearded-dragon/hero-1',
    portraitPhotoId: 'bearded-dragon/portrait-1',
    habitatPhotoId: 'bearded-dragon/habitat-1',
    galleryPhotoIds: [
      'bearded-dragon/gallery-1',
      'bearded-dragon/gallery-2',
      'bearded-dragon/gallery-3',
    ],
    focus: '50% 45%',
    conservationNote:
      'Xếp hạng Ít lo ngại (LC): loài thằn lằn bản địa vùng bán sa mạc miền Trung nước Úc; khi nuôi cần điểm sưởi nóng 38–42°C, độ ẩm khô 30–40% và bắt buộc trang bị đèn UVB 10.0 hoặc 12–14%.',
    pullQuote:
      'Loài thằn lằn bán sa mạc nước Úc rất dạn người, sở hữu túi vảy gai dưới cổ có thể xòe rộng khi kích động hoặc khi phơi nắng.',
    // Nguồn diet & activityTime: database/seed_data.sql (Products: "ăn dế và rau tốt"; Species description: "phơi nắng")
    diet: 'Dế và rau xanh',
    activityTime: 'Ban ngày (phơi nắng dưới nguồn nhiệt và tia UVB)',
  },

  // Nguồn: database/seed_data.sql (Species ID 5: Testudo hermanni, VU — "Rùa cạn cỡ nhỏ bản địa Nam Âu quanh Địa Trung Hải.
  // Mai vòm vàng đen đẹp mắt, hiền lành, tuổi thọ có thể vượt 50 năm"; environmentSpecs: "Nhiệt độ: 22-28°C (điểm sưởi 32-35°C),
  // Độ ẩm: 50-65%, Đèn: UVB 10.0, Chế độ ăn: 100% thảo mộc giàu canxi, xơ cao") & docs/frontend/07-hanh-trinh.md (Trạm 09: Địa Trung Hải).
  'Testudo hermanni': {
    scientificName: 'Testudo hermanni',
    slug: 'hermann-tortoise',
    group: 'Bò sát',
    region: 'Nam Âu — Địa Trung Hải',
    origin: { lat: 41.9, lng: 15.0, place: 'Rừng sồi & cây bụi Địa Trung Hải, Nam Âu' },
    nativeCoordsFormatted: '41.90° N, 15.00° E',
    hubId: 'HUB-SGN',
    hubName: 'BioGreen Exotic (TP.HCM)',
    heroPhotoId: 'hermann-tortoise/hero-1',
    portraitPhotoId: 'hermann-tortoise/portrait-1',
    habitatPhotoId: 'hermann-tortoise/habitat-1',
    galleryPhotoIds: [
      'hermann-tortoise/gallery-1',
      'hermann-tortoise/gallery-2',
      'biome/calanque-cassis-mediterranean',
    ],
    focus: '50% 52%',
    conservationNote:
      'Xếp hạng Sắp nguy cấp (VU): loài rùa cạn cỡ nhỏ bản địa vùng Nam Âu quanh Địa Trung Hải; cần chế độ dinh dưỡng 100% thảo mộc giàu canxi, hàm lượng xơ cao cùng đèn UVB 10.0.',
    pullQuote:
      'Rùa cạn bản địa vùng Địa Trung Hải với chiếc mai vòm vàng đen tương phản, bản tính hiền lành và tuổi thọ có thể vượt 50 năm.',
    // Nguồn diet & lifespan: database/seed_data.sql (environmentSpecs: "Chế độ ăn: 100% thảo mộc giàu canxi, xơ cao"; description: "tuổi thọ có thể vượt 50 năm")
    diet: '100% thảo mộc giàu canxi, xơ cao (rau và cỏ)',
    lifespan: 'Có thể vượt 50 năm',
  },

  // Nguồn: database/seed_data.sql (Species ID 8: Nepenthes ampullaria, LC — "Cây nắp ấm đất thấp Đông Nam Á, mọc thành thảm ấm tròn dưới mặt đất.
  // Thích nghi ăn mùn lá rụng bên cạnh bẫy côn trùng"; environmentSpecs: "Nhiệt độ: ngày 28-34°C, đêm 20-24°C, Độ ẩm: 80-95%,
  // Ánh sáng: tán xạ trung bình, Môi trường: đầm lầy thấp râm mát") & docs/frontend/07-hanh-trinh.md (Trạm 02: Borneo — Sumatra — Malaysia).
  'Nepenthes ampullaria': {
    scientificName: 'Nepenthes ampullaria',
    slug: 'nepenthes-ampullaria',
    group: 'Cây ăn thịt',
    region: 'Borneo, Sumatra và Malaysia',
    origin: { lat: 1.5, lng: 110.3, place: 'Rừng đầm lầy than bùn đất thấp Borneo, Sumatra & Malaysia' },
    nativeCoordsFormatted: '1.50° N, 110.30° E',
    hubId: 'HUB-DAD',
    hubName: 'Carnivora Garden (Đà Nẵng)',
    heroPhotoId: 'nepenthes-ampullaria/hero-1',
    portraitPhotoId: 'nepenthes-ampullaria/portrait-1',
    habitatPhotoId: 'nepenthes-ampullaria/habitat-1',
    galleryPhotoIds: [
      'nepenthes-ampullaria/gallery-1',
      'nepenthes-ampullaria/gallery-2',
      'biome/taman-negara-canopy-walkway',
    ],
    focus: '50% 50%',
    conservationNote:
      'Xếp hạng Ít lo ngại (LC): loài nắp ấm phân bố ở các vùng đầm lầy thấp râm mát Đông Nam Á, ưa nhiệt độ ngày 28–34°C, đêm 20–24°C và độ ẩm cao 80–95%.',
    pullQuote:
      'Cây nắp ấm đất thấp mọc thành thảm ấm tròn sát mặt đất, thích nghi hứng và phân hủy mùn lá rụng bên cạnh việc bẫy côn trùng.',
    // Nguồn diet: database/seed_data.sql ("Thích nghi ăn mùn lá rụng bên cạnh bẫy côn trùng")
    diet: 'Mùn lá rụng từ tán rừng và côn trùng nhỏ',
  },
};

export function getSpeciesExtra(scientificName: string): SpeciesExtra | undefined {
  return SPECIES_EXTRAS[scientificName];
}
