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
} from "@/api/menuItemApi";
import { MenuItemDTO, MenuItemCreateRequest } from "@/dto/menuItem.dto";

export const useMenuItems = (restaurantId?: string) => {
  return useQuery<MenuItemDTO[]>({
    queryKey: ["menu-items", restaurantId],
    queryFn: () => getAllMenuItems(restaurantId!),
    enabled: !!restaurantId,
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

export const useCreateMenuItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ data, imageFile }: { data: MenuItemCreateRequest; imageFile?: File }) =>
      createMenuItem(data, imageFile),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["menu-items"] }),
  });
};

export const useUpdateMenuItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data, imageFile }: { id: string; data: MenuItemCreateRequest; imageFile?: File }) =>
      updateMenuItem(id, data, imageFile),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["menu-items"] });
      queryClient.setQueryData(["menu-items", data.menuItemId], data);

      queryClient.invalidateQueries({
        queryKey: ["media", "target", variables.id, "MENU_ITEM_IMAGE"],
      });
    },
  });
};

export const useDeleteMenuItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteMenuItem,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["menu-items"] }),
  });
};

export const useSetActiveStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ menuItemId, active }: { menuItemId: string; active: boolean }) =>
      setActiveStatus(menuItemId, active),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menu-items"] });
    },
  });
};

export const useUpdateBestSeller = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ menuItemId, bestSeller }: { menuItemId: string; bestSeller: boolean }) =>
      updateBestSeller(menuItemId, bestSeller),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["menu-items"] });
      queryClient.setQueryData(["menu-items", data.menuItemId], data);
    },
  });
};