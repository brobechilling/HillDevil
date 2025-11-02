import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Save, X, Loader2, Settings, FolderOpen } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory } from '@/hooks/queries/useCategories';
import { CategoryDTO } from '@/dto/category.dto';
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
import { CategoryManagementDialog } from './CategoryManagementDialog';
import { cn } from '@/lib/utils';

export const CategoryList = () => {
  // Resolve restaurant id
  const selectedRestaurantRaw = typeof window !== 'undefined' ? localStorage.getItem('selected_restaurant') : null;
  const selectedRestaurant = selectedRestaurantRaw ? JSON.parse(selectedRestaurantRaw) : null;
  const restaurantId: string | undefined = selectedRestaurant?.restaurantId;

  const { data: categories = [], isLoading } = useCategories(restaurantId);
  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();
  const deleteMutation = useDeleteCategory();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [manageCategoryId, setManageCategoryId] = useState<string | null>(null);
  const [isManageDialogOpen, setIsManageDialogOpen] = useState(false);

  const handleAdd = () => {
    if (!newName.trim()) {
      toast({ variant: 'destructive', title: 'Name required' });
      return;
    }

    if (!restaurantId) {
      toast({ variant: 'destructive', title: 'Restaurant ID required' });
      return;
    }

    createMutation.mutate(
      {
        name: newName.trim(),
        restaurantId,
        customizationIds: [],
      },
      {
        onSuccess: () => {
          setNewName('');
          setShowAddForm(false);
          toast({ title: 'Category created', description: 'The category has been added.' });
        },
        onError: () => {
          toast({ variant: 'destructive', title: 'Error', description: 'Failed to create category.' });
        },
      }
    );
  };

  const handleEdit = (category: CategoryDTO) => {
    setEditingId(category.categoryId);
    setEditName(category.name);
  };

  const handleSaveEdit = () => {
    if (!editingId || !editName.trim()) {
      toast({ variant: 'destructive', title: 'Name required' });
      return;
    }

    const category = categories.find((c) => c.categoryId === editingId);
    if (!category) return;

    updateMutation.mutate(
      {
        id: editingId,
        data: { ...category, name: editName.trim() },
      },
      {
        onSuccess: () => {
          setEditingId(null);
          setEditName('');
          toast({ title: 'Category updated', description: 'The category has been updated.' });
        },
        onError: () => {
          toast({ variant: 'destructive', title: 'Error', description: 'Failed to update category.' });
        },
      }
    );
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditName('');
  };

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id, {
      onSuccess: () => {
        setDeleteId(null);
        toast({ title: 'Category deleted', description: 'The category has been removed.' });
      },
      onError: () => {
        toast({ variant: 'destructive', title: 'Error', description: 'Failed to delete category.' });
      },
    });
  };

  const handleManage = (categoryId: string) => {
    setManageCategoryId(categoryId);
    setIsManageDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading categories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Add New Category */}
      <Card className="border-2 border-dashed border-border/50 hover:border-primary/50 transition-all duration-300">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2">
                <FolderOpen className="h-5 w-5 text-primary" />
                Categories
              </CardTitle>
              <CardDescription>Manage menu categories and organize your items</CardDescription>
            </div>
            {!showAddForm ? (
              <Button 
                onClick={() => setShowAddForm(true)} 
                size="sm"
                className="shadow-sm hover:shadow-md transition-shadow"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Category
              </Button>
            ) : (
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowAddForm(false);
                  setNewName('');
                }} 
                size="sm"
              >
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
            )}
          </div>
        </CardHeader>
        {showAddForm && (
          <CardContent className="animate-in slide-in-from-top-2 duration-300">
            <div className="flex gap-2">
              <Input
                placeholder="Category name (e.g., Appetizers, Main Course)"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                className="flex-1"
                autoFocus
              />
              <Button 
                onClick={handleAdd} 
                disabled={createMutation.isPending}
                className="shadow-sm"
              >
                {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Save className="mr-2 h-4 w-4" />
                Save
              </Button>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Categories List */}
      <div className="space-y-3">
        {categories.length === 0 ? (
          <Card className="border-2 border-dashed">
            <CardContent className="py-16 text-center">
              <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <FolderOpen className="h-8 w-8 text-primary" />
                </div>
                <div className="space-y-1">
                  <p className="font-semibold text-foreground">No categories yet</p>
                  <p className="text-sm text-muted-foreground">Create your first category to organize menu items</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          categories.map((category, index) => (
            <Card 
              key={category.categoryId}
              className={cn(
                "group hover:shadow-lg transition-all duration-300 hover:-translate-y-1",
                "border border-border/50",
                "animate-in fade-in slide-in-from-bottom-2 duration-300"
              )}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <CardContent className="p-5">
                <div className="flex items-center justify-between gap-4">
                  {editingId === category.categoryId ? (
                    <div className="flex items-center gap-2 flex-1 animate-in slide-in-from-right-2 duration-200">
                      <Input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveEdit();
                          if (e.key === 'Escape') handleCancelEdit();
                        }}
                        className="flex-1"
                        autoFocus
                      />
                      <Button 
                        size="sm" 
                        onClick={handleSaveEdit} 
                        disabled={updateMutation.isPending}
                        className="shadow-sm"
                      >
                        {updateMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        <Save className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={handleCancelEdit}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <FolderOpen className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-lg truncate group-hover:text-primary transition-colors">
                            {category.name}
                          </h3>
                          {category.customizationIds && category.customizationIds.length > 0 && (
                            <div className="mt-1">
                              <Badge variant="secondary" className="text-xs">
                                {category.customizationIds.length} customization
                                {category.customizationIds.length !== 1 ? 's' : ''}
                              </Badge>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleManage(category.categoryId)}
                          className="hover:bg-primary/10 hover:text-primary hover:border-primary/20 transition-all"
                        >
                          <Settings className="mr-2 h-4 w-4" />
                          Manage
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(category)}
                          className="hover:bg-primary/10 hover:text-primary hover:border-primary/20 transition-all"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setDeleteId(category.categoryId)}
                          className="text-destructive hover:bg-destructive/10 hover:border-destructive/20 transition-all"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Manage Dialog */}
      {manageCategoryId && restaurantId && (
        <CategoryManagementDialog
          open={isManageDialogOpen}
          onOpenChange={setIsManageDialogOpen}
          categoryId={manageCategoryId}
          restaurantId={restaurantId}
        />
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Category</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this category? This action cannot be undone.
              Menu items in this category will need to be reassigned.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && handleDelete(deleteId)}
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
