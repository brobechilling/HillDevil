import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} from "@/api/categoryApi";
import { CategoryDTO, CategoryCreateRequest } from "@/dto/category.dto";

export const useCategories = () => {
  return useQuery<CategoryDTO[]>({
    queryKey: ["categories"],
    queryFn: getAllCategories,
  });
};

export const useCategory = (id: string | undefined) => {
  return useQuery<CategoryDTO>({
    queryKey: ["categories", id],
    queryFn: () => getCategoryById(id!),
    enabled: !!id,
  });
};

export const useCreateCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createCategory,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["categories"] }),
  });
};

export const useUpdateCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CategoryDTO> }) =>
      updateCategory(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      queryClient.setQueryData(["categories", data.categoryId], data);
    },
  });
};

export const useDeleteCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["categories"] }),
  });
};