import { MOCK_LATENCY } from '@/lib/env';

let simulatedLatency = MOCK_LATENCY || 200;
let simulatedFaultRate = 0; // 0% đến 50%

export function getSimulatedLatency(): number {
  return simulatedLatency;
}

export function setSimulatedLatency(ms: number): void {
  simulatedLatency = Math.max(100, Math.min(3000, ms));
}

export function getSimulatedFaultRate(): number {
  return simulatedFaultRate;
}

export function setSimulatedFaultRate(rate: number): void {
  simulatedFaultRate = Math.max(0, Math.min(0.5, rate));
}

/**
 * Áp dụng độ trễ nhân tạo và kiểm tra tỷ lệ lỗi mô phỏng
 */
export async function applySimulatedLatency(): Promise<boolean> {
  if (simulatedLatency > 0) {
    await new Promise((resolve) => setTimeout(resolve, simulatedLatency));
  }
  if (simulatedFaultRate > 0 && Math.random() < simulatedFaultRate) {
    return true; // Kích hoạt lỗi mô phỏng (500)
  }
  return false;
}
