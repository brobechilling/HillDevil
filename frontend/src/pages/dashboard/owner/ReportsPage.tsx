import { useNavigate } from 'react-router-dom';
import { ReportsAnalytics } from '@/components/owner/ReportsAnalytics';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from '@/hooks/use-toast';

const OwnerReportsPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  
  // Get selected restaurant from localStorage
  const selectedRestaurantRaw = localStorage.getItem('selected_restaurant');
  const selectedRestaurant = selectedRestaurantRaw ? JSON.parse(selectedRestaurantRaw) : null;

  useEffect(() => {
    // Check if restaurant is selected
    if (!selectedRestaurant) {
      toast({
        variant: 'destructive',
        title: 'No restaurant selected',
        description: 'Please select a restaurant first.',
      });
      navigate('/dashboard/owner');
      return;
    }

    setLoading(false);
  }, [navigate, selectedRestaurant]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!selectedRestaurant) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      <ReportsAnalytics restaurantId={String(selectedRestaurant.restaurantId)} />
    </motion.div>
  );
};

export default OwnerReportsPage;
