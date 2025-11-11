import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getMenuItemsByBranch, updateAvailability } from "@/api/branchMenuItemApi";
import { BranchMenuItemDTO } from "@/dto/branchMenuItem.dto";

export const useBranchMenuItems = (branchId: string | undefined) => {
  return useQuery<BranchMenuItemDTO[]>({
    queryKey: ["branch-menu-items", branchId],
    queryFn: () => getMenuItemsByBranch(branchId!),
    enabled: !!branchId && branchId.trim() !== "",
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 1,
  });
};

export const useUpdateAvailability = (branchId: string | undefined) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ menuItemId, available }: { menuItemId: string; available: boolean }) =>
      updateAvailability(branchId!, menuItemId, available),

    onMutate: async ({ menuItemId, available }) => {
      await queryClient.cancelQueries({ queryKey: ["branch-menu-items", branchId] });
      const prevData = queryClient.getQueryData<BranchMenuItemDTO[]>(["branch-menu-items", branchId]);

      if (prevData) {
        queryClient.setQueryData<BranchMenuItemDTO[]>(
          ["branch-menu-items", branchId],
          prevData.map(item =>
            item.menuItemId === menuItemId ? { ...item, available } : item
          )
        );
      }

      return { prevData };
    },

    onError: (err, _, context) => {
      if (context?.prevData) {
        queryClient.setQueryData(["branch-menu-items", branchId], context.prevData);
      }
    },

    onSettled: () => {
      if (branchId) {
        queryClient.invalidateQueries({ queryKey: ["branch-menu-items", branchId] });
      }
    },
  });
};
