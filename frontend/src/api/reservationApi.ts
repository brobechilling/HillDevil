import { axiosClient } from './axiosClient';

export const reservationApi = {
  // fetch paginated reservations for a branch
  fetchByBranch: async (branchId: string, page = 0, size = 20) => {
    const res = await axiosClient.get(`/receptionist/reservations`, {
      params: { branchId, page, size },
    });
    return res.data;
  },

  getById: async (id: string) => {
    const res = await axiosClient.get(`/receptionist/reservations/${id}`);
    return res.data;
  },

  createPublic: async (payload: any) => {
    const res = await axiosClient.post(`/public/reservations`, payload);
    return res.data;
  },

  // receptionist create (authenticated)
  createForReceptionist: async (payload: any) => {
    const res = await axiosClient.post(`/receptionist/reservations`, payload);
    return res.data;
  },

  updateStatus: async (id: string, status: string) => {
    const res = await axiosClient.put(`/receptionist/reservations/${id}/status`, { status });
    return res.data;
  },

  cancel: async (id: string) => {
    const res = await axiosClient.delete(`/receptionist/reservations/${id}`);
    return res.data;
  }
};
