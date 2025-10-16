import { create } from 'zustand';

export interface PackageFeature {
  id: string;
  name: string;
  description: string;
}

export interface Package {
  id: string;
  name: string;
  price: number;
  description: string;
  billingPeriod: 'monthly' | 'yearly' | 'one-time';
  available: boolean;
  features: PackageFeature[];
  createdAt: string;
}

interface PackageState {
  packages: Package[];
  addPackage: (pkg: Omit<Package, 'id' | 'createdAt'>) => void;
  updatePackage: (id: string, updates: Partial<Package>) => void;
  deletePackage: (id: string) => void;
  toggleAvailability: (id: string) => void;
  getPackageById: (id: string) => Package | undefined;
}

// Mock initial packages
const initialPackages: Package[] = [
  {
    id: '1',
    name: 'Starter Package',
    price: 29.99,
    description: 'Perfect for small restaurants getting started',
    billingPeriod: 'monthly',
    available: true,
    features: [
      { id: 'f1', name: 'Up to 10 tables', description: 'Manage up to 10 tables' },
      { id: 'f2', name: 'Basic menu management', description: 'Create and manage your menu' },
      { id: 'f3', name: 'Order tracking', description: 'Track customer orders' },
    ],
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Professional Package',
    price: 79.99,
    description: 'For growing restaurants with advanced needs',
    billingPeriod: 'monthly',
    available: true,
    features: [
      { id: 'f4', name: 'Unlimited tables', description: 'No limits on table management' },
      { id: 'f5', name: 'Advanced analytics', description: 'Detailed reports and insights' },
      { id: 'f6', name: 'Multi-branch support', description: 'Manage multiple locations' },
      { id: 'f7', name: 'Custom branding', description: 'Personalize your restaurant page' },
    ],
    createdAt: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'Enterprise Package',
    price: 199.99,
    description: 'Full-featured solution for restaurant chains',
    billingPeriod: 'monthly',
    available: true,
    features: [
      { id: 'f8', name: 'Everything in Pro', description: 'All Professional features included' },
      { id: 'f9', name: 'Dedicated support', description: '24/7 priority customer support' },
      { id: 'f10', name: 'API access', description: 'Integrate with external systems' },
      { id: 'f11', name: 'Custom integrations', description: 'Tailored solutions for your needs' },
    ],
    createdAt: new Date().toISOString(),
  },
];

export const usePackageStore = create<PackageState>((set, get) => ({
  packages: initialPackages,

  addPackage: (pkg) => {
    const newPackage: Package = {
      ...pkg,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    set((state) => ({ packages: [...state.packages, newPackage] }));
  },

  updatePackage: (id, updates) => {
    set((state) => ({
      packages: state.packages.map((pkg) =>
        pkg.id === id ? { ...pkg, ...updates } : pkg
      ),
    }));
  },

  deletePackage: (id) => {
    set((state) => ({
      packages: state.packages.filter((pkg) => pkg.id !== id),
    }));
  },

  toggleAvailability: (id) => {
    set((state) => ({
      packages: state.packages.map((pkg) =>
        pkg.id === id ? { ...pkg, available: !pkg.available } : pkg
      ),
    }));
  },

  getPackageById: (id) => {
    return get().packages.find((pkg) => pkg.id === id);
  },
}));
