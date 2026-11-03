import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { api, sanitizeEndpoint } from '../client';
import { clearAuthSession, getAuthState, setAuthSession } from '../authStore';
import { ApiError } from '../errors';

describe('sanitizeEndpoint', () => {
  it('loại bỏ dấu gạch chéo đầu và bảo đảm tiền tố api/', () => {
    expect(sanitizeEndpoint('/api/products')).toBe('api/products');
    expect(sanitizeEndpoint('///api/species/1')).toBe('api/species/1');
    expect(sanitizeEndpoint('products/search')).toBe('api/products/search');
    expect(sanitizeEndpoint('/taxonomy')).toBe('api/taxonomy');
  });
});

describe('api client', () => {
  beforeEach(() => {
    clearAuthSession();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    clearAuthSession();
    vi.restoreAllMocks();
  });

  it('gắn tự động header Authorization khi có token', async () => {
    setAuthSession({
      token: 'mock.test-token.sig',
      id: 1,
      username: 'levanc',
      fullName: 'Lê Văn C',
      accountType: 'USER',
      role: null,
    });

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ success: true, code: 'SUCCESS', message: 'OK', data: { id: 1 } }),
    });
    vi.stubGlobal('fetch', mockFetch);

    const res = await api('me');
    expect(res.success).toBe(true);
    expect(mockFetch).toHaveBeenCalledTimes(1);

    const callArgs = mockFetch.mock.calls[0];
    expect(callArgs).toBeDefined();
    expect(callArgs?.[0]).toBe('api/me');
    const headers = callArgs?.[1]?.headers;
    expect(headers?.get('Authorization')).toBe('Bearer mock.test-token.sig');
  });


  it('ném ApiError khi server trả về lỗi 400', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({
        success: false,
        code: 'BAD_REQUEST',
        message: 'Dữ liệu không hợp lệ',
        data: null,
      }),
    });
    vi.stubGlobal('fetch', mockFetch);

    await expect(api('test-endpoint')).rejects.toThrowError(ApiError);
  });

  it('401 của request có token thì xóa phiên', async () => {
    setAuthSession({
      token: 'mock.expired.sig',
      id: 3,
      username: 'levanc',
      fullName: 'Lê Văn C',
      accountType: 'USER',
      role: null,
    });
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
        json: async () => ({ success: false, code: 'AUTH_TOKEN_EXPIRED', message: 'Hết phiên', data: null }),
      })
    );

    await expect(api('cart')).rejects.toMatchObject({ status: 401, code: 'AUTH_TOKEN_EXPIRED' });
    expect(getAuthState().token).toBeNull();
  });

  it('401 của request đăng nhập (không gửi token) không đăng xuất người đang đăng nhập', async () => {
    setAuthSession({
      token: 'mock.valid.sig',
      id: 3,
      username: 'levanc',
      fullName: 'Lê Văn C',
      accountType: 'USER',
      role: null,
    });
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
        json: async () => ({ success: false, code: 'AUTH_INVALID_CREDENTIALS', message: 'Sai', data: null }),
      })
    );

    await expect(
      api('auth/admin/login', { method: 'POST', body: '{}', skipAuth: true })
    ).rejects.toMatchObject({ status: 401 });
    expect(getAuthState().token).toBe('mock.valid.sig');
  });
});
