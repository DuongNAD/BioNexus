#!/usr/bin/env node
/**
 * scripts/build-real-photos.mjs
 * Xây dựng toàn bộ ảnh thật đã kiểm chứng từ:
 * 1. docs/frontend/reference/trip-photos/ (28 ảnh đã xác thực)
 * 2. frontend/scripts/.photo-candidates/ (18 ảnh bổ sung tải từ Wikimedia Commons API)
 * Sinh ra:
 * - frontend/public/trip/<name>.webp + <name>-{960,1600,1920}.{avif,webp}
 * - frontend/public/photos/<category>/<slug>-{480,960,1600}.{avif,webp} + .jpg
 * - frontend/src/content/photos.ts (với đầy đủ PHOTOS và TRIP_PHOTOS cùng LQIP blur thật)
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
const CANDIDATES_DIR = path.join(__dirname, '.photo-candidates');
const PUBLIC_TRIP_DIR = path.join(FRONTEND_DIR, 'public', 'trip');
const PUBLIC_PHOTOS_DIR = path.join(FRONTEND_DIR, 'public', 'photos');
const PHOTOS_TS_PATH = path.join(FRONTEND_DIR, 'src', 'content', 'photos.ts');

function licenseUrlFor(lic) {
  const l = lic.toLowerCase();
  if (l.includes('public domain') || l.includes('pd')) return 'https://creativecommons.org/publicdomain/mark/1.0/';
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

async function generateBlurDataUri(inputBuffer, extractFrac) {
  const meta0 = await sharp(inputBuffer).metadata();
  let pipeline = sharp(inputBuffer);
  if (extractFrac && meta0.width && meta0.height) {
    const left = Math.round(meta0.width * extractFrac.left);
    pipeline = pipeline.extract({ left, top: 0, width: meta0.width - left, height: meta0.height });
  }
  const buf = await pipeline
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

async function processVariants(inputPath, outBaseRel, widths, includeJpgWidth, extractFrac) {
  const inputBuffer = await fs.readFile(inputPath);
  const meta0 = await sharp(inputBuffer).metadata();
  let extractBox = null;
  if (extractFrac && meta0.width && meta0.height) {
    const left = Math.round(meta0.width * extractFrac.left);
    extractBox = { left, top: 0, width: meta0.width - left, height: meta0.height };
  }
  const origW = extractBox ? extractBox.width : (meta0.width || 1600);
  const origH = extractBox ? extractBox.height : (meta0.height || 1067);

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

    if (!(await fileExists(avifFull))) {
      let pAvif = sharp(inputBuffer);
      if (extractBox) pAvif = pAvif.extract(extractBox);
      await pAvif
        .resize({ width: targetW, withoutEnlargement: true })
        .avif({ quality: 52, effort: 2 })
        .toFile(avifFull);
    }

    if (!(await fileExists(webpFull))) {
      let pWebp = sharp(inputBuffer);
      if (extractBox) pWebp = pWebp.extract(extractBox);
      await pWebp
        .resize({ width: targetW, withoutEnlargement: true })
        .webp({ quality: 75 })
        .toFile(webpFull);
    }

    avifSources.push({ src: avifRel, width: w });
    webpSources.push({ src: webpRel, width: w });

    if (w === includeJpgWidth) {
      jpgRel = `${outBaseRel}-${w}.jpg`;
      const jpgFull = path.join(FRONTEND_DIR, 'public', jpgRel);
      if (!(await fileExists(jpgFull))) {
        let pJpg = sharp(inputBuffer);
        if (extractBox) pJpg = pJpg.extract(extractBox);
        await pJpg
          .resize({ width: targetW, withoutEnlargement: true })
          .jpeg({ quality: 78, mozjpeg: true })
          .toFile(jpgFull);
      }
    }
  }

  const placeholder = await generateBlurDataUri(inputBuffer, extractFrac);

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

// Danh mục 46 mục PHOTOS ánh xạ 1-1 tới 46 ảnh thật từ trip-photos (28) + .photo-candidates (18)
const PHOTO_DEFINITIONS = [
  // 1. Axolotl (Ambystoma mexicanum - CR)
  {
    id: 'axolotl/hero-1',
    sourceKey: 'trip:axolotl',
    outBase: 'photos/axolotl/hero',
    widths: [480, 960, 1600],
    jpgW: 1600,
    title: 'Kỳ giông Axolotl Leucistic (Aquarium Finisterrae)',
    scientificName: 'Ambystoma mexicanum',
    role: 'hero',
    focus: '52% 48%',
    alt: 'Kỳ giông Axolotl màu hồng nhạt với ba cặp mang ngoài dạng lông vũ đỏ tươi dưới làn nước.',
  },
  {
    id: 'axolotl/portrait-1',
    sourceKey: 'trip:axolotl2',
    outBase: 'photos/axolotl/portrait',
    widths: [480, 960],
    jpgW: 960,
    title: 'Chân dung Kỳ giông Axolotl nhìn thẳng',
    scientificName: 'Ambystoma mexicanum',
    role: 'portrait',
    focus: '50% 45%',
    alt: 'Chân dung cận cảnh kỳ giông Axolotl với chùm mang ngoài xòe đối xứng.',
  },
  {
    id: 'axolotl/habitat-1',
    sourceKey: 'trip:xochi',
    outBase: 'photos/axolotl/habitat',
    widths: [960, 1600],
    jpgW: 1600,
    title: 'Kênh đào sinh thái hồ Xochimilco, Mexico',
    scientificName: 'Ambystoma mexicanum',
    role: 'habitat',
    focus: '50% 55%',
    alt: 'Hệ thống kênh đào và thuyền gỗ truyền thống tại hồ Xochimilco, Mexico City — nơi cư ngụ tự nhiên duy nhất của Axolotl.',
  },

  // 2. Nắp ấm Rajah (Nepenthes rajah - EN)
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
    alt: 'Bình ấm lớn màu đỏ tía của Nepenthes rajah nằm trên thảm thực vật rừng núi Kinabalu.',
  },
  {
    id: 'nepenthes-rajah/portrait-1',
    sourceKey: 'trip:rajah2',
    outBase: 'photos/nepenthes-rajah/portrait',
    widths: [480, 960],
    jpgW: 960,
    title: 'Cấu trúc vành môi và nắp bình Nepenthes rajah',
    scientificName: 'Nepenthes rajah',
    role: 'portrait',
    focus: '50% 48%',
    alt: 'Cận cảnh bình bẫy và vành môi răng cưa màu đỏ sẫm của loài Nắp ấm khổng lồ Rajah.',
  },
  {
    id: 'nepenthes-rajah/habitat-1',
    sourceKey: 'trip:summit',
    outBase: 'photos/nepenthes-rajah/habitat',
    widths: [960],
    jpgW: 960,
    title: 'Rừng mây sườn núi Kinabalu, Sabah, Borneo',
    scientificName: 'Nepenthes rajah',
    role: 'habitat',
    focus: '50% 45%',
    alt: 'Mây mù hình thành trên rừng mưa núi cao Kinabalu tại Kundasang, Sabah, Borneo.',
  },

  // 3. Trăn bóng (Python regius - NT)
  {
    id: 'ball-python/hero-1',
    sourceKey: 'trip:ballpython',
    outBase: 'photos/ball-python/hero',
    widths: [960, 1600],
    jpgW: 1600,
    title: 'Trăn bóng hoang dã (Python regius)',
    scientificName: 'Python regius',
    role: 'hero',
    focus: '50% 50%',
    alt: 'Trăn bóng Python regius với hoa văn nâu đen và vàng đồng đặc trưng.',
  },
  {
    id: 'ball-python/portrait-1',
    sourceKey: 'cand:ballpython3',
    outBase: 'photos/ball-python/portrait',
    widths: [960],
    jpgW: 960,
    title: 'Trăn bóng ẩn mình giữa kẽ vỏ cây',
    scientificName: 'Python regius',
    role: 'portrait',
    focus: '50% 48%',
    alt: 'Cá thể trăn bóng Python regius cuộn thân giữa các lớp vỏ cây khô.',
  },
  {
    id: 'ball-python/habitat-1',
    sourceKey: 'trip:ghana',
    outBase: 'photos/ball-python/habitat',
    widths: [960],
    jpgW: 960,
    title: 'Thảo nguyên Savan miền Bắc Ghana',
    scientificName: 'Python regius',
    role: 'habitat',
    focus: '50% 50%',
    alt: 'Cảnh quan đồng cỏ savan điểm cây bụi tại khu vực miền Bắc Ghana, Tây Phi.',
  },

  // 4. Thằn lằn da báo (Eublepharis macularius - LC)
  {
    id: 'leopard-gecko/hero-1',
    sourceKey: 'trip:gecko',
    outBase: 'photos/leopard-gecko/hero',
    widths: [960, 1600],
    jpgW: 1600,
    title: 'Thằn lằn da báo (Eublepharis macularius)',
    scientificName: 'Eublepharis macularius',
    role: 'hero',
    focus: '52% 48%',
    alt: 'Thằn lằn da báo Eublepharis macularius với lớp da vàng đốm đen sần hạt đặc trưng.',
  },
  {
    id: 'leopard-gecko/portrait-1',
    sourceKey: 'trip:gecko2',
    outBase: 'photos/leopard-gecko/portrait',
    widths: [960],
    jpgW: 960,
    title: 'Cận cảnh đầu và mí mắt Thằn lằn da báo',
    scientificName: 'Eublepharis macularius',
    role: 'portrait',
    focus: '50% 45%',
    alt: 'Góc chụp cận cảnh đầu thằn lằn da báo cho thấy rõ mí mắt động và đồng tử dọc.',
  },
  {
    id: 'leopard-gecko/habitat-1',
    sourceKey: 'trip:baloch',
    outBase: 'photos/leopard-gecko/habitat',
    widths: [960],
    jpgW: 960,
    title: 'Hoàng hôn trên dãy núi đá Turbat, Balochistan',
    scientificName: 'Eublepharis macularius',
    role: 'habitat',
    focus: '50% 55%',
    alt: 'Địa hình núi đá bán hoang mạc lúc hoàng hôn tại Turbat, Balochistan — sinh cảnh bản địa của thằn lằn da báo.',
  },

  // 5. Cây bắt ruồi Venus (Dionaea muscipula - VU)
  {
    id: 'venus-flytrap/hero-1',
    sourceKey: 'trip:venus2',
    outBase: 'photos/venus-flytrap/hero',
    widths: [960, 1600],
    jpgW: 1600,
    title: 'Cây bắt ruồi Venus tại khu bảo tồn Green Swamp',
    scientificName: 'Dionaea muscipula',
    role: 'hero',
    focus: '50% 50%',
    alt: 'Lá bẫy đỏ rực của cây bắt ruồi Dionaea muscipula chụp ngoài tự nhiên tại Green Swamp, Bắc Carolina.',
  },
  {
    id: 'venus-flytrap/portrait-1',
    sourceKey: 'trip:venus',
    outBase: 'photos/venus-flytrap/portrait',
    widths: [960],
    jpgW: 960,
    title: 'Thùy lá và gai viền bẫy Cây bắt ruồi Venus',
    scientificName: 'Dionaea muscipula',
    role: 'portrait',
    focus: '50% 48%',
    alt: 'Cận cảnh hai thùy lá bẫy mở rộng với hàng gai răng lược của cây bắt ruồi Venus.',
  },
  {
    id: 'venus-flytrap/habitat-1',
    sourceKey: 'trip:carolina',
    outBase: 'photos/venus-flytrap/habitat',
    widths: [960],
    jpgW: 960,
    title: 'Thảo nguyên thông lá dài Bắc Carolina',
    scientificName: 'Dionaea muscipula',
    role: 'habitat',
    focus: '50% 50%',
    alt: 'Hệ sinh thái thảo nguyên thông lá dài ẩm ướt tại Bắc Carolina, nơi cây bắt ruồi Venus sinh trưởng.',
  },

  // 6. Trăn đất (Python bivittatus - VU)
  {
    id: 'burmese-python/hero-1',
    sourceKey: 'trip:python',
    outBase: 'photos/burmese-python/hero',
    widths: [960, 1600],
    jpgW: 1600,
    title: 'Trăn đất ngoài tự nhiên tại VQG Bardiya',
    scientificName: 'Python bivittatus',
    role: 'hero',
    focus: '52% 50%',
    alt: 'Trăn đất Python bivittatus với hoa văn nâu viền vàng đặc trưng nằm trên nền rừng.',
  },
  {
    id: 'burmese-python/portrait-1',
    sourceKey: 'cand:python4',
    outBase: 'photos/burmese-python/portrait',
    widths: [960],
    jpgW: 960,
    title: 'Cận cảnh đầu Trăn đất với vân mũi tên',
    scientificName: 'Python bivittatus',
    role: 'portrait',
    focus: '50% 45%',
    alt: 'Cận cảnh phần đầu trăn đất Python bivittatus thể hiện rõ hoa văn mũi tên trên đỉnh đầu.',
  },
  {
    id: 'burmese-python/habitat-1',
    sourceKey: 'trip:roots',
    outBase: 'photos/burmese-python/habitat',
    widths: [960],
    jpgW: 960,
    title: 'Rễ cây cổ thụ rừng nhiệt đới VQG Cát Tiên, Việt Nam',
    scientificName: 'Python bivittatus',
    role: 'habitat',
    focus: '50% 50%',
    alt: 'Hệ rễ cây cổ thụ đan xen trên nền rừng mưa nhiệt đới tại Vườn quốc gia Cát Tiên, Việt Nam.',
  },

  // 7. Rồng Úc (Pogona vitticeps - LC)
  {
    id: 'bearded-dragon/hero-1',
    sourceKey: 'trip:dragon',
    outBase: 'photos/bearded-dragon/hero',
    widths: [960, 1600],
    jpgW: 1600,
    title: 'Chân dung Rồng Úc (Pogona vitticeps)',
    scientificName: 'Pogona vitticeps',
    role: 'hero',
    focus: '50% 45%',
    alt: 'Cận cảnh đầu và hàng vảy gai cổ họng của Rồng Úc Pogona vitticeps.',
  },
  {
    id: 'bearded-dragon/portrait-1',
    sourceKey: 'cand:dragon3',
    outBase: 'photos/bearded-dragon/portrait',
    widths: [960],
    jpgW: 960,
    title: 'Hình thái toàn thân Rồng Úc trên nền cát',
    scientificName: 'Pogona vitticeps',
    role: 'portrait',
    focus: '50% 50%',
    alt: 'Góc nhìn từ trên xuống toàn thân Rồng Úc Pogona vitticeps phơi nắng trên nền cát.',
  },
  {
    id: 'bearded-dragon/habitat-1',
    sourceKey: 'trip:uluru',
    outBase: 'photos/bearded-dragon/habitat',
    widths: [960],
    jpgW: 960,
    title: 'Bán hoang mạc đất đỏ VQG Uluru-Kata Tjuta, Trung Úc',
    scientificName: 'Pogona vitticeps',
    role: 'habitat',
    focus: '50% 50%',
    alt: 'Khối đá sa thạch đỏ và thảm cây bụi khô hạn tại Vườn quốc gia Uluru-Kata Tjuta, miền Trung nước Úc.',
  },

  // 8. Rùa Hermann (Testudo hermanni - VU)
  {
    id: 'hermann-tortoise/hero-1',
    sourceKey: 'trip:hermann',
    outBase: 'photos/hermann-tortoise/hero',
    widths: [960, 1600],
    jpgW: 1600,
    title: 'Rùa Hermann phân loài phương Đông (Testudo hermanni boettgeri)',
    scientificName: 'Testudo hermanni',
    role: 'hero',
    focus: '50% 52%',
    alt: 'Rùa cạn Hermann với chiếc mai vòm màu vàng rơm điểm các mảng đen rõ nét.',
  },
  {
    id: 'hermann-tortoise/portrait-1',
    sourceKey: 'cand:hermann4',
    outBase: 'photos/hermann-tortoise/portrait',
    widths: [960],
    jpgW: 960,
    title: 'Cận cảnh Rùa Hermann phương Tây (Testudo hermanni hermanni)',
    scientificName: 'Testudo hermanni',
    role: 'portrait',
    focus: '50% 50%',
    alt: 'Cận cảnh đầu và mai trước của rùa Hermann giữa thảm cỏ khô Địa Trung Hải.',
  },
  {
    id: 'hermann-tortoise/habitat-1',
    sourceKey: 'trip:maquis',
    outBase: 'photos/hermann-tortoise/habitat',
    widths: [960],
    jpgW: 960,
    title: 'Thảm thực vật cây bụi Maquis vùng Địa Trung Hải',
    scientificName: 'Testudo hermanni',
    role: 'habitat',
    focus: '50% 50%',
    alt: 'Sườn đồi đá vôi phủ thảm cây bụi Maquis đặc trưng của vùng ven biển Địa Trung Hải.',
  },

  // 9. Nắp ấm Ampullaria (Nepenthes ampullaria - LC)
  {
    id: 'nepenthes-ampullaria/hero-1',
    sourceKey: 'trip:ampullaria',
    outBase: 'photos/nepenthes-ampullaria/hero',
    widths: [960, 1600],
    jpgW: 1600,
    title: 'Ấm đất hình cầu của Nắp ấm Ampullaria',
    scientificName: 'Nepenthes ampullaria',
    role: 'hero',
    focus: '50% 50%',
    alt: 'Bình ấm tròn có đốm đỏ và nắp nhỏ ngửa ra sau của loài Nepenthes ampullaria.',
  },
  {
    id: 'nepenthes-ampullaria/portrait-1',
    sourceKey: 'trip:ampullaria2',
    outBase: 'photos/nepenthes-ampullaria/portrait',
    widths: [960],
    jpgW: 960,
    title: 'Thảm ấm Nắp ấm Ampullaria trên nền rừng',
    scientificName: 'Nepenthes ampullaria',
    role: 'portrait',
    focus: '50% 50%',
    alt: 'Cụm nhiều bình nắp ấm Nepenthes ampullaria mọc chen chúc trên lớp lá mục.',
  },
  {
    id: 'nepenthes-ampullaria/habitat-1',
    sourceKey: 'trip:swamp',
    outBase: 'photos/nepenthes-ampullaria/habitat',
    widths: [960],
    jpgW: 960,
    title: 'Rừng mưa đất thấp ẩm ướt Borneo',
    scientificName: 'Nepenthes ampullaria',
    role: 'habitat',
    focus: '50% 50%',
    alt: 'Khung cảnh rừng mưa nhiệt đới đất thấp nhiều tầng tán và độ ẩm cao.',
  },

  // 10 Sản phẩm sinh vật cảnh
  {
    id: 'prod-gecko-1',
    sourceKey: 'cand:gecko3',
    outBase: 'photos/products/prod-gecko-1',
    widths: [960],
    jpgW: 960,
    title: 'Thằn lằn da báo săn mồi (Eublepharis macularius)',
    scientificName: 'Eublepharis macularius',
    role: 'product',
    focus: '50% 50%',
    alt: 'Cá thể thằn lằn da báo hoa văn đốm rõ nét đang quan sát con mồi.',
  },
  {
    id: 'prod-gecko-2',
    sourceKey: 'cand:gecko4',
    outBase: 'photos/products/prod-gecko-2',
    widths: [960],
    jpgW: 960,
    title: 'Thằn lằn da báo trưởng thành trên nền đá',
    scientificName: 'Eublepharis macularius',
    role: 'product',
    focus: '50% 50%',
    alt: 'Cá thể thằn lằn da báo khỏe mạnh nằm trên phiến đá trong chuồng nuôi.',
  },
  {
    id: 'prod-bearded-dragon-1',
    sourceKey: 'cand:dragon4',
    outBase: 'photos/products/prod-bearded-dragon-1',
    widths: [960],
    jpgW: 960,
    title: 'Rồng Úc Pogona vitticeps góc nhìn lưng',
    scientificName: 'Pogona vitticeps',
    role: 'product',
    focus: '50% 50%',
    alt: 'Cá thể Rồng Úc với hàng gai bên hông và hoa văn lưng rõ nét.',
  },
  {
    id: 'prod-ball-python-1',
    sourceKey: 'cand:ballpython4',
    outBase: 'photos/products/prod-ball-python-1',
    widths: [960],
    jpgW: 960,
    title: 'Trăn bóng biến thể Hypomelanistic',
    scientificName: 'Python regius',
    role: 'product',
    focus: '50% 50%',
    alt: 'Cá thể trăn bóng Python regius dòng đột biến giảm sắc tố đen (Hypomelanistic).',
  },
  {
    id: 'prod-burmese-python-1',
    sourceKey: 'cand:python3',
    outBase: 'photos/products/prod-burmese-python-1',
    widths: [960],
    jpgW: 960,
    title: 'Trăn đất biến thể Albino vàng trắng',
    scientificName: 'Python bivittatus',
    role: 'product',
    focus: '50% 50%',
    alt: 'Cá thể trăn đất Python bivittatus đột biến bạch tạng (Albino) với hoa văn vàng cam và trắng.',
  },
  {
    id: 'prod-hermann-tortoise-1',
    sourceKey: 'cand:hermann3',
    outBase: 'photos/products/prod-hermann-tortoise-1',
    widths: [960],
    jpgW: 960,
    title: 'Rùa Hermann mai vàng đen tương phản cao',
    scientificName: 'Testudo hermanni',
    role: 'product',
    focus: '50% 50%',
    alt: 'Cá thể rùa cạn Testudo hermanni với các tấm vảy mai bóng khỏe.',
  },
  {
    id: 'prod-axolotl-1',
    sourceKey: 'cand:axolotl3',
    outBase: 'photos/products/prod-axolotl-1',
    widths: [960],
    jpgW: 960,
    title: 'Kỳ giông Axolotl màu tự nhiên (Wild-type)',
    scientificName: 'Ambystoma mexicanum',
    role: 'product',
    focus: '50% 50%',
    alt: 'Cá thể kỳ giông Axolotl màu nâu đốm tự nhiên bơi trên nền cát mịn.',
  },
  {
    id: 'prod-venus-flytrap-1',
    sourceKey: 'cand:venus4',
    outBase: 'photos/products/prod-venus-flytrap-1',
    widths: [960],
    jpgW: 960,
    title: 'Bẫy cây bắt ruồi Venus lòng đỏ thẫm',
    scientificName: 'Dionaea muscipula',
    role: 'product',
    focus: '50% 50%',
    alt: 'Cận cảnh chiếc bẫy cây bắt ruồi Dionaea muscipula với mặt trong đỏ thẫm dưới nắng.',
  },
  {
    id: 'prod-nepenthes-rajah-1',
    sourceKey: 'cand:rajah3',
    outBase: 'photos/products/prod-nepenthes-rajah-1',
    widths: [960],
    jpgW: 960,
    title: 'Bình Nắp ấm Rajah sắc đỏ tía',
    scientificName: 'Nepenthes rajah',
    role: 'product',
    focus: '50% 50%',
    alt: 'Bình ấm Nepenthes rajah hình chuông lớn với nắp rộng che miệng ấm.',
  },
  {
    id: 'prod-nepenthes-ampullaria-1',
    sourceKey: 'cand:ampullaria3',
    outBase: 'photos/products/prod-nepenthes-ampullaria-1',
    widths: [960],
    jpgW: 960,
    title: 'Nắp ấm Ampullaria dòng xanh thuần (All-green)',
    scientificName: 'Nepenthes ampullaria',
    role: 'product',
    focus: '50% 50%',
    alt: 'Bình nắp ấm Nepenthes ampullaria màu xanh cốm tròn trịa nằm giữa lớp lá khô.',
  },

  // 8 Ảnh Sinh cảnh Biome & Thực địa
  {
    id: 'biome/rainforest-canopy',
    sourceKey: 'trip:trail',
    outBase: 'photos/biome/rainforest-canopy',
    widths: [960],
    jpgW: 960,
    title: 'Đường mòn rừng nguyên sinh VQG Cúc Phương',
    role: 'biome',
    focus: '50% 50%',
    alt: 'Con đường mòn xuyên qua tán rừng mưa nhiệt đới xanh thẫm tại Vườn quốc gia Cúc Phương, Việt Nam.',
  },
  {
    id: 'biome/cloud-forest-mist',
    sourceKey: 'trip:walkway',
    outBase: 'photos/biome/cloud-forest-mist',
    widths: [960],
    jpgW: 960,
    title: 'Cầu treo xuyên tán rừng Taman Negara, Malaysia',
    role: 'biome',
    focus: '50% 50%',
    alt: 'Cầu treo đi bộ xuyên qua tầng tán cây cao vút của rừng mưa cổ đại Taman Negara.',
  },
  {
    id: 'biome/macro-leaf-droplet',
    sourceKey: 'cand:venus3',
    outBase: 'photos/biome/macro-leaf-droplet',
    widths: [960],
    jpgW: 960,
    title: 'Lông cảm ứng cơ học trong lòng bẫy Dionaea muscipula',
    scientificName: 'Dionaea muscipula',
    role: 'biome',
    focus: '50% 50%',
    alt: 'Ảnh chụp đại cận cảnh các sợi lông cảm ứng kích hoạt xung điện bên trong lá bẫy cây bắt ruồi.',
  },
  {
    id: 'biome/macro-moss-fern',
    sourceKey: 'trip:ferns',
    outBase: 'photos/biome/macro-moss-fern',
    widths: [960],
    jpgW: 960,
    title: 'Dương xỉ thân gỗ (Cyathea sp.) và rừng núi cao',
    role: 'biome',
    focus: '50% 50%',
    alt: 'Những tán dương xỉ thân gỗ cổ đại vươn rộng giữa khu rừng ẩm sườn núi.',
  },
  {
    id: 'biome/fireflies-night',
    sourceKey: 'cand:ampullaria4',
    outBase: 'photos/biome/fireflies-night',
    widths: [960],
    jpgW: 960,
    title: 'Quần thể Nắp ấm Ampullaria trên thảm rêu rừng ẩm',
    scientificName: 'Nepenthes ampullaria',
    role: 'biome',
    focus: '50% 50%',
    alt: 'Cụm bình Nepenthes ampullaria mọc dày đặc giữa thảm rêu ẩm dưới tán rừng.',
  },
  {
    id: 'biome/coral-reef-deep',
    sourceKey: 'cand:axolotl4',
    outBase: 'photos/biome/coral-reef-deep',
    widths: [960],
    jpgW: 960,
    title: 'Cận cảnh mang ngoài Kỳ giông Axolotl dưới nước',
    scientificName: 'Ambystoma mexicanum',
    role: 'biome',
    focus: '50% 50%',
    alt: 'Cận cảnh đầu và hệ mang ngoài trao đổi oxy dưới nước của kỳ giông Axolotl.',
  },
  {
    id: 'biome/desert-savanna-sunset',
    sourceKey: 'trip:calanque',
    outBase: 'photos/biome/desert-savanna-sunset',
    widths: [960],
    jpgW: 960,
    title: 'Vịnh đá vôi Calanque de Cassis ven Địa Trung Hải',
    role: 'biome',
    focus: '50% 50%',
    alt: 'Vách đá vôi trắng và làn nước xanh ngọc tại Calanque de Cassis, miền Nam nước Pháp.',
  },
  {
    id: 'biome/peat-swamp-waters',
    sourceKey: 'trip:boat',
    outBase: 'photos/biome/peat-swamp-waters',
    widths: [960],
    jpgW: 960,
    title: 'Dòng sông Tembeling giữa rừng già Taman Negara',
    role: 'biome',
    focus: '50% 50%',
    alt: 'Thuyền gỗ nhỏ trên dòng sông Tembeling bao quanh bởi rừng mưa nhiệt đới Taman Negara, Malaysia.',
  },
];

async function main() {
  console.log('1. Đọc credits.json (28 ảnh trip) và downloaded.json (18 ảnh Commons bổ sung)...');
  const tripCreditsRaw = JSON.parse(await fs.readFile(path.join(TRIP_REF_DIR, 'credits.json'), 'utf8'));
  const candRaw = JSON.parse(await fs.readFile(path.join(CANDIDATES_DIR, 'downloaded.json'), 'utf8'));

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

  for (const list of Object.values(candRaw)) {
    for (const item of list) {
      let cleanAuthor = item.author;
      if (cleanAuthor.includes('NepGrower')) cleanAuthor = 'NepGrower';
      if (cleanAuthor === 'Wikimedia Commons' && item.id.startsWith('rajah')) cleanAuthor = 'NepGrower';
      const cleanSourceUrl = item.sourceUrl.replace('File%3A', 'File:');
      sourceMap.set(`cand:${item.id}`, {
        key: item.id,
        filePath: item.localFile,
        author: cleanAuthor,
        license: item.license,
        licenseUrl: licenseUrlFor(item.license),
        sourceUrl: cleanSourceUrl,
        title: item.title,
      });
    }
  }

  await fs.mkdir(PUBLIC_PHOTOS_DIR, { recursive: true });
  await fs.mkdir(PUBLIC_TRIP_DIR, { recursive: true });

  console.log('2. Xử lý 28 ảnh cho trang Hành trình 9 loài trong public/trip/ (960/1600/1920 AVIF + WebP)...');
  const tripPhotosRecord = {};
  for (const [key, info] of Object.entries(tripCreditsRaw)) {
    const srcInfo = sourceMap.get(`trip:${key}`);
    // Copy file gốc .webp để tương thích đường dẫn ./trip/<name>.webp
    await fs.copyFile(srcInfo.filePath, path.join(PUBLIC_TRIP_DIR, `${key}.webp`));
    const processed = await processVariants(srcInfo.filePath, `trip/${key}`, [960, 1600, 1920], null, null);
    tripPhotosRecord[key] = {
      id: `trip/${key}`,
      title: info.title,
      role: 'biome',
      width: processed.width,
      height: processed.height,
      aspectRatio: processed.aspectRatio,
      focus: '50% 50%',
      alt: info.title.replace(/\.[^.]+$/, '').replace(/_/g, ' '),
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

  console.log('3. Xử lý 46 mục PHOTOS trong public/photos/...');
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
      def.jpgW,
      def.extractBox || null
    );
    photosRecord[def.id] = {
      id: def.id,
      title: def.title,
      ...(def.scientificName ? { scientificName: def.scientificName } : {}),
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
        ...(def.modified ? { modified: true } : {}),
      },
    };
    console.log(`  + [OK] ${def.id} <- ${def.sourceKey}`);
  }

  console.log('4. Xuất file src/content/photos.ts...');
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

export type PhotoId = keyof typeof PHOTOS;

/**
 * Tra cứu ảnh đại diện chính (hero) theo tên khoa học loài.
 */
export function getHeroPhotoByScientificName(scientificName: string): PhotoMetadata | undefined {
  const mapping: Record<string, PhotoId> = {
    'Ambystoma mexicanum': 'axolotl/hero-1',
    'Nepenthes rajah': 'nepenthes-rajah/hero-1',
    'Python regius': 'ball-python/hero-1',
    'Eublepharis macularius': 'leopard-gecko/hero-1',
    'Dionaea muscipula': 'venus-flytrap/hero-1',
    'Python bivittatus': 'burmese-python/hero-1',
    'Pogona vitticeps': 'bearded-dragon/hero-1',
    'Testudo hermanni': 'hermann-tortoise/hero-1',
    'Nepenthes ampullaria': 'nepenthes-ampullaria/hero-1',
  };
  const photoId = mapping[scientificName];
  return photoId ? PHOTOS[photoId] : undefined;
}

/**
 * Tra cứu ảnh đại diện cho sản phẩm theo mã ID trong seed.
 */
export function getProductPhoto(productIdOrName: string): PhotoMetadata | undefined {
  const productKeyMap: Record<string, PhotoId> = {
    '1': 'prod-gecko-1',
    '2': 'prod-gecko-2',
    '3': 'prod-bearded-dragon-1',
    '4': 'prod-ball-python-1',
    '5': 'prod-burmese-python-1',
    '6': 'prod-hermann-tortoise-1',
    '7': 'prod-axolotl-1',
    '8': 'prod-venus-flytrap-1',
    '9': 'prod-nepenthes-rajah-1',
    '10': 'prod-nepenthes-ampullaria-1',
  };
  const photoId = productKeyMap[productIdOrName];
  return photoId ? PHOTOS[photoId] : undefined;
}
`;

  await fs.writeFile(PHOTOS_TS_PATH, tsContent, 'utf8');
  console.log('Hoàn tất xây dựng toàn bộ ảnh thật và cập nhật src/content/photos.ts!');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
