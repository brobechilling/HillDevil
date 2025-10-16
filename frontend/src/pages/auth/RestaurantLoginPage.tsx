import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UtensilsCrossed } from 'lucide-react';
import { RestaurantList } from '@/components/auth/RestaurantList';
import { RestaurantLoginForm } from '@/components/auth/RestaurantLoginForm';

export default function RestaurantLoginPage() {
  const [selectedRestaurant, setSelectedRestaurant] = useState<any>(null);

  return (
    <div className="min-h-screen flex items-center justify-center gradient-hero p-4">
      <Card className="w-full max-w-2xl shadow-large">
        <CardHeader className="space-y-4 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl gradient-primary">
            <UtensilsCrossed className="h-8 w-8 text-primary-foreground" />
          </div>
          <div>
            <CardTitle className="text-2xl">Restaurant Staff Login</CardTitle>
            <CardDescription className="text-base">
              {selectedRestaurant 
                ? `Login to ${selectedRestaurant.name}` 
                : 'Select your brand to continue'}
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
