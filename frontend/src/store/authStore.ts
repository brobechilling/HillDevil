import { create } from 'zustand';
import { toast } from '@/hooks/use-toast';
import { mockUsers } from '@/data/mockData';

export type UserRole = 'waiter' | 'receptionist' | 'branch_manager' | 'owner' | 'admin';

interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  branchId?: string; // For staff and branch_manager
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  initialize: () => Promise<void>;
  login: (email: string, password: string, restaurantId?: string) => Promise<User>;
  loginStaff: (restaurantId: string, username: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
}

// Mock storage helpers
const STORAGE_KEY = 'mock_auth_user';

const saveUser = (user: User | null) => {
  if (user) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(STORAGE_KEY);
  }
};

const loadUser = (): User | null => {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : null;
};

let sessionUser: User | null = loadUser();

export const useAuthStore = create<AuthState>((set) => ({
  user: sessionUser,
  isAuthenticated: !!sessionUser,
  isLoading: false,

  initialize: async () => {
    sessionUser = loadUser();
    set({ isLoading: false, user: sessionUser, isAuthenticated: !!sessionUser });
  },

  login: async (email: string, password: string, restaurantId?: string) => {
    set({ isLoading: true });
    const found = mockUsers.find(u => u.email === email && u.password === password);
    if (found) {
      const { password, ...userRaw } = found;
      const user: User = {
        id: userRaw.id,
        email: userRaw.email,
        name: userRaw.name,
        role: userRaw.role as UserRole,
        avatar: userRaw.avatar,
        branchId: restaurantId,
      };
      sessionUser = user;
      saveUser(user);
      localStorage.setItem('auth_token', `mock_jwt_token_${user.id}_${Date.now()}`);
      set({ user, isAuthenticated: true, isLoading: false });
      toast({ title: 'Welcome back!', description: 'You have successfully logged in.' });
      // Owner with multiple brands: always go to BrandSelection
      if (user.role === 'owner') {
        window.location.href = '/brand-selection';
      }
      return user;
    } else {
      set({ isLoading: false });
      toast({
        variant: 'destructive',
        title: 'Login failed',
        description: 'Please check your credentials and try again.',
      });
      throw new Error('Invalid credentials');
    }
  },

  loginStaff: async (restaurantId: string, username: string, password: string) => {
    set({ isLoading: true });
    // Find staff user by username (extracted from email) and password
    // Username patterns: waiter.jane@restaurant.com → "jane", manager@restaurant.com → "manager"
    const found = mockUsers.find(u => {
      const emailUsername = u.email.split('@')[0]; // Get part before @
      const extractedUsername = emailUsername.includes('.')
        ? emailUsername.split('.')[1] // "waiter.jane" → "jane"
        : emailUsername; // "manager" → "manager"

      return (
        extractedUsername.toLowerCase() === username.toLowerCase() &&
        u.password === password &&
        (u.role === 'waiter' || u.role === 'receptionist' || u.role === 'branch_manager')
      );
    });
    
    if (found) {
      const { password: _pwd, ...userRaw } = found;
      // Attach selected restaurant/branch id to user object (mock session)
      const user: User = {
        id: userRaw.id,
        email: userRaw.email,
        name: userRaw.name,
        role: userRaw.role as UserRole,
        avatar: userRaw.avatar,
        branchId: restaurantId,
      };
      sessionUser = user;
      saveUser(user);
      
      // Mock JWT token
      localStorage.setItem('auth_token', `mock_jwt_token_${user.id}_${Date.now()}`);
      localStorage.setItem('restaurant_id', restaurantId);
      
      set({ user, isAuthenticated: true, isLoading: false });
      toast({ 
        title: 'Welcome back!', 
        description: `Logged in successfully` 
      });
    } else {
      set({ isLoading: false });
      toast({
        variant: 'destructive',
        title: 'Login failed',
        description: 'Invalid credentials or branch ID.',
      });
      throw new Error('Invalid credentials');
    }
  },

  register: async (email: string, password: string, name: string) => {
    set({ isLoading: true });
    const exists = mockUsers.some(u => u.email === email);
    if (exists) {
      set({ isLoading: false });
      toast({
        variant: 'destructive',
        title: 'Registration failed',
        description: 'Email already registered.',
      });
      throw new Error('Email already registered');
    }
    const newUser = {
      id: (mockUsers.length + 1).toString(),
      email,
      name,
      role: 'owner' as UserRole, // Register as owner for restaurant management
      avatar: undefined,
      password,
    };
    mockUsers.push(newUser);
    
    // Persist mockUsers to localStorage
    localStorage.setItem('mock_users', JSON.stringify(mockUsers));
    
    const { password: _pw, ...user } = newUser;
    sessionUser = user;
    saveUser(user);
    
    // Mock JWT token
    localStorage.setItem('auth_token', `mock_jwt_token_${user.id}_${Date.now()}`);
    
    set({ user, isAuthenticated: true, isLoading: false });
    toast({
      title: 'Welcome aboard!',
      description: 'Your account has been created. Let\'s set up your restaurant.',
    });
  },

  logout: async () => {
    sessionUser = null;
    saveUser(null);
    set({ user: null, isAuthenticated: false });
    toast({
      title: 'Logged out',
      description: 'You have been successfully logged out.',
    });
  },

  setUser: (user) => {
    sessionUser = user;
    saveUser(user);
    set({ user, isAuthenticated: !!user });
  },
}));
