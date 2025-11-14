import { useState, useEffect } from 'react';
import { useSessionStore } from '@/store/sessionStore';
import { useNavigate } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
  AlertDialogFooter,
} from '@/components/ui/alert-dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from '@/hooks/use-toast';
import { useBranchesByOwner } from '@/hooks/queries/useBranches';
import { usePackages } from '@/hooks/queries/usePackages';
import { useOverviewForOwner, useCancelSubscription } from '@/hooks/queries/useSubscription';
import {
  Mail,
  Calendar,
  Lock,
  Edit2,
  Eye,
  EyeOff,
  User,
  BarChart3,
  Building,
  Phone,
  Package as PackageIcon,
  RefreshCw,
  X,
  CheckCircle2,
  Clock,
  AlertCircle,
  MapPin,
  Search,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import type { PackageFeatureDTO as Package } from '@/dto/packageFeature.dto';
import { useLocation } from 'react-router-dom';
import ProfileSidebar from '@/components/layout/ProfileSidebar';
import { isUserDTO } from '@/utils/typeCast';
import { useChangePasswordd, useUpdateUserProfile } from '@/hooks/queries/useUsers';
import { ROLE_NAME, UserDTO } from '@/dto/user.dto';

interface ProfileFormData {
  username: string;
  email: string;
  phone?: string;
}

const Profile = () => {
  const { user } = useSessionStore();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const { data: branches = [] } = useBranchesByOwner(
  (user as UserDTO)?.userId
);
  const [formData, setFormData] = useState<ProfileFormData>({
    username: isUserDTO(user) ? user.username : "",
    email: isUserDTO(user) ? user.email : "",
    phone: isUserDTO(user) ? user.phone : "",
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Subscription state
  const [isRenewPackageOpen, setIsRenewPackageOpen] = useState(false);
  const [selectedNewPackage, setSelectedNewPackage] = useState<string>('');
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<string>('');
  const [selectedSubscription, setSelectedSubscription] = useState<any>(null);
  const [renewMode, setRenewMode] = useState<'renew' | 'upgrade'>('renew');

  // React Query hooks
  const { data: packages = [] } = usePackages();
  const { data: overviewData = [] } = useOverviewForOwner();
  const cancelMutation = useCancelSubscription();
  const updateUserProfileMutation = useUpdateUserProfile();
  const updatePasswordMutatation = useChangePasswordd();
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [selectedRestaurantForHistory, setSelectedRestaurantForHistory] = useState<any>(null);
  const [paymentPage, setPaymentPage] = useState(1);
  const [paymentSearch, setPaymentSearch] = useState('');
  const paymentsPerPage = 5;

  const location = useLocation();
  const activePath = location.pathname;
  const getSectionFromPath = (): 'overview' | 'subscription' | 'branches' => {
    if (activePath.endsWith('/subscription')) return 'subscription';
    if (activePath.endsWith('/branches')) return 'branches';
    return 'overview';
  };
  const activeSection = getSectionFromPath();

  useEffect(() => {
    if (selectedRestaurantId && overviewData.length > 0) {
      const selected = overviewData.find(sub => sub.restaurantId === selectedRestaurantId);
      setSelectedSubscription(selected || null);
    } else {
      setSelectedSubscription(null);
    }
  }, [selectedRestaurantId, overviewData]);

  const typedUser = isUserDTO(user) ? user : null;

  const handleEditProfile = () => {
    setFormData({
      username: typedUser?.username || '',
      email: typedUser?.email || '',
      phone: typedUser?.phone || '',
    });
    setIsEditDialogOpen(true);
  };

  const handleSaveProfile = async () => {
    if (!formData.username || !formData.email || !formData.phone) {
      toast({
        variant: 'destructive',
        title: 'Validation Error',
        description: 'Username and email are required.',
      });
      return;
    }
    try {
      await updateUserProfileMutation.mutateAsync({
        email: formData.email,
        phone: formData.phone,
        username: formData.username,
        role: {
          name: ROLE_NAME.RESTAURANT_OWNER,
        },
        userId: isUserDTO(user) ? user.userId : "",
        status: true,
      });
      setIsEditDialogOpen(false);
    }
    catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update profile, please check your inputs',
      });
    }
  };

  const handleChangePassword = async () => {
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

    const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[\W_]).{8,}$/;
    if (!passwordRegex.test(passwordData.newPassword)) {
      toast({
        variant: 'destructive',
        title: 'Supa Weak Password',
        description:
          'Password must contain at least one digit, one lowercase letter, one uppercase letter, one special character, and be at least 8 characters long.',
      });
      return;
    }

    try {
      await updatePasswordMutatation.mutateAsync({
        userId: isUserDTO(user) ? user.userId : "",
        password: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      setIsChangePasswordOpen(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    }
    catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to change password. Please check your current password and try again.',
      });
    }
  };

  const handleRenew = (restaurantId: string, currentPackageId: string) => {
    const restaurant = overviewData.find(r => r.restaurantId === restaurantId);
    if (!restaurant) return;

    const params = new URLSearchParams();
    params.append('restaurantId', restaurantId);
    params.append('restaurantName', restaurant.restaurantName);
    params.append('packageId', currentPackageId);
    params.append('action', 'renew');

    navigate(`/register/confirm?${params.toString()}`);
  };

  const handleUpgradePackageClick = (restaurantId: string, currentPackageId: string) => {
    const currentPkg = packages.find(p => p.packageId === currentPackageId);
    if (!currentPkg) return;

    if (currentPkg.name.toLowerCase().includes('premium')) {
      toast({
        title: "Highest Package Reached",
        description: "You are using Premium package - highest package at current.",
        variant: "default",
      });
      return;
    }

    setSelectedRestaurantId(restaurantId);
    setRenewMode('upgrade');
    setIsRenewPackageOpen(true); // Mở dialog chọn gói mới
  };

  const handlePackageConfirm = () => {
    if (!selectedNewPackage || !selectedRestaurantId) {
      toast({ variant: 'destructive', title: 'Error', description: 'Please select a package.' });
      return;
    }

    const restaurant = overviewData.find(r => r.restaurantId === selectedRestaurantId);
    if (!restaurant) return;

    // Navigate to RegisterConfirm with restaurant data and action (renew/change)
    const params = new URLSearchParams();
    params.append('restaurantId', selectedRestaurantId);
    params.append('restaurantName', restaurant.restaurantName);
    params.append('packageId', selectedNewPackage);
    params.append('action', renewMode); // 'renew' or 'uprade'

    navigate(`/register/confirm?${params.toString()}`);
    setIsRenewPackageOpen(false);
    setSelectedNewPackage('');
    setSelectedRestaurantId('');
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
      <main className="flex-1 overflow-auto ml-72 relative">
        <div className="max-w-7xl mx-auto w-full px-2 md:px-8 py-8 space-y-6 animate-fade-in">
          {/* Render main section by sidebar click */}
          {activeSection === 'overview' && (
            <div className="space-y-6">
              <Card className="overflow-hidden border-2">
                <div className="h-24 bg-gradient-to-r from-primary/20 to-secondary/20"></div>
                <CardContent className="pt-0">
                  <div className="flex flex-col md:flex-row gap-6 -mt-12 relative z-10">
                    {/* change this avater to default img */}
                    <Avatar className="h-24 w-24 border-4 border-background ring-2 ring-primary/20">
                      <AvatarImage src="https://res.cloudinary.com/dyrg3lfjf/image/upload/v1762009884/menu_item_image/file_r1egrl.jpg" alt={typedUser?.username} />
                      <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-primary-foreground text-2xl font-bold">
                        {typedUser?.username?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 pt-2">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="space-y-2">
                          <h1 className="text-3xl font-bold">{typedUser?.username}</h1>
                        </div>
                        <div className="flex gap-2">
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
                                  <Label htmlFor="phone">Phone </Label>
                                  <Input id="phone" type="tel" value={formData.phone || ''} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                                </div>
                                <Button onClick={handleSaveProfile} className="w-full">Save Changes</Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              {/* Contact Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Mail className="w-5 h-5" /> Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs uppercase text-muted-foreground">Email Address</Label>
                      <p className="font-medium flex items-center gap-2"><Mail className="w-4 h-4 text-primary" /> {typedUser?.email}</p>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs uppercase text-muted-foreground">Phone Number</Label>
                      <p className="font-medium flex items-center gap-2"><Phone className="w-4 h-4 text-primary" />{typedUser?.phone}</p>
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
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PackageIcon className="w-5 h-5" />
                    Subscription Management
                  </CardTitle>
                  <CardDescription>
                    View and manage subscriptions for all your restaurants
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {overviewData.length > 0 ? (
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Restaurant</TableHead>
                            <TableHead>Package</TableHead>
                            <TableHead>Price</TableHead>
                            <TableHead>Period</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-center">Days Left</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {overviewData.map((sub) => {
                            const current = sub.currentSubscription;
                            const daysLeft = current ? getDaysUntilExpiry(current.endDate) : null;
                            const isActive = current?.status === 'ACTIVE';
                            const isExpiringSoon = isActive && daysLeft !== null && daysLeft <= 3 && daysLeft > 0;

                            return (
                              <TableRow key={sub.restaurantId}>
                                <TableCell className="font-medium max-w-[220px] truncate">
                                  {sub.restaurantName}
                                </TableCell>
                                <TableCell className="whitespace-nowrap">
                                  {current ? getPackageName(current.packageId) : '—'}
                                </TableCell>
                                <TableCell className="whitespace-nowrap">
                                  {current ? `${current.amount?.toLocaleString()} VND` : '—'}
                                </TableCell>
                                <TableCell className="text-xs">
                                  {current ? (
                                    <>
                                      {new Date(current.startDate).toLocaleDateString()} <br />
                                      <span className="text-muted-foreground">
                                        to {new Date(current.endDate).toLocaleDateString()}
                                      </span>
                                    </>
                                  ) : '—'}
                                </TableCell>
                                <TableCell>
                                  {current ? getStatusBadge(current.status) : <Badge variant="outline">None</Badge>}
                                </TableCell>
                                <TableCell className="text-center">
                                  {daysLeft !== null ? (
                                    daysLeft > 0 ? (
                                      <span className={daysLeft <= 3 ? 'text-orange-600 font-medium' : 'text-green-600'}>
                                        {daysLeft} day{daysLeft !== 1 ? 's' : ''}
                                      </span>
                                    ) : (
                                      <span className="text-red-600">Expired</span>
                                    )
                                  ) : '—'}
                                </TableCell>
                                <TableCell className="text-right">
                                  <div className="flex items-center justify-end gap-1">

                                    {/* History Button */}
                                    {sub.paymentHistory?.length > 0 && (
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="h-8 w-8 p-0"
                                        onClick={() => {
                                          setSelectedRestaurantForHistory(sub);
                                          setPaymentDialogOpen(true);
                                          setPaymentPage(1);
                                          setPaymentSearch('');
                                        }}
                                      >
                                        <Clock className="w-3.5 h-3.5" />
                                      </Button>
                                    )}

                                    {/* Renew */}
                                    {isActive && (
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="h-8 w-8 p-0"
                                        onClick={() => handleRenew(sub.restaurantId, current?.packageId)}
                                        title="Renew Subscription"
                                      >
                                        <RefreshCw className="w-3.5 h-3.5" />
                                      </Button>
                                    )}

                                    {/* Cancel */}
                                    {isActive && (
                                      <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                          <Button size="sm" variant="destructive" className="h-8 w-8 p-0">
                                            <X className="w-3.5 h-3.5" />
                                          </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                          <AlertDialogHeader>
                                            <AlertDialogTitle>Cancel Subscription?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                              Cancel subscription for <strong>{sub.restaurantName}</strong>
                                              <br />
                                              <strong>This action cannot be undone.</strong>
                                            </AlertDialogDescription>
                                          </AlertDialogHeader>
                                          <AlertDialogFooter>
                                            <AlertDialogCancel>Keep</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => cancelMutation.mutate(current.subscriptionId)}>
                                              Yes, Cancel
                                            </AlertDialogAction>
                                          </AlertDialogFooter>
                                        </AlertDialogContent>
                                      </AlertDialog>
                                    )}

                                    {/* Change Package */}
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="h-8 w-8 p-0"
                                      onClick={() => handleUpgradePackageClick(sub.restaurantId, current?.packageId)}
                                      disabled={!isActive}
                                      title="Upgrade Package"
                                    >
                                      <PackageIcon className="w-3.5 h-3.5" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      <PackageIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p className="text-xl font-medium mb-2">No restaurants available</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Payment History Dialog */}
              <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
                <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Clock className="w-5 h-5" />
                      Payment History
                    </DialogTitle>
                    <DialogDescription>
                      {selectedRestaurantForHistory?.restaurantName} ({selectedRestaurantForHistory?.paymentHistory?.length || 0} payments)
                    </DialogDescription>
                  </DialogHeader>

                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by order code, tx, or date..."
                      value={paymentSearch}
                      onChange={(e) => {
                        setPaymentSearch(e.target.value);
                        setPaymentPage(1);
                      }}
                      className="pl-10"
                    />
                  </div>

                  {/* Payments List */}
                  <div className="flex-1 overflow-y-auto space-y-3">
                    {(() => {
                      if (!selectedRestaurantForHistory?.paymentHistory?.length) {
                        return (
                          <div className="text-center py-12 text-muted-foreground">
                            <PackageIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
                            <p>No payment history</p>
                          </div>
                        );
                      }

                      const filtered = selectedRestaurantForHistory.paymentHistory.filter((p: any) => {
                        const search = paymentSearch.toLowerCase();
                        return (
                          p.payOsOrderCode?.toLowerCase().includes(search) ||
                          p.payOsTransactionCode?.toLowerCase().includes(search) ||
                          new Date(p.date).toLocaleDateString().includes(search)
                        );
                      });

                      const start = (paymentPage - 1) * paymentsPerPage;
                      const end = start + paymentsPerPage;
                      const paginated = filtered.slice(start, end);

                      if (paginated.length === 0 && paymentPage > 1) {
                        setPaymentPage(1);
                        return null;
                      }

                      return paginated.map((payment: any) => (
                        <div
                          key={payment.subscriptionPaymentId}
                          className="p-4 border rounded-lg bg-card hover:shadow-md transition-shadow"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <span className="text-xl font-bold text-primary">
                              {payment.amount.toLocaleString()} VND
                            </span>
                            <Badge
                              variant={payment.subscriptionPaymentStatus === 'SUCCESS' ? 'default' : 'secondary'}
                            >
                              {payment.subscriptionPaymentStatus}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-muted-foreground">
                            <div>
                              <span className="font-medium">Date:</span>{' '}
                              {payment.date ? new Date(payment.date).toLocaleDateString('vi-VN') : 'N/A'}
                            </div>
                            <div>
                              <span className="font-medium">Purpose:</span>{' '}
                              <Badge variant="outline" className="text-xs">
                                {payment.purpose === 'RENEW' ? 'Renew' :
                                  payment.purpose === 'UPGRADE' ? 'Upgrade' :
                                    payment.purpose === 'NEW_SUBSCRIPTION' ? 'New Subscription' :
                                      'N/A'}
                              </Badge>
                            </div>
                            <div>
                              <span className="font-medium">Order:</span>{' '}
                              <code className="text-xs bg-muted px-1 rounded">{payment.payOsOrderCode || 'N/A'}</code>
                            </div>
                            {payment.payOsTransactionCode && (
                              <div>
                                <span className="font-medium">Tx:</span>{' '}
                                <code className="text-xs bg-muted px-1 rounded">{payment.payOsTransactionCode}</code>
                              </div>
                            )}
                          </div>
                        </div>
                      ));
                    })()}
                  </div>

                  {/* Pagination */}
                  {selectedRestaurantForHistory?.paymentHistory?.length > 0 && (
                    <div className="flex items-center justify-between border-t pt-4">
                      <p className="text-sm text-muted-foreground">
                        Page {paymentPage} of {Math.ceil(selectedRestaurantForHistory.paymentHistory.length / paymentsPerPage)}
                      </p>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={paymentPage === 1}
                          onClick={() => setPaymentPage(p => p - 1)}
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={paymentPage >= Math.ceil(selectedRestaurantForHistory.paymentHistory.length / paymentsPerPage)}
                          onClick={() => setPaymentPage(p => p + 1)}
                        >
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </DialogContent>
              </Dialog>
            </div>
          )}

          {activeSection === 'branches' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="w-5 h-5" />
                  Your Branches
                </CardTitle>
                <CardDescription>
                  Manage all branches across your restaurants
                </CardDescription>
              </CardHeader>s
              <CardContent>
                {branches.length > 0 ? (
                  <div className="space-y-8">
                    {/* Group branches by restaurant */}
                    {Object.entries(
                      branches.reduce((acc, branch: any) => {
                        const restaurantName = branch.restaurantName || 'Unnamed Restaurant';
                        if (!acc[restaurantName]) {
                          acc[restaurantName] = {
                            restaurantId: branch.restaurantId,
                            branches: [],
                          };
                        }
                        acc[restaurantName].branches.push(branch);
                        return acc;
                      }, {} as Record<string, { restaurantId: string; branches: any[] }>)
                    )
                      .sort(([a], [b]) => a.localeCompare(b))
                      .map(([restaurantName, { branches: restaurantBranches }]) => (
                        <div key={restaurantName} className="space-y-4">
                          {/* Restaurant Header */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-primary/10 rounded-lg">
                                <Building className="w-6 h-6 text-primary" />
                              </div>
                              <div>
                                <h3 className="text-xl font-bold">{restaurantName}</h3>
                                <p className="text-sm text-muted-foreground">
                                  {restaurantBranches.length} branch{restaurantBranches.length > 1 ? 'es' : ''}
                                </p>
                              </div>
                            </div>
                            <Badge variant="secondary" className="text-sm">
                              {restaurantBranches.filter(b => b.isActive).length} active
                            </Badge>
                          </div>

                          {/* Branch List */}
                          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {restaurantBranches.map((branch: any) => (
                              <div
                                key={branch.branchId}
                                className="relative p-5 border rounded-xl bg-card hover:shadow-lg transition-all duration-200 hover:border-primary/50"
                              >
                                {/* Active Indicator */}
                                {branch.isActive && (
                                  <div className="absolute top-3 right-3 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                                )}

                                <div className="space-y-3">
                                  <div>
                                    <p className="font-semibold text-lg leading-tight">{branch.address}</p>
                                    {branch.branchName && (
                                      <p className="text-sm text-muted-foreground mt-1">{branch.branchName}</p>
                                    )}
                                  </div>

                                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <MapPin className="w-4 h-4" />
                                    <span className="truncate">{branch.branchPhone || branch.mail || 'No contact'}</span>
                                  </div>

                                  <div className="flex items-center gap-3 text-xs">
                                    <Badge variant={branch.isActive ? 'default' : 'secondary'}>
                                      {branch.isActive ? 'Active' : 'Inactive'}
                                    </Badge>
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                      <Clock className="w-3.5 h-3.5" />
                                      <span>
                                        {branch.openingTime || '?'} - {branch.closingTime || '?'}
                                      </span>
                                    </div>
                                  </div>

                                  <div className="pt-2">
                                    <Button variant="outline" size="sm" className="w-full">
                                      Manage Branch
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <Building className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
                    <p className="text-xl font-medium text-muted-foreground">No branches yet</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Create your first restaurant to start adding branches
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </main>
      {/* Package Selection Dialog */}
      <Dialog open={isRenewPackageOpen} onOpenChange={setIsRenewPackageOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {renewMode === 'renew' ? 'Renew Subscription' : 'Upgrade Package'}
            </DialogTitle>
            <DialogDescription>
              {renewMode === 'renew'
                ? 'Select a package to renew your subscription'
                : 'Select a new package to upgrade your subscription'
              }
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 max-h-[60vh] overflow-y-auto">
            {(() => {
              const upgradablePackages = packages.filter((pkg: Package) => {
                const currentSub = overviewData.find(r => r.restaurantId === selectedRestaurantId)?.currentSubscription;
                if (!currentSub?.packageId) return false;
                const currentPkg = packages.find(p => p.packageId === currentSub.packageId);
                return currentPkg && pkg.price > currentPkg.price;
              });

              if (upgradablePackages.length === 0) {
                return (
                  <div className="text-center py-16 text-muted-foreground">
                    <PackageIcon className="w-16 h-16 mx-auto mb-4 opacity-40" />
                    <p className="text-lg font-semibold">You are using the highest package</p>
                    <p className="text-sm mt-1">No higher packages for upgrade.</p>
                  </div>
                );
              }

              return upgradablePackages.map((pkg: Package) => (
                <div
                  key={pkg.packageId}
                  className={`p-4 border rounded-lg cursor-pointer transition ${selectedNewPackage === pkg.packageId
                    ? 'border-primary bg-primary/5'
                    : 'hover:border-primary/50 hover:bg-muted/50'
                    }`}
                  onClick={() => setSelectedNewPackage(pkg.packageId)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-semibold text-lg">{pkg.name}</p>
                      <p className="text-sm text-muted-foreground">{pkg.description}</p>
                    </div>
                  </div>
                  <p className="text-lg font-bold text-primary mt-2">
                    {pkg.price.toLocaleString()} VND/month
                  </p>
                </div>
              ));
            })()}
          </div>
          <div className="flex gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setIsRenewPackageOpen(false);
                setSelectedNewPackage('');
              }}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handlePackageConfirm}
              className="flex-1"
              disabled={!selectedNewPackage}
            >
              {renewMode === 'renew' ? 'Continue to renew' : 'Continue to upgrade'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

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