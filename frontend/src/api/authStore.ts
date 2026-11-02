import type { AuthResponse, AccountType, AdminRole } from '@/types/api';

const AUTH_STORAGE_KEY = 'bionexus_auth_session';

export interface AuthState {
  token: string | null;
  user: AuthResponse | null;
  accountType: AccountType | null;
  role: AdminRole | string | null;
}

function loadInitialState(): AuthState {
  if (typeof window === 'undefined') {
    return { token: null, user: null, accountType: null, role: null };
  }
  try {
    const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return { token: null, user: null, accountType: null, role: null };
    const parsed = JSON.parse(raw);
    return {
      token: parsed.token || null,
      user: parsed.user || null,
      accountType: parsed.accountType || null,
      role: parsed.role || null,
    };
  } catch {
    return { token: null, user: null, accountType: null, role: null };
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

export function setAuthSession(auth: AuthResponse): void {
  currentState = {
    token: auth.token,
    user: auth,
    accountType: auth.accountType,
    role: auth.role,
  };
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(currentState));
  }
  listeners.forEach((fn) => fn(currentState));
}

export function clearAuthSession(): void {
  currentState = { token: null, user: null, accountType: null, role: null };
  if (typeof window !== 'undefined') {
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
  }
  listeners.forEach((fn) => fn(currentState));
}

export function subscribeAuth(listener: (state: AuthState) => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
