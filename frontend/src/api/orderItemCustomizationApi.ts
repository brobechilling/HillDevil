import { OrderItemCustomizationDTO, CreateOrderItemCustomizationRequest } from '../dto/orderItemCustomization.dto';
import { axiosClient } from './axiosClient';

const baseUrl = '/api/order-item-customizations';

const orderItemCustomizationApi = {
    createCustomizations: async (orderItemId: string, requests: CreateOrderItemCustomizationRequest[]) => {
        const url = `${baseUrl}/order-item/${orderItemId}/create`;
        const response = await axiosClient.post(url, requests);
        return response.data.result as OrderItemCustomizationDTO[];
    }
};

export default orderItemCustomizationApi;