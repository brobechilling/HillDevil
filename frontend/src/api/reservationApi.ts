import { axiosClient } from './axiosClient';
import { ReservationResponseDto, CreateReservationRequestDto, ReservationApiList } from '@/dto/reservation.dto';
import { ApiResponse } from '@/dto/apiResponse';

export const reservationApi = {
  fetchByBranch: async (branchId: string, page = 0, size = 20): Promise<ApiResponse<any>> => {
    const res = await axiosClient.get(`/receptionist/reservations`, {
      params: { branchId, page, size },
    });
    return res.data as ApiResponse<any>;
  },

  getById: async (id: string): Promise<ApiResponse<ReservationResponseDto>> => {
    const res = await axiosClient.get(`/receptionist/reservations/${id}`);
    return res.data as ApiResponse<ReservationResponseDto>;
  },

  createPublic: async (payload: CreateReservationRequestDto): Promise<ApiResponse<ReservationResponseDto>> => {
    const res = await axiosClient.post(`/public/reservations`, payload);
    return res.data as ApiResponse<ReservationResponseDto>;
  },

  createForReceptionist: async (payload: CreateReservationRequestDto): Promise<ApiResponse<ReservationResponseDto>> => {
    const res = await axiosClient.post(`/receptionist/reservations`, payload);
    return res.data as ApiResponse<ReservationResponseDto>;
  },

  updateStatus: async (id: string, status: string) => {
    const res = await axiosClient.put(`/receptionist/reservations/${id}/status`, null, {
      params: { status: status ? status.toString().toUpperCase() : status },
    });
    return res.data;
  },

  cancel: async (id: string) => {
    const res = await axiosClient.delete(`/receptionist/reservations/${id}`);
    return res.data;
  }
  ,
  assignTable: async (id: string, tableId: string | null) => {
    const res = await axiosClient.put(`/receptionist/reservations/${id}/table`, null, {
      params: { tableId },
    });
    return res.data;
  }
};

export const getReservationsByTable = async (tableId: string) => {
  const res = await axiosClient.get(`/public/reservations/table/${encodeURIComponent(tableId)}`);
  const data = res.data as ApiResponse<ReservationApiList> | ReservationApiList;
  if (data && (data as ApiResponse<any>).result !== undefined) {
    return (data as ApiResponse<ReservationApiList>).result || [];
  }
  return (data as ReservationApiList) || [];
};
