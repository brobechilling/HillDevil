import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, User, Lock } from 'lucide-react';
import { RestaurantDTO } from '@/dto/restaurant.dto';
import { useBranchesByRestaurant } from '@/hooks/queries/useBranches';
import { useMutation } from '@tanstack/react-query';
import { login } from '@/api/authApi';
import { useToast } from '@/hooks/use-toast';
import { ROLE_NAME, UserDTO } from '@/dto/user.dto';
import { BranchDTO } from '@/dto/branch.dto';
import { AuthenticationRequest } from '@/dto/auth.dto';
import { useSessionStore } from '@/store/sessionStore';

interface RestaurantLoginFormProps {
  restaurant: RestaurantDTO;
  onBack: () => void;
}

export const RestaurantLoginForm = ({ restaurant, onBack }: RestaurantLoginFormProps) => {
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [branchId, setBranchId] = useState<string>('');
  const { toast } = useToast();
  const navigate = useNavigate();


  const branchesByRestaurantQuery = useBranchesByRestaurant(restaurant.restaurantId);
  const branches: BranchDTO[] = branchesByRestaurantQuery.data ?? [];
  const { setSession } = useSessionStore.getState();

  const loginStaffMutation = useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      setSession(data.staff, data.accessToken);
      switch (data.staff.role.name) {
        case ROLE_NAME.BRANCH_MANAGER:
          navigate('/dashboard/manager');
          return;
        case ROLE_NAME.WAITER:
          navigate('/dashboard/waiter');
          return;
        case ROLE_NAME.RECEPTIONIST:
          navigate('/dashboard/receptionist');
          return;
      }
    },
    onError: () => {
      toast({
        title: "Login Failed",
        description: "Invalid username, password, or branch. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!branchId) {
      toast({
        title: "Missing Branch",
        description: "Please select a branch before signing in.",
        variant: "destructive",
      });
      return;
    }
    const authenticationRequest: AuthenticationRequest = {
      username,
      password,
      branchId,
    };
    loginStaffMutation.mutate(authenticationRequest);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back
        </Button>
      </div>

      {branchesByRestaurantQuery.isLoading && (
        <div className="text-center py-8">Loading branches...</div>
      )}

      {branchesByRestaurantQuery.isError && (
        <div className="text-center py-8 text-red-500">Failed to load branches</div>
      )}

      {!branchesByRestaurantQuery.isLoading && !branchesByRestaurantQuery.isError && (
        <>
          <div className="p-4 rounded-lg bg-muted/50 border space-y-2">
            <p className="text-sm font-medium">{restaurant.name}</p>
            {branches && (
              <div className="space-y-2">
                <Label htmlFor="branch-select" className="text-sm font-medium">Select Branch</Label>
                <Select value={branchId} onValueChange={setBranchId}>
                  <SelectTrigger id="branch-select" className="w-full">
                    <SelectValue placeholder="Select a branch" />
                  </SelectTrigger>
                  <SelectContent>
                    {branches.map((branch: BranchDTO) => (
                      <SelectItem key={branch.branchId} value={branch.branchId}>
                        {branch.address}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <Button type="submit" className="w-full" variant="hero" disabled={loginStaffMutation.isPending}>
              {loginStaffMutation.isPending ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
        </>
      )}
    </div>
  );
};
