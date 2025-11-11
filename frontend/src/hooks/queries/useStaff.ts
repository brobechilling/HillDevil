import { createStaffAccount, getManagerNumber, getReceptionistNumber, getStaffAccounts, getStaffAccountsByRestaurant, getWaiterNumber, setStaffAccountStatus } from "@/api/staffApi";
import { PageResponse } from "@/dto/pageResponse";
import { StaffAccountDTO } from "@/dto/staff.dto";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useStaffAccountPaginatedQuery = (page: number, size: number, branchId: string) => {
    return useQuery<PageResponse<StaffAccountDTO>, Error>({
        queryKey: ["staffs", page, size, branchId],
        queryFn: () => getStaffAccounts(page, size, branchId),
        enabled: !!branchId && branchId.trim() !== ""
    });
};

export const useStaffAccountByRestaurantPaginatedQuery = (page: number, size: number, restaurantId: string) => {
    return useQuery<PageResponse<StaffAccountDTO>, Error>({
        queryKey: ["staffs", page, size, restaurantId],
        queryFn: () => getStaffAccountsByRestaurant(page, size, restaurantId),
        enabled: !!restaurantId && restaurantId.trim() !== ""
    });
};

// id can be branchId or restaurantId -> used to check invalidate query needed
export const useCreateStaffAccountMutation = (page: number, size: number, id: string) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: createStaffAccount,
        onSuccess: () => {
            // refetch page 1, which will have the add staff
            queryClient.invalidateQueries({ queryKey: ["staffs", 1, size, id] , exact: true});
            queryClient.invalidateQueries({ queryKey: ["statistic", "waiter", id] , exact: true});
            queryClient.invalidateQueries({ queryKey: ["statistic", "receptionist", id] , exact: true});
        }
    })
};

export const useWaiterNumberQuery = (branchId: string) => {
    return useQuery<number>({
        queryKey: ["statistic", "waiter", branchId],
        queryFn: () => getWaiterNumber(branchId),
        enabled: !!branchId && branchId.trim() !== ""
    });
};

export const useReceptionistNumberQuery = (branchId: string) => {
    return useQuery<number>({
        queryKey: ["statistic", "receptionist", branchId],
        queryFn: () => getReceptionistNumber(branchId),
        enabled: !!branchId && branchId.trim() !== ""
    });
};

export const useManagerNumberQuery = (branchId: string) => {
    return useQuery<number>({
        queryKey: ["statistic", "manager", branchId],
        queryFn: () => getManagerNumber(branchId),
        enabled: !!branchId && branchId.trim() !== ""
    });
};

// id can be branchId or restaurantId -> used to check invalidate query needed
export const useSetStaffAccountStatusMutation = (page: number, size: number, id: string) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: setStaffAccountStatus,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["staffs", page, size, id] , exact: true}); 
        },
    });
};
