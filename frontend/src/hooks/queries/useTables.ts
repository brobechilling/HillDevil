import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getTablesByBranch,
  getTableById,
  getTablesByArea,
  createTable,
  updateTable,
  updateTableStatus,
  deleteTable,
  getTableQrCode,
  getTableQrCodeJson,
  exportBranchQrPdf,
  downloadTableQr,
  downloadBranchQrPdf,
} from '@/api/tableApi';
import { TableDTO, CreateTableRequest, TableStatus, QrCodeJsonResponse } from '@/dto/table.dto';

/**
 * Query hook: Lấy danh sách tables theo branch (có phân trang)
 */
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

/**
 * Query hook: Lấy thông tin chi tiết một table
 */
export const useTable = (tableId: string | undefined) => {
  return useQuery({
    queryKey: ['table', tableId],
    queryFn: () => getTableById(tableId!),
    enabled: !!tableId,
  });
};

/**
 * Query hook: Lấy danh sách tables theo area
 */
export const useTablesByArea = (areaId: string | undefined) => {
  return useQuery({
    queryKey: ['tables', 'area', areaId],
    queryFn: () => getTablesByArea(areaId!),
    enabled: !!areaId,
  });
};

/**
 * Mutation hook: Tạo table mới
 */
export const useCreateTable = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTable,
    onSuccess: (data, variables) => {
      // Invalidate tables queries
      queryClient.invalidateQueries({
        queryKey: ['tables'],
      });
      // Invalidate area tables query
      queryClient.invalidateQueries({
        queryKey: ['tables', 'area', variables.areaId],
      });
    },
  });
};

/**
 * Mutation hook: Cập nhật thông tin table
 */
export const useUpdateTable = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ tableId, data }: { tableId: string; data: CreateTableRequest }) =>
      updateTable(tableId, data),
    onSuccess: (data) => {
      // Invalidate specific table query
      queryClient.invalidateQueries({
        queryKey: ['table', data.id],
      });
      // Invalidate all tables queries
      queryClient.invalidateQueries({
        queryKey: ['tables'],
      });
    },
  });
};

/**
 * Mutation hook: Cập nhật trạng thái table
 */
export const useUpdateTableStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ tableId, status }: { tableId: string; status: TableStatus }) =>
      updateTableStatus(tableId, status),
    onSuccess: (data) => {
      // Invalidate specific table query
      queryClient.invalidateQueries({
        queryKey: ['table', data.id],
      });
      // Invalidate all tables queries
      queryClient.invalidateQueries({
        queryKey: ['tables'],
      });
    },
  });
};

/**
 * Mutation hook: Xóa table
 */
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

/**
 * Query hook: Lấy QR code PNG (trả về Blob URL)
 */
export const useTableQrCode = (tableId: string | undefined, size: number = 512) => {
  return useQuery({
    queryKey: ['table-qr', tableId, size],
    queryFn: async () => {
      if (!tableId) return null;
      const blob = await getTableQrCode(tableId, size);
      return URL.createObjectURL(blob);
    },
    enabled: !!tableId,
    staleTime: 1000 * 60 * 60, // 1 hour - QR codes don't change often
  });
};

/**
 * Query hook: Lấy QR code JSON với base64 (dễ hiển thị hơn)
 */
export const useTableQrCodeJson = (tableId: string | undefined, size: number = 512) => {
  return useQuery({
    queryKey: ['table-qr-json', tableId, size],
    queryFn: () => getTableQrCodeJson(tableId!, size),
    enabled: !!tableId,
    staleTime: 1000 * 60 * 60, // 1 hour
  });
};

/**
 * Mutation hook: Download QR code PNG
 */
export const useDownloadTableQr = () => {
  return useMutation({
    mutationFn: ({ tableId, tableName, size }: { tableId: string; tableName?: string; size?: number }) =>
      downloadTableQr(tableId, tableName || tableId, size || 512),
  });
};

/**
 * Mutation hook: Export và download QR codes PDF
 */
export const useExportBranchQrPdf = () => {
  return useMutation({
    mutationFn: ({ branchId, areaId, cols, sizePt }: { 
      branchId: string; 
      areaId?: string; 
      cols?: number; 
      sizePt?: number 
    }) =>
      downloadBranchQrPdf(branchId, areaId, cols || 3, sizePt || 200),
  });
};