import { OrderLineDTO } from "./orderLine.dto";

export interface OrderDTO {
    orderId: string;
    tableTag: string;
    areaName: string;
    status: OrderStatus;
    totalPrice: number;
    orderLines: OrderLineDTO[];
};

export enum OrderStatus {
    EATING = "EATING",
    COMPLETED = "COMPLETED",
}