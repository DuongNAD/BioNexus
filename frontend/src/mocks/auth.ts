import type { AccountType, AdminRole } from '@/types/api';

export interface DecodedToken {
  sub: number;
  username: string;
  accountType: AccountType;
  role: AdminRole | string | null;
  exp: number;
}

function toBase64Url(str: string): string {
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(str, 'utf8').toString('base64url');
  }
  const base64 = btoa(
    encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (_, p1) =>
      String.fromCharCode(parseInt(p1, 16))
    )
  );
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(base64url: string): string {
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(base64url, 'base64url').toString('utf8');
  }
  let base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new TextDecoder().decode(bytes);
}

/**
 * Tạo token JWT giả lập với chữ ký test-sig
 */
export function createMockToken(payload: Omit<DecodedToken, 'exp'> & { exp?: number }): string {
  const fullPayload: DecodedToken = {
    ...payload,
    exp: payload.exp || Date.now() + 8 * 3600 * 1000,
  };
  const jsonStr = JSON.stringify(fullPayload);
  const base64 = toBase64Url(jsonStr);
  return `mock.${base64}.test-sig`;
}

/**
 * Giải mã và xác thực token JWT giả lập
 */
export function verifyMockToken(token: string | null | undefined): DecodedToken | null {
  if (!token || !token.startsWith('mock.')) return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  if (parts[2] !== 'test-sig') return null; // Chữ ký bị can thiệp
  try {
    const jsonStr = fromBase64Url(parts[1]!);
    const decoded = JSON.parse(jsonStr) as DecodedToken;
    if (decoded.exp && decoded.exp < Date.now()) {
      return null; // Hết hạn
    }
    return decoded;
  } catch {
    return null;
  }
}

/**
 * Trích xuất token từ header Authorization
 */
export function extractBearerToken(request: Request): string | null {
  const authHeader = request.headers.get('Authorization') || request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.slice(7).trim();
}

/**
 * Xác thực request từ header
 */
export function authenticateRequest(request: Request): DecodedToken | null {
  const token = extractBearerToken(request);
  return verifyMockToken(token);
}
