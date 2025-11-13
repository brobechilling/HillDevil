import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { MapPin, Phone, Mail, Clock, Loader2, Trash2, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useBranch } from '@/hooks/queries/useBranches';
import { useGuestBranchMenuItems } from '@/hooks/queries/useBranchMenuItems';
import { useRestaurant } from '@/hooks/queries/useRestaurants';
import { useCreateOrderLine } from '@/hooks/queries/useOrderLines';
import MenuItemDialog from '@/components/guest/MenuItemDialog';
import { GuestBranchMenuItemDTO } from '@/dto/branchMenuItem.dto';
import { CreateOrderItemRequest } from '@/dto/orderItem.dto';
import { CreateOrderLineRequest } from '@/dto/orderLine.dto';
import { useToast } from '@/hooks/use-toast';

type GuestLandingParams = {
  branchId: string;
  tableId: string;
};

const GuestLanding = () => {
  const { branchId, tableId } = useParams<GuestLandingParams>();
  const { data: branch, isLoading: isBranchLoading } = useBranch(branchId);
  const { data: branchMenuItems, isLoading: isMenuItemsLoading } = useGuestBranchMenuItems(branchId!);
  const { data: restaurant, isLoading: isRestaurantLoading } = useRestaurant(branch?.restaurantId);
  const { toast } = useToast();

  const [selectedItem, setSelectedItem] = useState<GuestBranchMenuItemDTO | null>(null);
  const [orderItems, setOrderItems] = useState<CreateOrderItemRequest[]>([]);

  const createOrderLineMutation = useCreateOrderLine();

  if (isBranchLoading || isMenuItemsLoading || isRestaurantLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
      </div>
    );
  }

  if (!branch || !branchMenuItems) return null;

  const handleAddItem = (item: CreateOrderItemRequest) => {
    setOrderItems((prev) => [...prev, item]);
  };

  const handleRemoveItem = (index: number) => {
    setOrderItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleConfirmOrder = async () => {
    if (orderItems.length === 0) {
      toast({ title: 'No items selected', description: 'Please add at least one item to order.' });
      return;
    }

    const totalPrice = orderItems.reduce((sum, i) => sum + i.totalPrice, 0);

    const payload: CreateOrderLineRequest = {
      areaTableId: tableId!,
      totalPrice,
      orderItems,
    };

    try {
      await createOrderLineMutation.mutateAsync(payload);
      toast({
        title: 'Order created successfully!',
        description: `Total: ${totalPrice.toFixed(2)} VND`,
      });
      setOrderItems([]);
    } catch {
      toast({
        title: 'Error creating order',
        description: 'Please try again later.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">{restaurant.name}</CardTitle>
          <CardDescription>{branch.address}</CardDescription>
        </CardHeader>
      </Card>

      <Separator />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {branchMenuItems.map((item) => {
          const selectedCount = orderItems.filter((i) => i.menuItemId === item.menuItemId).length;
          return (
            <Card
              key={item.branchMenuItemId}
              className="hover:shadow-lg transition cursor-pointer relative"
              onClick={() => setSelectedItem(item)}
            >
              {selectedCount > 0 && (
                <Badge className="absolute top-2 right-2 bg-green-600 text-white">
                  {selectedCount}
                </Badge>
              )}
              <CardHeader className="p-0">
                {item.imageUrl ? (
                  <img src={item.imageUrl} alt={item.name} className="rounded-t-xl w-full h-48 object-cover" />
                ) : (
                  <div className="h-48 bg-gray-200 flex items-center justify-center text-gray-400">No Image</div>
                )}
              </CardHeader>
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold">{item.name}</CardTitle>
                  {item.bestSeller && <Badge variant="destructive">Best Seller</Badge>}
                </div>
                <CardDescription className="line-clamp-2 text-sm text-gray-600">
                  {item.description}
                </CardDescription>
                <div className="text-right font-medium text-primary">{item.price.toFixed(2)} VND</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* --- Order Summary --- */}
      {orderItems.length > 0 && (
        <Card className="shadow-lg p-4 space-y-4">
          <h3 className="font-bold text-xl flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" /> Selected Items
          </h3>
          {orderItems.map((item, idx) => (
            <div
              key={idx}
              className="flex justify-between items-center border-b pb-2 mb-2 text-sm"
            >
              <div>
                <div className="font-medium">{branchMenuItems.find((i) => i.menuItemId === item.menuItemId)?.name}</div>
                <div className="text-gray-500">
                  x{item.quantity} — {item.totalPrice.toFixed(2)} VND
                </div>
              </div>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => handleRemoveItem(idx)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}

          <div className="text-right font-bold text-lg">
            Total:{' '}
            {orderItems.reduce((sum, i) => sum + i.totalPrice, 0).toFixed(2)} VND
          </div>

          <Button
            className="w-full"
            onClick={handleConfirmOrder}
            disabled={createOrderLineMutation.isPending}
          >
            {createOrderLineMutation.isPending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              'Confirm Order'
            )}
          </Button>
        </Card>
      )}

      {selectedItem && (
        <MenuItemDialog
          open={!!selectedItem}
          onOpenChange={(open) => !open && setSelectedItem(null)}
          menuItem={selectedItem}
          onAddItem={handleAddItem}
        />
      )}
    </div>
  );
};

export default GuestLanding;
