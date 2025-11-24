import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
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
  useUpgradeRestaurantPackage,
} from "@/hooks/queries/useRestaurantSubscription";
import { Building2, Store, Warehouse, Loader2, ArrowRight, Check } from "lucide-react";
import { RestaurantCreateRequest } from "@/dto/restaurant.dto";
import { UserDTO } from "@/dto/user.dto";
import { useToast } from "@/hooks/use-toast";
import { SubscriptionPaymentResponse } from "@/dto/subscriptionPayment.dto";
import { motion, AnimatePresence } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";

const brandSchema = z.object({
  name: z.string().trim().min(1, "Restaurant name is required").max(100),
  description: z.string().max(500).optional(),
  email: z.string().email("Invalid email address").optional(),
  phone: z.string().min(10, "Phone number must be at least 10 digits").optional(),
});

type BrandFormData = z.infer<typeof brandSchema>;

const RegisterConfirm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSessionStore();
  const { toast } = useToast();

  const { data: packages, isLoading: isPackagesLoading } = usePackages();
  const registerMutation = useRegisterRestaurant();
  const renewMutation = useRenewSubscription();
  const upgradeMutation = useUpgradeRestaurantPackage();

  const state = location.state as {
    action?: "register" | "renew" | "upgrade";
    packageId?: string;
    restaurantId?: string;
    restaurantName?: string;
    currentPackageId?: string;
  } | undefined;

  // Get packageId from query string (for register flow) or state (for renew/upgrade)
  const queryParams = new URLSearchParams(location.search);
  const queryPackageId = queryParams.get("packageId");
  
  const action = state?.action ?? "register";
  const packageId = queryPackageId || state?.packageId || "";
  const isRegisterMode = action === "register";

  const [restaurantInfo] = useState(
    state?.restaurantId && state?.restaurantName
      ? {
        restaurantId: state.restaurantId,
        restaurantName: state.restaurantName,
      }
      : null
  );

  const [showComparison, setShowComparison] = useState(false);

  const { register, handleSubmit, formState: { errors } } =
    useForm<BrandFormData>({
      resolver: zodResolver(brandSchema),
    });

  const selectedPackage =
    packages?.find((p) => p.packageId === packageId) || packages?.[0];

  const currentPackage = 
    action === "upgrade" && state?.currentPackageId
      ? packages?.find((p) => p.packageId === state.currentPackageId)
      : null;

  const isPending =
    registerMutation.isPending ||
    renewMutation.isPending ||
    upgradeMutation.isPending;

  useEffect(() => {
    if (action === "upgrade" && currentPackage && selectedPackage) {
      const timer = setTimeout(() => setShowComparison(true), 300);
      return () => clearTimeout(timer);
    }
  }, [action, currentPackage, selectedPackage]);

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

  const handleRegister = (data: BrandFormData) => {
    if (!user || !selectedPackage) return;

    const restaurantDto: RestaurantCreateRequest = {
      name: data.name,
      description: data.description,
      email: data.email,
      restaurantPhone: data.phone,
      userId: (user as UserDTO).userId,
    };

    registerMutation.mutate(
      { data: restaurantDto, packageId: selectedPackage.packageId },
      {
        onSuccess: (payment: SubscriptionPaymentResponse) => {
          toast({ title: "Restaurant created!", description: "Redirecting to payment..." });
          navigate(`/payment/${payment.payOsOrderCode}`, { 
            state: {
              ...payment,
              restaurantId: payment.restaurantId,
              restaurantName: payment.restaurantName,
            }
          });
        },
        onError: (error: any) => {
          toast({
            variant: "destructive",
            title: "Failed",
            description: error.message || "Try again.",
          });
        },
      }
    );
  };

  const handleProceedPayment = () => {
    if (!selectedPackage || !restaurantInfo?.restaurantId) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Missing restaurant info.",
      });
      return;
    }

    const rid = restaurantInfo.restaurantId;

    if (action === "renew") {
      renewMutation.mutate(
        { restaurantId: rid },
        {
          onSuccess: (payment) => {
            // Pass complete restaurant context in navigation state
            navigate(`/payment/${payment.payOsOrderCode}`, { 
              state: {
                ...payment,
                restaurantId: payment.restaurantId || rid,
                restaurantName: payment.restaurantName || restaurantInfo.restaurantName,
              }
            });
          },
          onError: (error: any) =>
            toast({
              variant: "destructive",
              title: "Renew failed",
              description: error.message || "Try again.",
            }),
        }
      );
    } else if (action === "upgrade") {
      upgradeMutation.mutate(
        { restaurantId: rid, newPackageId: selectedPackage.packageId },
        {
          onSuccess: (payment) => {
            // Pass complete restaurant context in navigation state
            navigate(`/payment/${payment.payOsOrderCode}`, { 
              state: {
                ...payment,
                restaurantId: payment.restaurantId || rid,
                restaurantName: payment.restaurantName || restaurantInfo.restaurantName,
              }
            });
          },
          onError: (error: any) =>
            toast({
              variant: "destructive",
              title: "Upgrade failed",
              description: error.message || "Try again.",
            }),
        }
      );
    }
  };

  const title =
    isRegisterMode
      ? "Confirm & Create Restaurant"
      : action === "renew"
        ? "Renew Subscription"
        : "Change Package";

  if (isPackagesLoading) {
    return (
      <div className="min-h-screen bg-muted/30 py-12 px-4">
        <div className="container max-w-4xl space-y-6">
          <Skeleton className="h-10 w-64 mx-auto" />
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-40" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-24 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!selectedPackage)
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-center p-10 text-destructive"
      >
        No package selected.
      </motion.div>
    );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen bg-muted/30 py-12 px-4"
    >
      <div className="container max-w-4xl space-y-6">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="text-3xl font-bold text-center"
        >
          {title}
        </motion.h1>

        {/* Owner Info - Register */}
        {isRegisterMode && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
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
                  <p className="text-muted-foreground">
                    {(user as UserDTO)?.email}
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Restaurant Info - Renew/Change */}
        {!isRegisterMode && restaurantInfo && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Restaurant Info</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-medium text-lg">
                  {restaurantInfo.restaurantName}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Package Info - with comparison for upgrades */}
        {selectedPackage && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>
                  {action === "upgrade" ? "Package Upgrade" : "Selected Package"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Package Comparison for Upgrades */}
                {action === "upgrade" && currentPackage && (
                  <AnimatePresence>
                    {showComparison && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.5 }}
                        className="mb-6"
                      >
                        <div className="grid grid-cols-3 gap-4 items-center">
                          {/* Current Package */}
                          <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.4, delay: 0.2 }}
                            className="flex flex-col items-center p-4 border rounded-lg bg-muted/50"
                          >
                            <div className="p-2 bg-muted rounded-lg mb-2">
                              {(() => {
                                const CurrentIcon = getPackageIcon(currentPackage.name);
                                return <CurrentIcon className="h-6 w-6 text-muted-foreground" />;
                              })()}
                            </div>
                            <p className="text-sm font-medium text-muted-foreground">Current</p>
                            <p className="font-semibold text-center">{currentPackage.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {formatPrice(currentPackage.price, currentPackage.billingPeriod)}
                            </p>
                          </motion.div>

                          {/* Arrow */}
                          <motion.div
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.4, delay: 0.4 }}
                            className="flex justify-center"
                          >
                            <ArrowRight className="h-8 w-8 text-primary" />
                          </motion.div>

                          {/* New Package */}
                          <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.4, delay: 0.6 }}
                            className="flex flex-col items-center p-4 border-2 border-primary rounded-lg bg-primary/5"
                          >
                            <div className="p-2 bg-primary/10 rounded-lg mb-2">
                              <Icon className="h-6 w-6 text-primary" />
                            </div>
                            <p className="text-sm font-medium text-primary">Upgrading to</p>
                            <p className="font-bold text-center">{selectedPackage.name}</p>
                            <p className="text-sm text-primary font-semibold">
                              {formatPrice(selectedPackage.price, selectedPackage.billingPeriod)}
                            </p>
                          </motion.div>
                        </div>

                        {/* Benefits */}
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.4, delay: 0.8 }}
                          className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg"
                        >
                          <div className="flex items-start gap-2">
                            <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                            <p className="text-sm text-green-800">
                              You'll only pay the prorated difference for the remaining time in your current billing cycle.
                            </p>
                          </div>
                        </motion.div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                )}

                {/* Standard Package Display */}
                {action !== "upgrade" && (
                  <div className="flex items-start gap-4">
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
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Form - Register */}
        {isRegisterMode && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Restaurant Details</CardTitle>
              </CardHeader>
              <CardContent>
                <form
                  onSubmit={handleSubmit(handleRegister)}
                  className="space-y-4"
                >
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.5 }}
                  >
                    <Label htmlFor="name">Restaurant Name *</Label>
                    <Input
                      id="name"
                      {...register("name")}
                      placeholder="e.g. Tokyo Sushi Bar"
                      disabled={isPending}
                    />
                    <AnimatePresence>
                      {errors.name && (
                        <motion.p
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="text-destructive text-sm mt-1"
                        >
                          {errors.name.message}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.6 }}
                  >
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      id="email" 
                      {...register("email")} 
                      type="email"
                      disabled={isPending}
                    />
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.7 }}
                  >
                    <Label htmlFor="phone">Phone</Label>
                    <Input 
                      id="phone" 
                      {...register("phone")}
                      disabled={isPending}
                    />
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.8 }}
                  >
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      {...register("description")}
                      rows={3}
                      disabled={isPending}
                    />
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.9 }}
                  >
                    <motion.div
                      whileHover={{ scale: isPending ? 1 : 1.02 }}
                      whileTap={{ scale: isPending ? 1 : 0.98 }}
                    >
                      <Button type="submit" disabled={isPending} className="w-full">
                        {registerMutation.isPending && (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        {registerMutation.isPending
                          ? "Processing..."
                          : "Finish & Create Restaurant"}
                      </Button>
                    </motion.div>
                  </motion.div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Action Buttons - Renew / Upgrade */}
        {!isRegisterMode && restaurantInfo && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>
                  Confirm {action === "renew" ? "Renewal" : "Package Change"}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex gap-3">
                <motion.div
                  whileHover={{ scale: isPending ? 1 : 1.02 }}
                  whileTap={{ scale: isPending ? 1 : 0.98 }}
                  className="flex-1"
                >
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => navigate("/profile/subscription")}
                    disabled={isPending}
                  >
                    Cancel
                  </Button>
                </motion.div>
                <motion.div
                  whileHover={{ scale: isPending ? 1 : 1.02 }}
                  whileTap={{ scale: isPending ? 1 : 0.98 }}
                  className="flex-1"
                >
                  <Button
                    onClick={handleProceedPayment}
                    className="w-full"
                    disabled={isPending}
                  >
                    {isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    {isPending ? "Processing..." : "Proceed to Payment"}
                  </Button>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default RegisterConfirm;
