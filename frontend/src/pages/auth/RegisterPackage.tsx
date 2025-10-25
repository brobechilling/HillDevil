import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, Building2, Store, Warehouse } from 'lucide-react';
import { usePackages } from '@/hooks/queries/usePackages';
import { useSessionStore } from '@/store/sessionStore';

const packageSchema = z.object({
  packageType: z.string(),
});

type PackageFormData = z.infer<typeof packageSchema>;

const RegisterPackage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, initialize } = useSessionStore();
  const { data: packages, isLoading, error } = usePackages();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<PackageFormData>({
    resolver: zodResolver(packageSchema),
    defaultValues: {
      packageType: '',
    },
  });

  const selectedPackage = watch('packageType');

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    if (packages && packages.length > 0) {
      const defaultPackage = packages.find(pkg => pkg.name.toLowerCase().includes('professional')) || packages[0];
      setValue('packageType', defaultPackage.packageId, { shouldValidate: true });
    }
  }, [packages, setValue]);

  const onSubmit = (data: PackageFormData) => {
    if (!isAuthenticated) {
      const returnUrl = `/register/confirm?packageId=${data.packageType}`;
      navigate(`/register?returnUrl=${encodeURIComponent(returnUrl)}`);
    } else {
      navigate(`/register/confirm?packageId=${data.packageType}`);
    }
  };

  const getPackageIcon = (name: string) => {
    if (name.toLowerCase().includes('basic')) return Store;
    if (name.toLowerCase().includes('professional')) return Building2;
    if (name.toLowerCase().includes('enterprise')) return Warehouse;
    return Store;
  };

  const isPopular = (name: string) => {
    return name.toLowerCase().includes('professional');
  };

  const formatPrice = (price: number, billingPeriod: number | string) => {
    if (typeof billingPeriod === 'string') {
      return `$${price}/${billingPeriod.toLowerCase()}`;
    }
    return `${price}VND/month`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-muted/30 py-12 px-4">
        <div className="container max-w-6xl">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Choose Your Plan</h1>
            <p className="text-lg text-muted-foreground">Select the perfect package for your restaurant business</p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="h-96 bg-muted rounded animate-pulse"></div>
            <div className="h-96 bg-muted rounded animate-pulse"></div>
            <div className="h-96 bg-muted rounded animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-muted/30 py-12 px-4">
        <div className="container max-w-6xl">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Choose Your Plan</h1>
            <p className="text-lg text-muted-foreground">Select the perfect package for your restaurant business</p>
          </div>
          <p className="text-center text-destructive">Error loading packages. Please try again later.</p>
        </div>
      </div>
    );
  }

  if (!packages || packages.length === 0) {
    return (
      <div className="min-h-screen bg-muted/30 py-12 px-4">
        <div className="container max-w-6xl">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Choose Your Plan</h1>
            <p className="text-lg text-muted-foreground">Select the perfect package for your restaurant business</p>
          </div>
          <p className="text-center text-muted-foreground">No packages available at the moment.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 py-12 px-4">
      <div className="container max-w-6xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Choose Your Plan</h1>
          <p className="text-lg text-muted-foreground">Select the perfect package for your restaurant business</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-6 md:grid-cols-3 mb-8">
            {packages.map((pkg) => {
              const PackageIcon = getPackageIcon(pkg.name);
              return (
                <Card
                  key={pkg.packageId}
                  className={`relative cursor-pointer transition-smooth hover:shadow-medium ${
                    selectedPackage === pkg.packageId ? 'border-primary shadow-medium ring-2 ring-primary' : 'border-border/50'
                  }`}
                  onClick={() => setValue('packageType', pkg.packageId, { shouldValidate: true })}
                >
                  {isPopular(pkg.name) && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary text-primary-foreground text-sm font-medium rounded-full">
                      Most Popular
                    </div>
                  )}
                  {selectedPackage === pkg.packageId && (
                    <div className="absolute top-4 right-4 bg-primary text-primary-foreground rounded-full p-1">
                      <Check className="h-5 w-5" />
                    </div>
                  )}
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <PackageIcon className="h-10 w-10 text-primary" />
                    </div>
                    <CardTitle className="text-2xl">{pkg.name}</CardTitle>
                    <CardDescription className="text-2xl font-bold text-foreground">
                      {formatPrice(pkg.price, pkg.billingPeriod)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {pkg.features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                          <span className="text-sm">{feature.featureName}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              );
            })}
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