// components/menu/MenuItemCard.tsx
'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Eye, AlertTriangle, Loader2, Sparkles, CheckCircle2, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { BranchMenuItemDTO } from '@/dto/branchMenuItem.dto';
import { useState } from 'react';
import { motion } from 'framer-motion';

interface MenuItemCardProps {
  item: BranchMenuItemDTO;
  isWaiter?: boolean;
  isUpdating?: boolean;
  onToggleAvailability: (item: BranchMenuItemDTO) => void;
  onViewDetails: (itemId: string) => void;
}

export const MenuItemCard = ({
  item,
  isWaiter = false,
  isUpdating = false,
  onToggleAvailability,
  onViewDetails,
}: MenuItemCardProps) => {
  const [imageError, setImageError] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -4 }}
      className="group"
    >
      <Card className="overflow-hidden border border-border/50 bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60 rounded-xl shadow-sm hover:shadow-md transition-all duration-300">
        {/* === Image Container === */}
        <div className="relative aspect-[4/3] bg-muted/50 overflow-hidden">
          {item.imageUrl && !imageError ? (
            <>
              {/* Skeleton */}
              <div className="absolute inset-0 bg-gradient-to-br from-muted/50 to-muted animate-pulse" />
              <img
                src={item.imageUrl}
                alt={item.name}
                className={cn(
                  "w-full h-full object-cover transition-all duration-500 group-hover:scale-110",
                  "opacity-0 group-hover:opacity-100"
                )}
                onLoad={(e) => {
                  e.currentTarget.style.opacity = '1';
                  e.currentTarget.previousElementSibling?.remove();
                }}
                onError={(e) => {
                  setImageError(true);
                  e.currentTarget.style.display = 'none';
                }}
              />
            </>
          ) : (
            <div className="flex h-full items-center justify-center">
              <div className="text-center space-y-2">
                <div className="mx-auto h-12 w-12 rounded-lg bg-muted-foreground/10 flex items-center justify-center">
                  <Sparkles className="h-6 w-6 text-muted-foreground/50" />
                </div>
                <p className="text-xs text-muted-foreground">No image</p>
              </div>
            </div>
          )}

          {/* === Status Badge (Top Right) === */}
          <div className="absolute top-2 right-2 z-10">
            <Badge
              variant={item.available ? 'default' : 'destructive'}
              className={cn(
                "text-[9px] font-medium px-1.5 py-0.5 transition-all",
                item.available ? "bg-green-500/90 text-white border border-green-400" : "bg-red-500/90 text-white border border-red-400"
              )}
            >
              {item.available ? 'Available' : 'Out of Order'}
            </Badge>
          </div>

          {/* === Best Seller Star === */}
          {item.bestSeller && (
            <motion.div
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute top-2 left-2 z-10"
            >
              <div className="relative">
                <div className="absolute inset-0 blur-sm bg-yellow-400 rounded-full animate-pulse opacity-75" />
                <Sparkles className="h-5 w-5 text-yellow-500 relative z-10 drop-shadow-md" />
              </div>
            </motion.div>
          )}
        </div>

        {/* === Content === */}
        <div className="p-3 space-y-2.5">
          {/* Name & Description */}
          <div>
            <h4 className="font-semibold text-base leading-tight line-clamp-1 group-hover:text-primary transition-colors">
              {item.name}
            </h4>
            <p className="text-xs text-muted-foreground line-clamp-2 mt-1 leading-relaxed">
              {item.description || 'No description available'}
            </p>
          </div>

          {/* Price */}
          <p className="text-base font-bold text-primary">
            ${Number(item.price).toFixed(2)}
          </p>

          {/* === Actions === */}
          {isWaiter ? (
            <div className="flex flex-col gap-1.5 pt-1">
              {/* Toggle Button - Made more prominent */}
              <Button
                variant={item.available ? 'default' : 'destructive'}
                size="sm"
                className={cn(
                  "w-full justify-center font-semibold text-sm transition-all h-9",
                  item.available 
                    ? "bg-green-600 hover:bg-green-700 text-white shadow-md hover:shadow-lg border-2 border-green-500" 
                    : "bg-red-600 hover:bg-red-700 text-white shadow-md hover:shadow-lg border-2 border-red-500",
                  isUpdating && "opacity-70 cursor-not-allowed"
                )}
                onClick={() => onToggleAvailability(item)}
                disabled={isUpdating}
              >
                {isUpdating ? (
                  <>
                    <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                    <span className="text-xs">Updating...</span>
                  </>
                ) : item.available ? (
                  <>
                    <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
                    <span>Available</span>
                  </>
                ) : (
                  <>
                    <XCircle className="mr-1.5 h-3.5 w-3.5" />
                    <span>Out of Order</span>
                  </>
                )}
              </Button>

              {/* View Details */}
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-center font-medium hover:shadow-sm transition-all text-xs h-8"
                onClick={() => onViewDetails(item.menuItemId)}
              >
                <Eye className="mr-1.5 h-3 w-3" />
                View Details
              </Button>
            </div>
          ) : (
            /* Manager: Switch */
            <div className="flex items-center justify-between pt-1">
              <span className="text-xs text-muted-foreground font-medium">Availability</span>
              <Switch
                checked={item.available}
                onCheckedChange={() => onToggleAvailability(item)}
                disabled={isUpdating}
                className={cn(
                  "data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500",
                  "transition-all shadow-md",
                  isUpdating && "opacity-50"
                )}
              />
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  );
};