import { Fragment, useState } from "react";
import {
  usePackages,
  useDeletePackage,
  useTogglePackageAvailability,
} from "@/hooks/queries/usePackages";
import { useActivePackageStats } from "@/hooks/queries/useSubscription";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { PackageDialog } from "./PackageDialog";
import { Edit, Plus, Trash2, ChevronDown, ChevronRight, TrendingUp, DollarSign, CheckCircle2, CreditCard } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export const PackageTab = () => {
  const { data: packages = [], isLoading } = usePackages();
  const { data: activePackageStats = [], isLoading: statsLoading } = useActivePackageStats();
  const deleteMutation = useDeletePackage();
  const toggleMutation = useTogglePackageAvailability();
  const { toast } = useToast();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const [expandedPackages, setExpandedPackages] = useState<Set<string>>(new Set());

  // Alert states
  const [packageToDelete, setPackageToDelete] = useState<string | null>(null);
  const [packageToToggle, setPackageToToggle] = useState<{
    id: string;
    available: boolean;
  } | null>(null);

  const handleEdit = (packageId: string) => {
    setSelectedPackage(packageId);
    setDialogOpen(true);
  };

  const handleCreate = () => {
    setSelectedPackage(null);
    setDialogOpen(true);
  };

  const confirmDelete = () => {
    if (!packageToDelete) return;
    deleteMutation.mutate(packageToDelete, {
      onSuccess: () => {
        toast({ title: "Deleted successfully", description: "Package removed." });
        setPackageToDelete(null);
      },
      onError: () => {
        toast({ title: "Error", description: "Failed to delete package.", variant: "destructive" });
      },
    });
  };

  const confirmToggleAvailability = () => {
    if (!packageToToggle) return;
    const { id, available } = packageToToggle;
    toggleMutation.mutate(
      { id, available },
      {
        onSuccess: () => {
          toast({
            title: available ? "Package Deactivated" : "Package Activated",
            description: `The package has been ${
              available ? "deactivated" : "activated"
            } successfully.`,
          });
          setPackageToToggle(null);
        },
        onError: () => {
          toast({
            title: "Error",
            description: "Failed to update package availability.",
            variant: "destructive",
          });
        },
      }
    );
  };

  const togglePackageExpansion = (packageId: string) => {
    setExpandedPackages((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(packageId)) {
        newSet.delete(packageId);
      } else {
        newSet.add(packageId);
      }
      return newSet;
    });
  };

  if (isLoading) {
    return <p className="text-center text-muted-foreground">Loading packages...</p>;
  }

  return (
    <div className="space-y-4">
      {/* Active Packages Stats */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-blue-500" />
          <h3 className="text-lg font-semibold">Active Subscriptions by Package</h3>
        </div>
        
        {statsLoading ? (
          <Card>
            <CardContent className="p-0">
              <div className="h-24 bg-muted rounded-lg animate-pulse" />
            </CardContent>
          </Card>
        ) : activePackageStats && activePackageStats.length > 0 ? (
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50 dark:bg-muted/30">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Package Name</th>
                    <th className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <div className="p-2 bg-green-500/10 dark:bg-green-500/15 rounded-lg">
                          <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                        </div>
                        <span className="text-sm font-semibold text-foreground">Active Subs</span>
                      </div>
                    </th>
                    <th className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <div className="p-2 bg-blue-500/10 dark:bg-blue-500/15 rounded-lg">
                          <CreditCard className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <span className="text-sm font-semibold text-foreground">Payments</span>
                      </div>
                    </th>
                    <th className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <div className="p-2 bg-amber-500/10 dark:bg-amber-500/15 rounded-lg">
                          <DollarSign className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                        </div>
                        <span className="text-sm font-semibold text-foreground">Revenue</span>
                      </div>
                    </th>
                    <th className="px-6 py-4 text-center">
                      <span className="text-sm font-semibold text-foreground">Status</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y dark:divide-border/50">
                  {activePackageStats.map((stat, index) => {
                    // Find the actual package to get its availability status
                    const pkg = packages.find(p => p.name === stat.packageName);
                    const isAvailable = pkg?.available ?? false;
                    
                    return (
                      <tr 
                        key={stat.packageName}
                        className="hover:bg-muted/50 dark:hover:bg-muted/30 transition-colors animate-in fade-in"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 dark:from-blue-500/30 dark:to-purple-500/30 flex items-center justify-center">
                              <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <span className="font-semibold text-foreground">{stat.packageName}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex flex-col items-center">
                            <p className="text-xl font-bold text-green-600 dark:text-green-400">{stat.activeCount}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">subscriptions</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex flex-col items-center">
                            <p className="text-xl font-bold text-blue-600 dark:text-blue-400">{stat.paymentCount}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">orders</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex flex-col items-center">
                            <p className="text-xl font-bold text-amber-600 dark:text-amber-400">
                              {(stat.totalRevenue / 1000).toFixed(2)}k
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5">VND</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <Badge 
                            variant={isAvailable ? "default" : "secondary"}
                            className={isAvailable ? "animate-pulse dark:bg-opacity-90" : ""}
                          >
                            {isAvailable ? '✅ Available' : '🚫 Unavailable'}
                          </Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        ) : (
          <Card className="bg-muted/30 dark:bg-muted/20 border-dashed">
            <CardContent className="p-6 text-center">
              <p className="text-sm text-muted-foreground">No subscription data available</p>
            </CardContent>
          </Card>
        )}
      </div>

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
                      <TableCell>{pkg.price.toFixed(2)}VND</TableCell>
                      <TableCell>
                        <Badge
                          variant={pkg.available ? "default" : "secondary"}
                          className="cursor-pointer"
                          onClick={() =>
                            setPackageToToggle({
                              id: pkg.packageId,
                              available: pkg.available,
                            })
                          }
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
                            onClick={() =>
                              setPackageToToggle({
                                id: pkg.packageId,
                                available: pkg.available,
                              })
                            }
                            disabled={toggleMutation.isPending}
                          >
                            {pkg.available ? "Deactivate" : "Activate"}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setPackageToDelete(pkg.packageId)}
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

      {/* Create / Edit Dialog */}
      <PackageDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        packageId={selectedPackage}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={!!packageToDelete} onOpenChange={() => setPackageToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Package</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this package? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Activate / Deactivate Confirmation */}
      <AlertDialog open={!!packageToToggle} onOpenChange={() => setPackageToToggle(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {packageToToggle?.available ? "Deactivate Package" : "Activate Package"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {packageToToggle?.available
                ? "Are you sure you want to deactivate this package?"
                : "Do you want to activate this package again?"}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmToggleAvailability}>
              {packageToToggle?.available ? "Deactivate" : "Activate"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
