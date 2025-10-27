import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { useEffect } from "react";
import { toast } from "@/hooks/use-toast";

export default function PaymentSuccessPage() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get payment data from navigation state
  const state = location.state as { 
    restaurantName?: string; 
    orderCode?: string; 
    amount?: number;
  } | null;
  
  const restaurantName = state?.restaurantName || "";
  const orderCode = state?.orderCode || "";
  const amount = state?.amount || 0;

  useEffect(() => {
    toast({
      title: "Payment successful!",
      description: `Your subscription is now active${restaurantName ? ` for ${restaurantName}` : ""}.`,
    });
  }, [restaurantName]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted/30 p-4">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        <Card className="text-center shadow-lg border-muted/40">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, type: "spring" }}
              >
                <CheckCircle2 className="text-green-500 w-16 h-16" />
              </motion.div>
            </div>
            <CardTitle className="text-2xl font-bold text-foreground">
              Payment Successful 🎉
            </CardTitle>
            <CardDescription className="text-muted-foreground mt-2">
              {restaurantName && (
                <p className="text-lg font-semibold text-foreground mb-2">
                  Your subscription for <b>{restaurantName}</b> is now active!
                </p>
              )}
              {!restaurantName && "Thank you for completing your payment."}
            </CardDescription>
          </CardHeader>
          <CardContent className="mt-6 space-y-3">
            {orderCode && (
              <div className="p-4 bg-muted/50 rounded-lg mb-4">
                <p className="text-sm text-muted-foreground">Order Code</p>
                <p className="font-mono font-semibold">{orderCode}</p>
                {amount > 0 && (
                  <>
                    <p className="text-sm text-muted-foreground mt-2">Amount</p>
                    <p className="font-semibold text-lg">{amount.toLocaleString("en-US")} VND</p>
                  </>
                )}
              </div>
            )}
            <Button 
              className="w-full" 
              onClick={() => navigate("/dashboard/owner/overview")}
              size="lg"
            >
              Go to Dashboard
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => navigate("/dashboard/owner")}
            >
              View All Dashboards
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
