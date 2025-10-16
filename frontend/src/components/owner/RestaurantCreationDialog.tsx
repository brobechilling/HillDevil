import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { useAuthStore } from '@/store/authStore';
import { Building2, Store, Warehouse } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface RestaurantCreationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: () => void;
}

const packageTypes = [
  {
    id: 'default',
    name: 'Basic',
    icon: Store,
    price: '$49/month',
    features: ['1-3 Branches', 'Basic Analytics', 'QR Ordering'],
  },
  {
    id: 'pro',
    name: 'Professional',
    icon: Building2,
    price: '$99/month',
    features: ['Up to 10 Branches', 'Advanced Analytics', 'Custom Branding'],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    icon: Warehouse,
    price: 'Custom',
    features: ['Unlimited Branches', 'Real-time Analytics', 'Full Customization'],
  },
];

export const RestaurantCreationDialog = ({ open, onOpenChange, onSave }: RestaurantCreationDialogProps) => {
  const { user } = useAuthStore();
  const [formData, setFormData] = useState({
    brandName: '',
    description: '',
    packageType: 'pro' as 'default' | 'pro' | 'enterprise',
    branchName: '',
    shortCode: '',
    address: '',
    phone: '',
    email: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.brandName || !formData.branchName || !formData.shortCode) {
      toast({
        variant: 'destructive',
        title: 'Missing fields',
        description: 'Brand name, branch name, and short code are required.',
      });
      return;
    }

    // Check if shortCode already exists
    const existingBranches = JSON.parse(localStorage.getItem('mock_branches') || '[]');
    if (existingBranches.some((b: any) => b.shortCode === formData.shortCode)) {
      toast({
        variant: 'destructive',
        title: 'Short code already exists',
        description: 'Please choose a different short code.',
      });
      return;
    }

    // Create brand
    const brands = JSON.parse(localStorage.getItem('mock_brands') || '[]');
    const brandId = `brand_${Date.now()}`;
    const newBrand = {
      id: brandId,
      name: formData.brandName,
      description: formData.description,
      ownerId: user?.id,
      packageType: formData.packageType,
      totalBranches: 1,
      status: 'active',
      established: new Date().getFullYear().toString(),
      createdAt: new Date().toISOString(),
    };
    brands.push(newBrand);
    localStorage.setItem('mock_brands', JSON.stringify(brands));

    // Create first branch
    const branches = JSON.parse(localStorage.getItem('mock_branches') || '[]');
    const newBranch = {
      id: `branch_${Date.now()}`,
      name: formData.branchName,
      shortCode: formData.shortCode,
      address: formData.address,
      phone: formData.phone,
      email: formData.email,
      brandName: formData.brandName,
      ownerId: user?.id,
      packageType: formData.packageType,
      status: 'active',
      managerId: null,
      tagline: '',
      description: '',
      logoUrl: null,
      bannerUrl: null,
      createdAt: new Date().toISOString(),
    };
    branches.push(newBranch);
    localStorage.setItem('mock_branches', JSON.stringify(branches));

    // Set as selected brand
    localStorage.setItem('selected_brand', formData.brandName);

    toast({
      title: 'Restaurant created',
      description: `${formData.brandName} has been created successfully with ${formData.branchName}.`,
    });

    // Reset form
    setFormData({
      brandName: '',
      description: '',
      packageType: 'pro',
      branchName: '',
      shortCode: '',
      address: '',
      phone: '',
      email: '',
    });

    onSave();
    onOpenChange(false);
  };

  const selectedPackage = packageTypes.find(p => p.id === formData.packageType);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Restaurant</DialogTitle>
          <DialogDescription>
            Set up a new restaurant brand and its first branch
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Package Selection */}
          <div className="space-y-3">
            <Label>Select Package Type</Label>
            <div className="grid grid-cols-3 gap-3">
              {packageTypes.map((pkg) => (
                <Card
                  key={pkg.id}
                  className={`cursor-pointer transition-smooth ${
                    formData.packageType === pkg.id
                      ? 'border-primary shadow-medium ring-2 ring-primary'
                      : 'border-border/50 hover:border-primary/50'
                  }`}
                  onClick={() => setFormData({ ...formData, packageType: pkg.id as any })}
                >
                  <CardContent className="p-4">
                    <pkg.icon className="h-8 w-8 text-primary mb-2" />
                    <h3 className="font-semibold text-sm">{pkg.name}</h3>
                    <p className="text-xs text-primary font-bold mt-1">{pkg.price}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
            {selectedPackage && (
              <div className="text-xs text-muted-foreground">
                Includes: {selectedPackage.features.join(', ')}
              </div>
            )}
          </div>

          {/* Brand Details */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm">Brand Information</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="brandName">Brand Name *</Label>
                <Input
                  id="brandName"
                  value={formData.brandName}
                  onChange={(e) => setFormData({ ...formData, brandName: e.target.value })}
                  placeholder="My Restaurant Chain"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Brand Description</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Fine dining experience..."
                />
              </div>
            </div>
          </div>

          {/* First Branch Details */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm">First Branch Information</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="branchName">Branch Name *</Label>
                <Input
                  id="branchName"
                  value={formData.branchName}
                  onChange={(e) => setFormData({ ...formData, branchName: e.target.value })}
                  placeholder="Downtown Branch"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="shortCode">Short Code * (URL-friendly)</Label>
                <Input
                  id="shortCode"
                  value={formData.shortCode}
                  onChange={(e) => setFormData({ ...formData, shortCode: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                  placeholder="downtown"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="123 Main St, City, State"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+1234567890"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="branch@restaurant.com"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-2 justify-end pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Create Restaurant</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
