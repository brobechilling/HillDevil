import { CreateOrderItemCustomizationRequest, OrderItemCustomizationDTO } from "./orderItemCustomization.dto";

export interface CreateOrderItemRequest {
    menuItemId: string;
    quantity: number;
    totalPrice: number;
    note: string;
    customizations: CreateOrderItemCustomizationRequest[];
}

export interface OrderItemDTO {
    orderItemId: string;
    quantity: number;
    totalPrice: number;
    note: string;
    status: boolean;
    menuItemName: string;
    customizations: OrderItemCustomizationDTO[];
}