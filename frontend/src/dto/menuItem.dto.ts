export type MenuItemDTO = {
  menuItemId: string;
  name: string;
  description: string;
  price: string;
  status: "ACTIVE" | "INACTIVE";
  bestSeller: boolean;
  hasCustomization: boolean;
  restaurantId: string;
  categoryId: string;
  customizationIds: string[];
  imageUrl: string;
};

export type MenuItemCreateRequest = {
  name: string;
  description: string;
  price: string;
  bestSeller: boolean;
  hasCustomization: boolean;
  restaurantId: string;
  categoryId: string;
  customizationIds: string[];
};