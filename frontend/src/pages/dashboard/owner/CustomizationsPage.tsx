import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useMenuCustomizationStore, Customization } from '@/store/customizationStore';
import { CustomizationManagementDialog } from '@/components/owner/CustomizationManagementDialog';

export default function CustomizationsPage() {
  const { user } = useAuthStore();
  const branchId = user?.branchId || '1';
  const { getCustomizationsByBranch } = useMenuCustomizationStore();
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedCustomization, setSelectedCustomization] = useState<Customization | undefined>();

  const customizations = getCustomizationsByBranch(branchId);

  const handleAdd = () => {
    setSelectedCustomization(undefined);
    setDialogOpen(true);
  };

  const handleEdit = (customization: Customization) => {
    setSelectedCustomization(customization);
    setDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Customization Management</h1>
          <p className="text-muted-foreground mt-2">
            Manage all available customizations
          </p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="mr-2 h-4 w-4" />
          Add Customization
        </Button>
      </div>

      {customizations.length === 0 ? (
        <Card>
          <CardContent className="pt-12 pb-12 text-center">
            <p className="text-muted-foreground mb-4">
              No customizations yet. Create your first customization option!
            </p>
            <Button onClick={handleAdd}>
              <Plus className="mr-2 h-4 w-4" />
              Add Customization
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {customizations.map((customization) => (
            <Card key={customization.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{customization.name}</CardTitle>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleEdit(customization)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
                <CardDescription>
                  Additional price
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Badge variant="secondary">
                  +${customization.price.toFixed(2)}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <CustomizationManagementDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        branchId={branchId}
        customization={selectedCustomization}
      />
    </div>
  );
}
