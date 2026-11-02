import React, { useState, useSyncExternalStore } from 'react';
import { Wrench, X, RotateCcw, UserCheck, Sliders, Shield, LogOut } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { USE_MOCKS } from '@/lib/env';
import { db } from '@/mocks/db';
import {
  getSimulatedLatency,
  setSimulatedLatency,
  getSimulatedFaultRate,
  setSimulatedFaultRate,
} from '@/mocks/faults';
import { getAuthState, subscribeAuth, setAuthSession, clearAuthSession } from '@/api/authStore';

const SEED_ACCOUNTS = [
  { username: 'levanc', roleLabel: 'User: Khách hàng mẫu (Giỏ 2 món, 2 đơn)', type: 'user' },
  { username: 'nguyenvana', roleLabel: 'User: Shop BioGreen Exotic (ACTIVE)', type: 'user' },
  { username: 'phamthid', roleLabel: 'User: Shop Carnivora Garden (Giỏ lỗi)', type: 'user' },
  { username: 'tranthib', roleLabel: 'User: Shop AquaTerra (PENDING)', type: 'user' },
  { username: 'hoangvane', roleLabel: 'User: Shop Reptile Hub (REJECTED)', type: 'user' },
  { username: 'vuthif', roleLabel: 'User: Vũ Thị F (BANNED)', type: 'user' },
  { username: 'dangvang', roleLabel: 'User: Đặng Văn G (INACTIVE)', type: 'user' },
  { username: 'superadmin', roleLabel: 'Admin: Quản trị tổng (SUPER_ADMIN)', type: 'admin' },
  { username: 'moderator1', roleLabel: 'Admin: Kiểm duyệt viên 1 (MODERATOR)', type: 'admin' },
  { username: 'biologist1', roleLabel: 'Admin: TS. Nam (BIOLOGIST)', type: 'admin' },
  { username: 'moderator2', roleLabel: 'Admin: KDV 2 (MODERATOR - INACTIVE)', type: 'admin' },
  { username: 'biologist2', roleLabel: 'Admin: ThS. Minh (BIOLOGIST - BANNED)', type: 'admin' },
];

import { useQuality } from '@/components/3d/QualityProvider';
import type { UserQualityPreference } from '@/components/3d/types';

function DevPanel3DSection(): React.JSX.Element {
  const { tier, userTier, setUserTier, reportFpsDrop, capabilities } = useQuality();

  return (
    <div className="rounded-lg border border-line bg-surface/50 p-3 text-xs space-y-2">
      <div className="flex items-center justify-between font-semibold text-fg-2">
        <span className="flex items-center gap-1.5">
          <Sliders className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
          Đồ họa 3D (Tier: <span className="font-mono text-accent uppercase">{tier}</span>)
        </span>
      </div>

      <div className="flex items-center justify-between gap-2">
        <span className="text-fg-3 text-[11px]">Mức ưu tiên:</span>
        <select
          value={userTier}
          onChange={(e) => setUserTier(e.target.value as UserQualityPreference)}
          className="rounded border border-line bg-surface-2 px-2 py-1 text-[11px] text-fg font-mono"
        >
          <option value="auto">Tự động (Auto)</option>
          <option value="high">Cao (High)</option>
          <option value="medium">Vừa (Medium)</option>
          <option value="low">Thấp (Low)</option>
          <option value="static">Tĩnh (Static)</option>
        </select>
      </div>

      {capabilities.unmaskedRenderer && (
        <div className="text-[10px] text-fg-3 font-mono truncate" title={capabilities.unmaskedRenderer}>
          GPU: {capabilities.unmaskedRenderer}
        </div>
      )}

      <button
        type="button"
        onClick={reportFpsDrop}
        className="w-full text-center rounded border border-line py-1 text-[10px] text-fg-3 hover:text-accent hover:border-accent transition-colors"
      >
        Mô phỏng tụt FPS (Hạ cấp Tier)
      </button>
    </div>
  );
}

export function DevPanel(): React.JSX.Element {
  const [isOpen, setIsOpen] = useState(false);
  const [latency, setLatencyState] = useState(getSimulatedLatency());
  const [faultRate, setFaultRateState] = useState(Math.round(getSimulatedFaultRate() * 100));

  const auth = useSyncExternalStore(subscribeAuth, getAuthState);
  const queryClient = useQueryClient();

  const handleLatencyChange = (val: number) => {
    setLatencyState(val);
    setSimulatedLatency(val);
  };

  const handleFaultRateChange = (val: number) => {
    setFaultRateState(val);
    setSimulatedFaultRate(val / 100);
  };

  const handleResetDb = () => {
    db.resetDb();
    queryClient.invalidateQueries();
    toast.success('Đã khôi phục toàn bộ cơ sở dữ liệu về dữ liệu hạt giống ban đầu.');
  };

  const handleQuickLogin = (acc: (typeof SEED_ACCOUNTS)[0]) => {
    if (acc.type === 'admin') {
      const res = db.loginAdmin(acc.username, 'admin123');
      if (res.status === 200 && res.body.data) {
        setAuthSession(res.body.data);
        queryClient.invalidateQueries();
        toast.success(`Đã đăng nhập tài khoản quản trị: ${acc.username}`);
      } else {
        toast.error(`Đăng nhập thất bại: ${res.body.message}`);
      }
    } else {
      const res = db.loginUser(acc.username, '123456');
      if (res.status === 200 && res.body.data) {
        setAuthSession(res.body.data);
        queryClient.invalidateQueries();
        toast.success(`Đã đăng nhập người dùng: ${acc.username}`);
      } else {
        toast.error(`Đăng nhập thất bại: ${res.body.message}`);
      }
    }
  };

  const handleLogout = () => {
    clearAuthSession();
    queryClient.clear();
    toast.success('Đã đăng xuất tài khoản.');
  };

  return (
    <aside aria-label="DevPanel" className="fixed bottom-4 left-4 z-50">
      {!isOpen ? (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="flex h-10 items-center gap-2 rounded-full border border-line-strong bg-glass px-4 text-xs font-semibold text-accent shadow-lg backdrop-blur-xl hover:border-accent hover:bg-surface-2 focus-visible:ring-2 focus-visible:ring-accent"
          aria-label="Mở DevPanel"
        >
          <Wrench className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
          <span>DevPanel</span>
        </button>
      ) : (
        <div className="w-88 max-h-[85vh] overflow-y-auto rounded-2xl border border-line-strong bg-glass p-5 shadow-2xl backdrop-blur-2xl">
          <div className="mb-4 flex items-center justify-between border-b border-line pb-3">
            <div className="flex items-center gap-2">
              <Wrench className="h-4 w-4 text-accent" aria-hidden="true" />
              <h2 className="text-sm font-bold text-fg">BioNexus DevPanel</h2>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-fg-3 transition-colors hover:bg-surface-hover hover:text-fg focus-visible:ring-2 focus-visible:ring-accent"
              aria-label="Đóng DevPanel"
            >
              <X className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Đóng</span>
            </button>
          </div>

          <div className="space-y-4 text-xs">
            {/* Trạng thái Mock */}
            <div className="rounded-lg border border-line bg-surface/50 p-3">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-fg-2">Mock Service Worker:</span>
                <span className="font-mono font-semibold text-accent">
                  {USE_MOCKS ? 'BẬT (MSW 2)' : 'TẮT (API thật)'}
                </span>
              </div>
            </div>

            {/* Trạng thái đăng nhập hiện tại */}
            <div className="rounded-lg border border-line bg-surface/50 p-3">
              <div className="flex items-center justify-between pb-1">
                <div className="flex items-center gap-1.5 font-semibold text-fg-2">
                  <Shield className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
                  <span>Phiên đăng nhập:</span>
                </div>
                {auth.user ? (
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex items-center gap-1 text-[11px] text-danger hover:underline"
                    aria-label="Đăng xuất"
                  >
                    <LogOut className="h-3 w-3" aria-hidden="true" />
                    <span>Đăng xuất</span>
                  </button>
                ) : null}
              </div>
              {auth.user ? (
                <div className="text-[11px] text-fg-3 space-y-0.5 mt-1">
                  <p>
                    Tài khoản: <span className="font-mono text-fg font-medium">{auth.user.username}</span>
                  </p>
                  <p>
                    Họ tên: <span className="text-fg">{auth.user.fullName}</span>
                  </p>
                  <p>
                    Loại: <span className="font-mono text-accent">{auth.user.accountType}</span>
                    {auth.user.role ? ` (${auth.user.role})` : ''}
                  </p>
                </div>
              ) : (
                <p className="mt-1 text-[11px] text-fg-3">Chưa có phiên đăng nhập (Khách vãng lai)</p>
              )}
            </div>

            {/* Điều khiển Độ trễ & Lỗi */}
            <div className="space-y-3 rounded-lg border border-line bg-surface/50 p-3">
              <div className="flex items-center gap-1.5 font-semibold text-fg-2">
                <Sliders className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
                <span>Mô phỏng mạng & Lỗi:</span>
              </div>

              <div>
                <div className="flex justify-between text-[11px] text-fg-3">
                  <span>Độ trễ giả lập:</span>
                  <span className="font-mono font-medium text-accent">{latency}ms</span>
                </div>
                <input
                  type="range"
                  min="100"
                  max="3000"
                  step="50"
                  value={latency}
                  onChange={(e) => handleLatencyChange(Number(e.target.value))}
                  className="mt-1 w-full accent-accent cursor-pointer"
                  aria-label="Độ trễ giả lập (ms)"
                />
              </div>

              <div>
                <div className="flex justify-between text-[11px] text-fg-3">
                  <span>Tỷ lệ lỗi 500:</span>
                  <span className="font-mono font-medium text-danger">{faultRate}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="50"
                  step="5"
                  value={faultRate}
                  onChange={(e) => handleFaultRateChange(Number(e.target.value))}
                  className="mt-1 w-full accent-danger cursor-pointer"
                  aria-label="Tỷ lệ lỗi mô phỏng (%)"
                />
              </div>
            </div>

            {/* Đăng nhập nhanh 12 tài khoản */}
            <div className="rounded-lg border border-line bg-surface/50 p-3">
              <div className="mb-2 flex items-center gap-1.5 font-semibold text-fg-2">
                <UserCheck className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
                <span>Đăng nhập nhanh (12 tài khoản):</span>
              </div>
              <div className="max-h-40 overflow-y-auto space-y-1 pr-1">
                {SEED_ACCOUNTS.map((acc) => (
                  <button
                    key={acc.username}
                    type="button"
                    onClick={() => handleQuickLogin(acc)}
                    className="w-full text-left rounded px-2 py-1 text-[11px] transition-colors hover:bg-surface-hover hover:text-accent focus-visible:ring-1 focus-visible:ring-accent"
                  >
                    <span className="font-mono font-semibold text-fg">{acc.username}</span>
                    <span className="block text-[10px] text-fg-3 truncate">{acc.roleLabel}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Điều khiển Đồ họa 3D */}
            <DevPanel3DSection />

            {/* Nút Khôi phục dữ liệu gốc */}
            <div>
              <button
                type="button"
                onClick={handleResetDb}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-line-strong bg-surface-2 py-2 text-xs font-semibold text-fg transition-colors hover:border-accent hover:bg-surface-hover hover:text-accent focus-visible:ring-2 focus-visible:ring-accent"
              >
                <RotateCcw className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
                <span>Khôi phục dữ liệu gốc</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
