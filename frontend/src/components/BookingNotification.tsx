import { Bell, Check, X } from 'lucide-react';
import { useBookingStore } from '@/store/bookingStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { useState } from 'react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface BookingNotificationProps {
  branchId?: string;
}

export const BookingNotification = ({ branchId }: BookingNotificationProps) => {
  const { getPendingBookings, approveBooking, declineBooking } = useBookingStore();
  const [selectedBooking, setSelectedBooking] = useState<string | null>(null);
  const [paymentLink, setPaymentLink] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const pendingBookings = getPendingBookings(branchId);
  const unreadCount = pendingBookings.length;

  const handleApprove = (bookingId: string) => {
    setSelectedBooking(bookingId);
    setPaymentLink('');
    setIsDialogOpen(true);
  };

  const handleConfirmApproval = () => {
    if (!selectedBooking || !paymentLink) {
      toast({
        variant: 'destructive',
        title: 'Payment Link Required',
        description: 'Please enter a payment link to approve the booking.',
      });
      return;
    }
    
    approveBooking(selectedBooking, paymentLink);
    toast({
      title: 'Booking Approved',
      description: 'Payment link has been sent to the customer.',
    });
    setIsDialogOpen(false);
    setSelectedBooking(null);
    setPaymentLink('');
  };

  const handleDecline = (bookingId: string) => {
    declineBooking(bookingId);
    toast({
      title: 'Booking Declined',
      description: 'The customer has been notified.',
    });
  };

  return (
    <div className="relative">
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-96 p-0" align="end">
          <Card className="border-0 shadow-none">
            <CardHeader>
              <CardTitle>Pending Pre-Orders</CardTitle>
              <CardDescription>
                {unreadCount > 0 ? `${unreadCount} pending approval${unreadCount > 1 ? 's' : ''}` : 'No pending pre-orders'}
              </CardDescription>
            </CardHeader>
            <CardContent className="max-h-[400px] overflow-y-auto space-y-3">
              {pendingBookings.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No pending pre-orders
                </p>
              ) : (
                pendingBookings.map((booking) => (
                  <Card key={booking.id} className="border-border/50">
                    <CardContent className="p-4 space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium">{booking.guestName}</p>
                          <p className="text-sm text-muted-foreground">{booking.guestEmail}</p>
                          <p className="text-sm text-muted-foreground">{booking.guestPhone}</p>
                        </div>
                        <Badge variant="default">Pending</Badge>
                      </div>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p>📅 {booking.bookingDate} at {booking.bookingTime}</p>
                        <p>👥 {booking.numberOfGuests} guests</p>
                        {booking.items.length > 0 && (
                          <div className="mt-2">
                            <p className="font-medium text-foreground">Pre-ordered Items:</p>
                            {booking.items.map((item, idx) => (
                              <p key={idx}>• {item.name} x{item.quantity} (${item.price})</p>
                            ))}
                            <p className="font-medium mt-1">
                              Total: ${booking.items.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2)}
                            </p>
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2 pt-2">
                        <Button
                          size="sm"
                          onClick={() => handleApprove(booking.id)}
                          className="flex-1"
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDecline(booking.id)}
                          className="flex-1"
                        >
                          <X className="h-4 w-4 mr-1" />
                          Decline
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </CardContent>
          </Card>
        </PopoverContent>
      </Popover>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Pre-Order</DialogTitle>
            <DialogDescription>
              Enter a payment link to send to the customer. They will receive this link via email.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="payment-link">Payment Link</Label>
              <Input
                id="payment-link"
                placeholder="https://payment.example.com/..."
                value={paymentLink}
                onChange={(e) => setPaymentLink(e.target.value)}
              />
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirmApproval}>
              Send Payment Link
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BookingNotification;
