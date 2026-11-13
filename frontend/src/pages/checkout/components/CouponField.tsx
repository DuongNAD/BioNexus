// Hằng số này giữ file không rỗng khi khối bên dưới đang bị comment (lint cấm file rỗng).
export const FEATURE_INFO = 'TN-06 · Mã giảm giá (xem CHUC-NANG-MUA-HANG-THEM.md)';

// [TN-06] BẮT ĐẦU · Ô nhập mã giảm giá trên trang thanh toán
// import React, { useState } from 'react';
// import { TicketPercent, X } from 'lucide-react';
// import { Button } from '@/components/ui/Button';
// import { useCheckCoupon } from '@/api/mutations/useOrderMutations';
// import { ApiError } from '@/api/errors';
// import { formatVnd } from '@/lib/parseEnvironmentSpecs';
// import type { CouponDto } from '@/types/api';

// interface CouponFieldProps {
  // subtotal: number;
  // applied: CouponDto | null;
  // onChange: (coupon: CouponDto | null) => void;
// }

// /**
 // * Bấm "Áp dụng" thì hỏi backend mã có hợp lệ không và được giảm bao nhiêu.
 // * Đây chỉ là xem trước: lúc đặt hàng backend tính lại từ giá trong DB.
 // */
// export function CouponField({ subtotal, applied, onChange }: CouponFieldProps): React.JSX.Element {
  // const [code, setCode] = useState('');
  // const [errorText, setErrorText] = useState<string | null>(null);
  // const checkCoupon = useCheckCoupon();

  // const handleApply = async () => {
    // if (!code.trim()) {
      // setErrorText('Vui lòng nhập mã giảm giá');
      // return;
    // }
    // setErrorText(null);
    // try {
      // const coupon = await checkCoupon.mutateAsync({ code, subtotal });
      // onChange(coupon);
      // setCode('');
    // } catch (err) {
      // const message = err instanceof ApiError ? err.message : 'Không kiểm tra được mã. Vui lòng thử lại.';
      // setErrorText(message);
    // }
  // };

  // if (applied) {
    // return (
      // <div className="flex items-start justify-between gap-3 rounded-xl border border-accent/40 bg-accent/10 px-3 py-2.5">
        // <div className="min-w-0">
          // <p className="flex items-center gap-2 font-mono text-sm font-semibold text-fg">
            // <TicketPercent className="size-4 shrink-0 text-accent" aria-hidden="true" />
            // {applied.code}
          // </p>
          // <p className="mt-0.5 text-sm text-fg-2">{applied.description}</p>
          // <p className="mt-0.5 text-sm text-fg-2">
            // Giảm <span className="font-mono text-fg">{formatVnd(applied.discountAmount)}</span>
          // </p>
        // </div>
        // <button
          // type="button"
          // onClick={() => onChange(null)}
          // className="rounded-full p-1.5 text-fg-3 hover:bg-surface-2 hover:text-fg"
          // aria-label={`Bỏ mã ${applied.code}`}
        // >
          // <X className="size-4" aria-hidden="true" />
        // </button>
      // </div>
    // );
  // }

  // return (
    // <div>
      // <label htmlFor="coupon-code" className="text-sm font-medium text-fg-2">
        // Mã giảm giá
      // </label>
      // <div className="mt-2 flex gap-2">
        // <input
          // id="coupon-code"
          // value={code}
          // onChange={(e) => setCode(e.target.value.toUpperCase())}
          // onKeyDown={(e) => {
            // if (e.key === 'Enter') {
              // e.preventDefault();
              // handleApply();
            // }
          // }}
          // placeholder="Ví dụ: GIAM50K"
          // autoComplete="off"
          // aria-invalid={Boolean(errorText)}
          // aria-describedby={errorText ? 'coupon-error' : 'coupon-hint'}
          // className="h-11 min-w-0 flex-1 rounded-full border border-line bg-surface px-4 font-mono text-sm text-fg placeholder:font-sans placeholder:text-fg-3 focus:border-accent focus:outline-none"
        // />
        // <Button variant="secondary" pill onClick={handleApply} isLoading={checkCoupon.isPending}>
          // Áp dụng
        // </Button>
      // </div>
      // {errorText ? (
        // <p id="coupon-error" role="alert" className="mt-2 text-sm text-danger">
          // {errorText}
        // </p>
      // ) : (
        // <p id="coupon-hint" className="mt-2 text-sm text-fg-3">
          // Mã dùng thử: <span className="font-mono">BIONEXUS10</span>, <span className="font-mono">GIAM50K</span>
        // </p>
      // )}
    // </div>
  // );
// }
// [TN-06] KẾT THÚC
