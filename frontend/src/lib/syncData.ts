// Utility to sync data between different localStorage keys
// This ensures consistency between menu_items and mock_menu_items

export const syncMenuData = () => {
  try {
    const menuItems = localStorage.getItem('menu_items');
    const mockMenuItems = localStorage.getItem('mock_menu_items');
    
    if (menuItems && !mockMenuItems) {
      // If we have menu_items but no mock_menu_items, copy it
      localStorage.setItem('mock_menu_items', menuItems);
      console.log('Synced menu_items to mock_menu_items');
    } else if (mockMenuItems && !menuItems) {
      // If we have mock_menu_items but no menu_items, copy it
      localStorage.setItem('menu_items', mockMenuItems);
      console.log('Synced mock_menu_items to menu_items');
    } else if (menuItems && mockMenuItems) {
      // If we have both, use the more recent one
      const menuData = JSON.parse(menuItems);
      const mockData = JSON.parse(mockMenuItems);
      
      // Use the one with more items or more recent data
      if (menuData.length > mockData.length) {
        localStorage.setItem('mock_menu_items', menuItems);
        console.log('Updated mock_menu_items with menu_items data');
      } else if (mockData.length > menuData.length) {
        localStorage.setItem('menu_items', mockMenuItems);
        console.log('Updated menu_items with mock_menu_items data');
      }
    }
  } catch (error) {
    console.error('Failed to sync menu data:', error);
  }
};

export const getMenuItems = (branchId?: string) => {
  syncMenuData();
  
  // Try to get from both sources
  const menuItems = localStorage.getItem('menu_items');
  const mockMenuItems = localStorage.getItem('mock_menu_items');
  
  let items = [];
  if (menuItems) {
    items = JSON.parse(menuItems);
  } else if (mockMenuItems) {
    items = JSON.parse(mockMenuItems);
  }
  
  // Filter by branchId if provided
  if (branchId) {
    return items.filter((item: any) => item.branchId === branchId);
  }
  
  return items;
};

export const clearAllMenuData = () => {
  localStorage.removeItem('menu_items');
  localStorage.removeItem('mock_menu_items');
  console.log('Cleared all menu data');
};

