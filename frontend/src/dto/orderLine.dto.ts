import { CreateOrderItemRequest, OrderItemDTO } from "./orderItem.dto";

export interface CreateOrderLineRequest {
    areaTableId: string;
    totalPrice: number;
    orderItems: CreateOrderItemRequest[];
};

export interface OrderLineDTO {
    orderLineId: string;
    orderLineStatus: OrderLineStatus;
    createdAt: string;
    totalPrice: number;
    orderItems: OrderItemDTO[];
    tableTag: string;
    areaName: string;
};

export enum OrderLineStatus {
    PENDING = "PENDING",
    PREPARING = "PREPARING",
    COMPLETED = "COMPLETED",
    CANCELLED = "CANCELLED"
}

export interface UpdateOrderLineStatusRequest {
    orderLineId: string;
    orderLineStatus: OrderLineStatus;
}

export interface UpdateOrderLineStatusResponse {
    successful: boolean;
    previousStatus: OrderLineStatus;
    newStatus: OrderLineStatus;
}