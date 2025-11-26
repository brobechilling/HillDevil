import { useState, useEffect } from 'react';
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
import { toast } from '@/hooks/use-toast';
import { updateTableStatus } from '@/api/tableApi';
import { TableStatus } from '@/dto/table.dto';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CheckCircle, Clock, Zap, AlertCircle } from 'lucide-react';

interface TableStatusDialogProps {
  tableId: string | null;
  currentStatus?: string;
  tableName?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const TableStatusDialog = ({ tableId, currentStatus, tableName, open, onOpenChange }: TableStatusDialogProps) => {
  const [selectedStatus, setSelectedStatus] = useState<TableStatus>('FREE');
  const queryClient = useQueryClient();

  useEffect(() => {
    if (open && currentStatus) {
      setSelectedStatus(currentStatus as TableStatus);
    }
  }, [open, currentStatus]);

  const mutation = useMutation({
    mutationFn: async (status: TableStatus) => {
      if (!tableId) throw new Error('Table ID is required');
      return updateTableStatus(tableId, status);
    },
    onSuccess: () => {
      toast({
        title: '✓ Success',
        description: `${tableName || 'Table'} status updated to ${selectedStatus}`,
      });
      queryClient.invalidateQueries({ queryKey: ['tables'] });
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast({
        title: '✗ Error',
        description: error?.response?.data?.message || 'Failed to update table status',
        variant: 'destructive',
      });
    },
  });

  const handleSave = () => {
    mutation.mutate(selectedStatus);
  };

  const statusOptions: Array<{ value: TableStatus; label: string; description: string; icon: React.ReactNode; color: string }> = [
    {
      value: 'FREE',
      label: 'Free',
      description: 'Table is empty and ready for guests',
      icon: <CheckCircle className="h-5 w-5" />,
      color: 'border-primary/30 hover:border-primary/60 hover:bg-primary/5',
    },
    {
      value: 'OCCUPIED',
      label: 'Occupied',
      description: 'Table is currently being used',
      icon: <Clock className="h-5 w-5" />,
      color: 'border-destructive/30 hover:border-destructive/60 hover:bg-destructive/5',
    },
    {
      value: 'ACTIVE',
      label: 'Active',
      description: 'Table is active and available for service',
      icon: <Zap className="h-5 w-5" />,
      color: 'border-secondary/30 hover:border-secondary/60 hover:bg-secondary/5',
    },
    {
      value: 'INACTIVE',
      label: 'Inactive',
      description: 'Table is not available for service',
      icon: <AlertCircle className="h-5 w-5" />,
      color: 'border-muted/50 hover:border-muted/80 hover:bg-muted/5',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'FREE':
        return 'text-primary';
      case 'OCCUPIED':
        return 'text-destructive';
      case 'ACTIVE':
        return 'text-secondary';
      case 'INACTIVE':
        return 'text-muted-foreground';
      default:
        return 'text-foreground';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-xl">
            {tableName && <span className="text-primary">{tableName}</span>}
            {tableName && ' - '}Change Table Status
          </DialogTitle>
          <p className="text-sm text-muted-foreground mt-2">Select a new status for this table</p>
        </DialogHeader>

        <RadioGroup value={selectedStatus} onValueChange={(value) => setSelectedStatus(value as TableStatus)}>
          <div className="space-y-2">
            {statusOptions.map((option) => {
              const isSelected = selectedStatus === option.value;
              return (
                <div
                  key={option.value}
                  onClick={() => setSelectedStatus(option.value)}
                  className={`flex items-start gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                    isSelected
                      ? `border-primary bg-primary/10 dark:bg-primary/20`
                      : `border-muted ${option.color}`
                  }`}
                >
                  <RadioGroupItem value={option.value} id={option.value} className="mt-1" />
                  <label htmlFor={option.value} className="flex-1 cursor-pointer">
                    <div className={`font-semibold text-sm flex items-center gap-2 ${getStatusColor(option.value)}`}>
                      {option.icon}
                      {option.label}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">{option.description}</div>
                  </label>
                  {isSelected && <div className="text-primary mt-1">✓</div>}
                </div>
              );
            })}
          </div>
        </RadioGroup>

        <DialogFooter className="pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={mutation.isPending}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={mutation.isPending}
            className="bg-primary hover:bg-primary/90"
          >
            {mutation.isPending ? 'Updating...' : 'Update Status'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
