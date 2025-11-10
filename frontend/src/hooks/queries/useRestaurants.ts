import { getRestaurants, getAllRestaurants, getRestaurantsByOwner, getRestaurantById, updateRestaurant, deleteRestaurant } from "@/api/restaurantApi";
import { PageResponse } from "@/dto/pageResponse";
import { RestaurantDTO } from "@/dto/restaurant.dto";
import { useQuery } from "@tanstack/react-query";
import { useMutation, useQueryClient } from '@tanstack/react-query';


export const useRestaurantsPaginatedQuery = (page: number, size: number) => {
  return useQuery<PageResponse<RestaurantDTO>, Error>({
    queryKey: ["restaurants", page, size],
    queryFn: () => getRestaurants(page, size),
    // staleTime: 1000 * 60 * 2,
  });
};

export const useRestaurant = (restaurantId: string | undefined) => {
  return useQuery<RestaurantDTO, Error>({
    queryKey: ['restaurant', restaurantId],
    queryFn: () => getRestaurantById(restaurantId!),
    enabled: !!restaurantId, // chỉ fetch nếu có id
  });
};

export const useRestaurantsByOwner = (userId: string | undefined) => {
  return useQuery<RestaurantDTO[]>({
    queryKey: ['restaurants', 'owner', userId],
    queryFn: () => getRestaurantsByOwner(userId!),
    enabled: !!userId,
  });
};

// Consolidated `useRestaurant` above. If you need the variant with different options,
// adjust the single export above to include staleTime/refetchOnWindowFocus as needed.

export const useUpdateRestaurant = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<RestaurantDTO> }) => updateRestaurant(id, data),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ['restaurant', variables.id] });
      qc.invalidateQueries({ queryKey: ['restaurants'] });
    },
  });
};

export const useDeleteRestaurant = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteRestaurant(id),
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: ['restaurants'] });
      qc.invalidateQueries({ queryKey: ['restaurants', 'owner'] });
    },
  });
};
