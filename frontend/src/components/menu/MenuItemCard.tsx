// components/menu/MenuItemCard.tsx
'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Eye, AlertTriangle, Loader2, Sparkles } from 'lucide-react';
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
      <Card className="overflow-hidden border border-border/50 bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300">
        {/* === Image Container === */}
        <div className="relative aspect-video bg-muted/50 overflow-hidden">
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
          <div className="absolute top-3 right-3 z-10">
            <Badge
              variant={item.available ? 'default' : 'destructive'}
              className={cn(
                "text-[10px] font-medium px-2 py-0.5 transition-all",
                item.available ? "bg-green-500/10 text-green-700" : "bg-red-500/10 text-red-700"
              )}
            >
              {item.available ? 'Available' : 'Out of Order'}
            </Badge>
          </div>

          {/* === Best Seller Star === */}
          {item.bestSeller && (
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute top-3 left-3 z-10"
            >
              <div className="relative">
                <div className="absolute inset-0 blur-md bg-yellow-400 rounded-full animate-pulse opacity-75" />
                <Sparkles className="h-6 w-6 text-yellow-500 relative z-10 drop-shadow-md" />
              </div>
            </motion.div>
          )}
        </div>

        {/* === Content === */}
        <div className="p-5 space-y-4">
          {/* Name & Description */}
          <div>
            <h4 className="font-bold text-lg leading-tight line-clamp-1 group-hover:text-primary transition-colors">
              {item.name}
            </h4>
            <p className="text-sm text-muted-foreground line-clamp-2 mt-1 leading-relaxed">
              {item.description || 'No description available'}
            </p>
          </div>

          {/* Price */}
          <p className="text-2xl font-bold text-primary">
            ${Number(item.price).toFixed(2)}
          </p>

          {/* === Actions === */}
          {isWaiter ? (
            <div className="flex flex-col gap-2 pt-2">
              {/* Toggle Button */}
              <Button
                variant={item.available ? 'outline' : 'default'}
                size="sm"
                className={cn(
                  "w-full justify-center font-medium transition-all",
                  "hover:shadow-md",
                  isUpdating && "opacity-70 cursor-not-allowed"
                )}
                onClick={() => onToggleAvailability(item)}
                disabled={isUpdating}
              >
                {isUpdating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <AlertTriangle className="mr-2 h-4 w-4" />
                    {item.available ? 'Mark Out of Order' : 'Mark Available'}
                  </>
                )}
              </Button>

              {/* View Details */}
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-center font-medium hover:shadow-md transition-all"
                onClick={() => onViewDetails(item.menuItemId)}
              >
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </Button>
            </div>
          ) : (
            /* Manager: Switch */
            <div className="flex items-center justify-between pt-2">
              <span className="text-sm text-muted-foreground font-medium">Availability</span>
              <Switch
                checked={item.available}
                onCheckedChange={() => onToggleAvailability(item)}
                disabled={isUpdating}
                className={cn(
                  "data-[state=checked]:bg-green-500",
                  "transition-all",
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