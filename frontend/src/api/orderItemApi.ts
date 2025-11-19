import { OrderItemDTO } from "@/dto/orderItem.dto";
import { axiosClient } from "./axiosClient";
import { ApiResponse } from "@/dto/apiResponse";

export const updateOrderItem = async (orderItem: OrderItemDTO) => {
    const res = await axiosClient.put<ApiResponse<OrderItemDTO>>("/order-items", orderItem);
    return res.data.result;
};

export const deleteOrderItem = async (orderItemId: string) => {
    const res = await axiosClient.delete<ApiResponse<boolean>>(`/order-items/${orderItemId}`);
    return res.data.result;
};


