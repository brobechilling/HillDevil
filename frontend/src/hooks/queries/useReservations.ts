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
    });
};

export const useCreateReservationPublic = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: reservationApi.createPublic,
        onSuccess: () => {
            // Invalidate reservations queries so guest-created bookings show up where applicable
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
            // variables is the payload containing branchId — invalidate that branch's reservations
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

export default useReservations;
