import { CreateOrderItemCustomizationRequest } from "./orderItemCustomization.dto";

export interface CreateOrderItemRequest {
    menuItemId: string;
    quantity: number;
    totalPrice: number;
    note: string;
    customizations: CreateOrderItemCustomizationRequest[];
}