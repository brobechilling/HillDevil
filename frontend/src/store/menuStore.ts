import { create } from 'zustand';

// ==== INTERFACES ==== //
export interface MenuCustomization {
  id: string;
  name: string;
  price?: number; // ✅ thêm giá trực tiếp, vì orderStore cần dùng để tính totalPrice
}

export interface MenuItem {
  id: string;
  branchId: string;
  name: string;
  description: string;
  price: number;
  category: string;
  parentCategory?: string;
  imageUrl?: string;
  available: boolean;
  customizations?: MenuCustomization[];
  createdAt: string;
  isCustomizationCategory?: boolean;
}

// ==== STATE INTERFACE ==== //
interface MenuState {
  items: MenuItem[];

  // CRUD menu item
  addItem: (item: Omit<MenuItem, 'id' | 'createdAt' | 'customizations'>) => void;
  updateItem: (id: string, updates: Partial<MenuItem>) => void;
  deleteItem: (id: string) => void;

  // CRUD customizations
  addItemCustomization: (menuItemId: string, customization: Omit<MenuCustomization, 'id'>) => void;
  updateItemCustomization: (menuItemId: string, customizationId: string, updates: Partial<MenuCustomization>) => void;
  deleteItemCustomization: (menuItemId: string, customizationId: string) => void;

  // Getters
  getItemsByBranch: (branchId: string) => MenuItem[];
  getMenuItemById: (id: string) => MenuItem | undefined;
}

// ==== STORAGE ==== //
const STORAGE_KEY = 'menu_items';

const loadItems = (): MenuItem[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const saveItems = (items: MenuItem[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
};

// ==== STORE IMPLEMENTATION ==== //
export const useMenuStore = create<MenuState>((set, get) => ({
  items: loadItems(),

  // === ADD MENU ITEM ===
  addItem: (item) => {
    const newItem: MenuItem = {
      ...item,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      customizations: [],
    };
    const items = [...get().items, newItem];
    saveItems(items);
    set({ items });
  },

  // === UPDATE ITEM ===
  updateItem: (id, updates) => {
    const items = get().items.map((item) =>
      item.id === id ? { ...item, ...updates } : item
    );
    saveItems(items);
    set({ items });
  },

  // === DELETE ITEM ===
  deleteItem: (id) => {
    const items = get().items.filter((item) => item.id !== id);
    saveItems(items);
    set({ items });
  },

  // === ADD CUSTOMIZATION ===
  addItemCustomization: (menuItemId, customization) => {
    const items = get().items.map((item) => {
      if (item.id === menuItemId) {
        const newCustomization: MenuCustomization = {
          ...customization,
          id: Date.now().toString(),
        };
        return {
          ...item,
          customizations: [...(item.customizations || []), newCustomization],
        };
      }
      return item;
    });
    saveItems(items);
    set({ items });
  },

  // === UPDATE CUSTOMIZATION ===
  updateItemCustomization: (menuItemId, customizationId, updates) => {
    const items = get().items.map((item) => {
      if (item.id === menuItemId && item.customizations) {
        return {
          ...item,
          customizations: item.customizations.map((c) =>
            c.id === customizationId ? { ...c, ...updates } : c
          ),
        };
      }
      return item;
    });
    saveItems(items);
    set({ items });
  },

  // === DELETE CUSTOMIZATION ===
  deleteItemCustomization: (menuItemId, customizationId) => {
    const items = get().items.map((item) => {
      if (item.id === menuItemId && item.customizations) {
        return {
          ...item,
          customizations: item.customizations.filter(
            (c) => c.id !== customizationId
          ),
        };
      }
      return item;
    });
    saveItems(items);
    set({ items });
  },

  // === GETTERS ===
  getItemsByBranch: (branchId) =>
    get().items.filter((item) => item.branchId === branchId),

  getMenuItemById: (id) => get().items.find((item) => item.id === id),
}));
