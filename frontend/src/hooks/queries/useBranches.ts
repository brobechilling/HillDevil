import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAllBranches, getBranchesByRestaurant, getRestaurantByBranchId, getBranchById, updateBranch as apiUpdateBranch } from '@/api/branchApi';
import { BranchDTO } from '@/dto/branch.dto';
import { createBranch, deleteBranch } from '@/api/branchApi';

export const useBranches = () => {
    return useQuery<BranchDTO[]>({
        queryKey: ['branches'],
        queryFn: getAllBranches,
    });
};

export const useBranchesByRestaurant = (restaurantId: string | undefined) => {
    return useQuery<BranchDTO[]>({
        queryKey: ['branches', 'restaurant', restaurantId],
        queryFn: () => getBranchesByRestaurant(restaurantId!),
        enabled: !!restaurantId,
    });
};

export const useRestaurantByBranch = (branchId: string | undefined) => {
    return useQuery<string>({
        queryKey: ['restaurant', 'byBranch', branchId],
        queryFn: () => getRestaurantByBranchId(branchId!),
        enabled: !!branchId,
    });
};

export const useBranch = (branchId: string | undefined) => {
    return useQuery<BranchDTO>({
        queryKey: ['branch', branchId],
        queryFn: () => getBranchById(branchId!),
        enabled: !!branchId,
        staleTime: 1000 * 60 * 2,
        refetchOnWindowFocus: false,
    });
};

export const useUpdateBranch = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<BranchDTO> }) => apiUpdateBranch(id, data),
        onSuccess: (_, variables) => {
            qc.invalidateQueries({ queryKey: ['branch', variables.id] });
            qc.invalidateQueries({ queryKey: ['branches'] });
        },
    });
};

export const useCreateBranch = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data: any) => createBranch(data),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['branches'] }),
    });
};

export const useDeleteBranch = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => deleteBranch(id),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['branches'] }),
    });
};
