import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { getRestaurantById, updateRestaurant, deleteRestaurant } from '@/api/restaurantApi';
import { subscriptionApi } from '@/api/subscriptionApi';
import { usePackages } from '@/hooks/queries/usePackages';
import { useActiveSubscriptionByRestaurant } from '@/hooks/queries/useSubscription';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { format } from 'date-fns';
import { Package, Calendar, DollarSign, AlertCircle, CheckCircle2, XCircle } from 'lucide-react';

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

  useEffect(() => {
    if (!restaurantId) {
      navigate('/brand-selection');
      return;
    }

    (async () => {
      try {
        setLoading(true);
        const res = await getRestaurantById(String(restaurantId));
        setRestaurant(res);
        setForm({
          name: res.name || '',
          email: res.email || '',
          restaurantPhone: res.restaurantPhone || '',
          publicUrl: res.publicUrl || '',
          description: res.description || '',
          status: res.status ? 'active' : 'inactive',
        });
      } catch (err: any) {
        toast({ variant: 'destructive', title: 'Load failed', description: err?.message || 'Could not load restaurant data.' });
      } finally {
        setLoading(false);
      }
    })();
  }, [restaurantId, navigate]);

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
      const updated = await updateRestaurant(String(restaurant.restaurantId || restaurant.id), payload);
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
      await deleteRestaurant(String(restaurant.restaurantId || restaurant.id));
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
    <div className="space-y-6">
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
              <div className="relative">
                <Input
                  id="publicUrl"
                  value={form.publicUrl}
                  disabled
                  className="pr-10 bg-muted/50 cursor-not-allowed"
                  placeholder="https://app.example.com/your-restaurant"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                You are not allowed to edit this field.
              </p>
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label className="text-sm text-muted-foreground">Package</Label>
                  <p className="font-medium">{activeSubscription.packageName || 'Standard Package'}</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Status</Label>
                  <div className="mt-1">{getStatusBadge(activeSubscription.status)}</div>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Amount</Label>
                  <p className="font-medium flex items-center gap-1">
                    <DollarSign className="h-4 w-4" />
                    {activeSubscription.amount?.toLocaleString() || '0'} VND
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label className="text-sm text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Start Date
                  </Label>
                  <p className="font-medium">
                    {activeSubscription.startDate ? format(new Date(activeSubscription.startDate), 'dd/MM/yyyy') : '—'}
                  </p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    End Date
                  </Label>
                  <p className="font-medium">
                    {activeSubscription.endDate ? format(new Date(activeSubscription.endDate), 'dd/MM/yyyy') : '—'}
                  </p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Payment Status</Label>
                  <p className="font-medium capitalize">{(activeSubscription.paymentStatus || 'unknown').toLowerCase()}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Package className="mx-auto h-12 w-12 mb-3 text-muted-foreground/50" />
              <p>No active subscription found for this restaurant.</p>
              <p className="text-sm mt-2">Register a package to enable full features.</p>
            </div>
          )}
        </CardContent>
      </Card>

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
    </div>
  );
}