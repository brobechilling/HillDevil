export interface SubscriptionPaymentResponse {
  subscriptionPaymentId: string;
  amount: number;
  payOsOrderCode: string;
  payOsTransactionCode?: string;
  qrCodeUrl: string;
  accountNumber: string;
  accountName: string;
  expiredAt: string;
  description: string;
  subscriptionPaymentStatus: "PENDING" | "SUCCESS" | "FAILED" | "CANCELED";
  date: string;
  protatedAmount: number;
  purpose: string;
  restaurantId: string;
  restaurantName: string;
}

export interface TopSpenderDTO {
  userId: string;
  username: string;
  email: string;
  totalSpent: number;
}