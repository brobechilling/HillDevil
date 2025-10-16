import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus } from 'lucide-react';
import { useMenuStore } from '@/store/menuStore';
import { useAuthStore } from '@/store/authStore';
import { ManualOrderDialog } from './ManualOrderDialog';

export const MenuManagement = () => {
  const { user } = useAuthStore();
  const branchId = (user && 'branchId' in user) ? (user as any).branchId : undefined;
  const allItems = useMenuStore((state) => state.items);
  const menuItems = allItems.filter(item => item.branchId === branchId);
  const [orderDialogOpen, setOrderDialogOpen] = useState(false);

  if (!branchId) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">Branch not found</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Menu Management</CardTitle>
              <CardDescription>View menu items and create manual orders</CardDescription>
            </div>
            <Button onClick={() => setOrderDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Manual Order
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {menuItems.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No menu items available</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {menuItems.map((item) => (
                <Card key={item.id} className="border-border/50 overflow-hidden">
                  {item.imageUrl && (
                    <div className="aspect-video bg-muted">
                      <img 
                        src={item.imageUrl} 
                        alt={item.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                  <CardContent className="pt-6">
                    <div className="space-y-3">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-bold text-lg">{item.name}</h4>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {item.description}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <p className="font-bold text-lg text-primary">
                          ${item.price.toFixed(2)}
                        </p>
                        <Badge variant={item.available ? 'default' : 'destructive'}>
                          {item.available ? 'Available' : 'Unavailable'}
                        </Badge>
                      </div>

                      <p className="text-xs text-muted-foreground">
                        Category: {item.category}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
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
