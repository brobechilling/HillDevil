import { StaffAccountDTO } from "@/dto/staff.dto";
import { UserDTO } from "@/dto/user.dto";
import { RestaurantDTO } from "@/dto/restaurant.dto";

export const isUserDTO = (user: any): user is UserDTO => {
    return user && typeof(user.userId) === 'string';
}

export const isStaffAccountDTO = (user: any): user is StaffAccountDTO => {
    return user && typeof(user.staffAccountId) === 'string';
}

export const isRestaurantDTO = (restaurant: any): restaurant is RestaurantDTO => {
    return restaurant && typeof(restaurant.restaurantId) === `string`;
}

export const getLocalStorageObject = <T>(key: string): T | null => {
  try {
    const item = localStorage.getItem(key);
    if (!item) {
        return null;
    }
    return JSON.parse(item) as T;
  } catch (error) {
    console.error(`Error parsing localStorage key "${key}":`, error);
    return null;
  }
}
