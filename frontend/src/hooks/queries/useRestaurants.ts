import { getRestaurants, getAllRestaurants, getRestaurantsByOwner } from "@/api/restaurantApi";
import { PageResponse } from "@/dto/pageResponse";
import { RestaurantDTO } from "@/dto/restaurant.dto";
import { useQuery } from "@tanstack/react-query";
import { getRestaurantById, updateRestaurant, deleteRestaurant } from '@/api/restaurantApi';
import { useMutation, useQueryClient } from '@tanstack/react-query';


export const useRestaurantsPaginatedQuery = (page: number, size: number) => {
  return useQuery<PageResponse<RestaurantDTO>, Error>({
    queryKey: ["restaurants", page, size],
    queryFn: () => getRestaurants(page, size),
    // staleTime: 1000 * 60 * 2,
  });
};

export const useRestaurants = () => {
  return useQuery<RestaurantDTO[]>({
    queryKey: ['restaurants'],
    queryFn: getAllRestaurants,
  });
};

export const useRestaurantsByOwner = (userId: string | undefined) => {
  return useQuery<RestaurantDTO[]>({
    queryKey: ['restaurants', 'owner', userId],
    queryFn: () => getRestaurantsByOwner(userId!),
    enabled: !!userId,
  });
};

export const useRestaurant = (id?: string) => {
  return useQuery<RestaurantDTO | null>({
    queryKey: ['restaurant', id],
    queryFn: () => getRestaurantById(id!),
    enabled: !!id,
    staleTime: 1000 * 60 * 2,
    refetchOnWindowFocus: false,
  });
};

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
