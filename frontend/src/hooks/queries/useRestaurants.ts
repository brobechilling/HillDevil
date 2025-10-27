import { getRestaurants, getAllRestaurants, getRestaurantsByOwner } from "@/api/restaurantApi";
import { PageResponse } from "@/dto/pageResponse";
import { RestaurantDTO } from "@/dto/restaurant.dto";
import { useQuery } from "@tanstack/react-query";


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
