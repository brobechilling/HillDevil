import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ReservationBookingForm } from '@/components/ReservationBookingForm';

interface Props {
  displayBranch: any;
  branches: any[];
  onBookingComplete?: (reservationId?: string) => void;
}

export default function ReservationPanel({ displayBranch, branches, onBookingComplete }: Props) {
  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle>Booking Details</CardTitle>
        <CardDescription>
          Reserve a table at {displayBranch.brandName}. We'll confirm your reservation shortly.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ReservationBookingForm
          branchId={displayBranch.id}
          branchName={displayBranch.brandName || displayBranch.name}
          branches={branches}
          displayBranch={displayBranch}
          onBookingComplete={onBookingComplete}
        />
      </CardContent>
    </Card>
  );
}
