import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useCategories } from '@/hooks/queries/useCategories';
import { useCreateMenuItem, useUpdateMenuItem } from '@/hooks/queries/useMenuItems';
import { Loader2 } from 'lucide-react';
import { MenuItemDTO } from '@/dto/menuItem.dto';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const menuItemSchema = z.object({
  name: z.string().min(2, 'Name must have at least 2 characters'),
  description: z.string().min(10, 'Description must have at least 10 characters'),
  price: z.coerce.number().positive('Price must be greater than 0'),
  categoryId: z.string().min(1, 'Please select a category'),
  hasCustomization: z.boolean(),
  bestSeller: z.boolean().default(false),
  imageUrl: z.string().optional(),
});
type FormData = z.infer<typeof menuItemSchema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  restaurantId: string;
  branchId: string;
  item?: MenuItemDTO;
}

export const MenuItemDialog = ({
  open,
  onOpenChange,
  restaurantId,
  branchId,
  item,
}: Props) => {
  const { data: categories = [] } = useCategories(restaurantId);
  const createMutation = useCreateMenuItem(restaurantId);
  const updateMutation = useUpdateMenuItem(restaurantId);

  // ✅ Dùng imageUrl từ item (BE đã có)
  const existingImageUrl = item?.imageUrl || null;

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<FormData>({
    resolver: zodResolver(menuItemSchema),
    defaultValues: {
      name: '',
      description: '',
      price: undefined,
      categoryId: '',
      hasCustomization: false,
      bestSeller: false,
      imageUrl: '',
    },
  });

  const hasCustomization = watch('hasCustomization');
  const categoryId = watch('categoryId');

  useEffect(() => {
    if (open) {
      if (item) {
        reset({
          name: item.name || '',
          description: item.description || '',
          price: item.price ? parseFloat(item.price) : undefined,
          categoryId: item.categoryId || '',
          hasCustomization: item.hasCustomization || false,
          bestSeller: item.bestSeller || false,
          imageUrl: item.imageUrl || '',
        });
      } else {
        reset({
          name: '',
          description: '',
          price: undefined,
          categoryId: '',
          hasCustomization: false,
          bestSeller: false,
          imageUrl: '',
        });
      }
      setImageFile(null);
      setImagePreview(null);
    }
  }, [item, open, reset]);

  // ✅ Preview ảnh mới chọn
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setImageFile(file);

    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    } else {
      setImagePreview(null);
    }
  };

  const onSubmit = async (data: FormData) => {
    try {
      setIsUploading(true);

      const payload = {
        ...data,
        price: String(data.price),
        restaurantId,
        customizationIds: [],
      };

      if (item) {
        await updateMutation.mutateAsync({
          id: item.menuItemId,
          data: payload as any,
          imageFile: imageFile || undefined,
        });
      } else {
        await createMutation.mutateAsync({
          data: payload as any,
          imageFile: imageFile || undefined,
        });
      }

      onOpenChange(false);
      reset();
    } catch (error: any) {
      // Toast handled in mutations
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold tracking-tight">
            {item ? 'Edit' : 'Add'} Menu Item
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            {item ? 'Update item details' : 'Create a new menu item'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pb-4">
          {/* Name */}
          <div className="space-y-1.5">
            <Label className="text-sm">Name *</Label>
            <Input {...register('name')} className="h-9" />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

          {/* Category */}
          <div className="space-y-1.5">
            <Label className="text-sm">Category *</Label>
            <Select
              value={categoryId || ''}
              onValueChange={(val) =>
                setValue('categoryId', val, { shouldValidate: true })
              }
            >
              <SelectTrigger className="w-full h-9">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.length === 0 ? (
                  <SelectItem value="none" disabled>
                    No categories available
                  </SelectItem>
                ) : (
                  categories.map((cat) => (
                    <SelectItem key={cat.categoryId} value={cat.categoryId}>
                      {cat.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            {errors.categoryId && (
              <p className="text-sm text-red-500 mt-1">
                {errors.categoryId.message}
              </p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label className="text-sm">Description *</Label>
            <Textarea {...register('description')} rows={3} className="min-h-[84px]" />
            {errors.description && (
              <p className="text-sm text-red-500">
                {errors.description.message}
              </p>
            )}
          </div>

          {/* Price */}
          <div className="space-y-1.5">
            <Label className="text-sm">Price *</Label>
            <Input
              type="number"
              step="0.01"
              {...register('price', { valueAsNumber: true })}
              className="h-9"
            />
            {errors.price && (
              <p className="text-sm text-red-500">{errors.price.message}</p>
            )}
          </div>

          {/* Customization */}
          <div className="flex items-center gap-2">
            <Checkbox
              checked={hasCustomization}
              onCheckedChange={(v) => setValue('hasCustomization', v === true)}
            />
            <Label className="text-sm">Has Customization</Label>
          </div>

          {/* Image Upload */}
          <div className="space-y-1.5">
            <Label className="text-sm">Image</Label>
            <Input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              disabled={isUploading}
            />

            {/* Preview current + new */}
            <div className="flex gap-4 mt-3">
              {existingImageUrl && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">
                    Current image:
                  </p>
                  <img
                    src={existingImageUrl}
                    alt="Current"
                    className="w-32 h-32 object-cover rounded border"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const parent = target.parentElement;
                      if (parent) {
                        parent.innerHTML =
                          '<div class="flex items-center justify-center w-32 h-32 border rounded text-xs text-muted-foreground">Image not available</div>';
                      }
                    }}
                  />
                </div>
              )}

              {imagePreview && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">
                    New image:
                  </p>
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-32 h-32 object-cover rounded border"
                  />
                </div>
              )}
            </div>

            {isUploading && (
              <p className="text-sm text-blue-500 mt-1">Uploading image...</p>
            )}
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="h-9"
              disabled={
                createMutation.isPending ||
                updateMutation.isPending ||
                isUploading
              }
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                createMutation.isPending ||
                updateMutation.isPending ||
                isUploading
              }
              className="h-9"
            >
              {(createMutation.isPending ||
                updateMutation.isPending ||
                isUploading) && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
              {item ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
