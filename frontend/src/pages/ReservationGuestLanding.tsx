import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useGuestContext from '@/hooks/queries/useGuestContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShoppingCart, MapPin, Phone, Mail, Clock, Plus, Minus, Loader2, Calendar } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import GuestHero from '@/components/guest/GuestHero';
import RestaurantInfoCard from '@/components/guest/RestaurantInfoCard';
import MenuGrid from '@/components/guest/MenuGrid';
import ReservationPanel from '@/components/guest/ReservationPanel';
import { getThemeById } from '@/lib/themes';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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


const ReservationGuestLanding = () => {
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
  const [guestReservationId, setGuestReservationId] = useState<string | undefined>(undefined);

  const { tableContext, restaurant, branchMenu, derivedSlug, branchId: branchIdToUse, isLoading: contextLoading, restaurantError, menuError, queries } =
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

  const loadBranchMenu = useCallback(async (bid: string) => {
    setLoading(true);
    try {
      // Use branchMenu from useGuestContext (it already fetches menu by slug).
      let resData = branchMenu;
      if (!resData || !resData.items) {
        // try to refetch via the returned query if available
        try {
          const refetchResult = await queries?.menuQuery?.refetch();
          resData = refetchResult?.data ?? resData;
        } catch (e) {
          // ignore and fallthrough
        }
      }
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
      setMenuItems(resData?.items || []);
      setFlowState('menu');
    } catch (err) {
      toast({ title: 'Unable to load menu', description: 'Please try again later.' });
    } finally {
      setLoading(false);
    }
  }, [derivedSlug, restaurant, branchMenu, queries]);


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

  // If there's a restaurant error (status=false, no active branches, etc), show error message
  if (restaurantError || menuError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Restaurant Unavailable</CardTitle>
            <CardDescription>
              This restaurant is currently not accepting reservations. Please try again later.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="outline"
              onClick={() => navigate('/')}
              className="w-full"
            >
              Back to Home
            </Button>
          </CardContent>
        </Card>
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
          <CardContent>
            <Button
              variant="outline"
              onClick={() => navigate('/')}
              className="w-full"
            >
              Back to Home
            </Button>
          </CardContent>
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
      <GuestHero restaurant={restaurant} tableNumber={tableNumber} themeColors={themeColors} onExplore={() => document.getElementById('menu-section')?.scrollIntoView({ behavior: 'smooth' })} />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.6, duration: 0.5 }}>
          <RestaurantInfoCard restaurant={restaurant} />
        </motion.div>

        <MenuGrid menuItems={menuItems} menuCategories={menuCategories} />
      </div>
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

          {/* Reservation Form Panel */}
          <ReservationPanel
            displayBranch={displayBranch}
            branches={branches}
            onBookingComplete={(reservationId?: string) => {
              if (reservationId) setGuestReservationId(reservationId);
              setFlowState('post-reservation');
            }}
          />
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

export default ReservationGuestLanding;

