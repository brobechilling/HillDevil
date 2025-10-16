import { create } from 'zustand';

export interface SystemUser {
  id: string;
  username: string;
  email: string;
  registrationDate: string;
  status: 'active' | 'inactive';
  totalSpent: number;
  packagesPurchased: string[];
}

export interface LandingVisit {
  id: string;
  timestamp: string;
  ipAddress: string;
  userAgent: string;
}

interface AdminState {
  users: SystemUser[];
  landingVisits: LandingVisit[];
  addUser: (user: Omit<SystemUser, 'id' | 'registrationDate' | 'totalSpent' | 'packagesPurchased'>) => void;
  updateUser: (id: string, updates: Partial<SystemUser>) => void;
  deleteUser: (id: string) => void;
  toggleUserStatus: (id: string) => void;
  recordLandingVisit: (visit: Omit<LandingVisit, 'id' | 'timestamp'>) => void;
  getTotalLandingVisits: () => number;
  getTopSpendingUser: () => SystemUser | null;
  getUsersWithPackages: () => SystemUser[];
}

// Mock initial data - Top spending users for admin dashboard
const initialUsers: SystemUser[] = [
  {
    id: '1',
    username: 'john_doe',
    email: 'john@example.com',
    registrationDate: '2024-01-15T10:30:00Z',
    status: 'active',
    totalSpent: 299.97,
    packagesPurchased: ['1', '2'],
  },
  {
    id: '2',
    username: 'jane_smith',
    email: 'jane@example.com',
    registrationDate: '2024-02-20T14:15:00Z',
    status: 'active',
    totalSpent: 599.94,
    packagesPurchased: ['2', '3'],
  },
  {
    id: '3',
    username: 'bob_wilson',
    email: 'bob@example.com',
    registrationDate: '2024-03-10T09:45:00Z',
    status: 'inactive',
    totalSpent: 29.99,
    packagesPurchased: ['1'],
  },
  {
    id: '4',
    username: 'sarah_martinez',
    email: 'sarah.m@example.com',
    registrationDate: '2024-01-28T11:20:00Z',
    status: 'active',
    totalSpent: 1299.95,
    packagesPurchased: ['1', '2', '3'],
  },
  {
    id: '5',
    username: 'michael_chang',
    email: 'm.chang@example.com',
    registrationDate: '2024-02-05T16:45:00Z',
    status: 'active',
    totalSpent: 899.96,
    packagesPurchased: ['2', '3'],
  },
];

const initialVisits: LandingVisit[] = Array.from({ length: 247 }, (_, i) => ({
  id: `visit-${i}`,
  timestamp: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
  ipAddress: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
  userAgent: 'Mozilla/5.0',
}));

export const useAdminStore = create<AdminState>((set, get) => ({
  users: initialUsers,
  landingVisits: initialVisits,

  addUser: (user) => {
    const newUser: SystemUser = {
      ...user,
      id: Date.now().toString(),
      registrationDate: new Date().toISOString(),
      totalSpent: 0,
      packagesPurchased: [],
    };
    set((state) => ({ users: [...state.users, newUser] }));
  },

  updateUser: (id, updates) => {
    set((state) => ({
      users: state.users.map((user) =>
        user.id === id ? { ...user, ...updates } : user
      ),
    }));
  },

  deleteUser: (id) => {
    set((state) => ({
      users: state.users.filter((user) => user.id !== id),
    }));
  },

  toggleUserStatus: (id) => {
    set((state) => ({
      users: state.users.map((user) =>
        user.id === id
          ? { ...user, status: user.status === 'active' ? 'inactive' : 'active' }
          : user
      ),
    }));
  },

  recordLandingVisit: (visit) => {
    const newVisit: LandingVisit = {
      ...visit,
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
    };
    set((state) => ({ landingVisits: [...state.landingVisits, newVisit] }));
  },

  getTotalLandingVisits: () => {
    return get().landingVisits.length;
  },

  getTopSpendingUser: () => {
    const users = get().users;
    if (users.length === 0) return null;
    return users.reduce((prev, current) =>
      prev.totalSpent > current.totalSpent ? prev : current
    );
  },

  getUsersWithPackages: () => {
    return get().users.filter((user) => user.packagesPurchased.length > 0);
  },
}));
