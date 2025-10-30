import React, { useState, useEffect } from 'react';
import { useSessionStore } from '@/store/sessionStore';
import { useNavigate } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { statsApi } from '@/lib/api';
import { getAllBranches } from '@/api/branchApi';
import { useQueryClient } from '@tanstack/react-query';
import { usePackages } from '@/hooks/queries/usePackages';
import { useOverviewForOwner, useRenewSubscription, useCancelSubscription, useChangePackage } from '@/hooks/queries/useSubscription';
import {
  Mail,
  Calendar,
  Lock,
  LogOut,
  Edit2,
  Eye,
  EyeOff,
  User,
  BarChart3,
  Building,
  CreditCard,
  Package as PackageIcon,
  RefreshCw,
  X,
  CheckCircle2,
  Clock,
  AlertCircle,
  MapPin,
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { UserDTO } from '@/dto/user.dto';
import type { PackageFeatureDTO as Package } from '@/dto/packageFeature.dto';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLocation, Link } from 'react-router-dom';
import ProfileSidebar from '@/components/layout/ProfileSidebar';

interface ProfileFormData {
  username: string;
  email: string;
  phone?: string;
}

const sidebarItems = [
  { key: 'overview', label: 'Overview', icon: User },
  { key: 'subscription', label: 'Subscription', icon: PackageIcon },
  { key: 'branches', label: 'Branches', icon: Building },
];

const Profile = () => {
  const { user, isAuthenticated, isLoading, initialize, clearSession } = useSessionStore();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [branches, setBranches] = useState<any[]>([]);
  const [formData, setFormData] = useState<ProfileFormData>({
    username: (user as UserDTO)?.username || '',
    email: (user as UserDTO)?.email || '',
    phone: (user as UserDTO)?.phone || '',
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Subscription state
  const [isChangePackageOpen, setIsChangePackageOpen] = useState(false);
  const [selectedNewPackage, setSelectedNewPackage] = useState<string>('');
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<string>('');
  const [selectedSubscription, setSelectedSubscription] = useState<any>(null); // Cho tab subscription

  // React Query hooks
  const { data: packages = [], isLoading: isLoadingPackages } = usePackages();
  const { data: overviewData = [], isLoading: isLoadingOverview } = useOverviewForOwner();
  const renewMutation = useRenewSubscription();
  const cancelMutation = useCancelSubscription();
  const changePackageMutation = useChangePackage();

  // Tabs replacement: sidebar state
  const location = useLocation();
  const activePath = location.pathname;
  const getSectionFromPath = (): 'overview' | 'subscription' | 'branches' => {
    if (activePath.endsWith('/subscription')) return 'subscription';
    if (activePath.endsWith('/branches')) return 'branches';
    return 'overview';
  };
  const activeSection = getSectionFromPath();

  // Initialize session
  useEffect(() => {
    initialize();
  }, [initialize]);

  // Load stats and branches
  useEffect(() => {
    const loadData = async () => {
      if (!user || !isAuthenticated || (user as UserDTO).role.name !== 'RESTAURANT_OWNER') return;

      try {
        setIsLoadingStats(true);
        const statsRes = await statsApi.getOwnerStats();
        setStats(statsRes.data);
        const branchesData = await getAllBranches();
        setBranches(branchesData);
      } catch (error) {
        console.error('Error loading profile data:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to load profile data.',
        });
      } finally {
        setIsLoadingStats(false);
      }
    };

    loadData();
  }, [user, isAuthenticated, toast]);

  // Xử lý chọn nhà hàng trong tab subscription
  useEffect(() => {
    if (selectedRestaurantId && overviewData.length > 0) {
      const selected = overviewData.find(sub => sub.restaurantId === selectedRestaurantId);
      setSelectedSubscription(selected || null);
    } else {
      setSelectedSubscription(null);
    }
  }, [selectedRestaurantId, overviewData]);

  // Handle loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Loading...</CardTitle>
            <CardDescription>Please wait while loading your profile information</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (!isAuthenticated || !user || (user as UserDTO).role.name !== 'RESTAURANT_OWNER') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>
              {isAuthenticated
                ? 'This profile page is only accessible to Restaurant Owners.'
                : 'Please log in to view your profile.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/login')} className="w-full">
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const typedUser = user as UserDTO;

  const handleEditProfile = () => {
    setFormData({
      username: typedUser.username || '',
      email: typedUser.email || '',
      phone: typedUser.phone || '',
    });
    setIsEditDialogOpen(true);
  };

  const handleSaveProfile = () => {
    if (!formData.username || !formData.email) {
      toast({
        variant: 'destructive',
        title: 'Validation Error',
        description: 'Username and email are required.',
      });
      return;
    }
    toast({
      title: 'Profile Updated',
      description: 'Your profile has been successfully updated.',
    });
    setIsEditDialogOpen(false);
  };

  const handleChangePassword = () => {
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      toast({
        variant: 'destructive',
        title: 'Validation Error',
        description: 'All password fields are required.',
      });
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        variant: 'destructive',
        title: 'Password Mismatch',
        description: 'New passwords do not match.',
      });
      return;
    }
    if (passwordData.newPassword.length < 6) {
      toast({
        variant: 'destructive',
        title: 'Weak Password',
        description: 'Password must be at least 6 characters.',
      });
      return;
    }
    toast({
      title: 'Password Changed',
      description: 'Your password has been successfully updated.',
    });
    setIsChangePasswordOpen(false);
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
  };

  const handleLogout = async () => {
    await clearSession();
    navigate('/');
  };

  const handleRenew = async (subscriptionId: string) => {
    try {
      await renewMutation.mutateAsync({ id: subscriptionId, additionalMonths: 1 });
      toast({ title: 'Success', description: 'Subscription renewed for 1 month.' });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to renew.' });
    }
  };

  const handleCancel = async (subscriptionId: string) => {
    try {
      await cancelMutation.mutateAsync(subscriptionId);
      toast({ title: 'Success', description: 'Subscription cancelled.' });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to cancel.' });
    }
  };

  const handleChangePackage = async () => {
    if (!selectedNewPackage || !selectedRestaurantId) {
      toast({ variant: 'destructive', title: 'Error', description: 'Please select package and restaurant.' });
      return;
    }
    try {
      await changePackageMutation.mutateAsync({
        restaurantId: selectedRestaurantId,
        newPackageId: selectedNewPackage,
      });
      toast({ title: 'Success', description: 'Package change initiated.' });
      setIsChangePackageOpen(false);
      setSelectedNewPackage('');
      setSelectedRestaurantId('');
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to change package.' });
    }
  };

  const getDaysUntilExpiry = (endDate?: string): number | null => {
    if (!endDate) return null;
    const expiry = new Date(endDate);
    const now = new Date();
    const diffTime = expiry.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'ACTIVE': return <Badge variant="default" className="bg-green-500"><CheckCircle2 className="w-3 h-3 mr-1" /> Active</Badge>;
      case 'PENDING_PAYMENT': return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" /> Pending</Badge>;
      case 'EXPIRED': return <Badge variant="destructive"><AlertCircle className="w-3 h-3 mr-1" /> Expired</Badge>;
      case 'CANCELED': return <Badge variant="outline"><X className="w-3 h-3 mr-1" /> Canceled</Badge>;
      default: return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getPackageName = (packageId: string) => {
    const pkg = packages.find((p: Package) => p.packageId === packageId);
    return pkg ? pkg.name : packageId;
  };

  const getDashboardLink = () => '/dashboard/owner';

  return (
    <div className="min-h-screen flex w-full bg-gradient-to-br from-background via-background to-muted/30">
      <ProfileSidebar activeKey={activeSection} />
      {/* Main content with left margin to account for fixed sidebar */}
      <main className="flex-1 overflow-auto ml-72 relative">
        <div className="max-w-4xl mx-auto w-full px-2 md:px-8 py-8 space-y-6 animate-fade-in">
          {/* Header Card (unchanged) */}
          <Card className="overflow-hidden border-2">
            <div className="h-24 bg-gradient-to-r from-primary/20 to-secondary/20"></div>
            <CardContent className="pt-0">
              <div className="flex flex-col md:flex-row gap-6 -mt-12 relative z-10">
                <Avatar className="h-24 w-24 border-4 border-background ring-2 ring-primary/20">
                  <AvatarImage src="https://via.placeholder.com/150" alt={typedUser.username} />
                  <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-primary-foreground text-2xl font-bold">
                    {typedUser.username?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 pt-2">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="space-y-2">
                      <h1 className="text-3xl font-bold">{typedUser.username}</h1>
                      <div className="flex items-center gap-2">
                        <Badge variant="default" className="text-sm">Restaurant Owner</Badge>
                        <span className="text-sm text-muted-foreground">ID: {typedUser.userId}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {/* Edit Profile Dialog (unchanged) */}
                      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                        <DialogTrigger asChild>
                          <Button onClick={handleEditProfile} variant="default" size="sm" className="gap-2">
                            <Edit2 className="w-4 h-4" /> Edit Profile
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                          <DialogHeader>
                            <DialogTitle>Edit Profile</DialogTitle>
                            <DialogDescription>Update your profile information</DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label htmlFor="username">Username</Label>
                              <Input id="username" value={formData.username} onChange={(e) => setFormData({ ...formData, username: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="email">Email</Label>
                              <Input id="email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="phone">Phone (Optional)</Label>
                              <Input id="phone" type="tel" value={formData.phone || ''} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                            </div>
                            <Button onClick={handleSaveProfile} className="w-full">Save Changes</Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                      {/* End Edit Dialog */}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Render main section by sidebar click */}
          {activeSection === 'overview' && (
            // ...Overview content (from former TabsContent value="overview")...
            <div className="space-y-6">
              {/* Contact Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Mail className="w-5 h-5" /> Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs uppercase text-muted-foreground">Email Address</Label>
                      <p className="font-medium flex items-center gap-2"><Mail className="w-4 h-4 text-primary" /> {typedUser.email}</p>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs uppercase text-muted-foreground">User ID</Label>
                      <p className="font-medium">{typedUser.userId}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              {/* Change Password Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Lock className="w-5 h-5" /> Change Password</CardTitle>
                  <CardDescription>Update your account password</CardDescription>
                </CardHeader>
                <CardContent>
                  <Dialog open={isChangePasswordOpen} onOpenChange={setIsChangePasswordOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">Change Password</Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>Change Password</DialogTitle>
                        <DialogDescription>Enter current and new password</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="current-password">Current Password</Label>
                          <div className="relative">
                            <Input
                              id="current-password"
                              type={showPassword ? 'text' : 'password'}
                              value={passwordData.currentPassword}
                              onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                            />
                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2">
                              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="new-password">New Password</Label>
                          <div className="relative">
                            <Input
                              id="new-password"
                              type={showNewPassword ? 'text' : 'password'}
                              value={passwordData.newPassword}
                              onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                            />
                            <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-3 top-1/2 -translate-y-1/2">
                              {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="confirm-password">Confirm New Password</Label>
                          <Input
                            id="confirm-password"
                            type="password"
                            value={passwordData.confirmPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                          />
                        </div>
                        <Button onClick={handleChangePassword} className="w-full">Update Password</Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>
              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Calendar className="w-5 h-5" /> Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <Button onClick={() => navigate(getDashboardLink())} variant="default" className="w-full justify-start gap-2">
                    <BarChart3 className="w-4 h-4" /> Go to Dashboard
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}

          {activeSection === 'subscription' && (
            // ...Subscription content (from former TabsContent value="subscription") ...
            <>
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PackageIcon className="w-5 h-5" />
                    Subscription Management
                  </CardTitle>
                  <CardDescription>Select a restaurant to view and manage its subscription</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Restaurant Select */}
                  <div className="space-y-2">
                    <Label>Select Restaurant</Label>
                    <Select value={selectedRestaurantId} onValueChange={setSelectedRestaurantId}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Choose a restaurant" />
                      </SelectTrigger>
                      <SelectContent>
                        {overviewData.length > 0 ? (
                          overviewData.map((sub) => (
                            <SelectItem key={sub.restaurantId} value={sub.restaurantId}>
                              {sub.restaurantName}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="none" disabled>No restaurants available</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  {/* Subscription Info */}
                  {selectedSubscription ? (
                    <div className="space-y-6">
                      <div className="p-5 border rounded-lg bg-card">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-semibold">{selectedSubscription.restaurantName}</h3>
                          {getStatusBadge(selectedSubscription.currentSubscription?.status)}
                        </div>
                        {selectedSubscription.currentSubscription ? (
                          <>
                            <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                              <div>
                                <span className="text-muted-foreground">Package:</span>{' '}
                                <strong>{getPackageName(selectedSubscription.currentSubscription.packageId)}</strong>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Price:</span>{' '}
                                <strong>
                                  {selectedSubscription.currentSubscription.amount?.toLocaleString()} VND/month
                                </strong>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Start Date:</span>{' '}
                                {new Date(selectedSubscription.currentSubscription.startDate).toLocaleDateString()}
                              </div>
                              <div>
                                <span className="text-muted-foreground">End Date:</span>{' '}
                                {new Date(selectedSubscription.currentSubscription.endDate).toLocaleDateString()}
                              </div>
                            </div>
                            {/* Days left/expired */}
                            {(() => {
                              const daysLeft = getDaysUntilExpiry(selectedSubscription.currentSubscription.endDate);
                              return daysLeft !== null ? (
                                <div className="mb-4">
                                  <span className="text-sm font-medium">
                                    {daysLeft > 0 ? (
                                      <span className={daysLeft <= 3 ? 'text-orange-600' : 'text-green-600'}>
                                        {daysLeft} day{daysLeft !== 1 ? 's' : ''} left
                                      </span>
                                    ) : (
                                      <span className="text-red-600">Expired</span>
                                    )}
                                  </span>
                                </div>
                              ) : null;
                            })()}
                            {/* Renew/Cancel actions */}
                            <div className="flex gap-2">
                              {(() => {
                                const daysLeft = getDaysUntilExpiry(selectedSubscription.currentSubscription.endDate);
                                const isActive = selectedSubscription.currentSubscription.status === 'ACTIVE';
                                return <>
                                  {isActive && daysLeft !== null && daysLeft <= 3 && daysLeft > 0 && (
                                    <AlertDialog>
                                      <AlertDialogTrigger asChild>
                                        <Button size="sm" className="flex-1">
                                          <RefreshCw className="w-4 h-4 mr-2" /> Renew
                                        </Button>
                                      </AlertDialogTrigger>
                                      <AlertDialogContent>
                                        <AlertDialogHeader>
                                          <AlertDialogTitle>Renew Subscription?</AlertDialogTitle>
                                          <AlertDialogDescription>Are you sure you want to renew this subscription for 1 more month? <strong>This action cannot be undone.</strong></AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <div className="flex gap-2 justify-end">
                                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                                          <AlertDialogAction onClick={() => handleRenew(selectedSubscription.currentSubscription.subscriptionId)} className="bg-primary hover:bg-primary/90">Confirm Renew</AlertDialogAction>
                                        </div>
                                      </AlertDialogContent>
                                    </AlertDialog>
                                  )}
                                  {isActive && (
                                    <AlertDialog>
                                      <AlertDialogTrigger asChild>
                                        <Button variant="destructive" size="sm" className="flex-1">
                                          <X className="w-4 h-4 mr-2" /> Cancel
                                        </Button>
                                      </AlertDialogTrigger>
                                      <AlertDialogContent>
                                        <AlertDialogHeader>
                                          <AlertDialogTitle>Cancel Subscription?</AlertDialogTitle>
                                          <AlertDialogDescription>Are you sure you want to cancel this subscription? <strong>This action cannot be undone.</strong></AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <div className="flex gap-2 justify-end">
                                          <AlertDialogCancel>Keep</AlertDialogCancel>
                                          <AlertDialogAction onClick={() => handleCancel(selectedSubscription.currentSubscription.subscriptionId)} className="bg-destructive hover:bg-destructive/90">Yes, Cancel</AlertDialogAction>
                                        </div>
                                      </AlertDialogContent>
                                    </AlertDialog>
                                  )}
                                </>;
                              })()}
                            </div>
                          </>
                        ) : (
                          <div className="text-center py-6 text-muted-foreground">
                            <PackageIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                            <p>No active subscription</p>
                          </div>
                        )}
                      </div>
                      {/* Payment History */}
                      {selectedSubscription.paymentHistory.length > 0 && (
                        <>
                          <Separator />
                          <div className="space-y-3">
                            <h3 className="font-medium text-lg">Payment History</h3>
                            {selectedSubscription.paymentHistory.map((payment: any) => (
                              <div key={payment.subscriptionPaymentId} className="p-4 border rounded-lg text-sm bg-muted/30">
                                <div className="flex justify-between items-center mb-1">
                                  <span className="font-semibold">{payment.amount.toLocaleString()} VND</span>
                                  <Badge variant={payment.subscriptionPaymentStatus === 'SUCCESS' ? 'default' : 'secondary'}>
                                    {payment.subscriptionPaymentStatus}
                                  </Badge>
                                </div>
                                <div className="text-xs text-muted-foreground space-y-1">
                                  <div>Date: {payment.date ? new Date(payment.date).toLocaleDateString() : 'N/A'}</div>
                                  <div>Order: {payment.payOsOrderCode || 'N/A'}</div>
                                  {payment.payOsTransactionCode && <div>Tx: {payment.payOsTransactionCode}</div>}
                                </div>
                              </div>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  ) : selectedRestaurantId ? (
                    <p className="text-center text-muted-foreground py-8">No subscription data available</p>
                  ) : (
                    <p className="text-center text-muted-foreground py-8">Please select a restaurant to view its subscription details</p>
                  )}
                </CardContent>
              </Card>
              {/* Change Package */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PackageIcon className="w-5 h-5" /> Change Package
                  </CardTitle>
                  <CardDescription>Upgrade or downgrade package for the selected restaurant</CardDescription>
                </CardHeader>
                <CardContent>
                  <Dialog open={isChangePackageOpen} onOpenChange={setIsChangePackageOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="w-full" disabled={!selectedRestaurantId}>Change Package</Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>Change Package</DialogTitle>
                        <DialogDescription>
                          Current: {overviewData.find(s => s.restaurantId === selectedRestaurantId)?.restaurantName}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label>Select New Package</Label>
                          {packages
                            .filter((pkg: Package) => pkg.packageId !== selectedSubscription?.currentSubscription?.packageId)
                            .map((pkg: Package) => (
                              <div
                                key={pkg.packageId}
                                className={`p-3 border rounded-lg cursor-pointer transition ${selectedNewPackage === pkg.packageId ? 'border-primary bg-primary/5' : 'hover:bg-muted'}`}
                                onClick={() => setSelectedNewPackage(pkg.packageId)}
                              >
                                <p className="font-medium">{pkg.name}</p>
                                <p className="text-sm text-muted-foreground">{pkg.description}</p>
                                <p className="text-sm font-semibold">{pkg.price} VND/{pkg.billingPeriod}month</p>
                              </div>
                            ))}
                        </div>
                        <Button
                          onClick={handleChangePackage}
                          className="w-full"
                          disabled={!selectedNewPackage || changePackageMutation.isPending}
                        >
                          {changePackageMutation.isPending ? 'Processing...' : 'Confirm Change'}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>
            </>
          )}

          {activeSection === 'branches' && (
            // ...Branches content (from former TabsContent value="branches") ...
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Building className="w-5 h-5" /> Your Branches</CardTitle>
              </CardHeader>
              <CardContent>
                {branches.length > 0 ? (
                  <div className="space-y-3">
                    {branches.map((branch) => (
                      <div key={branch.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <p className="font-medium">{branch.name}</p>
                          <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1"><MapPin className="w-4 h-4" /> {branch.location}</p>
                          <div className="flex gap-2 mt-2">
                            <Badge variant="outline" className="text-xs">{branch.status}</Badge>
                            <Badge variant="secondary" className="text-xs">Tables: {branch.tables || 0}</Badge>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">Manage</Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">No branches found</p>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </main>
      <style>{`
        @keyframes slide-in-left {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-in-left { animation: slide-in-left 0.5s ease-out forwards; opacity: 0; }
        .animate-fade-in { animation: fade-in 0.6s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default Profile;