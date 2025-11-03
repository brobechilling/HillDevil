import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAllMedia, getMediaByTarget, uploadMedia, deleteMedia } from "@/api/mediaApi";
import { MediaDTO } from "@/dto/media.dto";

export const useAllMedia = () => {
  return useQuery<MediaDTO[]>({
    queryKey: ["media"],
    queryFn: getAllMedia,
  });
};

export const useMediaByTarget = (targetId: string | undefined, targetTypeCode: string | undefined) => {
  return useQuery<MediaDTO[]>({
    queryKey: ["media", "target", targetId, targetTypeCode],
    queryFn: () => getMediaByTarget(targetId!, targetTypeCode!),
    enabled: !!targetId && !!targetTypeCode,
  });
};

export const useUploadMedia = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ file, targetId, targetTypeCode }: { file: File; targetId: string; targetTypeCode: string }) =>
      uploadMedia(file, targetId, targetTypeCode),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["media", "target", variables.targetId] });
      queryClient.invalidateQueries({ queryKey: ["media"] });
    },
  });
};

export const useDeleteMedia = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteMedia,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["media"] });
    },
  });
};