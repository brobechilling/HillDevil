import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reservationApi } from '@/api/reservationApi';

export const usePendingReservations = (branchId?: string | null) => {
    return useQuery({
        queryKey: ['pendingReservations', branchId],
        queryFn: async () => {
            if (!branchId) return [];
            const res = await reservationApi.fetchByBranch(branchId, 0, 100);
            const data = res && (res.result || res) ? (res.result || res) : res;
            const list = data && (data.content || data) ? (data.content || data) : [];
            if (!Array.isArray(list)) return [];
            return list.filter((r: any) => (r.status || '').toString().toLowerCase() === 'pending');
        },
        enabled: !!branchId,
        staleTime: 30_000,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
    });
};

export const useUpdateReservationStatus = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, status }: { id: string; status: string }) => reservationApi.updateStatus(id, status),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['pendingReservations'] });
            qc.invalidateQueries({ predicate: (q) => Array.isArray(q.queryKey) && q.queryKey[0] === 'reservations' });
        },
    });
};

export const useCancelReservation = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => reservationApi.cancel(id),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['pendingReservations'] });
            qc.invalidateQueries({ predicate: (q) => Array.isArray(q.queryKey) && q.queryKey[0] === 'reservations' });
        },
    });
};
