import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getTablesByBranch,
  createTable,
  deleteTable,
  getTableQrDataUrl,
  TableResponse,
  CreateTableRequest,
  TablesPageResponse,
} from '@/api/tableApi';
import { toast } from '@/hooks/use-toast';

// Fetch tables by branch
export const useTablesByBranch = (branchId: string | undefined, page: number = 0, size: number = 20) => {
  return useQuery<TablesPageResponse>({
    queryKey: ['tables', branchId, page, size],
    queryFn: () => getTablesByBranch(branchId!, page, size),
    enabled: !!branchId,
  });
};

// Create table mutation
export const useCreateTable = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTableRequest) => createTable(data),
    onSuccess: (data) => {
      // Invalidate tables query to refetch
      queryClient.invalidateQueries({ queryKey: ['tables'] });
      toast({
        title: 'Success',
        description: `Table "${data.tag}" created successfully.`,
      });
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.response?.data?.message || 'Failed to create table.',
      });
    },
  });
};

// Delete table mutation
export const useDeleteTable = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (tableId: string) => deleteTable(tableId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tables'] });
      toast({
        title: 'Success',
        description: 'Table deleted successfully.',
      });
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.response?.data?.message || 'Failed to delete table.',
      });
    },
  });
};

// Get QR code
export const useTableQrCode = (tableId: string | null) => {
  return useQuery<string>({
    queryKey: ['table-qr', tableId],
    queryFn: () => getTableQrDataUrl(tableId!, 512),
    enabled: !!tableId,
  });
};
