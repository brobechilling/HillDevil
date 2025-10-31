export type TableStatus = 'FREE' | 'OCCUPIED' | 'ACTIVE' | 'INACTIVE';

export interface TableDTO {
  id: string;
  tag: string;
  capacity: number;
  status: TableStatus;
  reservedBy: string | null;
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