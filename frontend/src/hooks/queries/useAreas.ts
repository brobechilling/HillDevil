import { useQuery } from '@tanstack/react-query';
import { getAreasByBranch } from '@/api/areaApi';

export const useAreas = (branchId: string | undefined) => {
  return useQuery({
    queryKey: ['areas', branchId],
    queryFn: () => getAreasByBranch(branchId!),
    enabled: !!branchId,
  });
};