import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Store, ArrowRight, MapPin } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useAuthStore } from '@/store/authStore';

const BranchSelection = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [branches, setBranches] = useState<any[]>([]);
  const [selectedBrand, setSelectedBrand] = useState<string>('');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const brandName = localStorage.getItem('selected_brand');
    if (!brandName) {
      navigate('/brand-selection');
      return;
    }

    setSelectedBrand(brandName);

    // Load branches for the selected brand
    const storedBranches = localStorage.getItem('mock_branches');
    if (storedBranches) {
      const allBranches = JSON.parse(storedBranches);
      const brandBranches = allBranches.filter(
        (b: any) => b.ownerId === user.id && b.brandName === brandName
      );
      setBranches(brandBranches);

      if (brandBranches.length === 0) {
        navigate('/brand-selection');
      }
    } else {
      navigate('/brand-selection');
    }
  }, [user, navigate]);

  const handleBranchSelect = (branchId: string) => {
    const branch = branches.find(b => b.id === branchId);
    
    localStorage.setItem('selected_branch', branchId);
    
    toast({
      title: 'Branch Selected',
      description: `You've selected ${branch?.name}`,
    });

    navigate('/dashboard/owner');
  };

  return (
    <div className="min-h-screen bg-muted/30 py-12 px-4">
      <div className="container max-w-5xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Select Branch</h1>
          <p className="text-lg text-muted-foreground">
            Choose which branch of <span className="font-semibold">{selectedBrand}</span> you want to manage
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {branches.map((branch) => (
            <Card
              key={branch.id}
              className="cursor-pointer transition-smooth hover:shadow-medium hover:border-primary border-border/50"
              onClick={() => handleBranchSelect(branch.id)}
            >
              <CardHeader>
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <Store className="h-8 w-8 text-primary" />
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-500">
                    Active
                  </span>
                </div>
                <CardTitle className="text-2xl">{branch.name}</CardTitle>
                <CardDescription className="text-base">{branch.address}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{branch.address}</span>
                  </div>
                  {branch.phone && (
                    <p className="text-sm text-muted-foreground">
                      {branch.phone}
                    </p>
                  )}
                </div>
                <Button className="w-full" variant="outline">
                  Manage Branch
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-8 text-center">
          <Button variant="ghost" onClick={() => navigate('/brand-selection')}>
            ← Back to Brand Selection
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BranchSelection;
