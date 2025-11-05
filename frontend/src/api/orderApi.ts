import { OrderDTO, CreateOrderRequest } from '../dto/order.dto';
import { axiosClient } from './axiosClient';

const baseUrl = '/api/orders';

const orderApi = {
    getOrdersHistory: async (branchId: string) => {
        const url = `${baseUrl}/branch/${branchId}/history`;
        const response = await axiosClient.get(url);
        return response.data.result as OrderDTO[];
    },

    getById: async (orderId: string) => {
        const url = `${baseUrl}/${orderId}`;
        const response = await axiosClient.get(url);
        return response.data.result as OrderDTO;
    },

    create: async (request: CreateOrderRequest) => {
        const url = `${baseUrl}/create`;
        const response = await axiosClient.post(url, request);
        return response.data.result as OrderDTO;
    },

    getPendingByTable: async (tableId: string) => {
        const url = `${baseUrl}/table/${tableId}/pending`;
        const response = await axiosClient.get(url);
        return response.data.result as OrderDTO;
    },

    completeOrder: async (orderId: string) => {
        const url = `${baseUrl}/${orderId}/complete`;
        const response = await axiosClient.put(url);
        return response.data.result as OrderDTO;
    }
};

export default orderApi;