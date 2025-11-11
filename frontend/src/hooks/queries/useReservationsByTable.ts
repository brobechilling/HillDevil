import { useQuery, UseQueryOptions, UseQueryResult } from '@tanstack/react-query';
import { getReservationsByTable } from '@/api/reservationApi';

export const useReservationsByTable = (
  tableId?: string | null,
  options?: UseQueryOptions<any, unknown, any, readonly unknown[]>
): UseQueryResult<any, unknown> => {
  return useQuery({
    queryKey: ['public', 'reservations', 'table', tableId],
    queryFn: async () => {
      if (!tableId) return [];
      const res = await getReservationsByTable(tableId);
      return res ?? [];
    },
    enabled: !!tableId,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
    ...(options as object),
  });
};
