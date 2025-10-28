import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ROLE_NAME, RoleDTO } from "@/dto/user.dto";
import { toast } from "@/hooks/use-toast";
import { useCreateStaffAccountMutation } from "@/hooks/queries/useStaff";

interface StaffManagementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  branchId: string;
  size: number;
}

export const StaffManagementDialog = ({
  open,
  onOpenChange,
  branchId,
  size,
}: StaffManagementDialogProps) => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    role: ROLE_NAME.WAITER,
  });

  const createStaffMutation = useCreateStaffAccountMutation(1, size, branchId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.username || !formData.password) {
      toast({
        variant: "destructive",
        title: "Missing fields",
        description: "Please fill in all required fields.",
      });
      return;
    }

    const roleDto: RoleDTO = { name: formData.role, description: "" };

    try {
      await createStaffMutation.mutateAsync({
        username: formData.username,
        password: formData.password,
        branchId,
        role: roleDto,
      });

      toast({
        title: "Staff member added",
        description: `${formData.username} has been added successfully.`,
      });

      onOpenChange(false);
      setFormData({ username: "", password: "", role: ROLE_NAME.WAITER });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to create staff",
        description: error?.message || "Something went wrong",
      });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Staff Member</DialogTitle>
          <DialogDescription>
            Create a new waiter or receptionist for this branch.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Username</Label>
            <Input
              value={formData.username}
              onChange={(e) =>
                setFormData({ ...formData, username: e.target.value })
              }
              placeholder="Enter username"
            />
          </div>

          <div className="space-y-2">
            <Label>Password</Label>
            <Input
              type="password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              placeholder="Enter password"
            />
          </div>

          <div className="space-y-2">
            <Label>Role</Label>
            <Select
              value={formData.role}
              onValueChange={(value) =>
                setFormData({ ...formData, role: value as ROLE_NAME })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ROLE_NAME.WAITER}>Waiter</SelectItem>
                <SelectItem value={ROLE_NAME.RECEPTIONIST}>Receptionist</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createStaffMutation.isPending}>
              {createStaffMutation.isPending ? "Creating..." : "Add Staff"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
