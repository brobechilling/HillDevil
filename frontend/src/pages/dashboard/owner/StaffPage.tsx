import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { OwnerStaffManagement } from '@/components/owner/OwnerStaffManagement';
import { useEffect, useState } from 'react';
import { toast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building2, ArrowRight } from 'lucide-react';

const OwnerStaffPage = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [branches, setBranches] = useState<any[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || user.role !== 'owner') {
      navigate('/login');
      return;
    }

    const selectedBrand = localStorage.getItem('selected_brand');
    if (!selectedBrand) {
      toast({
        variant: 'destructive',
        title: 'No brand selected',
        description: 'Please select a brand first.',
      });
      navigate('/brand-selection');
      return;
    }

    const allBranches = JSON.parse(localStorage.getItem('mock_branches') || '[]');
    const brandBranches = allBranches.filter((b: any) => 
      b.brandName === selectedBrand && b.ownerId === user.id
    );

    if (brandBranches.length === 0) {
      toast({
        variant: 'destructive',
        title: 'No branches found',
        description: 'This brand has no branches yet.',
      });
      navigate('/brand-selection');
      return;
    }

    setBranches(brandBranches);
    setLoading(false);
  }, [user, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Show branch selection first
  if (!selectedBranch) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold mb-2">Staff Management</h2>
          <p className="text-muted-foreground">Select a branch to manage its staff members</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {branches.map((branch) => (
            <Card
              key={branch.id}
              className="cursor-pointer hover:border-primary transition-smooth"
              onClick={() => setSelectedBranch(branch)}
            >
              <CardHeader>
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Building2 className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <CardTitle className="text-xl">{branch.name}</CardTitle>
                <CardDescription>{branch.address}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" variant="outline">
                  Manage Staff
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Show staff management for selected branch
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold mb-2">Staff Management</h2>
          <p className="text-muted-foreground">Managing staff for {selectedBranch.name}</p>
        </div>
        <Button variant="outline" onClick={() => setSelectedBranch(null)}>
          ← Back to Branch Selection
        </Button>
      </div>
      
      <OwnerStaffManagement branchId={selectedBranch.id} />
    </div>
  );
};

export default OwnerStaffPage;
