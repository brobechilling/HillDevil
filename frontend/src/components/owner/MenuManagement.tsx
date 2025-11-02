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
import { Plus, Edit, Trash2, Eye, ChevronRight, Sparkles } from 'lucide-react';
import { MenuItemDialog } from './MenuItemDialog';
import { MenuItemViewDialog } from './MenuItemViewDialog';
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
import { cn } from '@/lib/utils';

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
  const { data: items = [], isLoading: isItemsLoading } = useMenuItems(restaurantId);
  const { data: categories = [] } = useCategories(restaurantId);
  const deleteMutation = useDeleteMenuItem();

  // === UI State ===
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MenuItemDTO | undefined>();
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('');

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // === Loading state ===
  if (isSessionLoading || isItemsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] w-full">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-primary/20 rounded-full"></div>
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
          </div>
          <p className="text-sm text-muted-foreground animate-pulse">Loading menu...</p>
        </div>
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
    // Reset active category after scroll animation
    setTimeout(() => setActiveCategory(''), 2000);
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
    <div className="flex gap-6 animate-in fade-in duration-300">
      {/* === MAIN CONTENT: MENU ITEMS === */}
      <div className="flex-1">
        <div
          ref={scrollContainerRef}
          className="max-w-6xl mx-auto px-6 lg:px-10 pt-8 pb-16 overflow-y-auto h-[calc(100vh-120px)] scroll-smooth"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-8 animate-in slide-in-from-top-4 duration-500">
            <div className="space-y-1">
              <h1 className="text-3xl font-bold text-foreground tracking-tight">Menu Management</h1>
              <p className="text-muted-foreground text-sm">
                Manage your restaurant&apos;s menu items and categories
              </p>
            </div>
            <Button
              onClick={handleAdd}
              className="shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              size="lg"
            >
              <Plus className="mr-2 h-5 w-5" />
              Add Menu Item
            </Button>
          </div>

          {Object.keys(groupedItems).length === 0 ? (
            <div className="text-center py-20 border-2 border-dashed rounded-2xl bg-muted/30 animate-in fade-in duration-500">
              <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <Sparkles className="h-8 w-8 text-primary" />
                </div>
                <div className="space-y-2">
                  <p className="font-semibold text-lg text-foreground">No menu items yet</p>
                  <p className="text-muted-foreground text-sm max-w-sm">
                    Get started by adding your first menu item to showcase your delicious offerings
                  </p>
                </div>
                <Button onClick={handleAdd} className="mt-4">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Your First Item
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-20">
              {Object.entries(groupedItems).map(([category, categoryItems], categoryIndex) => (
                <section
                  key={category}
                  id={`category-${category}`}
                  className="scroll-mt-24 animate-in fade-in slide-in-from-bottom-4 duration-500"
                  style={{ animationDelay: `${categoryIndex * 100}ms` }}
                >
                  {/* Category Header */}
                  <div className="flex items-center justify-between mb-6 pb-3 border-b">
                    <div className="flex items-center gap-3">
                      <div className="w-1 h-8 bg-gradient-to-b from-primary to-primary/50 rounded-full"></div>
                      <div>
                        <h2 className="text-2xl font-bold text-foreground tracking-tight">{category}</h2>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {categoryItems.length} {categoryItems.length === 1 ? 'item' : 'items'} in this category
                        </p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="text-sm font-medium px-3 py-1">
                      {categoryItems.length}
                    </Badge>
                  </div>

                  {/* Menu Items Grid */}
                  <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                    {categoryItems.map((item, index) => (
                      <Card
                        key={item.menuItemId}
                        className={cn(
                          "group relative border border-border/40 bg-card rounded-xl",
                          "hover:shadow-lg hover:shadow-primary/5 transition-all duration-300",
                          "hover:-translate-y-1 hover:border-primary/30",
                          "flex flex-col h-[380px] overflow-hidden cursor-pointer"
                        )}
                      >
                        {/* === IMAGE CONTAINER === */}
                        <div className="relative aspect-video bg-muted/50 overflow-hidden">
                          {(item as any).imageUrl ? (
                            <img
                              src={(item as any).imageUrl}
                              alt={item.name}
                              className="w-full h-full object-cover transition-opacity duration-300 group-hover:opacity-90"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = "none";
                              }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <div className="text-center space-y-1">
                                <div className="w-10 h-10 rounded-lg bg-muted-foreground/10 mx-auto flex items-center justify-center">
                                  <Sparkles className="h-5 w-5 text-muted-foreground" />
                                </div>
                                <p className="text-xs text-muted-foreground">No image</p>
                              </div>
                            </div>
                          )}

                          {/* === BEST SELLER ICON (Chỉ ngôi sao, góc trên phải) === */}
                          {item.bestSeller && (
                            <div className="absolute top-2 right-2 z-10">
                              <div className="w-8 h-8 rounded-full bg-yellow-400/90 backdrop-blur-sm flex items-center justify-center shadow-md animate-pulse">
                                <Sparkles className="h-4 w-4 text-white" />
                              </div>
                            </div>
                          )}

                          {/* === STATUS BADGE (góc trên trái) === */}
                          <div className="absolute top-2 left-2 z-10">
                            <Badge
                              variant={item.status === "ACTIVE" ? "default" : "secondary"}
                              className="text-[10px] px-2 py-0.5 backdrop-blur-sm bg-background/80"
                            >
                              {item.status === "ACTIVE" ? "Available" : "Unavailable"}
                            </Badge>
                          </div>
                        </div>

                        {/* === CONTENT === */}
                        <CardContent className="flex flex-col justify-between flex-1 p-5 space-y-3">
                          <div>
                            <h4 className="font-bold text-lg leading-tight line-clamp-2 group-hover:text-primary transition-colors duration-200">
                              {item.name}
                            </h4>
                            <p className="text-sm text-muted-foreground line-clamp-2 mt-1 leading-relaxed">
                              {item.description || "No description"}
                            </p>
                          </div>

                          <div className="flex items-center justify-between">
                            <p className="text-2xl font-bold text-primary">
                              ${parseFloat(item.price).toFixed(2)}
                            </p>
                          </div>
                        </CardContent>

                        {/* === ACTION BUTTONS (hiện khi hover) === */}
                        <div className="absolute inset-x-0 bottom-0 flex justify-end gap-1 bg-gradient-to-t from-background/95 to-background/70 backdrop-blur-sm border-t border-border/30 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={(e) => { e.stopPropagation(); handleView(item); }}
                            className="h-8 w-8 hover:bg-primary/10"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={(e) => { e.stopPropagation(); handleEdit(item); }}
                            className="h-8 w-8 hover:bg-primary/10"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={(e) => { e.stopPropagation(); setItemToDelete(item.menuItemId); }}
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
      <aside className="hidden xl:block w-80 sticky top-24 h-fit animate-in slide-in-from-right-4 duration-500">
        <Card className="shadow-xl border bg-card/50 backdrop-blur-sm">
          <CardHeader className="pb-4 bg-gradient-to-br from-primary/5 to-transparent border-b">
            <CardTitle className="text-xl font-bold text-foreground flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <ChevronRight className="h-4 w-4 text-primary rotate-90" />
              </div>
              Categories
            </CardTitle>
            <CardDescription className="text-xs mt-1">
              Navigate through menu categories
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            {sidebarCategories.length > 0 ? (
              <div className="space-y-2">
                {sidebarCategories.map((cat, index) => {
                  const label = cat.name;
                  const itemCount = groupedItems[label]?.length || 0;
                  const customizationCount = getCategoryCustomizationCount(cat.categoryId);
                  const isActive = activeCategory === label;

                  return (
                    <div
                      key={cat.categoryId}
                      className="relative animate-in fade-in slide-in-from-right-4 duration-300"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <button
                        onClick={() => scrollToCategory(label)}
                        className={cn(
                          "w-full text-left px-4 py-3 rounded-xl transition-all duration-300",
                          "flex items-center justify-between cursor-pointer group",
                          "border border-transparent",
                          isActive
                            ? "bg-primary text-primary-foreground shadow-lg scale-[1.02] border-primary/20"
                            : "hover:bg-muted/50 hover:border-border hover:shadow-md hover:translate-x-1"
                        )}
                      >
                        <div className="flex flex-col gap-1 flex-1 min-w-0">
                          <span className={cn(
                            "font-semibold text-sm truncate transition-colors",
                            isActive ? "text-primary-foreground" : "text-foreground"
                          )}>
                            {label}
                          </span>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={cn(
                              "text-xs font-medium",
                              isActive ? "text-primary-foreground/80" : "text-muted-foreground"
                            )}>
                              {itemCount} {itemCount === 1 ? 'item' : 'items'}
                            </span>
                            {customizationCount > 0 && (
                              <Badge
                                variant={isActive ? "secondary" : "outline"}
                                className="text-[10px] h-4 px-1.5 font-medium"
                              >
                                {customizationCount} custom
                              </Badge>
                            )}
                          </div>
                        </div>
                        <ChevronRight
                          className={cn(
                            "h-4 w-4 flex-shrink-0 transition-all duration-300",
                            isActive
                              ? "text-primary-foreground translate-x-1"
                              : "text-muted-foreground group-hover:text-foreground group-hover:translate-x-1"
                          )}
                        />
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-12 h-12 rounded-full bg-muted mx-auto mb-3 flex items-center justify-center">
                  <ChevronRight className="h-6 w-6 text-muted-foreground rotate-90" />
                </div>
                <p className="text-sm text-muted-foreground font-medium">No categories yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </aside>

      {/* Dialogs */}
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

      {/* Delete Confirmation */}
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
            <AlertDialogAction
              onClick={() => itemToDelete && handleDelete(itemToDelete)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};