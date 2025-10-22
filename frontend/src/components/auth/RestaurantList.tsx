import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Building2, ChevronRight } from "lucide-react";
import { RestaurantDTO } from "@/dto/restaurant.dto";
import { useRestaurantsPaginatedQuery } from "@/hooks/queries/useRestaurants";

interface RestaurantListProps {
  onSelectRestaurant: (restaurant: RestaurantDTO) => void;
}

export const RestaurantList = ({ onSelectRestaurant }: RestaurantListProps) => {
  const [page, setPage] = useState<number>(1);
  const size: number = 2;
  const [searchQuery, setSearchQuery] = useState("");

  const { data, isLoading, isError, isFetching } = useRestaurantsPaginatedQuery(page, size);

  const filteredRestaurants = data?.items.filter((r) =>
    r.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return <div className="text-center py-8">Loading restaurants...</div>;
  }

  if (isError) {
    return <div className="text-center py-8 text-red-500">Failed to load restaurants.</div>;
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by restaurant name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {filteredRestaurants && filteredRestaurants.length > 0 ? (
          filteredRestaurants.map((r) => (
            <button
              key={r.restaurantId}
              onClick={() => onSelectRestaurant(r)}
              className="w-full p-4 text-left border rounded-lg hover:border-primary hover:bg-muted/50 transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold text-lg">{r.name}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">{r.email}</p>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </div>
            </button>
          ))
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            No restaurants found
          </div>
        )}
      </div>

      {data && data.totalPages > 1 && (
        <div className="flex justify-between items-center pt-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page === 1 || isFetching}
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page} / {data.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page === data.totalPages || isFetching}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
};
