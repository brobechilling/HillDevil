
export interface CreateOrderItemCustomizationRequest {
    customizationId: string;
    quantity: number;
    totalPrice: number;
}

export interface OrderItemCustomizationDTO {
    orderItemCustomizationId?: string;
    customizationName: string;
    quantity: number;
    totalPrice: number;
    customizationId: string;
}