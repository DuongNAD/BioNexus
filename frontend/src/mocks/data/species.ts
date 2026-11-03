import type { MockSpecies } from '../types';

// Chép đúng database/seed_data.sql mục 5: id theo thứ tự INSERT, nodeId là nút GENUS trong taxonomy.ts
export const SEED_SPECIES: MockSpecies[] = [
  {
    id: 1,
    nodeId: 19,
    scientificName: 'Eublepharis macularius',
    commonName: 'Thằn lằn da báo (Leopard Gecko)',
    conservationStatus: 'LC',
    environmentSpecs: 'Nhiệt độ: 26-32°C, Độ ẩm: 30-40%, Môi trường: Bán hoang mạc',
    description: 'Loài thằn lằn hoạt động về đêm, hiền lành, dễ nuôi trong điều kiện nuôi nhốt.',
    imageURL: 'https://bionexus.vn/images/leopard-gecko.jpg',
    referenceURL: 'https://www.gbif.org/species/5221283',
  },
  {
    id: 2,
    nodeId: 20,
    scientificName: 'Pogona vitticeps',
    commonName: 'Rồng Úc (Bearded Dragon)',
    conservationStatus: 'LC',
    environmentSpecs: 'Nhiệt độ: 26-32°C (điểm sưởi 38-42°C), Độ ẩm: 30-40%, Môi trường: Bán hoang mạc, savan khô',
    description:
      'Thằn lằn bản địa miền trung nước Úc, hoạt động ban ngày, tính tình hiền, ăn tạp (côn trùng và rau xanh).',
    imageURL: 'https://bionexus.vn/images/bearded-dragon.jpg',
    referenceURL: 'https://www.gbif.org/species/2465641',
  },
  {
    id: 3,
    nodeId: 21,
    scientificName: 'Python regius',
    commonName: 'Trăn bóng (Ball Python)',
    conservationStatus: 'NT',
    environmentSpecs: 'Nhiệt độ: 26-32°C, Độ ẩm: 50-60%, Môi trường: Savan và đồng cỏ Tây Phi',
    description:
      'Trăn cỡ nhỏ, hiền, khi sợ hãi cuộn tròn như quả bóng; phổ biến làm thú cưng với rất nhiều màu (morph).',
    imageURL: 'https://bionexus.vn/images/ball-python.jpg',
    referenceURL: 'https://www.gbif.org/species/2465380',
  },
  {
    id: 4,
    nodeId: 21,
    scientificName: 'Python bivittatus',
    commonName: 'Trăn đất (Burmese Python)',
    conservationStatus: 'VU',
    environmentSpecs: 'Nhiệt độ: 26-32°C, Độ ẩm: 60-80%, Môi trường: Rừng nhiệt đới, đầm lầy, ven sông',
    description:
      'Một trong những loài trăn lớn nhất thế giới, bản địa Nam và Đông Nam Á (có ở Việt Nam); cần chuồng rộng.',
    imageURL: 'https://bionexus.vn/images/burmese-python.jpg',
    referenceURL: 'https://www.gbif.org/species/4820533',
  },
  {
    id: 5,
    nodeId: 22,
    scientificName: 'Testudo hermanni',
    commonName: "Rùa Hermann (Hermann's Tortoise)",
    conservationStatus: 'VU',
    environmentSpecs:
      'Nhiệt độ: 20-30°C (điểm sưởi 32-35°C), Độ ẩm: 40-60%, Môi trường: Bụi rậm và đồng cỏ khô Địa Trung Hải',
    description: 'Rùa cạn cỡ nhỏ ở Nam Âu, ăn chủ yếu thực vật, có thể sống nhiều thập kỷ.',
    imageURL: 'https://bionexus.vn/images/hermann-tortoise.jpg',
    referenceURL: 'https://www.gbif.org/species/2441454',
  },
  {
    id: 6,
    nodeId: 23,
    scientificName: 'Ambystoma mexicanum',
    commonName: 'Axolotl (Kỳ giông Mexico)',
    conservationStatus: 'CR',
    environmentSpecs:
      'Nhiệt độ nước: 14-18°C, Độ ẩm: không áp dụng (thủy sinh), Môi trường: Nước ngọt sạch, ít dòng chảy',
    description:
      'Kỳ giông thủy sinh đặc hữu hồ Xochimilco (Mexico), giữ mang ngoài suốt đời và có khả năng tái sinh chi; ngoài tự nhiên cực kỳ nguy cấp.',
    imageURL: 'https://bionexus.vn/images/axolotl.jpg',
    referenceURL: 'https://www.gbif.org/species/2431950',
  },
  {
    id: 7,
    nodeId: 24,
    scientificName: 'Nepenthes rajah',
    commonName: 'Nắp ấm Rajah (Giant Malaysian Pitcher Plant)',
    conservationStatus: 'EN',
    environmentSpecs:
      'Nhiệt độ: ngày 18-26°C, đêm 10-15°C, Độ ẩm: 80-95%, Môi trường: Rừng mây núi cao (khoảng 1.500-2.650 m)',
    description:
      'Nắp ấm đặc hữu vùng núi Kinabalu và Tambuyukon (Borneo), có túi bẫy thuộc hàng lớn nhất trong chi; khó trồng ở vùng thấp.',
    imageURL: 'https://bionexus.vn/images/nepenthes-rajah.jpg',
    referenceURL: 'https://www.gbif.org/species/3702163',
  },
  {
    id: 8,
    nodeId: 24,
    scientificName: 'Nepenthes ampullaria',
    commonName: 'Nắp ấm Ampullaria',
    conservationStatus: 'LC',
    environmentSpecs: 'Nhiệt độ: 22-32°C, Độ ẩm: 70-90%, Môi trường: Rừng mưa vùng thấp, mọc sát đất',
    description: 'Nắp ấm vùng thấp có túi bẫy tròn mọc thành cụm sát gốc; dễ trồng hơn nhiều loài nắp ấm khác.',
    imageURL: 'https://bionexus.vn/images/nepenthes-ampullaria.jpg',
    referenceURL: 'https://www.gbif.org/species/7167254',
  },
  {
    id: 9,
    nodeId: 25,
    scientificName: 'Dionaea muscipula',
    commonName: 'Cây bắt ruồi Venus (Venus Flytrap)',
    conservationStatus: 'VU',
    environmentSpecs:
      'Nhiệt độ: 20-30°C (cần giai đoạn nghỉ lạnh vào mùa đông), Độ ẩm: 50-70%, Môi trường: Đầm lầy nghèo dinh dưỡng, nhiều nắng',
    description:
      'Cây ăn côn trùng bản địa vùng đồng bằng ven biển Bắc và Nam Carolina (Mỹ); lá bẫy khép lại khi côn trùng chạm vào lông cảm ứng.',
    imageURL: 'https://bionexus.vn/images/venus-flytrap.jpg',
    referenceURL: 'https://www.gbif.org/species/5421410',
  },
];
