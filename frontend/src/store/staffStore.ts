import { create } from 'zustand';

export type StaffRole = 'waiter' | 'receptionist' | 'manager';
export type StaffStatus = 'active' | 'inactive';

export interface StaffMember {
  id: string;
  branchId: string;
  name: string;
  email: string;
  phone?: string;
  role: StaffRole;
  status: StaffStatus;
  username: string;
  password: string;
  createdAt: string;
}

interface StaffState {
  staff: StaffMember[];
  addStaff: (member: Omit<StaffMember, 'id' | 'createdAt'>) => void;
  updateStaff: (id: string, updates: Partial<StaffMember>) => void;
  deleteStaff: (id: string) => void;
  getStaffByBranch: (branchId: string) => StaffMember[];
  getStaffById: (id: string) => StaffMember | undefined;
}

const STORAGE_KEY = 'staff_members';

const loadStaff = (): StaffMember[] => {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
};

const saveStaff = (staff: StaffMember[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(staff));
};

export const useStaffStore = create<StaffState>((set, get) => ({
  staff: loadStaff(),

  addStaff: (member) => {
    const newMember: StaffMember = {
      ...member,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    const staff = [...get().staff, newMember];
    saveStaff(staff);
    set({ staff });
  },

  updateStaff: (id, updates) => {
    const staff = get().staff.map((member) =>
      member.id === id ? { ...member, ...updates } : member
    );
    saveStaff(staff);
    set({ staff });
  },

  deleteStaff: (id) => {
    const staff = get().staff.filter((member) => member.id !== id);
    saveStaff(staff);
    set({ staff });
  },

  getStaffByBranch: (branchId) => {
    return get().staff.filter((member) => member.branchId === branchId);
  },

  getStaffById: (id) => {
    return get().staff.find((member) => member.id === id);
  },
}));
