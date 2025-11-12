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


export interface GuestBranchMenuItemDTO {
  branchMenuItemId: string;
  branchId: string;
  menuItemId: string;
  available: boolean;
  name: string;
  description: string;
  price: number;
  categoryId: string;
  imageUrl: string;
  bestSeller: boolean;
};