import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Trash2, Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import {
  Command,
  CommandInput,
  CommandGroup,
  CommandItem,
  CommandEmpty,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";

import { useFeatures } from "@/hooks/queries/useFeatures";
import {
  useCreatePackage,
  useUpdatePackage,
  usePackage,
} from "@/hooks/queries/usePackages";

import { FeatureDTO } from "@/dto/feature.dto";
import { FeatureValueDTO } from "@/dto/featureValue.dto";

const packageSchema = z.object({
  name: z.string().min(3),
  price: z.number().int().min(0),
  description: z.string().min(10),
  available: z.boolean(),
});

type PackageFormData = z.infer<typeof packageSchema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  packageId: string | null;
}

// Giao diện feature nội bộ có thêm tempId
interface FeatureWithTempId extends FeatureValueDTO {
  tempId: string;
}

export const PackageDialog = ({ open, onOpenChange, packageId }: Props) => {
  const { data: pkg } = usePackage(packageId ?? "");
  const { data: allFeatures = [] } = useFeatures();

  const createMutation = useCreatePackage();
  const updateMutation = useUpdatePackage();
  const [features, setFeatures] = useState<FeatureWithTempId[]>([]);

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
      setFeatures(
        (pkg.features || []).map((f) => ({ ...f, tempId: crypto.randomUUID() }))
      );
    } else {
      form.reset({
        name: "",
        price: 0,
        description: "",
        available: true,
      });
      setFeatures([]);
    }
  }, [pkg, form]);

  const handleSubmit = (data: PackageFormData) => {
    const payload = {
      name: data.name,
      description: data.description,
      price: data.price,
      available: data.available,
      billingPeriod: 1,
      features: features.map((f) => ({
        featureId: f.featureId ?? null, // tempId không gửi, backend tạo mới nếu null
        featureName: f.featureName,
        description: f.description,
        value: f.value || 0,
      })),
    };

    if (packageId) {
      const updatePayload = {
        ...payload,
        packageId,
      };
      updateMutation.mutate(
        { id: packageId, data: updatePayload },
        { onSuccess: () => onOpenChange(false) }
      );
    } else {
      createMutation.mutate(payload, { onSuccess: () => onOpenChange(false) });
    }
  };

  const handleAddFeature = () => {
    setFeatures((prev) => [
      ...prev,
      {
        tempId: crypto.randomUUID(),
        featureId: null,
        featureName: "",
        description: "",
        value: 0,
      },
    ]);
  };

  const handleRemoveFeature = (tempId: string) => {
    setFeatures((prev) => prev.filter((f) => f.tempId !== tempId));
  };

  const handleSelectFeature = (tempId: string, feature: FeatureDTO) => {
    setFeatures((prev) =>
      prev.map((f) =>
        f.tempId === tempId
          ? {
              ...f,
              featureId: feature.id,
              featureName: feature.name,
              description: feature.description,
            }
          : f
      )
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {packageId ? "Edit Package" : "Add New Package"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            {/* Name */}
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

            {/* Price */}
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price (VND)</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      inputMode="numeric"
                      value={field.value?.toString() ?? ""}
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^0-9]/g, "");
                        field.onChange(value === "" ? 0 : parseInt(value, 10));
                      }}
                      placeholder="Enter package price"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea {...field} rows={3} placeholder="Enter package description" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Features */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <FormLabel>Features</FormLabel>
                <Button type="button" variant="outline" size="sm" onClick={handleAddFeature}>
                  <Plus className="mr-2 h-4 w-4" /> Add Feature
                </Button>
              </div>

              {features.map((f) => (
                <div key={f.tempId} className="flex gap-2 items-start border p-3 rounded-md">
                  <div className="flex-1 space-y-2">
                    {/* Editable feature name + select existing */}
                    <div className="flex items-center gap-2">
                      <Input
                        value={f.featureName}
                        onChange={(e) => {
                          const value = e.target.value;
                          setFeatures((prev) =>
                            prev.map((x) =>
                              x.tempId === f.tempId
                                ? { ...x, featureName: value, description: "" }
                                : x
                            )
                          );
                        }}
                        placeholder="Type or select feature name"
                        className="flex-1"
                      />

                      <Popover>
                        <PopoverTrigger asChild>
                          <Button type="button" variant="outline" size="icon">
                            <Plus className="h-4 w-4" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[250px] p-0">
                          <Command>
                            <CommandInput placeholder="Search feature..." />
                            <CommandEmpty>No feature found</CommandEmpty>
                            <CommandGroup>
                              {allFeatures.map((feature) => (
                                <CommandItem
                                  key={feature.id as string}
                                  value={feature.name}
                                  onSelect={() => handleSelectFeature(f.tempId, feature)}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      f.featureName === feature.name
                                        ? "opacity-100"
                                        : "opacity-0"
                                    )}
                                  />
                                  {feature.name}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </div>

                    {/* Description */}
                    <Input
                      placeholder="Description"
                      value={f.description}
                      onChange={(e) =>
                        setFeatures((prev) =>
                          prev.map((x) =>
                            x.tempId === f.tempId
                              ? { ...x, description: e.target.value }
                              : x
                          )
                        )
                      }
                    />

                    {/* Value */}
                    {allFeatures.find((ft) => ft.name === f.featureName)?.hasValue && (
                      <Input
                        type="number"
                        placeholder="Value"
                        value={f.value ?? 0}
                        onChange={(e) =>
                          setFeatures((prev) =>
                            prev.map((x) =>
                              x.tempId === f.tempId
                                ? { ...x, value: Number(e.target.value) }
                                : x
                            )
                          )
                        }
                      />
                    )}
                  </div>

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveFeature(f.tempId)}
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