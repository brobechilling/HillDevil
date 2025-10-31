import { ApiResponse } from "@/dto/apiResponse";
import { axiosClient } from "./axiosClient";
import { TableDTO, CreateTableRequest, TableListResponse } from "@/dto/table.dto";

interface PagedTableResponse {
  content: TableDTO[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export const getTablesByBranch = async (
  branchId: string,
  page: number = 0,
  size: number = 20,
  sort?: string
) => {
  const res = await axiosClient.get<ApiResponse<PagedTableResponse>>(
    "/owner/tables",
    {
      params: {
        branchId,
        page,
        size,
        ...(sort && { sort }),
      },
    }
  );
  return res.data.result;
};

export const createTable = async (data: CreateTableRequest) => {
  const res = await axiosClient.post<ApiResponse<TableDTO>>(
    "/owner/tables",
    data
  );
  return res.data.result;
};

export const deleteTable = async (tableId: string) => {
  const res = await axiosClient.delete<ApiResponse<void>>(
    `/owner/tables/${tableId}`
  );
  return res.data;
};

export const getTableQrCode = async (
  tableId: string,
  size: number = 512
): Promise<Blob> => {
  const res = await axiosClient.get(`/owner/tables/${tableId}/qr.png`, {
    params: { size },
    responseType: "blob",
  });
  return res.data;
};

export const downloadTableQr = async (
  tableId: string,
  tableName: string,
  size: number = 512
) => {
  try {
    const blob = await getTableQrCode(tableId, size);
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `table-${tableName || tableId}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Error downloading QR code:", error);
    throw error;
  }
};