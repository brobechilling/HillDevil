import { Fragment, useState } from "react";
import { usePackageStore } from "@/store/packageStore";
import { usePackages, useDeletePackage, useDeactivatePackage } from "@/hooks/usePackages";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PackageDialog } from "./PackageDialog";
import { Edit, Plus, Trash2, ChevronDown, ChevronRight } from "lucide-react";

export const PackageTab = () => {
  // 👉 Lấy data từ React Query
  const { data: packages = [], isLoading } = usePackages();
  const deleteMutation = useDeletePackage();
  const deactivateMutation = useDeactivatePackage();

  const handleDeactivate = (packageId: string, available: boolean) => {
    const confirmMsg = available
      ? "Are you sure you want to deactivate this package?"
      : "Do you want to activate this package again?";
    if (confirm(confirmMsg)) {
      deactivateMutation.mutate(packageId);
    }
  };

  // 👉 UI state từ Zustand
  const { toggleAvailability } = usePackageStore();

  // 👉 State cục bộ cho dialog + expand
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const [expandedPackages, setExpandedPackages] = useState<Set<string>>(new Set());

  const handleEdit = (packageId: string) => {
    setSelectedPackage(packageId);
    setDialogOpen(true);
  };

  const handleCreate = () => {
    setSelectedPackage(null);
    setDialogOpen(true);
  };

  const handleDelete = (packageId: string) => {
    if (confirm("Are you sure you want to delete this package?")) {
      deleteMutation.mutate(packageId);
    }
  };

  const togglePackageExpansion = (packageId: string) => {
    setExpandedPackages((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(packageId)) newSet.delete(packageId);
      else newSet.add(packageId);
      return newSet;
    });
  };

  if (isLoading) {
    return <p className="text-center text-muted-foreground">Loading packages...</p>;
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Package Management</h2>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Add Package
        </Button>
      </div>

      {/* Package List */}
      <Card>
        <CardHeader>
          <CardTitle>Available Packages</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12"></TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Available</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {packages.map((pkg) => {
                const expanded = expandedPackages.has(pkg.packageId);
                return (
                  <Fragment key={pkg.packageId}>
                    <TableRow>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => togglePackageExpansion(pkg.packageId)}
                        >
                          {expanded ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </Button>
                      </TableCell>
                      <TableCell className="font-medium">{pkg.name}</TableCell>
                      <TableCell>${pkg.price.toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge
                          variant={pkg.available ? "default" : "secondary"}
                          className="cursor-pointer"
                          onClick={() => handleDeactivate(pkg.packageId, pkg.available)}
                        >
                          {pkg.available ? "Available" : "Unavailable"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(pkg.packageId)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant={pkg.available ? "secondary" : "default"}
                            size="sm"
                            onClick={() => handleDeactivate(pkg.packageId, pkg.available)}
                            disabled={deactivateMutation.isPending}
                          >
                            {pkg.available ? "Deactivate" : "Activate"}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(pkg.packageId)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>

                        </div>
                      </TableCell>
                    </TableRow>

                    {/* Expandable details */}
                    {expanded && (
                      <TableRow>
                        <TableCell colSpan={5} className="p-0">
                          <div className="p-4 bg-muted/30 space-y-3">
                            <div>
                              <p className="text-sm font-medium mb-1">Description</p>
                              <p className="text-sm text-muted-foreground">
                                {pkg.description}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm font-medium mb-2">Features</p>
                              <div className="grid gap-2 md:grid-cols-2">
                                {pkg.features.map((feature) => (
                                  <div
                                    key={feature.featureId}
                                    className="flex items-start gap-2"
                                  >
                                    <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5" />
                                    <div>
                                      <p className="text-sm font-medium">
                                        {feature.featureName}
                                      </p>
                                      <p className="text-xs text-muted-foreground">
                                        {feature.description} ({feature.value})
                                      </p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </Fragment>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Dialog */}
      <PackageDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        packageId={selectedPackage}
      />
    </div>
  );
};