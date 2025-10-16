import { seedReservations } from './seedReservations';

// Seed branch data for menu, tables, staff if not present
export function seedBranchData(branchId: string) {
  // Seed reservations
  seedReservations(branchId);
  
  // Seed menu items
  const menuKey = 'menu_items';
  let menu = JSON.parse(localStorage.getItem(menuKey) || '[]');
  if (!menu.some((item: any) => item.branchId === branchId)) {
    const branchMenu = mockMenuItems.map(item => ({
      ...item,
      branchId,
      id: `${branchId}-menu-${item.id}`,
      createdAt: new Date().toISOString(),
    }));
    menu = [...menu, ...branchMenu];
    localStorage.setItem(menuKey, JSON.stringify(menu));
  }

  // Seed tables
  const tableKey = 'tables';
  let tables = JSON.parse(localStorage.getItem(tableKey) || '[]');
  if (!tables.some((t: any) => t.branchId === branchId)) {
    const branchTables = mockTables.map(table => ({
      ...table,
      branchId,
      id: `${branchId}-table-${table.id}`,
      createdAt: new Date().toISOString(),
    }));
    tables = [...tables, ...branchTables];
    localStorage.setItem(tableKey, JSON.stringify(tables));
  }

  // Seed staff
  const staffKey = 'staff_members';
  let staff = JSON.parse(localStorage.getItem(staffKey) || '[]');
  if (!staff.some((s: any) => s.branchId === branchId)) {
    const branchStaff = mockStaff.map(staff => ({
      ...staff,
      branchId,
      id: `${branchId}-staff-${staff.id}`,
      createdAt: new Date().toISOString(),
    }));
    staff = [...staff, ...branchStaff];
    localStorage.setItem(staffKey, JSON.stringify(staff));
  }
}
// Initialize localStorage with mock data on app load
import { 
  mockBranches, 
  mockMenuItems, 
  mockTables, 
  mockOrders, 
  mockStaff,
  mockBrands,
  mockUsers,
  mockCustomizations
} from '@/data/mockData';

export const initializeMockData = () => {
  // Always initialize to ensure consistency
  localStorage.setItem('mock_branches', JSON.stringify(mockBranches));
  localStorage.setItem('mock_menu_items', JSON.stringify(mockMenuItems));
  localStorage.setItem('mock_tables', JSON.stringify(mockTables));
  localStorage.setItem('mock_orders', JSON.stringify(mockOrders));
  localStorage.setItem('mock_staff', JSON.stringify(mockStaff));
  localStorage.setItem('mock_brands', JSON.stringify(mockBrands));
  localStorage.setItem('mock_users', JSON.stringify(mockUsers));
  
  // Initialize Zustand store data
  localStorage.setItem('tables', JSON.stringify(mockTables));
  localStorage.setItem('menu_items', JSON.stringify(mockMenuItems));
  localStorage.setItem('staff_members', JSON.stringify(mockStaff));
  localStorage.setItem('customizations', JSON.stringify(mockCustomizations));
  
  // Initialize reservations if not present (will be created by users)
  if (!localStorage.getItem('reservations')) {
    localStorage.setItem('reservations', JSON.stringify([]));
  }
  
  // Always initialize areas to ensure consistency
  const defaultAreas = [
    { id: 'area-1', branchId: '1', name: 'Main Dining', floor: 1, status: 'active', createdAt: new Date().toISOString() },
    { id: 'area-2', branchId: '1', name: 'VIP Section', floor: 2, status: 'active', createdAt: new Date().toISOString() },
    { id: 'area-3', branchId: '2', name: 'Ground Floor', floor: 1, status: 'active', createdAt: new Date().toISOString() },
    { id: 'area-4', branchId: '2', name: 'Upper Level', floor: 2, status: 'active', createdAt: new Date().toISOString() },
  ];
  localStorage.setItem('areas', JSON.stringify(defaultAreas));
};

// Get data for a specific branch
export const getBranchData = (branchId: string) => {
  const menuItems = JSON.parse(localStorage.getItem('mock_menu_items') || '[]')
    .filter((item: any) => item.branchId === branchId);
  
  const tables = JSON.parse(localStorage.getItem('mock_tables') || '[]')
    .filter((table: any) => table.branchId === branchId);
  
  const orders = JSON.parse(localStorage.getItem('mock_orders') || '[]')
    .filter((order: any) => order.branchId === branchId);
  
  const staff = JSON.parse(localStorage.getItem('mock_staff') || '[]')
    .filter((s: any) => s.branchId === branchId);

  return { menuItems, tables, orders, staff };
};
