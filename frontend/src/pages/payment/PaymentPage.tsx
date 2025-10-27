import { useEffect, useState } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, CreditCard, Loader2, XCircle, AlertCircle } from "lucide-react";
import { useSessionStore } from "@/store/sessionStore";
import { subscriptionPaymentApi } from "@/api/subscriptionPaymentApi";
import { toast } from "@/hooks/use-toast";
import { SubscriptionPaymentResponse } from "@/dto/subscriptionPayment.dto";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { QRCodeCanvas } from "qrcode.react";

const PaymentPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const { user, isAuthenticated, initialize } = useSessionStore();
  const [loading, setLoading] = useState(true);
  const [payment, setPayment] = useState<SubscriptionPaymentResponse | null>(null);

  const orderCode = searchParams.get("orderCode");
  const restaurantName = searchParams.get("restaurantName") || "";
  const initialPayment = location.state as SubscriptionPaymentResponse | null;

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      const returnUrl = `/payment?orderCode=${orderCode}&restaurantName=${encodeURIComponent(
        restaurantName
      )}`;
      navigate(`/register?returnUrl=${encodeURIComponent(returnUrl)}`);
    }
  }, [isAuthenticated, user, navigate, orderCode, restaurantName]);

  useEffect(() => {
    const fetchPayment = async () => {
      if (initialPayment) {
        setPayment(initialPayment);
        setLoading(false);
        return;
      }

      if (!orderCode || !user) return;

      try {
        const res = await subscriptionPaymentApi.getStatus(orderCode);
        setPayment(res);
      } catch (err) {
        toast({
          variant: "destructive",
          title: "Payment initialization failed",
          description: "Please try again later.",
        });
        navigate(-1);
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchPayment();
    }
  }, [isAuthenticated, user, orderCode, initialPayment, navigate]);

  useEffect(() => {
    if (!orderCode || !isAuthenticated || !user) return;

    const interval = setInterval(async () => {
      try {
        const res = await subscriptionPaymentApi.getStatus(orderCode);
        setPayment(res);
      } catch (err) {
        console.error("Polling error:", err);
      }
    }, 3000); // 3s

    return () => clearInterval(interval);
  }, [orderCode, isAuthenticated, user]);

  // Redirect if payment is successful, failed, or canceled
  useEffect(() => {
    if (payment?.subscriptionPaymentStatus === "SUCCESS") {
      toast({
        title: "Payment successful!",
        description: "Your subscription is now active.",
      });
      navigate("/dashboard/owner/overview");
    } else if (payment?.subscriptionPaymentStatus === "FAILED" || payment?.subscriptionPaymentStatus === "CANCELED") {
      toast({
        variant: "destructive",
        title: `${payment.subscriptionPaymentStatus} Payment`,
        description: "Please try again or contact support.",
      });
      navigate(-1);
    } else if (payment && new Date(payment.expiredAt) < new Date()) {
      toast({
        variant: "destructive",
        title: "Payment Expired",
        description: "The payment link has expired. Please start a new payment.",
      });
      navigate(-1);
    }
  }, [payment, navigate]);

  const handleCancel = async () => {
    if (!payment?.payOsOrderCode) return;
    try {
      await subscriptionPaymentApi.cancel(payment.payOsOrderCode);
      toast({
        title: "Payment canceled",
        description: "You can start over if needed.",
      });
      navigate(-1);
    } catch {
      toast({
        variant: "destructive",
        title: "Error canceling payment",
        description: "Please try again.",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!payment) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <Card className="max-w-md text-center p-6">
          <CardHeader>
            <CardTitle>Payment Error</CardTitle>
            <CardDescription>Could not initialize payment session.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" onClick={() => navigate(-1)}>
              Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 py-12 px-4">
      <div className="container max-w-5xl">
        <Card>
          <CardHeader className="text-center">
            <CreditCard className="h-12 w-12 text-primary mx-auto mb-2" />
            <CardTitle className="text-2xl font-bold">Complete Your Payment</CardTitle>
            <CardDescription>
              Complete your subscription payment for <b>{restaurantName}</b>
            </CardDescription>
          </CardHeader>

          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column - Payment Details */}
            <div className="space-y-6">
              <div className="border rounded-lg p-4 bg-background/60">
                <p className="text-sm text-muted-foreground mb-2">Order Code</p>
                <p className="font-semibold">{payment.payOsOrderCode}</p>

                <p className="text-sm text-muted-foreground mt-4 mb-2">Amount</p>
                <p className="text-xl font-bold text-primary">
                  {payment.amount?.toLocaleString("en-US")} VND
                </p>

                <p className="text-sm text-muted-foreground mt-4 mb-2">Description</p>
                <p>{payment.description}</p>

                <p className="text-sm text-muted-foreground mt-4 mb-2">Status</p>
                <p
                  className={`font-medium ${
                    payment.subscriptionPaymentStatus === "SUCCESS"
                      ? "text-green-600"
                      : payment.subscriptionPaymentStatus === "FAILED" || payment.subscriptionPaymentStatus === "CANCELED"
                      ? "text-red-600"
                      : "text-yellow-600"
                  }`}
                >
                  {payment.subscriptionPaymentStatus || "PENDING"}
                </p>

                <p className="text-sm text-muted-foreground mt-4 mb-2">Expires At</p>
                <p>{new Date(payment.expiredAt).toLocaleString()}</p>
              </div>

              {/* Actions */}
              <div className="flex justify-center gap-4">
                <Button
                  variant="outline"
                  onClick={() => navigate(-1)}
                  disabled={loading}
                >
                  Back
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleCancel}
                  disabled={loading || payment.subscriptionPaymentStatus !== "PENDING"}
                >
                  Cancel Payment
                </Button>
              </div>
            </div>

            {/* Right Column - QR Code and Bank Transfer */}
            <div className="space-y-6">
              {/* QR Code Section */}
              <div className="flex flex-col items-center">
                <p className="text-sm text-muted-foreground mb-2">Scan QR Code to Pay</p>
                <QRCodeCanvas
                  value={payment.qrCodeUrl}
                  size={256}
                  includeMargin={true}
                  className="border rounded-lg shadow-sm bg-white p-2"
                />
                <p className="mt-2 text-xs text-gray-400">
                  Quét mã bằng ứng dụng ngân hàng để thanh toán
                </p>
              </div>

              {/* Bank Transfer Section */}
              <div className="border rounded-lg p-4 bg-background/60">
                <p className="text-sm text-muted-foreground mb-2">Bank Transfer Details</p>
                <p className="font-medium">Account Name: {payment.accountName}</p>
                <p className="text-lg font-mono mt-2">Account Number: {payment.accountNumber}</p>
                <p className="text-sm text-muted-foreground mt-4">
                  Please transfer the exact amount and include the order code in the description.
                </p>
              </div>
            </div>
          </CardContent>

          {/* Expired Warning (Spanning Both Columns) */}
          {new Date(payment.expiredAt) < new Date() && payment.subscriptionPaymentStatus === "PENDING" && (
            <div className="col-span-full">
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Payment Expired</AlertTitle>
                <AlertDescription>
                  The payment link has expired. Please start a new payment process.
                </AlertDescription>
              </Alert>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default PaymentPage;