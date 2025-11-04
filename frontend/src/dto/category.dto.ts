export type CategoryDTO = {
  categoryId: string;
  name: string;
  restaurantId: string;
  customizationIds: string[];
};

export type CategoryCreateRequest = {
  name: string;
  restaurantId: string;
  customizationIds: string[];
};