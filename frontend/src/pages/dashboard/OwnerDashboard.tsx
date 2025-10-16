import { useEffect } from 'react';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { useAuthStore } from '@/store/authStore';
import OwnerDashboardLayout from '@/components/layout/OwnerDashboardLayout';
import { seedBranchData } from '@/lib/mockDataInit';

const OwnerDashboard = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!user || user.role !== 'owner') {
      navigate('/login');
      return;
    }

    // Load selected brand and its branches
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
      // No branches yet for the selected brand. Keep owner on the dashboard so they
      // can create the first branch. Don't redirect to brand-selection.
      // If currently on the base dashboard route, route to overview so the owner
      // sees the dashboard UI (which will include a Create Branch CTA).
      if (location.pathname === '/dashboard/owner') {
        navigate('/dashboard/owner/overview', { replace: true });
      }
      return;
    }

    // Seed data for first branch (only when branches exist)
    const activeBranch = brandBranches[0];
    if (activeBranch?.id) {
      const seededKey = `seeded_${activeBranch.id}`;
      if (!sessionStorage.getItem(seededKey)) {
        seedBranchData(activeBranch.id);
        sessionStorage.setItem(seededKey, 'true');
      }
    }

    // Redirect to overview if on base route
    if (location.pathname === '/dashboard/owner') {
      navigate('/dashboard/owner/overview', { replace: true });
    }
  }, [user, navigate, location.pathname]);

  return (
    <OwnerDashboardLayout>
      <Outlet />
    </OwnerDashboardLayout>
  );
};

export default OwnerDashboard;
