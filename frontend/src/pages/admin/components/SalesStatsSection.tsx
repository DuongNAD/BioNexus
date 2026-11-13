// Hằng số này giữ file không rỗng khi khối bên dưới đang bị comment (lint cấm file rỗng).
export const FEATURE_INFO = 'TN-04 · Thống kê doanh thu (xem CHUC-NANG-MUA-HANG-THEM.md)';

// [TN-04] BẮT ĐẦU · Khối thống kê doanh thu trên trang tổng quan quản trị
// import React from 'react';
// import { useAdminSalesStats } from '@/api/queries/useAdminQueries';
// import { Panel, Section } from '@/components/layout/Page';
// import { QueryErrorState } from '@/components/domain/QueryErrorState';
// import { Skeleton } from '@/components/ui/Skeleton';
// import { StatRow, type StatItem } from '@/components/ui/StatRow';
// import { formatVnd } from '@/lib/parseEnvironmentSpecs';
// import type { SalesStatsDto } from '@/types/api';

// /** "2026-11" thành "Th11/2026" cho nhãn trục */
// function monthLabel(month: string): string {
  // const [year, monthNumber] = month.split('-');
  // return `Th${Number(monthNumber)}/${year}`;
// }

// /** Số tiền rút gọn cho nhãn ngắn: 2.950.000 thành "2,95 tr" */
// function shortVnd(amount: number): string {
  // if (amount >= 1000000) {
    // return `${(amount / 1000000).toLocaleString('vi-VN', { maximumFractionDigits: 2 })} tr`;
  // }
  // if (amount >= 1000) {
    // return `${(amount / 1000).toLocaleString('vi-VN', { maximumFractionDigits: 0 })} k`;
  // }
  // return amount.toLocaleString('vi-VN');
// }

// export function SalesStatsSection(): React.JSX.Element {
  // const { data: stats, isLoading, isError, error, refetch, isRefetching } = useAdminSalesStats();

  // let body: React.ReactNode;
  // if (isLoading) {
    // body = (
      // <div className="grid gap-4 lg:grid-cols-2" role="status" aria-label="Đang tải thống kê">
        // <Skeleton className="h-64 w-full rounded-[20px]" />
        // <Skeleton className="h-64 w-full rounded-[20px]" />
      // </div>
    // );
  // } else if (isError || !stats) {
    // body = <QueryErrorState title="Không tải được thống kê doanh thu" error={error} onRetry={() => refetch()} isRetrying={isRefetching} />;
  // } else {
    // const items: StatItem[] = [
      // { label: 'Doanh thu đã hoàn tất', value: shortVnd(stats.completedRevenue), hint: formatVnd(stats.completedRevenue) },
      // { label: 'Tổng số đơn', value: stats.totalOrders },
      // { label: 'Đang chờ xử lý', value: stats.pendingOrders, hint: formatVnd(stats.pendingAmount) },
      // { label: 'Đã hủy', value: stats.cancelledOrders },
    // ];
    // body = (
      // <>
        // <Panel>
          // <StatRow items={items} />
        // </Panel>
        // <div className="mt-4 grid gap-4 lg:grid-cols-2">
          // <Panel>
            // <h3 className="font-semibold text-fg">Doanh thu 6 tháng gần nhất</h3>
            // <p className="mt-0.5 text-sm text-fg-3">Chỉ tính đơn đã hoàn tất</p>
            // <MonthlyRevenueBars months={stats.revenueByMonth} />
          // </Panel>
          // <Panel>
            // <h3 className="font-semibold text-fg">Sản phẩm bán chạy</h3>
            // <p className="mt-0.5 text-sm text-fg-3">Theo số cá thể đã bán, không tính đơn đã hủy</p>
            // <TopProductsList products={stats.topProducts} />
          // </Panel>
        // </div>
      // </>
    // );
  // }

  // return (
    // <Section title="Doanh thu và đơn hàng" description="Số liệu lấy trực tiếp từ đơn hàng trong hệ thống.">
      // {body}
    // </Section>
  // );
// }

// function MonthlyRevenueBars({ months }: { months: SalesStatsDto['revenueByMonth'] }): React.JSX.Element {
  // let maxRevenue = 0;
  // for (const m of months) {
    // if (m.revenue > maxRevenue) maxRevenue = m.revenue;
  // }

  // return (
    // <>
      // {/* Biểu đồ chỉ để nhìn nhanh; bảng ẩn bên dưới mang cùng số liệu cho trình đọc màn hình */}
      // <div className="mt-6 flex h-48 items-end gap-2 border-b border-line" aria-hidden="true">
        // {months.map((m) => {
          // let heightPercent = 0;
          // if (maxRevenue > 0) heightPercent = (m.revenue / maxRevenue) * 100;
          // return (
            // <div key={m.month} className="group relative flex h-full flex-1 flex-col justify-end">
              // <span className="pointer-events-none absolute -top-1 left-1/2 z-10 -translate-x-1/2 -translate-y-full rounded-lg border border-line bg-bg-deep px-2 py-1 font-mono text-xs whitespace-nowrap text-fg opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
                // {formatVnd(m.revenue)} · {m.orderCount} đơn
              // </span>
              // <div
                // className="mx-auto w-full max-w-10 rounded-t-[4px] bg-accent transition-opacity group-hover:opacity-80"
                // style={{ height: `${heightPercent}%`, minHeight: m.revenue > 0 ? 2 : 0 }}
              // />
            // </div>
          // );
        // })}
      // </div>
      // <div className="mt-2 flex gap-2" aria-hidden="true">
        // {months.map((m) => (
          // <span key={m.month} className="flex-1 text-center text-xs text-fg-3">
            // {monthLabel(m.month)}
          // </span>
        // ))}
      // </div>
      // <table className="sr-only">
        // <caption>Doanh thu đơn hoàn tất theo tháng</caption>
        // <thead>
          // <tr>
            // <th scope="col">Tháng</th>
            // <th scope="col">Doanh thu</th>
            // <th scope="col">Số đơn</th>
          // </tr>
        // </thead>
        // <tbody>
          // {months.map((m) => (
            // <tr key={m.month}>
              // <td>{monthLabel(m.month)}</td>
              // <td>{formatVnd(m.revenue)}</td>
              // <td>{m.orderCount}</td>
            // </tr>
          // ))}
        // </tbody>
      // </table>
    // </>
  // );
// }

// function TopProductsList({ products }: { products: SalesStatsDto['topProducts'] }): React.JSX.Element {
  // if (products.length === 0) {
    // return <p className="mt-6 text-sm text-fg-3">Chưa có sản phẩm nào được bán.</p>;
  // }
  // return (
    // <ol className="mt-4 divide-y divide-line">
      // {products.map((p, index) => (
        // <li key={p.productId} className="flex items-center gap-3 py-3">
          // <span className="w-6 shrink-0 font-mono text-sm text-fg-3">{index + 1}</span>
          // <span className="min-w-0 flex-1 truncate text-sm text-fg">{p.productName}</span>
          // <span className="shrink-0 text-right">
            // <span className="block font-mono text-sm text-fg">{p.quantitySold} cá thể</span>
            // <span className="block font-mono text-xs text-fg-3">{formatVnd(p.revenue)}</span>
          // </span>
        // </li>
      // ))}
    // </ol>
  // );
// }
// [TN-04] KẾT THÚC
