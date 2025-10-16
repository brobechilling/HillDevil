import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Check, Building2, Store, Warehouse } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const packageSchema = z.object({
  packageType: z.enum(['default', 'pro', 'enterprise']),
});

type PackageFormData = z.infer<typeof packageSchema>;

const packages = [
  {
    id: 'default',
    name: 'Basic',
    price: '$49/month',
    icon: Store,
    features: ['1-3 Branches', 'Basic Analytics', 'Email Support', 'QR Ordering'],
    customization: {
      landing: false,
      theme: false,
      layout: false,
      avatarBanner: true,
    }
  },
  {
    id: 'pro',
    name: 'Professional',
    price: '$99/month',
    icon: Building2,
    features: ['Up to 10 Branches', 'Advanced Analytics', 'Priority Support', 'Custom Branding', 'Staff Management', 'Theme Customization', 'Layout Options'],
    popular: true,
    customization: {
      landing: true,
      theme: true,
      layout: true,
      avatarBanner: true,
      imageGallery: true,
    }
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 'Custom',
    icon: Warehouse,
    features: ['Unlimited Branches', 'Real-time Analytics', '24/7 Support', 'White Label', 'API Access', 'Dedicated Manager', 'Full Customization', 'Image Sliders'],
    customization: {
      landing: true,
      theme: true,
      layout: true,
      avatarBanner: true,
      imageGallery: true,
      slider: true,
    }
  },
];

const RegisterPackage = () => {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<PackageFormData>({
    resolver: zodResolver(packageSchema),
    defaultValues: {
      packageType: 'pro',
    },
  });

  const selectedPackage = watch('packageType');

  const onSubmit = (data: PackageFormData) => {
    // Navigate to confirmation page with packageId
    navigate(`/register/confirm?packageId=${data.packageType}`);
  };

  return (
    <div className="min-h-screen bg-muted/30 py-12 px-4">
      <div className="container max-w-6xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Choose Your Plan</h1>
          <p className="text-lg text-muted-foreground">Select the perfect package for your restaurant business</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-6 md:grid-cols-3 mb-8">
            {packages.map((pkg) => (
              <Card
                key={pkg.id}
                className={`relative cursor-pointer transition-smooth hover:shadow-medium ${
                  selectedPackage === pkg.id ? 'border-primary shadow-medium ring-2 ring-primary' : 'border-border/50'
                }`}
                onClick={() => setValue('packageType', pkg.id as 'default' | 'pro' | 'enterprise', { shouldValidate: true })}
              >
                {pkg.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary text-primary-foreground text-sm font-medium rounded-full">
                    Most Popular
                  </div>
                )}
                {selectedPackage === pkg.id && (
                  <div className="absolute top-4 right-4 bg-primary text-primary-foreground rounded-full p-1">
                    <Check className="h-5 w-5" />
                  </div>
                )}
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <pkg.icon className="h-10 w-10 text-primary" />
                  </div>
                  <CardTitle className="text-2xl">{pkg.name}</CardTitle>
                  <CardDescription className="text-2xl font-bold text-foreground">{pkg.price}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {pkg.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="flex justify-center">
            <Button type="submit" size="lg" className="min-w-[200px]">
              Next: Confirm Details
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterPackage;
