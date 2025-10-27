import { UUID } from "crypto";


export interface RestaurantDTO {
    restaurantId: UUID;
    userId: UUID;
    name: string;
    email: string;
    status: string;
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


