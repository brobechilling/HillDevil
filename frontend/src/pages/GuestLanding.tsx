import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getBranchById } from '@/api/branchApi';
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
import { useBranch } from '@/hooks/queries/useBranches';
import { useGuestBranchMenuItems } from '@/hooks/queries/useBranchMenuItems';

type GuestLandingParams = {
  branchId: string;
  tableId: string;
};


const GuestLanding = () => {
  const { branchId, tableId } = useParams<GuestLandingParams>();
  const { data: branch, isLoading: isBranchLoading } = useBranch(branchId);
  const { data: branchMenuItems, isLoading: isMenuItemsLoading } = useGuestBranchMenuItems(branchId);
  
  return (
    <div>

    </div>
  )
};

export default GuestLanding;