import { create } from 'zustand';

// --------------------
// TYPES
// --------------------
export interface CustomizationOption {
  id: string;
  name: string;
  price: number;
}

export interface Customization {
  id: string;
  name: string;
  branchId: string;
  price: number;
  options?: CustomizationOption[];
  createdAt?: string;
}

export interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  branchId: string;
  category?: string;
  imageUrl?: string;
  available?: boolean;
  bestSeller?: boolean;
  createdAt?: string;
  customizations?: Customization[];
}

export interface CategoryCustomization {
  categoryName: string;
  branchId: string;
  customizationId: string;
}

export interface MenuItemCustomization {
  menuItemId: string;
  customizationId: string;
}

// --------------------
// STATE INTERFACE
// --------------------
interface CustomizationState {
  customizations: Customization[];
  menuItems: MenuItem[];
  categoryCustomizations: CategoryCustomization[];
  menuItemCustomizations: MenuItemCustomization[];

  // CRUD cho Customization
  addCustomization: (customization: Customization) => void;
  updateCustomization: (id: string, update: Partial<Customization>) => void;
  deleteCustomization: (id: string) => void;

  // CRUD cho MenuItem
  addMenuItem: (item: MenuItem) => void;
  updateMenuItem: (id: string, update: Partial<MenuItem>) => void;
  deleteMenuItem: (id: string) => void;

  // Liên kết category - customization
  linkCategoryCustomization: (categoryName: string, branchId: string, customizationId: string) => void;
  unlinkCategoryCustomization: (categoryName: string, branchId: string, customizationId: string) => void;

  // Liên kết menuItem - customization
  linkMenuItemCustomization: (menuItemId: string, customizationId: string) => void;
  unlinkMenuItemCustomization: (menuItemId: string, customizationId: string) => void;

  // Truy vấn dữ liệu
  getCustomizationById: (id: string) => Customization | undefined;
  getMenuItemById: (id: string) => MenuItem | undefined;
  getCustomizationsByBranch: (branchId: string) => Customization[];
  getCategoryCustomizations: (categoryName: string, branchId: string) => Customization[];
  getMenuItemCustomizations: (menuItemId: string) => Customization[];
}

// --------------------
// STORE
// --------------------
export const useMenuCustomizationStore = create<CustomizationState>((set, get) => ({
  customizations: JSON.parse(localStorage.getItem('customizations') || '[]'),
  menuItems: JSON.parse(localStorage.getItem('menuItems') || '[]'),
  categoryCustomizations: JSON.parse(localStorage.getItem('categoryCustomizations') || '[]'),
  menuItemCustomizations: JSON.parse(localStorage.getItem('menuItemCustomizations') || '[]'),

  // -------------------- CRUD Customization --------------------
  addCustomization: (customization) =>
    set((state) => {
      const updated = [...state.customizations, customization];
      localStorage.setItem('customizations', JSON.stringify(updated));
      return { customizations: updated };
    }),

  updateCustomization: (id, update) =>
    set((state) => {
      const updated = state.customizations.map((c) =>
        c.id === id ? { ...c, ...update } : c
      );
      localStorage.setItem('customizations', JSON.stringify(updated));
      return { customizations: updated };
    }),

  deleteCustomization: (id) =>
    set((state) => {
      const updated = state.customizations.filter((c) => c.id !== id);
      localStorage.setItem('customizations', JSON.stringify(updated));
      return { customizations: updated };
    }),

  // -------------------- CRUD MenuItem --------------------
  addMenuItem: (item) =>
    set((state) => {
      const updated = [...state.menuItems, item];
      localStorage.setItem('menuItems', JSON.stringify(updated));
      return { menuItems: updated };
    }),

  updateMenuItem: (id, update) =>
    set((state) => {
      const updated = state.menuItems.map((m) =>
        m.id === id ? { ...m, ...update } : m
      );
      localStorage.setItem('menuItems', JSON.stringify(updated));
      return { menuItems: updated };
    }),

  deleteMenuItem: (id) =>
    set((state) => {
      const updated = state.menuItems.filter((m) => m.id !== id);
      localStorage.setItem('menuItems', JSON.stringify(updated));
      return { menuItems: updated };
    }),

  // -------------------- Liên kết Category ↔ Customization --------------------
  linkCategoryCustomization: (categoryName, branchId, customizationId) =>
    set((state) => {
      const exists = state.categoryCustomizations.some(
        (link) =>
          link.categoryName === categoryName &&
          link.branchId === branchId &&
          link.customizationId === customizationId
      );
      if (exists) return state;

      const updated = [
        ...state.categoryCustomizations,
        { categoryName, branchId, customizationId },
      ];
      localStorage.setItem('categoryCustomizations', JSON.stringify(updated));
      return { categoryCustomizations: updated };
    }),

  unlinkCategoryCustomization: (categoryName, branchId, customizationId) =>
    set((state) => {
      const updated = state.categoryCustomizations.filter(
        (link) =>
          !(
            link.categoryName === categoryName &&
            link.branchId === branchId &&
            link.customizationId === customizationId
          )
      );
      localStorage.setItem('categoryCustomizations', JSON.stringify(updated));
      return { categoryCustomizations: updated };
    }),

  // -------------------- Liên kết MenuItem ↔ Customization --------------------
  linkMenuItemCustomization: (menuItemId, customizationId) =>
    set((state) => {
      const exists = state.menuItemCustomizations.some(
        (link) =>
          link.menuItemId === menuItemId &&
          link.customizationId === customizationId
      );
      if (exists) return state;

      const updated = [
        ...state.menuItemCustomizations,
        { menuItemId, customizationId },
      ];
      localStorage.setItem('menuItemCustomizations', JSON.stringify(updated));
      return { menuItemCustomizations: updated };
    }),

  unlinkMenuItemCustomization: (menuItemId, customizationId) =>
    set((state) => {
      const updated = state.menuItemCustomizations.filter(
        (link) =>
          !(
            link.menuItemId === menuItemId &&
            link.customizationId === customizationId
          )
      );
      localStorage.setItem('menuItemCustomizations', JSON.stringify(updated));
      return { menuItemCustomizations: updated };
    }),

  // -------------------- Truy vấn dữ liệu --------------------
  getCustomizationById: (id) => get().customizations.find((c) => c.id === id),
  getMenuItemById: (id) => get().menuItems.find((m) => m.id === id),

  getCategoryCustomizations: (categoryName, branchId) => {
    const { categoryCustomizations, customizations } = get();
    const links = categoryCustomizations.filter(
      (l) => l.categoryName === categoryName && l.branchId === branchId
    );
    return links
      .map((link) => customizations.find((c) => c.id === link.customizationId))
      .filter((c): c is Customization => Boolean(c));
  },

  getMenuItemCustomizations: (menuItemId) => {
    const { menuItemCustomizations, customizations } = get();
    const links = menuItemCustomizations.filter(
      (l) => l.menuItemId === menuItemId
    );
    return links
      .map((link) => customizations.find((c) => c.id === link.customizationId))
      .filter((c): c is Customization => Boolean(c));
  },

  getCustomizationsByBranch: (branchId) => {
    return get().customizations.filter((c) => c.branchId === branchId);
  },
}));
