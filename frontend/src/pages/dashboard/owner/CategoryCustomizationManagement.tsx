// src/pages/owner/CategoryCustomizationManagement.tsx
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CategoryList } from '@/components/owner/CategoryList';
import { CustomizationList } from '@/components/owner/CustomizationList';
import { FolderTree, Sparkles } from 'lucide-react';

export const CategoryCustomizationManagement = () => {
  return (
    <div className="max-w-6xl mx-auto px-6 lg:px-10 pt-8 pb-16 animate-in fade-in duration-300">
      {/* Header */}
      <div className="mb-8 space-y-2 animate-in slide-in-from-top-4 duration-500">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <FolderTree className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground tracking-tight">
              Categories & Customizations
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Organize your menu structure and manage add-on options
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="categories" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md mb-8 h-11 bg-muted/50">
          <TabsTrigger 
            value="categories" 
            className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all duration-200"
          >
            <FolderTree className="h-4 w-4" />
            Categories
          </TabsTrigger>
          <TabsTrigger 
            value="customizations"
            className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all duration-200"
          >
            <Sparkles className="h-4 w-4" />
            Customizations
          </TabsTrigger>
        </TabsList>

        <TabsContent value="categories" className="mt-0 animate-in fade-in duration-300">
          <CategoryList />
        </TabsContent>
        <TabsContent value="customizations" className="mt-0 animate-in fade-in duration-300">
          <CustomizationList />
        </TabsContent>
      </Tabs>
    </div>
  );
};
