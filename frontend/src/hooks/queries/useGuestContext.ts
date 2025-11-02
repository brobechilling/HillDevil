import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { publicApi } from '@/api/publicApi';

interface UseGuestParams {
  slug?: string | undefined | null;
  branchId?: string | undefined | null;
  tableId?: string | undefined | null;
}

export function useGuestContext({ slug, branchId, tableId }: UseGuestParams) {

  const tableContextQuery = useQuery<any>({
    queryKey: ['public', 'table', tableId],
    queryFn: () => publicApi.getTableContext(tableId!),
    enabled: !!tableId,
    retry: false,
  });

  const derivedSlug = slug || (tableContextQuery.data ? (() => {
    try {
      const url = new URL(tableContextQuery.data.publicUrl);
      const parts = url.pathname.split('/').filter(Boolean);
      return parts.length ? parts[parts.length - 1] : undefined;
    } catch (e) {
      const pu = tableContextQuery.data.publicUrl as string;
      const parts = pu.split('/').filter(Boolean);
      return parts.length ? parts[parts.length - 1] : undefined;
    }
  })() : undefined);

  const restaurantQuery = useQuery<any>({
    queryKey: ['public', 'restaurant', derivedSlug],
    queryFn: async () => {
      const res = await publicApi.getRestaurantBySlug(derivedSlug!);
      // react-query requires queryFn to not return undefined
      return res ?? null;
    },
    enabled: !!derivedSlug,
    retry: false,
  });

  // Only use branchId when explicitly provided (route param) or coming from tableContext (QR).
  // Do NOT auto-select the first branch from restaurant data — selection should be explicit.
  const branchIdToUse = branchId || tableContextQuery.data?.branchId || null;

  const branchMenuQuery = useQuery<any>({
    queryKey: ['public', 'branchMenu', branchIdToUse],
    queryFn: async () => {
      const res = await publicApi.getBranchMenu(branchIdToUse!);
      return res ?? null;
    },
    enabled: !!branchIdToUse,
    retry: false,
  });

  // no global guest store sync — this hook is the single source of truth for guest context
  useEffect(() => {
    // noop: keep effect so consumers can rely on stable references if needed
  }, [derivedSlug, branchIdToUse, tableId]);

  return {
    tableContext: tableContextQuery.data,
    restaurant: restaurantQuery.data,
    branchMenu: branchMenuQuery.data,
    derivedSlug,
    branchId: branchIdToUse,
    isLoading: tableContextQuery.isLoading || restaurantQuery.isLoading || branchMenuQuery.isLoading,
    // expose raw queries for advanced use
    queries: { tableContextQuery, restaurantQuery, branchMenuQuery },
  };
}

export default useGuestContext;
