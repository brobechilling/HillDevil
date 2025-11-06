import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Store, ArrowRight, MapPin } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { RestaurantDTO } from '@/dto/restaurant.dto';
import { UserDTO } from '@/dto/user.dto';
import { useRestaurantsByOwner } from '@/hooks/queries/useRestaurants';

const BranchSelection = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<UserDTO | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get user data from localStorage (stored by Login component)
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      navigate('/login');
      return;
    }

    const userData = JSON.parse(storedUser) as UserDTO;
    setUser(userData);
    setLoading(false);
  }, [navigate]);

  // useQuery to fetch restaurants for the owner
  const userId = user?.userId || JSON.parse(localStorage.getItem('user') || 'null')?.userId;
  const { data: restaurants = [], isLoading: isRestaurantsLoading } = useRestaurantsByOwner(userId);
  // persist in localStorage for fallback
  if (!localStorage.getItem('user_restaurants') && restaurants.length > 0) {
    localStorage.setItem('user_restaurants', JSON.stringify(restaurants));
  }
  const effectiveLoading = loading || isRestaurantsLoading;

  const handleRestaurantSelect = (restaurantId: string) => {
    const restaurant = restaurants.find(r => r.restaurantId === restaurantId);

    if (!restaurant) {
      toast({
        title: "Error",
        description: "Restaurant not found.",
        variant: "destructive",
      });
      return;
    }

    // Ensure user data is still in localStorage
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      toast({
        title: "Error",
        description: "User session expired. Please login again.",
        variant: "destructive",
      });
      navigate('/login');
      return;
    }

    localStorage.setItem('selected_restaurant', JSON.stringify(restaurant));

    toast({
      title: 'Restaurant Selected',
      description: `You've selected ${restaurant.name}`,
    });

    navigate('/dashboard/owner');
  };

  if (effectiveLoading) {
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

  if (restaurants.length === 0) {
    return (
      <div className="min-h-screen bg-muted/30 py-12 px-4">
        <div className="container max-w-5xl">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">No Restaurants Found</h1>
            <p className="text-lg text-muted-foreground mb-8">
              You don't have any restaurants yet. Create your first restaurant to get started.
            </p>
            <Button onClick={() => navigate('/register/package')}>
              Create Restaurant
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 py-12 px-4">
      <div className="container max-w-5xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Select Restaurant</h1>
          <p className="text-lg text-muted-foreground">
            Choose which restaurant you want to manage
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {restaurants.map((restaurant) => (
            <Card
              key={restaurant.restaurantId}
              className="cursor-pointer transition-smooth hover:shadow-medium hover:border-primary border-border/50"
              onClick={() => handleRestaurantSelect(restaurant.restaurantId)}
            >
              <CardHeader>
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <Store className="h-8 w-8 text-primary" />
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${restaurant.status
                    ? 'bg-green-500/10 text-green-500'
                    : 'bg-red-500/10 text-red-500'
                    }`}>
                    {restaurant.status ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <CardTitle className="text-2xl">{restaurant.name}</CardTitle>
                <CardDescription className="text-base">{restaurant.description || 'No description available'}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 mb-6">
                  {restaurant.email && (
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{restaurant.email}</span>
                    </div>
                  )}
                  {restaurant.restaurantPhone && (
                    <p className="text-sm text-muted-foreground">
                      {restaurant.restaurantPhone}
                    </p>
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
          <Button variant="ghost" onClick={() => navigate('/brand-selection')}>
            ← Back to Brand Selection
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BranchSelection;
