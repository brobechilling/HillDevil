import { OrderItemDTO, CreateOrderItemRequest } from './orderItem.dto';

export interface OrderLineDTO {
    orderLineId: string;
    orderId: string;
    status: OrderLineStatus;
    totalPrice: number;
    createdAt: Date;
    updatedAt: Date;
    orderItems: OrderItemDTO[];
}

export enum OrderLineStatus {
    PENDING = 'PENDING',
    ACCEPTED = 'ACCEPTED',
    REJECTED = 'REJECTED',
    COMPLETED = 'COMPLETED'
}

export interface CreateOrderLineRequest {
    orderLineStatus?: OrderLineStatus;
    orderItems: CreateOrderItemRequest[];
}