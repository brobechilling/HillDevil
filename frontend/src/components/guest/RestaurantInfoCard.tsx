import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Phone, Mail, Store } from 'lucide-react';

interface Props { restaurant: any }

export default function RestaurantInfoCard({ restaurant }: Props) {
  return (
    <Card className="mb-8 border-2 shadow-sm bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-foreground">{restaurant.name}</CardTitle>
        <CardDescription className="text-muted-foreground">Restaurant Information</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="flex items-start gap-3">
            <Phone className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold mb-1">Phone</p>
              <p className="text-sm">{restaurant.phone || '—'}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Mail className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold mb-1">Email</p>
              <p className="text-sm">{restaurant.email || '—'}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Store className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold mb-1">Description</p>
              <p className="text-sm">{restaurant.description || '—'}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
