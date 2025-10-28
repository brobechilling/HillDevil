import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EyeOff } from "lucide-react";
import { StaffAccountDTO } from "@/dto/staff.dto";

interface StaffViewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  staff: StaffAccountDTO | null;
}

export const StaffViewDialog = ({
  open,
  onOpenChange,
  staff,
}: StaffViewDialogProps) => {
  if (!staff) 
    return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Staff Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-lg">{staff.username}</h3>
            <Badge variant={staff.status ? "default" : "secondary"}>
              {staff.status ? "Active" : "Inactive"}
            </Badge>
          </div>

          <div className="grid gap-2 text-sm">
            <p>
              <strong>Role:</strong> {staff.role.name.replace("_", " ")}
            </p>
          </div>

          <div className="flex justify-end pt-4 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              <EyeOff className="h-4 w-4 mr-2" />
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
