import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { packageApi } from "@/api/packageApi";
import { CreatePackageDTO, UpdatePackageDTO } from "@/dto/packageFeature.dto";

export const usePackages = () => {
  return useQuery({
    queryKey: ["packages"],
    queryFn: packageApi.getAll,
  });
};

export const usePackage = (id: string) => {
  return useQuery({
    queryKey: ["package", id],
    queryFn: () => packageApi.getById(id),
    enabled: !!id,
  });
};

export const useCreatePackage = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreatePackageDTO) => packageApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["packages"] }),
  });
};

export const useUpdatePackage = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePackageDTO }) =>
      packageApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["packages"] }),
  });
};

export const useDeletePackage = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => packageApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["packages"] }),
  });
};

export const useTogglePackageAvailability = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, available }: { id: string; available: boolean }) => {
      if (available) {
        await packageApi.deactivate(id);
      } else {
        await packageApi.activate(id);
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["packages"] }),
  });
};

