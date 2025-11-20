
export interface RestaurantDTO {
    restaurantId: string;
    userId: string;
    name: string;
    email: string;
    status: boolean;
    restaurantPhone: string;
    publicUrl: string;
    description: string;
}

export interface RestaurantCreateRequest {
  userId: string;
  name: string;
  email?: string;
  restaurantPhone?: string;
  description?: string;
}


