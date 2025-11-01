import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAllCustomizations,
  getCustomizationById,
  createCustomization,
  updateCustomization,
  deleteCustomization,
} from "@/api/customizationApi";
import { CustomizationDTO, CustomizationCreateRequest } from "@/dto/customization.dto";

export const useCustomizations = () => {
  return useQuery<CustomizationDTO[]>({
    queryKey: ["customizations"],
    queryFn: getAllCustomizations,
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
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["customizations"] }),
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