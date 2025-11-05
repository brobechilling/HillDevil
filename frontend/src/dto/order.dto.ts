import { OrderLineDTO, CreateOrderLineRequest } from './orderLine.dto';

export interface OrderDTO {
    orderId: string;
    areaTableId: string;
    status: OrderStatus;
    totalPrice: number;
    createdAt: Date;
    updatedAt: Date;
    orderLines: OrderLineDTO[];
}

export enum OrderStatus {
    PENDING = 'PENDING',
    COMPLETED = 'COMPLETED'
}

export interface CreateOrderRequest {
    areaTableId: string;
    orderLines: CreateOrderLineRequest[];
}