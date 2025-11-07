import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { menuApi } from '@/lib/api';
import { getBranchById } from '@/api/branchApi';
// Note: GuestLanding now supports both shortCode (from mock) and UUID branchId (from QR codes)
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShoppingCart, MapPin, Phone, Mail, Clock, Plus, Minus, Loader2, Calendar } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { OrderDialog } from '@/components/OrderDialog';
import { BookingDialog } from '@/components/BookingDialog';
import { ReservationBookingForm } from '@/components/ReservationBookingForm';
import { motion } from 'framer-motion';
import { getThemeById } from '@/lib/themes';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { OrderItem } from '@/store/orderStore';

type MenuItemLite = {
  id: string;
  name: string;
  price: number;
  category: string;
  description?: string;
  imageUrl?: string;
  available?: boolean;
  bestSeller?: boolean;
};

type ThemeColors = {
  pageBackground?: string;
  heroBackground?: string;
  heroText?: string;
  heroAccent?: string;
  cardBackground?: string;
  cardBorder?: string;
  buttonPrimary?: string;
  buttonPrimaryText?: string;
  buttonSecondary?: string;
  buttonSecondaryText?: string;
  headingColor?: string;
  bodyTextColor?: string;
};

type BranchLite = {
  id: string;
  brandName?: string;
  name?: string;
  logoUrl?: string;
  bannerUrl?: string;
  tagline?: string;
  description?: string;
  address?: string;
  phone?: string;
  email?: string;
  selectedThemeId?: string;
  themeColors?: ThemeColors;
  layout?: 'default' | 'masonry' | 'centered' | 'sidebar' | 'free';
  galleryImages?: string[];
  sliderImages?: string[];
  gradientFrom?: string;
  gradientTo?: string;
  gradientDirection?: string;
  aboutSection1Title?: string;
  aboutSection1Text?: string;
  aboutSection1Image?: string;
  aboutSection2Title?: string;
  aboutSection2Text?: string;
  aboutSection2Image?: string;
};

const GuestLanding = () => {
  const { shortCode, tableId, areaName, tableName, branchId } = useParams<{ 
    shortCode?: string; 
    tableId?: string; 
    areaName?: string; 
    tableName?: string;
    branchId?: string; // New format: /t/:branchId/:tableId
  }>();
  // Support multiple formats:
  // - New format: /t/:branchId/:tableId (branchId and tableId from params)
  // - Old format: /t/:areaName/:tableName (tableName from params)
  // - Legacy format: /t/:tableId or /t/:tableName (tableId from params)
  const actualTableIdentifier = tableName || tableId;
  const actualBranchId = branchId || shortCode; // branchId from new format, or shortCode from /branch/:shortCode
  const [branch, setBranch] = useState<BranchLite | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItemLite[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState<OrderItem[]>([]);
  const [orderType, setOrderType] = useState<'now' | 'booking'>('now');
  const [tableNumber, setTableNumber] = useState<string>('');
  const [flowState, setFlowState] = useState<'selection' | 'menu' | 'reservation' | 'post-reservation'>('selection');
  const [showMenuAfterReservation, setShowMenuAfterReservation] = useState(false);

  useEffect(() => {
    const loadBranchData = async () => {
      try {
        setLoading(true);
        
        // If we have tableName/tableId but no shortCode (from /t/:areaName/:tableName, /t/:branchId/:tableId, or /t/:tableName route), fetch table first to get branchId
        if (actualTableIdentifier && !shortCode) {
          try {
            let tableApiUrl = '';
            
            // NEW FORMAT: /t/:branchId/:tableId - most reliable, unique, prevents conflicts
            if (branchId && tableId) {
              tableApiUrl = `http://localhost:8080/api/public/tables/${encodeURIComponent(branchId)}/${encodeURIComponent(tableId)}`;
            }
            // OLD FORMAT: /t/:areaName/:tableName - for backward compatibility
            else if (areaName && tableName) {
              tableApiUrl = `http://localhost:8080/api/public/tables/${encodeURIComponent(areaName)}/${encodeURIComponent(tableName)}`;
            } 
            // LEGACY FORMAT: /t/:tableId or /t/:tableName - for backward compatibility
            else {
              tableApiUrl = `http://localhost:8080/api/public/tables/${encodeURIComponent(actualTableIdentifier)}`;
            }
            
            // Fetch table from public endpoint - supports both UUID and table name
            const tableResponse = await fetch(tableApiUrl);
            
            if (!tableResponse.ok) {
              // Handle error response from backend
              let errorMessage = `Failed to load table: ${tableResponse.status} ${tableResponse.statusText}`;
              try {
                const errorData = await tableResponse.json();
                errorMessage = errorData.message || errorData.result || errorMessage;
              } catch (e) {
                // Ignore parse errors
              }
              
              // For new format with branchId, we can still try to load branch directly
              if (branchId && tableId) {
                try {
                  const apiBranch = await getBranchById(branchId);
                  if (apiBranch) {
                    const branchData = {
                      id: apiBranch.branchId,
                      branchId: apiBranch.branchId,
                      brandName: apiBranch.address,
                      name: apiBranch.address,
                      address: apiBranch.address,
                      phone: apiBranch.branchPhone,
                      email: apiBranch.mail,
                      shortCode: branchId,
                    };
                    setBranch(branchData);
                    
                    // Load menu
                    const menuResponse = await menuApi.getAll(branchData.id);
                    setMenuItems(menuResponse.data);
                    
                    setFlowState('menu');
                    setOrderType('now');
                    setLoading(false);
                    return; // Early return after successful load
                  }
                } catch (branchError) {
                  throw new Error(errorMessage);
                }
              } else {
                throw new Error(errorMessage);
              }
            }
            
            // Parse successful response
            const tableApiResponse = await tableResponse.json();
            if (tableApiResponse.result?.branchId) {
              // Use branchId from response (or from URL params if using new format)
              const resolvedBranchId = branchId || tableApiResponse.result.branchId;
              const apiBranch = await getBranchById(resolvedBranchId);
              if (apiBranch) {
                const branchData = {
                  id: apiBranch.branchId,
                  branchId: apiBranch.branchId,
                  brandName: apiBranch.address,
                  name: apiBranch.address,
                  address: apiBranch.address,
                  phone: apiBranch.branchPhone,
                  email: apiBranch.mail,
                  shortCode: resolvedBranchId,
                };
                setBranch(branchData);
                
                // Load table number
                setTableNumber(tableApiResponse.result.tag || '');
                
                // Load menu
                const menuResponse = await menuApi.getAll(branchData.id);
                setMenuItems(menuResponse.data);
                
                setFlowState('menu');
                setOrderType('now');
                setLoading(false);
                return; // Early return after successful load
              }
            } else {
              throw new Error('Table response does not contain branchId');
            }
          } catch (error) {
            // Error handling
          }
          // If we can't get branchId, show error
          if (!branch) {
            throw new Error('Could not determine branch from table identifier. Please use full URL format.');
          }
        }
        
        if (!shortCode && !tableId) throw new Error('Branch code or table ID not provided');
        if (!shortCode) throw new Error('Branch code not provided');

        // Check if shortCode is a UUID (from QR code with branchId)
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(shortCode);
        
        let branchData: any = null;
        
        if (isUUID) {
          // If shortCode is actually a UUID (branchId), try to fetch from API first
          try {
            const apiBranch = await getBranchById(shortCode);
            if (apiBranch) {
              branchData = {
                id: apiBranch.branchId,
                branchId: apiBranch.branchId,
                brandName: apiBranch.address, // Use address as name for now
                name: apiBranch.address,
                address: apiBranch.address,
                phone: apiBranch.branchPhone,
                email: apiBranch.mail,
                shortCode: shortCode, // Use UUID as shortCode for this session
              };
            }
          } catch (apiError) {
            // Fallback to localStorage
          }
          
          // If API failed, try localStorage by ID
          if (!branchData) {
            const branches = JSON.parse(localStorage.getItem('mock_branches') || '[]');
            branchData = branches.find((b: any) => b.id === shortCode || b.branchId === shortCode);
          }
        } else {
          // If not UUID, treat as shortCode and search in localStorage
          const branches = JSON.parse(localStorage.getItem('mock_branches') || '[]');
          branchData = branches.find((b: any) => b.shortCode === shortCode);
        }
        
        if (!branchData) {
          throw new Error('Branch not found');
        }
        
        setBranch(branchData);

        if (actualTableIdentifier) {
          // Try to find table in localStorage (for backward compatibility)
          const tables = JSON.parse(localStorage.getItem('mock_tables') || '[]') as Array<{ id: string; number: string; tag?: string }>;
          const table = tables.find((t) => t.id === actualTableIdentifier || t.tag === actualTableIdentifier);
          if (table) {
            setTableNumber(table.number || table.tag || '');
          }
        }

        const menuResponse = await menuApi.getAll(branchData.id);
        setMenuItems(menuResponse.data);
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Branch not found',
          description: 'The requested branch could not be found.',
        });
      } finally {
        setLoading(false);
      }
    };

    loadBranchData();

    // Set initial flow state based on tableId
    if (tableId) {
      setFlowState('menu'); // Directly show the menu for table-based ordering
      setOrderType('now'); // Order immediately for the scanned table
    } else {
      setFlowState('selection'); // Default to selection screen
    }

    // Listen for localStorage changes to reload branch data (both storage event and custom event)
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'mock_branches') {
        loadBranchData();
      }
    };

    const handleLocalStorageChanged = (event: Event) => {
      const customEvent = event as CustomEvent;
      if (customEvent.detail?.key === 'mock_branches') {
        loadBranchData();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('localStorageChanged', handleLocalStorageChanged);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('localStorageChanged', handleLocalStorageChanged);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shortCode, tableId, areaName, branchId, tableName]); // Removed 'branch' and 'actualTableIdentifier' to prevent infinite loop

  const addToCart = (item: MenuItemLite) => {
    const existingItem = selectedItems.find((i) => i.menuItemId === item.id);

    if (existingItem) {
      setSelectedItems(
        selectedItems.map((i) =>
          i.menuItemId === item.id ? { ...i, quantity: i.quantity + 1 } : i
        )
      );
    } else {
      setSelectedItems([
        ...selectedItems,
        {
          id: `item_${Date.now()}_${Math.random()}`,
          menuItemId: item.id,
          name: item.name,
          quantity: 1,
          totalPrice: item.price,
          price: item.price,
        },
      ]);
    }

    toast({
      title: 'Added to Cart',
      description: `${item.name} added to your order.`,
    });
  };

  const updateQuantity = (menuItemId: string, delta: number) => {
    setSelectedItems((items) =>
      items
        .map((item) =>
          item.menuItemId === menuItemId
            ? { ...item, quantity: Math.max(0, item.quantity + delta) }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const getItemQuantity = (menuItemId: string) => {
    return selectedItems.find((i) => i.menuItemId === menuItemId)?.quantity || 0;
  };

  const totalItems = selectedItems.reduce((sum, item) => sum + item.quantity, 0);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!branch) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Branch Not Found</CardTitle>
            <CardDescription>
              The branch you're looking for doesn't exist or is no longer available.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  // Selection screen - shown when no tableId and user hasn't made a choice
  if (flowState === 'selection' && !tableId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl w-full space-y-8"
        >
          {/* Logo and Header */}
          <div className="text-center space-y-4">
            {branch.logoUrl && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.5 }}
                className="flex justify-center"
              >
                <img
                  src={branch.logoUrl}
                  alt={branch.brandName || branch.name}
                  className="h-24 w-24 object-contain rounded-full shadow-lg"
                />
              </motion.div>
            )}
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="text-4xl font-bold"
            >
              Welcome to {branch.brandName || branch.name}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="text-muted-foreground text-lg"
            >
              Reserve your table to get started
            </motion.p>
          </div>

          {/* Only show "Reserve Table" button when no tableId */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <Button
              size="lg"
              variant="default"
              className="w-full h-24 text-xl font-semibold shadow-xl hover:shadow-2xl transition-all"
              onClick={() => {
                setFlowState('reservation');
                setOrderType('booking');
              }}
            >
              <div className="flex flex-col items-center gap-2">
                <Calendar className="h-8 w-8" />
                <span>Reserve Table</span>
              </div>
            </Button>
          </motion.div>

          {/* Info message */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="text-center text-sm text-muted-foreground"
          >
            <p>Please reserve a table first, then you can pre-order your menu items.</p>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  const menuCategories = [...new Set(menuItems.map((item) => item.category))];

  // Get theme configuration
  const selectedTheme = branch.selectedThemeId ? getThemeById(branch.selectedThemeId) : null;
  const themeColors = branch.themeColors || selectedTheme?.colors;

  const layout = branch.layout || 'default';
  const galleryImages = branch.galleryImages || [];
  const sliderImages = branch.sliderImages || [];

  const themeStyles = themeColors ? {
    '--page-bg': `hsl(${themeColors.pageBackground})`,
    '--hero-bg': `hsl(${themeColors.heroBackground})`,
    '--hero-text': `hsl(${themeColors.heroText})`,
    '--hero-accent': `hsl(${themeColors.heroAccent})`,
    '--card-bg': `hsl(${themeColors.cardBackground})`,
    '--card-border': `hsl(${themeColors.cardBorder})`,
    '--btn-primary': `hsl(${themeColors.buttonPrimary})`,
    '--btn-primary-text': `hsl(${themeColors.buttonPrimaryText})`,
    '--btn-secondary': `hsl(${themeColors.buttonSecondary})`,
    '--btn-secondary-text': `hsl(${themeColors.buttonSecondaryText})`,
    '--heading': `hsl(${themeColors.headingColor})`,
    '--body-text': `hsl(${themeColors.bodyTextColor})`,
  } as React.CSSProperties : {};

  const renderDefaultLayout = () => (
    <>
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="relative min-h-[500px] flex items-center justify-center overflow-hidden"
        style={{
          background: branch.bannerUrl
            ? 'transparent'
            : `linear-gradient(135deg, hsl(var(--hero-bg, 240 5% 15%)), hsl(var(--hero-accent, 43 74% 66%)) 100%)`
        }}
      >
        {/* Chỉnh độ rõ mờ của  */}
        {branch.bannerUrl && (
          <>
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: `url(${branch.bannerUrl})`,
                opacity: 1,
                filter: 'blur(2px) brightness(0.9) contrast(1.05)',
                transform: 'scale(1.05)',
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/20 backdrop-blur-[1px]" />
          </>
        )}

        <div className="relative z-10 w-full px-4 max-w-7xl mx-auto py-20 text-left">
          {branch.logoUrl && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="mb-8"
            >
              <img
                src={branch.logoUrl}
                alt={branch.brandName}
                className="h-24 w-24 sm:h-28 sm:w-28 object-contain mx-auto rounded-2xl shadow-large bg-card/80 p-4 backdrop-blur-sm"
              />
            </motion.div>
          )}
          <div className="inline-block max-w-2xl bg-black/35 dark:bg-black/45 rounded-xl p-8 md:p-10 shadow-large backdrop-blur-sm ring-1 ring-white/10">
            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="logo-text text-5xl md:text-6xl font-semibold leading-tight mb-4 text-white"
              style={{
                textShadow: 'none'
              }}
            >
              {branch.brandName}
            </motion.h1>
            <div className="h-1 w-20 rounded-full mb-4 bg-white/60" />
            {tableNumber && (
              <Badge className="mb-3 text-base px-4 py-1.5 shadow-soft">Table {tableNumber}</Badge>
            )}
            {branch.tagline && (
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.45 }}
                className="slogan text-white/90 text-base md:text-lg mb-6"
              >
                {branch.tagline}
              </motion.p>
            )}
            <div className="mt-4 flex items-center gap-3">
              <Button
                size="lg"
                className="px-6 bg-[hsl(25_85%_55%)] text-white hover:bg-[hsl(25_85%_50%)]"
                onClick={() => document.getElementById('menu-section')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Explore More
              </Button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Branch Info */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <Card
            className="mb-8 border-2"
            style={{
              backgroundColor: themeColors ? `hsl(${themeColors.cardBackground})` : undefined,
              borderColor: themeColors ? `hsl(${themeColors.cardBorder})` : undefined,
            }}
          >
            <CardHeader>
              <CardTitle
                className="text-2xl"
                style={{ color: themeColors ? `hsl(${themeColors.headingColor})` : undefined }}
              >
                {branch.name}
              </CardTitle>
              <CardDescription style={{ color: themeColors ? `hsl(${themeColors.bodyTextColor})` : undefined }}>
                Branch Information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p
                      className="text-sm font-semibold mb-1"
                      style={{ color: themeColors ? `hsl(${themeColors.headingColor})` : undefined }}
                    >
                      Address
                    </p><p
                      className="text-sm"
                      style={{ color: themeColors ? `hsl(${themeColors.bodyTextColor})` : undefined }}
                    >
                      {branch.address}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p
                      className="text-sm font-semibold mb-1"
                      style={{ color: themeColors ? `hsl(${themeColors.headingColor})` : undefined }}
                    >
                      Phone
                    </p>
                    <p
                      className="text-sm"
                      style={{ color: themeColors ? `hsl(${themeColors.bodyTextColor})` : undefined }}
                    >
                      {branch.phone}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p
                      className="text-sm font-semibold mb-1"
                      style={{ color: themeColors ? `hsl(${themeColors.headingColor})` : undefined }}
                    >
                      Email
                    </p>
                    <p
                      className="text-sm"
                      style={{ color: themeColors ? `hsl(${themeColors.bodyTextColor})` : undefined }}
                    >
                      {branch.email}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p
                      className="text-sm font-semibold mb-1"
                      style={{ color: themeColors ? `hsl(${themeColors.headingColor})` : undefined }}
                    >
                      Hours
                    </p>
                    <p
                      className="text-sm"
                      style={{ color: themeColors ? `hsl(${themeColors.bodyTextColor})` : undefined }}
                    >
                      Mon-Sun: 10am - 10pm
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Menu Section */}
        <div id="menu-section" className="space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h2
                className="text-3xl font-bold"
                style={{ color: themeColors ? `hsl(${themeColors.headingColor})` : 'inherit' }}
              >
                Our Menu
              </h2>
              <p
                className="mt-1"
                style={{ color: themeColors ? `hsl(${themeColors.bodyTextColor})` : 'inherit' }}
              >
                Browse our delicious offerings
              </p>
            </div>
          </div>

          {menuCategories.map((category, catIndex) => (
            <motion.div
              key={category}
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ delay: catIndex * 0.1, duration: 0.5 }}
              viewport={{ once: true }}
              className="space-y-4"
            >
              <div className="flex items-center gap-3">
                <h3
                  className="text-2xl font-semibold"
                  style={{ color: themeColors ? `hsl(${themeColors.headingColor})` : 'inherit' }}
                >
                  {category}
                </h3>
                <Separator className="flex-1" />
              </div>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 items-stretch">
                {menuItems
                  .filter((item) => item.category === category)
                  .map((item, itemIndex) => {
                    const itemQuantity = getItemQuantity(item.id);
                    return (
                      <motion.div
                        key={item.id}
                        initial={{ scale: 0.9, opacity: 0 }}
                        whileInView={{ scale: 1, opacity: 1 }}
                        transition={{ delay: itemIndex * 0.05, duration: 0.3 }}
                        viewport={{ once: true }}
                        className="h-full"
                      >
                        <Card
                          className="overflow-hidden hover:shadow-medium transition-smooth border-2 h-full flex flex-col"
                          style={{
                            backgroundColor: themeColors ? `hsl(${themeColors.cardBackground})` : undefined,
                            borderColor: themeColors ? `hsl(${themeColors.cardBorder})` : undefined,
                          }}
                        >
                          <div className="aspect-video bg-muted relative overflow-hidden">
                            <img
                              src={item.imageUrl}
                              alt={item.name}
                              className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                              style={{ imageRendering: 'auto' }}
                            />
                            {item.bestSeller && (
                              <Badge className="absolute top-2 right-2">
                                Best Seller
                              </Badge>
                            )}
                            {!item.available && (
                              <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                                <Badge variant="destructive">Unavailable</Badge>
                              </div>
                            )}
                          </div>
                          <CardHeader className="flex-shrink-0">
                            <CardTitle className="flex items-start justify-between">
                              <span style={{ color: themeColors ? `hsl(${themeColors.headingColor})` : 'inherit' }}>
                                {item.name}
                              </span>
                              <span style={{ color: themeColors ? `hsl(${themeColors.heroAccent})` : 'inherit' }}>
                                ${item.price}
                              </span>
                            </CardTitle>
                            <CardDescription
                              className="min-h-[2.5rem]"
                              style={{ color: themeColors ? `hsl(${themeColors.bodyTextColor})` : 'inherit' }}
                            >
                              {item.description}
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="flex-1 flex flex-col justify-end">
                            {itemQuantity > 0 ? (
                              <div className="flex items-center gap-2 w-full">
                                <Button
                                  size="icon"
                                  variant="outline"
                                  onClick={() => updateQuantity(item.id, -1)}
                                  className="h-10 w-10"
                                >
                                  <Minus className="h-4 w-4" />
                                </Button>
                                <span className="flex-1 text-center font-semibold text-lg">
                                  {itemQuantity}
                                </span>
                                <Button
                                  size="icon"
                                  onClick={() => updateQuantity(item.id, 1)}
                                  disabled={!item.available}
                                  className="h-10 w-10"
                                  style={{
                                    backgroundColor: themeColors ? `hsl(${themeColors.buttonPrimary})` : undefined,
                                    color: themeColors ? `hsl(${themeColors.buttonPrimaryText})` : undefined,
                                  }}
                                >
                                  <Plus className="h-4 w-4" />
                                </Button>
                              </div>
                            ) : (
                              <Button
                                className="w-full"
                                onClick={() => addToCart(item)}
                                disabled={!item.available}
                                style={{
                                  backgroundColor: themeColors ? `hsl(${themeColors.buttonPrimary})` : undefined,
                                  color: themeColors ? `hsl(${themeColors.buttonPrimaryText})` : undefined,
                                }}
                              >
                                <ShoppingCart className="mr-2 h-4 w-4" />
                                Add to Order
                              </Button>
                            )}
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="py-6 text-center" style={{ color: themeColors ? `hsl(${themeColors.bodyTextColor})` : 'inherit' }}>
        <p className="text-sm">© 2024 {branch.brandName}. All rights reserved.</p>
      </footer>
    </>
  );

  // Reservation screen - shown when user selects "Reserve Table"
  if (flowState === 'reservation') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background py-12 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl mx-auto"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <Button
              variant="ghost"
              className="mb-6"
              onClick={() => setFlowState('selection')}
            >
              ← Back
            </Button>
            <h2 className="text-3xl font-bold mb-2">Reserve Your Table</h2>
            <p className="text-muted-foreground">Fill in your details to complete your reservation</p>
          </div>

          {/* Reservation Form Card */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Booking Details</CardTitle>
              <CardDescription>
                Reserve a table at {branch.brandName}. We'll confirm your reservation shortly.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ReservationBookingForm
                branchId={branch.id}
                branchName={branch.brandName || branch.name}
                selectedItems={selectedItems as OrderItem[]}
                onBookingComplete={() => {
                  setFlowState('post-reservation');
                  setShowMenuAfterReservation(true);
                }}
              />
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  // Post-reservation menu offer
  if (flowState === 'post-reservation' && showMenuAfterReservation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background py-12 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl mx-auto"
        >
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">Table Reserved Successfully! 🎉</h2>
            <p className="text-muted-foreground mb-6">
              Would you like to pre-order your menu items now?
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                size="lg"
                className="flex-1"
                onClick={() => {
                  setFlowState('menu');
                  setOrderType('booking'); // Pre-order cho bàn đã đặt
                }}
              >
                Pre-Order Menu Items
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setShowMenuAfterReservation(false);
                  toast({
                    title: 'Reservation Confirmed',
                    description: 'You can order at the restaurant when you arrive.',
                  });
                }}
              >
                Order at Restaurant
              </Button>
            </div>
          </div>

          {/* Info Card */}
          <Card className="bg-muted/50 border-muted-foreground/20">
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">
                Your reservation has been confirmed. We'll send you a confirmation email shortly.
                You can pre-order items now or order when you arrive at the restaurant.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen"
      style={{
        backgroundColor: themeColors ? `hsl(${themeColors.pageBackground})` : 'hsl(0 0% 98%)',
        ...themeStyles
      }}
    >
      {/* Header with back button for menu state */}
      {flowState === 'menu' && !tableId && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b py-4 px-4"
        >
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => setFlowState('post-reservation')}
              className="flex items-center gap-2"
            >
              ← Back to Reservation
            </Button>
            <h2 className="text-lg font-semibold">{branch.brandName}</h2>
            <div className="w-12" />
          </div>
        </motion.div>
      )}

      {/* Floating Cart Button */}
      {totalItems > 0 && flowState === 'menu' && (
        <div className="fixed bottom-6 right-6 z-50 w-[400px]">
          {tableId ? (
            // Nếu có tableId (quét QR) -> chỉ cho Order Now
            <OrderDialog
              branchId={branch.id}
              branchName={branch.brandName || branch.name}
              selectedItems={selectedItems}
              onOrderComplete={() => setSelectedItems([])}
            />
          ) : (
            // Nếu không có tableId (đặt bàn trước) -> chỉ cho Pre-Order
            <BookingDialog
              branchId={branch.id}
              branchName={branch.brandName || branch.name}
              selectedItems={selectedItems as OrderItem[]}
              onBookingComplete={() => setSelectedItems([])}
            />
          )}
          <div className="absolute -top-2 -right-2 bg-primary text-primary-foreground rounded-full h-7 w-7 flex items-center justify-center text-sm font-bold shadow-lg">
            {totalItems}
          </div>
        </div>
      )}

      {/* Continuous Horizontal Slider */}
      {sliderImages.length > 0 && flowState === 'menu' && (
        <div className="overflow-hidden py-8 border-b" style={{ borderColor: themeColors ? `hsl(${themeColors.cardBorder})` : 'inherit' }}>
          <motion.div
            className="flex gap-4"
            animate={{
              x: [0, -(sliderImages.length * 320)],
            }}
            transition={{
              x: {
                repeat: Infinity,
                repeatType: "loop",
                duration: sliderImages.length * 8,
                ease: [0.42, 0, 0.58, 1],
              },
            }}
            style={{ willChange: 'transform' }}
          >
            {[...sliderImages, ...sliderImages].map((img, index) => (
              <div key={index} className="flex-shrink-0 w-72 sm:w-80 lg:w-96">
                <div className="aspect-[4/3] rounded-xl overflow-hidden shadow-medium hover:shadow-large transition-shadow">
                  <img
                    src={img}
                    alt={`Slider ${index + 1}`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      )}

      {flowState === 'menu' && renderDefaultLayout()}
    </div>
  );
};

export default GuestLanding;