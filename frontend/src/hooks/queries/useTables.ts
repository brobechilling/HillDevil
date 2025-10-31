import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getTablesByBranch,
  createTable,
  deleteTable,
  getTableQrCode,
} from '@/api/tableApi';
import { TableDTO, CreateTableRequest } from '@/dto/table.dto';

export const useTables = (
  branchId: string | undefined,
  page: number = 0,
  size: number = 20,
  sort?: string
) => {
  return useQuery({
    queryKey: ['tables', branchId, page, size, sort],
    queryFn: () => getTablesByBranch(branchId!, page, size, sort),
    enabled: !!branchId,
  });
};

export const useCreateTable = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTable,
    onSuccess: (data, variables) => {
      // Invalidate tables query to refetch
      queryClient.invalidateQueries({
        queryKey: ['tables', variables.areaId],
      });
    },
  });
};

export const useDeleteTable = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteTable,
    onSuccess: () => {
      // Invalidate all tables queries
      queryClient.invalidateQueries({
        queryKey: ['tables'],
      });
    },
  });
};

export const useTableQrCode = (tableId: string | undefined, size: number = 512) => {
  return useQuery({
    queryKey: ['table-qr', tableId, size],
    queryFn: async () => {
      if (!tableId) return null;
      const blob = await getTableQrCode(tableId, size);
      return URL.createObjectURL(blob);
    },
    enabled: !!tableId,
  });
};