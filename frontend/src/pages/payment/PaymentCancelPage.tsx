import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { XCircle } from "lucide-react";
import { motion } from "framer-motion";

const PaymentCancelPage = () => {
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
              <XCircle className="w-16 h-16 text-destructive animate-pulse" />
            </div>
            <CardTitle className="text-2xl font-bold text-foreground">
              Payment Failed or Canceled ❌
            </CardTitle>
            <CardDescription className="text-muted-foreground mt-2">
              It seems the transaction was canceled or an error occurred. Please try again later.
            </CardDescription>
          </CardHeader>
          <CardContent className="mt-6 space-y-3">
            <Button className="w-full" onClick={() => navigate(-1)}>
              Go Back
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => navigate("/dashboard")}
            >
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default PaymentCancelPage;
