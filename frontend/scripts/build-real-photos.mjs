#!/usr/bin/env node
/**
 * scripts/build-real-photos.mjs
 * Xây dựng toàn bộ kho ảnh thật đã kiểm chứng bằng mắt (visual audit 03/11/2026) từ:
 * 1. docs/frontend/reference/trip-photos/ (28 ảnh hành trình đã xác thực)
 * 2. frontend/scripts/.photo-candidates-audit/ (ảnh loài & sản phẩm bổ sung từ Wikimedia Commons API)
 * Sinh ra:
 * - frontend/public/trip/<name>.webp + <name>-{960,1600,1920}.{avif,webp}
 * - frontend/public/photos/<category>/<slug>-{480,960,1600}.{avif,webp} + .jpg
 * - frontend/src/content/photos.ts (với đầy đủ PHOTOS và TRIP_PHOTOS, title/alt tiếng Việt chuẩn xác và region kiểm chứng)
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const FRONTEND_DIR = path.resolve(__dirname, '..');
const REPO_ROOT = path.resolve(FRONTEND_DIR, '..');
const TRIP_REF_DIR = path.join(REPO_ROOT, 'docs', 'frontend', 'reference', 'trip-photos');
const AUDIT_CAND_DIR = path.join(__dirname, '.photo-candidates-audit');
const PUBLIC_TRIP_DIR = path.join(FRONTEND_DIR, 'public', 'trip');
const PUBLIC_PHOTOS_DIR = path.join(FRONTEND_DIR, 'public', 'photos');
const PHOTOS_TS_PATH = path.join(FRONTEND_DIR, 'src', 'content', 'photos.ts');

function licenseUrlFor(lic) {
  const l = lic.toLowerCase();
  if (l.includes('public domain') || l === 'pd') return 'https://creativecommons.org/publicdomain/mark/1.0/';
  if (l.includes('cc0')) return 'https://creativecommons.org/publicdomain/zero/1.0/';
  if (l.includes('by-sa 4.0')) return 'https://creativecommons.org/licenses/by-sa/4.0/';
  if (l.includes('by-sa 3.0')) return 'https://creativecommons.org/licenses/by-sa/3.0/';
  if (l.includes('by-sa 2.5')) return 'https://creativecommons.org/licenses/by-sa/2.5/';
  if (l.includes('by-sa 2.0')) return 'https://creativecommons.org/licenses/by-sa/2.0/';
  if (l.includes('by 4.0')) return 'https://creativecommons.org/licenses/by/4.0/';
  if (l.includes('by 3.0')) return 'https://creativecommons.org/licenses/by/3.0/';
  if (l.includes('by 2.5')) return 'https://creativecommons.org/licenses/by/2.5/';
  if (l.includes('by 2.0')) return 'https://creativecommons.org/licenses/by/2.0/';
  return 'https://creativecommons.org/licenses/';
}

async function generateBlurDataUri(inputBuffer) {
  const buf = await sharp(inputBuffer)
    .resize(16, 12, { fit: 'cover' })
    .webp({ quality: 35 })
    .toBuffer();
  return `data:image/webp;base64,${buf.toString('base64')}`;
}

async function fileExists(p) {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

async function processVariants(inputPath, outBaseRel, widths, includeJpgWidth) {
  const inputBuffer = await fs.readFile(inputPath);
  const meta0 = await sharp(inputBuffer).metadata();
  const origW = meta0.width || 1600;
  const origH = meta0.height || 1067;

  const avifSources = [];
  const webpSources = [];
  let jpgRel = '';

  const outFullBase = path.join(FRONTEND_DIR, 'public', outBaseRel);
  await fs.mkdir(path.dirname(outFullBase), { recursive: true });

  for (const w of widths) {
    const targetW = Math.min(w, origW);
    const avifRel = `${outBaseRel}-${w}.avif`;
    const webpRel = `${outBaseRel}-${w}.webp`;
    const avifFull = path.join(FRONTEND_DIR, 'public', avifRel);
    const webpFull = path.join(FRONTEND_DIR, 'public', webpRel);

    await sharp(inputBuffer)
      .resize({ width: targetW, withoutEnlargement: true })
      .avif({ quality: 52, effort: 2 })
      .toFile(avifFull);

    await sharp(inputBuffer)
      .resize({ width: targetW, withoutEnlargement: true })
      .webp({ quality: 75 })
      .toFile(webpFull);

    avifSources.push({ src: avifRel, width: w });
    webpSources.push({ src: webpRel, width: w });

    if (w === includeJpgWidth) {
      jpgRel = `${outBaseRel}-${w}.jpg`;
      const jpgFull = path.join(FRONTEND_DIR, 'public', jpgRel);
      await sharp(inputBuffer)
        .resize({ width: targetW, withoutEnlargement: true })
        .jpeg({ quality: 78, mozjpeg: true })
        .toFile(jpgFull);
    }
  }

  const placeholder = await generateBlurDataUri(inputBuffer);

  return {
    width: origW,
    height: origH,
    aspectRatio: Number((origW / origH).toFixed(2)),
    sources: {
      avif: avifSources,
      webp: webpSources,
      jpg: jpgRel || webpSources[webpSources.length - 1].src,
    },
    placeholder,
  };
}

// Metadata tiếng Việt chuẩn xác cho 28 ảnh trong TRIP_PHOTOS (đã kiểm tra từng ảnh bằng mắt)
const TRIP_VIETNAMESE_META = {
  trail: {
    title: 'Đường mòn ngập nước trong rừng mưa VQG Cúc Phương, Ninh Bình',
    alt: 'Con đường mòn đất ngập nước nông xuyên qua tán rừng mưa nhiệt đới rậm rạp tại Vườn quốc gia Cúc Phương, Ninh Bình, Việt Nam.',
    region: 'Nam và Đông Nam Á',
  },
  roots: {
    title: 'Rễ bành cây cổ thụ tại rừng nhiệt đới VQG Cát Tiên, Đồng Nai',
    alt: 'Hệ rễ bành lớn của cây cổ thụ trên nền rừng mưa nhiệt đới đất thấp tại Vườn quốc gia Cát Tiên, Việt Nam.',
    region: 'Nam và Đông Nam Á',
  },
  python: {
    title: 'Trăn đất hoang dã tại Vườn quốc gia Bardiya, Nepal',
    alt: 'Góc chụp nghiêng phần đầu của trăn đất Python bivittatus đang tựa trên cành cây xanh tại Vườn quốc gia Bardiya, Nepal.',
    scientificName: 'Python bivittatus',
  },
  boat: {
    title: 'Thuyền gỗ trên sông Tembeling ven rừng mưa Taman Negara, Malaysia',
    alt: 'Chiếc thuyền gỗ nhỏ chở người dân địa phương trên dòng sông Tembeling bao quanh bởi rừng mưa nhiệt đới Taman Negara, Malaysia.',
    region: 'Borneo, Sumatra và Malaysia',
  },
  walkway: {
    title: 'Cầu treo xuyên tán rừng mưa VQG Taman Negara, Pahang, Malaysia',
    alt: 'Cầu treo bằng dây thừng và ván gỗ đi xuyên qua tầng tán rừng mưa nhiệt đới tại Vườn quốc gia Taman Negara, bang Pahang, Malaysia.',
    region: 'Borneo, Sumatra và Malaysia',
  },
  swamp: {
    title: 'Rừng đầm lầy than bùn ngập nước tại Borneo',
    alt: 'Những thân cây thẳng có gốc bành đứng giữa mặt nước sẫm màu trong khu rừng đầm lầy than bùn đất thấp tại Borneo.',
    region: 'Borneo, Sumatra và Malaysia',
  },
  ampullaria: {
    title: 'Cụm lá sát đất và ấm tròn của Nắp ấm Ampullaria',
    alt: 'Cụm lá non xanh bóng mọc sát mặt đất bao quanh bởi những chiếc bình ấm tròn màu xanh lục của loài Nepenthes ampullaria trên nền rêu và lá khô.',
    scientificName: 'Nepenthes ampullaria',
  },
  summit: {
    title: 'Mây mù trên rừng mưa sườn núi Kinabalu, Sabah, Borneo',
    alt: 'Mây mù dày đặc hình thành trên tầng tán rừng mưa núi cao tại Kundasang, sườn núi Kinabalu, Sabah, Borneo.',
    region: 'Núi Kinabalu, Sabah, Borneo',
  },
  ferns: {
    title: 'Tán dương xỉ thân gỗ giữa rừng mây núi cao',
    alt: 'Những vòm lá dương xỉ thân gỗ Cyathea xanh mướt nổi bật trước sườn rừng núi cao phủ đầy mây mù.',
    region: 'Rừng mây nhiệt đới',
  },
  rajah: {
    title: 'Ấm dưới khổng lồ của Nắp ấm Rajah ngoài tự nhiên',
    alt: 'Bình ấm dưới cỡ lớn màu đỏ tía của loài Nepenthes rajah nằm trên thảm thực vật rừng núi Kinabalu, Borneo.',
    scientificName: 'Nepenthes rajah',
  },
  carolina: {
    title: 'Thảo nguyên thông lá dài ẩm ướt tại Bắc Carolina, Hoa Kỳ',
    alt: 'Rừng thông lá dài thưa tán với thảm cỏ ẩm dưới nắng tại vùng duyên hải Bắc Carolina, Hoa Kỳ.',
    region: 'Duyên hải Bắc và Nam Carolina, Hoa Kỳ',
  },
  venus2: {
    title: 'Cụm Cây bắt ruồi Venus ngoài tự nhiên tại Green Swamp, Bắc Carolina',
    alt: 'Cụm cây bắt ruồi Dionaea muscipula với các lá bẫy xanh tươi và lòng hồng đỏ đang bắt côn trùng tại khu bảo tồn Green Swamp, Bắc Carolina.',
    scientificName: 'Dionaea muscipula',
  },
  xochi: {
    title: 'Kênh đào sinh thái và thuyền gỗ hồ Xochimilco, Mexico City',
    alt: 'Những chiếc thuyền gỗ truyền thống đầy màu sắc trên kênh đào hồ Xochimilco tại Mexico City — nơi cư ngụ tự nhiên của kỳ giông Axolotl.',
    region: 'Hồ Xochimilco, Mexico',
  },
  axolotl: {
    title: 'Kỳ giông Axolotl màu tự nhiên tại thủy cung Aquarium Finisterrae',
    alt: 'Kỳ giông Axolotl màu xám xanh đốm đen tự nhiên với ba cặp mang ngoài dạng lông vũ đang nằm trên nền sỏi dưới nước.',
    scientificName: 'Ambystoma mexicanum',
  },
  ghana: {
    title: 'Cảnh quan thảo nguyên Savan tại miền Bắc Ghana, Tây Phi',
    alt: 'Cảnh quan thảo nguyên savan xanh mát điểm cây gỗ thưa và đàn voi châu Phi tại khu vực miền Bắc Ghana, Tây Phi.',
    region: 'Thảo nguyên Tây và Trung Phi',
  },
  ballpython: {
    title: 'Cận cảnh đầu và cổ Trăn bóng hoang dã (Python regius)',
    alt: 'Cận cảnh phần đầu và cổ của cá thể trăn bóng Python regius màu tự nhiên nâu đen điểm vệt vàng đồng trên nền vỏ cây.',
    scientificName: 'Python regius',
  },
  baloch: {
    title: 'Sườn núi đá khô hạn lúc hoàng hôn tại Turbat, Balochistan, Pakistan',
    alt: 'Dãy núi đá trầm tích khô cằn và thảm cây bụi thưa dưới ánh hoàng hôn tại Turbat, tỉnh Balochistan, Pakistan.',
    region: 'Pakistan, Afghanistan và Tây Bắc Ấn Độ',
  },
  gecko: {
    title: 'Thằn lằn da báo hoang dã trên nền cát (Eublepharis macularius)',
    alt: 'Cá thể thằn lằn da báo Eublepharis macularius với các dải màu xám nâu sẫm xen kẽ nền kem nhạt và đốm đen sần hạt trên cát.',
    scientificName: 'Eublepharis macularius',
  },
  uluru: {
    title: 'Bán hoang mạc đất đỏ tại VQG Uluru-Kata Tjuta, miền Trung nước Úc',
    alt: 'Khối đá sa thạch đỏ Uluru vươn cao trên thảm cỏ khô và cây gỗ thưa tại Vườn quốc gia Uluru-Kata Tjuta, miền Trung nước Úc.',
    region: 'Miền Trung nước Úc',
  },
  dragon: {
    title: 'Rồng Úc phơi nắng trên nền cát (Pogona vitticeps)',
    alt: 'Cá thể Rồng Úc Pogona vitticeps màu vàng cát đang nằm phơi nắng trên nền cát mịn, lộ rõ hàng vảy gai chạy dọc hai bên sườn.',
    scientificName: 'Pogona vitticeps',
  },
  maquis: {
    title: 'Thảm thực vật cây bụi Maquis tại dãy Massif des Maures, miền Nam nước Pháp',
    alt: 'Sườn đồi phủ thảm cây bụi Maquis và hoa thạch nam trắng tại dãy Massif des Maures, vùng Provence, miền Nam nước Pháp.',
    region: 'Nam Âu — Địa Trung Hải',
  },
  hermann: {
    title: 'Rùa Hermann bước đi trên thảm cỏ hoa cúc trắng (Testudo hermanni)',
    alt: 'Cá thể rùa cạn Testudo hermanni với chiếc mai vòm màu vàng rơm đốm đen đang bước đi giữa thảm cỏ xanh và hoa cúc trắng.',
    scientificName: 'Testudo hermanni',
  },
  calanque: {
    title: 'Rừng thông ven biển Địa Trung Hải tại vịnh Calanque de Port-Pin, Cassis, Pháp',
    alt: 'Lối mòn đá vôi dưới tán rừng thông Aleppo dẫn ra làn nước biển xanh biếc tại vịnh Calanque de Port-Pin, Cassis, miền Nam nước Pháp.',
    region: 'Nam Âu — Địa Trung Hải',
  },
  rajah2: {
    title: 'Cây Nắp ấm Rajah non với tán lá xanh và bình đỏ tía',
    alt: 'Cây Nepenthes rajah kích thước nhỏ với cụm lá xanh bóng sát đất và một bình ấm màu đỏ tía đang phát triển.',
    scientificName: 'Nepenthes rajah',
  },
  ampullaria2: {
    title: 'Thảm ấm đất của Nắp ấm Ampullaria hứng lá mục dưới tán rừng',
    alt: 'Quần thể hàng chục bình ấm Nepenthes ampullaria mọc chen chúc giữa lớp rêu và cành lá khô rụng trên nền rừng.',
    scientificName: 'Nepenthes ampullaria',
  },
  axolotl2: {
    title: 'Kỳ giông Axolotl dòng Leucistic trắng hồng với mang ngoài đỏ tươi',
    alt: 'Cá thể kỳ giông Axolotl đột biến Leucistic thân trắng hồng nhạt với ba cặp mang ngoài màu đỏ hồng nổi bật.',
    scientificName: 'Ambystoma mexicanum',
  },
  gecko2: {
    title: 'Cận cảnh đầu, mí mắt động và đồng tử dọc của Thằn lằn da báo',
    alt: 'Ảnh chụp cận cảnh phần đầu thằn lằn da báo màu vàng tươi đốm đen, thấy rõ mí mắt có thể nhắm mở và đồng tử dọc.',
    scientificName: 'Eublepharis macularius',
  },
  venus: {
    title: 'Hai thùy lá bẫy và hàng gai viền của Cây bắt ruồi Venus',
    alt: 'Cận cảnh hai chiếc bẫy lá Dionaea muscipula màu xanh viền gai răng lược và lòng bẫy ánh hồng giữa lớp lá thông khô.',
    scientificName: 'Dionaea muscipula',
  },
};

// Danh mục 66 mục PHOTOS đã kiểm chứng từng ảnh bằng mắt (0 trùng lặp giữa hero/portrait/habitat/gallery/product)
const PHOTO_DEFINITIONS = [
  // === 1. Axolotl (Ambystoma mexicanum - CR) ===
  {
    id: 'axolotl/hero-1',
    sourceKey: 'trip:axolotl',
    outBase: 'photos/axolotl/hero',
    widths: [480, 960, 1600],
    jpgW: 1600,
    title: 'Kỳ giông Axolotl màu tự nhiên (Aquarium Finisterrae)',
    scientificName: 'Ambystoma mexicanum',
    role: 'hero',
    focus: '52% 48%',
    alt: 'Kỳ giông Axolotl màu xám xanh đốm đen tự nhiên với ba cặp mang ngoài dạng lông vũ đang nằm trên nền sỏi dưới nước.',
  },
  {
    id: 'axolotl/portrait-1',
    sourceKey: 'audit:cand-axolotl4',
    outBase: 'photos/axolotl/portrait',
    widths: [480, 960],
    jpgW: 960,
    title: 'Chân dung cận cảnh đầu và mang ngoài Kỳ giông Axolotl',
    scientificName: 'Ambystoma mexicanum',
    role: 'portrait',
    focus: '50% 45%',
    alt: 'Cận cảnh phần đầu rộng và chùm mang ngoài xòe như lông vũ của kỳ giông Axolotl màu nâu đốm tự nhiên.',
  },
  {
    id: 'axolotl/habitat-1',
    sourceKey: 'trip:xochi',
    outBase: 'photos/axolotl/habitat',
    widths: [960, 1600],
    jpgW: 1600,
    title: 'Kênh đào sinh thái hồ Xochimilco, Mexico City',
    scientificName: 'Ambystoma mexicanum',
    region: 'Hồ Xochimilco, Mexico',
    role: 'habitat',
    focus: '50% 55%',
    alt: 'Những chiếc thuyền gỗ truyền thống đầy màu sắc trên kênh đào hồ Xochimilco tại Mexico City — nơi cư ngụ tự nhiên của kỳ giông Axolotl.',
  },
  {
    id: 'axolotl/gallery-1',
    sourceKey: 'audit:cand-axolotl3',
    outBase: 'photos/axolotl/gallery-1',
    widths: [480, 960],
    jpgW: 960,
    title: 'Kỳ giông Axolotl màu nâu đốm tự nhiên trên nền cát',
    scientificName: 'Ambystoma mexicanum',
    role: 'gallery',
    focus: '50% 50%',
    alt: 'Cá thể kỳ giông Axolotl màu nâu sẫm đốm hạt tự nhiên đang bò trên nền cát mịn dưới đáy bể.',
  },
  {
    id: 'axolotl/gallery-2',
    sourceKey: 'audit:axolotl-g2',
    outBase: 'photos/axolotl/gallery-2',
    widths: [480, 960],
    jpgW: 960,
    title: 'Góc nhìn trực diện đầu Kỳ giông Axolotl dưới nước',
    scientificName: 'Ambystoma mexicanum',
    role: 'gallery',
    focus: '50% 50%',
    alt: 'Góc chụp trực diện phần đầu dẹp rộng, đôi mắt tròn không mí và mang ngoài tím xám của kỳ giông Axolotl trên nền đá cuội.',
  },
  {
    id: 'axolotl/gallery-3',
    sourceKey: 'audit:axolotl-g3',
    outBase: 'photos/axolotl/gallery-3',
    widths: [480, 960],
    jpgW: 960,
    title: 'Kỳ giông Axolotl ẩn mình giữa cụm thủy sinh',
    scientificName: 'Ambystoma mexicanum',
    role: 'gallery',
    focus: '45% 55%',
    alt: 'Cá thể kỳ giông Axolotl màu nâu đen ẩn mình bên bụi rong thủy sinh trên nền cát vàng.',
  },

  // === 2. Nắp ấm Rajah (Nepenthes rajah - EN) ===
  {
    id: 'nepenthes-rajah/hero-1',
    sourceKey: 'trip:rajah',
    outBase: 'photos/nepenthes-rajah/hero',
    widths: [960, 1600],
    jpgW: 1600,
    title: 'Ấm dưới khổng lồ của Nắp ấm Rajah ngoài tự nhiên',
    scientificName: 'Nepenthes rajah',
    role: 'hero',
    focus: '52% 50%',
    alt: 'Bình ấm dưới cỡ lớn màu đỏ tía của loài Nepenthes rajah nằm trên thảm lá khô tại rừng núi Kinabalu, Sabah, Borneo.',
  },
  {
    id: 'nepenthes-rajah/portrait-1',
    sourceKey: 'audit:new-rajah-real-1',
    outBase: 'photos/nepenthes-rajah/portrait',
    widths: [480, 960],
    jpgW: 960,
    title: 'Cây Nắp ấm Rajah hoang dã với tán lá lớn và bình ấm đỏ nâu giữa bụi dương xỉ',
    scientificName: 'Nepenthes rajah',
    role: 'portrait',
    focus: '55% 65%',
    alt: 'Bụi cây Nepenthes rajah mọc giữa thảm cỏ và dương xỉ rừng núi với các phiến lá xanh dài, tua cuốn xoắn và chiếc bình ấm màu đỏ nâu mở nắp ở góc dưới bên phải.',
  },
  {
    id: 'nepenthes-rajah/habitat-1',
    sourceKey: 'trip:summit',
    outBase: 'photos/nepenthes-rajah/habitat',
    widths: [960],
    jpgW: 960,
    title: 'Rừng mây sườn núi Kinabalu tại Kundasang, Sabah, Borneo',
    scientificName: 'Nepenthes rajah',
    region: 'Núi Kinabalu, Sabah, Borneo',
    role: 'habitat',
    focus: '50% 45%',
    alt: 'Mây mù dày đặc bao phủ tầng tán rừng mưa núi cao trên sườn núi Kinabalu tại Kundasang, Sabah, Malaysia.',
  },
  {
    id: 'nepenthes-rajah/gallery-1',
    sourceKey: 'audit:rajah-g1',
    outBase: 'photos/nepenthes-rajah/gallery-1',
    widths: [480, 960],
    jpgW: 960,
    title: 'Bụi Nắp ấm Rajah tự nhiên tại Mesilau, núi Kinabalu',
    scientificName: 'Nepenthes rajah',
    role: 'gallery',
    focus: '50% 50%',
    alt: 'Cây Nepenthes rajah trưởng thành với phiến lá xanh dày hình khiên và bình ấm đỏ tía tại khu vực Mesilau, núi Kinabalu, Borneo.',
  },
  {
    id: 'nepenthes-rajah/gallery-2',
    sourceKey: 'audit:rajah-g2',
    outBase: 'photos/nepenthes-rajah/gallery-2',
    widths: [480, 960],
    jpgW: 960,
    title: 'Bình Nắp ấm Rajah bên vách đá thác nước núi Kinabalu',
    scientificName: 'Nepenthes rajah',
    role: 'gallery',
    focus: '65% 55%',
    alt: 'Bình bẫy màu đỏ cam của Nepenthes rajah treo trên vách đá ẩm ướt cạnh dòng thác nhỏ trên núi Kinabalu, Sabah.',
  },
  {
    id: 'nepenthes-rajah/gallery-3',
    sourceKey: 'audit:rajah-g3',
    outBase: 'photos/nepenthes-rajah/gallery-3',
    widths: [480, 960],
    jpgW: 960,
    title: 'Tán lá hình khiên của quần thể Nắp ấm Rajah trên núi Kinabalu',
    scientificName: 'Nepenthes rajah',
    role: 'gallery',
    focus: '50% 50%',
    alt: 'Cụm cây Nepenthes rajah mọc giữa thảm cỏ và cây bụi ẩm trên sườn núi Kinabalu, lộ rõ gân lá đính hình khiên đặc trưng.',
  },

  // === 3. Trăn bóng (Python regius - NT) ===
  {
    id: 'ball-python/hero-1',
    sourceKey: 'trip:ballpython',
    outBase: 'photos/ball-python/hero',
    widths: [960, 1600],
    jpgW: 1600,
    title: 'Cận cảnh đầu và cổ Trăn bóng hoang dã (Python regius)',
    scientificName: 'Python regius',
    role: 'hero',
    focus: '50% 50%',
    alt: 'Cận cảnh phần đầu và cổ của cá thể trăn bóng Python regius màu tự nhiên nâu đen điểm vệt vàng đồng trên nền vỏ cây.',
  },
  {
    id: 'ball-python/portrait-1',
    sourceKey: 'audit:cand-ballpython3',
    outBase: 'photos/ball-python/portrait',
    widths: [480, 960],
    jpgW: 960,
    title: 'Trăn bóng cuộn mình ẩn nấp giữa lớp vỏ cây khô',
    scientificName: 'Python regius',
    role: 'portrait',
    focus: '50% 48%',
    alt: 'Cá thể trăn bóng Python regius cuộn tròn thân mình đặc trưng giữa hai mảnh vỏ cây khô.',
  },
  {
    id: 'ball-python/habitat-1',
    sourceKey: 'trip:ghana',
    outBase: 'photos/ball-python/habitat',
    widths: [960],
    jpgW: 960,
    title: 'Cảnh quan thảo nguyên Savan tại miền Bắc Ghana, Tây Phi',
    scientificName: 'Python regius',
    region: 'Thảo nguyên Tây và Trung Phi',
    role: 'habitat',
    focus: '50% 50%',
    alt: 'Cảnh quan thảo nguyên savan xanh mát điểm cây gỗ thưa và đàn voi châu Phi tại khu vực miền Bắc Ghana, Tây Phi.',
  },
  {
    id: 'ball-python/gallery-1',
    sourceKey: 'audit:ballpython-g2',
    outBase: 'photos/ball-python/gallery-1',
    widths: [480, 960],
    jpgW: 960,
    title: 'Cấu trúc vảy môi và hố cảm nhiệt của Trăn bóng',
    scientificName: 'Python regius',
    role: 'gallery',
    focus: '55% 50%',
    alt: 'Ảnh chụp cận cảnh phần đầu trăn bóng Python regius cho thấy rõ mắt tròn đen và hàng hố cảm nhiệt dọc hàm trên.',
  },
  {
    id: 'ball-python/gallery-2',
    sourceKey: 'audit:ballpython-g3c',
    outBase: 'photos/ball-python/gallery-2',
    widths: [480, 960],
    jpgW: 960,
    title: 'Trăn bóng trưởng thành cuộn tròn trên nền vỏ thông và rêu khô',
    scientificName: 'Python regius',
    role: 'gallery',
    focus: '50% 50%',
    alt: 'Cá thể trăn bóng cái trưởng thành (Python regius) màu tự nhiên nâu đen và vàng đồng đang nằm cuộn tròn trên lớp vỏ thông.',
  },
  {
    id: 'ball-python/gallery-3',
    sourceKey: 'audit:cand-ballpython4',
    outBase: 'photos/ball-python/gallery-3',
    widths: [480, 960],
    jpgW: 960,
    title: 'Trăn bóng biến thể giảm sắc tố đen (Hypomelanistic)',
    scientificName: 'Python regius',
    role: 'gallery',
    focus: '50% 50%',
    alt: 'Cá thể trăn bóng Python regius dòng đột biến Hypomelanistic cuộn thân trên nền trắng với tông màu nâu sáng và vàng kem.',
  },

  // === 4. Thằn lằn da báo (Eublepharis macularius - LC) ===
  {
    id: 'leopard-gecko/hero-1',
    sourceKey: 'trip:gecko',
    outBase: 'photos/leopard-gecko/hero',
    widths: [960, 1600],
    jpgW: 1600,
    title: 'Thằn lằn da báo hoang dã trên nền cát (Eublepharis macularius)',
    scientificName: 'Eublepharis macularius',
    role: 'hero',
    focus: '52% 48%',
    alt: 'Cá thể thằn lằn da báo Eublepharis macularius với các dải màu xám nâu sẫm xen kẽ nền kem nhạt và đốm đen sần hạt trên cát.',
  },
  {
    id: 'leopard-gecko/portrait-1',
    sourceKey: 'trip:gecko2',
    outBase: 'photos/leopard-gecko/portrait',
    widths: [480, 960],
    jpgW: 960,
    title: 'Cận cảnh đầu, mí mắt động và đồng tử dọc của Thằn lằn da báo',
    scientificName: 'Eublepharis macularius',
    role: 'portrait',
    focus: '50% 45%',
    alt: 'Ảnh chụp cận cảnh phần đầu thằn lằn da báo màu vàng tươi đốm đen, thấy rõ mí mắt có thể nhắm mở và đồng tử dọc.',
  },
  {
    id: 'leopard-gecko/habitat-1',
    sourceKey: 'trip:baloch',
    outBase: 'photos/leopard-gecko/habitat',
    widths: [960],
    jpgW: 960,
    title: 'Sườn núi đá khô hạn lúc hoàng hôn tại Turbat, Balochistan, Pakistan',
    scientificName: 'Eublepharis macularius',
    region: 'Pakistan, Afghanistan và Tây Bắc Ấn Độ',
    role: 'habitat',
    focus: '50% 55%',
    alt: 'Dãy núi đá trầm tích khô cằn và thảm cây bụi thưa dưới ánh hoàng hôn tại Turbat, tỉnh Balochistan, Pakistan.',
  },
  {
    id: 'leopard-gecko/gallery-1',
    sourceKey: 'audit:new-gecko-3',
    outBase: 'photos/leopard-gecko/gallery-1',
    widths: [480, 960],
    jpgW: 960,
    title: 'Thằn lằn da báo dưới vòm cành cây khô (Eublepharis macularius)',
    scientificName: 'Eublepharis macularius',
    role: 'gallery',
    focus: '50% 50%',
    alt: 'Thằn lằn da báo Eublepharis macularius với lớp da đốm nâu đen dày đặc và mắt con ngươi dọc đang đứng dưới nhánh cây cong trên nền cát sáng.',
  },
  {
    id: 'leopard-gecko/gallery-2',
    sourceKey: 'audit:new-gecko-4',
    outBase: 'photos/leopard-gecko/gallery-2',
    widths: [480, 960],
    jpgW: 960,
    title: 'Thằn lằn da báo trên nền sỏi đá núi lửa (Eublepharis macularius)',
    scientificName: 'Eublepharis macularius',
    role: 'gallery',
    focus: '50% 50%',
    alt: 'Cá thể thằn lằn da báo Eublepharis macularius lưng vàng nhạt điểm đốm đen và đuôi khoang trắng xám đang bò trên lớp sỏi đá nhiều màu cạnh vách đá.',
  },
  {
    id: 'leopard-gecko/gallery-3',
    sourceKey: 'audit:cand-gecko4',
    outBase: 'photos/leopard-gecko/gallery-3',
    widths: [480, 960],
    jpgW: 960,
    title: 'Thằn lằn da báo leo trên phiến đá trong chuồng nuôi cạn',
    scientificName: 'Eublepharis macularius',
    role: 'gallery',
    focus: '50% 50%',
    alt: 'Cá thể thằn lằn da báo hoa văn vàng đốm đen đang đứng trên tảng đá cuội bên cạnh chén khoáng canxi.',
  },

  // === 5. Cây bắt ruồi Venus (Dionaea muscipula - VU) ===
  {
    id: 'venus-flytrap/hero-1',
    sourceKey: 'trip:venus2',
    outBase: 'photos/venus-flytrap/hero',
    widths: [960, 1600],
    jpgW: 1600,
    title: 'Cụm Cây bắt ruồi Venus ngoài tự nhiên tại Green Swamp, Bắc Carolina',
    scientificName: 'Dionaea muscipula',
    role: 'hero',
    focus: '50% 50%',
    alt: 'Cụm cây bắt ruồi Dionaea muscipula với các lá bẫy xanh tươi và lòng hồng đỏ đang bắt côn trùng tại khu bảo tồn Green Swamp, Bắc Carolina, Hoa Kỳ.',
  },
  {
    id: 'venus-flytrap/portrait-1',
    sourceKey: 'audit:cand-venus2',
    outBase: 'photos/venus-flytrap/portrait',
    widths: [480, 960],
    jpgW: 960,
    title: 'Hai thùy lá bẫy và hàng gai viền của Cây bắt ruồi Venus',
    scientificName: 'Dionaea muscipula',
    role: 'portrait',
    focus: '50% 48%',
    alt: 'Cận cảnh hai chiếc bẫy lá Dionaea muscipula màu xanh viền gai răng lược và lòng bẫy ánh hồng giữa lớp lá thông khô.',
  },
  {
    id: 'venus-flytrap/habitat-1',
    sourceKey: 'trip:carolina',
    outBase: 'photos/venus-flytrap/habitat',
    widths: [960],
    jpgW: 960,
    title: 'Thảo nguyên thông lá dài ẩm ướt tại Bắc Carolina, Hoa Kỳ',
    scientificName: 'Dionaea muscipula',
    region: 'Duyên hải Bắc và Nam Carolina, Hoa Kỳ',
    role: 'habitat',
    focus: '50% 50%',
    alt: 'Rừng thông lá dài thưa tán với thảm cỏ ẩm dưới nắng tại vùng duyên hải Bắc Carolina, Hoa Kỳ — sinh cảnh tự nhiên của cây bắt ruồi Venus.',
  },
  {
    id: 'venus-flytrap/gallery-1',
    sourceKey: 'audit:cand-venus3',
    outBase: 'photos/venus-flytrap/gallery-1',
    widths: [480, 960],
    jpgW: 960,
    title: 'Đại cận cảnh sáu sợi lông cảm ứng trong lòng bẫy Cây bắt ruồi Venus',
    scientificName: 'Dionaea muscipula',
    role: 'gallery',
    focus: '50% 50%',
    alt: 'Ảnh chụp đại cận cảnh hai thùy lá bẫy màu đỏ tươi của Dionaea muscipula mở rộng, lộ rõ ba sợi lông cảm ứng cơ học trên mỗi thùy.',
  },
  {
    id: 'venus-flytrap/gallery-2',
    sourceKey: 'audit:venus-g2b',
    outBase: 'photos/venus-flytrap/gallery-2',
    widths: [480, 960],
    jpgW: 960,
    title: 'Hoa trắng năm cánh của Cây bắt ruồi Venus (Dionaea muscipula)',
    scientificName: 'Dionaea muscipula',
    role: 'gallery',
    focus: '50% 50%',
    alt: 'Cận cảnh bông hoa màu trắng năm cánh với gân xanh nhạt và nhị vàng của loài cây bắt ruồi Dionaea muscipula.',
  },
  {
    id: 'venus-flytrap/gallery-3',
    sourceKey: 'audit:venus-g3b',
    outBase: 'photos/venus-flytrap/gallery-3',
    widths: [480, 960],
    jpgW: 960,
    title: 'Cụm Cây bắt ruồi Venus trồng chậu tại Vườn thực vật Skopje',
    scientificName: 'Dionaea muscipula',
    role: 'gallery',
    focus: '50% 55%',
    alt: 'Chậu cây bắt ruồi Dionaea muscipula với nhiều bẫy lá xanh lòng đỏ hồng đang mở rộng dưới ánh nắng.',
  },

  // === 6. Trăn đất (Python bivittatus - VU) ===
  {
    id: 'burmese-python/hero-1',
    sourceKey: 'trip:python',
    outBase: 'photos/burmese-python/hero',
    widths: [960, 1600],
    jpgW: 1600,
    title: 'Trăn đất hoang dã tại Vườn quốc gia Bardiya, Nepal',
    scientificName: 'Python bivittatus',
    role: 'hero',
    focus: '52% 50%',
    alt: 'Góc chụp nghiêng phần đầu của trăn đất Python bivittatus đang tựa trên cành cây xanh tại Vườn quốc gia Bardiya, Nepal.',
  },
  {
    id: 'burmese-python/portrait-1',
    sourceKey: 'audit:cand-python4',
    outBase: 'photos/burmese-python/portrait',
    widths: [480, 960],
    jpgW: 960,
    title: 'Cận cảnh đầu và thân cuộn của Trăn đất (Python bivittatus)',
    scientificName: 'Python bivittatus',
    role: 'portrait',
    focus: '50% 45%',
    alt: 'Cận cảnh phần đầu với vệt mũi tên tối màu và lớp vảy bóng của cá thể trăn đất Python bivittatus đang cuộn mình.',
  },
  {
    id: 'burmese-python/habitat-1',
    sourceKey: 'trip:roots',
    outBase: 'photos/burmese-python/habitat',
    widths: [960],
    jpgW: 960,
    title: 'Rễ bành cây cổ thụ tại rừng nhiệt đới Vườn quốc gia Cát Tiên, Việt Nam',
    scientificName: 'Python bivittatus',
    region: 'Nam và Đông Nam Á',
    role: 'habitat',
    focus: '50% 50%',
    alt: 'Hệ rễ bành khổng lồ của cây tung cổ thụ giữa rừng mưa nhiệt đới đất thấp tại Vườn quốc gia Cát Tiên, Đồng Nai, Việt Nam.',
  },
  {
    id: 'burmese-python/gallery-1',
    sourceKey: 'audit:burmese-g1',
    outBase: 'photos/burmese-python/gallery-1',
    widths: [480, 960],
    jpgW: 960,
    title: 'Hoa văn hình mũi tên trên đỉnh đầu Trăn đất (Python bivittatus)',
    scientificName: 'Python bivittatus',
    role: 'gallery',
    focus: '55% 50%',
    alt: 'Góc chụp từ trên xuống phần đầu và cổ của trăn đất Python bivittatus thể hiện rõ hoa văn hình mũi tên nâu sẫm viền vàng kem.',
  },
  {
    id: 'burmese-python/gallery-2',
    sourceKey: 'audit:burmese-g2',
    outBase: 'photos/burmese-python/gallery-2',
    widths: [480, 960],
    jpgW: 960,
    title: 'Các vòng thân và lớp vảy hoa văn da báo của Trăn đất',
    scientificName: 'Python bivittatus',
    role: 'gallery',
    focus: '50% 50%',
    alt: 'Cá thể trăn đất Python bivittatus cuộn nhiều vòng thân dày với các mảng màu nâu đồng viền đen ánh kim.',
  },

  // === 7. Rồng Úc (Pogona vitticeps - LC) ===
  {
    id: 'bearded-dragon/hero-1',
    sourceKey: 'trip:dragon',
    outBase: 'photos/bearded-dragon/hero',
    widths: [960, 1600],
    jpgW: 1600,
    title: 'Rồng Úc phơi nắng trên nền cát (Pogona vitticeps)',
    scientificName: 'Pogona vitticeps',
    role: 'hero',
    focus: '50% 45%',
    alt: 'Cá thể Rồng Úc Pogona vitticeps màu vàng cát đang nằm phơi nắng trên nền cát mịn, lộ rõ hàng vảy gai chạy dọc hai bên sườn.',
  },
  {
    id: 'bearded-dragon/portrait-1',
    sourceKey: 'audit:cand-dragon3',
    outBase: 'photos/bearded-dragon/portrait',
    widths: [480, 960],
    jpgW: 960,
    title: 'Hình thái toàn thân nhìn từ trên xuống của Rồng Úc',
    scientificName: 'Pogona vitticeps',
    role: 'portrait',
    focus: '50% 50%',
    alt: 'Góc chụp từ trên xuống toàn bộ cơ thể dẹp rộng, đầu hình tam giác và đuôi dài của Rồng Úc Pogona vitticeps trên cát.',
  },
  {
    id: 'bearded-dragon/habitat-1',
    sourceKey: 'trip:uluru',
    outBase: 'photos/bearded-dragon/habitat',
    widths: [960],
    jpgW: 960,
    title: 'Bán hoang mạc đất đỏ tại Vườn quốc gia Uluru-Kata Tjuta, miền Trung nước Úc',
    scientificName: 'Pogona vitticeps',
    region: 'Miền Trung nước Úc',
    role: 'habitat',
    focus: '50% 50%',
    alt: 'Khối đá sa thạch đỏ Uluru vươn cao trên thảm cỏ khô và cây gỗ thưa tại Vườn quốc gia Uluru-Kata Tjuta, miền Trung nước Úc.',
  },
  {
    id: 'bearded-dragon/gallery-1',
    sourceKey: 'audit:new-dragon-4',
    outBase: 'photos/bearded-dragon/gallery-1',
    widths: [480, 960],
    jpgW: 960,
    title: 'Chân dung Rồng Úc ngẩng đầu bên vách đá sa thạch (Pogona vitticeps)',
    scientificName: 'Pogona vitticeps',
    role: 'gallery',
    focus: '60% 45%',
    alt: 'Cận cảnh đầu và cổ Rồng Úc Pogona vitticeps màu vàng cát sáng đang bám trên tảng đá sa thạch, nổi bật với hàng vảy gai nhọn quanh hàm và cổ họng.',
  },
  {
    id: 'bearded-dragon/gallery-2',
    sourceKey: 'audit:new-dragon-5',
    outBase: 'photos/bearded-dragon/gallery-2',
    widths: [480, 960],
    jpgW: 960,
    title: 'Rồng Úc hoang dã nằm phơi nắng trên nền sỏi đá đỏ (Pogona vitticeps)',
    scientificName: 'Pogona vitticeps',
    role: 'gallery',
    focus: '50% 50%',
    alt: 'Cá thể Rồng Úc Pogona vitticeps màu nâu xám tự nhiên nằm áp sát mặt đất trải đầy sỏi đá đỏ trắng và những cụm cây bụi nhỏ ngoài hoang mạc.',
  },
  {
    id: 'bearded-dragon/gallery-3',
    sourceKey: 'audit:bearded-g3',
    outBase: 'photos/bearded-dragon/gallery-3',
    widths: [480, 960],
    jpgW: 960,
    title: 'Rồng Úc hoang dã sắc cam đỏ trên mỏm đá tại miền Trung nước Úc',
    scientificName: 'Pogona vitticeps',
    role: 'gallery',
    focus: '45% 45%',
    alt: 'Cá thể Rồng Úc Pogona vitticeps hoang dã với phần đầu và cổ ánh màu cam đất đang đứng trên mỏm đá dưới nắng tại Úc.',
  },

  // === 8. Rùa Hermann (Testudo hermanni - VU) ===
  {
    id: 'hermann-tortoise/hero-1',
    sourceKey: 'trip:hermann',
    outBase: 'photos/hermann-tortoise/hero',
    widths: [960, 1600],
    jpgW: 1600,
    title: 'Rùa Hermann bước đi trên thảm cỏ hoa cúc trắng (Testudo hermanni)',
    scientificName: 'Testudo hermanni',
    role: 'hero',
    focus: '50% 52%',
    alt: 'Cá thể rùa cạn Testudo hermanni với chiếc mai vòm màu vàng rơm đốm đen đang bước đi giữa thảm cỏ xanh và hoa cúc trắng.',
  },
  {
    id: 'hermann-tortoise/portrait-1',
    sourceKey: 'audit:cand-hermann4',
    outBase: 'photos/hermann-tortoise/portrait',
    widths: [480, 960],
    jpgW: 960,
    title: 'Cận cảnh đầu, chân vảy lớn và mai trước của Rùa Hermann',
    scientificName: 'Testudo hermanni',
    role: 'portrait',
    focus: '50% 50%',
    alt: 'Góc chụp cận cảnh phần đầu và hai chân trước phủ vảy dày của rùa Hermann ẩn mình giữa đám cỏ xanh.',
  },
  {
    id: 'hermann-tortoise/habitat-1',
    sourceKey: 'trip:maquis',
    outBase: 'photos/hermann-tortoise/habitat',
    widths: [960],
    jpgW: 960,
    title: 'Thảm thực vật cây bụi Maquis tại dãy Massif des Maures, miền Nam nước Pháp',
    scientificName: 'Testudo hermanni',
    region: 'Nam Âu — Địa Trung Hải',
    role: 'habitat',
    focus: '50% 50%',
    alt: 'Sườn đồi phủ thảm cây bụi Maquis và hoa thạch nam trắng tại dãy Massif des Maures, vùng Provence, miền Nam nước Pháp.',
  },
  {
    id: 'hermann-tortoise/gallery-1',
    sourceKey: 'audit:hermann-g1',
    outBase: 'photos/hermann-tortoise/gallery-1',
    widths: [480, 960],
    jpgW: 960,
    title: 'Rùa Hermann con vừa nở đang chui ra khỏi vỏ trứng',
    scientificName: 'Testudo hermanni',
    role: 'gallery',
    focus: '50% 50%',
    alt: 'Khoảnh khắc cá thể rùa Hermann non (Testudo hermanni) thò đầu và chân trước có vảy ra khỏi lớp vỏ trứng trắng vừa nứt.',
  },
  {
    id: 'hermann-tortoise/gallery-2',
    sourceKey: 'audit:hermann-g2',
    outBase: 'photos/hermann-tortoise/gallery-2',
    widths: [480, 960],
    jpgW: 960,
    title: 'Rùa Hermann phân loài phương Đông tại đảo Pag, Croatia',
    scientificName: 'Testudo hermanni',
    role: 'gallery',
    focus: '50% 50%',
    alt: 'Cá thể rùa cạn Testudo hermanni boettgeri với mai vòm cao màu vàng lục và các mảng đen rõ nét đang bò trên nền đá vôi tại đảo Pag, Croatia.',
  },

  // === 9. Nắp ấm Ampullaria (Nepenthes ampullaria - LC) ===
  {
    id: 'nepenthes-ampullaria/hero-1',
    sourceKey: 'trip:ampullaria',
    outBase: 'photos/nepenthes-ampullaria/hero',
    widths: [960, 1600],
    jpgW: 1600,
    title: 'Cụm lá sát đất và ấm tròn của Nắp ấm Ampullaria',
    scientificName: 'Nepenthes ampullaria',
    role: 'hero',
    focus: '50% 50%',
    alt: 'Cụm lá non xanh bóng mọc sát mặt đất bao quanh bởi những chiếc bình ấm tròn màu xanh lục của loài Nepenthes ampullaria trên nền rêu và lá khô.',
  },
  {
    id: 'nepenthes-ampullaria/portrait-1',
    sourceKey: 'audit:cand-ampullaria2',
    outBase: 'photos/nepenthes-ampullaria/portrait',
    widths: [480, 960],
    jpgW: 960,
    title: 'Chùm bình Nắp ấm Ampullaria xanh đốm đỏ nâu trên thân leo',
    scientificName: 'Nepenthes ampullaria',
    role: 'portrait',
    focus: '50% 50%',
    alt: 'Chùm nhiều bình ấm hình cầu màu xanh cốm điểm đốm đỏ nâu với vành môi xanh bóng của loài Nepenthes ampullaria trong rừng ẩm.',
  },
  {
    id: 'nepenthes-ampullaria/habitat-1',
    sourceKey: 'trip:swamp',
    outBase: 'photos/nepenthes-ampullaria/habitat',
    widths: [960],
    jpgW: 960,
    title: 'Rừng đầm lầy than bùn ngập nước tại Borneo',
    scientificName: 'Nepenthes ampullaria',
    region: 'Borneo, Sumatra và Malaysia',
    role: 'habitat',
    focus: '50% 50%',
    alt: 'Những thân cây có gốc bành đứng giữa mặt nước sẫm màu trong khu rừng đầm lầy than bùn đất thấp tại đảo Borneo.',
  },
  {
    id: 'nepenthes-ampullaria/gallery-1',
    sourceKey: 'audit:cand-ampullaria4',
    outBase: 'photos/nepenthes-ampullaria/gallery-1',
    widths: [480, 960],
    jpgW: 960,
    title: 'Thảm ấm đất của Nắp ấm Ampullaria hứng lá mục dưới tán rừng',
    scientificName: 'Nepenthes ampullaria',
    role: 'gallery',
    focus: '50% 50%',
    alt: 'Quần thể hàng chục bình ấm Nepenthes ampullaria mọc chen chúc giữa lớp rêu và cành lá khô rụng trên nền rừng.',
  },
  {
    id: 'nepenthes-ampullaria/gallery-2',
    sourceKey: 'audit:ampullaria-g2',
    outBase: 'photos/nepenthes-ampullaria/gallery-2',
    widths: [480, 960],
    jpgW: 960,
    title: 'Miệng ấm tròn mở rộng và nắp ngửa đặc trưng của Nắp ấm Ampullaria',
    scientificName: 'Nepenthes ampullaria',
    role: 'gallery',
    focus: '50% 50%',
    alt: 'Cận cảnh cụm bình Nepenthes ampullaria màu xanh lục với nắp bình nhỏ hẹp uốn ngửa ra sau để hứng mùn lá rụng.',
  },

  // === 10 Sản phẩm sinh vật cảnh (khớp chính xác tên sản phẩm & biến thể) ===
  {
    id: 'prod-gecko-1',
    sourceKey: 'audit:cand-gecko3',
    outBase: 'photos/products/prod-gecko-1',
    widths: [960],
    jpgW: 960,
    title: 'Thằn lằn da báo dòng High Yellow săn mồi (Eublepharis macularius)',
    scientificName: 'Eublepharis macularius',
    role: 'product',
    focus: '50% 50%',
    alt: 'Cá thể thằn lằn da báo Eublepharis macularius dòng High Yellow nền vàng đốm đen đang quan sát con gián Dubia.',
  },
  {
    id: 'prod-gecko-2',
    sourceKey: 'audit:gecko-g3',
    outBase: 'photos/products/prod-gecko-2',
    widths: [960],
    jpgW: 960,
    title: 'Thằn lằn da báo tông vàng cam (Eublepharis macularius)',
    scientificName: 'Eublepharis macularius',
    role: 'product',
    focus: '50% 50%',
    alt: 'Cận cảnh cá thể thằn lằn da báo Eublepharis macularius có sắc da vàng cam tươi sáng điểm các đốm nâu đen trên nền cát trắng.',
  },
  {
    id: 'prod-bearded-dragon-1',
    sourceKey: 'audit:bearded-prod-c',
    outBase: 'photos/products/prod-bearded-dragon-1',
    widths: [960],
    jpgW: 960,
    title: 'Rồng Úc sưởi ấm trên phiến đá trong chuồng nuôi (Pogona vitticeps)',
    scientificName: 'Pogona vitticeps',
    role: 'product',
    focus: '50% 45%',
    alt: 'Cận cảnh cá thể Rồng Úc Pogona vitticeps màu vàng sáng đang tựa hai chân trước lên phiến đá dưới đèn sưởi.',
  },
  {
    id: 'prod-ball-python-1',
    sourceKey: 'audit:ballpython-pastel',
    outBase: 'photos/products/prod-ball-python-1',
    widths: [960],
    jpgW: 960,
    title: 'Trăn bóng dòng đột biến Pastel (Python regius)',
    scientificName: 'Python regius',
    role: 'product',
    focus: '50% 50%',
    alt: 'Cá thể trăn bóng Python regius dòng Pastel cuộn tròn trên nền dăm gỗ với sắc vàng chanh tươi sáng xen các mảng đen.',
  },
  {
    id: 'prod-burmese-python-1',
    sourceKey: 'audit:cand-python3',
    outBase: 'photos/products/prod-burmese-python-1',
    widths: [960],
    jpgW: 960,
    title: 'Trăn đất dòng đột biến bạch tạng Albino (Python bivittatus)',
    scientificName: 'Python bivittatus',
    role: 'product',
    focus: '50% 50%',
    alt: 'Cá thể trăn đất Python bivittatus dòng Albino với các mảng vảy màu vàng tươi trên nền trắng ngà và mắt hồng đỏ.',
  },
  {
    id: 'prod-hermann-tortoise-1',
    sourceKey: 'audit:cand-hermann3',
    outBase: 'photos/products/prod-hermann-tortoise-1',
    widths: [960],
    jpgW: 960,
    title: 'Rùa Hermann trên nền đất sỏi tự nhiên (Testudo hermanni)',
    scientificName: 'Testudo hermanni',
    role: 'product',
    focus: '50% 50%',
    alt: 'Góc nhìn từ trên xuống chiếc mai vòm vàng rơm điểm các mảng đen đối xứng của rùa cạn Testudo hermanni trên nền đất sỏi.',
  },
  {
    id: 'prod-axolotl-1',
    sourceKey: 'trip:axolotl2',
    outBase: 'photos/products/prod-axolotl-1',
    widths: [960],
    jpgW: 960,
    title: 'Kỳ giông Axolotl dòng Leucistic hồng nhạt (Ambystoma mexicanum)',
    scientificName: 'Ambystoma mexicanum',
    role: 'product',
    focus: '50% 45%',
    alt: 'Cá thể kỳ giông Axolotl đột biến Leucistic thân trắng hồng nhạt với ba cặp mang ngoài màu đỏ hồng nổi bật.',
  },
  {
    id: 'prod-venus-flytrap-1',
    sourceKey: 'audit:cand-venus4',
    outBase: 'photos/products/prod-venus-flytrap-1',
    widths: [960],
    jpgW: 960,
    title: 'Cây bắt ruồi Venus trồng chậu với lòng bẫy đỏ thẫm',
    scientificName: 'Dionaea muscipula',
    role: 'product',
    focus: '50% 50%',
    alt: 'Cận cảnh lá bẫy cây bắt ruồi Dionaea muscipula lòng đỏ thẫm và hàng gai dài trồng trong chậu nhựa nhỏ.',
  },
  {
    id: 'prod-nepenthes-rajah-1',
    sourceKey: 'audit:cand-rajah2',
    outBase: 'photos/products/prod-nepenthes-rajah-1',
    widths: [960],
    jpgW: 960,
    title: 'Cây Nắp ấm Rajah non với tán lá xanh và bình đỏ tía',
    scientificName: 'Nepenthes rajah',
    role: 'product',
    focus: '50% 50%',
    alt: 'Cây Nepenthes rajah kích thước nhỏ với cụm lá xanh bóng sát đất và một bình ấm màu đỏ tía đang phát triển.',
  },
  {
    id: 'prod-nepenthes-ampullaria-1',
    sourceKey: 'audit:cand-ampullaria3',
    outBase: 'photos/products/prod-nepenthes-ampullaria-1',
    widths: [960],
    jpgW: 960,
    title: 'Bình Nắp ấm Ampullaria dòng xanh thuần (All-green)',
    scientificName: 'Nepenthes ampullaria',
    role: 'product',
    focus: '50% 50%',
    alt: 'Cận cảnh chiếc bình ấm Nepenthes ampullaria màu xanh cốm thuần khiết với vành môi cuộn tròn bóng mượt giữa lớp lá mục.',
  },

  // === 5 Ảnh Sinh cảnh Biome đã đổi tên ID đúng nội dung thực ===
  {
    id: 'biome/cuc-phuong-rainforest-trail',
    sourceKey: 'trip:trail',
    outBase: 'photos/biome/cuc-phuong-rainforest-trail',
    widths: [960],
    jpgW: 960,
    title: 'Đường mòn ngập nước trong rừng mưa Vườn quốc gia Cúc Phương, Ninh Bình, Việt Nam',
    region: 'Nam và Đông Nam Á',
    role: 'biome',
    focus: '50% 50%',
    alt: 'Con đường mòn đất ngập nước nông xuyên qua tán rừng mưa nhiệt đới rậm rạp tại Vườn quốc gia Cúc Phương, tỉnh Ninh Bình, Việt Nam.',
  },
  {
    id: 'biome/taman-negara-canopy-walkway',
    sourceKey: 'trip:walkway',
    outBase: 'photos/biome/taman-negara-canopy-walkway',
    widths: [960],
    jpgW: 960,
    title: 'Cầu treo xuyên tán rừng mưa tại Vườn quốc gia Taman Negara, Pahang, Malaysia',
    region: 'Borneo, Sumatra và Malaysia',
    role: 'biome',
    focus: '50% 50%',
    alt: 'Cầu treo bằng dây thừng và ván gỗ đi xuyên qua tầng tán rừng mưa nhiệt đới rậm rạp tại Vườn quốc gia Taman Negara, bang Pahang, Malaysia.',
  },
  {
    id: 'biome/tembeling-river-taman-negara',
    sourceKey: 'trip:boat',
    outBase: 'photos/biome/tembeling-river-taman-negara',
    widths: [960],
    jpgW: 960,
    title: 'Thuyền gỗ trên sông Tembeling ven rừng mưa Taman Negara, Kuala Tahan, Malaysia',
    region: 'Borneo, Sumatra và Malaysia',
    role: 'biome',
    focus: '50% 50%',
    alt: 'Chiếc thuyền gỗ nhỏ chở người dân địa phương trên dòng sông Tembeling bao quanh bởi rừng mưa nhiệt đới tại Kuala Tahan, Vườn quốc gia Taman Negara, Malaysia.',
  },
  {
    id: 'biome/calanque-cassis-mediterranean',
    sourceKey: 'trip:calanque',
    outBase: 'photos/biome/calanque-cassis-mediterranean',
    widths: [960],
    jpgW: 960,
    title: 'Rừng thông ven biển Địa Trung Hải tại vịnh Calanque de Port-Pin, Cassis, miền Nam nước Pháp',
    region: 'Nam Âu — Địa Trung Hải',
    role: 'biome',
    focus: '50% 50%',
    alt: 'Lối mòn đá vôi dưới tán rừng thông Aleppo dẫn ra làn nước biển xanh biếc tại vịnh Calanque de Port-Pin, Cassis, miền Nam nước Pháp.',
  },
  {
    id: 'biome/montane-cloud-tree-ferns',
    sourceKey: 'trip:ferns',
    outBase: 'photos/biome/montane-cloud-tree-ferns',
    widths: [960],
    jpgW: 960,
    title: 'Tán dương xỉ thân gỗ vươn cao giữa rừng mây sương mù',
    region: 'Rừng mây nhiệt đới',
    role: 'biome',
    focus: '50% 50%',
    alt: 'Những vòm lá dương xỉ thân gỗ Cyathea xanh mướt nổi bật trước sườn rừng núi cao phủ đầy mây mù.',
  },
];

async function main() {
  console.log('1. Đọc credits.json (28 ảnh trip) và meta.json (ảnh Commons kiểm duyệt)...');
  const tripCreditsRaw = JSON.parse(await fs.readFile(path.join(TRIP_REF_DIR, 'credits.json'), 'utf8'));
  const auditMetaRaw = JSON.parse(await fs.readFile(path.join(AUDIT_CAND_DIR, 'meta.json'), 'utf8'));

  const sourceMap = new Map();

  for (const [key, info] of Object.entries(tripCreditsRaw)) {
    sourceMap.set(`trip:${key}`, {
      key,
      filePath: path.join(TRIP_REF_DIR, `${key}.webp`),
      author: info.author,
      license: info.license,
      licenseUrl: licenseUrlFor(info.license),
      sourceUrl: info.source,
      title: info.title,
    });
  }

  for (const [key, item] of Object.entries(auditMetaRaw)) {
    const cleanSourceUrl = item.sourceUrl.replace('File%3A', 'File:');
    const resolvedLocalPath = path.isAbsolute(item.localPath)
      ? item.localPath
      : path.resolve(REPO_ROOT, item.localPath);
    sourceMap.set(`audit:${key}`, {
      key,
      filePath: resolvedLocalPath,
      author: item.author,
      license: item.license,
      licenseUrl: licenseUrlFor(item.license),
      sourceUrl: cleanSourceUrl,
      title: item.title,
    });
  }

  // Xoá sạch thư mục public/photos cũ để không còn file thừa từ các id biome/* cũ
  await fs.rm(PUBLIC_PHOTOS_DIR, { recursive: true, force: true });
  await fs.mkdir(PUBLIC_PHOTOS_DIR, { recursive: true });
  await fs.mkdir(PUBLIC_TRIP_DIR, { recursive: true });

  console.log('2. Xử lý 28 ảnh cho trang Hành trình 9 loài trong public/trip/ (960/1600/1920 AVIF + WebP)...');
  const tripPhotosRecord = {};
  for (const [key, info] of Object.entries(tripCreditsRaw)) {
    const srcInfo = sourceMap.get(`trip:${key}`);
    const vnMeta = TRIP_VIETNAMESE_META[key];
    if (!vnMeta) {
      throw new Error(`Thiếu metadata tiếng Việt cho trip/${key}`);
    }
    await fs.copyFile(srcInfo.filePath, path.join(PUBLIC_TRIP_DIR, `${key}.webp`));
    const processed = await processVariants(srcInfo.filePath, `trip/${key}`, [960, 1600, 1920], null);
    tripPhotosRecord[key] = {
      id: `trip/${key}`,
      title: vnMeta.title,
      ...(vnMeta.scientificName ? { scientificName: vnMeta.scientificName } : {}),
      ...(vnMeta.region ? { region: vnMeta.region } : {}),
      role: 'biome',
      width: processed.width,
      height: processed.height,
      aspectRatio: processed.aspectRatio,
      focus: '50% 50%',
      alt: vnMeta.alt,
      sources: {
        avif: processed.sources.avif,
        webp: [...processed.sources.webp, { src: `trip/${key}.webp`, width: processed.width }],
        jpg: `trip/${key}.webp`,
      },
      placeholder: processed.placeholder,
      credit: {
        author: srcInfo.author,
        license: srcInfo.license,
        licenseUrl: srcInfo.licenseUrl,
        sourceUrl: srcInfo.sourceUrl,
      },
    };
  }

  console.log(`3. Xử lý ${PHOTO_DEFINITIONS.length} mục PHOTOS trong public/photos/...`);
  const photosRecord = {};
  for (const def of PHOTO_DEFINITIONS) {
    const srcInfo = sourceMap.get(def.sourceKey);
    if (!srcInfo) {
      throw new Error(`Không tìm thấy nguồn ảnh cho ${def.sourceKey}`);
    }
    const processed = await processVariants(
      srcInfo.filePath,
      def.outBase,
      def.widths,
      def.jpgW
    );
    photosRecord[def.id] = {
      id: def.id,
      title: def.title,
      ...(def.scientificName ? { scientificName: def.scientificName } : {}),
      ...(def.region ? { region: def.region } : {}),
      role: def.role,
      width: processed.width,
      height: processed.height,
      aspectRatio: processed.aspectRatio,
      focus: def.focus,
      alt: def.alt,
      sources: processed.sources,
      placeholder: processed.placeholder,
      credit: {
        author: srcInfo.author,
        license: srcInfo.license,
        licenseUrl: srcInfo.licenseUrl,
        sourceUrl: srcInfo.sourceUrl,
      },
    };
  }

  console.log('4. Ghi frontend/src/content/photos.ts...');
  const tsContent = `// src/content/photos.ts — Kho ảnh thật & metadata bản quyền Wikimedia Commons (tạo tự động bởi scripts/build-real-photos.mjs)

export interface PhotoSourceItem {
  readonly src: string;
  readonly width: number;
}

export interface PhotoCredit {
  readonly author: string;
  readonly license: string;
  readonly licenseUrl: string;
  readonly sourceUrl: string;
  readonly modified?: boolean;
}

export interface PhotoMetadata {
  readonly id: string;
  readonly title: string;
  readonly scientificName?: string;
  readonly region?: string;
  readonly role: 'hero' | 'portrait' | 'gallery' | 'habitat' | 'product' | 'biome';
  readonly width: number;
  readonly height: number;
  readonly aspectRatio: number;
  readonly focus: string;
  readonly alt: string;
  readonly sources: {
    readonly avif: readonly PhotoSourceItem[];
    readonly webp: readonly PhotoSourceItem[];
    readonly jpg: string;
  };
  readonly placeholder: string;
  readonly credit: PhotoCredit;
}

export const PHOTOS: Record<string, PhotoMetadata> = ${JSON.stringify(photosRecord, null, 2)};

export const TRIP_PHOTOS: Record<string, PhotoMetadata> = ${JSON.stringify(tripPhotosRecord, null, 2)};

export type PhotoId = string;

export const PHOTO_LIST: readonly PhotoMetadata[] = Object.values(PHOTOS);

export function getPhoto(id: string): PhotoMetadata | undefined {
  return PHOTOS[id] ?? TRIP_PHOTOS[id.replace(/^trip\\//, '')];
}

export function getPhotoById(id: string): PhotoMetadata | undefined {
  return getPhoto(id);
}
`;

  await fs.writeFile(PHOTOS_TS_PATH, tsContent, 'utf8');
  console.log('Hoàn tất xây dựng ảnh thật và ghi src/content/photos.ts!');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
