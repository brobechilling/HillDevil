import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { MenuItem } from '@/store/menuStore';

interface MenuItemViewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item?: MenuItem;
}

export const MenuItemViewDialog = ({
  open,
  onOpenChange,
  item,
}: MenuItemViewDialogProps) => {
  if (!item) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Menu Item Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {item.imageUrl && (
            <div className="w-full h-64 rounded-lg overflow-hidden bg-muted border">
              <img
                src={item.imageUrl}
                alt={item.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const parent = target.parentElement;
                  if (parent) {
                    parent.innerHTML = '<div class="flex items-center justify-center h-full text-muted-foreground"><span>Unable to load image</span></div>';
                  }
                }}
              />
            </div>
          )}

          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-2xl font-bold">{item.name}</h3>
                <p className="text-muted-foreground mt-1">{item.category}</p>
              </div>
              <Badge variant={item.available ? 'default' : 'secondary'}>
                {item.available ? 'Available' : 'Unavailable'}
              </Badge>
            </div>

            <div className="pt-2">
              <p className="text-3xl font-bold text-primary">${item.price.toFixed(2)}</p>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Description</h4>
              <p className="text-muted-foreground">{item.description}</p>
            </div>

            {item.customizations && item.customizations.length > 0 && (
              <div>
                <h4 className="font-semibold mb-3">Customizations</h4>
                <div className="space-y-3">
                  {item.customizations.map((custom) => (
                    <div key={custom.id} className="border rounded-lg p-3 flex justify-between">
                      <span className="font-medium">{custom.name}</span>
                      <span className="text-muted-foreground">+${custom.price.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
