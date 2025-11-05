import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { publicApi } from '@/api/publicApi';

interface UseGuestParams {
  slug?: string | undefined | null;
  branchId?: string | undefined | null;
  tableId?: string | undefined | null;
}

export function useGuestContext({ slug, branchId, tableId }: UseGuestParams) {
  const tableContextQuery = useQuery({
    queryKey: ['public', 'table', tableId],
    queryFn: () => publicApi.getTableContext(tableId!),
    enabled: !!tableId,
    retry: false,
  });

  const derivedSlug =
    slug ||
    (tableContextQuery.data
      ? (() => {
          try {
            const url = new URL(tableContextQuery.data.publicUrl);
            const parts = url.pathname.split('/').filter(Boolean);
            return parts.length ? parts[parts.length - 1] : undefined;
          } catch (e) {
            const pu = tableContextQuery.data.publicUrl as string;
            const parts = pu.split('/').filter(Boolean);
            return parts.length ? parts[parts.length - 1] : undefined;
          }
        })()
      : undefined);

  const restaurantQuery = useQuery({
    queryKey: ['public', 'restaurant', derivedSlug],
    queryFn: async () => {
      const res = await publicApi.getRestaurantBySlug(derivedSlug!);
      return res ?? null;
    },
    enabled: !!derivedSlug,
    retry: false,
  });

  const restaurant = restaurantQuery.data;

  const branchIdToUse = branchId || tableContextQuery.data?.branchId || null;

  const menuQuery = useQuery({
    queryKey: ['public', 'restaurantMenu', derivedSlug],
    queryFn: async () => {
      if (!derivedSlug) return { items: [] };
      const res = await publicApi.getRestaurantMenuBySlug(derivedSlug);
      return res ?? { items: [] };
    },
    enabled: !!derivedSlug,
    retry: false,
  });
  useEffect(() => {}, [derivedSlug, branchIdToUse, tableId]);

  return {
    tableContext: tableContextQuery.data,
    restaurant,
    branchMenu: menuQuery.data,
    derivedSlug,
    branchId: branchIdToUse,
    isLoading:
      tableContextQuery.isLoading ||
      restaurantQuery.isLoading ||
      menuQuery.isLoading,
    queries: { tableContextQuery, restaurantQuery, menuQuery },
  };
}

export default useGuestContext;
