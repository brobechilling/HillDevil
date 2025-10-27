import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "@/hooks/use-toast";
import { useSessionStore } from "@/store/sessionStore";
import { usePackages } from "@/hooks/queries/usePackages";
import { Building2, Store, Warehouse } from "lucide-react";
import { registrationApi } from "@/api/registrationApi";
import { RestaurantCreateRequest } from "@/dto/restaurant.dto";
import { UserDTO } from "@/dto/user.dto";

const brandSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Restaurant name is required")
    .max(100, "Restaurant name must be less than 100 characters"),
  description: z
    .string()
    .max(500, "Description must be less than 500 characters")
    .optional(),
  email: z.string().email("Invalid email address").optional(),
  phone: z.string().min(10, "Phone number must be at least 10 digits").optional(),
});

type BrandFormData = z.infer<typeof brandSchema>;

const RegisterConfirm = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, isAuthenticated, isLoading: isSessionLoading, initialize } = useSessionStore();
  const { data: packages, isLoading: isPackagesLoading } = usePackages();
  const [submitting, setSubmitting] = useState(false);
  const packageId = searchParams.get("packageId") || "";

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BrandFormData>({
    resolver: zodResolver(brandSchema),
  });

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    if (isSessionLoading) return;
    if (!isAuthenticated) {
      const returnUrl = `/register/confirm?packageId=${packageId}`;
      navigate(`/register?returnUrl=${encodeURIComponent(returnUrl)}`);
      return;
    }

    if (user && !(user as UserDTO).userId) {
      toast({
        variant: "destructive",
        title: "Permission denied",
        description: "Only owner accounts can access this page.",
      });
      navigate("/");
    }
  }, [isAuthenticated, isSessionLoading, navigate, packageId, user]);

  const selectedPackage =
    packages?.find((p) => p.packageId === packageId) || packages?.[0];

  const getPackageIcon = (name: string) => {
    if (name.toLowerCase().includes("basic")) return Store;
    if (name.toLowerCase().includes("professional")) return Building2;
    if (name.toLowerCase().includes("enterprise")) return Warehouse;
    return Store;
  };
  const Icon = selectedPackage ? getPackageIcon(selectedPackage.name) : Store;

  const formatPrice = (price: number, billingPeriod: number | string) =>
    typeof billingPeriod === "string"
      ? `$${price}/${billingPeriod.toLowerCase()}`
      : `${price} VND/month`;

  const onSubmit = async (data: BrandFormData) => {
    if (!isAuthenticated || !user || !selectedPackage) return;
    if (submitting) return;
    setSubmitting(true);

    try {
      const owner = user as UserDTO;

      const restaurantDto: RestaurantCreateRequest = {
        name: data.name,
        description: data.description,
        email: data.email,
        restaurantPhone: data.phone,
        userId: owner.userId,
      };

      const payment = await registrationApi.registerRestaurant(
        restaurantDto,
        selectedPackage.packageId
      );

      toast({
        title: "Restaurant created successfully!",
        description: "Redirecting you to payment page...",
      });

      navigate(`/payment/${payment.payOsOrderCode}`, { state: payment });
    } catch (err: any) {
      console.error(err);
      toast({
        variant: "destructive",
        title: "Error creating restaurant",
        description: err.message || "Please try again.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (isPackagesLoading) return <div className="flex justify-center p-10">Loading...</div>;
  if (!selectedPackage) return <p>No package selected.</p>;

  return (
    <div className="min-h-screen bg-muted/30 py-12 px-4">
      <div className="container max-w-4xl space-y-6">
        <h1 className="text-3xl font-bold text-center">
          Confirm & Create Restaurant
        </h1>

        {/* Owner Info */}
        <Card>
          <CardHeader>
            <CardTitle>Owner Profile</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback>
                {user && (user as UserDTO).username?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{(user as UserDTO)?.username}</p>
              <p className="text-muted-foreground">{(user as UserDTO)?.email}</p>
            </div>
          </CardContent>
        </Card>

        {/* Package Info */}
        <Card>
          <CardHeader>
            <CardTitle>Selected Package</CardTitle>
          </CardHeader>
          <CardContent className="flex items-start gap-4">
            <div className="p-3 bg-primary/10 rounded-lg">
              <Icon className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h3 className="text-xl font-bold">{selectedPackage.name}</h3>
              <p className="text-lg text-primary font-semibold">
                {formatPrice(
                  selectedPackage.price,
                  selectedPackage.billingPeriod
                )}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Restaurant Form */}
        <Card>
          <CardHeader>
            <CardTitle>Restaurant Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <Label htmlFor="name">Restaurant Name *</Label>
                <Input
                  id="name"
                  {...register("name")}
                  placeholder="e.g. Tokyo Sushi Bar"
                />
                {errors.name && (
                  <p className="text-destructive text-sm">
                    {errors.name.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" {...register("email")} />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" {...register("phone")} />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" {...register("description")} />
              </div>
              <Button type="submit" disabled={submitting} className="w-full">
                {submitting ? "Processing..." : "Finish & Create Restaurant"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RegisterConfirm;
