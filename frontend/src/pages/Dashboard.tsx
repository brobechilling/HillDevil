import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Building2, Package, User } from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, isLoading } = useAuthStore();

  useEffect(() => {
    if (!isLoading && user) {
      if (user.role) {
        switch (user.role) {
          case 'owner':
            navigate('/dashboard/owner', { replace: true });
            break;
          case 'branch_manager':
            navigate('/dashboard/manager', { replace: true });
            break;
          case 'waiter':
            navigate('/dashboard/waiter', { replace: true });
            break;
          case 'receptionist':
            navigate('/dashboard/receptionist', { replace: true });
            break;
          case 'admin':
            navigate('/dashboard/admin', { replace: true });
            break;
        }
      }
    }
  }, [user, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If no role matches, render nothing

  return null;
};

export default Dashboard;
