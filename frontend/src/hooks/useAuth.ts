import { useAuthStore } from '@/store/authStore';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';

export const useAuth = () => {
  const { user, isAuthenticated, isLoading, login, register, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogin = async (email: string, password: string) => {
    try {
      await login(email, password);
      
      // Show success toast with role info
      if (user) {
        toast({
          title: 'Login Successful',
          description: `Welcome back, ${user.name}! Role: ${user.role}`,
        });

        // Role-based navigation
        switch (user.role) {
          case 'owner':
            // If owner has multiple brands, go to brand selection
            navigate('/brand-selection');
            break;
          case 'admin':
            navigate('/dashboard/admin');
            break;
          case 'branch_manager':
            navigate('/dashboard/manager');
            break;
          case 'waiter':
            navigate('/dashboard/waiter');
            break;
          case 'receptionist':
            navigate('/dashboard/receptionist');
            break;
          default:
            navigate('/dashboard');
        }
      }
    } catch (error) {
      // Error handled in authStore
    }
  };

  const handleRegister = async (email: string, password: string, name: string) => {
    try {
      await register(email, password, name);
      
      // After registration, navigate to package selection for owners
      navigate('/register/package');
    } catch (error) {
      // Error handled in authStore
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    handleLogin,
    handleRegister,
    handleLogout,
  };
};
