import { create } from 'zustand';
import { useMenuStore } from '@/store/menuStore'; // ✅ chỉ còn 1 store duy nhất

// ==== INTERFACES ==== //

export interface OrderItemCustomization {
  id: string; // order_item_customization_id
  customizationId: string;
  name: string;
  optionName?: string;
  customizationName?: string;
  quantity: number;
  totalPrice: number;
  price?: number; // Alias
}

export interface OrderItem {
  id: string; // order_item_id
  menuItemId: string;
  name: string;
  quantity: number;
  totalPrice: number;
  price?: number; // Alias for totalPrice
  note?: string;
  customizations?: OrderItemCustomization[];
}

export interface OrderLine {
  id: string; // order_line_id
  orderLineStatus: 'pending' | 'preparing' | 'ready' | 'completed';
  createdAt: string;
  updatedAt?: string;
  notes?: string;
  total?: number;
  items: OrderItem[];
}

export interface Order {
  id: string; // order_id
  areaTableId: string;
  tableNumber?: number;
  guestName?: string;
  status: 'pending' | 'preparing' | 'ready' | 'completed' | 'cancelled';
  totalPrice: number;
  total?: number; // Alias for totalPrice
  branchId?: string;
  billed?: boolean;
  billedAt?: string;
  createdAt: string;
  updatedAt?: string;
  orderLines: OrderLine[];
}

interface OrderState {
  orders: Order[];
  addOrder: (order: Omit<Order, 'id' | 'createdAt' | 'totalPrice'>) => void;
  addOrderLine: (orderId: string, line: Omit<OrderLine, 'id' | 'createdAt'>) => void;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
  getOrdersByTable: (tableId: string) => Order[];
  getPendingOrders: (tableId?: string) => Order[];
  getActiveOrderByTable?: (tableId: string) => Order | undefined;
  markOrderAsBilled: (orderId: string) => void;
}

// ==== STORAGE ==== //

const STORAGE_KEY = 'mock_orders';
const saveOrders = (orders: Order[]) =>
  localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
const loadOrders = (): Order[] => {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
};

// ==== STORE IMPLEMENTATION ==== //

export const useOrderStore = create<OrderState>((set, get) => ({
  orders: loadOrders(),

  // === 1. ADD ORDER ===
  addOrder: (orderData) => {
    const { getMenuItemById } = useMenuStore.getState();

    const mappedLines: OrderLine[] = orderData.orderLines.map((line) => {
      const mappedItems: OrderItem[] = line.items.map((item) => {
        const menuItem = getMenuItemById(item.menuItemId);
        if (!menuItem) throw new Error(`MenuItem ${item.menuItemId} not found`);

        // ✅ map customizations theo menuItem
        const mappedCustomizations: OrderItemCustomization[] = (item.customizations || []).map(
          (cust) => {
            const menuCust = menuItem.customizations?.find(
              (mc) => mc.id === cust.customizationId
            );
            if (!menuCust)
              throw new Error(`Customization ${cust.customizationId} not found`);
            return {
              id: Date.now().toString() + Math.random().toString(36).substring(2),
              customizationId: menuCust.id,
              name: menuCust.name,
              quantity: cust.quantity,
              totalPrice: (menuCust.price ?? 0) * cust.quantity,
            };
          }
        );

        const totalPrice =
          (menuItem.price ?? 0) * item.quantity +
          mappedCustomizations.reduce((sum, c) => sum + c.totalPrice, 0);

        return {
          ...item,
          id: `${Date.now()}-${Math.random().toString(36).substring(2)}`,
          name: menuItem.name,
          totalPrice,
          price: totalPrice, // Alias
          customizations: mappedCustomizations,
        };
      });

      return {
        ...line,
        id: `${Date.now()}-${Math.random().toString(36).substring(2)}`,
        createdAt: new Date().toISOString(),
        items: mappedItems,
      };
    });

    const totalPrice = mappedLines.reduce(
      (sum, line) =>
        sum + line.items.reduce((itemSum, i) => itemSum + i.totalPrice, 0),
      0
    );

    const newOrder: Order = {
      ...orderData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      totalPrice,
      total: totalPrice, // Alias
      status: orderData.status || 'pending',
      orderLines: mappedLines,
    };

    const updated = [newOrder, ...get().orders];
    saveOrders(updated);
    set({ orders: updated });
  },

  // === 2. ADD ORDER LINE ===
  addOrderLine: (orderId, lineData) => {
    const { getMenuItemById } = useMenuStore.getState();

    const mappedItems: OrderItem[] = lineData.items.map((item) => {
      const menuItem = getMenuItemById(item.menuItemId);
      if (!menuItem) throw new Error(`MenuItem ${item.menuItemId} not found`);

      const mappedCustomizations: OrderItemCustomization[] = (item.customizations || []).map(
        (cust) => {
          const menuCust = menuItem.customizations?.find(
            (mc) => mc.id === cust.customizationId
          );
          if (!menuCust)
            throw new Error(`Customization ${cust.customizationId} not found`);
          return {
            id: Date.now().toString() + Math.random().toString(36).substring(2),
            customizationId: menuCust.id,
            name: menuCust.name,
            quantity: cust.quantity,
            totalPrice: (menuCust.price ?? 0) * cust.quantity,
          };
        }
      );

      const totalPrice =
        (menuItem.price ?? 0) * item.quantity +
        mappedCustomizations.reduce((sum, c) => sum + c.totalPrice, 0);

      return {
        ...item,
        id: Date.now().toString() + Math.random().toString(36).substring(2),
        name: menuItem.name,
        totalPrice,
        price: totalPrice, // Alias
        customizations: mappedCustomizations,
      };
    });

    const newLine: OrderLine = {
      ...lineData,
      id: `${orderId}-line-${Date.now()}`,
      createdAt: new Date().toISOString(),
      items: mappedItems,
    };

    const updated = get().orders.map((o) => {
      if (o.id === orderId) {
        const newTotal = o.totalPrice + mappedItems.reduce((sum, i) => sum + i.totalPrice, 0);
        return { ...o, orderLines: [...o.orderLines, newLine], totalPrice: newTotal };
      }
      return o;
    });

    saveOrders(updated);
    set({ orders: updated });
  },

  // === 3. UPDATE ORDER STATUS ===
  updateOrderStatus: (orderId, status) => {
    const updated = get().orders.map((o) =>
      o.id === orderId ? { ...o, status } : o
    );
    saveOrders(updated);
    set({ orders: updated });
  },

  // === 4. GETTERS ===
  getOrdersByTable: (tableId) =>
    get().orders.filter((o) => o.areaTableId === tableId),
  getPendingOrders: (tableId) =>
    get().orders.filter(
      (o) => o.status === 'pending' && (!tableId || o.areaTableId === tableId)
    ),
  
  getActiveOrderByTable: (tableId) =>
    get().orders.find((o) => 
      o.areaTableId === tableId && 
      ['pending', 'preparing', 'ready'].includes(o.status)
    ),

  // === 5. MARK AS BILLED ===
  markOrderAsBilled: (orderId: string) => {
    const updated: Order[] = get().orders.map((o) =>
      o.id === orderId ? { ...o, status: 'completed', billed: true, billedAt: new Date().toISOString() } : o
    );
    saveOrders(updated);
    set({ orders: updated });
  },
}));
