import { OrderItemDTO, CreateOrderItemRequest } from '../dto/orderItem.dto';
import { axiosClient } from './axiosClient';

const baseUrl = '/api/order-items';

const orderItemApi = {
    createItems: async (orderLineId: string, requests: CreateOrderItemRequest[]) => {
        const url = `${baseUrl}/order-line/${orderLineId}/create`;
        const response = await axiosClient.post(url, requests);
        return response.data.result as OrderItemDTO[];
    }
};

export default orderItemApi;