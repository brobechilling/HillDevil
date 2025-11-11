import { ApiResponse } from "@/dto/apiResponse";
import { axiosClient } from "./axiosClient";
import { TableDTO, CreateTableRequest, TableListResponse, QrCodeJsonResponse, TableStatus } from "@/dto/table.dto";

interface PagedTableResponse {
  content: TableDTO[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

/**
 * Lấy danh sách tables theo branch (có phân trang)
 */
export const getTablesByBranch = async (
  branchId: string,
  page: number = 0,
  size: number = 20,
  sort?: string
) => {
  // Validate branchId trước khi gọi API
  if (!branchId || branchId.trim() === '') {
    throw new Error('BranchId is required');
  }

  try {
    const res = await axiosClient.get<ApiResponse<PagedTableResponse>>(
      "/owner/tables",
      {
        params: {
          branchId: branchId.trim(),
          page,
          size,
          ...(sort && { sort }),
        },
      }
    );
    return res.data.result;
  } catch (err: any) {
    // If owner endpoint is forbidden for the current user (403), fallback to public tables
    if (err && err.response && err.response.status === 403) {
      // try public endpoint which the guest/staff client uses.
      // Use the safer branch listing endpoint implemented at /public/tables/branch/{branchId}
      const path = `/public/tables/branch/${encodeURIComponent(branchId.trim())}`;
      const pubRes = await axiosClient.get<ApiResponse<PagedTableResponse>>(path, {
        params: {
          page,
          size,
          ...(sort && { sort }),
        },
      });
      return pubRes.data.result;
    }

    // otherwise rethrow to allow the caller to handle
    throw err;
  }
};

/**
 * Lấy thông tin chi tiết một table
 */
export const getTableById = async (tableId: string): Promise<TableDTO> => {
  const res = await axiosClient.get<ApiResponse<TableDTO>>(
    `/owner/tables/${tableId}`
  );
  return res.data.result!;
};

/**
 * Lấy danh sách tables theo area
 */
export const getTablesByArea = async (areaId: string): Promise<TableDTO[]> => {
  const res = await axiosClient.get<ApiResponse<TableDTO[]>>(
    `/owner/tables/area/${areaId}`
  );
  return res.data.result || [];
};

/**
 * Tạo table mới
 */
export const createTable = async (data: CreateTableRequest): Promise<TableDTO> => {
  const res = await axiosClient.post<ApiResponse<TableDTO>>(
    "/owner/tables",
    data
  );
  return res.data.result!;
};

/**
 * Cập nhật thông tin table
 */
export const updateTable = async (
  tableId: string,
  data: CreateTableRequest
): Promise<TableDTO> => {
  const res = await axiosClient.put<ApiResponse<TableDTO>>(
    `/owner/tables/${tableId}`,
    data
  );
  return res.data.result!;
};

/**
 * Cập nhật trạng thái table
 */
export const updateTableStatus = async (
  tableId: string,
  status: TableStatus
): Promise<TableDTO> => {
  const res = await axiosClient.patch<ApiResponse<TableDTO>>(
    `/owner/tables/${tableId}/status`,
    null,
    {
      params: { status },
    }
  );
  return res.data.result!;
};

/**
 * Xóa table
 */
export const deleteTable = async (tableId: string): Promise<void> => {
  const res = await axiosClient.delete<ApiResponse<void>>(
    `/owner/tables/${tableId}`
  );
  // Kiểm tra response status - nếu không phải success thì throw error
  if (res.status < 200 || res.status >= 300) {
    throw new Error(`Failed to delete table: ${res.status}`);
  }
};

/**
 * Lấy QR code PNG image (binary blob)
 */
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

/**
 * Lấy QR code JSON với base64 encoded image
 */
export const getTableQrCodeJson = async (
  tableId: string,
  size: number = 512
): Promise<QrCodeJsonResponse> => {
  const res = await axiosClient.get<ApiResponse<QrCodeJsonResponse>>(
    `/owner/tables/${tableId}/qr.json`,
    {
      params: { size },
    }
  );
  return res.data.result!;
};

/**
 * Download QR code PNG file
 */
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

/**
 * Export QR codes PDF cho branch/area
 */
export const exportBranchQrPdf = async (
  branchId: string,
  areaId?: string,
  cols: number = 3,
  sizePt: number = 200
): Promise<Blob> => {
  const res = await axiosClient.get(
    `/owner/tables/export/qr-pdf`,
    {
      params: {
        branchId,
        ...(areaId && { areaId }),
        cols,
        sizePt,
      },
      responseType: "blob",
    }
  );
  return res.data;
};

/**
 * Download PDF chứa nhiều QR codes
 */
export const downloadBranchQrPdf = async (
  branchId: string,
  areaId: string | undefined,
  cols: number = 3,
  sizePt: number = 200
) => {
  try {
    const blob = await exportBranchQrPdf(branchId, areaId, cols, sizePt);
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `tables-qr-${branchId}${areaId ? `-area-${areaId}` : ''}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Error downloading QR PDF:", error);
    throw error;
  }
};

/**
 * Public branch listing: directly call the public endpoint which does not require owner role.
 * Used by staff/guest clients to avoid hitting the /owner API and receiving 403.
 */
export const getPublicTablesByBranch = async (
  branchId: string,
  page: number = 0,
  size: number = 20,
  sort?: string
) => {
  if (!branchId || branchId.trim() === '') {
    throw new Error('BranchId is required');
  }

  const path = `/public/tables/branch/${encodeURIComponent(branchId.trim())}`;
  const res = await axiosClient.get<ApiResponse<PagedTableResponse>>(path, {
    params: { page, size, ...(sort && { sort }) },
  });
  return res.data.result;
};