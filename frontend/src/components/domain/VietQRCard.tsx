import React, { useState } from 'react';
import { Copy, Check, QrCode, Info } from 'lucide-react';
import { toast } from 'sonner';
import { formatVnd } from '@/lib/parseEnvironmentSpecs';

export interface VietQRCardProps {
  amount: number;
  memo: string;
  accountNumber?: string;
  bankName?: string;
  accountHolder?: string;
}

export const VietQRCard: React.FC<VietQRCardProps> = ({
  amount,
  memo,
  // Tài khoản minh hoạ: dự án chưa kết nối cổng thanh toán thật
  accountNumber = '0000 0000 0000',
  bankName = 'Ngân hàng minh hoạ (chưa kết nối)',
  accountHolder = 'BIONEXUS DEMO',
}) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyToClipboard = async (text: string, label: string) => {
    try {
      // Trình duyệt chặn clipboard (http, iframe, từ chối quyền) thì báo lỗi thay vì báo thành công giả
      await navigator.clipboard.writeText(text);
      setCopiedField(label);
      toast.success(`Đã sao chép ${label}`);
      setTimeout(() => setCopiedField(null), 2000);
    } catch {
      toast.error(`Không sao chép được ${label}. Hãy chọn và sao chép thủ công.`);
    }
  };

  return (
    <div className="rounded-2xl border border-line bg-surface-1/70 backdrop-blur-xl p-5 md:p-6 shadow-xl space-y-5">
      <div className="flex items-center justify-between border-b border-line/60 pb-3">
        <div className="flex items-center gap-2">
          <QrCode className="size-5 text-accent" aria-hidden="true" />
          <h3 className="font-semibold text-fg text-sm uppercase tracking-wider">
            Chuyển khoản ngân hàng (VietQR)
          </h3>
        </div>
        <span className="flex items-center gap-1 text-[11px] text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
          <Info className="size-3" aria-hidden="true" /> Bản minh hoạ
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        {/* Khung mã QR giả lập chuẩn Napas */}
        <div
          className="md:col-span-5 flex flex-col items-center justify-center p-4 rounded-xl border border-line bg-white text-black shadow-inner"
          aria-hidden="true"
        >
          <div className="text-center font-bold text-xs uppercase tracking-widest text-emerald-800 mb-2">
            Napas 247 · VietQR
          </div>
          <div className="relative size-40 bg-gray-900 rounded-lg p-2.5 flex flex-col justify-between items-center text-white">
            {/* Họa tiết QR giả lập trực quan */}
            <div className="w-full flex justify-between">
              <div className="size-9 border-4 border-accent rounded-sm flex items-center justify-center">
                <div className="size-4 bg-accent" />
              </div>
              <div className="size-9 border-4 border-accent rounded-sm flex items-center justify-center">
                <div className="size-4 bg-accent" />
              </div>
            </div>
            <div className="flex items-center justify-center">
              <div className="size-8 rounded-full border border-white/20 bg-accent text-accent-ink font-bold text-[9px] flex items-center justify-center shadow-lg">
                BIO
              </div>
            </div>
            <div className="w-full flex justify-between">
              <div className="size-9 border-4 border-accent rounded-sm flex items-center justify-center">
                <div className="size-4 bg-accent" />
              </div>
              <div className="grid grid-cols-2 gap-1 size-9 p-1">
                <div className="bg-accent rounded-xs" />
                <div className="bg-white/40 rounded-xs" />
                <div className="bg-white/40 rounded-xs" />
                <div className="bg-accent rounded-xs" />
              </div>
            </div>
          </div>
          <p className="mt-2 text-[10px] text-gray-500 font-mono text-center">
            Mã QR minh hoạ, không dùng để chuyển tiền
          </p>
        </div>

        {/* Thông tin chuyển khoản chi tiết */}
        <div className="md:col-span-7 space-y-3 text-xs">
          <div className="rounded-lg border border-line/60 bg-surface-2/40 p-2.5">
            <span className="text-fg-3 block text-[11px]">Ngân hàng thụ hưởng:</span>
            <span className="font-semibold text-fg">{bankName}</span>
          </div>

          <div className="rounded-lg border border-line/60 bg-surface-2/40 p-2.5 flex items-center justify-between">
            <div>
              <span className="text-fg-3 block text-[11px]">Số tài khoản:</span>
              <span className="font-mono font-bold text-accent text-sm">{accountNumber}</span>
            </div>
            <button
              type="button"
              onClick={() => void copyToClipboard(accountNumber, 'Số tài khoản')}
              className="flex items-center gap-1 rounded-md border border-line bg-surface px-2 py-1 text-[11px] text-fg-2 hover:text-fg hover:border-accent transition-colors"
            >
              {copiedField === 'Số tài khoản' ? <Check className="size-3 text-accent" aria-hidden="true" /> : <Copy className="size-3" aria-hidden="true" />}
              {copiedField === 'Số tài khoản' ? 'Đã sao chép' : 'Sao chép'}
            </button>
          </div>

          <div className="rounded-lg border border-line/60 bg-surface-2/40 p-2.5">
            <span className="text-fg-3 block text-[11px]">Chủ tài khoản:</span>
            <span className="font-mono font-semibold text-fg">{accountHolder}</span>
          </div>

          <div className="rounded-lg border border-line/60 bg-surface-2/40 p-2.5 flex items-center justify-between">
            <div>
              <span className="text-fg-3 block text-[11px]">Số tiền:</span>
              <span className="font-mono font-bold text-fg text-sm">{formatVnd(amount)}</span>
            </div>
            <button
              type="button"
              onClick={() => void copyToClipboard(String(amount), 'Số tiền')}
              className="flex items-center gap-1 rounded-md border border-line bg-surface px-2 py-1 text-[11px] text-fg-2 hover:text-fg hover:border-accent transition-colors"
            >
              {copiedField === 'Số tiền' ? <Check className="size-3 text-accent" aria-hidden="true" /> : <Copy className="size-3" aria-hidden="true" />}
              {copiedField === 'Số tiền' ? 'Đã sao chép' : 'Sao chép'}
            </button>
          </div>

          <div className="rounded-lg border border-line/60 bg-surface-2/40 p-2.5 flex items-center justify-between">
            <div>
              <span className="text-fg-3 block text-[11px]">Nội dung chuyển khoản:</span>
              <span className="font-mono font-bold text-amber-300 text-sm">{memo}</span>
            </div>
            <button
              type="button"
              onClick={() => void copyToClipboard(memo, 'Nội dung chuyển khoản')}
              className="flex items-center gap-1 rounded-md border border-line bg-surface px-2 py-1 text-[11px] text-fg-2 hover:text-fg hover:border-accent transition-colors"
            >
              {copiedField === 'Nội dung chuyển khoản' ? <Check className="size-3 text-accent" aria-hidden="true" /> : <Copy className="size-3" aria-hidden="true" />}
              {copiedField === 'Nội dung chuyển khoản' ? 'Đã sao chép' : 'Sao chép'}
            </button>
          </div>
        </div>
      </div>
      <p className="text-xs text-fg-3">
        Đồ án chưa tích hợp cổng thanh toán: đơn hàng được tạo ở trạng thái chờ xử lý, không có giao dịch tiền thật.
      </p>
    </div>
  );
};
