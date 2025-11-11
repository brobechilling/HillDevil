import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { Phone } from 'lucide-react';

interface Props {
  restaurant: any;
  tableNumber?: string;
  themeColors?: any;
  onExplore?: () => void;
}

export default function GuestHero({ restaurant, tableNumber, themeColors, onExplore }: Props) {
  return (
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
              onClick={onExplore}
            >
              Explore More
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
