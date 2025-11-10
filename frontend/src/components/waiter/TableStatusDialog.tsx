import { useState, useEffect, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Input } from '@/components/ui/input';
// import { useTableStore, TableStatus } from '@/store/tableStore';
// import { useReservationStore } from '@/store/reservationStore';
import { toast } from '@/hooks/use-toast';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';


interface TableStatusDialogProps {
  tableId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const TableStatusDialog = ({ tableId, open, onOpenChange }: TableStatusDialogProps) => {
  // Get tables and reservations
  // const tables = useTableStore((state) => state.tables);
  // const updateTable = useTableStore((state) => state.updateTable);
  // const addReservation = useReservationStore((state) => state.addReservation);

  // Find specific table
  // const table = useMemo(
  //   () => tables.find((t) => t.id === tableId) || null,
  //   [tables, tableId]
  // );

  // Get reservations for this table
  // const allReservations = useReservationStore((state) => state.reservations);
  // const reservations = useMemo(
  //   () => allReservations.filter((r) => r.tableId === tableId),
  //   [allReservations, tableId]
  // );

  // Local state
  // const [status, setStatus] = useState<TableStatus>('available');
  const [reservationName, setReservationName] = useState('');
  const [reservationDate, setReservationDate] = useState<Date | undefined>(undefined);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  // Cập nhật state khi dialog mở hoặc table thay đổi
  // useEffect(() => {
  //   if (!open || !table) return;

  //   setStatus(table.status ?? 'available');
  //   setReservationName(table.reservationName ?? '');
  //   setReservationDate(table.reservationStart ? new Date(table.reservationStart) : undefined);
  //   setStartTime(table.reservationStart ? format(new Date(table.reservationStart), 'HH:mm') : '');
  //   setEndTime(table.reservationEnd ? format(new Date(table.reservationEnd), 'HH:mm') : '');
  // }, [open, table]);

  // if (!table) return null;

  const handleSave = () => {
    // const updates: Partial<typeof table> = { status };

    // // Nếu status occupied → tạo reservation mới
    // if (status === 'occupied' && reservationDate && startTime && endTime && reservationName) {
    //   const start = new Date(reservationDate);
    //   const [startHour, startMin] = startTime.split(':').map(Number);
    //   start.setHours(startHour, startMin);

    //   const end = new Date(reservationDate);
    //   const [endHour, endMin] = endTime.split(':').map(Number);
    //   end.setHours(endHour, endMin);

    //   addReservation({
    //     tableId: table.id,
    //     branchId: table.branchId,
    //     guestName: reservationName,
    //     guestEmail: '',
    //     guestPhone: '',
    //     numberOfGuests: 1,
    //     reservationStart: start.toISOString(),
    //     reservationEnd: end.toISOString(),
    //     status: 'confirmed',
    //     notes: '',
    //   });
    // }

    // updateTable(table.id, updates);

    // toast({
    //   title: 'Table Updated',
    //   description: `Table ${table.number} status changed to ${status}`,
    // });

    // onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-md"
        aria-describedby="table-status-dialog-description"
      >
        <DialogHeader>
          {/* <DialogTitle>Update Table {table.number} Status</DialogTitle> */}
          <p
            id="table-status-dialog-description"
            className="text-sm text-muted-foreground"
          >
            Update the status of this table and add a reservation if needed.
          </p>
        </DialogHeader>

        <div className="space-y-4">
          {/* Table Status */}
          <div className="space-y-2">
            <Label>Table Status</Label>
            {/* <RadioGroup value={status} onValueChange={(v) => setStatus(v as TableStatus)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="available" id="available" />
                <Label htmlFor="available" className="font-normal cursor-pointer">
                  Available
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="occupied" id="occupied" />
                <Label htmlFor="occupied" className="font-normal cursor-pointer">
                  Occupied
                </Label>
              </div>
            </RadioGroup> */}
          </div>

          {/* Reservation Fields */}
          {status === 'occupied' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="reservationName">Guest/Reservation Name</Label>
                <Input
                  id="reservationName"
                  value={reservationName}
                  onChange={(e) => setReservationName(e.target.value)}
                  placeholder="Customer name"
                />
              </div>

              <div className="space-y-2">
                <Label>Reservation Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        'w-full justify-start text-left font-normal',
                        !reservationDate && 'text-muted-foreground'
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {reservationDate ? (
                        format(reservationDate, 'PPP')
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={reservationDate}
                      onSelect={setReservationDate}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startTime">Start Time</Label>
                  <Input
                    id="startTime"
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endTime">End Time</Label>
                  <Input
                    id="endTime"
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                  />
                </div>
              </div>

              {/* {reservations.length > 0 && (
                <div className="mt-4 border-t pt-2">
                  <Label>Current Reservations</Label>
                  <ul className="space-y-1 max-h-40 overflow-y-auto">
                    {reservations.map((res) => (
                      <li key={res.id} className="text-sm border p-2 rounded">
                        <div>
                          <strong>{res.guestName}</strong> ({res.numberOfGuests} guests)
                        </div>
                        <div>
                          {format(new Date(res.reservationStart), 'PPP HH:mm')} -{' '}
                          {format(new Date(res.reservationEnd), 'HH:mm')}
                        </div>
                        <div className="text-muted-foreground">{res.status}</div>
                      </li>
                    ))}
                  </ul>
                </div>
              )} */}
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
