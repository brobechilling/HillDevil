// src/components/owner/MenuItemViewDialog.tsx
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useMenuItem } from '@/hooks/queries/useMenuItems';
import { useCategory } from '@/hooks/queries/useCategories';
import { useCustomizations } from '@/hooks/queries/useCustomizations';

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
  } = useCustomizations();

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
            <Skeleton className="w-full h-64 rounded-lg" />
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
          <p className="text-destructive">Failed to load menu item.</p>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Menu Item Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Image */}
          {imageUrl ? (
            <div className="w-full h-64 rounded-lg overflow-hidden bg-muted border">
              <img
                src={imageUrl}
                alt={item.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const parent = target.parentElement;
                  if (parent) {
                    parent.innerHTML =
                      '<div class="flex items-center justify-center h-full text-muted-foreground"><span>Unable to load image</span></div>';
                  }
                }}
              />
            </div>
          ) : (
            <div className="flex items-center justify-center h-64 bg-muted rounded-lg text-muted-foreground border">
              No image available
            </div>
          )}

          {/* Details */}
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-2xl font-bold">{item.name}</h3>

                {/* Category Name */}
                {categoryLoading ? (
                  <Skeleton className="h-4 w-32 mt-1" />
                ) : (
                  <p className="text-muted-foreground mt-1">
                    {category?.name || 'Uncategorized'}
                  </p>
                )}
              </div>

              {/* Status Badge */}
              <Badge variant={item.status === 'ACTIVE' ? 'default' : 'secondary'}>
                {item.status === 'ACTIVE' ? 'Available' : 'Unavailable'}
              </Badge>
            </div>

            {/* Price */}
            <div className="pt-2">
              <p className="text-3xl font-bold text-primary">
                ${parseFloat(item.price).toFixed(2)}
              </p>
            </div>

            {/* Description */}
            <div>
              <h4 className="font-semibold mb-2">Description</h4>
              <p className="text-muted-foreground">{item.description}</p>
            </div>

            {/* Customizations */}
            {custLoading ? (
              <div>
                <h4 className="font-semibold mb-3">Customizations</h4>
                <Skeleton className="h-20 w-full" />
              </div>
            ) : customizations.length > 0 ? (
              <div>
                <h4 className="font-semibold mb-3">Customizations</h4>
                <div className="space-y-3">
                  {customizations.map((cust) => (
                    <div
                      key={cust.customizationId}
                      className="border rounded-lg p-3 flex justify-between items-center"
                    >
                      <span className="font-medium">{cust.name}</span>
                      <span className="text-muted-foreground">
                        +${parseFloat(cust.price).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {/* Best Seller */}
            {item.bestSeller && (
              <div className="flex items-center gap-2">
                <Badge variant="outline">Best Seller</Badge>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
