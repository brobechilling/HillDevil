import { useState } from 'react';
import { usePackageStore } from '@/store/packageStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { PackageDialog } from './PackageDialog';
import { Edit, Plus, Trash2, ChevronDown, ChevronRight } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

export const PackageTab = () => {
  const { packages, deletePackage, toggleAvailability } = usePackageStore();
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
    if (confirm('Are you sure you want to delete this package?')) {
      deletePackage(packageId);
    }
  };

  const togglePackageExpansion = (packageId: string) => {
    const newExpanded = new Set(expandedPackages);
    if (newExpanded.has(packageId)) {
      newExpanded.delete(packageId);
    } else {
      newExpanded.add(packageId);
    }
    setExpandedPackages(newExpanded);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Package Management</h2>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Add Package
        </Button>
      </div>

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
                <TableHead>Billing Period</TableHead>
                <TableHead>Available</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {packages.map((pkg) => (
                <Collapsible
                  key={pkg.id}
                  open={expandedPackages.has(pkg.id)}
                  onOpenChange={() => togglePackageExpansion(pkg.id)}
                  asChild
                >
                  <>
                    <TableRow>
                      <TableCell>
                        <CollapsibleTrigger asChild>
                          <Button variant="ghost" size="icon">
                            {expandedPackages.has(pkg.id) ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                          </Button>
                        </CollapsibleTrigger>
                      </TableCell>
                      <TableCell className="font-medium">{pkg.name}</TableCell>
                      <TableCell>${pkg.price.toFixed(2)}</TableCell>
                      <TableCell className="capitalize">{pkg.billingPeriod}</TableCell>
                      <TableCell>
                        <Badge
                          variant={pkg.available ? 'default' : 'secondary'}
                          className="cursor-pointer"
                          onClick={() => toggleAvailability(pkg.id)}
                        >
                          {pkg.available ? 'Available' : 'Unavailable'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(pkg.id)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(pkg.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell colSpan={6} className="p-0">
                        <CollapsibleContent>
                          <div className="p-4 bg-muted/30 space-y-3">
                            <div>
                              <p className="text-sm font-medium mb-1">Description</p>
                              <p className="text-sm text-muted-foreground">{pkg.description}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium mb-2">Features</p>
                              <div className="grid gap-2 md:grid-cols-2">
                                {pkg.features.map((feature) => (
                                  <div key={feature.id} className="flex items-start gap-2">
                                    <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5" />
                                    <div>
                                      <p className="text-sm font-medium">{feature.name}</p>
                                      <p className="text-xs text-muted-foreground">
                                        {feature.description}
                                      </p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </CollapsibleContent>
                      </TableCell>
                    </TableRow>
                  </>
                </Collapsible>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <PackageDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        packageId={selectedPackage}
      />
    </div>
  );
};
