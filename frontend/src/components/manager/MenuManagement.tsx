import { useMemo, useState } from "react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { MenuItemCard } from '@/components/menu/MenuItemCard';

import { useSessionStore } from "@/store/sessionStore";
import { isStaffAccountDTO } from "@/utils/typeCast";
import { useRestaurantByBranch } from "@/hooks/queries/useBranches";
import { useBranchMenuItems, useUpdateAvailability } from "@/hooks/queries/useBranchMenuItems";
import { useCategories } from "@/hooks/queries/useCategories";
import { BranchMenuItemDTO } from "@/dto/branchMenuItem.dto";
import { MenuItemViewDialog } from "@/components/menu/MenuItemViewDialog";

interface MenuManagementProps {
    branchId?: string;
}

export const MenuManagement = ({ branchId: branchIdProp }: MenuManagementProps = {}) => {
    const { user } = useSessionStore();
    // Fallback to user.branchId if branchId prop is not provided (for backward compatibility)
    const branchIdFromUser = isStaffAccountDTO(user) ? user.branchId : undefined;
    // Use branchIdProp if provided (even if empty string), otherwise fallback to user.branchId
    const branchId = branchIdProp !== undefined ? branchIdProp : branchIdFromUser;

    // Check if branchId is missing or empty
    const isBranchIdMissing = !branchId || (typeof branchId === 'string' && branchId.trim() === "");

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

    // === BranchId Missing ===
    if (isBranchIdMissing) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Menu Management</CardTitle>
                    <CardDescription>Manage menu item availability</CardDescription>
                </CardHeader>
                <CardContent className="text-center py-16">
                    <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-lg font-medium">Branch ID is missing</p>
                    <p className="text-sm text-muted-foreground mt-1">
                        Please navigate from a valid branch context.
                    </p>
                </CardContent>
            </Card>
        );
    }

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
            <CardHeader className="pb-4">
                <CardTitle className="text-xl">Menu Management</CardTitle>
                <CardDescription className="text-sm">Manage item availability for this branch</CardDescription>
                <div className="mt-3 flex justify-between items-center gap-3">
                    <div className="flex-1 text-center">
                        <p className="text-xl font-bold">{menuItems.length}</p>
                        <p className="text-xs text-muted-foreground">Total Items</p>
                    </div>
                    <div className="flex-1 text-center">
                        <p className="text-xl font-bold">
                            {menuItems.filter(item => item.bestSeller).length}
                        </p>
                        <p className="text-xs text-muted-foreground">Best Sellers</p>
                    </div>
                    <div className="flex-1 text-center">
                        <p className="text-xl font-bold">
                            {menuItems.filter(item => item.available).length}/{menuItems.length}
                        </p>
                        <p className="text-xs text-muted-foreground">Available</p>
                    </div>
                </div>
            </CardHeader>

            <CardContent>
                <div className="space-y-6">
                    {sortedCategories.map((categoryName) => {
                        const items = groupedItems[categoryName];
                        return (
                            <section key={categoryName} className="space-y-3">
                                <div className="flex items-center justify-between pb-2 border-b border-border/50">
                                    <div className="flex items-center gap-2">
                                        <div className="w-1 h-5 bg-primary rounded-full"></div>
                                        <h3 className="text-lg font-bold">{categoryName}</h3>
                                        <Badge variant="secondary" className="text-xs">
                                            {items.length} {items.length > 1 ? "items" : "item"}
                                        </Badge>
                                    </div>
                                </div>

                                <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                                    {items.map((item) => (
                                        <MenuItemCard
                                            key={item.menuItemId}
                                            item={item}
                                            isWaiter={true}
                                            isUpdating={
                                                updateAvailability.isPending &&
                                                updateAvailability.variables?.menuItemId === item.menuItemId
                                            }
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
