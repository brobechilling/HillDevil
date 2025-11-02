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
import { Plus, Edit, Trash2, Save, X, Loader2, Sparkles } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import {
  useCustomizations,
  useCreateCustomization,
  useUpdateCustomization,
  useDeleteCustomization,
} from '@/hooks/queries/useCustomizations';
import { CustomizationDTO } from '@/dto/customization.dto';
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

export const CustomizationList = () => {
  // Resolve restaurant id
  const selectedRestaurantRaw = typeof window !== 'undefined' ? localStorage.getItem('selected_restaurant') : null;
  const selectedRestaurant = selectedRestaurantRaw ? JSON.parse(selectedRestaurantRaw) : null;
  const restaurantId: string | undefined = selectedRestaurant?.restaurantId;

  const { data: customizations = [], isLoading } = useCustomizations(restaurantId);
  const createMutation = useCreateCustomization();
  const updateMutation = useUpdateCustomization();
  const deleteMutation = useDeleteCustomization();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);

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
        price: newPrice || '0',
        restaurantId,
      },
      {
        onSuccess: () => {
          setNewName('');
          setNewPrice('');
          setShowAddForm(false);
          toast({ title: 'Customization created', description: 'The customization has been added.' });
        },
        onError: () => {
          toast({ variant: 'destructive', title: 'Error', description: 'Failed to create customization.' });
        },
      }
    );
  };

  const handleEdit = (customization: CustomizationDTO) => {
    setEditingId(customization.customizationId);
    setEditName(customization.name);
    setEditPrice(customization.price);
  };

  const handleSaveEdit = () => {
    if (!editingId || !editName.trim()) {
      toast({ variant: 'destructive', title: 'Name required' });
      return;
    }

    const customization = customizations.find((c) => c.customizationId === editingId);
    if (!customization) return;

    updateMutation.mutate(
      {
        id: editingId,
        data: { ...customization, name: editName.trim(), price: editPrice || '0' },
      },
      {
        onSuccess: () => {
          setEditingId(null);
          setEditName('');
          setEditPrice('');
          toast({ title: 'Customization updated', description: 'The customization has been updated.' });
        },
        onError: () => {
          toast({ variant: 'destructive', title: 'Error', description: 'Failed to update customization.' });
        },
      }
    );
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditName('');
    setEditPrice('');
  };

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id, {
      onSuccess: () => {
        setDeleteId(null);
        toast({ title: 'Customization deleted', description: 'The customization has been removed.' });
      },
      onError: () => {
        toast({ variant: 'destructive', title: 'Error', description: 'Failed to delete customization.' });
      },
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading customizations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Add New Customization */}
      <Card className="border-2 border-dashed border-border/50 hover:border-primary/50 transition-all duration-300">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Customizations
              </CardTitle>
              <CardDescription>Manage menu item customizations and add-ons</CardDescription>
            </div>
            {!showAddForm ? (
              <Button 
                onClick={() => setShowAddForm(true)} 
                size="sm"
                className="shadow-sm hover:shadow-md transition-shadow"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Customization
              </Button>
            ) : (
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowAddForm(false);
                  setNewName('');
                  setNewPrice('');
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
          <CardContent className="animate-in slide-in-from-top-2 duration-300 space-y-3">
            <Input
              placeholder="Customization name (e.g., Extra cheese, Large size)"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
              autoFocus
            />
            <div className="flex gap-2">
              <Input
                type="number"
                step="0.01"
                placeholder="Price (e.g., 2.50)"
                value={newPrice}
                onChange={(e) => setNewPrice(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                className="flex-1"
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

      {/* Customizations List */}
      <div className="space-y-3">
        {customizations.length === 0 ? (
          <Card className="border-2 border-dashed">
            <CardContent className="py-16 text-center">
              <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <Sparkles className="h-8 w-8 text-primary" />
                </div>
                <div className="space-y-1">
                  <p className="font-semibold text-foreground">No customizations yet</p>
                  <p className="text-sm text-muted-foreground">Create your first customization option for menu items</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          customizations.map((customization, index) => (
            <Card 
              key={customization.customizationId}
              className={cn(
                "group hover:shadow-lg transition-all duration-300 hover:-translate-y-1",
                "border border-border/50",
                "animate-in fade-in slide-in-from-bottom-2 duration-300"
              )}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <CardContent className="p-5">
                <div className="flex items-center justify-between gap-4">
                  {editingId === customization.customizationId ? (
                    <div className="flex items-center gap-2 flex-1 animate-in slide-in-from-right-2 duration-200">
                      <Input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="flex-1"
                        autoFocus
                      />
                      <Input
                        type="number"
                        step="0.01"
                        value={editPrice}
                        onChange={(e) => setEditPrice(e.target.value)}
                        className="w-32"
                        placeholder="Price"
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
                          <Sparkles className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-lg truncate group-hover:text-primary transition-colors">
                            {customization.name}
                          </h3>
                          <div className="mt-1 flex items-center gap-2">
                            {parseFloat(customization.price) > 0 ? (
                              <Badge variant="default" className="font-mono text-xs">
                                +${parseFloat(customization.price).toFixed(2)}
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="text-xs">Free</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(customization)}
                          className="hover:bg-primary/10 hover:text-primary hover:border-primary/20 transition-all"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setDeleteId(customization.customizationId)}
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

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Customization</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this customization? This action cannot be undone.
              It will be removed from all categories and menu items that use it.
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
