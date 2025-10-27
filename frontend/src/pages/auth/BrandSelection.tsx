import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building2, ArrowRight, ArrowLeft, Plus } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { RestaurantDTO } from '@/dto/restaurant.dto';
import { UserDTO } from '@/dto/user.dto';
import { getRestaurantsByOwner } from '@/api/restaurantApi';


const BrandSelection = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<UserDTO | null>(null);
  const [restaurants, setRestaurants] = useState<RestaurantDTO[]>([]);
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

    // Check if we have restaurants stored from login
    const storedRestaurants = localStorage.getItem('user_restaurants');
    if (storedRestaurants) {
      const restaurantsData = JSON.parse(storedRestaurants);
      setRestaurants(restaurantsData);
      setLoading(false);
    } else {
      // If no stored restaurants, fetch them from API
      fetchRestaurants(userData);
    }
  }, [navigate]);

  const fetchRestaurants = async (userData: UserDTO) => {
    try {
      setLoading(true);
      const restaurantsData = await getRestaurantsByOwner(userData.userId);
      setRestaurants(restaurantsData);
      localStorage.setItem('user_restaurants', JSON.stringify(restaurantsData));
    } catch (error) {
      console.error('Error fetching restaurants:', error);
      toast({
        title: "Error",
        description: "Failed to load restaurants. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRestaurantSelect = (restaurantId: string) => {
    const restaurant = restaurants.find(r => r.restaurantId === restaurantId);
    if (!restaurant) return;

    // Ensure user data is still in localStorage
    const storedUser = localStorage.getItem('user');
    console.log('BrandSelection - Stored user before navigation:', storedUser);

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
    console.log('BrandSelection - Selected restaurant:', restaurant);
    console.log('BrandSelection - Navigating to /dashboard/owner');

    toast({
      title: 'Restaurant Selected',
      description: `You've selected ${restaurant.name}`,
    });

    navigate('/dashboard/owner');
  };

  if (loading) {
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

  return (
    <div className="min-h-screen bg-muted/30 py-12 px-4">
      <div className="container max-w-5xl">
        <div className="mb-6 flex justify-start">
          <Button
            type="button"
            variant="ghost"
            className="gap-2"
            onClick={() => navigate('/')}
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
                You haven't created any restaurants yet. Create your first one to get started!
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => navigate('/register/package')} className="w-full">
                <Plus className="mr-2 h-4 w-4" />
                Create First Restaurant
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
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
                        <Building2 className="h-8 w-8 text-primary" />
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${restaurant.status
                        ? 'bg-green-500/10 text-green-500'
                        : 'bg-red-500/10 text-red-500'
                        }`}>
                        {restaurant.status ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <CardTitle className="text-2xl">{restaurant.name}</CardTitle>
                    <CardDescription className="text-base">
                      {restaurant.description || 'No description available'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 mb-6">
                      {restaurant.email && (
                        <p className="text-sm text-muted-foreground">
                          {restaurant.email}
                        </p>
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
              <Button
                onClick={() => navigate('/register/package')}
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
