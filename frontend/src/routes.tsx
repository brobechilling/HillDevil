import { RouteObject } from 'react-router-dom';
import Index from './pages/Index';
import Login from './pages/Login';
import Register from './pages/Register';
import RegisterPackage from './pages/auth/RegisterPackage';
import RegisterConfirm from './pages/auth/RegisterConfirm';
import BrandSelection from './pages/auth/BrandSelection';
import ForgotPassword from './pages/ForgotPassword';
import OwnerDashboard from './pages/dashboard/OwnerDashboard';
import ManagerDashboard from './pages/dashboard/ManagerDashboard';
import AdminDashboard from './pages/dashboard/AdminDashboard';
import WaiterDashboard from './pages/dashboard/WaiterDashboard';
import ReceptionistDashboard from './pages/dashboard/ReceptionistDashboard';
import ReservationGuestLanding from './pages/ReservationGuestLanding';
import GuestLanding from './pages/GuestLanding';
import NotFound from './pages/NotFound';
import ProtectedRoute from './components/ProtectedRoute';
import RestaurantLoginPage from './pages/auth/RestaurantLoginPage';
import PaymentPage from "./pages/payment/PaymentPage";
import PaymentSuccessPage from "./pages/payment/PaymentSuccessPage";
import PaymentCancelPage from "./pages/payment/PaymentCancelPage";

// Manager nested pages
import ManagerOverviewPage from './pages/dashboard/manager/OverviewPage';
import ManagerBranchInfoPage from './pages/dashboard/manager/BranchInfoPage';
import ManagerTablesPage from './pages/dashboard/manager/TablesPage';
import ManagerStaffPage from './pages/dashboard/manager/StaffPage';
import ManagerPromotionsPage from './pages/dashboard/manager/PromotionsPage';
import ManagerBillsPage from './pages/dashboard/manager/BillsPage';
import ManagerMenuPage from './pages/dashboard/manager/MenuPage';

// Owner nested pages
import OwnerOverviewPage from './pages/dashboard/owner/OverviewPage';
import RestaurantInfoPage from './pages/dashboard/owner/RestaurantInfoPage';
import OwnerMenuPage from './pages/dashboard/owner/MenuPage';
import OwnerTablesPage from './pages/dashboard/owner/TablesPage';
import OwnerStaffPage from './pages/dashboard/owner/StaffPage';
import BranchSelectionPage from './pages/dashboard/owner/BranchSelectionPage';

import OwnerReportsPage from './pages/dashboard/owner/ReportsPage';
import OwnerCustomizationPage from './pages/dashboard/owner/CustomizationPage';
import { CategoryCustomizationManagement } from './pages/dashboard/owner/CategoryCustomizationManagement';

// Waiter nested pages
import WaiterOrdersPage from './pages/dashboard/waiter/OrdersPage';
import WaiterTablesPage from './pages/dashboard/waiter/TablesPage';
import WaiterMenuPage from './pages/dashboard/waiter/MenuPage';

// Admin nested pages
import AdminOverviewPage from './pages/dashboard/admin/OverviewPage';
import AdminUsersPage from './pages/dashboard/admin/UsersPage';
import AdminPackagesPage from './pages/dashboard/admin/PackagesPage';

// Receptionist nested pages
import ReceptionistReservationsPage from './pages/dashboard/receptionist/ReservationsPage';
import ReceptionistTablesPage from './pages/dashboard/receptionist/TablesPage';
import ReceptionistCommunicationsPage from './pages/dashboard/receptionist/CommunicationsPage';
import ReceptionistBillingPage from './pages/dashboard/receptionist/BillingPage';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import { ROLE_NAME } from './dto/user.dto';


export const routes: RouteObject[] = [
  {
    path: '/',
    element: <Index />,
  },
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/forgot-password',
    element: <ForgotPassword />,
  },
  {
    path: '/register',
    element: <Register />,
  },
  {
    path: '/register/package',
    element: (
      <ProtectedRoute>
        <RegisterPackage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/register/confirm',
    element: (
      <ProtectedRoute>
        <RegisterConfirm />
      </ProtectedRoute>
    ),
  },
  {
    path: '/payment/:orderCode',
    element: (
      <ProtectedRoute>
        <PaymentPage />
      </ProtectedRoute>
    ),
  },
  {
    
    path: '/:restaurantSlug',
    element: <ReservationGuestLanding />,
  },
  // {
  //   path: '/:restaurantSlug/branch/:branchId',
  //   element: <GuestLanding />,
  // },
  {
    path: '/t/:branchId/:tableId',
    element: <GuestLanding />,
  },
  {
    path: '/t/:areaName/:tableName',
    element: <GuestLanding />,
  },
  {
    path: '/payment/success',
    element: (
      <ProtectedRoute>
        <PaymentSuccessPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/payment/cancel',
    element: (
      <ProtectedRoute>
        <PaymentCancelPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/brand-selection',
    element: (
      <ProtectedRoute>
        <BrandSelection />
      </ProtectedRoute>
    ),
  },
  {
    path: '/dashboard/owner',
    element: (
      <ProtectedRoute allowedRoles={[ROLE_NAME.RESTAURANT_OWNER]}>
        <OwnerDashboard />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <OwnerOverviewPage />,
      },
      {
        path: 'overview',
        element: <OwnerOverviewPage />,
      },
      {
        path: 'menu',
        element: <OwnerMenuPage />,
      },
      {
        path: 'restaurant',
        element: <RestaurantInfoPage />,
      },
      {
        path: 'tables',
        element: <OwnerTablesPage />,
      },
      {
        path: 'staff',
        element: <OwnerStaffPage />,
      },
      {
        path: 'categories-customizations',
        element: <CategoryCustomizationManagement />,
      },
      {
        path: 'reports',
        element: <OwnerReportsPage />,
      },
      {
        path: 'customization',
        element: <OwnerCustomizationPage />,
      },
      {
        path: 'branch-selection',
        element: <BranchSelectionPage />,
      }
    ],
  },

  {
    path: '/dashboard/manager',
    element: (
      <ProtectedRoute allowedRoles={[ROLE_NAME.BRANCH_MANAGER, ROLE_NAME.RESTAURANT_OWNER]}>
        <ManagerDashboard />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <ManagerOverviewPage />,
      },
      {
        path: 'overview',
        element: <ManagerOverviewPage />,
      },
      {
        path: 'branch',
        element: <ManagerBranchInfoPage />,
      },
      {
        path: 'tables',
        element: <ManagerTablesPage />,
      },
      {
        path: 'staff',
        element: <ManagerStaffPage />,
      },
      {
        path: 'promotions',
        element: <ManagerPromotionsPage />,
      },
      {
        path: 'bills',
        element: <ManagerBillsPage />,
      },
      {
        path: 'menu',
        element: <ManagerMenuPage />,
      },
    ],
  },
  {
    path: '/dashboard/admin',
    element: (
      <ProtectedRoute allowedRoles={[ROLE_NAME.ADMIN]}>
        <AdminDashboard />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <AdminOverviewPage />,
      },
      {
        path: 'users',
        element: <AdminUsersPage />,
      },
      {
        path: 'packages',
        element: <AdminPackagesPage />,
      },
    ],
  },
  {
    path: '/dashboard/waiter',
    element: (
      <ProtectedRoute allowedRoles={[ROLE_NAME.WAITER, ROLE_NAME.ADMIN]}>
        <WaiterDashboard />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <WaiterOrdersPage />,
      },
      {
        path: 'orders',
        element: <WaiterOrdersPage />,
      },
      {
        path: 'tables',
        element: <WaiterTablesPage />,
      },
      {
        path: 'menu',
        element: <WaiterMenuPage />,
      },
    ],
  },
  {
    path: '/dashboard/receptionist',
    element: (
      <ProtectedRoute allowedRoles={[ROLE_NAME.RECEPTIONIST, ROLE_NAME.ADMIN]}>
        <ReceptionistDashboard />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <ReceptionistReservationsPage />,
      },
      {
        path: 'reservations',
        element: <ReceptionistReservationsPage />,
      },
      {
        path: 'tables',
        element: <ReceptionistTablesPage />,
      },
      {
        path: 'billing',
        element: <ReceptionistBillingPage />,
      },
      {
        path: 'communications',
        element: <ReceptionistCommunicationsPage />,
      },
    ],
  },
  {
    path: '/profile',
    element: (
      <ProtectedRoute allowedRoles={[ROLE_NAME.RESTAURANT_OWNER, ROLE_NAME.ADMIN]}>
        <Profile />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Profile />,
      },
      {
        path: 'overview',
        element: <Profile />,
      },
      {
        path: 'subscription',
        element: <Profile />,
      },
      {
        path: 'branches',
        element: <Profile />,
      },
    ],
  },
  {
    path: '/restaurant-login',
    element: <RestaurantLoginPage />,
  },
  {
    path: '/settings',
    element: (
      <ProtectedRoute>
        <Settings />
      </ProtectedRoute>
    ),
  },
  {
    path: '*',
    element: <NotFound />,
  },
];