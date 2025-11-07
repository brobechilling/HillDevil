import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAreasByBranch, createArea, deleteArea, CreateAreaRequest } from '@/api/areaApi';
import { useMemo } from 'react';
import { useSessionStore } from '@/store/sessionStore';


// Helper function to validate UUID format
const isValidUUID = (str: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
};

export const useAreas = (branchId: string | undefined) => {
  const { token } = useSessionStore();
  // Kiểm tra token và branchId hợp lệ (phải là UUID format)
  const isValidBranchId = useMemo(() => {
    if (!branchId || typeof branchId !== 'string') return false;
    const trimmed = branchId.trim();
    // Chỉ enable query nếu branchId là UUID hợp lệ
    return trimmed !== '' && isValidUUID(trimmed);
  }, [branchId]);
  
  const hasToken = useMemo(() => {
    return !!token && token.trim() !== '';
  }, []); // Check token mỗi lần component render
  
  return useQuery({
    queryKey: ['areas', branchId],
    queryFn: () => {
      // Double check trước khi gọi API
      if (!branchId || branchId.trim() === '') {
        throw new Error('BranchId is required');
      }
      if (!isValidUUID(branchId.trim())) {
        throw new Error('BranchId must be a valid UUID');
      }
      return getAreasByBranch(branchId);
    },
    enabled: isValidBranchId && hasToken,
    retry: false, // Không retry để tránh spam requests khi có lỗi
    throwOnError: false, // Không throw error để tránh uncaught promise
  });
};

/**
 * Mutation hook: Tạo area mới
 */
export const useCreateArea = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateAreaRequest) => createArea(data),
    onSuccess: (data, variables) => {
      // Invalidate areas query để refresh danh sách
      queryClient.invalidateQueries({
        queryKey: ['areas', variables.branchId],
      });
    },
  });
};

/**
 * Mutation hook: Xóa area
 */
export const useDeleteArea = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (areaId: string) => deleteArea(areaId),
    onSuccess: () => {
      // Invalidate all areas queries
      queryClient.invalidateQueries({
        queryKey: ['areas'],
      });
      // Also invalidate tables queries since deleting area might affect tables
      queryClient.invalidateQueries({
        queryKey: ['tables'],
      });
    },
  });
};