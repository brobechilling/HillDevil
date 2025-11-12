export interface CustomizationDTO  {
  customizationId: string;
  name: string;
  price: string;
  restaurantId: string;
};

export type CustomizationCreateRequest = {
  name: string;
  price: string;
  restaurantId: string;
  categoryId?: string;
  menuItemId?: string;
};