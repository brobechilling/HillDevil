import { ApiResponse } from "@/dto/apiResponse"
import { axiosClient } from "./axiosClient"
import { OrderDTO, UpdateOrderStatusRequest, UpdateOrderStatusResponse } from "@/dto/order.dto"


export const getEatingOrderByBranch = async (branchId: string) => {
    const res = await axiosClient.get<ApiResponse<OrderDTO[]>>(`/orders/eating/${branchId}`);
    return res.data.result;
};

export const getCompletedOrderByBranch = async (branchId: string) => {
    const res = await axiosClient.get<ApiResponse<OrderDTO[]>>(`/orders/completed/${branchId}`);
    return res.data.result;
};

export const getCancelledOrderByBranch = async (branchId: string) => {
    const res = await axiosClient.get<ApiResponse<OrderDTO[]>>(`/orders/cancelled/${branchId}`);
    return res.data.result;
};

export const setOrderStatus = async (updateOrderStatus: UpdateOrderStatusRequest) => {
    const res = await axiosClient.put<ApiResponse<UpdateOrderStatusResponse>>("/orders", updateOrderStatus);
    return res.data.result;
};

