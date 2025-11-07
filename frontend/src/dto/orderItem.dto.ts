import { OrderItemCustomizationDTO, CreateOrderItemCustomizationRequest } from './orderItemCustomization.dto';

export interface OrderItemDTO {
    orderItemId: string;
    orderLineId: string;
    menuItemId: string;
    quantity: number;
    totalPrice: number;
    note?: string;
    createdAt: Date;
    updatedAt: Date;
    customizations: OrderItemCustomizationDTO[];
}

export interface CreateOrderItemRequest {
    menuItemId: string;
    quantity: number;
    note?: string;
    customizations?: CreateOrderItemCustomizationRequest[];
}