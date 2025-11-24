import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAllCustomizations,
  getCustomizationById,
  createCustomization,
  updateCustomization,
  deleteCustomization,
  canCreateCustomization,
  getCustomizationLimit,
  getCustomizationByCategory,
} from "@/api/customizationApi";
import { CustomizationDTO, CustomizationCreateRequest } from "@/dto/customization.dto";

export const useCustomizations = (restaurantId?: string) => {
  return useQuery<CustomizationDTO[]>({
    queryKey: ["customizations", restaurantId],
    queryFn: () => getAllCustomizations(restaurantId!),
    enabled: !!restaurantId,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 1,
  });
};
export const useCustomization = (id: string | undefined) => {
  return useQuery<CustomizationDTO>({
    queryKey: ["customizations", id],
    queryFn: () => getCustomizationById(id!),
    enabled: !!id,
  });
};

export const useCreateCustomization = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createCustomization,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customizations"] });
    },
  });
};

export const useCreateCustomizationMenuItem = (menuItemId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createCustomization,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customizations"] });
      queryClient.invalidateQueries({ queryKey: ["customization", "menu-item", menuItemId] });
    },
  });
};

export const useUpdateCustomization = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CustomizationDTO> }) =>
      updateCustomization(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["customizations"] });
      queryClient.setQueryData(["customizations", data.customizationId], data);
    },
  });
};

export const useDeleteCustomization = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteCustomization,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["customizations"] }),
  });
};

export const useCanCreateCustomization = (restaurantId: string | undefined, categoryId: string | undefined) => {
  return useQuery<boolean>({
    queryKey: ["customizations", "can-create", restaurantId, categoryId],
    queryFn: () => canCreateCustomization(restaurantId!, categoryId!),
    enabled: !!restaurantId && !!categoryId,
    refetchOnWindowFocus: false,
  });
}

export const useCustomizationLimit = (restaurantId: string | undefined) => {
  return useQuery<number>({
    queryKey: ["customizations", "limit", restaurantId],
    queryFn: () => getCustomizationLimit(restaurantId!),
    enabled: !!restaurantId,
    refetchOnWindowFocus: false,
  });
}


export const useCustomizationByCategory = (categoryId: string) => {
  return useQuery<string[]>({
    queryKey: ["customizations", categoryId],
    queryFn: () => getCustomizationByCategory(categoryId),
    enabled: !!categoryId
  })
}