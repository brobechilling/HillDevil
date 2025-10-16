import { useState, useRef } from 'react';
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Eye, ChevronRight, Settings } from 'lucide-react';
import { useMenuStore, MenuItem } from '@/store/menuStore';
import { useMenuCustomizationStore } from '@/store/customizationStore';
import { MenuItemDialog } from './MenuItemDialog';
import { MenuItemViewDialog } from './MenuItemViewDialog';
import { CategoryManagementDialog } from '@/components/owner/CategoryManagementDialog';
import { toast } from '@/hooks/use-toast';
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
  const allItems = useMenuStore((state) => state.items);
  const items = allItems.filter((i) => i.branchId === branchId);
  const deleteItem = useMenuStore((state) => state.deleteItem);
  const { getCategoryCustomizations } = useMenuCustomizationStore();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MenuItem | undefined>();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('');

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleEdit = (item: MenuItem) => {
    setSelectedItem(item);
    setIsDialogOpen(true);
  };

  const handleView = (item: MenuItem) => {
    setSelectedItem(item);
    setIsViewDialogOpen(true);
  };

  const handleAdd = () => {
    setSelectedItem(undefined);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    deleteItem(id);
    setItemToDelete(null);
    toast({
      title: 'Menu Item Deleted',
      description: 'The menu item has been removed.',
    });
  };

  const handleManageCategory = (categoryName: string) => {
    setSelectedCategory(categoryName);
    setIsCategoryDialogOpen(true);
  };

  const scrollToCategory = (category: string) => {
    setActiveCategory(category);
    const container = scrollContainerRef.current;
    const section = document.getElementById(`category-${category}`);
    if (container && section) {
      const sectionTop = section.offsetTop;
      container.scrollTo({
        top: sectionTop - 20,
        behavior: 'smooth',
      });
    }
  };

  const groupedItems = items.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, MenuItem[]>);

  const categories = Array.from(new Set(items.map((i) => i.category)));

  const getCategoryCustomizationCount = (categoryName: string) => {
    return getCategoryCustomizations(categoryName, branchId).length;
  };

  return (
    <div className="flex gap-6">
      {/* === CỘT TRÁI: DANH SÁCH MÓN ĂN === */}
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
            <Button
              className="bg-primary hover:bg-primary/90 text-white px-5 py-2 rounded-lg shadow-sm"
              onClick={handleAdd}
            >
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
                    <div className="flex items-center gap-3">
                      <Badge variant="outline">
                        {categoryItems.length}{' '}
                        {categoryItems.length === 1 ? 'item' : 'items'}
                      </Badge>
                    </div>
                  </div>
                  <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                    {categoryItems.map((item, index) => (
                      <Card
                        key={item.id}
                        className="overflow-hidden border-border/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                        style={{
                          animation: `fadeInUp 0.5s ease-out ${index * 0.1}s both`,
                        }}
                      >
                        {item.imageUrl && (
                          <div className="aspect-video bg-muted overflow-hidden">
                            <img
                              src={item.imageUrl}
                              alt={item.name}
                              className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                              }}
                            />
                          </div>
                        )}
                        <CardContent className="pt-5">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h4 className="font-bold text-lg">{item.name}</h4>
                              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                {item.description}
                              </p>
                            </div>
                            <Badge
                              variant={item.available ? 'default' : 'secondary'}
                            >
                              {item.available ? 'Available' : 'Unavailable'}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between mt-4">
                            <span className="text-xl font-semibold text-primary">
                              ${item.price.toFixed(2)}
                            </span>
                            <div className="flex gap-2">
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => handleView(item)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => handleEdit(item)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => setItemToDelete(item.id)}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
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

      {/* === SIDEBAR PHẢI: CATEGORY === */}
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
            {categories.length > 0 ? (
              <div className="space-y-1">
                {categories.map((cat) => {
                  const itemCount = groupedItems[cat]?.length || 0;
                  const customizationCount = getCategoryCustomizationCount(cat);
                  const isActive = activeCategory === cat;

                  return (
                    <div key={cat} className="relative group">
                      {/* ✅ Đã đổi từ <button> sang <div role="button"> */}
                      <div
                        onClick={() => scrollToCategory(cat)}
                        role="button"
                        tabIndex={0}
                        className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 flex items-center justify-between cursor-pointer
                    ${isActive
                            ? 'bg-primary text-primary-foreground shadow-md scale-105'
                            : 'hover:bg-muted hover:translate-x-1'
                          }`}
                      >
                        <div className="flex flex-col gap-0.5 flex-1">
                          <span
                            className={`font-medium ${isActive
                              ? 'text-primary-foreground'
                              : 'text-foreground'
                              }`}
                          >
                            {cat}
                          </span>
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-xs ${isActive
                                ? 'text-primary-foreground/80'
                                : 'text-muted-foreground'
                                }`}
                            >
                              {itemCount} {itemCount === 1 ? 'item' : 'items'}
                            </span>
                            {customizationCount > 0 && (
                              <Badge
                                variant="secondary"
                                className="text-xs h-5 px-1.5"
                              >
                                {customizationCount} custom
                              </Badge>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            className={`h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity ${isActive
                              ? 'text-primary-foreground hover:bg-primary-foreground/20'
                              : ''
                              }`}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleManageCategory(cat);
                            }}
                          >
                            <Settings className="h-3.5 w-3.5" />
                          </Button>
                          <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
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


      {/* === DIALOGS === */}
      <MenuItemDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        branchId={branchId}
        item={selectedItem}
      />
      <MenuItemViewDialog
        open={isViewDialogOpen}
        onOpenChange={setIsViewDialogOpen}
        item={selectedItem}
      />
      {selectedCategory && (
        <CategoryManagementDialog
          open={isCategoryDialogOpen}
          onOpenChange={setIsCategoryDialogOpen}
          categoryName={selectedCategory}
          branchId={branchId}
        />
      )}
      <AlertDialog
        open={!!itemToDelete}
        onOpenChange={() => setItemToDelete(null)}
      >
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
            >
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