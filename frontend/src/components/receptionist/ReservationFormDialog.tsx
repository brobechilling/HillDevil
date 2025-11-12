import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar, Clock, Users } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useCreateReservationReceptionist } from '@/hooks/queries/useReservations';

const bookingSchema = z.object({
  guestName: z.string().min(2, 'Name must be at least 2 characters'),
  guestEmail: z.string().email('Valid email required'),
  guestPhone: z.string().min(10, 'Valid phone number required'),
  bookingDate: z.string().min(1, 'Date is required'),
  bookingTime: z.string().min(1, 'Time is required'),
  numberOfGuests: z.coerce.number().min(1, 'At least 1 guest required').max(20, 'Maximum 20 guests'),
});

const bookingSchemaValidated = bookingSchema.superRefine((data, ctx) => {
  if (!data.bookingDate || !data.bookingTime) return;
  const dt = new Date(`${data.bookingDate}T${data.bookingTime}:00`);
  if (isNaN(dt.getTime()) || dt.getTime() <= Date.now()) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['bookingDate'], message: 'Reservation date/time must be in the future' });
  }
});

type BookingFormData = z.infer<typeof bookingSchema>;

interface ReservationFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  branchId: string;
  branchName: string;
}

export function ReservationFormDialog({ open, onOpenChange, branchId, branchName }: ReservationFormDialogProps) {
  const createMutation = useCreateReservationReceptionist();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchemaValidated),
  });

  const onSubmit = (data: BookingFormData) => {
    const startTime = `${data.bookingDate}T${data.bookingTime}:00`;
    const payload = {
      branchId,
      areaTableId: null,
      startTime,
      customerName: data.guestName,
      customerPhone: data.guestPhone,
      customerEmail: data.guestEmail,
      guestNumber: data.numberOfGuests,
      note: undefined,
    } as any;

    (async () => {
      try {
        await createMutation.mutateAsync(payload);
        toast({
          title: 'Reservation Created',
          description: 'The reservation has been created and is pending approval.',
        });
        onOpenChange(false);
        reset();
      } catch (err: any) {
        console.error('Create reservation failed', err);
        toast({ title: 'Reservation Failed', description: err?.response?.data?.message || 'Please try again later.' });
      }
    })();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Reservation</DialogTitle>
          <DialogDescription>
            Create a reservation for a customer at {branchName}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 mt-4">
          <div className="space-y-2">
            <Label htmlFor="guestName">Customer Name *</Label>
            <Input
              {...register('guestName')}
              id="guestName"
              placeholder="John Doe"
              className="h-11"
            />
            {errors.guestName && <p className="text-sm text-destructive">{errors.guestName.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="guestEmail">Email *</Label>
              <Input
                {...register('guestEmail')}
                id="guestEmail"
                type="email"
                placeholder="john@example.com"
                className="h-11"
              />
              {errors.guestEmail && <p className="text-sm text-destructive">{errors.guestEmail.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="guestPhone">Phone *</Label>
              <Input
                {...register('guestPhone')}
                id="guestPhone"
                type="tel"
                placeholder="+1 555-0123"
                className="h-11"
              />
              {errors.guestPhone && <p className="text-sm text-destructive">{errors.guestPhone.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="bookingDate" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Date *
              </Label>
              <Input
                {...register('bookingDate')}
                id="bookingDate"
                type="date"
                min={new Date().toISOString().split('T')[0]}
                className="h-11"
              />
              {errors.bookingDate && <p className="text-sm text-destructive">{errors.bookingDate.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="bookingTime" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Time *
              </Label>
              <Input
                {...register('bookingTime')}
                id="bookingTime"
                type="time"
                className="h-11"
              />
              {errors.bookingTime && <p className="text-sm text-destructive">{errors.bookingTime.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="numberOfGuests" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Number of Guests *
            </Label>
            <Input
              {...register('numberOfGuests')}
              id="numberOfGuests"
              type="number"
              min="1"
              max="20"
              defaultValue="2"
              className="h-11"
            />
            {errors.numberOfGuests && <p className="text-sm text-destructive">{errors.numberOfGuests.message}</p>}
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              Create Reservation
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
