import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { restaurantSubscriptionApi } from "@/api/restaurantSubscriptionApi";
import { RestaurantCreateRequest } from "@/dto/restaurant.dto";
import { toast } from "@/hooks/use-toast";

export const useRegisterRestaurant = () => {
  const qc = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: ({ data, packageId }: { data: RestaurantCreateRequest; packageId: string }) =>
      restaurantSubscriptionApi.registerRestaurant(data, packageId),
    onSuccess: (payment) => {
      toast({
        title: "Restaurant created successfully!",
        description: "Redirecting you to payment page...",
      });
      qc.invalidateQueries({ queryKey: ["subscriptions", "overview"] });
      navigate(`/payment/${payment.payOsOrderCode}`, { state: payment });
    },
    onError: (err: any) => {
      toast({
        variant: "destructive",
        title: "Error creating restaurant",
        description: err.message || "Please try again.",
      });
    },
  });
};

export const useRenewSubscription = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ restaurantId, packageId }: { restaurantId: string; packageId: string }) => {
      console.log("🔄 useRenewSubscription mutationFn called with:", {restaurantId, packageId});
      return restaurantSubscriptionApi.renewSubscription(restaurantId, packageId);
    },
    onSuccess: (data) => {
      console.log("🔄 useRenewSubscription onSuccess with data:", data);
      qc.invalidateQueries({ queryKey: ["subscriptions"] });
      // Component handles navigation and toast
    },
    onError: (err: any) => {
      console.error("🔄 useRenewSubscription onError:", err);
      toast({
        variant: "destructive",
        title: "Error renewing subscription",
        description: err.message || "Please try again.",
      });
    },
  });
};

export const useChangePackage = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ restaurantId, newPackageId }: { restaurantId: string; newPackageId: string }) => {
      console.log("📦 useChangePackage mutationFn called with:", {restaurantId, newPackageId});
      return restaurantSubscriptionApi.changePackage(restaurantId, newPackageId);
    },
    onSuccess: (data) => {
      console.log("📦 useChangePackage onSuccess with data:", data);
      qc.invalidateQueries({ queryKey: ["subscriptions"] });
      // Component handles navigation and toast
    },
    onError: (err: any) => {
      console.error("📦 useChangePackage onError:", err);
      toast({
        variant: "destructive",
        title: "Error changing package",
        description: err.message || "Please try again.",
      });
    },
  });
};
