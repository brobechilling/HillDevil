import { SubscriptionPaymentResponse } from "./subscriptionPayment.dto";

export interface SubscriptionRequest {
  restaurantId: string;
  packageId: string;
}

export interface SubscriptionResponse {
  subscriptionId: string;
  restaurantId: string;
  packageId: string;
  status: "PENDING_PAYMENT" | "ACTIVE" | "CANCELED" | "EXPIRED";
  createdAt?: string;
  updatedAt?: string;
  startDate?: string;
  endDate?: string;
  paymentInfo?: SubscriptionPaymentResponse;
  paymentStatus?: string;
  amount?: number;
}

export interface CurrentSubscriptionOverviewDTO {
  subscriptionId: string;
  packageId: string;
  status: "PENDING_PAYMENT" | "ACTIVE" | "CANCELED" | "EXPIRED";
  startDate?: string;
  endDate?: string;
  amount: number;
}

export interface RestaurantSubscriptionOverviewDTO {
  restaurantId: string;
  restaurantName: string;
  currentSubscription?: CurrentSubscriptionOverviewDTO  | null;
  paymentHistory: SubscriptionPaymentResponse[];
}

export interface ActivePackageStatsDTO {
  packageName: string;
  activeCount: number;
  paymentCount: number;
  totalRevenue: number;
}
