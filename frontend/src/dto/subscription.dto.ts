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

export interface RestaurantSubscriptionOverviewDTO {
  restaurantId: string;
  restaurantName: string;
  currentSubscription?: SubscriptionResponse | null;
  paymentHistory: SubscriptionPaymentResponse[];
}