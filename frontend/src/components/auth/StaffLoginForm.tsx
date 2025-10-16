import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Building2, User, Lock, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { toast } from '@/hooks/use-toast';

const staffLoginSchema = z.object({
  restaurantId: z.string().min(1, 'Restaurant ID is required'),
  username: z.string().min(3, 'Username must be at least 3 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type StaffLoginFormData = z.infer<typeof staffLoginSchema>;

const StaffLoginForm = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const { loginStaff } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<StaffLoginFormData>({
    resolver: zodResolver(staffLoginSchema),
  });

  const onSubmit = async (data: StaffLoginFormData) => {
    setIsLoading(true);
    try {
      await loginStaff(data.restaurantId, data.username, data.password);
      
      const user = useAuthStore.getState().user;
      
      toast({
        title: 'Login Successful',
        description: `Welcome back! Role: ${user?.role}`,
      });

      // Navigate based on role
      if (user?.role === 'waiter') {
        navigate('/dashboard/waiter');
      } else if (user?.role === 'receptionist') {
        navigate('/dashboard/receptionist');
      } else if (user?.role === 'branch_manager') {
        navigate('/dashboard/manager');
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      // Error handled in authStore
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md border-border/50 shadow-medium">
      <CardHeader className="space-y-1">
        <div className="flex items-center gap-2 mb-2">
          <div className="p-2 rounded-lg gradient-primary">
            <Building2 className="h-6 w-6 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl">Staff / Manager Login</CardTitle>
        </div>
        <CardDescription>
          Enter your restaurant ID and credentials to access your workspace
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="restaurantId">Restaurant ID</Label>
            <div className="relative">
              <Building2 className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                {...register('restaurantId')}
                id="restaurantId"
                placeholder="Enter restaurant ID"
                className="pl-9"
              />
            </div>
            {errors.restaurantId && (
              <p className="text-sm text-destructive">{errors.restaurantId.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                {...register('username')}
                id="username"
                placeholder="Enter your username"
                className="pl-9"
              />
            </div>
            {errors.username && (
              <p className="text-sm text-destructive">{errors.username.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                {...register('password')}
                id="password"
                type="password"
                placeholder="Enter your password"
                className="pl-9"
              />
            </div>
            {errors.password && (
              <p className="text-sm text-destructive">{errors.password.message}</p>
            )}
          </div>

          <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default StaffLoginForm;
