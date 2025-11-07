import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UtensilsCrossed, ArrowLeft } from "lucide-react";
import { RestaurantList } from "@/components/auth/RestaurantList";
import { RestaurantLoginForm } from "@/components/auth/RestaurantLoginForm";
import { RestaurantDTO } from "@/dto/restaurant.dto";

export default function RestaurantLoginPage() {
  const [selectedRestaurant, setSelectedRestaurant] = useState<RestaurantDTO | null>(null);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center gradient-hero p-4">
      <Card className="w-full max-w-2xl shadow-large">
        <CardHeader className="space-y-4 text-center">
          <div className="flex items-center justify-between mb-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/login')}
              className="gap-2 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Login
            </Button>
            <div className="flex-1" />
          </div>
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl gradient-primary">
            <UtensilsCrossed className="h-8 w-8 text-primary-foreground" />
          </div>
          <div>
            <CardTitle className="text-2xl">Restaurant Staff Login</CardTitle>
            <CardDescription className="text-base">
              {selectedRestaurant
                ? `Login to ${selectedRestaurant.name}`
                : "Select your restaurant to continue"}
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent>
          {!selectedRestaurant ? (
            <RestaurantList onSelectRestaurant={setSelectedRestaurant} />
          ) : (
            <RestaurantLoginForm
              restaurant={selectedRestaurant}
              onBack={() => setSelectedRestaurant(null)}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
