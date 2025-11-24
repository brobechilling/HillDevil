import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2, ArrowRight, ArrowLeft, Plus } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useRestaurantsByOwner } from "@/hooks/queries/useRestaurants";
import { useSessionStore } from "@/store/sessionStore";
import { isUserDTO } from "@/utils/typeCast";

const BrandSelection = () => {
  const navigate = useNavigate();
  const { user } = useSessionStore();

  const ownerId = isUserDTO(user) ? user.userId : "";

  // Fetch restaurants owned by this user
  const { data: restaurants = [], isLoading, isError } = useRestaurantsByOwner(
    ownerId
  );

  // Optional: store fetched restaurants in localStorage for cross-page usage
  useEffect(() => {
    if (restaurants.length > 0) {
      localStorage.setItem("user_restaurants", JSON.stringify(restaurants));
    }
  }, [restaurants]);

  // Route protection ensures user exists and is a restaurant owner
  // Staff accounts should not access this page
  if (!user || !('userId' in user)) return null;

  // Handle selecting a restaurant
  const handleRestaurantSelect = (restaurantId: string) => {
    const restaurant = restaurants.find((r) => r.restaurantId === restaurantId);
    if (!restaurant) return;

    localStorage.setItem("selected_restaurant", JSON.stringify(restaurant));

    toast({
      title: "Restaurant Selected",
      description: `You've selected ${restaurant.name}`,
    });

    navigate("/dashboard/owner");
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-muted/30 py-12 px-4">
        <div className="container max-w-5xl">
          <div className="text-center">
            <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading restaurants...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="min-h-screen bg-muted/30 flex flex-col items-center justify-center">
        <p className="text-red-500 mb-4">
          Failed to load restaurants. Please try again.
        </p>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    );
  }

  // Main content
  return (
    <div className="min-h-screen bg-muted/30 py-12 px-4">
      <div className="container max-w-5xl">
        <div className="mb-6 flex justify-start">
          <Button
            type="button"
            variant="ghost"
            className="gap-2"
            onClick={() => navigate("/")}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Button>
        </div>

        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Select Your Restaurant</h1>
          <p className="text-lg text-muted-foreground">
            Choose which restaurant you want to manage
          </p>
        </div>

        {restaurants.length === 0 ? (
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle>No Restaurants Yet</CardTitle>
              <CardDescription>
                You haven't created any restaurants yet. Create your first one
                to get started!
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => navigate("/register/package")}
                className="w-full"
              >
                <Plus className="mr-2 h-4 w-4" />
                Create First Restaurant
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {restaurants.filter(restaurant => restaurant.status).map((restaurant) => (
                <Card
                  key={restaurant.restaurantId}
                  className="cursor-pointer transition-smooth hover:shadow-medium hover:border-primary border-border/50 flex flex-col"
                  onClick={() => handleRestaurantSelect(restaurant.restaurantId)}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 rounded-lg bg-primary/10">
                        <Building2 className="h-8 w-8 text-primary" />
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${restaurant.status
                          ? "bg-green-500/10 text-green-500"
                          : "bg-red-500/10 text-red-500"
                          }`}
                      >
                        {restaurant.status ? "Active" : "Inactive"}
                      </span>
                    </div>
                    <CardTitle className="text-2xl">{restaurant.name}</CardTitle>
                    <CardDescription className="text-base">
                      {restaurant.description || "No description available"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col justify-end">
                    <div className="space-y-3 mb-6">
                      {restaurant.email && (
                        <p className="text-sm text-muted-foreground">{restaurant.email}</p>
                      )}
                      {restaurant.restaurantPhone && (
                        <p className="text-sm text-muted-foreground">{restaurant.restaurantPhone}</p>
                      )}
                    </div>
                    <Button className="w-full" variant="outline">
                      Manage Restaurant
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="mt-8 text-center">
              <Button
                onClick={() => navigate("/register/package")}
                variant="outline"
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Create Another Restaurant
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default BrandSelection;
