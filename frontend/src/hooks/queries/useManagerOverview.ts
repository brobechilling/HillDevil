import { useQuery } from '@tanstack/react-query';
import { getTablesByBranch } from '@/api/tableApi';
import { getWaiterNumber, getReceptionistNumber, getManagerNumber } from '@/api/staffApi';
import { TableDTO } from '@/dto/table.dto';

interface ManagerOverviewStats {
  todayRevenue: number;
  revenueChangePercent: number;
  activeStaff: number;
  totalStaff: number;
  occupiedTables: number;
  totalTables: number;
  activePromos: number;
  totalOrders: number;
  averageOrderValue: number;
  totalMenuItemsSold: number;
}

export const useManagerOverview = (branchId: string | undefined) => {
  const isValidUUID = (str: string): boolean => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(str);
  };

  const isValidBranchId = branchId && typeof branchId === 'string' && branchId.trim() !== '' && isValidUUID(branchId.trim());

  return useQuery<ManagerOverviewStats>({
    queryKey: ['manager-overview', branchId],
    queryFn: async () => {
      if (!branchId || branchId.trim() === '') {
        throw new Error('BranchId is required');
      }
      if (!isValidUUID(branchId.trim())) {
        throw new Error('BranchId must be a valid UUID');
      }

      // Fetch all data in parallel (excluding orders)
      const [tables, waiterCount, receptionistCount, managerCount] = await Promise.all([
        getTablesByBranch(branchId, 0, 1000).catch((err) => {
          console.error('Error fetching tables:', err);
          return { content: [] as TableDTO[], totalElements: 0 };
        }),
        getWaiterNumber(branchId).catch((err) => {
          console.error('Error fetching waiter count:', err);
          return 0;
        }),
        getReceptionistNumber(branchId).catch((err) => {
          console.error('Error fetching receptionist count:', err);
          return 0;
        }),
        getManagerNumber(branchId).catch((err) => {
          console.error('Error fetching manager count:', err);
          return 0;
        }),
      ]);

      // Order-related stats are set to 0 (order API not available)
      const todayRevenue = 0;
      const revenueChangePercent = 0;

      // Calculate table stats - only count available tables (exclude INACTIVE)
      const tableList = tables.content || [];
      const availableTables = tableList.filter((t) => t.status !== 'INACTIVE');
      const occupiedTables = availableTables.filter((t) => t.status === 'OCCUPIED').length;
      const totalTables = availableTables.length;

      // Calculate staff stats
      const activeStaff = waiterCount + receptionistCount + managerCount;
      const totalStaff = activeStaff; // Assuming all staff are active for now

      // Order stats are set to 0 (order API not available)
      const totalOrders = 0;
      const averageOrderValue = 0;
      const totalMenuItemsSold = 0;

      return {
        todayRevenue,
        revenueChangePercent,
        activeStaff,
        totalStaff,
        occupiedTables,
        totalTables,
        activePromos: 0, // No promotions API available
        totalOrders,
        averageOrderValue,
        totalMenuItemsSold,
      };
    },
    enabled: !!isValidBranchId,
    staleTime: 1000 * 60, // 1 minute
    refetchInterval: 1000 * 60 * 5, // Refetch every 5 minutes
    retry: false,
    throwOnError: false,
  });
};

