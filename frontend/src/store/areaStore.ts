import { create } from 'zustand';

export interface Area {
  id: string;
  branchId: string;
  name: string;
  floor: number;
  status: 'active' | 'inactive' | 'unavailable';
  createdAt: string;
}

interface AreaState {
  areas: Area[];
  addArea: (area: Omit<Area, 'id' | 'createdAt'>) => void;
  updateArea: (id: string, updates: Partial<Area>) => void;
  deleteArea: (id: string) => void;
  getAreasByBranch: (branchId: string) => Area[];
  getAreaById: (id: string) => Area | undefined;
}

const STORAGE_KEY = 'areas';

const loadAreas = (): Area[] => {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
};

const saveAreas = (areas: Area[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(areas));
};

export const useAreaStore = create<AreaState>((set, get) => ({
  areas: loadAreas(),

  addArea: (area) => {
    const newArea: Area = {
      ...area,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    const areas = [...get().areas, newArea];
    saveAreas(areas);
    set({ areas });
  },

  updateArea: (id, updates) => {
    const areas = get().areas.map((area) =>
      area.id === id ? { ...area, ...updates } : area
    );
    saveAreas(areas);
    set({ areas });
  },

  deleteArea: (id) => {
    const areas = get().areas.filter((area) => area.id !== id);
    saveAreas(areas);
    set({ areas });
  },

  getAreasByBranch: (branchId) => {
    return get().areas.filter((area) => area.branchId === branchId);
  },

  getAreaById: (id) => {
    return get().areas.find((area) => area.id === id);
  },
}));
