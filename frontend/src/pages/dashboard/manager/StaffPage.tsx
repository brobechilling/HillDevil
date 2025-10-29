import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Plus, Trash2, Search } from "lucide-react";
import {
  useReceptionistNumberQuery,
  useWaiterNumberQuery,
  useStaffAccountPaginatedQuery,
  useSetStaffAccountStatusMutation,
} from "@/hooks/queries/useStaff";
import { StaffAccountDTO } from "@/dto/staff.dto";
import { ROLE_NAME } from "@/dto/user.dto";
import { StaffManagementDialog } from "@/components/manager/StaffManagementDialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function StaffPage() {
  const storedUser: string = localStorage.getItem("user");
  const user: StaffAccountDTO | null = storedUser ? JSON.parse(storedUser) : null;
  const branchId: string = user?.branchId ?? "";

  const [page, setPage] = useState(1);
  const size = 3;

  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<StaffAccountDTO | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [roleFilter, setRoleFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  const staffQuery = useStaffAccountPaginatedQuery(page, size, branchId);
  const waiterNumberQuery = useWaiterNumberQuery(branchId);
  const receptionistNumberQuery = useReceptionistNumberQuery(branchId);
  const updateStaffStatusMutation = useSetStaffAccountStatusMutation(page, size, branchId);

  const filteredStaffs: StaffAccountDTO[] = (staffQuery.data?.items ?? []).filter((staff) => {
    const matchSearch = staff.username?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchRole = roleFilter === "ALL" ? true : staff.role.name === roleFilter;
    const matchStatus = statusFilter === "ALL" ? true : statusFilter === "ACTIVE" ? staff.status === true : staff.status === false;
    return matchSearch && matchRole && matchStatus;
  });

  const totalPages = staffQuery.data?.totalPages ?? 1;

  const getRoleBadgeVariant = (roleName: string) => {
    switch (roleName) {
      case ROLE_NAME.WAITER:
        return "default";
      case ROLE_NAME.RECEPTIONIST:
        return "secondary";
      default:
        return "outline";
    }
  };

  const handleUpdateStatus = (staffAccountId: string) => {
    updateStaffStatusMutation.mutate(staffAccountId);
    setUpdateDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Staff Management</h2>
          <p className="text-muted-foreground">
            Manage staff members in your branch
          </p>
        </div>
        <Button onClick={() => setAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Staff Account
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-medium">Total Staff</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {staffQuery.data?.totalElements ?? 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-medium">Waiters</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {waiterNumberQuery.data ?? 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-medium">Receptionists</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {receptionistNumberQuery.data ?? 0}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-1/3">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by username..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex gap-3 w-full md:w-auto">
          <Select
            value={roleFilter}
            onValueChange={(value) => setRoleFilter(value)}
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Filter by role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Roles</SelectItem>
              <SelectItem value={ROLE_NAME.WAITER}>Waiter</SelectItem>
              <SelectItem value={ROLE_NAME.RECEPTIONIST}>Receptionist</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={statusFilter}
            onValueChange={(value) => setStatusFilter(value)}
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Status</SelectItem>
              <SelectItem value="ACTIVE">Active</SelectItem>
              <SelectItem value="INACTIVE">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Staff Accounts</CardTitle>
        </CardHeader>
        <CardContent>
          {staffQuery.isLoading ? (
            <div className="text-center text-muted-foreground">
              Loading staff accounts...
            </div>
          ) : filteredStaffs.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              No staff accounts found.
            </div>
          ) : (
            <div className="space-y-3">
              {filteredStaffs.map((staff) => (
                <div
                  key={staff.staffAccountId}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div>
                    <p className="font-semibold">{staff.username}</p>
                    <div className="flex gap-2 mt-1">
                      <Badge variant={getRoleBadgeVariant(staff.role.name)}>
                        {staff.role.name.replace("_", " ")}
                      </Badge>
                      <Badge variant={staff.status ? "default" : "secondary"}>
                        {staff.status ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSelectedStaff(staff);
                      setUpdateDialogOpen(true);
                    }}
                  >
                    <Trash2 className="h-4 w-4 mr-1 text-destructive" />
                    Delete
                  </Button>
                </div>
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex justify-between items-center mt-6">
              <p className="text-sm text-muted-foreground">
                Page {page} / {totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  Previous
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={page === totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <StaffManagementDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        branchId={branchId}
        size={size}
      />

      <AlertDialog open={updateDialogOpen} onOpenChange={setUpdateDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {selectedStaff?.status
                ? "Are you sure you want to inactivate this staff account?"
                : "Are you sure you want to activate this staff account?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {selectedStaff?.status
                ? "This action will inactivate the account of "
                : "This action will activate the account of "}
              <strong>{selectedStaff?.username}</strong>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                handleUpdateStatus(selectedStaff?.staffAccountId ?? "")
              }
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
