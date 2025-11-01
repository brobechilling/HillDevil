export type BranchMenuItemDTO = {
  menuItemId: string;
  name: string;
  description: string;
  price: string; // BigDecimal → string
  bestSeller: boolean;
  hasCustomization: boolean;
  available: boolean;
  branchId: string;
  categoryId: string;
};