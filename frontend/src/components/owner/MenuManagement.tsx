import { useState, useRef } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Eye, ChevronRight, Settings } from 'lucide-react';
import { MenuItemDialog } from './MenuItemDialog';
import { MenuItemViewDialog } from './MenuItemViewDialog';
import { CategoryManagementDialog } from '@/components/owner/CategoryManagementDialog';
import { toast } from '@/hooks/use-toast';
import { useSessionStore } from '@/store/sessionStore';
import { useMenuItems, useDeleteMenuItem } from '@/hooks/queries/useMenuItems';
import { useCategories } from '@/hooks/queries/useCategories';
import { MenuItemDTO } from '@/dto/menuItem.dto';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface MenuManagementProps {
  branchId: string;
}

export const MenuManagement = ({ branchId }: MenuManagementProps) => {
  const { isLoading: isSessionLoading, initialize } = useSessionStore();

  // Resolve restaurant id
  const selectedRestaurantRaw = typeof window !== 'undefined' ? localStorage.getItem('selected_restaurant') : null;
  const selectedRestaurant = selectedRestaurantRaw ? JSON.parse(selectedRestaurantRaw) : null;
  const restaurantId: string | undefined = selectedRestaurant?.restaurantId;

  // === Menu data via React Query ===
  const { data: items = [], isLoading: isItemsLoading } = useMenuItems();
  const { data: categories = [] } = useCategories();
  const deleteMutation = useDeleteMenuItem();

  // === UI State ===
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MenuItemDTO | undefined>();
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('');

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // === Loading state ===
  if (isSessionLoading || isItemsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] w-full">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Loading...</CardTitle>
            <CardDescription>Please wait while we load your session</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  // === Handlers ===
  const handleEdit = (item: MenuItemDTO) => {
    setSelectedItem(item);
    setIsDialogOpen(true);
  };

  const handleView = (item: MenuItemDTO) => {
    setSelectedItem(item);
    setIsViewDialogOpen(true);
  };

  const handleAdd = () => {
    setSelectedItem(undefined);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id, {
      onSuccess: () => {
        setItemToDelete(null);
        toast({
          title: 'Menu Item Deleted',
          description: 'The menu item has been removed.',
        });
      },
    });
  };

  const handleManageCategory = (categoryId: string) => {
    setSelectedCategoryId(categoryId);
    setIsCategoryDialogOpen(true);
  };

  const scrollToCategory = (category: string) => {
    setActiveCategory(category);
    const container = scrollContainerRef.current;
    const section = document.getElementById(`category-${category}`);
    if (container && section) {
      container.scrollTo({
        top: section.offsetTop - 20,
        behavior: 'smooth',
      });
    }
  };

  // === Group items by category label ===
  const categoryIdToLabel = new Map<string, string>(
    (categories || []).map((c) => [c.categoryId, c.name])
  );
  const groupedItems = (items || []).reduce((acc, item) => {
    const label = categoryIdToLabel.get(item.categoryId) || 'Uncategorized';
    if (!acc[label]) acc[label] = [] as MenuItemDTO[];
    (acc[label] as MenuItemDTO[]).push(item);
    return acc;
  }, {} as Record<string, MenuItemDTO[]>);

  const sidebarCategories = categories || [];

  const getCategoryCustomizationCount = (categoryId: string) => {
    const cat = (categories || []).find((c) => c.categoryId === categoryId);
    return cat?.customizationIds?.length || 0;
  };

  return (
    <div className="flex gap-6">
      {/* === MAIN CONTENT: MENU ITEMS === */}
      <div className="flex-1">
        <div
          ref={scrollContainerRef}
          className="max-w-6xl mx-auto px-10 pt-10 pb-16 overflow-y-auto h-[calc(100vh-120px)] scroll-smooth"
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Menu Management</h1>
              <p className="text-muted-foreground">
                Manage your restaurant&apos;s menu items and categories
              </p>
            </div>
            <Button onClick={handleAdd} className="shadow-sm">
              <Plus className="mr-2 h-4 w-4" />
              Add Menu Item
            </Button>
          </div>

          {Object.keys(groupedItems).length === 0 ? (
            <div className="text-center py-20 border rounded-xl bg-muted/30">
              <p className="text-muted-foreground">
                No menu items yet. Add your first item!
              </p>
            </div>
          ) : (
            <div className="space-y-16">
              {Object.entries(groupedItems).map(([category, categoryItems]) => (
                <section
                  key={category}
                  id={`category-${category}`}
                  className="scroll-mt-24"
                >
                  <div className="flex items-center justify-between mb-5">
                    <h2 className="text-xl font-semibold text-primary">{category}</h2>
                    <Badge variant="outline">
                      {categoryItems.length} {categoryItems.length === 1 ? 'item' : 'items'}
                    </Badge>
                  </div>

                  <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                    {categoryItems.map((item, index) => (
                      <Card
                        key={item.menuItemId}
                        className="relative border border-border/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 flex flex-col h-[360px] overflow-hidden"
                      >
                        {/* Hình ảnh */}
                        <div className="aspect-video bg-muted overflow-hidden">
                          {(item as any).imageUrl ? (
                            <img
                              src={(item as any).imageUrl}
                              alt={item.name}
                              className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = "none";
                              }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
                              No image
                            </div>
                          )}
                        </div>

                        {/* Nội dung */}
                        <CardContent className="flex flex-col justify-between flex-1 p-4">
                          <div className="space-y-3">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-bold text-lg leading-tight">{item.name}</h4>
                                <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                                  {item.description || "No description"}
                                </p>
                              </div>
                              <Badge
                                variant={item.status === "ACTIVE" ? "default" : "secondary"}
                              >
                                {item.status === "ACTIVE" ? "Available" : "Unavailable"}
                              </Badge>
                            </div>

                            <p className="text-xl font-semibold text-primary">
                              ${parseFloat(item.price).toFixed(2)}
                            </p>
                          </div>
                        </CardContent>

                        {/* ✅ Toolbar: luôn nằm dưới, không đè nội dung */}
                        <div className="flex justify-end gap-1 bg-background/90 backdrop-blur-sm border-t border-border/40 p-2">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleView(item)}
                            aria-label="View"
                            className="h-8 w-8 hover:bg-accent"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleEdit(item)}
                            aria-label="Edit"
                            className="h-8 w-8 hover:bg-accent"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => setItemToDelete(item.menuItemId)}
                            aria-label="Delete"
                            className="h-8 w-8 hover:bg-destructive/10 text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* === SIDEBAR: CATEGORIES === */}
      <aside className="hidden xl:block w-80 sticky top-24 h-fit">
        <Card className="shadow-lg border">
          <CardHeader className="pb-3 bg-background">
            <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
              <span className="w-1 h-6 bg-primary rounded-full"></span>
              Categories
            </CardTitle>
            <CardDescription className="text-xs">
              Click to view or manage customizations
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            {sidebarCategories.length > 0 ? (
              <div className="space-y-1">
                {sidebarCategories.map((cat) => {
                  const label = cat.name;
                  const itemCount = groupedItems[label]?.length || 0;
                  const customizationCount = getCategoryCustomizationCount(cat.categoryId);
                  const isActive = activeCategory === label;

                  return (
                    <div key={cat.categoryId} className="relative group">
                      <div
                        role="button"
                        tabIndex={0}
                        onClick={() => scrollToCategory(label)}
                        onKeyDown={(e) => e.key === 'Enter' && scrollToCategory(label)}
                        className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 flex items-center justify-between cursor-pointer
                          ${isActive
                            ? 'bg-primary text-primary-foreground shadow-md scale-105'
                            : 'hover:bg-muted hover:translate-x-1'
                          }`}
                      >
                        <div className="flex flex-col gap-0.5 flex-1">
                          <span
                            className={`font-medium ${isActive ? 'text-primary-foreground' : 'text-foreground'
                              }`}
                          >
                            {label}
                          </span>
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-xs ${isActive ? 'text-primary-foreground/80' : 'text-muted-foreground'
                                }`}
                            >
                              {itemCount} {itemCount === 1 ? 'item' : 'items'}
                            </span>
                            {customizationCount > 0 && (
                              <Badge variant="secondary" className="text-xs h-5 px-1.5">
                                {customizationCount} custom
                              </Badge>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            className={`h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity ${isActive ? 'text-primary-foreground hover:bg-primary-foreground/20' : ''
                              }`}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleManageCategory(cat.categoryId);
                            }}
                          >
                            <Settings className="h-3.5 w-3.5" />
                          </Button>
                          <ChevronRight
                            className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform"
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground italic text-center py-4">
                No categories yet
              </p>
            )}
          </CardContent>
        </Card>
      </aside>

      <MenuItemDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        branchId={branchId}
        restaurantId={restaurantId!}
        item={selectedItem}
      />
      <MenuItemViewDialog
        open={isViewDialogOpen}
        onOpenChange={setIsViewDialogOpen}
        itemId={selectedItem?.menuItemId}
      />
      {selectedCategoryId && restaurantId && (
        <CategoryManagementDialog
          open={isCategoryDialogOpen}
          onOpenChange={setIsCategoryDialogOpen}
          categoryId={selectedCategoryId}
          restaurantId={restaurantId}
        />
      )}

      {/* === DELETE CONFIRM === */}
      <AlertDialog open={!!itemToDelete} onOpenChange={() => setItemToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Menu Item</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this menu item? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => itemToDelete && handleDelete(itemToDelete)}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};