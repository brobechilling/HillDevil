import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useGuestContext from '@/hooks/queries/useGuestContext';
import { publicApi } from '@/api/publicApi';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShoppingCart, MapPin, Phone, Mail, Clock, Plus, Minus, Loader2, Calendar } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { ReservationBookingForm } from '@/components/ReservationBookingForm';
import { motion } from 'framer-motion';
import { getThemeById } from '@/lib/themes';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  address?: string;
  phone?: string;
  email?: string;
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
  const [tableNumber, setTableNumber] = useState<string>('');
  const [flowState, setFlowState] = useState<'menu' | 'reservation' | 'post-reservation'>('menu');

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

  const loadBranchMenu = async (bid: string) => {
    setLoading(true);
    try {
      // Lấy menu từ slug thay vì branchId
      const res = await publicApi.getRestaurantMenuBySlug(derivedSlug!);
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
        className={`relative min-h-[500px] flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-800 via-slate-700 to-amber-500`}
      >
        <div className="relative z-10 w-full px-4 max-w-7xl mx-auto py-20 text-left">
          <div className="inline-block max-w-2xl bg-black/35 dark:bg-black/45 rounded-xl p-8 md:p-10 shadow-large backdrop-blur-sm ring-1 ring-white/10">
            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="logo-text text-5xl md:text-6xl font-semibold leading-tight mb-4 text-white"
            >
              {restaurant.name || 'Restaurant'}
            </motion.h1>
            <div className="h-1 w-20 rounded-full mb-4 bg-white/60" />

            {restaurant.description && (
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.45 }}
                className="slogan text-white/90 text-base md:text-lg mb-6"
              >
                {restaurant.description}
              </motion.p>
            )}

            {restaurant.phone && (
              <p className="text-white/90 text-lg mb-4 flex items-center gap-2">
                <Phone className="h-5 w-5" /> {restaurant.phone}
              </p>
            )}

            {tableNumber && (
              <Badge className="mb-3 text-base px-4 py-1.5 shadow-soft">Table {tableNumber}</Badge>
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

      {/* Restaurant Info */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <Card className="mb-8 border-2 shadow-sm bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-foreground">
                {restaurant.name}
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Restaurant Information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold mb-1">Phone</p>
                    <p className="text-sm">{restaurant.phone || '—'}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold mb-1">Email</p>
                    <p className="text-sm">{restaurant.email || '—'}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Store className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold mb-1">Description</p>
                    <p className="text-sm">{restaurant.description || '—'}</p>
                  </div>
                </div>
              </div>
            </CardContent>

          </Card>
        </motion.div>

        {/* Menu Section giữ nguyên */}
        <div id="menu-section" className="space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold">Our Menu</h2>
              <p className="mt-1 text-muted-foreground">Browse our delicious offerings</p>
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
                <h3 className="text-2xl font-semibold">{category}</h3>
                <Separator className="flex-1" />
              </div>

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 items-stretch">
                {menuItems
                  .filter((item) => item.category === category)
                  .map((item, itemIndex) => {
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
                            />
                            {item.bestSeller && (
                              <Badge className="absolute top-2 right-2">Best Seller</Badge>
                            )}
                          </div>
                          <CardHeader className="flex-shrink-0">
                            <CardTitle className="flex items-start justify-between">
                              <span>{item.name}</span>
                              <span>${item.price}</span>
                            </CardTitle>
                            <CardDescription className="min-h-[2.5rem]">
                              {item.description}
                            </CardDescription>
                          </CardHeader>
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
      <footer className="py-6 text-center">
        <p className="text-sm text-muted-foreground">
          © 2024 {restaurant.name}. All rights reserved.
        </p>
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
                onBookingComplete={() => {
                  setFlowState('post-reservation');
                }}
              />
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  // Post-reservation menu offer
  if (flowState === 'post-reservation') {
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
                }}
              >
                Pre-Order Menu Items
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="flex-1"
                onClick={() => {
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
    <div className="min-h-screen bg-background">
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
      {flowState === 'menu' && (
        <Button
          size="lg"
          className="fixed bottom-6 right-6 z-50 bg-primary text-white shadow-lg hover:bg-primary/90"
          onClick={() => setFlowState('reservation')}
        >
          Reserve Table
        </Button>
      )}
    </div>
  );
};

export default GuestLanding;

