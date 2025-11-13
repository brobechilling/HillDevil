import { CreateOrderItemRequest } from "./orderItem.dto";

export interface CreateOrderLineRequest {
    areaTableId: string;
    totalPrice: number;
    orderItems: CreateOrderItemRequest[];
};