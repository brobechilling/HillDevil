import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { useRestaurant, useUpdateRestaurant, useDeleteRestaurant } from '@/hooks/queries/useRestaurants';
import { useActiveSubscriptionByRestaurant, usePaymentHistory } from '@/hooks/queries/useSubscription';
import { usePackages } from '@/hooks/queries/usePackages';
import { motion } from 'framer-motion';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format } from 'date-fns';
import { Package, AlertCircle, CheckCircle2, XCircle, Calendar, DollarSign, Clock, Receipt } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function RestaurantInfoPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [restaurant, setRestaurant] = useState<any | null>(null);
  const [form, setForm] = useState({
    name: '',
    email: '',
    restaurantPhone: '',
    publicUrl: '',
    description: '',
    status: 'inactive',
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const selected = JSON.parse(localStorage.getItem('selected_restaurant') || '{}');
  const restaurantId = selected?.restaurantId || selected?.id;

  const { data: activeSubscription, isLoading: subLoading } = useActiveSubscriptionByRestaurant(restaurantId);

  const [showPaymentHistory, setShowPaymentHistory] = useState(false);
  const { data: paymentHistory = [], isLoading: isLoadingPayments } = usePaymentHistory(restaurantId);
  const { data: packages = [] } = usePackages();

  const getPackageName = (packageId?: string) => {
    if (!packageId) return 'Unknown Package';
    const pkg = packages.find(p => p.packageId === packageId);
    return pkg?.name || packageId;
  };

  // useQuery to fetch restaurant
  const { data: restaurantData, isLoading: isRestaurantLoading, error: restaurantError } = useRestaurant(String(restaurantId));
  const updateRestaurantMutation = useUpdateRestaurant();
  const deleteRestaurantMutation = useDeleteRestaurant();

  useEffect(() => {
    if (!restaurantId) {
      navigate('/brand-selection');
      return;
    }
  }, [restaurantId, navigate]);

  // update local states when query returns
  useEffect(() => {
    if (restaurantData) {
      setRestaurant(restaurantData);
      setForm({
        name: restaurantData.name || '',
        email: restaurantData.email || '',
        restaurantPhone: restaurantData.restaurantPhone || '',
        publicUrl: restaurantData.publicUrl || '',
        description: restaurantData.description || '',
        status: restaurantData.status ? 'active' : 'inactive',
      });
    }
    if (restaurantError) {
      toast({ variant: 'destructive', title: 'Load failed', description: (restaurantError as any)?.message || 'Could not load restaurant data.' });
    }
    setLoading(isRestaurantLoading);
  }, [restaurantData, isRestaurantLoading, restaurantError]);

  const handleChange = (k: keyof typeof form, v: string) => setForm((s) => ({ ...s, [k]: v }));

  const handleUpdate = async () => {
    if (!restaurant) return;
    setSaving(true);
    try {
      const payload: Partial<any> = {
        name: form.name,
        email: form.email,
        restaurantPhone: form.restaurantPhone,
        publicUrl: form.publicUrl,
        description: form.description,
        status: form.status === 'active',
      };
      const updated = await updateRestaurantMutation.mutateAsync({ id: String(restaurant?.restaurantId || restaurant?.id), data: payload });
      setRestaurant(updated);
      localStorage.setItem('selected_restaurant', JSON.stringify(updated));
      toast({ title: 'Updated', description: 'Restaurant updated successfully.' });
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Update failed', description: err?.message || 'Failed to update.' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!restaurant) return;
    setDeleting(true);
    try {
      await deleteRestaurantMutation.mutateAsync(String(restaurant?.restaurantId || restaurant?.id));
      toast({ title: 'Deleted', description: 'Restaurant and all subscriptions have been cancelled.' });
      localStorage.removeItem('selected_restaurant');
      navigate('/dashboard/owner');
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Delete failed', description: err?.message || 'Failed to delete.' });
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <Badge className="bg-emerald-500"><CheckCircle2 className="w-3 h-3 mr-1" /> Active</Badge>;
      case 'PENDING_PAYMENT':
        return <Badge variant="secondary"><AlertCircle className="w-3 h-3 mr-1" /> Pending</Badge>;
      case 'CANCELED':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" /> Cancelled</Badge>;
      case 'EXPIRED':
        return <Badge variant="outline"><XCircle className="w-3 h-3 mr-1" /> Expired</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPaymentBadge = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return <Badge className="bg-emerald-500">Success</Badge>;
      case 'PENDING':
        return <Badge variant="secondary">Pending</Badge>;
      case 'FAILED':
        return <Badge variant="destructive">Failed</Badge>;
      case 'CANCELED':
        return <Badge variant="outline">Canceled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  if (!restaurant) {
    return <div className="p-6">No restaurant selected.</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="space-y-6"
    >
      {/* Restaurant Info */}
      <Card>
        <CardHeader>
          <CardTitle>Restaurant Information</CardTitle>
          <CardDescription>Manage basic information for this restaurant</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" value={form.name} onChange={(e) => handleChange('name', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={form.email} onChange={(e) => handleChange('email', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" value={form.restaurantPhone} onChange={(e) => handleChange('restaurantPhone', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="publicUrl">Public URL</Label>
              <Input
                id="publicUrl"
                value={form.publicUrl}
                onChange={(e) => handleChange('publicUrl', e.target.value)}
                readOnly
                className="cursor-not-allowed bg-muted"
              />
            </div>

            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" value={form.description} onChange={(e) => handleChange('description', e.target.value)} />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t mt-4">
            <Button variant="outline" onClick={() => setShowDeleteConfirm(true)} className="mr-auto">
              Delete Restaurant
            </Button>
            <Button onClick={handleUpdate} disabled={saving}>
              {saving ? 'Saving...' : 'Update'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Subscription Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Current Subscription
          </CardTitle>
          <CardDescription>
            {activeSubscription ? 'Active subscription details' : 'No active subscription'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {subLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : activeSubscription ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-primary" />
                    <span className="text-sm text-muted-foreground">Package</span>
                  </div>
                  <p className="font-medium">{getPackageName(activeSubscription.packageId)}</p>

                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-primary" />
                    <span className="text-sm text-muted-foreground">Amount</span>
                  </div>
                  <p className="font-medium">{activeSubscription.amount?.toLocaleString() || '0.00'} VND</p>

                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-primary" />
                    <span className="text-sm text-muted-foreground">Period</span>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm">
                      Start: {activeSubscription.startDate ? format(new Date(activeSubscription.startDate), 'PPP') : 'N/A'}
                    </p>
                    <p className="text-sm">
                      End: {activeSubscription.endDate ? format(new Date(activeSubscription.endDate), 'PPP') : 'N/A'}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-primary" />
                    <span className="text-sm text-muted-foreground">Status</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(activeSubscription.status)}
                  </div>

                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-primary" />
                    <span className="text-sm text-muted-foreground">Days Remaining</span>
                  </div>
                  <p className="font-medium">
                    {activeSubscription.endDate ?
                      Math.max(0, Math.ceil((new Date(activeSubscription.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))
                      : 'N/A'} days
                  </p>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setShowPaymentHistory(true)}
                >
                  <Receipt className="w-4 h-4 mr-2" />
                  View Payment History
                </Button>
              </div>
            </>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Package className="mx-auto h-12 w-12 mb-3 text-muted-foreground/50" />
              <p>No active subscription found for this restaurant.</p>
              <p className="text-sm mt-2">Register a package to enable full features.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment History Dialog */}
      <Dialog open={showPaymentHistory} onOpenChange={setShowPaymentHistory}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Payment History</DialogTitle>
            <DialogDescription>
              View all subscription payments for this restaurant
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4">
            {isLoadingPayments ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              </div>
            ) : paymentHistory.length > 0 ? (
              <ScrollArea className="h-[400px] rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Purpose</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Description</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paymentHistory.map((payment) => (
                      <TableRow key={payment.subscriptionPaymentId}>
                        <TableCell>
                          {payment.date ? format(new Date(payment.date), 'PPP') : 'N/A'}
                        </TableCell>
                        <TableCell className="font-medium">{(payment.amount ?? 0).toLocaleString('en-US')} VND</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            {payment.purpose ? payment.purpose.toUpperCase() : 'N/A'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {getPaymentBadge(payment.subscriptionPaymentStatus)}
                        </TableCell>
                        <TableCell className="text-sm max-w-[200px] truncate">
                          {payment.description || 'N/A'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Receipt className="mx-auto h-12 w-12 mb-3 text-muted-foreground/50" />
                <p>No payment history found</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Restaurant?</AlertDialogTitle>
            <div className="text-sm text-muted-foreground space-y-2">
              <p>This action <strong>cannot be undone</strong>.</p>
              <p className="mt-2">
                All active subscriptions will be <strong>automatically cancelled</strong>.
              </p>
              <p>
                All branches, menu items, and data will be permanently deleted.
              </p>
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deleting} className="bg-destructive text-destructive-foreground">
              {deleting ? 'Deleting...' : 'Delete Restaurant'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
}