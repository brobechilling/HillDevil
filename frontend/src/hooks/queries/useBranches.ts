import { useQuery } from '@tanstack/react-query';
import { getAllBranches, getBranchesByRestaurant } from '@/api/branchApi';
import { BranchDTO } from '@/dto/branch.dto';

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
