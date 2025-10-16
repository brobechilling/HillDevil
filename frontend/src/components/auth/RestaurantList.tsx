import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Building2, ChevronRight } from 'lucide-react';

interface Brand {
  name: string;
  branches: any[];
  logoUrl?: string;
}

interface RestaurantListProps {
  onSelectRestaurant: (restaurant: any) => void;
}

export const RestaurantList = ({ onSelectRestaurant }: RestaurantListProps) => {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [filteredBrands, setFilteredBrands] = useState<Brand[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    loadBrands();
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = brands.filter(b =>
        b.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredBrands(filtered);
    } else {
      setFilteredBrands(brands);
    }
  }, [searchQuery, brands]);

  const loadBrands = () => {
    try {
      const storedBranches = localStorage.getItem('mock_branches');
      const allBranches = storedBranches ? JSON.parse(storedBranches) : [];
      
      // Group branches by brand
      const brandMap = new Map<string, any[]>();
      allBranches.forEach((branch: any) => {
        const brandName = branch.brandName || 'Unnamed Brand';
        if (!brandMap.has(brandName)) {
          brandMap.set(brandName, []);
        }
        brandMap.get(brandName)?.push(branch);
      });

      const brandsList = Array.from(brandMap.entries()).map(([name, branches]) => ({
        name,
        branches,
        logoUrl: branches[0]?.logoUrl,
      }));

      setBrands(brandsList);
      setFilteredBrands(brandsList);
    } catch (error) {
      console.error('Failed to load brands:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBrandSelect = (brand: Brand) => {
    // Pass the brand object so the login form can show brand name and branch list
    onSelectRestaurant(brand);
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading brands...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by brand name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {filteredBrands.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No brands found
          </div>
        ) : (
          filteredBrands.map((brand) => (
            <button
              key={brand.name}
              onClick={() => handleBrandSelect(brand)}
              className="w-full p-4 text-left border rounded-lg hover:border-primary hover:bg-muted/50 transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    {brand.logoUrl ? (
                      <img src={brand.logoUrl} alt={brand.name} className="h-8 w-8 object-contain" />
                    ) : (
                      <Building2 className="h-5 w-5 text-primary" />
                    )}
                    <h3 className="font-semibold text-lg">{brand.name}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {brand.branches.length} {brand.branches.length === 1 ? 'Branch' : 'Branches'}
                  </p>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
};
