import { useState } from 'react';
import { useRestaurantsByOwner } from '@/hooks/queries/useRestaurants';
import { useBranchesByRestaurant } from '@/hooks/queries/useBranches';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Loader2, Store, MapPin } from 'lucide-react';
import { UserDTO } from '@/dto/user.dto';

interface UserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user?: UserDTO;
}

export const UserDialog = ({ open, onOpenChange, user }: UserDialogProps) => {
  const { data: restaurants, isLoading, isError } = useRestaurantsByOwner(user?.userId);

  const [expandedRestaurantId, setExpandedRestaurantId] = useState<string | null>(null);

  const toggleExpand = (restaurantId: string) => {
    setExpandedRestaurantId((prev) => (prev === restaurantId ? null : restaurantId));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>User's Restaurants & Branches</DialogTitle>
          <p className="text-sm text-muted-foreground">{user?.username}</p>
          <p className="text-sm text-muted-foreground">{user?.phone}</p>
        </DialogHeader>

        {isLoading && (
          <div className="flex justify-center items-center py-8 text-muted-foreground">
            <Loader2 className="h-5 w-5 mr-2 animate-spin" /> Loading restaurants...
          </div>
        )}

        {isError && (
          <div className="text-center py-8 text-red-500">
            Failed to load restaurants.
          </div>
        )}

        {!isLoading && !isError && (
          <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
            {(!restaurants || restaurants.length === 0) && (
              <div className="text-center text-muted-foreground py-8">
                No restaurants found for this user.
              </div>
            )}

            {restaurants?.map((restaurant) => (
              <Card key={restaurant.restaurantId} className="border border-border">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Store className="h-5 w-5" />
                      {restaurant.name}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">{restaurant.email}</p>
                    <p className="text-sm text-muted-foreground">{restaurant.restaurantPhone}</p>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleExpand(restaurant.restaurantId)}
                  >
                    {expandedRestaurantId === restaurant.restaurantId ? 'Hide branches' : 'Show branches'}
                  </Button>
                </CardHeader>

                {expandedRestaurantId === restaurant.restaurantId && (
                  <RestaurantBranches restaurantId={restaurant.restaurantId} />
                )}
              </Card>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};


const RestaurantBranches = ({ restaurantId }: { restaurantId: string }) => {
  const { data: branches, isLoading, isError } = useBranchesByRestaurant(restaurantId);

  if (isLoading)
    return (
      <div className="flex justify-center items-center py-4 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Loading branches...
      </div>
    );

  if (isError)
    return (
      <div className="text-center text-red-500 text-sm py-4">
        Failed to load branches.
      </div>
    );

  if (!branches || branches.length === 0)
    return <div className="text-center text-muted-foreground text-sm py-4">No branches found.</div>;

  return (
    <CardContent>
      <Separator className="my-2" />
      <div className="space-y-2">
        {branches.map((branch) => (
          <div
            key={branch.branchId}
            className="border rounded-lg p-3 flex items-start justify-between"
          >
            <div>
              <div className="flex items-center gap-2 font-medium">
                <MapPin  className="h-4 w-4" />
                {branch.address}
              </div>
              <p className="text-sm text-muted-foreground">
                Phone: {branch.branchPhone ?? 'N/A'}
              </p>
              <p className="text-sm text-muted-foreground">
                {branch.openingTime && branch.closingTime
                  ? `Opening Time: ${branch.openingTime} - ${branch.closingTime}`
                  : 'Hours: N/A'}
              </p>
            </div>
            <div
              className={`text-sm font-medium ${
                branch.isActive ? 'text-green-600' : 'text-gray-400'
              }`}
            >
              {branch.isActive ? 'Active' : 'Inactive'}
            </div>
          </div>
        ))}
      </div>
    </CardContent>
  );
};
