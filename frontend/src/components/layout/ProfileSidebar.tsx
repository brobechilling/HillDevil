import * as React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  UtensilsCrossed,
  LogOut,
  Home,
  User as UserIcon,
  Package as PackageIcon,
  Building,
} from 'lucide-react';
import { useSessionStore } from '@/store/sessionStore';

type ProfileSidebarItemKey = 'overview' | 'subscription' | 'branches';

interface ProfileSidebarProps {
  activeKey: ProfileSidebarItemKey;
}

const menuItems: Array<{
  id: ProfileSidebarItemKey;
  label: string;
  description: string;
  icon: any;
  path: string;
}> = [
  { id: 'overview', label: 'Overview', description: 'Profile & security', icon: UserIcon, path: '/profile/overview' },
  { id: 'subscription', label: 'Subscription', description: 'Package & payments', icon: PackageIcon, path: '/profile/subscription' },
  { id: 'branches', label: 'Branches', description: 'Your restaurants', icon: Building, path: '/profile/branches' },
];

export const ProfileSidebar: React.FC<ProfileSidebarProps> = ({ activeKey }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, clearSession } = useSessionStore();

  const handleLogout = async () => {
    await clearSession();
    navigate('/');
  };

  const isActive = (k: ProfileSidebarItemKey) => activeKey === k;

  return (
    <aside className="w-72 border-r bg-card shadow-soft flex flex-col fixed h-screen z-10">
      <div className="p-6 border-b">
        <Link to="/profile" className="flex items-center gap-3">
          <div className="relative">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-purple-600">
              <UtensilsCrossed className="h-6 w-6 text-primary-foreground" />
            </div>
          </div>
          <div>
            <span className="text-xl font-bold block">HillDevilOS</span>
            <span className="text-xs text-muted-foreground">Owner Profile</span>
          </div>
        </Link>
      </div>

      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {menuItems.map((item, index) => (
          <Link key={item.id} to={item.path} style={{ animationDelay: `${index * 50}ms` }} className="block animate-slide-in-left">
            <div
              className={cn(
                'relative group rounded-lg',
                isActive(item.id)
                  ? 'bg-orange-50 border-l-4 border-orange-500 text-primary dark:bg-orange-900/30 dark:border-orange-400' // light and dark
                  : ''
              )}
            >
              <Button
                variant="ghost"
                className={cn(
                  'w-full justify-start h-auto py-3 px-4 relative bg-transparent hover:bg-transparent transition-all duration-300',
                  isActive(item.id) && 'pl-6'
                )}
              >
                <div className="flex items-start gap-3 w-full">
                  <div className={cn('relative transition-all duration-300', isActive(item.id) && 'scale-110')}>
                    <item.icon className={cn('h-5 w-5 mt-0.5 flex-shrink-0 relative z-10 transition-colors', isActive(item.id) ? 'text-primary' : 'text-muted-foreground')} />
                  </div>
                  <div className="flex-1 text-left">
                    <div className={cn('font-medium text-sm transition-all duration-300', isActive(item.id) && 'text-primary font-semibold')}>{item.label}</div>
                    <div className={cn('text-xs text-muted-foreground mt-0.5 transition-all duration-300', isActive(item.id) && 'text-primary/70')}>{item.description}</div>
                  </div>
                </div>
              </Button>
            </div>
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t bg-muted/30">
        <div className="flex items-center gap-3 mb-4 p-3 rounded-lg bg-card">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-gradient-to-br from-primary to-purple-600 text-primary-foreground">
              {user?.username?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.username || 'User'}</p>
            <div className="flex items-center gap-1 mt-0.5">
              <Badge variant="secondary" className="text-xs px-1.5 py-0">
                {user?.role?.name || 'Owner'}
              </Badge>
            </div>
          </div>
        </div>
        <Link to="/" className="block mb-3">
          <Button variant="outline" className="w-full justify-start">
            <Home className="mr-3 h-4 w-4" />
            Home
          </Button>
        </Link>
        <Button variant="outline" className="w-full justify-start" onClick={handleLogout}>
          <LogOut className="mr-3 h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </aside>
  );
};

export default ProfileSidebar;


