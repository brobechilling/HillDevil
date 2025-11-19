import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAllMenuItems,
  getMenuItemById,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  isMenuItemActiveInBranch,
  setActiveStatus,
  updateBestSeller,
  canCreateMenuItem,
  getCustomizationOfMenuItem
} from "@/api/menuItemApi";
import { MenuItemDTO, MenuItemCreateRequest } from "@/dto/menuItem.dto";
import { toast } from "@/components/ui/use-toast";
import { CustomizationDTO } from "@/dto/customization.dto";

export const useMenuItems = (restaurantId?: string) => {
  return useQuery<MenuItemDTO[]>({
    queryKey: ["menu-items", restaurantId],
    queryFn: () => getAllMenuItems(restaurantId!),
    enabled: !!restaurantId,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 1,
  });
};


export const useMenuItem = (id?: string) => {
  return useQuery<MenuItemDTO | null>({
    queryKey: id ? ["menu-items", id] : ["menu-items", "none"],
    queryFn: async () => {
      if (!id) return null;
      return await getMenuItemById(id);
    },
    enabled: !!id,
  });
};

export const useIsMenuItemActiveInBranch = (menuItemId: string | undefined, branchId: string | undefined) => {
  return useQuery<boolean>({
    queryKey: ["menu-items", menuItemId, "branch", branchId, "active"],
    queryFn: () => isMenuItemActiveInBranch(menuItemId!, branchId!),
    enabled: !!menuItemId && !!branchId,
  });
};

export const useCreateMenuItem = (restaurantId?: string) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ data, imageFile }: { data: MenuItemCreateRequest; imageFile?: File }) =>
      createMenuItem(data, imageFile),

    onSuccess: (newItem) => {
      // Chỉ invalidate, KHÔNG setQueryData
      qc.invalidateQueries({
        queryKey: ["menu-items", restaurantId]
      });

      qc.invalidateQueries({
        queryKey: ["menu-items", "can-create", restaurantId]
      });

      toast({
        title: "Created successfully",
        description: `Added "${newItem.name}" to menu.`,
      });
    },

    onError: () => {
      toast({
        title: "Failed",
        description: "Cannot create new menu item.",
        variant: "destructive",
      });
    },
  });
};

export const useUpdateMenuItem = (restaurantId?: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data, imageFile }: { id: string; data: MenuItemCreateRequest; imageFile?: File }) =>
      updateMenuItem(id, data, imageFile),

    onSuccess: (updatedItem, variables) => {
      queryClient.setQueryData<MenuItemDTO>(["menu-items", variables.id], updatedItem);

      queryClient.setQueryData<MenuItemDTO[]>(["menu-items", restaurantId], (old = []) =>
        old.map((item) => (item.menuItemId === updatedItem.menuItemId ? updatedItem : item))
      );

      queryClient.invalidateQueries({
        queryKey: ["media", "target", variables.id, "MENU_ITEM_IMAGE"],
      });

      queryClient.invalidateQueries({ queryKey: ["menu-items", restaurantId] });

      toast({
        title: "Updated successfully",
        description: ` "${updatedItem.name}" has been updated.`,
      });
    },

    onError: () => {
      toast({
        title: "Failed to update",
        description: "Cannot update menu items.",
        variant: "destructive",
      });
    },
  });
};

export const useDeleteMenuItem = (restaurantId?: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteMenuItem,

    onMutate: async (menuItemId: string) => {
      await queryClient.cancelQueries({ queryKey: ["menu-items", restaurantId] });

      const previousData = queryClient.getQueryData<MenuItemDTO[]>(["menu-items", restaurantId]);

      if (previousData) {
        queryClient.setQueryData<MenuItemDTO[]>(["menu-items", restaurantId],
          previousData.filter((item) => item.menuItemId !== menuItemId)
        );
      }

      return { previousData };
    },

    onError: (error, menuItemId, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(["menu-items", restaurantId], context.previousData);
      }

      toast({
        title: "Deleted failed",
        description: "Cannot delete this menu items.",
        variant: "destructive",
      });
    },

    onSuccess: (_, menuItemId) => {
      queryClient.invalidateQueries({ queryKey: ["menu-items", restaurantId] });
      queryClient.invalidateQueries({ queryKey: ["menu-items", "can-create", restaurantId] });

      toast({
        title: "Deleted successfully",
        description: "Menu items has been deleted from the menu.",
      });
    },
  });
};

export const useSetActiveStatus = (restaurantId?: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ menuItemId, active }: { menuItemId: string; active: boolean }) =>
      setActiveStatus(menuItemId, active),

    onSuccess: (updatedItem, { menuItemId }) => {
      queryClient.setQueryData<MenuItemDTO>(["menu-items", menuItemId], updatedItem);

      queryClient.setQueryData<MenuItemDTO[]>(["menu-items", restaurantId], (old = []) =>
        old.map((i) =>
          i.menuItemId === updatedItem.menuItemId ? updatedItem : i
        )
      );

      toast({
        title: updatedItem.status === "ACTIVE" ? "Activated" : "Deactivated",
        description: `Menu item is now ${updatedItem.status === "ACTIVE" ? "available" : "unavailable"
          }.`,
      });
    },

    onError: () => {
      toast({
        title: "Failed",
        description: "Cannot change status.",
        variant: "destructive",
      });
    },
  });
};

export const useUpdateBestSeller = (restaurantId?: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ menuItemId, bestSeller }: { menuItemId: string; bestSeller: boolean }) =>
      updateBestSeller(menuItemId, bestSeller),

    onMutate: async ({ menuItemId, bestSeller }) => {
      await queryClient.cancelQueries({ queryKey: ["menu-items", restaurantId] });

      const previousData = queryClient.getQueryData<MenuItemDTO[]>(["menu-items", restaurantId]);

      if (previousData) {
        queryClient.setQueryData<MenuItemDTO[]>(["menu-items", restaurantId], old =>
          old?.map(item =>
            item.menuItemId === menuItemId ? { ...item, bestSeller } : item
          ) || []
        );
      }

      return { previousData };
    },

    onError: (error, variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(["menu-items", restaurantId], context.previousData);
      }
      toast({
        title: "Error",
        description: "Failed to update best seller.",
        variant: "destructive",
      });
    },

    onSuccess: (data) => {
      queryClient.setQueryData<MenuItemDTO[]>(["menu-items", restaurantId], old =>
        old?.map(item =>
          item.menuItemId === data.menuItemId ? data : item
        ) || []
      );
      toast({
        title: data.bestSeller ? "Best Seller Set" : "Best Seller Unset",
        description: `Menu item "${data.name}" is now ${data.bestSeller ? "a Best Seller" : "no longer a Best Seller"}.`,
      });
    },
  });
};

export const useCanCreateMenuItem = (restaurantId: string | undefined) => {
  return useQuery<boolean>({
    queryKey: ['menu-items', 'can-create', restaurantId],
    queryFn: () => canCreateMenuItem(restaurantId!),
    enabled: !!restaurantId,
    refetchOnWindowFocus: false,
  });
};


export const useCustomizationsOfMenuItems = (menuItemId: string, enabled: boolean) => {
  return useQuery<CustomizationDTO[]>({
    queryKey: ["customization", "menu-item", menuItemId],
    queryFn: () => getCustomizationOfMenuItem(menuItemId),
    staleTime: 10 * 60 * 1000,
    enabled: !!menuItemId && enabled,
  })
};