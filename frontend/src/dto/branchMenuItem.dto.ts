export type BranchMenuItemDTO = {
  branchMenuItemId: string;
  menuItemId: string;
  name: string;
  description: string;
  price: number;
  bestSeller: boolean;
  hasCustomization: boolean;
  available: boolean;
  branchId: string;
  categoryId: string;
  imageUrl?: string;
};
