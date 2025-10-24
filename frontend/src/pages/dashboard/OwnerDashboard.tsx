import { useEffect, useState } from 'react';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { UserDTO } from '@/dto/user.dto';
import OwnerDashboardLayout from '@/components/layout/OwnerDashboardLayout';

const OwnerDashboard = () => {
  const [user, setUser] = useState<UserDTO | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Get user data from localStorage (stored by Login component)
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      console.log('OwnerDashboard - No user found, redirecting to login');
      navigate('/login');
      return;
    }

    const userData = JSON.parse(storedUser) as UserDTO;
    setUser(userData);

    // Check if user has RESTAURANT_OWNER role
    if (userData.role.name !== 'RESTAURANT_OWNER') {
      console.log('OwnerDashboard - User is not RESTAURANT_OWNER, redirecting to login');
      navigate('/login');
      return;
    }

    // Check if restaurant is selected
    const selectedRestaurant = localStorage.getItem('selected_restaurant');
    if (!selectedRestaurant) {
      console.log('OwnerDashboard - No restaurant selected, redirecting to brand selection');
      toast({
        variant: 'destructive',
        title: 'No restaurant selected',
        description: 'Please select a restaurant first.',
      });
      navigate('/brand-selection');
      return;
    }

    console.log('OwnerDashboard - User authenticated and restaurant selected');

    // Redirect to overview if on base route
    if (location.pathname === '/dashboard/owner') {
      navigate('/dashboard/owner/overview', { replace: true });
    }
  }, [navigate, location.pathname]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <OwnerDashboardLayout>
      <Outlet />
    </OwnerDashboardLayout>
  );
};

export default OwnerDashboard;
