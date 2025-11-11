import { useSearchParams, useNavigate } from "react-router-dom";
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
import { useSessionStore } from "@/store/sessionStore";
import { usePackages } from "@/hooks/queries/usePackages";
import {
  useRegisterRestaurant,
  useRenewSubscription,
  useChangePackage,
} from "@/hooks/queries/useRestaurantSubscription";
import { Building2, Store, Warehouse, Loader2 } from "lucide-react";
import { RestaurantCreateRequest } from "@/dto/restaurant.dto";
import { UserDTO } from "@/dto/user.dto";
import { useToast } from "@/hooks/use-toast";

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
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useSessionStore();
  const { toast } = useToast();

  const { data: packages, isLoading: isPackagesLoading } = usePackages();
  const registerMutation = useRegisterRestaurant();
  const renewMutation = useRenewSubscription();
  const changeMutation = useChangePackage();

  const packageId = searchParams.get("packageId") || "";
  const restaurantId = searchParams.get("restaurantId") || "";
  const restaurantName = searchParams.get("restaurantName") || "";
  const action = (searchParams.get("action") || "register") as "register" | "renew" | "change";

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BrandFormData>({
    resolver: zodResolver(brandSchema),
  });

  const selectedPackage =
    packages?.find((p) => p.packageId === packageId) || packages?.[0];

  const getPackageIcon = (name: string) => {
    if (name.toLowerCase().includes("basic")) return Store;
    if (name.toLowerCase().includes("premium")) return Building2;
    if (name.toLowerCase().includes("enterprise")) return Warehouse;
    return Store;
  };
  const Icon = selectedPackage ? getPackageIcon(selectedPackage.name) : Store;

  const formatPrice = (price: number, billingPeriod: number | string) =>
    typeof billingPeriod === "string"
      ? `$${price}/${billingPeriod.toLowerCase()}`
      : `${price} VND/month`;

  // === XỬ LÝ ĐĂNG KÝ MỚI ===
  const handleRegister = (data: BrandFormData) => {
    if (!user || !selectedPackage) return;

    const owner = user as UserDTO;
    const restaurantDto: RestaurantCreateRequest = {
      name: data.name,
      description: data.description,
      email: data.email,
      restaurantPhone: data.phone,
      userId: owner.userId,
    };

    console.log("Register mutation starting...", restaurantDto);
    registerMutation.mutate(
      { data: restaurantDto, packageId: selectedPackage.packageId },
      {
        onSuccess: (payment: any) => {
          toast({ title: "Restaurant created!", description: "Redirecting to payment..." });
          navigate(`/payment/${payment.payOsOrderCode}`, { state: { ...payment, restaurantName: data.name } });
        },
        onError: (error: any) => {
          toast({ variant: "destructive", title: "Failed", description: error.message || "Try again." });
        },
      }
    );
  };

  const handleProceedPayment = () => {
    if (!selectedPackage || !restaurantId) {
      toast({ variant: "destructive", title: "Error", description: "Missing data. Try again." });
      return;
    }

    const commonData = {
      restaurantId,
      packageId: selectedPackage.packageId,
      restaurantName,
    };

    console.log(`${action === "renew" ? "Renew" : "Change"} starting...`, commonData);

    if (action === "renew") {
      renewMutation.mutate(commonData as any, {
        onSuccess: (payment: any) => {
          console.log("Renew success:", payment);
          toast({ title: "Renewal initiated!", description: "Redirecting to payment..." });
          navigate(`/payment/${payment.payOsOrderCode}`, { state: { ...payment, restaurantName } });
        },
        onError: (error: any) => {
          console.error("Renew failed:", error);
          toast({ variant: "destructive", title: "Renew failed", description: error.message || "Try again." });
        },
      });
    } else if (action === "change") {
      changeMutation.mutate(
        { ...commonData, newPackageId: selectedPackage.packageId } as any,
        {
          onSuccess: (payment: any) => {
            console.log("Change package success:", payment);
            toast({ title: "Package changed!", description: "Redirecting to payment..." });
            navigate(`/payment/${payment.payOsOrderCode}`, { state: { ...payment, restaurantName } });
          },
          onError: (error: any) => {
            console.error("Change package failed:", error);
            toast({ variant: "destructive", title: "Change failed", description: error.message || "Try again." });
          },
        }
      );
    }
  };

  if (isPackagesLoading)
    return <div className="flex justify-center p-10">Loading packages...</div>;
  if (!selectedPackage)
    return <div className="flex justify-center p-10 text-destructive">No package selected.</div>;

  const isRegisterMode = action === "register";
  const isPending = registerMutation.isPending || renewMutation.isPending || changeMutation.isPending;
  const title = isRegisterMode
    ? "Confirm & Create Restaurant"
    : action === "renew"
      ? "Renew Subscription"
      : "Change Package";

  return (
    <div className="min-h-screen bg-muted/30 py-12 px-4">
      <div className="container max-w-4xl space-y-6">
        <h1 className="text-3xl font-bold text-center">{title}</h1>

        {/* Owner Info - Register */}
        {isRegisterMode && (
          <Card>
            <CardHeader>
              <CardTitle>Owner Profile</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarFallback>
                  {(user as UserDTO)?.username?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{(user as UserDTO)?.username}</p>
                <p className="text-muted-foreground">{(user as UserDTO)?.email}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Restaurant Info - Renew/Change */}
        {!isRegisterMode && (
          <Card>
            <CardHeader>
              <CardTitle>Restaurant Info</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-medium text-lg">{restaurantName || "Unknown Restaurant"}</p>
            </CardContent>
          </Card>
        )}

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
                {formatPrice(selectedPackage.price, selectedPackage.billingPeriod)}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Form - Chỉ cho Register */}
        {isRegisterMode && (
          <Card>
            <CardHeader>
              <CardTitle>Restaurant Details</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(handleRegister)} className="space-y-4">
                <div>
                  <Label htmlFor="name">Restaurant Name *</Label>
                  <Input id="name" {...register("name")} placeholder="e.g. Tokyo Sushi Bar" />
                  {errors.name && <p className="text-destructive text-sm">{errors.name.message}</p>}
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" {...register("email")} type="email" />
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" {...register("phone")} />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" {...register("description")} rows={3} />
                </div>
                <Button type="submit" disabled={isPending} className="w-full">
                  {registerMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {registerMutation.isPending ? "Processing..." : "Finish & Create Restaurant"}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons - Renew / Change */}
        {!isRegisterMode && (
          <Card>
            <CardHeader>
              <CardTitle>Confirm {action === "renew" ? "Renewal" : "Package Change"}</CardTitle>
            </CardHeader>
            <CardContent className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => window.history.back()}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button
                onClick={handleProceedPayment}
                disabled={isPending || !restaurantId || !selectedPackage}
                className="flex-1"
              >
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isPending ? "Processing..." : "Proceed to Payment"}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default RegisterConfirm;