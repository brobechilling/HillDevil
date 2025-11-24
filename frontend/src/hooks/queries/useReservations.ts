import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reservationApi } from '@/api/reservationApi';

export const useReservations = (
    branchId: string | undefined | null,
    page: number = 0,
    size: number = 100
) => {
    return useQuery({
        queryKey: ['reservations', branchId, page, size],
        queryFn: () => reservationApi.fetchByBranch(branchId!, page, size),
        enabled: !!branchId,
        staleTime: 30 * 1000, // 30 seconds
        gcTime: 5 * 60 * 1000, // 5 minutes (formerly cacheTime)
    });
};

export const useCreateReservationPublic = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: reservationApi.createPublic,
        onSuccess: () => {
            qc.invalidateQueries({
                predicate: (query) => Array.isArray(query.queryKey) && query.queryKey[0] === 'reservations',
            });
        },
    });
};

export const useCreateReservationReceptionist = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: reservationApi.createForReceptionist,
        onSuccess: (data: any, variables: any) => {
            const bid = variables?.branchId;
            qc.invalidateQueries({
                predicate: (query) =>
                    Array.isArray(query.queryKey) &&
                    query.queryKey[0] === 'reservations' &&
                    (bid ? query.queryKey[1] === bid : true),
            });
        },
    });
};

export const useAssignTable = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ reservationId, tableId }: { reservationId: string; tableId: string | null }) =>
            reservationApi.assignTable(reservationId, tableId),
        onSuccess: (data: any, variables: any) => {
            const bid = data?.result?.branchId || data?.branchId || variables?.branchId;
            qc.invalidateQueries({
                predicate: (query) =>
                    Array.isArray(query.queryKey) &&
                    query.queryKey[0] === 'reservations' &&
                    (bid ? query.queryKey[1] === bid : true),
            });
        },
    });
};

export const useUpdateReservationStatus = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ reservationId, status }: { reservationId: string; status: string }) =>
            reservationApi.updateStatus(reservationId, status),
        onSuccess: (data: any, variables: any) => {
            const bid = variables?.branchId || data?.result?.branchId || data?.branchId;
            qc.invalidateQueries({
                predicate: (query) =>
                    Array.isArray(query.queryKey) &&
                    query.queryKey[0] === 'reservations' &&
                    (bid ? query.queryKey[1] === bid : true),
            });
        },
    });
};

export default useReservations;
