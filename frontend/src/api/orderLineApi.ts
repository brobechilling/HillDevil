import { CreateOrderLineRequest } from "@/dto/orderLine.dto";
import { axiosClient } from "./axiosClient";
import { ApiResponse } from "@/dto/apiResponse";


export const createOrderLine = async (createOrderLine: CreateOrderLineRequest) => {
    const res = await axiosClient.post<ApiResponse<boolean>>("/orderlines", createOrderLine);
    return res.data.result;
};

