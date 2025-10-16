import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useMenuStore } from '@/store/menuStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Eye, AlertCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { MenuItemViewDialog } from '@/components/owner/MenuItemViewDialog';

const MenuPage = () => {
  const { user } = useAuthStore();
  const branchId = user?.branchId || '';
  const { items: menuItems, updateItem } = useMenuStore();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);

  const branchMenu = menuItems.filter(item => item.branchId === branchId);
  const categories = ['all', ...Array.from(new Set(branchMenu.map(item => item.category)))];

  const filteredItems = branchMenu.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === 'all' || item.category === category;
    return matchesSearch && matchesCategory;
  });

  const handleToggleAvailability = (itemId: string) => {
    const item = menuItems.find(i => i.id === itemId);
    if (item) {
      updateItem(itemId, { available: !item.available });
      toast({
        title: 'Menu updated',
        description: `${item.name} marked as ${!item.available ? 'available' : 'unavailable'}`,
      });
    }
  };

  const handleViewItem = (itemId: string) => {
    setSelectedItem(itemId);
    setViewDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Menu Items</h2>
      </div>

      <div className="flex gap-4">
        <Input
          placeholder="Search menu items..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat === 'all' ? 'All Categories' : cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredItems.map((item) => (
          <Card
            key={item.id}
            className="overflow-hidden flex flex-col h-full transition-all hover:shadow-lg hover:-translate-y-1 duration-300"
          >
            {/* --- Fixed image height --- */}
            <div className="h-[220px] w-full bg-muted flex items-center justify-center overflow-hidden">
              {item.imageUrl ? (
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = "none";
                  }}
                />
              ) : (
                <span className="text-sm text-muted-foreground">No image</span>
              )}
            </div>

            {/* --- Content --- */}
            <CardContent className="flex flex-col justify-between flex-1 p-4">
              <div className="flex flex-col flex-1">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-semibold text-lg leading-tight">{item.name}</h3>
                  <Badge
                    className={`${item.available
                        ? "bg-orange-500 hover:bg-orange-500 text-white"
                        : "bg-gray-400 text-white"
                      }`}
                  >
                    {item.available ? "Available" : "Unavailable"}
                  </Badge>
                </div>

                {/* --- Description (fixed height) --- */}
                <p className="text-sm text-muted-foreground mt-1 mb-2 min-h-[48px] line-clamp-2">
                  {item.description}
                </p>

                {/* --- Price + Category --- */}
                <div className="flex justify-between items-center mt-auto">
                  <span className="font-semibold text-base">${item.price.toFixed(2)}</span>
                  <Badge variant="outline" className="text-xs">
                    {item.category}
                  </Badge>
                </div>
              </div>

              {/* --- Buttons always equal height --- */}
              <div className="flex gap-2 mt-4">
                <Button
                  variant="outline"
                  className="flex-1 h-10"
                  onClick={() => handleViewItem(item.id)}
                >
                  <Eye className="mr-2 h-4 w-4" />
                  View
                </Button>
                <Button
                  variant={item.available ? "destructive" : "default"}
                  className="flex-1 h-10"
                  onClick={() => handleToggleAvailability(item.id)}
                >
                  <AlertCircle className="mr-2 h-4 w-4" />
                  {item.available ? "Mark Out" : "Mark In"}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>


      <MenuItemViewDialog
        item={menuItems.find(i => i.id === selectedItem)}
        open={viewDialogOpen}
        onOpenChange={setViewDialogOpen}
      />
    </div>
  );
};

export default MenuPage;
