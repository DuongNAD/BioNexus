import type { ApiResponse } from '@/types/api';
import { ApiError } from './errors';
import { getStoredToken, clearAuthSession } from './authStore';

export interface ApiRequestOptions extends RequestInit {
  skipAuth?: boolean;
  skipAuthRedirect?: boolean;
}

/**
 * Chuẩn hóa endpoint:
 * - Loại bỏ dấu gạch chéo đầu (/) nếu truyền vào.
 * - Đảm bảo luôn bắt đầu bằng 'api/'.
 * - Tuyệt đối giữ đường dẫn tương đối để chạy trơn tru trong WAR Tomcat (/BioNexus).
 */
export function sanitizeEndpoint(endpoint: string): string {
  let cleaned = endpoint.trim();
  while (cleaned.startsWith('/')) {
    cleaned = cleaned.slice(1);
  }
  if (!cleaned.startsWith('api/')) {
    cleaned = `api/${cleaned}`;
  }
  return cleaned;
}

/**
 * Xử lý điều hướng khi gặp mã HTTP 401
 */
function handleUnauthorizedRedirect(): void {
  clearAuthSession();

  if (typeof window === 'undefined') return;

  const currentHash = window.location.hash || '';
  const currentPath = currentHash.startsWith('#') ? currentHash.slice(1) : currentHash;

  if (
    currentPath.startsWith('/login') ||
    currentPath.startsWith('/register') ||
    currentPath.startsWith('/admin/login')
  ) {
    return;
  }

  const isTargetAdmin = currentPath.startsWith('/admin');
  const loginBase = isTargetAdmin ? '#/admin/login' : '#/login';
  const nextParam = currentPath && currentPath !== '/' ? `?next=${encodeURIComponent(currentPath)}` : '';

  window.location.hash = `${loginBase}${nextParam}`;
}

/**
 * Hàm gọi API trung tâm của BioNexus Frontend
 */
export async function api<T>(
  endpoint: string,
  options: ApiRequestOptions = {}
): Promise<ApiResponse<T>> {
  const { skipAuth = false, skipAuthRedirect = false, headers, ...restOptions } = options;

  const sanitizedUrl = sanitizeEndpoint(endpoint);

  const requestHeaders = new Headers(headers);
  if (!requestHeaders.has('Content-Type') && !(restOptions.body instanceof FormData)) {
    requestHeaders.set('Content-Type', 'application/json');
  }
  if (!requestHeaders.has('Accept')) {
    requestHeaders.set('Accept', 'application/json');
  }

  if (!skipAuth && !requestHeaders.has('Authorization')) {
    const token = getStoredToken();
    if (token) {
      requestHeaders.set('Authorization', `Bearer ${token}`);
    }
  }

  let response: Response;
  try {
    response = await fetch(sanitizedUrl, {
      ...restOptions,
      headers: requestHeaders,
    });
  } catch {
    throw new ApiError(
      0,
      'INTERNAL_ERROR',
      'Không thể kết nối đến máy chủ BioNexus. Vui lòng kiểm tra lại kết nối mạng.'
    );
  }

  let json: ApiResponse<T> | null = null;
  try {
    json = (await response.json()) as ApiResponse<T>;
  } catch {
    json = null;
  }

  if (response.status === 401) {
    if (!skipAuthRedirect) {
      handleUnauthorizedRedirect();
    }
    const errorCode = json?.code || 'AUTH_UNAUTHORIZED';
    const errorMessage = json?.message || 'Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.';
    throw new ApiError(401, errorCode, errorMessage, json?.data ?? null);
  }

  if (!response.ok || (json && json.success === false)) {
    const status = response.status;
    let errorCode = json?.code;

    if (!errorCode) {
      switch (status) {
        case 400: errorCode = 'BAD_REQUEST'; break;
        case 403: errorCode = 'AUTH_FORBIDDEN'; break;
        case 404: errorCode = 'NOT_FOUND'; break;
        case 409: errorCode = 'CONFLICT'; break;
        default: errorCode = 'INTERNAL_ERROR'; break;
      }
    }

    throw new ApiError(status, errorCode, json?.message, json?.data ?? null);
  }

  if (json) {
    return json;
  }

  return {
    success: true,
    code: 'SUCCESS',
    message: 'Thành công',
    data: null as unknown as T,
  };
}
