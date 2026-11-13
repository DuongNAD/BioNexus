import { useQuery } from '@tanstack/react-query';
import { api } from '../client';
import { queryKeys } from '../keys';
import { toProductView, type ProductViewModel } from '../adapters';
import type { SellerDto, ProductDto, SellerStatus, ProductStatus, TaxonomyNodeDto } from '@/types/api';
// import type { AdminOrderDto, OrderStatus } from '@/types/api'; // [TN-03]
// import type { SalesStatsDto } from '@/types/api'; // [TN-04]
// import type { OrderDto, PaymentStatus } from '@/types/api'; // [TN-11]

// Bỏ trống status để lấy mọi trạng thái: "ALL" không phải giá trị enum hợp lệ ở backend
export function useAdminSellers(status?: SellerStatus, options?: { enabled?: boolean }) {
  return useQuery<SellerDto[]>({
    queryKey: queryKeys.admin.sellers(status),
    queryFn: async () => {
      const endpoint = status ? `admin/sellers?status=${status}` : 'admin/sellers';
      const res = await api<SellerDto[]>(endpoint);
      return res.data || [];
    },
    staleTime: 0,
    enabled: options?.enabled,
  });
}

export function usePendingSellers(options?: { enabled?: boolean }) {
  return useAdminSellers('PENDING', options);
}

export function useAdminProducts(status?: ProductStatus, options?: { enabled?: boolean }) {
  return useQuery<ProductViewModel[]>({
    queryKey: queryKeys.admin.products(status),
    queryFn: async () => {
      const endpoint = status ? `admin/products?status=${status}` : 'admin/products';
      const res = await api<ProductDto[]>(endpoint);
      const list = res.data || [];
      return list.map((p) => toProductView(p));
    },
    staleTime: 0,
    enabled: options?.enabled,
  });
}

export function usePendingProducts(options?: { enabled?: boolean }) {
  return useAdminProducts('PENDING', options);
}

// [TN-03] BẮT ĐẦU · Danh sách đơn cho quản trị (GET api/admin/orders?status=)
// // Bỏ trống status để lấy mọi đơn
// export function useAdminOrders(status?: OrderStatus, options?: { enabled?: boolean }) {
  // return useQuery<AdminOrderDto[]>({
    // queryKey: queryKeys.admin.orders(status),
    // queryFn: async () => {
      // const endpoint = status ? `admin/orders?status=${status}` : 'admin/orders';
      // const res = await api<AdminOrderDto[]>(endpoint);
      // return res.data || [];
    // },
    // staleTime: 0,
    // enabled: options?.enabled,
  // });
// }
// [TN-03] KẾT THÚC

// [TN-04] BẮT ĐẦU · Thống kê doanh thu (GET api/admin/stats)
// export function useAdminSalesStats(options?: { enabled?: boolean }) {
  // return useQuery<SalesStatsDto | null>({
    // queryKey: queryKeys.admin.stats(),
    // queryFn: async () => {
      // const res = await api<SalesStatsDto>('admin/stats');
      // return res.data;
    // },
    // staleTime: 0,
    // enabled: options?.enabled,
  // });
// }
// [TN-04] KẾT THÚC

// [TN-11] BẮT ĐẦU · Đơn theo trạng thái thanh toán (GET api/admin/payments?status=)
// export function useAdminPayments(status?: PaymentStatus, options?: { enabled?: boolean }) {
  // return useQuery<OrderDto[]>({
    // queryKey: queryKeys.admin.payments(status),
    // queryFn: async () => {
      // const endpoint = status ? `admin/payments?status=${status}` : 'admin/payments';
      // const res = await api<OrderDto[]>(endpoint);
      // return res.data || [];
    // },
    // staleTime: 0,
    // enabled: options?.enabled,
  // });
// }
// [TN-11] KẾT THÚC

export interface GenusOption extends TaxonomyNodeDto {
  /** Đường phân loại từ giới tới họ, dùng làm gợi ý trong form thêm loài */
  lineage: string;
}

/**
 * Danh sách nút cấp GENUS cho form thêm loài. Hợp đồng API không có endpoint liệt kê mọi nút,
 * nên đi từ 2 giới gốc xuống theo từng tầng bằng taxonomy/{id}/children (cây chỉ 6 cấp).
 */
export function useGenusOptions(options?: { enabled?: boolean }) {
  return useQuery<GenusOption[]>({
    queryKey: [...queryKeys.taxonomy.all(), 'genus-options'],
    queryFn: async () => {
      const rootRes = await api<TaxonomyNodeDto[]>('taxonomy');
      let level: { node: TaxonomyNodeDto; path: string[] }[] = (rootRes.data || []).map((node) => ({ node, path: [] }));
      const genera: GenusOption[] = [];

      while (level.length > 0) {
        const next: typeof level = [];
        for (const item of level) {
          if ((item.node.rank || item.node.rankLevel) === 'GENUS') {
            genera.push({ ...item.node, lineage: item.path.join(' > ') });
          }
        }
        const branches = level.filter((item) => (item.node.rank || item.node.rankLevel) !== 'GENUS');
        const childLists = await Promise.all(
          branches.map((item) => api<TaxonomyNodeDto[]>(`taxonomy/${item.node.id}/children`).then((res) => res.data || []))
        );
        branches.forEach((item, i) => {
          for (const child of childLists[i] ?? []) {
            next.push({ node: child, path: [...item.path, item.node.commonName || item.node.scientificName] });
          }
        });
        level = next;
      }

      return genera.sort((a, b) => a.scientificName.localeCompare(b.scientificName));
    },
    staleTime: 10 * 60 * 1000,
    enabled: options?.enabled,
  });
}
