export type CustomizationDTO = {
  customizationId: string;
  name: string;
  price: string;
  restaurantId: string;
};

export type CustomizationCreateRequest = {
  name: string;
  price: string;
  restaurantId: string;
};