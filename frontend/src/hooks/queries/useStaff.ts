import { createStaffAccount, getManagerNumber, getReceptionistNumber, getStaffAccounts, getWaiterNumber, setStaffAccountStatus } from "@/api/staffApi";
import { PageResponse } from "@/dto/pageResponse";
import { StaffAccountDTO } from "@/dto/staff.dto";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useStaffAccountPaginatedQuery = (page: number, size: number, branchId: string) => {
    return useQuery<PageResponse<StaffAccountDTO>, Error>({
        queryKey: ["staffs", page, size, branchId],
        queryFn: () => getStaffAccounts(page, size, branchId)
    });
};

export const useCreateStaffAccountMutation = (page: number, size: number, branchId: string) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: createStaffAccount,
        onSuccess: () => {
            // refetch page 1, which will have the add staff
            queryClient.invalidateQueries({ queryKey: ["staffs", 1, size, branchId] , exact: true});
            queryClient.invalidateQueries({ queryKey: ["statistic", "waiter", branchId] , exact: true});
            queryClient.invalidateQueries({ queryKey: ["statistic", "receptionist", branchId] , exact: true});
        }
    })
};

export const useWaiterNumberQuery = (branchId: string) => {
    return useQuery<number>({
        queryKey: ["statistic", "waiter", branchId],
        queryFn: () => getWaiterNumber(branchId)
    });
};

export const useReceptionistNumberQuery = (branchId: string) => {
    return useQuery<number>({
        queryKey: ["statistic", "receptionist", branchId],
        queryFn: () => getReceptionistNumber(branchId)
    });
};

export const useManagerNumberQuery = (branchId: string) => {
    return useQuery<number>({
        queryKey: ["statistic", "manager", branchId],
        queryFn: () => getManagerNumber(branchId)
    });
};

export const useSetStaffAccountStatusMutation = (page: number, size: number, branchId: string) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: setStaffAccountStatus,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["staffs", page, size, branchId] , exact: true}); 
        },
    });
};
