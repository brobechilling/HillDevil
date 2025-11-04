import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2, Plus, Search, Eye } from 'lucide-react';
import { getLocalStorageObject } from '@/utils/typeCast';
import { RestaurantDTO } from '@/dto/restaurant.dto';
import { useSetStaffAccountStatusMutation, useStaffAccountByRestaurantPaginatedQuery } from '@/hooks/queries/useStaff';
import { StaffAccountDTO } from '@/dto/staff.dto';
import { ROLE_NAME } from '@/dto/user.dto';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import { StaffAddDialog } from '@/components/owner/StaffAddDialog';
import { StaffDetailsDialog } from '@/components/common/StaffDetailsDialog';
import { useState } from 'react';
import { useBranchesByRestaurant } from '@/hooks/queries/useBranches';

const OwnerStaffPage = () => {
  const navigate = useNavigate();
  const selectedRestaurant: RestaurantDTO | null = getLocalStorageObject<RestaurantDTO>("selected_restaurant");
  if (!selectedRestaurant) {
    navigate('/brand-selection');
  }

  const [page, setPage] = useState(1);
  const size = 5;

  const { data: branches, isLoading: isBranchesLoading } = useBranchesByRestaurant(selectedRestaurant?.restaurantId);
  const staffQuery = useStaffAccountByRestaurantPaginatedQuery(page, size, selectedRestaurant?.restaurantId);
  const updateStaffStatusMutation = useSetStaffAccountStatusMutation(page, size, selectedRestaurant?.restaurantId);

  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<StaffAccountDTO | null>(null);
  const [selectedStaffId, setSelectedStaffId] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState<string>("");
  const [roleFilter, setRoleFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [branchFilter, setBranchFilter] = useState<string>("ALL");

  const filteredStaffs: StaffAccountDTO[] = (staffQuery.data?.items ?? []).filter((staff) => {
    const matchSearch = staff.username?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchRole = roleFilter === "ALL" ? true : staff.role.name === roleFilter;
    const matchStatus = statusFilter === "ALL" ? true : statusFilter === "ACTIVE" ? staff.status === true : staff.status === false;
    const matchBranch = branchFilter === "ALL" ? true : staff.branchId === branchFilter;
    return matchSearch && matchRole && matchStatus && matchBranch;
  });

  const totalPages = staffQuery.data?.totalPages ?? 1;

  const getRoleBadgeVariant = (roleName: string) => {
    switch (roleName) {
      case ROLE_NAME.WAITER:
        return "default";
      case ROLE_NAME.RECEPTIONIST:
        return "secondary";
      case ROLE_NAME.BRANCH_MANAGER:
        return "destructive";
      default:
        return "outline";
    }
  };

  const handleUpdateStatus = (staffAccountId: string) => {
    updateStaffStatusMutation.mutate(staffAccountId);
    setUpdateDialogOpen(false);
  };

  const getBranchAddress = (branchId?: string): string => {
    if (!branchId || !branches) return "N/A";
    const branch = branches.find((b) => b.branchId === branchId);
    return branch ? branch.address : "Unknown branch";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Staff Management</h2>
          <p className="text-muted-foreground">
            Manage staff members in your restaurant
          </p>
        </div>
        <Button onClick={() => setAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Staff Account
        </Button>
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

        <div className="flex flex-wrap gap-3 w-full md:w-auto">
          <Select value={roleFilter} onValueChange={(value) => setRoleFilter(value)}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Filter by role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Roles</SelectItem>
              <SelectItem value={ROLE_NAME.WAITER}>Waiter</SelectItem>
              <SelectItem value={ROLE_NAME.RECEPTIONIST}>Receptionist</SelectItem>
              <SelectItem value={ROLE_NAME.BRANCH_MANAGER}>Branch Manager</SelectItem>
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value)}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Status</SelectItem>
              <SelectItem value="ACTIVE">Active</SelectItem>
              <SelectItem value="INACTIVE">Inactive</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={branchFilter}
            onValueChange={(value) => setBranchFilter(value)}
            disabled={isBranchesLoading}
          >
            <SelectTrigger className="w-[400px]">
              <SelectValue placeholder="Filter by branch" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Branches</SelectItem>
              {branches?.map((branch) => (
                <SelectItem key={branch.branchId} value={branch.branchId}>
                  {branch.address}
                </SelectItem>
              ))}
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
                  className="flex flex-col md:flex-row md:items-center justify-between p-3 border rounded-lg"
                >
                  <div>
                    <p className="font-semibold">{staff.username}</p>
                    <p className="text-sm text-muted-foreground">
                      Branch: {getBranchAddress(staff.branchId)}
                    </p>
                    <div className="flex gap-2 mt-1">
                      <Badge variant={getRoleBadgeVariant(staff.role.name)}>
                        {staff.role.name.replace("_", " ")}
                      </Badge>
                      <Badge variant={staff.status ? "default" : "secondary"}>
                        {staff.status ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-2 md:mt-0">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedStaffId(staff.staffAccountId);
                        setDetailsDialogOpen(true);
                      }}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Details
                    </Button>
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

      <StaffAddDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        restaurantId={selectedRestaurant?.restaurantId}
        size={size}
      />

      <StaffDetailsDialog
        open={detailsDialogOpen}
        onOpenChange={setDetailsDialogOpen}
        staffAccountId={selectedStaffId}
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
};

export default OwnerStaffPage;
