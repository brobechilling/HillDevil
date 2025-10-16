import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { toast } from '@/hooks/use-toast';
import { useAuthStore } from '@/store/authStore';
import { Check, Building2 } from 'lucide-react';

const brandSchema = z.object({
  name: z.string().trim().min(1, 'Restaurant name is required').max(100, 'Restaurant name must be less than 100 characters'),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
  email: z.string().email('Invalid email address').optional(),
  phone: z.string().min(10, 'Phone number must be at least 10 digits').optional(),
});

type BrandFormData = z.infer<typeof brandSchema>;

const packages = [
  { id: 'default', name: 'Basic', price: '$49/month', features: ['1-3 Branches', 'Basic Analytics', 'Email Support'] },
  { id: 'pro', name: 'Professional', price: '$99/month', features: ['Up to 10 Branches', 'Advanced Analytics', 'Priority Support'] },
  { id: 'enterprise', name: 'Enterprise', price: 'Custom', features: ['Unlimited Branches', 'Real-time Analytics', '24/7 Support'] },
];

const RegisterConfirm = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuthStore();
  const [submitting, setSubmitting] = useState(false);
  const packageId = searchParams.get('packageId') || 'pro';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BrandFormData>({
    resolver: zodResolver(brandSchema),
  });

  useEffect(() => {
    if (!user) {
      const returnUrl = `/register/confirm?packageId=${packageId}`;
      navigate(`/login?returnUrl=${encodeURIComponent(returnUrl)}`);
    }
  }, [user, navigate, packageId]);

  const selectedPackage = packages.find(p => p.id === packageId) || packages[1];

  const onSubmit = async (data: BrandFormData) => {
    if (!user) return;

    setSubmitting(true);
    try {
      // Create restaurant
      const brandId = `brand_${Date.now()}`;
      const newBrand = {
        id: brandId,
        name: data.name,
        description: data.description || '',
        email: data.email || '',
        phone: data.phone || '',
        ownerId: user.id,
        packageType: packageId,
        totalBranches: 0,
        status: 'active',
        established: new Date().getFullYear().toString(),
        createdAt: new Date().toISOString(),
      };

      // Save to localStorage
      const brands = JSON.parse(localStorage.getItem('mock_brands') || '[]');
      brands.push(newBrand);
      localStorage.setItem('mock_brands', JSON.stringify(brands));

      // Set as selected brand
      localStorage.setItem('selected_brand', data.name);

      toast({
        title: 'Restaurant created successfully!',
        description: `Welcome to ${data.name}. Let's set up your first branch.`,
      });

      navigate('/dashboard/owner/overview');
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error creating restaurant',
        description: 'Please try again.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 py-12 px-4">
      <div className="container max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Confirm & Create Restaurant</h1>
          <p className="text-lg text-muted-foreground">Review your details and set up your restaurant</p>
        </div>

        <div className="grid gap-6">
          {/* Owner Profile Card (Read-only) */}
          <Card>
            <CardHeader>
              <CardTitle>Owner Profile</CardTitle>
              <CardDescription>Your account information</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="text-lg">{user.name.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="grid gap-2 flex-1">
                  <div>
                    <Label className="text-muted-foreground text-xs">Name</Label>
                    <p className="font-medium">{user.name}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground text-xs">Email</Label>
                    <p className="font-medium">{user.email}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Package Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Selected Package</CardTitle>
              <CardDescription>Your subscription plan</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-primary/10">
                  <Building2 className="h-8 w-8 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold">{selectedPackage.name}</h3>
                  <p className="text-2xl font-bold text-primary mt-1">{selectedPackage.price}</p>
                  <ul className="mt-4 space-y-2">
                    {selectedPackage.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm">
                        <Check className="h-4 w-4 text-primary" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Restaurant Setup Form */}
          <Card>
            <CardHeader>
              <CardTitle>Restaurant Details</CardTitle>
              <CardDescription>Create your restaurant</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Restaurant Name *</Label>
                  <Input
                    id="name"
                    {...register('name')}
                    placeholder="e.g., My Restaurant Chain"
                  />
                  {errors.name && (
                    <p className="text-sm text-destructive">{errors.name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Restaurant Email</Label>
                  <Input
                    id="email"
                    type="email"
                    {...register('email')}
                    placeholder="contact@restaurant.com"
                  />
                  {errors.email && (
                    <p className="text-sm text-destructive">{errors.email.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Restaurant Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    {...register('phone')}
                    placeholder="+1 (555) 123-4567"
                  />
                  {errors.phone && (
                    <p className="text-sm text-destructive">{errors.phone.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Restaurant Description</Label>
                  <Textarea
                    id="description"
                    {...register('description')}
                    placeholder="Tell us about your restaurant..."
                    rows={3}
                  />
                  {errors.description && (
                    <p className="text-sm text-destructive">{errors.description.message}</p>
                  )}
                </div>

                <div className="flex gap-4 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => navigate('/register/package')}
                    disabled={submitting}
                  >
                    Back
                  </Button>
                  <Button type="submit" className="flex-1" disabled={submitting}>
                    {submitting ? 'Creating...' : 'Finish & Create Restaurant'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default RegisterConfirm;
