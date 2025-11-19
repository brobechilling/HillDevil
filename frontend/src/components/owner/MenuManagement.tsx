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
import { Plus, Edit, Trash2, Eye, ChevronRight, Sparkles, Menu, X, AlertCircle } from 'lucide-react';
import { MenuItemDialog } from '../menu/MenuItemDialog';
import { MenuItemViewDialog } from '../menu/MenuItemViewDialog';
import { toast } from '@/components/ui/use-toast';
import { useSessionStore } from '@/store/sessionStore';
import { useMenuItems, useDeleteMenuItem, useSetActiveStatus, useUpdateBestSeller, useCanCreateMenuItem } from '@/hooks/queries/useMenuItems';
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
import { Switch } from '@/components/ui/switch';

// === Custom Components ===

const StatusSwitch = ({ checked, onChange, disabled }: { checked: boolean; onChange: (checked: boolean) => void; disabled?: boolean }) => {
  return (
    <div className="flex items-center gap-2">
      <Switch
        checked={checked}
        onCheckedChange={onChange}
        disabled={disabled}
        className="data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-gray-300"
      />
      <span className={cn(
        "text-xs font-medium transition-colors",
        checked ? "text-green-600" : "text-gray-500"
      )}>
        {checked ? "Available" : "Unavailable"}
      </span>
      {disabled && (
        <div className="h-3 w-3 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      )}
    </div>
  );
};

const BestSellerToggle = ({ isBestSeller, onToggle, disabled }: {
  isBestSeller: boolean;
  onToggle: () => void;
  disabled?: boolean;
}) => {
  return (
    <button
      onClick={onToggle}
      disabled={disabled}
      className={cn(
        "relative p-2 rounded-lg transition-all duration-300 group",
        disabled ? "opacity-50 cursor-not-allowed" : "hover:scale-110 cursor-pointer"
      )}
    >
      <div className="relative">
        <div className={cn(
          "absolute inset-0 rounded-lg blur-md transition-opacity duration-300",
          isBestSeller ? "bg-yellow-400 opacity-60" : "opacity-0"
        )} />
        {isBestSeller ? (
          <Sparkles className="h-5 w-5 text-yellow-500 relative z-10 animate-pulse" />
        ) : (
          <Sparkles className="h-5 w-5 text-gray-300 group-hover:text-yellow-400 transition-colors" />
        )}
      </div>
      <span className={cn(
        "absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] font-medium opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap",
        isBestSeller ? "text-yellow-600" : "text-muted-foreground"
      )}>
        {isBestSeller ? "Best Seller" : "Set Best Seller"}
      </span>
    </button>
  );
};

// === Main Component ===
interface MenuManagementProps {
  branchId: string;
}

export const MenuManagement = ({ branchId }: MenuManagementProps) => {
  const { isLoading: isSessionLoading } = useSessionStore();

  const selectedRestaurantRaw = typeof window !== 'undefined' ? localStorage.getItem('selected_restaurant') : null;
  const selectedRestaurant = selectedRestaurantRaw ? JSON.parse(selectedRestaurantRaw) : null;
  const restaurantId: string | undefined = selectedRestaurant?.restaurantId;

  const { data: items = [], isLoading: isItemsLoading } = useMenuItems(restaurantId);
  const { data: categories = [] } = useCategories(restaurantId);
  const deleteMutation = useDeleteMenuItem();
  const { mutate: toggleActive } = useSetActiveStatus(restaurantId);
  const { mutate: updateBestSeller } = useUpdateBestSeller(restaurantId);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MenuItemDTO | undefined>();
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [pendingItemId, setPendingItemId] = useState<string | null>(null);

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const canCreateItemQuery = useCanCreateMenuItem(restaurantId);

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
    deleteMutation.mutate(id);
    setItemToDelete(null);
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
          <div className="space-y-6 mb-8 animate-in slide-in-from-top-4 duration-500">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h1 className="text-3xl font-bold text-foreground tracking-tight">Menu Management</h1>
                <p className="text-muted-foreground text-sm">
                  Manage your restaurant's menu items and categories
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="xl:hidden"
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                >
                  <Menu className="h-5 w-5" />
                </Button>
                <Button
                  onClick={handleAdd}
                  className="shadow-md hover:shadow-lg transition-all duration-300"
                  size="lg"
                  disabled={!canCreateItemQuery.data}
                >
                  <Plus className="mr-2 h-5 w-5" />
                  Add Menu Item
                </Button>
              </div>
            </div>

            {!canCreateItemQuery.data && (
              <Card className="border-amber-500">
                <CardContent className="pt-6 pb-4 flex items-center gap-4">
                  <div className="p-3 rounded-full bg-amber-500/20">
                    <AlertCircle className="h-6 w-6 text-amber-500" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-amber-500 mb-1">Menu Item Limit Reached</h4>
                    <p className="text-sm text-muted-foreground">
                      You've reached the maximum number of menu items in your current package.
                      Please upgrade to Premium to add more menu items and unlock additional features.
                    </p>
                  </div>
                  <Button variant="outline" className="border-amber-500 text-amber-500 hover:bg-amber-500/10">
                    Upgrade to Premium
                  </Button>
                </CardContent>
              </Card>
            )}
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
                          "flex flex-col h-full overflow-hidden"
                        )}
                      >
                        {/* Loading Overlay */}
                        {pendingItemId === item.menuItemId && (
                          <div className="absolute inset-0 bg-background/80 backdrop-blur-[1px] rounded-xl flex items-center justify-center z-20">
                            <div className="h-5 w-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                          </div>
                        )}

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

                          {/* Status Badge */}
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
                        <CardContent className="flex flex-col flex-1 p-5 space-y-4">
                          <div className="flex-1">
                            <h4 className="font-bold text-lg leading-tight line-clamp-2 group-hover:text-primary transition-colors duration-200">
                              {item.name}
                            </h4>
                            <p className="text-sm text-muted-foreground line-clamp-2 mt-1 leading-relaxed">
                              {item.description || "No description"}
                            </p>
                          </div>

                          {/* Price */}
                          <p className="text-2xl font-bold text-primary">
                            {parseFloat(item.price).toFixed(2)} VND
                          </p>

                          {/* === Toggles: Status + Best Seller === */}
                          <div className="flex items-center justify-between pt-3 border-t border-border/20">
                            <StatusSwitch
                              checked={item.status === "ACTIVE"}
                              onChange={(checked) => {
                                setPendingItemId(item.menuItemId);
                                toggleActive(
                                  { menuItemId: item.menuItemId, active: checked },
                                  { onSettled: () => setPendingItemId(null) }
                                );
                              }}
                              disabled={pendingItemId === item.menuItemId}
                            />

                            <BestSellerToggle
                              isBestSeller={item.bestSeller}
                              onToggle={() => {
                                setPendingItemId(item.menuItemId);
                                updateBestSeller(
                                  { menuItemId: item.menuItemId, bestSeller: !item.bestSeller },
                                  { onSettled: () => setPendingItemId(null) }
                                );
                              }}
                              disabled={pendingItemId === item.menuItemId}
                            />
                          </div>

                          {/* === Action Buttons === */}
                          <div className="flex justify-end gap-1 pt-2">
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
                        </CardContent>
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
      <aside
        className={cn(
          "fixed inset-y-0 right-0 z-40 w-80 bg-background/95 backdrop-blur-sm shadow-2xl transition-transform duration-300 ease-in-out",
          "xl:relative xl:inset-auto xl:shadow-xl xl:bg-card/50 xl:backdrop-blur-sm xl:translate-x-0",
          sidebarOpen ? "translate-x-0" : "translate-x-full xl:translate-x-0"
        )}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b xl:hidden">
            <CardTitle className="text-lg font-bold">Categories</CardTitle>
            <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          <Card className="flex-1 m-4 xl:m-0 xl:border xl:shadow-none">
            <CardHeader className="pb-4 bg-gradient-to-br from-primary/5 to-transparent border-b xl:border-b">
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
            <CardContent className="pt-4 overflow-y-auto">
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
                          onClick={() => {
                            scrollToCategory(label);
                            setSidebarOpen(false);
                          }}
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
        </div>
      </aside>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 xl:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

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