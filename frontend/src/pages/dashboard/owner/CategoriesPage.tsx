import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Settings } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useMenuStore } from '@/store/menuStore';
import { useMenuCustomizationStore } from '@/store/customizationStore';
import { CategoryManagementDialog } from '@/components/owner/CategoryManagementDialog';

const DEFAULT_CATEGORIES = [
  'Appetizers',
  'Soups & Salads',
  'Main Course',
  'Seafood',
  'Grills',
  'Pasta & Noodles',
  'Desserts',
  'Beverages',
  'Cocktails',
  'Milk Tea',
  'Coffee',
];

export default function CategoriesPage() {
  const { user } = useAuthStore();
  const branchId = user?.branchId || '1';
  const { items } = useMenuStore();
  const { getCategoryCustomizations } = useMenuCustomizationStore();
  
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const branchItems = items.filter((item) => item.branchId === branchId && !item.isCustomizationCategory);

  // Get categories that are actually used in the menu
  const usedCategories = Array.from(new Set(branchItems.map((item) => item.category)));
  const allCategories = Array.from(new Set([...DEFAULT_CATEGORIES, ...usedCategories]));

  const handleManageCategory = (categoryName: string) => {
    setSelectedCategory(categoryName);
    setDialogOpen(true);
  };

  const getCategoryItemCount = (categoryName: string) => {
    return branchItems.filter((item) => item.category === categoryName).length;
  };

  const getCategoryCustomizationCount = (categoryName: string) => {
    return getCategoryCustomizations(categoryName, branchId).length;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Category Management</h1>
        <p className="text-muted-foreground mt-2">
          Manage customizations for each menu category
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {allCategories.map((category) => {
          const itemCount = getCategoryItemCount(category);
          const customizationCount = getCategoryCustomizationCount(category);

          return (
            <Card key={category}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{category}</CardTitle>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleManageCategory(category)}
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                </div>
                <CardDescription>
                  {itemCount} menu {itemCount === 1 ? 'item' : 'items'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">
                    {customizationCount} customization{customizationCount !== 1 ? 's' : ''}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {selectedCategory && (
        <CategoryManagementDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          categoryName={selectedCategory}
          branchId={branchId}
        />
      )}
    </div>
  );
}
