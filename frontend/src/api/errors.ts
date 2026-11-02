import { getMessage } from '@/lib/messages';

/**
 * Lớp lỗi chuẩn hóa của BioNexus API Client.
 * Chứa mã HTTP status, mã lỗi định danh MessageKey và thông điệp tiếng Việt.
 */
export class ApiError extends Error {
  public readonly status: number;
  public readonly code: string;
  public readonly data: unknown | null;

  constructor(status: number, code: string, serverMessage?: string, data: unknown = null) {
    const fallbackMessage = getMessage(code);
    const finalMessage = serverMessage && serverMessage.trim().length > 0 ? serverMessage : fallbackMessage;

    super(finalMessage);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.data = data;

    Object.setPrototypeOf(this, ApiError.prototype);
  }

  isAuthError(): boolean {
    return this.status === 401 || this.status === 403;
  }

  isConflict(): boolean {
    return this.status === 409;
  }

  isNotFound(): boolean {
    return this.status === 404;
  }
}
