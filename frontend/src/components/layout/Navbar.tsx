import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { UtensilsCrossed } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useEffect } from 'react';

export const Navbar = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {}, []);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const getRoleBadgeVariant = (role?: string) => {
    switch (role) {
      case 'owner': return 'default';
      case 'branch_manager': return 'secondary';
      case 'waiter': return 'outline';
      case 'receptionist': return 'outline';
      default: return 'outline';
    }
  };

  const getRoleLabel = (role?: string) => {
    switch (role) {
      case 'branch_manager': return 'Manager';
      case 'owner': return 'Owner';
      case 'waiter': return 'Waiter';
      case 'receptionist': return 'Receptionist';
      case 'admin': return 'Admin';
      default: return role;
    }
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg gradient-primary">
            <UtensilsCrossed className="h-6 w-6 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold">HillDevilOS</span>
        </Link>

        <div className="flex items-center gap-4">
          {!user ? (
            <>
              <Link to="/login">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link to="/register">
                <Button variant="hero">Get Started</Button>
              </Link>
            </>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild> 
                <Button
                  variant="outline"
                  className="flex items-center gap-3 rounded-xl px-3 py-2 h-auto border-muted-foreground/20 hover:bg-muted transition-all"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary text-primary-foreground text-sm font-medium">
                      {user.name?.charAt(0).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>

                  <div className="hidden md:flex flex-col items-start leading-tight">
                    <span className="text-sm font-semibold">{user.name}</span>
                    <Badge
                      variant={getRoleBadgeVariant(user.role)}
                      className="text-[10px] font-normal mt-0.5 px-1.5 py-0"
                    >
                      {getRoleLabel(user.role)}
                    </Badge>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-2">
                  <div className="font-medium">{user.name}</div>
                  <div className="text-xs text-muted-foreground mt-1">{user.email}</div>
                  <Badge variant={getRoleBadgeVariant(user.role)} className="text-xs mt-2">
                    {getRoleLabel(user.role)}
                  </Badge>
                </div>
                <DropdownMenuSeparator />
                {user.role === 'owner' && (
                  <DropdownMenuItem onSelect={() => navigate('/brand-selection')}>
                    Dashboard
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onSelect={() => navigate('/profile')}>
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => navigate('/settings')}>
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={handleLogout}>
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </nav>
  );
};
