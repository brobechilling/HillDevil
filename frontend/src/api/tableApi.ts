import { axiosClient } from './axiosClient';
import { ApiResponse } from '@/dto/apiResponse';

export interface TableResponse {
  id: string;
  tag: string;
  capacity: number;
  status: 'AVAILABLE' | 'OCCUPIED' | 'RESERVED';
  reservedBy?: string | null;
}

export interface CreateTableRequest {
  areaId: string;
  tag: string;
  capacity: number;
}

export interface TablesPageResponse {
  content: TableResponse[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

// Get all tables by branch with pagination
export const getTablesByBranch = async (
  branchId: string,
  page: number = 0,
  size: number = 20,
  sort?: string
): Promise<TablesPageResponse> => {
  const params = new URLSearchParams();
  params.append('branchId', branchId);
  params.append('page', page.toString());
  params.append('size', size.toString());
  if (sort) {
    params.append('sort', sort);
  }

  const res = await axiosClient.get<ApiResponse<any>>(`/owner/tables?${params.toString()}`);
  
  // Transform response to match expected format
  const pageData = res.data.result;
  return {
    content: pageData.content || [],
    totalElements: pageData.totalElements || 0,
    totalPages: pageData.totalPages || 0,
    currentPage: pageData.number || 0,
    pageSize: pageData.size || 20,
  };
};

// Create new table
export const createTable = async (data: CreateTableRequest): Promise<TableResponse> => {
  const res = await axiosClient.post<ApiResponse<TableResponse>>('/owner/tables', data);
  return res.data.result;
};

// Delete table
export const deleteTable = async (tableId: string): Promise<void> => {
  await axiosClient.delete(`/owner/tables/${tableId}`);
};

// Get table QR code as PNG
export const getTableQrPng = async (tableId: string, size: number = 512): Promise<Blob> => {
  const res = await axiosClient.get(`/owner/tables/${tableId}/qr.png?size=${size}`, {
    responseType: 'blob',
  });
  return res.data;
};

// Get table QR code as data URL for displaying in image tag
export const getTableQrDataUrl = async (tableId: string, size: number = 512): Promise<string> => {
  const blob = await getTableQrPng(tableId, size);
  return URL.createObjectURL(blob);
};