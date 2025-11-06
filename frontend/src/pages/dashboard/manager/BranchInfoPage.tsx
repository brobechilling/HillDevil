import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { Save, Building2, Mail, Phone, MapPin } from 'lucide-react';
import { useBranch, useUpdateBranch } from '@/hooks/queries/useBranches';

export default function BranchInfoPage() {
  const { user } = useAuthStore();
  const branchId = user?.branchId || '1';

  // Load branch data via query
  const { data: branch, isLoading } = useBranch(branchId);
  const updateBranchMutation = useUpdateBranch();
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');

  useEffect(() => {
    if (branch) {
      setPhone(branch.branchPhone || '');
      setEmail(branch.mail || '');
      setAddress(branch.address || '');
    }
  }, [branch]);

  const handleSave = async () => {
    try {
      await updateBranchMutation.mutateAsync({ id: branchId, data: { branchPhone: phone, mail: email } });
      toast({ title: 'Branch Updated', description: 'Contact information has been saved successfully.' });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Update Failed', description: 'Failed to update branch information.' });
    }
  };

  if (isLoading) {
    return <div className="text-center py-12">Loading branch information...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Branch Management</h1>
        <p className="text-muted-foreground mt-2">
          Manage contact information for {branch?.address || 'this branch'}
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            <CardTitle>Branch Information</CardTitle>
          </div>
          <CardDescription>
            Update contact details for your branch
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 234 567 8900"
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="branch@restaurant.com"
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="address"
                  value={address}
                  disabled
                  placeholder="123 Main Street, City"
                  className="pl-10 bg-muted"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Address cannot be changed by managers
              </p>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t">
            <Button onClick={handleSave}>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
