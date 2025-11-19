import { CreateOrderLineRequest, OrderLineDTO, UpdateOrderLineStatusRequest, UpdateOrderLineStatusResponse } from "@/dto/orderLine.dto";
import { axiosClient } from "./axiosClient";
import { ApiResponse } from "@/dto/apiResponse";


export const createOrderLine = async (createOrderLine: CreateOrderLineRequest) => {
    const res = await axiosClient.post<ApiResponse<boolean>>("/orderlines", createOrderLine);
    return res.data.result;
};

export const getPendingOrderLineByBranch = async (branchId: string) => {
    const res = await axiosClient.get<ApiResponse<OrderLineDTO[]>>(`/orderlines/pending/${branchId}`);
    return res.data.result;
};

export const getPreparingOrderLineByBranch = async (branchId: string) => {
    const res = await axiosClient.get<ApiResponse<OrderLineDTO[]>>(`/orderlines/preparing/${branchId}`);
    return res.data.result;
};

export const getCompletedOrderLineByBranch = async (branchId: string) => {
    const res = await axiosClient.get<ApiResponse<OrderLineDTO[]>>(`/orderlines/completed/${branchId}`);
    return res.data.result;
};

export const getCancelledOrderLineByBranch = async (branchId: string) => {
    const res = await axiosClient.get<ApiResponse<OrderLineDTO[]>>(`/orderlines/cancelled/${branchId}`);
    return res.data.result;
};

export const udpateOrderLineStatus = async (req: UpdateOrderLineStatusRequest) => {
    const res = await axiosClient.post<ApiResponse<UpdateOrderLineStatusResponse>>(`/orderlines/status`, req);
    return res.data.result;
};

