import { create } from 'zustand';
import { BranchDTO } from '@/dto/branch.dto';
import { TableDTO, TableStatus } from '@/dto/table.dto';

export interface Branch extends BranchDTO {
  // Extend BranchDTO if needed with additional client-side properties
}

export interface Table extends TableDTO {
  branchId: string;
  areaId?: string;
  floor?: number;
  number?: number;
  createdAt?: string;
  reservationStart?: string;
  reservationEnd?: string;
  reservationName?: string;
}

interface TableState {
  tables: Table[];
  branches: Branch[];
  selectedBranch: string | null;

  setTables: (tables: Table[]) => void;
  addTable: (table: Table) => void;
  updateTable: (id: string, updates: Partial<Table>) => void;
  deleteTable: (id: string) => void;
  getTablesByBranch: (branchId: string) => Table[];
  getTablesByBranchAndFloor: (branchId: string) => Map<number, Table[]>;
  getTableById: (id: string) => Table | undefined;
  getBranches: () => Branch[];
  setBranches: (branches: Branch[]) => void;
  setSelectedBranch: (branchId: string | null) => void;
}

export const useTableStore = create<TableState>((set, get) => {
  let memoizedFloorMap: Map<number, Table[]> | null = null;
  let lastTables: Table[] = [];

  return {
    tables: [],
    branches: [],
    selectedBranch: null,

    setTables: (tables) => {
      set({ tables });
    },

    addTable: (table) => {
      const tables = [...get().tables, table];
      set({ tables });
    },

    updateTable: (id, updates) => {
      const tables = get().tables.map((table) =>
        table.id === id ? { ...table, ...updates } : table
      );
      set({ tables });
    },

    deleteTable: (id) => {
      const tables = get().tables.filter((table) => table.id !== id);
      set({ tables });
    },

    getTablesByBranch: (branchId) => {
      return get().tables.filter((table) => table.branchId === branchId);
    },

    getTablesByBranchAndFloor: (branchId) => {
      const tables = get().tables.filter((table) => table.branchId === branchId);

      // If tables haven't changed, return the memoized Map
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
    setSelectedBranch: (branchId) => set({ selectedBranch: branchId }),
  };
});