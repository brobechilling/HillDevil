import { useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Plus, Loader2 } from "lucide-react";
import { useBranchMenuItems, useUpdateAvailability } from "@/hooks/queries/useBranchMenuItems";
import { useCategories } from "@/hooks/queries/useCategories";
import { toast } from "@/hooks/use-toast";
import { ManualOrderDialog } from "./ManualOrderDialog";
import { BranchMenuItemDTO } from "@/dto/branchMenuItem.dto";

export const MenuManagement = ({ branchId }: { branchId: string }) => {
  const [orderDialogOpen, setOrderDialogOpen] = useState(false);

  // === Lấy restaurantId từ localStorage ===
  const selectedRestaurantRaw =
    typeof window !== "undefined" ? localStorage.getItem("selected_restaurant") : null;
  const selectedRestaurant = selectedRestaurantRaw ? JSON.parse(selectedRestaurantRaw) : null;
  const restaurantId = selectedRestaurant?.restaurantId as string | undefined;

  // === Queries ===
  const {
    data: menuItems = [],
    isLoading: loadingItems,
    isError: errorItems,
  } = useBranchMenuItems(branchId);

  const {
    data: categories = [],
    isLoading: loadingCategories,
    isError: errorCategories,
  } = useCategories(restaurantId);

  const updateAvailability = useUpdateAvailability(branchId);

  // === Loading & Error States ===
  const isLoading = loadingItems || loadingCategories;
  const isError = errorItems || errorCategories;

  // === Xử lý nhóm theo category ===
  const categoryMap = useMemo(() => {
    const map = new Map<string, string>();
    categories.forEach((cat) => map.set(cat.categoryId, cat.name));
    return map;
  }, [categories]);

  const groupedItems = useMemo(() => {
    const groups: Record<string, BranchMenuItemDTO[]> = {};
    menuItems.forEach((item) => {
      const catName = categoryMap.get(item.categoryId) || "Uncategorized";
      if (!groups[catName]) groups[catName] = [];
      groups[catName].push(item);
    });
    return groups;
  }, [menuItems, categoryMap]);

  const sortedCategories = useMemo(() => {
    return Object.keys(groupedItems).sort((a, b) => {
      if (a === "Uncategorized") return 1;
      if (b === "Uncategorized") return -1;
      return a.localeCompare(b);
    });
  }, [groupedItems]);

  // === Toggle availability ===
  const handleToggleAvailability = (item: BranchMenuItemDTO) => {
    updateAvailability.mutate(
      {
        menuItemId: item.menuItemId,
        available: !item.available,
      },
      {
        onSuccess: () => {
          toast({
            title: "Availability updated",
            description: `${item.name} is now ${!item.available ? "available" : "unavailable"}.`,
          });
        },
        onError: () => {
          toast({
            title: "Error",
            description: "Failed to update item availability",
            variant: "destructive",
          });
        },
      }
    );
  };

  // === Render Loading ===
  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Loading menu and categories...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // === Render Error ===
  if (isError) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-12">
            <p className="text-destructive font-medium">Failed to load menu or categories.</p>
            <p className="text-sm text-muted-foreground mt-2">
              Please check your connection or try again later.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // === Render Empty ===
  if (menuItems.length === 0) {
    return (
      <>
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Menu Management</CardTitle>
                <CardDescription>Manage item availability by category</CardDescription>
              </div>
              <Button onClick={() => setOrderDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create Manual Order
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-center py-16">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                <Plus className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-lg font-medium text-foreground">No menu items available</p>
              <p className="text-sm text-muted-foreground mt-1">
                Items will appear here once added to your restaurant menu.
              </p>
            </div>
          </CardContent>
        </Card>

        <ManualOrderDialog
          open={orderDialogOpen}
          onOpenChange={setOrderDialogOpen}
          branchId={branchId}
        />
      </>
    );
  }

  // === Main Render ===
  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Menu Management</CardTitle>
              <CardDescription>Manage item availability by category</CardDescription>
            </div>
            <Button onClick={() => setOrderDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Manual Order
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-12">
            {sortedCategories.map((categoryName) => {
              const items = groupedItems[categoryName];
              return (
                <section key={categoryName} className="space-y-4">
                  {/* Category Header */}
                  <div className="flex items-center justify-between pb-2 border-b border-border/50">
                    <div className="flex items-center gap-3">
                      <div className="w-1 h-7 bg-primary rounded-full"></div>
                      <h3 className="text-xl font-bold text-foreground">{categoryName}</h3>
                      <Badge variant="secondary" className="text-xs font-medium">
                        {items.length} {items.length === 1 ? "item" : "items"}
                      </Badge>
                    </div>
                  </div>

                  {/* Items Grid */}
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {items.map((item) => (
                      <Card
                        key={item.menuItemId}
                        className="border-border/50 overflow-hidden hover:shadow-md transition-shadow duration-200"
                      >
                        {item.imageUrl ? (
                          <div className="aspect-video bg-muted relative overflow-hidden">
                            <img
                              src={item.imageUrl}
                              alt={item.name}
                              className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = "none";
                              }}
                            />
                          </div>
                        ) : (
                          <div className="aspect-video bg-muted/50 flex items-center justify-center">
                            <p className="text-xs text-muted-foreground">No image</p>
                          </div>
                        )}

                        <CardContent className="pt-5">
                          <div className="space-y-3">
                            <div>
                              <h4 className="font-bold text-lg line-clamp-1">{item.name}</h4>
                              <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                                {item.description || "No description"}
                              </p>
                            </div>

                            <div className="flex items-center justify-between">
                              <p className="font-bold text-lg text-primary">
                                ${Number(item.price).toFixed(2)}
                              </p>
                              <Badge
                                variant={item.available ? "default" : "destructive"}
                                className="text-xs"
                              >
                                {item.available ? "Available" : "Unavailable"}
                              </Badge>
                            </div>

                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">Availability</span>
                              <Switch
                                checked={item.available}
                                onCheckedChange={() => handleToggleAvailability(item)}
                                disabled={updateAvailability.isPending}
                              />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <ManualOrderDialog
        open={orderDialogOpen}
        onOpenChange={setOrderDialogOpen}
        branchId={branchId}
      />
    </>
  );
};  