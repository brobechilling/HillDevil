import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { usePackageStore, PackageFeature } from '@/store/packageStore';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Trash2 } from 'lucide-react';

const packageSchema = z.object({
  name: z.string().min(3, 'Package name must be at least 3 characters'),
  price: z.number().min(0, 'Price must be positive'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  billingPeriod: z.enum(['monthly', 'yearly', 'one-time']),
  available: z.boolean(),
});

type PackageFormData = z.infer<typeof packageSchema>;

interface PackageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  packageId: string | null;
}

export const PackageDialog = ({ open, onOpenChange, packageId }: PackageDialogProps) => {
  const { packages, addPackage, updatePackage, getPackageById } = usePackageStore();
  const pkg = packageId ? getPackageById(packageId) : null;
  const [features, setFeatures] = useState<PackageFeature[]>([]);

  const form = useForm<PackageFormData>({
    resolver: zodResolver(packageSchema),
    defaultValues: {
      name: '',
      price: 0,
      description: '',
      billingPeriod: 'monthly',
      available: true,
    },
  });

  useEffect(() => {
    if (pkg) {
      form.reset({
        name: pkg.name,
        price: pkg.price,
        description: pkg.description,
        billingPeriod: pkg.billingPeriod,
        available: pkg.available,
      });
      setFeatures(pkg.features);
    } else {
      form.reset({
        name: '',
        price: 0,
        description: '',
        billingPeriod: 'monthly',
        available: true,
      });
      setFeatures([]);
    }
  }, [pkg, form]);

  const addFeature = () => {
    setFeatures([
      ...features,
      { id: Date.now().toString(), name: '', description: '' },
    ]);
  };

  const removeFeature = (id: string) => {
    setFeatures(features.filter((f) => f.id !== id));
  };

  const updateFeature = (id: string, field: keyof PackageFeature, value: string) => {
    setFeatures(
      features.map((f) => (f.id === id ? { ...f, [field]: value } : f))
    );
  };

  const onSubmit = (data: PackageFormData) => {
    const packageData = {
      name: data.name,
      price: data.price,
      description: data.description,
      billingPeriod: data.billingPeriod,
      available: data.available,
      features,
    };
    
    if (packageId) {
      updatePackage(packageId, packageData);
    } else {
      addPackage(packageData);
    }
    onOpenChange(false);
    form.reset();
    setFeatures([]);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{packageId ? 'Edit Package' : 'Add New Package'}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Package Name</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter package name" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      onChange={(e) => field.onChange(parseFloat(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea {...field} placeholder="Enter package description" rows={3} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="billingPeriod"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Billing Period</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select billing period" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                      <SelectItem value="one-time">One-time</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <FormLabel>Features</FormLabel>
                <Button type="button" variant="outline" size="sm" onClick={addFeature}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Feature
                </Button>
              </div>
              <div className="space-y-3">
                {features.map((feature) => (
                  <div key={feature.id} className="flex gap-2 p-3 border rounded-lg">
                    <div className="flex-1 space-y-2">
                      <Input
                        placeholder="Feature name"
                        value={feature.name}
                        onChange={(e) => updateFeature(feature.id, 'name', e.target.value)}
                      />
                      <Input
                        placeholder="Feature description"
                        value={feature.description}
                        onChange={(e) =>
                          updateFeature(feature.id, 'description', e.target.value)
                        }
                      />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeFeature(feature.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit">{packageId ? 'Update' : 'Create'}</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
