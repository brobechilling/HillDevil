import { create } from 'zustand';
import { useMemo } from 'react';

export type TableStatus = 'available' | 'occupied' | 'out_of_service';

export interface Branch {
  branch_id: string;
  restaurant_id: string;
  address: string;
  branch_phone?: string;
  opening_time?: string;
  closing_time?: string;
  is_active?: boolean;
  mail?: string;
}
export interface Table {
  id: string;
  branchId: string;
  number: number;
  capacity: number;
  floor: number;
  status: TableStatus;
  qrCode: string;
  createdAt: string;
  reservationStart?: string;
  reservationEnd?: string;
  reservationName?: string;
}

interface TableState {
  tables: Table[];
  branches: Branch[];

  addTable: (table: Omit<Table, 'id' | 'qrCode' | 'createdAt'>) => void;
  updateTable: (id: string, updates: Partial<Table>) => void;
  updateTableStatus: (id: string, status: TableStatus) => void;
  deleteTable: (id: string) => void;
  getTablesByBranch: (branchId: string) => Table[];
  getTablesByBranchAndFloor: (branchId: string) => Map<number, Table[]>;
  getTableById: (id: string) => Table | undefined;
  getBranches: () => Branch[];
  setBranches: (branches: Branch[]) => void;
}

const STORAGE_KEY = 'tables';
const BRANCHES_STORAGE_KEY = 'branches';

const loadBranches = (): Branch[] => {
  const stored = localStorage.getItem(BRANCHES_STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
};

const saveBranches = (branches: Branch[]) => {
  localStorage.setItem(BRANCHES_STORAGE_KEY, JSON.stringify(branches));
};

const loadTables = (): Table[] => {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
};

const saveTables = (tables: Table[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tables));
};

const generateQRCode = (branchId: string, tableNumber: number): string => {
  return `QR-${branchId}-T${tableNumber}-${Date.now()}`;
};

export const useTableStore = create<TableState>((set, get) => {
  let memoizedFloorMap: Map<number, Table[]> | null = null;
  let lastTables: Table[] = [];

  return {
    tables: loadTables(),
    branches: loadBranches(),

    addTable: (table) => {
      const newTable: Table = {
        ...table,
        id: Date.now().toString(),
        qrCode: generateQRCode(table.branchId, table.number),
        createdAt: new Date().toISOString(),
      };
      const tables = [...get().tables, newTable];
      saveTables(tables);
      set({ tables });
    },

    updateTable: (id, updates) => {
      const tables = get().tables.map((table) =>
        table.id === id ? { ...table, ...updates } : table
      );
      saveTables(tables);
      set({ tables });
    },

    updateTableStatus: (id, status) => {
      const tables = get().tables.map((table) =>
        table.id === id ? { ...table, status } : table
      );
      saveTables(tables);
      set({ tables });
    },

    deleteTable: (id) => {
      const tables = get().tables.filter((table) => table.id !== id);
      saveTables(tables);
      set({ tables });
    },

    getTablesByBranch: (branchId) => {
      return get().tables.filter((table) => table.branchId === branchId);
    },

    getTablesByBranchAndFloor: (branchId) => {
      const tables = get().tables.filter((table) => table.branchId === branchId);

      // Nếu tables chưa thay đổi, trả về Map cũ
      if (tables === lastTables && memoizedFloorMap) return memoizedFloorMap;

      const floorMap = new Map<number, Table[]>();
      tables.forEach((table) => {
        const floor = table.floor || 1;
        if (!floorMap.has(floor)) floorMap.set(floor, []);
        floorMap.get(floor)!.push(table);
      });

      memoizedFloorMap = floorMap;
      lastTables = tables;
      return floorMap;
    },

    getTableById: (id) => {
      return get().tables.find((table) => table.id === id);
    },

    getBranches: () => get().branches,
    setBranches: (branches) => set({ branches }),
  };
});
