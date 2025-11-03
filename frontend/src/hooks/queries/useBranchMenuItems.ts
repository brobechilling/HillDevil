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
      menuItemId,
      available,
    }: {
      menuItemId: string;
      available: boolean;
    }) => updateAvailability(branchId!, menuItemId, available),

    onSuccess: () => {
      if (branchId) {
        queryClient.invalidateQueries({ queryKey: ["branch-menu-items", branchId] });
      }
    },
  });
};
