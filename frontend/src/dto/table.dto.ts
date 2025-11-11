export type TableStatus = 'FREE' | 'OCCUPIED' | 'ACTIVE' | 'INACTIVE';

export interface TableDTO {
  id: string;
  tag: string;
  capacity: number;
  status: TableStatus;
  areaId?: string;
  areaName?: string;
}

export interface CreateTableRequest {
  areaId: string;
  tag: string;
  capacity: number;
}

export interface UpdateTableRequest {
  tag?: string;
  capacity?: number;
  status?: TableStatus;
}

export interface TableListResponse {
  content: TableDTO[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

export interface QrCodeJsonResponse {
  tableId: string;
  tableTag: string;
  qrCodeBase64: string;
  orderUrl: string;
  size: number;
}