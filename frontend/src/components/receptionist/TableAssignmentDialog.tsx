import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useTableStore } from '@/store/tableStore';
import { useBookingStore } from '@/store/bookingStore';
import { toast } from '@/hooks/use-toast';
import { Users, Check } from 'lucide-react';

interface TableAssignmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bookingId: string;
  branchId: string;
  numberOfGuests: number;
  onNoTablesAvailable: () => void;
}

export function TableAssignmentDialog({
  open,
  onOpenChange,
  bookingId,
  branchId,
  numberOfGuests,
  onNoTablesAvailable,
}: TableAssignmentDialogProps) {
  const { tables, updateTableStatus } = useTableStore();
  const { confirmBooking } = useBookingStore();
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);

  const availableTables = tables.filter(
    (t) => t.branchId === branchId && t.status === 'available' && t.capacity >= numberOfGuests
  );

  const handleAssignTable = () => {
    if (!selectedTableId) return;

    updateTableStatus(selectedTableId, 'occupied');
    confirmBooking(bookingId);
    
    toast({
      title: 'Table Assigned',
      description: 'The reservation has been confirmed and table assigned.',
    });

    onOpenChange(false);
  };

  const handleNoTablesAvailable = () => {
    onOpenChange(false);
    onNoTablesAvailable();
  };

  if (availableTables.length === 0) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>No Tables Available</DialogTitle>
            <DialogDescription>
              There are no available tables that can accommodate {numberOfGuests} guests.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <p className="text-sm text-muted-foreground">
              Would you like to contact the customer to reschedule or modify the reservation?
            </p>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleNoTablesAvailable} className="flex-1">
                Contact Customer
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Assign Table</DialogTitle>
          <DialogDescription>
            Select an available table for {numberOfGuests} guests
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div className="grid gap-3 max-h-[400px] overflow-y-auto">
            {availableTables.map((table) => (
              <button
                key={table.id}
                onClick={() => setSelectedTableId(table.id)}
                className={`p-4 rounded-lg border-2 transition-all text-left ${
                  selectedTableId === table.id
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-muted-foreground'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl font-bold">#{table.number}</div>
                    <div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">
                          Capacity: {table.capacity}
                        </span>
                      </div>
                      <Badge variant="outline" className="mt-1">
                        {table.status}
                      </Badge>
                    </div>
                  </div>
                  {selectedTableId === table.id && (
                    <Check className="h-5 w-5 text-primary" />
                  )}
                </div>
              </button>
            ))}
          </div>

          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancel
            </Button>
            <Button
              onClick={handleAssignTable}
              disabled={!selectedTableId}
              className="flex-1"
            >
              Assign Table
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
