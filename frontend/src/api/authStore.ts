import type { AuthResponse, AccountType, AdminRole } from '@/types/api';

const AUTH_STORAGE_KEY = 'bionexus_auth_session';

export interface AuthState {
  token: string | null;
  user: AuthResponse | null;
  accountType: AccountType | null;
  role: AdminRole | string | null;
}

const EMPTY_STATE: AuthState = { token: null, user: null, accountType: null, role: null };

// localStorage có thể ném lỗi (chế độ riêng tư, bị chặn cookie): phiên vẫn chạy trong bộ nhớ
function writeStorage(value: AuthState | null): void {
  if (typeof window === 'undefined') return;
  try {
    if (value) {
      window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(value));
    } else {
      window.localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  } catch {
    // Bỏ qua: không lưu được thì phiên chỉ mất khi F5
  }
}

function loadInitialState(): AuthState {
  if (typeof window === 'undefined') {
    return EMPTY_STATE;
  }
  try {
    const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return EMPTY_STATE;
    const parsed = JSON.parse(raw);
    return {
      token: parsed.token || null,
      user: parsed.user || null,
      accountType: parsed.accountType || null,
      role: parsed.role || null,
    };
  } catch {
    return EMPTY_STATE;
  }
}

let currentState: AuthState = loadInitialState();
const listeners = new Set<(state: AuthState) => void>();

export function getStoredToken(): string | null {
  return currentState.token;
}

export function getAuthState(): AuthState {
  return currentState;
}

/** Khóa nhận diện người đang đăng nhập, dùng để biết lúc nào phải xóa dữ liệu riêng tư trong bộ đệm */
export function getIdentityKey(state: AuthState): string {
  return state.token && state.user ? `${state.accountType}:${state.user.id}` : 'guest';
}

export function setAuthSession(auth: AuthResponse): void {
  currentState = {
    token: auth.token,
    user: auth,
    accountType: auth.accountType,
    role: auth.role,
  };
  writeStorage(currentState);
  listeners.forEach((fn) => fn(currentState));
}

export function clearAuthSession(): void {
  const wasSignedIn = !!(currentState.token || currentState.user);
  currentState = EMPTY_STATE;
  writeStorage(null);
  if (wasSignedIn) listeners.forEach((fn) => fn(currentState));
}

export function subscribeAuth(listener: (state: AuthState) => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
