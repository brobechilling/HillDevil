import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Upload, X } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const landingSchema = z.object({
  brandName: z.string().min(3, 'Brand name must be at least 3 characters'),
  tagline: z.string().max(100, 'Tagline must be less than 100 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  phone: z.string().min(10, 'Valid phone number required'),
  email: z.string().email('Valid email required'),
  branches: z.array(z.object({
    address: z.string().min(10, 'Address must be at least 10 characters'),
  })),
});

type LandingFormData = z.infer<typeof landingSchema>;

const CustomLanding = () => {
  const navigate = useNavigate();
  const [logo, setLogo] = useState<string | null>(null);
  const [bannerImage, setBannerImage] = useState<string | null>(null);
  const selectedPackage = JSON.parse(localStorage.getItem('selected_package') || '{}');
  const branchCount = selectedPackage.branches || 1;

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<LandingFormData>({
    resolver: zodResolver(landingSchema),
    defaultValues: {
      branches: Array.from({ length: branchCount }, () => ({ address: '' })),
    },
  });

  const handleImageUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    setImage: (url: string | null) => void
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = (data: LandingFormData) => {
    // Get selected package and user info from localStorage
    const selectedPackage = JSON.parse(localStorage.getItem('selected_package') || '{}');
    const currentUser = JSON.parse(localStorage.getItem('mock_auth_user') || '{}');
    
    // Generate unique short code for the branch
    const shortCode = data.brandName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      + '-' + Date.now().toString(36);
    
    // Create new branch data with all required fields
    const newBranch = {
      id: Date.now().toString(),
      name: data.brandName,
      shortCode,
      brandName: data.brandName,
      tagline: data.tagline || '',
      description: data.description || '',
      address: data.branches[0].address,
      phone: data.phone,
      email: data.email,
      logoUrl: logo,
      bannerUrl: bannerImage,
      packageType: selectedPackage.packageType,
      ownerId: currentUser.id,
      managerId: null,
      status: 'active',
      createdAt: new Date().toISOString(),
    };
    
    // Store branch data in localStorage
    // Add all branch addresses
    const branches = data.branches.map((b, idx) => ({
      ...newBranch,
      id: `${Date.now()}_${idx}`,
      address: b.address,
    }));
    const existingBranches = JSON.parse(localStorage.getItem('mock_branches') || '[]');
    existingBranches.push(...branches);
    localStorage.setItem('mock_branches', JSON.stringify(existingBranches));
    
    // Store landing page configuration
    const landingConfig = {
      ...data,
      logo,
      bannerImage,
      shortCode,
    };
    localStorage.setItem('landing_config', JSON.stringify(landingConfig));
    
    // Set this as the selected brand
    localStorage.setItem('selected_brand', JSON.stringify(newBranch));
    
    toast({
      title: 'Setup Complete!',
      description: 'Your restaurant is ready. Welcome to your dashboard!',
    });

    // Navigate to owner dashboard
    navigate('/dashboard/owner');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background py-12 px-4">
      <div className="container max-w-5xl">
        <div className="text-center mb-12 space-y-4">
          <div className="inline-block px-4 py-1.5 bg-primary/10 rounded-full mb-4">
            <span className="text-sm font-medium text-primary">Step 2 of 2</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Customize Your Brand</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Create a stunning landing page that represents your restaurant's unique identity
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Visual Assets Section */}
          <Card className="border-2 overflow-hidden">
            <CardHeader className="bg-muted/50">
              <CardTitle className="flex items-center gap-2 text-foreground">
                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Upload className="h-4 w-4 text-primary" />
                </div>
                Visual Identity
              </CardTitle>
              <CardDescription className="text-muted-foreground">Upload your logo and hero banner to make your page stand out</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Logo Upload */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Brand Logo</Label>
                  <div className="flex items-center justify-center">
                    {logo ? (
                      <div className="relative group">
                        <img 
                          src={logo} 
                          alt="Logo" 
                          className="w-40 h-40 object-cover rounded-2xl border-2 border-border shadow-lg" 
                        />
                        <button
                          type="button"
                          onClick={() => setLogo(null)}
                          className="absolute -top-3 -right-3 bg-destructive text-destructive-foreground rounded-full p-2 shadow-lg hover:scale-110 transition-transform"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <label className="w-40 h-40 flex flex-col items-center justify-center border-2 border-dashed border-border rounded-2xl cursor-pointer hover:border-primary hover:bg-primary/5 transition-all group">
                        <Upload className="h-10 w-10 text-muted-foreground group-hover:text-primary transition-colors" />
                        <span className="text-sm font-medium text-muted-foreground mt-3 group-hover:text-primary">Upload Logo</span>
                        <span className="text-xs text-muted-foreground mt-1">PNG, JPG up to 5MB</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleImageUpload(e, setLogo)}
                        />
                      </label>
                    )}
                  </div>
                </div>

                {/* Banner Upload */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Hero Banner</Label>
                  <div className="flex items-center justify-center">
                    {bannerImage ? (
                      <div className="relative w-full group">
                        <img 
                          src={bannerImage} 
                          alt="Banner" 
                          className="w-full h-40 object-cover rounded-2xl border-2 border-border shadow-lg" 
                        />
                        <button
                          type="button"
                          onClick={() => setBannerImage(null)}
                          className="absolute top-2 right-2 bg-destructive text-destructive-foreground rounded-full p-2 shadow-lg hover:scale-110 transition-transform"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <label className="w-full h-40 flex flex-col items-center justify-center border-2 border-dashed border-border rounded-2xl cursor-pointer hover:border-primary hover:bg-primary/5 transition-all group">
                        <Upload className="h-10 w-10 text-muted-foreground group-hover:text-primary transition-colors" />
                        <span className="text-sm font-medium text-muted-foreground mt-3 group-hover:text-primary">Upload Banner</span>
                        <span className="text-xs text-muted-foreground mt-1">Wide image, 1920x600 recommended</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleImageUpload(e, setBannerImage)}
                        />
                      </label>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Brand Details */}
          <Card className="border-2 overflow-hidden">
            <CardHeader className="bg-muted/50">
              <CardTitle className="text-foreground">Brand Story</CardTitle>
              <CardDescription className="text-muted-foreground">Tell your customers what makes you special</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-5">
              <div className="space-y-2">
                <Label htmlFor="brandName" className="text-sm font-medium">Restaurant Name *</Label>
                <Input 
                  {...register('brandName')} 
                  id="brandName" 
                  placeholder="e.g., Bella Italia, The Golden Spoon" 
                  className="h-11"
                />
                {errors.brandName && <p className="text-sm text-destructive mt-1.5">{errors.brandName.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="tagline" className="text-sm font-medium">Tagline</Label>
                <Input 
                  {...register('tagline')} 
                  id="tagline" 
                  placeholder="e.g., Where Every Meal is a Celebration" 
                  className="h-11"
                />
                {errors.tagline && <p className="text-sm text-destructive mt-1.5">{errors.tagline.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-medium">Description *</Label>
                <Textarea
                  {...register('description')}
                  id="description"
                  placeholder="Share your story, cuisine style, and what makes your restaurant unique..."
                  rows={4}
                  className="resize-none"
                />
                {errors.description && <p className="text-sm text-destructive mt-1.5">{errors.description.message}</p>}
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card className="border-2 overflow-hidden">
            <CardHeader className="bg-muted/50">
              <CardTitle className="text-foreground">Contact Details</CardTitle>
              <CardDescription className="text-muted-foreground">How guests can reach and find you</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-5">
              <div className="grid gap-5 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm font-medium">Phone Number *</Label>
                  <Input 
                    {...register('phone')} 
                    id="phone" 
                    type="tel" 
                    placeholder="+1 (555) 123-4567" 
                    className="h-11"
                  />
                  {errors.phone && <p className="text-sm text-destructive mt-1.5">{errors.phone.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">Email Address *</Label>
                  <Input 
                    {...register('email')} 
                    id="email" 
                    type="email" 
                    placeholder="contact@restaurant.com" 
                    className="h-11"
                  />
                  {errors.email && <p className="text-sm text-destructive mt-1.5">{errors.email.message}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="branches.0.address" className="text-sm font-medium">Primary Branch Address *</Label>
                <Input 
                  {...register('branches.0.address')} 
                  id="branches.0.address" 
                  placeholder="123 Main Street, City, State, ZIP Code" 
                  className="h-11"
                />
                {errors.branches?.[0]?.address && <p className="text-sm text-destructive mt-1.5">{errors.branches[0]?.address?.message}</p>}
              </div>
            </CardContent>
          </Card>

          {/* Branch Addresses */}
          <Card className="border-2 overflow-hidden">
            <CardHeader className="bg-muted/50">
              <CardTitle className="text-foreground">Branch Addresses</CardTitle>
              <CardDescription className="text-muted-foreground">Specify the addresses for each branch</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-5">
              <div className="grid gap-6 md:grid-cols-2">
                {Array.from({ length: branchCount }).map((_, idx) => (
                  <div key={idx} className="mb-4">
                    <Label htmlFor={`branches.${idx}.address`}>Branch {idx + 1} Address</Label>
                    <Input
                      {...register(`branches.${idx}.address` as const)}
                      id={`branches.${idx}.address`}
                      placeholder="Enter full address"
                      className="h-11"
                    />
                    {errors.branches?.[idx]?.address && (
                      <p className="text-sm text-destructive mt-1">{errors.branches[idx]?.address?.message}</p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-4">
            <Button 
              type="button" 
              variant="outline" 
              size="lg" 
              className="flex-1"
              onClick={() => navigate('/setup/package')}
            >
              Back
            </Button>
            <Button type="submit" size="lg" className="flex-1 shadow-lg hover:shadow-xl transition-shadow">
              Complete Setup & Launch Dashboard
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CustomLanding;
