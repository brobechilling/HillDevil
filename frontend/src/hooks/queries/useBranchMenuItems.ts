import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getMenuItemsByBranch, updateAvailability } from "@/api/branchMenuItemApi";
import { BranchMenuItemDTO } from "@/dto/branchMenuItem.dto";

export const useBranchMenuItems = (branchId: string | undefined) => {
  return useQuery<BranchMenuItemDTO[]>({
    queryKey: ["branch-menu-items", branchId],
    queryFn: () => getMenuItemsByBranch(branchId!),
    enabled: !!branchId,
  });
};

export const useUpdateAvailability = (branchId: string | undefined) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      branchMenuItemId,
      available,
    }: {
      branchMenuItemId: string;
      available: boolean;
    }) => updateAvailability(branchMenuItemId, available),

    onSuccess: () => {
      if (branchId) {
        queryClient.invalidateQueries({ queryKey: ["branch-menu-items", branchId] });
      }
      queryClient.invalidateQueries({ queryKey: ["branch-menu-items"] });
    },
  });
};
