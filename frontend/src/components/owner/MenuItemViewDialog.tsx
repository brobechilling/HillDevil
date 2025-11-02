// src/components/owner/MenuItemViewDialog.tsx
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Settings, Star, Tag } from 'lucide-react';
import { useMenuItem } from '@/hooks/queries/useMenuItems';
import { useCategory } from '@/hooks/queries/useCategories';
import { useCustomizations } from '@/hooks/queries/useCustomizations';
import { MenuItemCustomizationDialog } from './MenuItemCustomizationDialog';
import { cn } from '@/lib/utils';

interface MenuItemViewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  itemId?: string;
}

export const MenuItemViewDialog = ({
  open,
  onOpenChange,
  itemId,
}: MenuItemViewDialogProps) => {
  // Resolve restaurant id
  const selectedRestaurantRaw = typeof window !== 'undefined' ? localStorage.getItem('selected_restaurant') : null;
  const selectedRestaurant = selectedRestaurantRaw ? JSON.parse(selectedRestaurantRaw) : null;
  const restaurantId: string | undefined = selectedRestaurant?.restaurantId;

  const [isManageDialogOpen, setIsManageDialogOpen] = useState(false);

  // Lấy MenuItem
  const {
    data: item,
    isLoading: itemLoading,
    error: itemError,
  } = useMenuItem(itemId);

  // Lấy Category
  const {
    data: category,
    isLoading: categoryLoading,
  } = useCategory(item?.categoryId);

  // Lấy tất cả Customizations
  const {
    data: allCustomizations = [],
    isLoading: custLoading,
  } = useCustomizations(restaurantId);

  // Image URL từ BE
  const imageUrl = item?.imageUrl;

  // Map customizationIds → full objects
  const customizations = React.useMemo(() => {
    if (!item?.customizationIds) return [];
    return item.customizationIds
      .map((id) => allCustomizations.find((c) => c.customizationId === id))
      .filter(Boolean);
  }, [item?.customizationIds, allCustomizations]);

  // Không render nếu dialog đóng hoặc không có itemId
  if (!open || !itemId) return null;

  // Loading state
  if (itemLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              <Skeleton className="h-8 w-48" />
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <Skeleton className="w-full h-64 rounded-xl" />
            <div className="space-y-4">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-20 w-full" />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Error state
  if (itemError || !item) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <div className="flex flex-col items-center gap-4 py-8">
            <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
              <span className="text-2xl">⚠️</span>
            </div>
            <div className="text-center space-y-2">
              <p className="font-semibold text-foreground">Failed to load menu item</p>
              <p className="text-sm text-muted-foreground">Please try again later</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
        <DialogHeader className="pb-4 border-b">
          <DialogTitle className="text-2xl font-bold">Menu Item Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          {/* Image */}
          <div className="relative group">
            {imageUrl ? (
              <div className="w-full h-72 rounded-xl overflow-hidden bg-gradient-to-br from-muted to-muted/50 border-2 border-border/50 shadow-lg">
                <img
                  src={imageUrl}
                  alt={item.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const parent = target.parentElement;
                    if (parent) {
                      parent.innerHTML =
                        '<div class="flex items-center justify-center h-full text-muted-foreground"><div class="text-center space-y-2"><div class="w-16 h-16 rounded-lg bg-muted mx-auto flex items-center justify-center"><span class="text-2xl">📷</span></div><p class="text-sm font-medium">Unable to load image</p></div></div>';
                    }
                  }}
                />
              </div>
            ) : (
              <div className="flex items-center justify-center h-72 bg-gradient-to-br from-muted to-muted/50 rounded-xl border-2 border-dashed border-border text-muted-foreground">
                <div className="text-center space-y-3">
                  <div className="w-20 h-20 rounded-xl bg-muted mx-auto flex items-center justify-center">
                    <span className="text-4xl">🍽️</span>
                  </div>
                  <p className="text-sm font-medium">No image available</p>
                </div>
              </div>
            )}
          </div>

          {/* Details */}
          <div className="space-y-6">
            {/* Header Info */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-3 flex-wrap">
                  <h3 className="text-3xl font-bold text-foreground">{item.name}</h3>
                  {item.bestSeller && (
                    <Badge variant="default" className="gap-1.5">
                      <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                      Best Seller
                    </Badge>
                  )}
                </div>
                {categoryLoading ? (
                  <Skeleton className="h-4 w-32" />
                ) : (
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-muted-foreground" />
                    <p className="text-muted-foreground text-sm">
                      {category?.name || 'Uncategorized'}
                    </p>
                  </div>
                )}
              </div>
              <Badge 
                variant={item.status === 'ACTIVE' ? 'default' : 'secondary'}
                className="text-sm font-medium px-3 py-1.5"
              >
                {item.status === 'ACTIVE' ? 'Available' : 'Unavailable'}
              </Badge>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-2 pb-4 border-b">
              <span className="text-sm text-muted-foreground font-medium">Price</span>
              <p className="text-4xl font-bold text-primary">
                ${parseFloat(item.price).toFixed(2)}
              </p>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <h4 className="font-semibold text-lg flex items-center gap-2">
                Description
              </h4>
              <p className="text-muted-foreground leading-relaxed bg-muted/50 p-4 rounded-lg border">
                {item.description || 'No description available for this item.'}
              </p>
            </div>

            {/* Customizations */}
            {item.hasCustomization && (
              <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-lg flex items-center gap-2">
                    Customizations
                  </h4>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setIsManageDialogOpen(true)}
                    className="shadow-sm hover:shadow-md transition-all hover:scale-105"
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    Manage
                  </Button>
                </div>
                {custLoading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-16 w-full rounded-lg" />
                    <Skeleton className="h-16 w-full rounded-lg" />
                  </div>
                ) : customizations.length > 0 ? (
                  <div className="space-y-2">
                    {customizations.map((cust, index) => (
                      <div
                        key={cust.customizationId}
                        className={cn(
                          "border rounded-lg p-4 flex justify-between items-center",
                          "bg-card hover:bg-muted/50 transition-colors duration-200",
                          "animate-in fade-in slide-in-from-left-2 duration-300"
                        )}
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <span className="font-medium text-foreground">{cust.name}</span>
                        <Badge variant="secondary" className="font-mono">
                          {parseFloat(cust.price) > 0 ? `+$${parseFloat(cust.price).toFixed(2)}` : 'Free'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="border-2 border-dashed rounded-lg p-8 text-center bg-muted/30">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Settings className="h-6 w-6 text-primary" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-foreground">No customizations assigned</p>
                        <p className="text-xs text-muted-foreground">Click "Manage" to add customization options</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </DialogContent>

      {/* Manage Customizations Dialog */}
      {itemId && restaurantId && (
        <MenuItemCustomizationDialog
          open={isManageDialogOpen}
          onOpenChange={setIsManageDialogOpen}
          menuItemId={itemId}
          restaurantId={restaurantId}
        />
      )}
    </Dialog>
  );
};
