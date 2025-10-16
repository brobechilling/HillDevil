import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChefHat, Star, AlertTriangle } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { toast } from '@/hooks/use-toast';
import { getMenuItems } from '@/lib/syncData';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string;
  branchId: string;
  bestSeller?: boolean;
  available?: boolean;
}

export default function MenuPage() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const { user } = useAuthStore();

  useEffect(() => {
    loadMenuItems();
  }, [user]);

  const loadMenuItems = () => {
    const allMenu: any[] = getMenuItems(user?.branchId);
    setMenuItems(allMenu as MenuItem[]);
  };

  const toggleBestSeller = (itemId: string) => {
    const allMenu: MenuItem[] = getMenuItems();
    const updatedMenu = allMenu.map(item => item.id === itemId ? { ...item, bestSeller: !item.bestSeller } : item);
    localStorage.setItem('menu_items', JSON.stringify(updatedMenu));
    localStorage.setItem('mock_menu_items', JSON.stringify(updatedMenu));
    loadMenuItems();
    
    const item = updatedMenu.find(i => i.id === itemId);
    toast({
      title: item?.bestSeller ? 'Marked as Best Seller' : 'Removed Best Seller',
      description: `${item?.name} has been updated.`,
    });
  };

  const toggleAvailability = (itemId: string) => {
    const allMenu: MenuItem[] = getMenuItems();
    const updatedMenu = allMenu.map(item => item.id === itemId ? { ...item, available: item.available === false ? true : false } : item);
    localStorage.setItem('menu_items', JSON.stringify(updatedMenu));
    localStorage.setItem('mock_menu_items', JSON.stringify(updatedMenu));
    loadMenuItems();
    
    const item = updatedMenu.find(i => i.id === itemId);
    toast({
      title: item?.available === false ? 'Marked Out of Order' : 'Marked Available',
      description: `${item?.name} has been updated.`,
    });
  };

  const categories = ['all', ...new Set(menuItems.map(item => item.category))];
  const filteredItems = selectedCategory === 'all' 
    ? menuItems 
    : menuItems.filter(item => item.category === selectedCategory);

  const bestSellerCount = menuItems.filter(item => item.bestSeller).length;
  const unavailableCount = menuItems.filter(item => item.available === false).length;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold">Menu Management</h2>
        <p className="text-muted-foreground">Manage menu items and availability</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
            <ChefHat className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{menuItems.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Best Sellers</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bestSellerCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Out of Order</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{unavailableCount}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Menu Items</CardTitle>
              <CardDescription>Mark items as best seller or out of order</CardDescription>
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {filteredItems.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <ChefHat className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No menu items found</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredItems.map((item) => (
                <Card key={item.id} className={`overflow-hidden ${item.available === false ? 'opacity-60' : ''}`}>
                  <div className="aspect-video bg-muted relative">
                    <img 
                      src={item.imageUrl} 
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                    {item.bestSeller && (
                      <Badge className="absolute top-2 left-2 bg-yellow-500 hover:bg-yellow-600">
                        <Star className="h-3 w-3 mr-1" />
                        Best Seller
                      </Badge>
                    )}
                    {item.available === false && (
                      <Badge className="absolute top-2 right-2 bg-red-500 hover:bg-red-600">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Out of Order
                      </Badge>
                    )}
                  </div>
                  <CardHeader>
                    <CardTitle className="text-base">{item.name}</CardTitle>
                    <CardDescription className="line-clamp-2">{item.description}</CardDescription>
                    <div className="flex items-center justify-between pt-2">
                      <span className="text-lg font-bold">${item.price}</span>
                      <Badge variant="outline">{item.category}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button
                      variant={item.bestSeller ? "default" : "outline"}
                      size="sm"
                      className="w-full"
                      onClick={() => toggleBestSeller(item.id)}
                    >
                      <Star className="h-3 w-3 mr-2" />
                      {item.bestSeller ? 'Remove Best Seller' : 'Mark Best Seller'}
                    </Button>
                    <Button
                      variant={item.available === false ? "default" : "outline"}
                      size="sm"
                      className="w-full"
                      onClick={() => toggleAvailability(item.id)}
                    >
                      <AlertTriangle className="h-3 w-3 mr-2" />
                      {item.available === false ? 'Mark Available' : 'Mark Out of Order'}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
