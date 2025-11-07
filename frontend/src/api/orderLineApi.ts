import { OrderLineDTO } from '../dto/orderLine.dto';
import { OrderLineStatus } from '../dto/orderLine.dto';
import { axiosClient } from './axiosClient';

const baseUrl = '/api/order-lines';

const orderLineApi = {
    getById: async (id: string) => {
        const url = `${baseUrl}/${id}`;
        const response = await axiosClient.get(url);
        return response.data.result as OrderLineDTO;
    },

    getByOrder: async (orderId: string) => {
        const url = `${baseUrl}/order/${orderId}`;
        const response = await axiosClient.get(url);
        return response.data.result as OrderLineDTO[];
    },

    updateStatus: async (orderLineId: string, status: OrderLineStatus) => {
        const url = `${baseUrl}/${orderLineId}/status?status=${status}`;
        const response = await axiosClient.put(url);
        return response.data.result as OrderLineDTO;
    }
};

export default orderLineApi;