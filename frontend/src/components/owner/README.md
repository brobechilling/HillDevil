# Owner Dashboard Components

This directory contains all the components specific to the Owner role in the Restaurant Management SaaS.

## Structure

```
src/components/owner/
├── README.md                    # This file
├── OverviewDashboard.tsx       # Dashboard overview with KPIs and QR codes
├── MenuManagement.tsx          # Menu items CRUD operations
├── MenuItemDialog.tsx          # Dialog for add/edit menu items
├── MenuItemViewDialog.tsx      # Dialog for viewing menu item details
├── TableManagement.tsx         # Table CRUD operations
├── TableDialog.tsx             # Dialog for add/edit tables
├── TableQRDialog.tsx           # Dialog for viewing/downloading table QR codes
├── StaffManagement.tsx         # Staff CRUD operations
├── StaffDialog.tsx             # Dialog for add/edit staff members
└── ReportsAnalytics.tsx        # Reports and analytics dashboard
```

## How It Works

### Main Dashboard Layout

The `OwnerDashboard` (`src/pages/dashboard/OwnerDashboard.tsx`) uses a custom layout (`OwnerDashboardLayout`) that provides:

1. **Sidebar Navigation**: Left sidebar with 5 main sections
2. **State Management**: Active view state to control which feature is displayed
3. **Branch Context**: Loads user's branches and passes the active branch to features

### Sidebar Navigation Items

Current navigation items:
- **Overview**: Dashboard summary, KPIs, branch QR codes
- **Menu Management**: CRUD operations for menu items
- **Table Management**: CRUD operations for tables with QR code generation
- **Staff Management**: CRUD operations for staff accounts
- **Reports & Analytics**: Revenue and order analytics

### Data Flow

```
OwnerDashboard (main page)
    ↓ (loads branches)
    ↓ (manages active view state)
OwnerDashboardLayout (sidebar navigation)
    ↓ (renders based on activeView)
Feature Components (Menu/Table/Staff/Reports)
    ↓ (uses Zustand stores)
Zustand Stores (menuStore, tableStore, staffStore)
    ↓ (persists to localStorage)
LocalStorage (mock backend)
```

## Adding a New Feature

To add a new feature to the Owner Dashboard:

### Step 1: Create the Feature Component

```tsx
// src/components/owner/MyNewFeature.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface MyNewFeatureProps {
  branchId: string;
}

export const MyNewFeature = ({ branchId }: MyNewFeatureProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>My New Feature</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Your feature content */}
      </CardContent>
    </Card>
  );
};
```

### Step 2: Add Navigation Item to Layout

In `src/components/layout/OwnerDashboardLayout.tsx`, add to the `menuItems` array:

```tsx
const menuItems = [
  // ... existing items
  { 
    id: 'my-feature',           // Unique identifier
    icon: YourIcon,             // Lucide React icon
    label: 'My Feature',        // Display name
    description: 'Feature description'  // Subtitle
  },
];
```

### Step 3: Add Route in Main Dashboard

In `src/pages/dashboard/OwnerDashboard.tsx`, import and add the component:

```tsx
import { MyNewFeature } from '@/components/owner/MyNewFeature';

// ... inside return statement
return (
  <OwnerDashboardLayout activeView={activeView} onViewChange={setActiveView}>
    {/* ... existing routes */}
    {activeView === 'my-feature' && activeBranch && (
      <MyNewFeature branchId={activeBranch.id} />
    )}
  </OwnerDashboardLayout>
);
```

### Step 4: (Optional) Create a Zustand Store

If your feature needs state management:

```tsx
// src/store/myFeatureStore.ts
import { create } from 'zustand';

interface MyFeatureState {
  items: any[];
  addItem: (item: any) => void;
  // ... other methods
}

export const useMyFeatureStore = create<MyFeatureState>((set) => ({
  items: [],
  addItem: (item) => set((state) => ({ items: [...state.items, item] })),
}));
```

## Best Practices

### 1. Component Structure

Each feature should have:
- **Main Component**: List view with CRUD operations
- **Dialog Component(s)**: Forms for add/edit operations
- **View Dialog** (optional): Read-only detail view

### 2. State Management

- Use Zustand stores for feature-specific state
- Persist to localStorage for mock backend
- Use `branchId` to filter data by branch

### 3. UI Consistency

- Use shadcn/ui components for all UI elements
- Follow existing patterns for cards, buttons, dialogs
- Maintain responsive design with TailwindCSS
- Use semantic color tokens from `index.css`

### 4. Error Handling

```tsx
import { toast } from '@/hooks/use-toast';

try {
  // Operation
  toast({
    title: 'Success',
    description: 'Operation completed',
  });
} catch (error) {
  toast({
    variant: 'destructive',
    title: 'Error',
    description: 'Operation failed',
  });
}
```

### 5. Confirmation Dialogs

Use AlertDialog for destructive actions:

```tsx
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
```

## Maintenance Tips

### Updating Navigation

- Navigation items are defined in `OwnerDashboardLayout.tsx`
- Active state styling is automatic based on `activeView`
- Icon colors and hover states use theme colors

### Styling Guidelines

- Never use direct color values (e.g., `text-white`, `bg-blue-500`)
- Always use semantic tokens: `text-primary`, `bg-muted`, etc.
- Use `cn()` utility for conditional classes
- Follow the existing spacing and sizing patterns

### Testing Checklist

When adding/modifying features:
- ✅ Component renders correctly
- ✅ CRUD operations work (add, edit, delete)
- ✅ Dialogs open and close properly
- ✅ Data persists to localStorage
- ✅ Toast notifications display
- ✅ Responsive on mobile/tablet/desktop
- ✅ No console errors or warnings

## Common Patterns

### Dialog Pattern

```tsx
const [isDialogOpen, setIsDialogOpen] = useState(false);
const [selectedItem, setSelectedItem] = useState<Item | undefined>();

const handleEdit = (item: Item) => {
  setSelectedItem(item);
  setIsDialogOpen(true);
};

const handleAdd = () => {
  setSelectedItem(undefined);
  setIsDialogOpen(true);
};
```

### Delete Confirmation Pattern

```tsx
const [itemToDelete, setItemToDelete] = useState<string | null>(null);

// In component
<Button onClick={() => setItemToDelete(item.id)}>Delete</Button>

// AlertDialog
<AlertDialog open={!!itemToDelete} onOpenChange={() => setItemToDelete(null)}>
  {/* ... dialog content */}
</AlertDialog>
```

### Loading State Pattern

```tsx
const [loading, setLoading] = useState(true);

useEffect(() => {
  const loadData = async () => {
    try {
      setLoading(true);
      // Load data
    } finally {
      setLoading(false);
    }
  };
  loadData();
}, []);

if (loading) {
  return <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />;
}
```

## File Naming Conventions

- **Feature Components**: `PascalCase` (e.g., `MenuManagement.tsx`)
- **Dialog Components**: `PascalCase` with suffix (e.g., `MenuItemDialog.tsx`)
- **Store Files**: `camelCase` with suffix (e.g., `menuStore.ts`)
- **Type Definitions**: Export from store files or create separate `.types.ts` files

## Future Enhancements

Potential features to add:
- Promotions Management
- Inventory Management
- Customer Management
- Booking Management
- Order History
- Branch Settings
- Payment Integration
- Notification Center

Each can follow the same pattern documented above.
