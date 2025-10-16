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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTableStore, Table, TableStatus } from '@/store/tableStore';
import { toast } from '@/hooks/use-toast';
import { useEffect } from 'react';

const tableSchema = z.object({
  number: z.coerce.number().min(1, 'Table number must be at least 1'),
  capacity: z.coerce.number().min(1, 'Capacity must be at least 1'),
  floor: z.coerce.number().min(1, 'Floor must be at least 1'),
  status: z.enum(['available', 'occupied', 'out_of_service']),
});

type TableFormData = z.infer<typeof tableSchema>;

interface TableDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  branchId: string;
  table?: Table;
}

export const TableDialog = ({ open, onOpenChange, branchId, table }: TableDialogProps) => {
  const addTable = useTableStore((state) => state.addTable);
  const updateTable = useTableStore((state) => state.updateTable);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<TableFormData>({
    resolver: zodResolver(tableSchema),
    defaultValues: {
      status: 'available',
    },
  });

  const status = watch('status');

  useEffect(() => {
    if (table) {
      reset({
        number: table.number,
        capacity: table.capacity,
        floor: table.floor || 1,
        status: table.status,
      });
    } else {
      reset({
        number: 1,
        capacity: 4,
        floor: 1,
        status: 'available',
      });
    }
  }, [table, reset]);

  const onSubmit = (data: TableFormData) => {
    if (table) {
      updateTable(table.id, data);
      toast({
        title: 'Table Updated',
        description: 'The table has been updated successfully.',
      });
    } else {
      addTable({
        number: data.number,
        capacity: data.capacity,
        floor: data.floor,
        status: data.status,
        branchId,
      });
      toast({
        title: 'Table Added',
        description: 'The table and QR code have been created successfully.',
      });
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{table ? 'Edit Table' : 'Add Table'}</DialogTitle>
          <DialogDescription>
            {table ? 'Update table details' : 'Create a new table with auto-generated QR code'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="number">Table Number *</Label>
            <Input {...register('number')} id="number" type="number" min="1" />
            {errors.number && (
              <p className="text-sm text-destructive">{errors.number.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="capacity">Capacity (people) *</Label>
            <Input {...register('capacity')} id="capacity" type="number" min="1" />
            {errors.capacity && (
              <p className="text-sm text-destructive">{errors.capacity.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="floor">Floor *</Label>
            <Input {...register('floor')} id="floor" type="number" min="1" />
            {errors.floor && (
              <p className="text-sm text-destructive">{errors.floor.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status *</Label>
            <Select value={status} onValueChange={(value) => setValue('status', value as TableStatus)}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="occupied">Occupied</SelectItem>
                <SelectItem value="out_of_service">Out of Service</SelectItem>
              </SelectContent>
            </Select>
            {errors.status && (
              <p className="text-sm text-destructive">{errors.status.message}</p>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">{table ? 'Update' : 'Create'} Table</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
