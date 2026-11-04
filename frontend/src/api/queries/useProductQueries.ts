import { useQuery } from '@tanstack/react-query';
import { api } from '../client';
import { queryKeys } from '../keys';
import { normalizePage } from '../normalize';
import { toProductView, type ProductViewModel } from '../adapters';
import { loadCatalogIndex } from '../catalog';
import type { ProductDto, ReviewDto, Page } from '@/types/api';

export function useProducts(params?: {
  speciesId?: number;
  q?: string;
  page?: number;
  size?: number;
}) {
  return useQuery<Page<ProductViewModel>>({
    queryKey: queryKeys.products.list(params),
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params?.speciesId) searchParams.set('speciesId', String(params.speciesId));
      if (params?.q) searchParams.set('q', params.q);
      if (params?.page) searchParams.set('page', String(params.page));
      if (params?.size) searchParams.set('size', String(params.size));
      const queryStr = searchParams.toString() ? `?${searchParams.toString()}` : '';

      // Chỉ mục catalog cho adapter biết loài nào là vật nuôi thuần hoá
      const [res] = await Promise.all([api<Page<ProductDto>>(`products${queryStr}`), loadCatalogIndex()]);
      const normalized = normalizePage(res.data);
      return {
        ...normalized,
        items: normalized.items.map((p) => toProductView(p)),
      };
    },
    staleTime: 60 * 1000,
  });
}

/**
 * Toàn bộ sản phẩm APPROVED (khoảng vài trăm): hợp đồng giới hạn size ≤ 48 nên tải trang 1 để biết tổng rồi tải song song các trang còn lại.
 * Dùng cho bộ lọc và đếm sản phẩm theo loài phía giao diện (giá, nhóm, IUCN chưa có trên API).
 */
export function useAllApprovedProducts() {
  return useQuery<ProductViewModel[]>({
    queryKey: queryKeys.products.allApproved(),
    queryFn: async () => {
      const PAGE = 48;
      const [firstRes] = await Promise.all([api<Page<ProductDto>>(`products?page=1&size=${PAGE}`), loadCatalogIndex()]);
      const first = normalizePage(firstRes.data);
      // Backend cũ trả mảng thường: normalizePage gộp hết vào trang 1, không cần tải thêm
      const pages = first.items.length < first.total ? Math.ceil(first.total / PAGE) : 1;
      const rest = await Promise.all(
        Array.from({ length: pages - 1 }, (_, i) =>
          api<Page<ProductDto>>(`products?page=${i + 2}&size=${PAGE}`).then((r) => normalizePage(r.data).items)
        )
      );
      return [...first.items, ...rest.flat()].map((p) => toProductView(p));
    },
    staleTime: 60 * 1000,
  });
}

/** Dùng chung cho useProductDetail và useQueries (giỏ hàng tra tên shop theo từng món) để cùng một bộ đệm */
export function productDetailQueryOptions(id: number | string) {
  return {
    queryKey: queryKeys.products.detail(id),
    queryFn: async (): Promise<ProductViewModel | null> => {
      const [res] = await Promise.all([api<ProductDto>(`products/${id}`), loadCatalogIndex()]);
      if (!res.data) return null;
      return toProductView(res.data);
    },
    staleTime: 60 * 1000,
  };
}

export function useProductDetail(id: number | string, options?: { enabled?: boolean }) {
  return useQuery<ProductViewModel | null>({
    ...productDetailQueryOptions(id),
    enabled: options?.enabled !== undefined ? options.enabled : !!id,
  });
}

export function useProductReviews(id: number | string, options?: { enabled?: boolean }) {
  return useQuery<ReviewDto[]>({
    queryKey: queryKeys.products.reviews(id),
    queryFn: async () => {
      const res = await api<ReviewDto[]>(`products/${id}/reviews`);
      return res.data || [];
    },
    staleTime: 60 * 1000,
    enabled: options?.enabled !== undefined ? options.enabled : !!id,
  });
}
