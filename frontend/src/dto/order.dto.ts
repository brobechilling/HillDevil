import { OrderLineDTO } from "./orderLine.dto";

export interface OrderDTO {
    orderId: string;
    tableTag: string;
    areaName: string;
    status: OrderStatus;
    totalPrice: number;
    orderLines: OrderLineDTO[];
    createdAt: string;
    updatedAt: string;
};

export enum OrderStatus {
    EATING = "EATING",
    COMPLETED = "COMPLETED",
    CANCELLED = "CANCELLED"
};

export interface UpdateOrderStatusRequest {
    orderId: string;
    orderStatus: OrderStatus;
}

export interface UpdateOrderStatusResponse {
    successful: boolean;
    previousStatus: OrderStatus;
    newStatus: OrderStatus;
}