import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Calendar, Clock, Users, Mail, Phone } from 'lucide-react';
import { Reservation } from '@/store/reservationStore';

interface ReservationCarouselProps {
  reservations: Reservation[];
}

export const ReservationCarousel = ({ reservations }: ReservationCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (reservations.length === 0) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        No reservations for this table
      </div>
    );
  }

  const currentReservation = reservations[currentIndex];

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : reservations.length - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < reservations.length - 1 ? prev + 1 : 0));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'default';
      case 'cancelled':
        return 'destructive';
      case 'completed':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            size="icon"
            variant="outline"
            onClick={handlePrevious}
            disabled={reservations.length <= 1}
            className="h-8 w-8"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium">
            {currentIndex + 1} / {reservations.length}
          </span>
          <Button
            size="icon"
            variant="outline"
            onClick={handleNext}
            disabled={reservations.length <= 1}
            className="h-8 w-8"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <Badge variant={getStatusColor(currentReservation.status)}>
          {currentReservation.status}
        </Badge>
      </div>

      <div className="space-y-3 p-4 border rounded-lg bg-muted/30">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-muted-foreground" />
          <span className="font-semibold">{currentReservation.guestName}</span>
        </div>

        <div className="grid gap-2 text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>{new Date(currentReservation.reservationStart).toLocaleDateString()}</span>
          </div>

          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>
              {new Date(currentReservation.reservationStart).toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit' 
              })} - {new Date(currentReservation.reservationEnd).toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span>{currentReservation.numberOfGuests} guests</span>
          </div>

          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span>{currentReservation.guestEmail}</span>
          </div>

          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <span>{currentReservation.guestPhone}</span>
          </div>

          {currentReservation.notes && (
            <div className="pt-2 border-t">
              <p className="text-sm text-muted-foreground">
                <span className="font-semibold">Notes:</span> {currentReservation.notes}
              </p>
            </div>
          )}
        </div>
      </div>

      {reservations.length > 1 && (
        <div className="flex gap-1 justify-center">
          {reservations.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`h-2 rounded-full transition-all ${
                idx === currentIndex ? 'w-8 bg-primary' : 'w-2 bg-muted-foreground/30'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};
