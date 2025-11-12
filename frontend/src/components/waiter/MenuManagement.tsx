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
import { Plus, Loader2 } from "lucide-react";
import { useBranchMenuItems, useUpdateAvailability } from "@/hooks/queries/useBranchMenuItems";
import { useCategories } from "@/hooks/queries/useCategories";
import { useRestaurantByBranch } from "@/hooks/queries/useBranches";
import { toast } from "@/hooks/use-toast";
import { ManualOrderDialog } from "./ManualOrderDialog";
import { BranchMenuItemDTO } from "@/dto/branchMenuItem.dto";
import { useSessionStore } from "@/store/sessionStore";
import { isStaffAccountDTO } from "@/utils/typeCast";
import { MenuItemViewDialog } from "@/components/menu/MenuItemViewDialog";
import { MenuItemCard } from "@/components/menu/MenuItemCard";

export const MenuManagement= () => {
  const [orderDialogOpen, setOrderDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<string | undefined>();

  const { user } = useSessionStore();
  const branchId = isStaffAccountDTO(user) ? user.branchId : undefined;
  const isWaiter = isStaffAccountDTO(user) && user.role.name === "WAITER";

  // === Queries ===
  const { data: restaurantId, isLoading: loadingRestaurant } = useRestaurantByBranch(branchId);
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

  const isLoading = loadingRestaurant || loadingItems || loadingCategories;
  const isError = errorItems || errorCategories;

  // === Group by category ===
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

  // === Handlers ===
  const handleToggleAvailability = (item: BranchMenuItemDTO) => {
    updateAvailability.mutate(
      {
        menuItemId: item.menuItemId,
        available: !item.available,
      },
      {
        onSuccess: (_, variables) => {
          toast({
            title: "Availability updated",
            description: `${item.name} is now ${variables.available ? "available" : "unavailable"}.`,
          });
        },
        onError: () => {
          toast({
            title: "Error",
            description: "Failed to update item availability.",
            variant: "destructive",
          });
        },
      }
    );
  };

  const handleViewItem = (itemId: string) => {
    setSelectedItemId(itemId);
    setViewDialogOpen(true);
  };

  const isItemUpdating = (itemId: string) =>
    updateAvailability.isPending && updateAvailability.variables?.menuItemId === itemId;

  // === Loading State ===
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

  // === Error State ===
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

  // === Empty State ===
  if (menuItems.length === 0) {
    return (
      <>
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Menu Management</CardTitle>
                <CardDescription>Manage item availability and create manual order</CardDescription>
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
          branchId={branchId!}
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
                      <MenuItemCard
                        key={item.menuItemId}
                        item={item}
                        isWaiter={isWaiter}
                        isUpdating={isItemUpdating(item.menuItemId)}
                        onToggleAvailability={handleToggleAvailability}
                        onViewDetails={handleViewItem}
                      />
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Dialogs */}
      <MenuItemViewDialog
        open={viewDialogOpen}
        onOpenChange={(open) => {
          setViewDialogOpen(open);
          if (!open) setSelectedItemId(undefined);
        }}
        itemId={selectedItemId}
        isWaiter={isWaiter}
      />

      <ManualOrderDialog
        open={orderDialogOpen}
        onOpenChange={setOrderDialogOpen}
        branchId={branchId!}
      />
    </>
  );
};