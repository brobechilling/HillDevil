import React from 'react';
import { useAuthStore } from '@/store/authStore';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

/**
 * Profile page for the current authenticated user.
 * Displays basic user information and quick actions.
 */
const Profile = () => {
  const { user } = useAuthStore();

  if (!user) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-semibold">Profile</h1>
        <p className="text-muted-foreground mt-2">No user data available.</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarFallback className="gradient-primary text-primary-foreground text-lg font-medium">
              {user.name?.charAt(0).toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold">{user.name}</h1>
            <p className="text-sm text-muted-foreground">{user.email}</p>
            <div className="mt-2">
              <Badge className="text-xs" variant={user.role === 'owner' ? 'default' : 'secondary'}>
                {user.role}
              </Badge>
            </div>
          </div>
        </div>

        <section className="bg-card p-4 rounded-lg border border-border/50">
          <h2 className="font-semibold">Account</h2>
          <p className="text-sm text-muted-foreground mt-2">Manage your account and settings.</p>
          <div className="mt-4 flex gap-2">
            <Button variant="default">Edit Profile</Button>
            <Button variant="outline">Change Password</Button>
          </div>
        </section>

        <section className="bg-card p-4 rounded-lg border border-border/50">
          <h2 className="font-semibold">Quick Links</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button asChild variant="ghost"><a href="/dashboard">Dashboard</a></Button>
            <Button asChild variant="ghost"><a href="/brand-selection">Brands</a></Button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Profile;
