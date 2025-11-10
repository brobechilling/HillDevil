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
import { useMemo } from 'react';
import { TableDTO, CreateTableRequest, TableStatus, QrCodeJsonResponse } from '@/dto/table.dto';
import { useSessionStore } from '@/store/sessionStore';
import { isStaffAccountDTO } from '@/utils/typeCast';
import { getPublicTablesByBranch } from '@/api/tableApi';

/**
 * Query hook: Lấy danh sách tables theo branch (có phân trang)
 */
export const useTables = (
  branchId: string | undefined,
  page: number = 0,
  size: number = 20,
  sort?: string
) => {
  // Helper function to validate UUID format (kept for optional stricter checks)
  const isValidUUID = (str: string): boolean => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(str);
  };

  // For mock/dev data branch IDs may be numeric strings ("1", "2").
  // Enable queries for any non-empty branchId; keep UUID helper for future checks.
  const isValidBranchId = useMemo(() => {
    if (!branchId || typeof branchId !== 'string') return false;
    return branchId.trim() !== '';
  }, [branchId]);
  
  const { token } = useSessionStore();

  // Recompute when token changes
  const hasToken = useMemo(() => {
    return !!token && token.trim() !== '';
  }, [token]);
  
  return useQuery({
    queryKey: ['tables', branchId, page, size, sort],
    queryFn: () => {
      // Double check trước khi gọi API
      if (!branchId || branchId.trim() === '') {
        throw new Error('BranchId is required');
      }
      if (!isValidUUID(branchId.trim())) {
        throw new Error('BranchId must be a valid UUID');
      }

      const { user } = useSessionStore.getState();
      // If current user is a staff account (receptionist/waiter) or there's no token (guest),
      // call the public endpoint directly to avoid getting 403 from the owner API.
      if (isStaffAccountDTO(user) || !hasToken) {
        return getPublicTablesByBranch(branchId, page, size, sort);
      }

      // Otherwise (likely owner/admin), call owner endpoint which returns richer data.
      return getTablesByBranch(branchId, page, size, sort);
    },
  // Enable when we have a branchId present; we no longer require strict UUID format because
  // mock/dev branches use numeric ids. We also allow queries without an access token so
  // staff/guest clients (mock auth) can call the public endpoint. Authorization fallback
  // is handled in API helpers (owner endpoint -> fallback to public on 403).
  enabled: isValidBranchId,
    retry: false, // Không retry để tránh spam requests khi có lỗi
    throwOnError: false, // Không throw error để tránh uncaught promise
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
    onSuccess: (updatedTable) => {
      // Update cache immediately with the response data to avoid showing stale data
      // This ensures the UI reflects the changes immediately
      queryClient.setQueriesData(
        { queryKey: ['tables'] },
        (oldData: any) => {
          if (!oldData || !oldData.content) return oldData;
          return {
            ...oldData,
            content: oldData.content.map((table: TableDTO) =>
              table.id === updatedTable.id ? updatedTable : table
            ),
          };
        }
      );
      
      // Also update the specific table query
      queryClient.setQueryData(['table', updatedTable.id], updatedTable);
      
      // Invalidate queries to refetch in background (but cache already updated above)
      queryClient.invalidateQueries({
        queryKey: ['table', updatedTable.id],
      });
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
    onSuccess: (updatedTable) => {
      // Update cache immediately with the response data
      queryClient.setQueriesData(
        { queryKey: ['tables'] },
        (oldData: any) => {
          if (!oldData || !oldData.content) return oldData;
          return {
            ...oldData,
            content: oldData.content.map((table: TableDTO) =>
              table.id === updatedTable.id ? updatedTable : table
            ),
          };
        }
      );
      
      // Also update the specific table query
      queryClient.setQueryData(['table', updatedTable.id], updatedTable);
      
      // Invalidate queries to refetch in background (but cache already updated above)
      queryClient.invalidateQueries({
        queryKey: ['table', updatedTable.id],
      });
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
      // Chỉ invalidate khi thực sự thành công
      queryClient.invalidateQueries({
        queryKey: ['tables'],
      });
    },
    onError: (error) => {
      // Log error để debug
      console.error('Delete table error:', error);
      // Không invalidate queries khi có lỗi
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