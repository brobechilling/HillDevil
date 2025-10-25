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
}