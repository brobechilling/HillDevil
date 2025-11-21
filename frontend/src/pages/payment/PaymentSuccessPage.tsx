import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { useEffect } from "react";
import { toast } from "@/hooks/use-toast";

export default function PaymentSuccessPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const state = location.state as {
    restaurantName?: string;
    restaurantId?: string;
    orderCode?: string;
    amount?: number;
  } | null;

  const restaurantName = state?.restaurantName || "";
  const restaurantId = state?.restaurantId || "";

  useEffect(() => {
    toast({
      title: "Payment Successful!",
      description: `Your subscription is now active${restaurantName ? ` for ${restaurantName}` : ""}.`,
    });
  }, [restaurantName]);

  const handleGoToRestaurant = () => {
    if (restaurantId && restaurantName) {
      localStorage.setItem(
        "selected_restaurant",
        JSON.stringify({ restaurantId, restaurantName })
      );

      window.dispatchEvent(
        new CustomEvent("restaurant-selected", {
          detail: { restaurantId, restaurantName },
        })
      );
    } else {
      console.warn("Missing restaurant context in payment success");
      toast({
        title: "Notice",
        description: "Please select your restaurant from the dashboard.",
      });
    }
    navigate("/dashboard/owner/overview");
  };

  return (
    <div className="min-h-screen bg-muted/30 py-12 px-4">
      <div className="container max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="space-y-6"
        >
          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="text-4xl font-bold text-center text-foreground"
          >
            Payment Successful!
          </motion.h1>

          <Card className="overflow-hidden border shadow-xl">
            <CardHeader className="text-center pb-8 pt-10 bg-gradient-to-b from-green-50 to-transparent">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{
                  duration: 0.7,
                  type: "spring",
                  stiffness: 200,
                  damping: 15,
                  delay: 0.2,
                }}
                className="flex justify-center mb-6"
              >
                <CheckCircle2 className="w-24 h-24 text-green-600 drop-shadow-md" />
              </motion.div>

              <CardTitle className="text-2xl font-bold">
                {restaurantName ? (
                  <>Subscription activated for <span className="text-green-600">{restaurantName}</span></>
                ) : (
                  "Your payment has been processed successfully"
                )}
              </CardTitle>

              <CardDescription className="mt-3 text-lg text-muted-foreground">
                You now have full access to all features.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6 px-8 pb-10">
              {state?.orderCode && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="p-6 bg-muted/50 rounded-xl border text-center"
                >
                  <p className="text-sm text-muted-foreground">Order Code</p>
                  <p className="font-mono text-xl font-bold text-foreground mt-1">
                    {state.orderCode}
                  </p>
                  {state?.amount && (
                    <>
                      <p className="text-sm text-muted-foreground mt-4">Amount Paid</p>
                      <p className="text-3xl font-bold text-green-600">
                        {state.amount.toLocaleString()} VND
                      </p>
                    </>
                  )}
                </motion.div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full font-medium"
                  onClick={() => navigate("/dashboard/owner")}
                >
                  View All Restaurants
                </Button>

                <Button
                  size="lg"
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-medium shadow-lg"
                  onClick={handleGoToRestaurant}
                >
                  Go to dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}