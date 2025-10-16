import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { ImageUpload } from '@/components/ui/image-upload';
import { useMenuStore, MenuItem } from '@/store/menuStore';
import { useMenuCustomizationStore } from '@/store/customizationStore';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { useEffect, useState, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const DEFAULT_CATEGORIES = [
  'Appetizers', 'Soups & Salads', 'Main Course', 'Seafood', 'Grills',
  'Pasta & Noodles', 'Desserts', 'Beverages', 'Cocktails', 'Milk Tea', 'Coffee', 'Custom',
];

const CUSTOMIZATION_CATEGORIES = [
  'Topping', 'Size', 'Temperature', 'Sweetness', 'Custom',
];

const menuItemSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  price: z.coerce.number().min(0.01, 'Price must be greater than 0'),
  category: z.string().min(2, 'Category is required'),
  parentCategory: z.string().optional(),
  isCustomizationCategory: z.boolean().default(false),
  imageUrl: z.string().optional(),
  available: z.boolean().default(true),
});

type MenuItemFormData = z.infer<typeof menuItemSchema>;

interface MenuItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  branchId: string;
  item?: MenuItem;
}

export const MenuItemDialog = ({
  open,
  onOpenChange,
  branchId,
  item,
}: MenuItemDialogProps) => {
  const addItem = useMenuStore((state) => state.addItem);
  const updateItem = useMenuStore((state) => state.updateItem);
  const allItems = useMenuStore((state) => state.items);
  const branchItems = allItems.filter((i) => i.branchId === branchId);

  const {
    getCategoryCustomizations,
    getMenuItemCustomizations,
    linkMenuItemCustomization,
    unlinkMenuItemCustomization,
  } = useMenuCustomizationStore();

  const [categoryType, setCategoryType] = useState<string>('');
  const [showCustomCategory, setShowCustomCategory] = useState(false);
  const [customizationCategoryType, setCustomizationCategoryType] = useState<string>('');
  const [showCustomCustomizationCategory, setShowCustomCustomizationCategory] = useState(false);
  const [allowCustomizations, setAllowCustomizations] = useState(false);
  const [selectedCustomizations, setSelectedCustomizations] = useState<Set<string>>(new Set());
  const [showLeftScroll, setShowLeftScroll] = useState(false);
  const [showRightScroll, setShowRightScroll] = useState(false);
  const categoryScrollRef = useRef<HTMLDivElement>(null);
  const customizationScrollRef = useRef<HTMLDivElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<MenuItemFormData>({
    resolver: zodResolver(menuItemSchema),
    defaultValues: { available: true, isCustomizationCategory: false },
  });

  const available = watch('available');
  const isCustomizationCategory = watch('isCustomizationCategory');
  const parentCategory = watch('parentCategory');
  const category = watch('category');

  const categoryCustomizations = !isCustomizationCategory && category
    ? getCategoryCustomizations(category, branchId)
    : [];
  const itemCustomizations = item ? getMenuItemCustomizations(item.id) : [];

  useEffect(() => {
    if (item) {
      const isDefaultCategory = DEFAULT_CATEGORIES.includes(item.category);
      setCategoryType(isDefaultCategory ? item.category : 'Custom');
      setShowCustomCategory(!isDefaultCategory);

      if (item.isCustomizationCategory && item.parentCategory) {
        const isDefaultCustomization = CUSTOMIZATION_CATEGORIES.includes(item.category);
        setCustomizationCategoryType(isDefaultCustomization ? item.category : 'Custom');
        setShowCustomCustomizationCategory(!isDefaultCustomization);
      }

      const linkedIds = new Set(itemCustomizations.map((c) => c.id));
      setSelectedCustomizations(linkedIds);
      setAllowCustomizations(linkedIds.size > 0);

      reset({
        name: item.name,
        description: item.description,
        price: item.price,
        category: item.category,
        parentCategory: item.parentCategory || '',
        isCustomizationCategory: item.isCustomizationCategory || false,
        imageUrl: item.imageUrl || '',
        available: item.available,
      });
    } else {
      setCategoryType('');
      setShowCustomCategory(false);
      setCustomizationCategoryType('');
      setShowCustomCustomizationCategory(false);
      setAllowCustomizations(false);
      setSelectedCustomizations(new Set());
      reset({
        name: '',
        description: '',
        price: 0,
        category: '',
        parentCategory: '',
        isCustomizationCategory: false,
        imageUrl: '',
        available: true,
      });
    }
  }, [item]);

  const handleCategoryTypeChange = (value: string) => {
    setCategoryType(value);
    setShowCustomCategory(value === 'Custom');
    setValue('category', value === 'Custom' ? '' : value);
  };

  const handleCustomizationCategoryChange = (value: string) => {
    setCustomizationCategoryType(value);
    setShowCustomCustomizationCategory(value === 'Custom');
    setValue('category', value === 'Custom' ? '' : value);
  };

  const onSubmit = (data: MenuItemFormData) => {
    if (item) {
      updateItem(item.id, data);
      toast({ title: 'Menu Item Updated', description: 'Updated successfully.' });
    } else {
      // Ensure all required fields are present
      const itemData: Omit<MenuItem, 'id' | 'createdAt' | 'customizations'> = {
        name: data.name || '',
        description: data.description || '',
        price: data.price || 0,
        category: data.category || '',
        branchId,
        available: data.available ?? true,
        parentCategory: data.parentCategory,
        isCustomizationCategory: data.isCustomizationCategory,
        imageUrl: data.imageUrl,
      };
      addItem(itemData);
      toast({ title: 'Menu Item Added', description: 'Added successfully.' });
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-2xl w-full p-0 overflow-hidden rounded-2xl border border-orange-100 shadow-xl"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white border-b border-slate-100 px-6 py-4">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-slate-800">
              {item ? 'Edit Menu Item' : 'Add Menu Item'}
            </DialogTitle>
            <DialogDescription className="text-slate-500">
              {item ? 'Update the menu item details' : 'Add a new item to your menu'}
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Scrollable Content */}
        <div className="px-6 py-5 overflow-y-auto max-h-[75vh] scroll-smooth space-y-5">
          {/* Customization toggle */}
          <div className="flex items-center space-x-2 p-3 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl border border-orange-200">
            <Switch
              id="isCustomizationCategory"
              checked={isCustomizationCategory}
              onCheckedChange={(checked) => setValue('isCustomizationCategory', checked)}
            />
            <Label htmlFor="isCustomizationCategory" className="cursor-pointer font-medium text-slate-700">
              This is a customization item (e.g., Topping, Size)
            </Label>
          </div>

          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name" className="font-semibold text-slate-700">Item Name *</Label>
            <Input {...register('name')} id="name" placeholder="e.g., Pearl, Large Size" />
            {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
          </div>

          {/* Category pills */}
          <div className="space-y-2">
            <Label className="font-semibold text-slate-700">Category *</Label>
            <div className="flex flex-wrap gap-2">
              {DEFAULT_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => handleCategoryTypeChange(cat)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    categoryType === cat
                      ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-md'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
            {showCustomCategory && (
              <Input {...register('category')} placeholder="Enter custom category name" />
            )}
            {errors.category && <p className="text-sm text-red-500">{errors.category.message}</p>}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="font-semibold text-slate-700">Description *</Label>
            <Textarea {...register('description')} id="description" placeholder="Describe the dish..." rows={3} />
            {errors.description && <p className="text-sm text-red-500">{errors.description.message}</p>}
          </div>

          {/* Price */}
          <div className="space-y-2">
            <Label htmlFor="price" className="font-semibold text-slate-700">Price ($) *</Label>
            <Input {...register('price')} id="price" type="number" step="0.01" placeholder="0.00" />
            {errors.price && <p className="text-sm text-red-500">{errors.price.message}</p>}
          </div>

          {/* Image */}
          <div className="space-y-2">
            <Label className="font-semibold text-slate-700">Product Image</Label>
            <ImageUpload
              value={watch('imageUrl')}
              onChange={(value) => setValue('imageUrl', value)}
              maxSize={5}
            />
          </div>

          {/* Available */}
          <div className="flex items-center gap-2 bg-slate-50 rounded-lg p-3">
            <Switch id="available" checked={available} onCheckedChange={(checked) => setValue('available', checked)} />
            <Label htmlFor="available" className="cursor-pointer font-medium text-slate-700">
              Available for order
            </Label>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-slate-100 px-6 py-4 flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit(onSubmit)}
            className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg"
          >
            {item ? 'Update' : 'Add'} Item
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
