import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams, useLocation } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CreditCard, Loader2, AlertCircle, CheckCircle2, XCircle, Clock } from "lucide-react";
import { subscriptionPaymentApi } from "@/api/subscriptionPaymentApi";
import { usePaymentStatus } from "@/hooks/queries/useSubscriptionPayment";
import { toast } from "@/hooks/use-toast";
import { SubscriptionPaymentResponse } from "@/dto/subscriptionPayment.dto";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { QRCodeCanvas } from "qrcode.react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";

const PaymentPage = () => {
  const navigate = useNavigate();
  const { orderCode } = useParams();
  const [searchParams] = useSearchParams();
  const location = useLocation();

  const [loading, setLoading] = useState(true);
  const [payment, setPayment] = useState<SubscriptionPaymentResponse | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<string>("");

  // Extract restaurant context from location.state and payment response
  const initialPayment = location.state as SubscriptionPaymentResponse | null;
  const restaurantContext = {
    restaurantId: payment?.restaurantId || initialPayment?.restaurantId || "",
    restaurantName: payment?.restaurantName || initialPayment?.restaurantName || searchParams.get("restaurantName") || "",
  };

  const { data: polledPayment } = usePaymentStatus(orderCode || "");

  useEffect(() => {
    if (polledPayment) {
      setPayment(polledPayment);
    }
  }, [polledPayment]);

  useEffect(() => {
    if (initialPayment && !polledPayment) {
      setPayment(initialPayment);
    }
    setLoading(false);
  }, [initialPayment, polledPayment]);

  // Real-time countdown for payment expiration
  useEffect(() => {
    if (!payment?.expiredAt) return;

    const updateCountdown = () => {
      const now = new Date().getTime();
      const expiry = new Date(payment.expiredAt).getTime();
      const distance = expiry - now;

      if (distance < 0) {
        setTimeRemaining("Expired");
        return;
      }

      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);
      setTimeRemaining(`${minutes}m ${seconds}s`);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [payment?.expiredAt]);

  useEffect(() => {
    if (payment?.subscriptionPaymentStatus === "SUCCESS") {
      // Pass full restaurant context to success page
      navigate("/payment/success", {
        state: {
          restaurantName: restaurantContext.restaurantName,
          restaurantId: restaurantContext.restaurantId,
          orderCode,
          amount: payment.amount,
        },
      });
    } else if (
      payment?.subscriptionPaymentStatus === "FAILED" ||
      payment?.subscriptionPaymentStatus === "CANCELED"
    ) {
      toast({
        variant: "destructive",
        title: `${payment.subscriptionPaymentStatus} Payment`,
        description: "Please try again or contact support.",
      });
      setTimeout(() => navigate(-1), 2000);
    } else if (payment && new Date(payment.expiredAt) < new Date()) {
      toast({
        variant: "destructive",
        title: "Payment Expired",
        description: "The payment link has expired. Please start a new payment.",
      });
      setTimeout(() => navigate(-1), 2000);
    }
  }, [payment, navigate, restaurantContext.restaurantName, restaurantContext.restaurantId, orderCode]);

  const handleCancel = async () => {
    if (!payment?.payOsOrderCode) return;
    try {
      await subscriptionPaymentApi.cancel(payment.payOsOrderCode);
      toast({
        title: "Payment canceled",
        description: "You can start over if needed.",
      });
      navigate("/payment/cancel", { replace: true });
    } catch {
      toast({
        variant: "destructive",
        title: "Error canceling payment",
        description: "Please try again.",
      });
    }
  };

  // Enhanced status badge with icons and colors
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      SUCCESS: {
        icon: CheckCircle2,
        className: "bg-green-50 text-green-600 border-green-200",
        label: "Success",
      },
      PENDING: {
        icon: Clock,
        className: "bg-yellow-50 text-yellow-600 border-yellow-200",
        label: "Pending",
      },
      FAILED: {
        icon: XCircle,
        className: "bg-red-50 text-red-600 border-red-200",
        label: "Failed",
      },
      CANCELED: {
        icon: XCircle,
        className: "bg-gray-50 text-gray-600 border-gray-200",
        label: "Canceled",
      },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING;
    const Icon = config.icon;

    return (
      <Badge variant="outline" className={`${config.className} flex items-center gap-1`}>
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen flex items-center justify-center"
      >
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </motion.div>
    );
  }

  if (!payment) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="min-h-screen bg-muted/30 flex items-center justify-center"
      >
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
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen bg-muted/30 py-12 px-4"
    >
      <div className="container max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <Card>
            <CardHeader className="text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.3, delay: 0.2 }}
              >
                <CreditCard className="h-12 w-12 text-primary mx-auto mb-2" />
              </motion.div>
              <CardTitle className="text-2xl font-bold">Complete Your Payment</CardTitle>
              <CardDescription>
                Complete your subscription payment for <b>{restaurantContext.restaurantName}</b>
              </CardDescription>
            </CardHeader>

          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column - Payment Details */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="space-y-6"
            >
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
                <div className="flex items-center gap-2">
                  {getStatusBadge(payment.subscriptionPaymentStatus || "PENDING")}
                </div>

                <p className="text-sm text-muted-foreground mt-4 mb-2">Expires At</p>
                <div className="flex items-center gap-2">
                  <p>{new Date(payment.expiredAt).toLocaleString()}</p>
                  {timeRemaining && timeRemaining !== "Expired" && (
                    <Badge variant="secondary" className="ml-2">
                      <Clock className="h-3 w-3 mr-1" />
                      {timeRemaining}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-center gap-4">
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button variant="outline" onClick={() => navigate(-1)} disabled={loading}>
                    Back
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    variant="destructive"
                    onClick={handleCancel}
                    disabled={
                      loading || payment.subscriptionPaymentStatus !== "PENDING"
                    }
                  >
                    Cancel Payment
                  </Button>
                </motion.div>
              </div>
            </motion.div>

            {/* Right Column - QR Code and Bank Transfer */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="space-y-6"
            >
              {/* QR Code Section with Pulse Animation */}
              <div className="flex flex-col items-center">
                <p className="text-sm text-muted-foreground mb-2">Scan QR Code to Pay</p>
                <motion.div
                  animate={{
                    scale: [1, 1.02, 1],
                    boxShadow: [
                      "0 0 0 0 rgba(59, 130, 246, 0)",
                      "0 0 0 10px rgba(59, 130, 246, 0.1)",
                      "0 0 0 0 rgba(59, 130, 246, 0)",
                    ],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="rounded-lg"
                >
                  <QRCodeCanvas
                    value={payment.qrCodeUrl}
                    size={256}
                    includeMargin={true}
                    className="border rounded-lg shadow-sm bg-white p-2"
                  />
                </motion.div>
                <p className="mt-2 text-xs text-gray-400">
                  Quét mã bằng ứng dụng ngân hàng để thanh toán
                </p>
              </div>

              {/* Bank Transfer Section */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.5 }}
                className="border rounded-lg p-4 bg-background/60"
              >
                <p className="text-sm text-muted-foreground mb-2">Bank Transfer Details</p>
                <p className="font-medium">Account Name: {payment.accountName}</p>
                <p className="text-lg font-mono mt-2">Account Number: {payment.accountNumber}</p>
                <p className="text-sm text-muted-foreground mt-4">
                  Please transfer the exact amount and include the order code in the description.
                </p>
              </motion.div>
            </motion.div>
          </CardContent>

          {/* Expired Warning */}
          <AnimatePresence>
            {new Date(payment.expiredAt) < new Date() &&
              payment.subscriptionPaymentStatus === "PENDING" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="col-span-full px-6 pb-6"
                >
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Payment Expired</AlertTitle>
                    <AlertDescription>
                      The payment link has expired. Please start a new payment process.
                    </AlertDescription>
                  </Alert>
                </motion.div>
              )}
          </AnimatePresence>
        </Card>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default PaymentPage;