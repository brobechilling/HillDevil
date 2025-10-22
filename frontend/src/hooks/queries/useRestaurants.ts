import { getRestaurants } from "@/api/restaurantApi";
import { PageResponse } from "@/dto/pageResponse";
import { RestaurantDTO } from "@/dto/restaurant.dto";
import { useQuery } from "@tanstack/react-query";


export const useRestaurantsPaginatedQuery = (page: number, size: number) => {
  return useQuery<PageResponse<RestaurantDTO>, Error>({
    queryKey: ["restaurants", page, size],
    queryFn: () => getRestaurants(page, size),
    staleTime: 1000 * 60 * 2,
  });
};

