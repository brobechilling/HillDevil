import { ApiResponse } from "@/dto/apiResponse";
import { axiosClient } from "./axiosClient";
import { MediaDTO } from "@/dto/media.dto";

export const getAllMedia = async () => {
  const res = await axiosClient.get<ApiResponse<MediaDTO[]>>("/media");
  return res.data.result;
};

export const getMediaByTarget = async (targetId: string, targetTypeCode: string) => {
  const res = await axiosClient.get<ApiResponse<MediaDTO[]>>(
    `/media/target/${targetId}`,
    { params: { targetTypeCode } }
  );
  return res.data.result;
};

export const uploadMedia = async (file: File, targetId: string, targetTypeCode: string) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("targetId", targetId);
  formData.append("targetTypeCode", targetTypeCode);

  const res = await axiosClient.post<ApiResponse<MediaDTO>>("/media/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data.result;
};

export const deleteMedia = async (id: string) => {
  const res = await axiosClient.delete<ApiResponse<void>>(`/media/${id}`);
  return res.data;
};

/** 🔹 Xóa toàn bộ media theo target */
export const deleteAllMediaForTarget = async (targetId: string, targetTypeCode: string) => {
  const res = await axiosClient.delete<ApiResponse<void>>(
    `/media/target/${targetId}`,
    { params: { targetTypeCode } }
  );
  return res.data;
};
