import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import type { Booking } from '@/store/bookingStore';
import { useCancelReservation } from '@/hooks/queries/usePendingReservations';
import { toast } from '@/hooks/use-toast';
import { Phone, Mail, MessageSquare } from 'lucide-react';

interface CustomerContactDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  booking: Booking;
  onCreateNewReservation: () => void;
}

export function CustomerContactDialog({
  open,
  onOpenChange,
  booking,
  onCreateNewReservation,
}: CustomerContactDialogProps) {
  const [notes, setNotes] = useState('');
  const [customerResponse, setCustomerResponse] = useState<'agree' | 'cancel' | null>(null);
  const cancelMutation = useCancelReservation();

  const handleCallCustomer = () => {
    toast({
      title: 'Calling Customer',
      description: `Initiating call to ${booking.guestPhone}`,
    });
  };

  const handleEmailCustomer = () => {
    toast({
      title: 'Email Sent',
      description: `Email sent to ${booking.guestEmail}`,
    });
  };

  const handleCustomerAgrees = () => {
    setCustomerResponse('agree');
    toast({
      title: 'Customer Agreed',
      description: 'Customer agrees to modify the reservation.',
    });
    onOpenChange(false);
    onCreateNewReservation();
  };

  const handleCustomerDeclines = () => {
    (async () => {
      try {
        await cancelMutation.mutateAsync(booking.id as string);
        toast({
          title: 'Reservation Cancelled',
          description: 'The reservation has been marked as cancelled.',
          variant: 'destructive',
        });
        onOpenChange(false);
      } catch (err: any) {
        console.error('Cancel reservation failed', err);
        toast({ title: 'Cancel Failed', description: err?.response?.data?.message || 'Please try again later.' });
      }
    })();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Contact Customer</DialogTitle>
          <DialogDescription>
            No tables available for this reservation. Contact the customer to reschedule.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div className="p-4 bg-muted rounded-lg space-y-2">
            <div className="font-semibold">{booking.guestName}</div>
            <div className="flex items-center gap-2 text-sm">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span>{booking.guestPhone}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span>{booking.guestEmail}</span>
            </div>
            <div className="text-sm text-muted-foreground">
              {booking.bookingDate} at {booking.bookingTime} • {booking.numberOfGuests} guests
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={handleCallCustomer} className="flex-1">
              <Phone className="mr-2 h-4 w-4" />
              Call
            </Button>
            <Button variant="outline" onClick={handleEmailCustomer} className="flex-1">
              <Mail className="mr-2 h-4 w-4" />
              Email
            </Button>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Contact Notes</Label>
            <Textarea
              id="notes"
              placeholder="Add notes about the conversation..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          <div className="border-t pt-4 space-y-3">
            <p className="text-sm font-medium">Customer Response:</p>
            <div className="flex flex-col gap-2">
              <Button onClick={handleCustomerAgrees} className="w-full">
                Customer Agrees to Change
              </Button>
              <Button
                variant="destructive"
                onClick={handleCustomerDeclines}
                className="w-full"
              >
                Customer Cancels
              </Button>
            </div>
          </div>

          <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
