import React, { useState } from 'react';
import { Copy, Check, QrCode, ShieldCheck } from 'lucide-react';
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
  accountNumber = '9999-BIONEXUS-VND',
  bankName = 'BioNexus Ecological Bank (Napas247)',
  accountHolder = 'QUY BAO TON SINH QUYEN BIONEXUS',
}) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    toast.success(`Đã sao chép ${label}`);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <div className="rounded-2xl border border-line bg-surface-1/70 backdrop-blur-xl p-5 md:p-6 shadow-xl space-y-5">
      <div className="flex items-center justify-between border-b border-line/60 pb-3">
        <div className="flex items-center gap-2">
          <QrCode className="size-5 text-accent" />
          <h4 className="font-semibold text-fg text-sm uppercase tracking-wider font-mono">
            Chuyển khoản Ngân hàng (VietQR)
          </h4>
        </div>
        <span className="flex items-center gap-1 text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
          <ShieldCheck className="size-3" /> Tự động khớp lệnh
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        {/* Khung mã QR giả lập chuẩn Napas */}
        <div className="md:col-span-5 flex flex-col items-center justify-center p-4 rounded-xl border border-line bg-white text-black shadow-inner">
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
            Quét bằng app ngân hàng bất kỳ
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
              onClick={() => copyToClipboard(accountNumber, 'Số tài khoản')}
              className="flex items-center gap-1 rounded-md border border-line bg-surface px-2 py-1 text-[11px] text-fg-2 hover:text-fg hover:border-accent transition-colors"
            >
              {copiedField === 'Số tài khoản' ? <Check className="size-3 text-accent" /> : <Copy className="size-3" />}
              {copiedField === 'Số tài khoản' ? 'Đã sao chép' : 'Sao chép'}
            </button>
          </div>

          <div className="rounded-lg border border-line/60 bg-surface-2/40 p-2.5">
            <span className="text-fg-3 block text-[11px]">Chủ tài khoản:</span>
            <span className="font-mono font-semibold text-fg">{accountHolder}</span>
          </div>

          <div className="rounded-lg border border-line/60 bg-surface-2/40 p-2.5 flex items-center justify-between">
            <div>
              <span className="text-fg-3 block text-[11px]">Số tiền chính xác:</span>
              <span className="font-mono font-bold text-fg text-sm">{formatVnd(amount)}</span>
            </div>
            <button
              type="button"
              onClick={() => copyToClipboard(String(amount), 'Số tiền')}
              className="flex items-center gap-1 rounded-md border border-line bg-surface px-2 py-1 text-[11px] text-fg-2 hover:text-fg hover:border-accent transition-colors"
            >
              {copiedField === 'Số tiền' ? <Check className="size-3 text-accent" /> : <Copy className="size-3" />}
              {copiedField === 'Số tiền' ? 'Đã sao chép' : 'Sao chép'}
            </button>
          </div>

          <div className="rounded-lg border border-line/60 bg-surface-2/40 p-2.5 flex items-center justify-between">
            <div>
              <span className="text-fg-3 block text-[11px]">Nội dung chuyển khoản (Memo):</span>
              <span className="font-mono font-bold text-amber-300 text-sm">{memo}</span>
            </div>
            <button
              type="button"
              onClick={() => copyToClipboard(memo, 'Nội dung chuyển khoản')}
              className="flex items-center gap-1 rounded-md border border-line bg-surface px-2 py-1 text-[11px] text-fg-2 hover:text-fg hover:border-accent transition-colors"
            >
              {copiedField === 'Nội dung chuyển khoản' ? <Check className="size-3 text-accent" /> : <Copy className="size-3" />}
              {copiedField === 'Nội dung chuyển khoản' ? 'Đã sao chép' : 'Sao chép'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
