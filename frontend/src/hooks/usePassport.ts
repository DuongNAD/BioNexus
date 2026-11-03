import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from 'react';
import { getAuthState, subscribeAuth } from '@/api/authStore';
import { JOURNEY_SPECIES_BASE, LEG } from '@/content/journey';

export const PASSPORT_STORAGE_KEY = 'bionexus.passport.v1';

export interface PassportEntry {
  met: string[];
  startedAt: string;
  completedAt?: string;
  skippedAt?: string;
}

export type PassportStorageMap = Record<string, PassportEntry>;

export interface PassportUser {
  name: string;
  username: string;
}

const ALL_STATION_IDS = [
  'tram-1',
  'tram-2',
  'tram-3',
  'tram-4',
  'tram-5',
  'tram-6',
  'tram-7',
  'tram-8',
  'tram-9',
] as const;

const VALID_SLUGS = new Set(Object.keys(JOURNEY_SPECIES_BASE));

const listeners = new Set<() => void>();
function emitPassportChange(): void {
  listeners.forEach((fn) => fn());
}

// Bản sao trong bộ nhớ: khi localStorage bị chặn (ẩn danh, chặn cookie) hộ chiếu vẫn đóng dấu được trong phiên
let memoryMap: PassportStorageMap | null = null;

export function readPassportMap(): PassportStorageMap {
  if (memoryMap) return { ...memoryMap };
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(PASSPORT_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};
    return parsed as PassportStorageMap;
  } catch {
    return {};
  }
}

export function writePassportMap(map: PassportStorageMap): void {
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(PASSPORT_STORAGE_KEY, JSON.stringify(map));
      memoryMap = null;
    } catch {
      // Không ghi được thì giữ trong bộ nhớ để giao diện vẫn khớp với thông báo "Đã đóng dấu"
      memoryMap = { ...map };
    }
  } else {
    memoryMap = { ...map };
  }
  emitPassportChange();
}

export function getPassportEntryForKey(userKey: string): PassportEntry {
  const map = readPassportMap();
  const existing = map[userKey];
  const guestMet =
    userKey !== 'guest' && Array.isArray(map.guest?.met)
      ? map.guest.met.filter((s): s is string => typeof s === 'string' && VALID_SLUGS.has(s))
      : [];
  if (existing && Array.isArray(existing.met)) {
    const filteredMet = existing.met.filter(
      (s): s is string => typeof s === 'string' && VALID_SLUGS.has(s)
    );
    return {
      ...existing,
      met: Array.from(new Set([...filteredMet, ...guestMet])),
      startedAt: existing.startedAt || new Date().toISOString(),
    };
  }
  return {
    met: Array.from(new Set(guestMet)),
    startedAt: new Date().toISOString(),
  };
}

export function resetPassportForKey(userKey: string): void {
  const map = readPassportMap();
  map[userKey] = {
    met: [],
    startedAt: new Date().toISOString(),
  };
  if (userKey !== 'guest' && map.guest) {
    map.guest = {
      met: [],
      startedAt: new Date().toISOString(),
    };
  }
  writePassportMap(map);
}

export function recordPassportStamp(userKey: string, slug: string): { added: boolean; entry: PassportEntry } {
  if (!VALID_SLUGS.has(slug)) {
    return { added: false, entry: getPassportEntryForKey(userKey) };
  }
  const map = readPassportMap();
  const current = getPassportEntryForKey(userKey);
  if (current.met.includes(slug)) {
    return { added: false, entry: current };
  }
  const nextMet = [...current.met, slug];
  const nextEntry: PassportEntry = {
    ...current,
    met: nextMet,
    startedAt: current.startedAt || new Date().toISOString(),
    ...(nextMet.length >= 9 ? { completedAt: current.completedAt || new Date().toISOString() } : {}),
  };
  map[userKey] = nextEntry;
  writePassportMap(map);
  return { added: true, entry: nextEntry };
}

export function recordPassportSkip(userKey: string): PassportEntry {
  const map = readPassportMap();
  const current = getPassportEntryForKey(userKey);
  const nextEntry: PassportEntry = {
    ...current,
    startedAt: current.startedAt || new Date().toISOString(),
    skippedAt: new Date().toISOString(),
  };
  map[userKey] = nextEntry;
  writePassportMap(map);
  return nextEntry;
}

export function getFirstUnmetStationId(met: string[]): string {
  for (const stationId of ALL_STATION_IDS) {
    const leg = LEG[stationId];
    if (leg?.slug && !met.includes(leg.slug)) {
      return stationId;
    }
  }
  return 'ho-chieu';
}

function subscribePassportStore(callback: () => void): () => void {
  listeners.add(callback);
  const onStorage = (e: StorageEvent) => {
    if (e.key === PASSPORT_STORAGE_KEY || e.key === null) callback();
  };
  if (typeof window !== 'undefined') {
    window.addEventListener('storage', onStorage);
  }
  return () => {
    listeners.delete(callback);
    if (typeof window !== 'undefined') {
      window.removeEventListener('storage', onStorage);
    }
  };
}

function getPassportSnapshotString(): string {
  if (typeof window === 'undefined') return '{}';
  try {
    return window.localStorage.getItem(PASSPORT_STORAGE_KEY) || '{}';
  } catch {
    return '{}';
  }
}

export interface PassportContextValue {
  userKey: string;
  user: PassportUser | null;
  isWelcomeMode: boolean;
  setWelcomeMode: (welcome: boolean) => void;
  met: string[];
  entry: PassportEntry;
  collect: (slug: string) => void;
  markSkipped: () => void;
  firstUnmetStationId: string;
  lastAnnouncement: string;
  openQuickSearch: () => void;
}

const PassportContext = createContext<PassportContextValue | null>(null);

export interface PassportProviderProps {
  children: React.ReactNode;
  initialWelcomeMode?: boolean;
  onWelcomeModeChange?: (welcome: boolean) => void;
  onOpenQuickSearch?: () => void;
}

export function PassportProvider({
  children,
  initialWelcomeMode = false,
  onWelcomeModeChange,
  onOpenQuickSearch,
}: PassportProviderProps): React.JSX.Element {
  const auth = useSyncExternalStore(subscribeAuth, getAuthState);
  const rawStore = useSyncExternalStore(subscribePassportStore, getPassportSnapshotString);
  const [isWelcomeMode, setIsWelcomeModeState] = useState<boolean>(initialWelcomeMode);
  const [lastAnnouncement, setLastAnnouncement] = useState<string>('');

  useEffect(() => {
    setIsWelcomeModeState(initialWelcomeMode);
  }, [initialWelcomeMode]);

  const setWelcomeMode = useCallback(
    (welcome: boolean) => {
      setIsWelcomeModeState(welcome);
      onWelcomeModeChange?.(welcome);
    },
    [onWelcomeModeChange]
  );

  // Danh tính người thám hiểm: tài khoản đang đăng nhập; chế độ chào mừng khi chưa đăng nhập dùng tên chung
  // (không mượn tài khoản seed, tài liệu 07 chỉ cho phép việc đó trong DevPanel)
  const user = useMemo<PassportUser | null>(() => {
    if (auth.user) {
      return {
        name: auth.user.fullName || auth.user.username,
        username: auth.user.username,
      };
    }
    if (isWelcomeMode) {
      return {
        name: 'Nhà thám hiểm mới',
        username: 'guest',
      };
    }
    return null;
  }, [auth.user, isWelcomeMode]);

  const userKey = auth.user?.username || 'guest';

  const entry = useMemo<PassportEntry>(() => {
    void rawStore;
    return getPassportEntryForKey(userKey);
  }, [rawStore, userKey]);

  // Đảm bảo bản ghi startedAt được khởi tạo khi mở hành trình
  useEffect(() => {
    const map = readPassportMap();
    if (!map[userKey]) {
      map[userKey] = {
        met: [],
        startedAt: new Date().toISOString(),
      };
      writePassportMap(map);
    }
  }, [userKey]);

  const collect = useCallback(
    (slug: string) => {
      const { added } = recordPassportStamp(userKey, slug);
      if (added) {
        const spName = JOURNEY_SPECIES_BASE[slug]?.name || slug;
        setLastAnnouncement(`Đã đóng dấu ${spName}`);
      }
    },
    [userKey]
  );

  const markSkipped = useCallback(() => {
    recordPassportSkip(userKey);
  }, [userKey]);

  const firstUnmetStationId = useMemo(() => getFirstUnmetStationId(entry.met), [entry.met]);

  const openQuickSearch = useCallback(() => {
    onOpenQuickSearch?.();
  }, [onOpenQuickSearch]);

  const value = useMemo<PassportContextValue>(
    () => ({
      userKey,
      user,
      isWelcomeMode,
      setWelcomeMode,
      met: entry.met,
      entry,
      collect,
      markSkipped,
      firstUnmetStationId,
      lastAnnouncement,
      openQuickSearch,
    }),
    [
      userKey,
      user,
      isWelcomeMode,
      setWelcomeMode,
      entry,
      collect,
      markSkipped,
      firstUnmetStationId,
      lastAnnouncement,
      openQuickSearch,
    ]
  );

  return React.createElement(PassportContext.Provider, { value }, children);
}

/**
 * Hook đọc/ghi hộ chiếu loài từ mọi trang (cả trong /tham-hiem lẫn ngoài /account).
 */
export function usePassport(explicitUsername?: string): PassportContextValue {
  const ctx = useContext(PassportContext);
  const auth = useSyncExternalStore(subscribeAuth, getAuthState);
  const rawStore = useSyncExternalStore(subscribePassportStore, getPassportSnapshotString);

  const fallbackKey = explicitUsername || auth.user?.username || 'guest';
  const fallbackEntry = useMemo(() => {
    void rawStore;
    return getPassportEntryForKey(fallbackKey);
  }, [rawStore, fallbackKey]);

  const fallbackCollect = useCallback(
    (slug: string) => {
      recordPassportStamp(fallbackKey, slug);
    },
    [fallbackKey]
  );

  const fallbackSkip = useCallback(() => {
    recordPassportSkip(fallbackKey);
  }, [fallbackKey]);

  if (ctx && !explicitUsername) {
    return ctx;
  }

  return {
    userKey: fallbackKey,
    user: auth.user
      ? { name: auth.user.fullName || auth.user.username, username: auth.user.username }
      : null,
    isWelcomeMode: false,
    setWelcomeMode: () => {},
    met: fallbackEntry.met,
    entry: fallbackEntry,
    collect: fallbackCollect,
    markSkipped: fallbackSkip,
    firstUnmetStationId: getFirstUnmetStationId(fallbackEntry.met),
    lastAnnouncement: '',
    openQuickSearch: () => {},
  };
}
