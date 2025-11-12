import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

interface Props { menuItems: any[]; menuCategories: string[] }

export default function MenuGrid({ menuItems, menuCategories }: Props) {
  return (
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
              .map((item, itemIndex) => (
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
                      <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover transition-transform duration-300 hover:scale-105" />
                      {item.bestSeller && (
                        <Badge className="absolute top-2 right-2">Best Seller</Badge>
                      )}
                    </div>
                    <CardHeader className="flex-shrink-0">
                      <CardTitle className="flex items-start justify-between">
                        <span>{item.name}</span>
                        <span>${item.price}</span>
                      </CardTitle>
                      <CardDescription className="min-h-[2.5rem]">{item.description}</CardDescription>
                    </CardHeader>
                  </Card>
                </motion.div>
              ))}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
