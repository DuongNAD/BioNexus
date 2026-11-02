// Các hàm toán học địa lý, định dạng toạ độ DMS, khoảng cách cung tròn lớn và mã MRZ hộ chiếu

export const clamp = (v: number, a = 0, b = 1): number => Math.min(b, Math.max(a, v));
export const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;
export const sub = (p: number, a: number, b: number): number => clamp((p - a) / (b - a));
export const smooth = (t: number): number => t * t * (3 - 2 * t);

// Đổi độ thập phân sang độ–phút với ký hiệu hướng tiếng Việt (B/N/Đ/T)
export function dms(v: number, pos: string, neg: string): string {
  const a = Math.abs(v);
  let d = Math.floor(a);
  let m = Math.round((a - d) * 60);
  if (m === 60) {
    d += 1;
    m = 0;
  }
  return `${d}°${String(m).padStart(2, '0')}′${v >= 0 ? pos : neg}`;
}

export function fmtLL(lat: number, lon: number): string {
  return `${dms(lat, 'B', 'N')}  ${dms(lon, 'Đ', 'T')}`;
}

// Khoảng cách cung tròn lớn (Haversine) giữa hai điểm [vĩ độ, kinh độ], làm tròn 10 km
export function distanceKm(
  [la1, lo1]: readonly [number, number],
  [la2, lo2]: readonly [number, number]
): number {
  const R = Math.PI / 180;
  const dLa = (la2 - la1) * R;
  const dLo = (lo2 - lo1) * R;
  const a =
    Math.sin(dLa / 2) ** 2 +
    Math.cos(la1 * R) * Math.cos(la2 * R) * Math.sin(dLo / 2) ** 2;
  return Math.round((12742 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))) / 10) * 10;
}

// Giờ địa phương thật của điểm đang đứng theo múi giờ IANA
export function localTime(tz: string): string {
  try {
    return new Intl.DateTimeFormat('vi-VN', {
      timeZone: tz,
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(new Date());
  } catch {
    return '—';
  }
}

export function today(): string {
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date());
}

// Dòng mã đọc máy ở chân hộ chiếu (MRZ 36 ký tự): bỏ dấu tiếng Việt, thay khoảng trắng bằng <<
export function mrz(name: string): string {
  const clean = name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/gi, 'd')
    .toUpperCase()
    .replace(/[^A-Z ]/g, '')
    .trim()
    .replace(/\s+/g, '<<');
  return (`P<BNX<${clean}` + '<'.repeat(36)).slice(0, 36);
}

// Phép chiếu Natural Earth 1 chuẩn khớp fitExtent([[28, 24], [972, 476]], land-110m) trên khung 1000×500
const NE_A0 = 0.8707;
const NE_A1 = -0.131979;
const NE_A2 = -0.013791;
const NE_A3 = 0.003971;
const NE_A4 = -0.001529;
const NE_B0 = 1.007226;
const NE_B1 = 0.015085;
const NE_B2 = -0.044475;
const NE_B3 = 0.028874;
const NE_B4 = -0.005916;
const NE_SCALE = 161.3635166111135;
const NE_TX = 500;
const NE_TY = 246.47806583968733;

export function geoNaturalEarth1Project([lon, lat]: readonly [number, number]): [number, number] {
  const lambda = (lon * Math.PI) / 180;
  const phi = (lat * Math.PI) / 180;
  const phi2 = phi * phi;
  const phi4 = phi2 * phi2;
  const rx =
    lambda * (NE_A0 + phi2 * (NE_A1 + phi2 * (NE_A2 + phi4 * phi2 * (NE_A3 + phi2 * NE_A4))));
  const ry = phi * (NE_B0 + phi2 * (NE_B1 + phi2 * (NE_B2 + phi4 * (NE_B3 + phi2 * NE_B4))));
  return [NE_TX + NE_SCALE * rx, NE_TY - NE_SCALE * ry];
}

// Bitmask lục địa 110m (la: -56..82 bước 2.4, lo: -178..178 bước 2.4 -> 8642 điểm, 2674 điểm đất liền)
const LAND_MASK_B64 =
  'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAAAAAAA4AAAAAAAAAAAAAAAAAAAAAAAADwAAAAAAABAAAAAAAAAAAAAAIAHAAAAAAAAAAAAAAAAAAAAAADgAAAAAAAAAAAAAAAABAAAAAAAPAAAAAAAAAAAAAAgAAEAAAAAgA8AAAAAAAAAAAAAAEAAAAAAAPAHAAAAAAAAAAAA4AEIAAAAAAB8AQAAAAAAAAAAAX4AAAAAAACAfwAAAPABAAAA4PMPAAAAAAAA8B8AAAB+AAAAAPz/AwAAAAAAAP4DAADgDwAAAMD/PwAAAAAAAMD/AAAA/EMAAAD4/wcAAAAAAAD4fwAAgH8YAAAA/38AAAAAAAAA/x8AAPgPAwAAgP8HAAAAAAAA4P8DAAD/YwAAAMD/AAAAAAAAAP9/AADg/xkAAADwCAAAAAAAAOD/HwAA/D8AAAAAOAAAAAAAAAD+/wcAgP8DAAAAAAAAAAAAAADA//8AAPB/AAAAYAAPAAAAAAAA/P8fAAD+DwAAgADgBwAAAAAAgP//AADg/wEAAJhtDwAAAAAAAPD/AQAA/n8AAID5EAAAAAAAAAD8PwAAgP8fAAAQDwAAAAAAAACA/wMAAPj/BwAAhQEAAAAAAAAA8B8AAP///wFAQCABAAAAAAAAgPwAAPD//38AACAAAAAAAAAAAAgDAAD///8JwAAMBAAAAAAAAMABAADg//9fABjgAQAAAAAAAAAPAAAA/P//OYADPwAAAAAAAAC4oQEAgP//nx/w4QMAAAAAAgCAIwQAAPD///sHfn4BAAAAAAAAeAAAAAD+/z//8P//AAAAAAAAgA8AAADA///34///PwAAAAAAAPyBAAAA8P9/v////w8AAAAAAED/HwAAAPj///////8BAAAAAAD4/wMAAAD/Afz///8/BAAAAADA//8BAADAH0j/////IwcAAAAA+P8/AAAAHAj+8///f4QAAAAAgP//DwAAgEfaf/7///8gAAAAAPD//wMAAPC5B87///8/BAAAAAD+//8HAADw+/H8////PwAAAADA//9/CAAA/v///////wcAAAAA/P//VwAAgP////////8FAAAAwP//+w8AAO////////8/IAAAAPz/P/8BAKCR////////AwwAKMD//8EPAAAYyv//////f4ADgA/+/we8AAAA4PP//////39lAPz///+BAzgAAHz+////////9QD8//9/xoMPOADe///////////H////f/j4BwiA//p///////8P/v//wZsD/g8AwD8A2///////AwQA+ZA/wP8DAAAABP////sHAAAA4JCWAP7/AAAAgAH8/xMIAAAAAGCZAPD/HwAAAIAB8B+AAQAAAACA9ff//wMABwAAADAAAAAAAAAAAPv3//8BAAAQAMAAAAAAAA==';

function decodeBase64Bytes(b64: string): Uint8Array {
  if (typeof atob === 'function') {
    const bin = atob(b64);
    const out = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return out;
  }
  return new Uint8Array(Buffer.from(b64, 'base64'));
}

// Tính một lần duy nhất chuỗi <path d="M...h0"> cho toàn bộ chấm lục địa
export const WORLD_LAND_DOTS: string = (() => {
  const bytes = decodeBase64Bytes(LAND_MASK_B64);
  const parts: string[] = [];
  let idx = 0;
  for (let la = -56; la <= 82; la += 2.4) {
    for (let lo = -178; lo <= 178; lo += 2.4) {
      const bit = (bytes[idx >> 3]! >> (idx & 7)) & 1;
      idx++;
      if (bit) {
        const [x, y] = geoNaturalEarth1Project([lo, la]);
        parts.push(`M${x.toFixed(1)},${y.toFixed(1)}h0`);
      }
    }
  }
  return parts.join('');
})();
