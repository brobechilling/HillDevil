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
import { BranchDTO } from "@/dto/branch.dto";
import { useBranchesByRestaurant } from "@/hooks/queries/useBranches";

interface StaffAddDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  size: number;
  restaurantId: string;
}

export const StaffAddDialog = ({
  open,
  onOpenChange,
  size,
  restaurantId,
}: StaffAddDialogProps) => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    role: ROLE_NAME.WAITER,
    branchId: "", 
  });

  const { data: branches, isLoading, isError } = useBranchesByRestaurant(restaurantId);
  const createStaffMutation = useCreateStaffAccountMutation(1, size, restaurantId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.username || !formData.password || !formData.branchId) {
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
        branchId: formData.branchId,
        role: roleDto,
      });

      toast({
        title: "Staff member added",
        description: `${formData.username} has been added successfully.`,
      });

      onOpenChange(false);
      setFormData({ username: "", password: "", role: ROLE_NAME.WAITER, branchId: "" });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to create staff",
        description: error?.message || "Something went wrong",
      });
    }
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
                <SelectItem value={ROLE_NAME.BRANCH_MANAGER}>Branch Manager</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Branch</Label>
            {isLoading ? (
              <p className="text-sm text-muted-foreground">Loading branches...</p>
            ) : isError ? (
              <p className="text-sm text-destructive">Failed to load branches.</p>
            ) : (
              <Select
                value={formData.branchId}
                onValueChange={(value) =>
                  setFormData({ ...formData, branchId: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select branch" />
                </SelectTrigger>
                <SelectContent>
                  {branches?.length ? (
                    branches.map((branch: BranchDTO) => (
                      <SelectItem key={branch.branchId} value={branch.branchId}>
                        {branch.address}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="" disabled>
                      No branches available
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            )}
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
