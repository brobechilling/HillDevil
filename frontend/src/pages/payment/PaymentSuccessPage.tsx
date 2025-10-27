import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function PaymentSuccessPage() {
  const navigate = useNavigate();

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
              <CheckCircle2 className="text-green-500 w-16 h-16 animate-pulse" />
            </div>
            <CardTitle className="text-2xl font-bold text-foreground">
              Payment Successful 🎉
            </CardTitle>
            <CardDescription className="text-muted-foreground mt-2">
              Thank you for completing your payment. Your order is now being processed.
            </CardDescription>
          </CardHeader>
          <CardContent className="mt-6 space-y-3">
            <Button className="w-full" onClick={() => navigate("/dashboard")}>
              Back to Dashboard
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => navigate("/settings")}
            >
              View Order Details
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
