import { useMemo, useState } from "react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, AlertTriangle, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

import { useSessionStore } from "@/store/sessionStore";
import { isStaffAccountDTO } from "@/utils/typeCast";
import { useRestaurantByBranch } from "@/hooks/queries/useBranches";
import { useBranchMenuItems, useUpdateAvailability } from "@/hooks/queries/useBranchMenuItems";
import { useCategories } from "@/hooks/queries/useCategories";
import { BranchMenuItemDTO } from "@/dto/branchMenuItem.dto";
import { MenuItemViewDialog } from "@/components/owner/MenuItemViewDialog";

export const MenuManagement = () => {
    const { user } = useSessionStore();
    const branchId = isStaffAccountDTO(user) ? user.branchId : undefined;

    // Queries
    const { data: restaurantId, isLoading: loadingRestaurant } = useRestaurantByBranch(branchId);
    const { data: menuItems = [], isLoading: loadingItems, isError: errorItems } =
        useBranchMenuItems(branchId);
    const { data: categories = [], isLoading: loadingCategories, isError: errorCategories } =
        useCategories(restaurantId);
    const updateAvailability = useUpdateAvailability(branchId);

    const isLoading = loadingRestaurant || loadingItems || loadingCategories;
    const isError = errorItems || errorCategories;
    const [viewDialogOpen, setViewDialogOpen] = useState(false);
    const [selectedItemId, setSelectedItemId] = useState<string | undefined>();

    const handleViewItem = (itemId: string) => {
        setSelectedItemId(itemId);
        setViewDialogOpen(true);
    };

    // Group by category
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

    // === Event handlers ===
    const handleToggleAvailability = (item: BranchMenuItemDTO) => {
        updateAvailability.mutate(
            { menuItemId: item.menuItemId, available: !item.available },
            {
                onSuccess: (_, variables) => {
                    toast({
                        title: "Availability updated",
                        description: `${item.name} is now ${variables.available ? "available" : "unavailable"}.`,
                    });
                },
                onError: () => {
                    toast({
                        title: "❌ Error",
                        description: "Failed to update availability.",
                        variant: "destructive",
                    });
                },
            }
        );
    };

    // === Loading ===
    if (isLoading) {
        return (
            <Card>
                <CardContent className="pt-6">
                    <div className="flex flex-col items-center justify-center py-12 gap-3">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <p className="text-sm text-muted-foreground">Loading menu and categories...</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    // === Error ===
    if (isError) {
        return (
            <Card>
                <CardContent className="pt-6 text-center py-12">
                    <p className="text-destructive font-medium">Failed to load menu or categories.</p>
                    <p className="text-sm text-muted-foreground mt-2">
                        Please check your connection or try again later.
                    </p>
                </CardContent>
            </Card>
        );
    }

    // === Empty ===
    if (menuItems.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Menu Management</CardTitle>
                    <CardDescription>Manage menu item availability</CardDescription>

                </CardHeader>
                <CardContent className="text-center py-16">
                    <p className="text-lg font-medium">No menu items found</p>
                    <p className="text-sm text-muted-foreground mt-1">
                        Items will appear once added to this branch.
                    </p>
                </CardContent>
            </Card>
        );
    }

    // === Main Render ===
    return (
        <Card>
            <CardHeader>
                <CardTitle>Menu Management</CardTitle>
                <CardDescription>Manage item availability for this branch</CardDescription>
                <div className="mt-4 flex justify-between items-center gap-4">
                    <div className="flex-1 text-center">
                        <p className="text-2xl font-bold">{menuItems.length}</p>
                        <p className="text-sm text-muted-foreground">Total Items</p>
                    </div>
                    <div className="flex-1 text-center">
                        <p className="text-2xl font-bold">
                            {menuItems.filter(item => item.bestSeller).length}
                        </p>
                        <p className="text-sm text-muted-foreground">Best Sellers</p>
                    </div>
                    <div className="flex-1 text-center">
                        <p className="text-2xl font-bold">
                            {menuItems.filter(item => item.available).length}/{menuItems.length}
                        </p>
                        <p className="text-sm text-muted-foreground">Available</p>
                    </div>
                </div>
            </CardHeader>

            <CardContent>
                <div className="space-y-10">
                    {sortedCategories.map((categoryName) => {
                        const items = groupedItems[categoryName];
                        return (
                            <section key={categoryName} className="space-y-4">
                                <div className="flex items-center justify-between pb-2 border-b border-border/50">
                                    <div className="flex items-center gap-3">
                                        <div className="w-1 h-6 bg-primary rounded-full"></div>
                                        <h3 className="text-xl font-bold">{categoryName}</h3>
                                        <Badge variant="secondary" className="text-xs">
                                            {items.length} {items.length > 1 ? "items" : "item"}
                                        </Badge>
                                    </div>
                                </div>

                                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                    {items.map((item) => (
                                        <Card
                                            key={item.menuItemId}
                                            className="overflow-hidden border-border/50 hover:shadow-md transition-shadow duration-200"
                                        >
                                            {item.imageUrl ? (
                                                <div className="aspect-video bg-muted relative overflow-hidden">
                                                    <img
                                                        src={item.imageUrl}
                                                        alt={item.name}
                                                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                                                    />
                                                </div>
                                            ) : (
                                                <div className="aspect-video bg-muted/50 flex items-center justify-center">
                                                    <p className="text-xs text-muted-foreground">No image</p>
                                                </div>
                                            )}

                                            <CardContent className="pt-5 space-y-3">
                                                <div>
                                                    <div className="flex items-center gap-1">
                                                        <h4 className="font-bold text-lg line-clamp-1">{item.name}</h4>
                                                        {item.bestSeller && (
                                                            <span
                                                                title="Best Seller"
                                                                className="text-yellow-500 text-base"
                                                                aria-label="Best Seller"
                                                            >
                                                                ⭐
                                                            </span>
                                                        )}
                                                    </div>
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
                                                        {item.available ? "Available" : "Out of Order"}
                                                    </Badge>
                                                </div>

                                                {/* Toggle Availability */}
                                                <div className="pt-2 flex flex-col gap-2">
                                                    <Button
                                                        variant={item.available ? "outline" : "default"}
                                                        size="sm"
                                                        className="w-full"
                                                        onClick={() => handleToggleAvailability(item)}
                                                        disabled={
                                                            updateAvailability.isPending &&
                                                            updateAvailability.variables?.menuItemId === item.menuItemId
                                                        }
                                                    >
                                                        {updateAvailability.isPending &&
                                                            updateAvailability.variables?.menuItemId === item.menuItemId ? (
                                                            <>
                                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                                Updating...
                                                            </>
                                                        ) : (
                                                            <>
                                                                <AlertTriangle className="h-3 w-3 mr-2" />
                                                                {item.available ? "Mark Out of Order" : "Mark Available"}
                                                            </>
                                                        )}
                                                    </Button>

                                                    {/* View Details Button */}
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="w-full"
                                                        onClick={() => handleViewItem(item.menuItemId)}
                                                    >
                                                        <Eye className="h-4 w-4 mr-2" />
                                                        View Details
                                                    </Button>
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

            {/* Dialog */}
            <MenuItemViewDialog
                open={viewDialogOpen}
                onOpenChange={(open) => {
                    setViewDialogOpen(open);
                    if (!open) setSelectedItemId(undefined);
                }}
                itemId={selectedItemId}
                isWaiter={false}
            />
        </Card>
    );
};
