import { useQuery } from "@tanstack/react-query";
import { featureApi } from "@/api/featureApi";

export const useFeatures = () => {
  return useQuery({
    queryKey: ["features"],
    queryFn: featureApi.getAll,
  });
};
