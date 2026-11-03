import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { toast } from 'sonner';
import { formatVnd } from '@/lib/parseEnvironmentSpecs';

export interface VietQRCardProps {
  amount: number;
  memo: string;
  accountNumber?: string;
  bankName?: string;
  accountHolder?: string;
}

/**
 * Thông tin chuyển khoản minh hoạ. Không tự vẽ khung viền: thẻ này luôn nằm trong panel thanh toán,
 * nên chỉ dùng đường kẻ mảnh để chia dòng.
 */
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
      toast.success(`Đã sao chép ${label.toLowerCase()}`);
      setTimeout(() => setCopiedField(null), 2000);
    } catch {
      toast.error(`Không sao chép được ${label.toLowerCase()}. Hãy chọn và sao chép thủ công.`);
    }
  };

  const rows: { label: string; value: string; mono?: boolean; copy?: string; highlight?: boolean }[] = [
    { label: 'Ngân hàng', value: bankName },
    { label: 'Số tài khoản', value: accountNumber, mono: true, copy: accountNumber },
    { label: 'Chủ tài khoản', value: accountHolder, mono: true },
    { label: 'Số tiền', value: formatVnd(amount), mono: true, copy: String(amount) },
    { label: 'Nội dung', value: memo, mono: true, copy: memo, highlight: true },
  ];

  return (
    <div className="space-y-4">
      <p className="text-sm text-warm">
        Bản minh hoạ: đồ án chưa nối cổng thanh toán, đơn được tạo ở trạng thái chờ xử lý và không có giao dịch tiền thật.
      </p>
      <dl className="divide-y divide-line">
        {rows.map((row) => (
          <div key={row.label} className="flex items-center justify-between gap-4 py-3">
            <div className="min-w-0">
              <dt className="text-sm text-fg-3">{row.label}</dt>
              <dd
                className={`mt-0.5 truncate ${row.mono ? 'font-mono' : ''} ${row.highlight ? 'text-accent' : 'text-fg'}`}
              >
                {row.value}
              </dd>
            </div>
            {row.copy && (
              <button
                type="button"
                onClick={() => void copyToClipboard(row.copy!, row.label)}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-sm text-fg-2 transition-colors hover:bg-surface-2 hover:text-fg"
                aria-label={`Sao chép ${row.label.toLowerCase()}`}
              >
                {copiedField === row.label ? (
                  <Check className="size-4 text-accent" aria-hidden="true" />
                ) : (
                  <Copy className="size-4" aria-hidden="true" />
                )}
                <span>{copiedField === row.label ? 'Đã chép' : 'Sao chép'}</span>
              </button>
            )}
          </div>
        ))}
      </dl>
    </div>
  );
};
