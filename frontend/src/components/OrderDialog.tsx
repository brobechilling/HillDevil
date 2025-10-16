import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ShoppingCart } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useOrderStore, OrderItem } from '@/store/orderStore';

const orderSchema = z.object({
  guestName: z.string().min(2, 'Name must be at least 2 characters').max(100),
  guestPhone: z.string().min(10, 'Please enter a valid phone number').max(20),
  notes: z.string().max(500).optional(),
});

type OrderFormData = z.infer<typeof orderSchema>;

interface OrderDialogProps {
  branchId: string;
  branchName: string;
  selectedItems: OrderItem[];
  onOrderComplete: () => void;
}

export function OrderDialog({ branchId, branchName, selectedItems, onOrderComplete }: OrderDialogProps) {
  const [open, setOpen] = useState(false);
  const addOrder = useOrderStore((state) => state.addOrder);

  const form = useForm<OrderFormData>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      guestName: '',
      guestPhone: '',
      notes: '',
    },
  });

  const total = selectedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const onSubmit = (data: OrderFormData) => {
    const lineTotal = selectedItems.reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0);
    
    addOrder({
      areaTableId: branchId, // Using branchId as placeholder
      status: 'pending',
      orderLines: [{
        id: '', // Will be generated
        orderLineStatus: 'pending',
        items: selectedItems,
        total: lineTotal,
        createdAt: '', // Will be generated
        notes: data.notes,
      }],
    });

    toast({
      title: 'Order Placed Successfully! 🎉',
      description: 'Your order has been sent to the kitchen. We\'ll prepare it shortly!',
    });

    form.reset();
    setOpen(false);
    onOrderComplete();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg" className="rounded-full shadow-elegant h-14 px-8">
          <ShoppingCart className="mr-2 h-5 w-5" />
          View Cart ({selectedItems.length} items)
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Place Your Order</DialogTitle>
          <DialogDescription>Fill in your details to complete the order</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mb-6">
          <h4 className="font-semibold">Order Summary</h4>
          <div className="space-y-2">
            {selectedItems.map((item) => (
              <div key={item.menuItemId} className="flex justify-between text-sm">
                <span>
                  {item.name} x{item.quantity}
                </span>
                <span className="font-medium">${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-between font-bold text-lg pt-2 border-t">
            <span>Total</span>
            <span className="text-primary">${total.toFixed(2)}</span>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="guestName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="guestPhone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number *</FormLabel>
                  <FormControl>
                    <Input placeholder="+1 234 567 8900" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Special Instructions (Optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Any special requests or dietary restrictions..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setOpen(false)} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" className="flex-1">
                Place Order
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
