import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useGuestContext from '@/hooks/queries/useGuestContext';
import { publicApi } from '@/api/publicApi';
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
import { BookingItem } from '@/store/bookingStore';
import { ArrowLeft, ArrowRight, Store } from 'lucide-react';

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
  openingTime?: string;
  closingTime?: string;
};

const GuestLanding = () => {
  const navigate = useNavigate();
  const params = useParams<{ shortCode?: string; restaurantSlug?: string; tableId?: string; branchId?: string }>();
  const shortCode = params.shortCode || params.restaurantSlug;
  const routeBranchId = params.branchId;
  const tableId = params.tableId;
  const [branch, setBranch] = useState<BranchLite | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItemLite[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState<OrderItem[]>([]);
  const [orderType, setOrderType] = useState<'now' | 'booking'>('now');
  const [tableNumber, setTableNumber] = useState<string>('');
  const [flowState, setFlowState] = useState<'selection' | 'menu' | 'reservation' | 'post-reservation'>('selection');
  const [showMenuAfterReservation, setShowMenuAfterReservation] = useState(false);

  const { tableContext, restaurant, branchMenu, derivedSlug, branchId: branchIdToUse, isLoading: contextLoading } =
    useGuestContext({ slug: shortCode, branchId: routeBranchId });
  // Precompute theme values early so selection UI can use them
  const selectedTheme = branch?.selectedThemeId ? getThemeById(branch.selectedThemeId) : null;
  const restaurantSelectedTheme = (restaurant as any)?.selectedThemeId ? getThemeById((restaurant as any).selectedThemeId) : null;
  const themeColors = branch?.themeColors || selectedTheme?.colors || (restaurant as any)?.themeColors || restaurantSelectedTheme?.colors;

  const branches = (restaurant as any)?.branches || [];

  useEffect(() => {
    setLoading(contextLoading);
  }, [contextLoading]);

  // Sync fetched data to local component state (UI-focused)
  useEffect(() => {
    if (restaurant) {
      const rest = restaurant as any;
      // Do not auto-select a branch. Only pre-select when branchIdToUse (route param) is present.
      const branchInfo = rest.branches?.find((b: any) => b.branchId === branchIdToUse);
      if (branchIdToUse && branchInfo) {
        setBranch({
          id: branchInfo.branchId,
          address: branchInfo.address,
          phone: branchInfo.phone,
          email: branchInfo.email,
          name: rest.name,
          brandName: rest.name,
          logoUrl: branchInfo.logoUrl,
          bannerUrl: branchInfo.bannerUrl,
          tagline: branchInfo.tagline,
          themeColors: branchInfo.themeColors,
          selectedThemeId: branchInfo.selectedThemeId,
          layout: branchInfo.layout,
          galleryImages: branchInfo.galleryImages,
          sliderImages: branchInfo.sliderImages,
          openingTime: branchInfo.openingTime,
          closingTime: branchInfo.closingTime,
        });
      }
    }

    if (tableContext) {
      const tc = tableContext as any;
      if (tc.tableId) {
        setTableNumber(tc.tableTag || '');
      }
    }

    if (branchMenu) {
      setMenuItems(branchMenu.items || []);
      setFlowState('menu');
    }
  }, [restaurant, branchMenu, derivedSlug, branchIdToUse, tableContext]);

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
    setSelectedItems((prev) =>
      prev
        .map((p) => (p.menuItemId === menuItemId ? { ...p, quantity: Math.max(0, p.quantity + delta) } : p))
        .filter((p) => p.quantity > 0)
    );
  };

  const getItemQuantity = (menuItemId: string) => {
    return selectedItems.find((i) => i.menuItemId === menuItemId)?.quantity || 0;
  };

  const loadBranchMenu = async (bid: string) => {
    setLoading(true);
    try {
      const res = await publicApi.getBranchMenu(bid);
      const bdata = (restaurant as any)?.branches?.find((x: any) => x.branchId === bid) || {};
      setBranch({
        id: bid,
        address: bdata.address,
        phone: bdata.phone,
        email: bdata.email,
        name: (restaurant as any).name,
        brandName: (restaurant as any).name,
        logoUrl: bdata.logoUrl,
        bannerUrl: bdata.bannerUrl,
        tagline: bdata.tagline,
        themeColors: bdata.themeColors,
        selectedThemeId: bdata.selectedThemeId,
        layout: bdata.layout,
        galleryImages: bdata.galleryImages,
        sliderImages: bdata.sliderImages,
        openingTime: bdata.openingTime,
        closingTime: bdata.closingTime,
      });
      setMenuItems(res?.items || []);
      setFlowState('menu');
      navigate(`/${derivedSlug}/branch/${bid}`, { replace: true });
    } catch (err) {
      toast({ title: 'Unable to load menu', description: 'Please try again later.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!contextLoading && !branch && branches.length === 1) {
      loadBranchMenu(branches[0].branchId);
    }
  }, [contextLoading, branch, branches, loadBranchMenu, derivedSlug, navigate]);

  const totalItems = selectedItems.reduce((sum, item) => sum + item.quantity, 0);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  // If there's no restaurant data at all, show not found.
  if (!restaurant) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Restaurant Not Found</CardTitle>
            <CardDescription>
              The restaurant you're looking for doesn't exist or is no longer available.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  // selection UI removed — selection control will be rendered inline on the page

  const menuCategories = [...new Set(menuItems.map((item) => item.category))];

  // Get theme configuration (moved up above selection UI)
  // (already computed earlier near the top of the component)

  const displayBranch = branch || (restaurant as any) || {};
  const layout = displayBranch.layout || 'default';
  const galleryImages = displayBranch.galleryImages || [];
  const sliderImages = displayBranch.sliderImages || [];

  // Theme styling is handled globally via the theme provider / Tailwind classes.

  const renderDefaultLayout = () => (
    <>
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className={`relative min-h-[500px] flex items-center justify-center overflow-hidden ${displayBranch.bannerUrl ? '' : 'bg-gradient-to-br from-slate-800 via-slate-700 to-amber-500'}`}
      >
        {/* Chỉnh độ rõ mờ của  */}
        {displayBranch.bannerUrl && (
          <>
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: `url(${displayBranch.bannerUrl})`,
                opacity: 1,
                filter: 'blur(2px) brightness(0.9) contrast(1.05)',
                transform: 'scale(1.05)',
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/20 backdrop-blur-[1px]" />
          </>
        )}

        <div className="relative z-10 w-full px-4 max-w-7xl mx-auto py-20 text-left">
          {displayBranch.logoUrl && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="mb-8"
            >
              <img
                src={displayBranch.logoUrl}
                alt={displayBranch.brandName}
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
            >
              {displayBranch.brandName}
            </motion.h1>
            <div className="h-1 w-20 rounded-full mb-4 bg-white/60" />
            {tableNumber && (
              <Badge className="mb-3 text-base px-4 py-1.5 shadow-soft">Table {tableNumber}</Badge>
            )}
            {displayBranch.tagline && (
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.45 }}
                className="slogan text-white/90 text-base md:text-lg mb-6"
              >
                {displayBranch.tagline}
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
          <Card className="mb-8 border-2">
            <CardHeader>
              <CardTitle className="text-2xl">{displayBranch.name}</CardTitle>
              <CardDescription>Branch Information</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold mb-1">
                      Address
                    </p><p
                      className="text-sm"
                    >
                      {displayBranch.address}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold mb-1">
                      Phone
                    </p>
                    <p className="text-sm">
                      {displayBranch.phone}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold mb-1">
                      Email
                    </p>
                    <p className="text-sm">
                      {displayBranch.email}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold mb-1">
                      Hours
                    </p>
                    <p className="text-sm">
                      {displayBranch.openingTime && displayBranch.closingTime ? `${displayBranch.openingTime.slice(0, 5)} - ${displayBranch.closingTime.slice(0, 5)}` : 'Mon-Sun: 10am - 10pm'}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Inline branch selector removed — branch selection is handled on the selection screen (dropdown) */}

        {/* Menu Section */}
        <div id="menu-section" className="space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold">Our Menu</h2>
              <p className="mt-1 text-muted-foreground">Browse our delicious offerings</p>
            </div>
            <div className="flex items-center gap-3">

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
                <h3 className="text-2xl font-semibold">
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
                        <Card className="overflow-hidden hover:shadow-medium transition-smooth border-2 h-full flex flex-col">
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
                              <span>
                                {item.name}
                              </span>
                              <span>
                                ${item.price}
                              </span>
                            </CardTitle>
                            <CardDescription className="min-h-[2.5rem]">
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
                                  className="h-10 w-10 bg-primary text-primary-foreground"
                                >
                                  <Plus className="h-4 w-4" />
                                </Button>
                              </div>
                            ) : (
                              <Button
                                className="w-full bg-primary text-primary-foreground"
                                onClick={() => addToCart(item)}
                                disabled={!item.available}
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
        <p className="text-sm">© 2024 {displayBranch.brandName}. All rights reserved.</p>
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
              onClick={() => setFlowState('menu')}
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
                Reserve a table at {displayBranch.brandName}. We'll confirm your reservation shortly.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ReservationBookingForm
                branchId={displayBranch.id}
                branchName={displayBranch.brandName || displayBranch.name}
                selectedItems={selectedItems as BookingItem[]}
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

  if (flowState === 'selection') {
    return (
      <div className="min-h-screen bg-muted/30 py-12 px-4">
        <div className="container max-w-5xl">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Select Branch</h1>
            <p className="text-lg text-muted-foreground">
              Choose which branch you want to visit
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {branches.map((b: any) => (
              <Card
                key={b.branchId}
                className="cursor-pointer transition-smooth hover:shadow-medium hover:border-primary border-border/50"
                onClick={() => loadBranchMenu(b.branchId)}
              >
                <CardHeader>
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-lg bg-primary/10">
                      <Store className="h-8 w-8 text-primary" />
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-500`}>
                      Active
                    </span>
                  </div>
                  <CardTitle className="text-2xl">{b.name || b.address || `Branch ${b.branchId}`}</CardTitle>
                  {b.tagline && <CardDescription className="text-base">{b.tagline}</CardDescription>}
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 mb-6">
                    {b.address && (
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>{b.address}</span>
                      </div>
                    )}
                    {b.phone && (
                      <p className="text-sm text-muted-foreground">
                        {b.phone}
                      </p>
                    )}
                  </div>
                  <Button className="w-full" variant="outline">
                    View Menu
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header (no back button) */}
      {flowState === 'menu' && !tableId && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b py-4 px-4"
        >
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <Button variant="ghost" onClick={() => setFlowState('selection')}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Branches
            </Button>
            <h2 className="text-lg font-semibold">{displayBranch.brandName}</h2>
            <div className="w-[140px]" /> {/* Placeholder for balance */}
          </div>
        </motion.div>
      )}

      {/* Floating Cart Button */}
      {totalItems > 0 && flowState === 'menu' && (
        <div className="fixed bottom-6 right-6 z-50 w-[400px]">
          {tableId ? (
            // Nếu có tableId (quét QR) -> chỉ cho Order Now
            <OrderDialog
              branchId={displayBranch.id}
              branchName={displayBranch.brandName || displayBranch.name}
              selectedItems={selectedItems}
              tableNumber={tableId}
              onOrderComplete={() => setSelectedItems([])}
            />
          ) : (
            // Nếu không có tableId (đặt bàn trước) -> chỉ cho Pre-Order
            <BookingDialog
              branchId={displayBranch.id}
              branchName={displayBranch.brandName || displayBranch.name}
              selectedItems={selectedItems as BookingItem[]}
              onBookingComplete={() => setSelectedItems([])}
            />
          )}
          <div className="absolute -top-2 -right-2 bg-primary text-primary-foreground rounded-full h-7 w-7 flex items-center justify-center text-sm font-bold shadow-lg">
            {totalItems}
          </div>
        </div>
      )}

      {/* Floating Reserve Button */}
      {flowState === 'menu' && (
        <div className="fixed bottom-6 right-6 z-40">
          <Button
            size="lg"
            className="px-8 shadow-lg"
            variant="default"
            onClick={() => {
              setFlowState('reservation');
              setOrderType('booking');
            }}
          >
            Reserve Table
          </Button>
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

