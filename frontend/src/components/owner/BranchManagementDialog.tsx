import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';

interface BranchManagementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  branch?: any;
  onSave: () => void;
}

export const BranchManagementDialog = ({ open, onOpenChange, branch, onSave }: BranchManagementDialogProps) => {
  const [formData, setFormData] = useState({
    name: '',
    shortCode: '',
    address: '',
    phone: '',
    email: '',
    tagline: '',
    description: '',
  });

  useEffect(() => {
    if (branch) {
      setFormData({
        name: branch.name || '',
        shortCode: branch.shortCode || '',
        address: branch.address || '',
        phone: branch.phone || '',
        email: branch.email || '',
        tagline: branch.tagline || '',
        description: branch.description || '',
      });
    } else {
      setFormData({
        name: '',
        shortCode: '',
        address: '',
        phone: '',
        email: '',
        tagline: '',
        description: '',
      });
    }
  }, [branch]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.shortCode) {
      toast({
        variant: 'destructive',
        title: 'Missing fields',
        description: 'Branch name and short code are required.',
      });
      return;
    }

    const branches = JSON.parse(localStorage.getItem('mock_branches') || '[]');
    const selectedBrand = localStorage.getItem('selected_brand');
    const user = JSON.parse(localStorage.getItem('mock_auth_user') || '{}');

    if (branch) {
      // Update existing branch
      const updatedBranches = branches.map((b: any) =>
        b.id === branch.id ? { ...b, ...formData } : b
      );
      localStorage.setItem('mock_branches', JSON.stringify(updatedBranches));
      toast({
        title: 'Branch updated',
        description: 'Branch information has been updated successfully.',
      });
    } else {
      // Create new branch
      const newBranch = {
        ...formData,
        id: `branch_${Date.now()}`,
        brandName: selectedBrand,
        ownerId: user.id,
        status: 'active',
        createdAt: new Date().toISOString(),
      };
      branches.push(newBranch);
      localStorage.setItem('mock_branches', JSON.stringify(branches));
      toast({
        title: 'Branch created',
        description: `${formData.name} has been added successfully.`,
      });
    }

    onSave();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{branch ? 'Edit Branch' : 'Add Branch'}</DialogTitle>
          <DialogDescription>
            {branch ? 'Update branch information' : 'Add a new branch to your brand'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Branch Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Downtown Branch"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="shortCode">Short Code *</Label>
              <Input
                id="shortCode"
                value={formData.shortCode}
                onChange={(e) => setFormData({ ...formData, shortCode: e.target.value })}
                placeholder="downtown"
                disabled={!!branch}
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

          <div className="space-y-2">
            <Label htmlFor="tagline">Tagline</Label>
            <Input
              id="tagline"
              value={formData.tagline}
              onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
              placeholder="Fine dining experience"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Welcome to our restaurant..."
              rows={3}
            />
          </div>

          <div className="flex gap-2 justify-end pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">{branch ? 'Update' : 'Create'} Branch</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
