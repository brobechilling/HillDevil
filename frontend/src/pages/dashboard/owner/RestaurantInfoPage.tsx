import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { getRestaurantById, updateRestaurant, deleteRestaurant } from '@/api/restaurantApi';
import { subscriptionApi } from '@/api/subscriptionApi';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

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
  const [subscription, setSubscription] = useState<any | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('selected_restaurant');
    if (!stored) {
      navigate('/brand-selection');
      return;
    }
    const selected = JSON.parse(stored) as any;
    const id = selected.restaurantId || selected.id || '';
    if (!id) {
      navigate('/brand-selection');
      return;
    }

    (async () => {
      try {
        setLoading(true);
        const res = await getRestaurantById(String(id));
        setRestaurant(res);
        setForm({
          name: res.name || '',
          email: res.email || '',
          restaurantPhone: res.restaurantPhone || '',
          publicUrl: res.publicUrl || '',
          description: res.description || '',
          status: res.status ? 'active' : 'inactive',
        });

        const sub = await subscriptionApi.getByRestaurant(String(id)).catch(() => null);
        setSubscription(sub);
      } catch (err: any) {
        toast({ variant: 'destructive', title: 'Load failed', description: err?.message || 'Could not load restaurant data.' });
      } finally {
        setLoading(false);
      }
    })();
  }, [navigate]);

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
      toast({ title: 'Deleted', description: 'Restaurant deleted.' });
      localStorage.removeItem('selected_restaurant');
      navigate('/dashboard/owner');
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Delete failed', description: err?.message || 'Failed to delete.' });
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
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
              <Input id="publicUrl" value={form.publicUrl} onChange={(e) => handleChange('publicUrl', e.target.value)} />
            </div>
            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" value={form.description} onChange={(e) => handleChange('description', e.target.value)} />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t mt-4">
            <Button variant="outline" onClick={() => setShowDeleteConfirm(true)} className="mr-auto">Delete Restaurant</Button>
            <Button onClick={handleUpdate} disabled={saving}>{saving ? 'Saving...' : 'Update'}</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Subscription</CardTitle>
          <CardDescription>Current subscription details</CardDescription>
        </CardHeader>
        <CardContent>
          {subscription ? (
            <div className="space-y-2">
              <div><strong>Package:</strong> {subscription.packageName || subscription.subscriptionName || '—'}</div>
              <div><strong>Status:</strong> {subscription.subscriptionStatus || '—'}</div>
              <div><strong>Expires At:</strong> {subscription.expiresAt || subscription.endAt || '—'}</div>
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">No subscription data available.</div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa nhà hàng</AlertDialogTitle>
            <div className="text-sm text-muted-foreground">Bạn có chắc muốn xóa nhà hàng này không?</div>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deleting}>{deleting ? 'Đang xóa...' : 'Xác nhận'}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
