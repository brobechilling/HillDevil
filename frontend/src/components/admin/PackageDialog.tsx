import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Trash2 } from "lucide-react";
import { FeatureValueDTO } from "@/dto/featureValue.dto";
import {
  useCreatePackage,
  useUpdatePackage,
  usePackage,
} from "@/hooks/usePackages";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

const packageSchema = z.object({
  name: z.string().min(3),
  price: z.number().min(0),
  description: z.string().min(10),
  available: z.boolean(),
});

type PackageFormData = z.infer<typeof packageSchema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  packageId: string | null;
}

export const PackageDialog = ({ open, onOpenChange, packageId }: Props) => {
  const { data: pkg } = usePackage(packageId ?? "");
  const createMutation = useCreatePackage();
  const updateMutation = useUpdatePackage();
  const [features, setFeatures] = useState<FeatureValueDTO[]>([]);

  const form = useForm<PackageFormData>({
    resolver: zodResolver(packageSchema),
    defaultValues: {
      name: "",
      price: 0,
      description: "",
      available: true,
    },
  });

  useEffect(() => {
    if (pkg) {
      form.reset({
        name: pkg.name,
        price: pkg.price,
        description: pkg.description,
        available: pkg.available,
      });
      setFeatures(pkg.features || []);
    }
  }, [pkg, form]);

  const handleSubmit = (data: PackageFormData) => {
    const payload = {
      name: data.name,
      description: data.description,
      price: data.price,
      available: data.available,
      billingPeriod: "1", // fix luôn 1 tháng
      features: features.map((f) => ({
        featureId: f.featureId,
        featureName: f.featureName,
        description: f.description,
        value: f.value,
      })),
    };

    if (packageId) {
      updateMutation.mutate({ id: packageId, data: { ...payload, packageId } });
    } else {
      createMutation.mutate(payload);
    }

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{packageId ? "Edit Package" : "Add New Package"}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            {/* Tên gói */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter package name" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Giá */}
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      value={field.value}
                      onChange={(e) => field.onChange(parseFloat(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Mô tả */}
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

            {/* Features */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <FormLabel>Features</FormLabel>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setFeatures([
                      ...features,
                      { featureId: crypto.randomUUID(), featureName: "", description: "", value: 0 },
                    ])
                  }
                >
                  <Plus className="mr-2 h-4 w-4" /> Add Feature
                </Button>
              </div>

              {features.map((f) => (
                <div key={f.featureId} className="flex gap-2 items-start border p-3 rounded-md">
                  <div className="flex-1 space-y-2">
                    <Input
                      placeholder="Feature name"
                      value={f.featureName}
                      onChange={(e) =>
                        setFeatures((prev) =>
                          prev.map((x) =>
                            x.featureId === f.featureId ? { ...x, featureName: e.target.value } : x
                          )
                        )
                      }
                    />
                    <Input
                      placeholder="Feature description"
                      value={f.description}
                      onChange={(e) =>
                        setFeatures((prev) =>
                          prev.map((x) =>
                            x.featureId === f.featureId ? { ...x, description: e.target.value } : x
                          )
                        )
                      }
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setFeatures(features.filter((x) => x.featureId !== f.featureId))}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            {/* Submit */}
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                {packageId ? "Update" : "Create"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
