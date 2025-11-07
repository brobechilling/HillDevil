export interface OrderItemCustomizationDTO {
    orderItemCustomizationId: string;
    orderItemId: string;
    customizationId: string;
    quantity: number;
    totalPrice: number;
    createdAt: Date;
    updatedAt: Date;
}

export interface CreateOrderItemCustomizationRequest {
    customizationId: string;
    quantity: number;
}