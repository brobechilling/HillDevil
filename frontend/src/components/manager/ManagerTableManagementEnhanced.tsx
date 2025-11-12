import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table2, Eye, Settings, ChevronLeft, ChevronRight, Plus, QrCode, Trash2, Edit2, Save, X } from 'lucide-react';
import { TableStatus } from '@/dto/table.dto';
import { toast } from '@/hooks/use-toast';
import { useAreas, useCreateArea, useDeleteArea } from '@/hooks/queries/useAreas';
import { useTables, useDeleteTable, useUpdateTableStatus, useUpdateTable } from '@/hooks/queries/useTables';
import { useBranches, useBranchesByRestaurant } from '@/hooks/queries/useBranches';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { BranchSelection } from '@/components/common/BranchSelection';
import { BranchDTO } from '@/dto/branch.dto';
import { TableDTO } from '@/dto/table.dto';
import { RestaurantDTO } from '@/dto/restaurant.dto';
import { getLocalStorageObject } from '@/utils/typeCast';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { TableDialog } from '@/components/owner/TableDialog';
import { TableQRDialog } from '@/components/owner/TableQRDialog';
import { QRCodeSVG } from 'qrcode.react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { getReservationsByTable as apiGetReservationsByTable } from '@/api/reservationApi';

interface ManagerTableManagementEnhancedProps {
  branchId?: string;
  allowBranchSelection?: boolean;
  hideAddButtons?: boolean;
  disableStatusChange?: boolean;
}

export const ManagerTableManagementEnhanced = ({
  branchId: initialBranchId,
  allowBranchSelection = false,
  hideAddButtons = false,
  disableStatusChange = false,
}: ManagerTableManagementEnhancedProps) => {
  // const { getTablesByBranchAndFloor } = useTableStore();

  const selectedRestaurant: RestaurantDTO | null = useMemo(() => {
    return getLocalStorageObject<RestaurantDTO>("selected_restaurant");
  }, []);

  const [selectedBranch, setSelectedBranch] = useState<string | undefined>(initialBranchId);

  const branchesByRestaurantQuery = useBranchesByRestaurant(selectedRestaurant?.restaurantId);
  const allBranchesQuery = useBranches();

  const { data: branches = [] } = selectedRestaurant?.restaurantId
    ? branchesByRestaurantQuery
    : allBranchesQuery;

  const validBranchId = useMemo(() => {
    if (allowBranchSelection) {
      const branchId = selectedBranch?.trim();
      return branchId && branchId !== '' && branchId !== 'undefined' ? branchId : undefined;
    }
    const branchId = initialBranchId?.trim();
    return branchId && branchId !== '' && branchId !== 'undefined' ? branchId : undefined;
  }, [allowBranchSelection, selectedBranch, initialBranchId]);

  const { data: areas = [] } = useAreas(validBranchId);
  const createAreaMutation = useCreateArea();
  const deleteAreaMutation = useDeleteArea();
  const queryClient = useQueryClient();

  const { data: tablesData, isLoading: isTablesLoading, error: tablesError, refetch: refetchTables } = useTables(validBranchId);
  const existingTables: TableDTO[] = tablesData?.content || [];

  const deleteTableMutation = useDeleteTable();
  const updateTableStatusMutation = useUpdateTableStatus();
  const updateTableMutation = useUpdateTable();
  const [isDeleteLoading, setIsDeleteLoading] = useState<string | null>(null);
  const [isStatusUpdating, setIsStatusUpdating] = useState<string | null>(null);

  // Edit mode state for Details dialog
  const [isEditMode, setIsEditMode] = useState(false);
  const [editFormData, setEditFormData] = useState<{
    capacity: number;
    areaId: string;
    status: TableStatus;
  } | null>(null);

  useEffect(() => {
    if (allowBranchSelection && validBranchId) {
      refetchTables();
    }
  }, [allowBranchSelection, validBranchId, refetchTables]);

  const [selectedTable, setSelectedTable] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [reservationIndex, setReservationIndex] = useState(0);

  const selectedTableReservationsQuery = useQuery({
    queryKey: ['reservationsByTable', selectedTable?.id],
    queryFn: () => apiGetReservationsByTable(selectedTable?.id),
    enabled: !!selectedTable && !!dialogOpen,
  });

  const [isAddTableOpen, setIsAddTableOpen] = useState(false);
  const [isAreaDialogOpen, setIsAreaDialogOpen] = useState(false);
  const [isQRDialogOpen, setIsQRDialogOpen] = useState(false);
  const [qrTable, setQrTable] = useState<any>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [tableToDelete, setTableToDelete] = useState<{ id: string; name: string } | null>(null);

  // Area filter state
  const [selectedAreaId, setSelectedAreaId] = useState<string | null>(null);
  const [isDeleteAreaDialogOpen, setIsDeleteAreaDialogOpen] = useState(false);
  const [areaToDelete, setAreaToDelete] = useState<{ id: string; name: string } | null>(null);

  const [areaName, setAreaName] = useState('');
  const [initialTableCount, setInitialTableCount] = useState<number>(0);

  const apiTables = useMemo(() => tablesData?.content || [], [tablesData?.content]);

  const areaMap = useMemo(() => {
    const map = new Map<string, { areaName: string; tables: TableDTO[] }>();

    apiTables.forEach((table) => {
      const areaId = table.areaId || 'unknown';
      const areaName = table.areaName || areas.find(a => a.areaId === areaId)?.name || 'Unassigned';

      if (!map.has(areaId)) {
        map.set(areaId, { areaName, tables: [] });
      }
      map.get(areaId)!.tables.push(table);
    });

    return map;
  }, [apiTables, areas]);

  // Filter areas based on selectedAreaId
  const filteredAreaEntries = useMemo(() => {
    const entries = Array.from(areaMap.entries()).sort((a, b) =>
      a[1].areaName.localeCompare(b[1].areaName)
    );

    if (selectedAreaId === null || selectedAreaId === 'all') {
      return entries;
    }

    return entries.filter(([areaId]) => areaId === selectedAreaId);
  }, [areaMap, selectedAreaId]);

  const sortedAreaEntries = filteredAreaEntries;

  const normalizeStatus = (status: string): string => {
    const upperStatus = status.toUpperCase();
    if (upperStatus === 'FREE') return 'available';
    if (upperStatus === 'OCCUPIED') return 'occupied';
    if (upperStatus === 'INACTIVE' || upperStatus === 'OUT_OF_SERVICE') return 'out_of_service';
    return status.toLowerCase();
  };

  const getStatusDisplayValue = (status: string): string => {
    const normalized = normalizeStatus(status);
    if (normalized === 'available') return 'available';
    if (normalized === 'occupied') return 'occupied';
    if (normalized === 'out_of_service') return 'out_of_service';
    return 'available'; // default
  };

  const branchShortCode = validBranchId || '';

  const availableTables = apiTables.filter(t => normalizeStatus(t.status) === 'available').length;
  const occupiedTables = apiTables.filter(t => normalizeStatus(t.status) === 'occupied').length;
  const outOfServiceTables = apiTables.filter(t => normalizeStatus(t.status) === 'out_of_service').length;

  const handleStatusChange = async (tableId: string, newStatus: TableStatus) => {
    setIsStatusUpdating(tableId);
    try {
      await updateTableStatusMutation.mutateAsync({ tableId, status: newStatus });
      toast({
        title: 'Table status updated',
        description: `Table status has been changed to ${newStatus.replace('_', ' ')}.`,
      });
      // Query sẽ tự động invalidate và refetch từ useUpdateTableStatus hook
    } catch (error: any) {
      console.error('Error updating table status:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to update table status';
      toast({
        variant: 'destructive',
        title: 'Error updating status',
        description: errorMessage,
      });
    } finally {
      setIsStatusUpdating(null);
    }
  };

  const handleDeleteClick = (tableId: string, tableName: string) => {
    setTableToDelete({ id: tableId, name: tableName });
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!tableToDelete) return;

    setIsDeleteLoading(tableToDelete.id);
    setIsDeleteDialogOpen(false);

    try {
      await deleteTableMutation.mutateAsync(tableToDelete.id);
      toast({
        title: 'Table deleted',
        description: `Table "${tableToDelete.name}" has been deleted successfully.`,
      });
      refetchTables();
      setTableToDelete(null);
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to delete table';
      toast({
        variant: 'destructive',
        title: 'Error deleting table',
        description: errorMessage,
      });
    } finally {
      setIsDeleteLoading(null);
    }
  };

  const handleDeleteAreaClick = (areaId: string, areaName: string) => {
    // Check if area has tables - show warning but allow deletion
    const areaTables = areaMap.get(areaId)?.tables || [];
    if (areaTables.length > 0) {
      toast({
        title: 'Area has tables',
        description: `Area "${areaName}" has ${areaTables.length} table(s). These tables will be moved to "Undefined Area" after deletion.`,
      });
    }

    setAreaToDelete({ id: areaId, name: areaName });
    setIsDeleteAreaDialogOpen(true);
  };

  const handleConfirmDeleteArea = async () => {
    if (!areaToDelete) return;

    try {
      const areaTables = areaMap.get(areaToDelete.id)?.tables || [];
      await deleteAreaMutation.mutateAsync(areaToDelete.id);

      let description = `Area "${areaToDelete.name}" has been deleted successfully.`;
      if (areaTables.length > 0) {
        description += ` ${areaTables.length} table(s) have been moved to "Undefined Area".`;
      }

      toast({
        title: 'Area deleted',
        description: description,
      });
      setIsDeleteAreaDialogOpen(false);
      setAreaToDelete(null);
      // Reset filter if deleted area was selected
      if (selectedAreaId === areaToDelete.id) {
        setSelectedAreaId(null);
      }
      // Refetch tables to show updated area assignments
      refetchTables();
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to delete area';
      toast({
        variant: 'destructive',
        title: 'Error deleting area',
        description: errorMessage,
      });
    }
  };

  const handleViewDetails = (table: any) => {
    setSelectedTable(table);
    setReservationIndex(0);
    setIsEditMode(false);
    setEditFormData(null);
    setDialogOpen(true);
  };

  const handleEditClick = () => {
    if (!selectedTable) return;
    setIsEditMode(true);
    setEditFormData({
      capacity: selectedTable.capacity || 0,
      areaId: selectedTable.areaId || '',
      status: selectedTable.status || 'FREE',
    });
  };

  const handleCancelEdit = () => {
    setIsEditMode(false);
    setEditFormData(null);
  };

  const handleSaveChanges = async () => {
    if (!selectedTable || !editFormData) return;

    setIsStatusUpdating(selectedTable.id);
    try {
      // Convert status to API format if needed
      let apiStatus: TableStatus = editFormData.status;
      if (editFormData.status === 'ACTIVE' || editFormData.status === 'INACTIVE' || editFormData.status === 'OCCUPIED') {
        // Status is already in API format
        apiStatus = editFormData.status;
      } else {
        // Normalize status from UI format to API format
        const normalized = normalizeStatus(editFormData.status);
        if (normalized === 'available') {
          apiStatus = 'FREE';
        } else if (normalized === 'occupied') {
          apiStatus = 'OCCUPIED';
        } else if (normalized === 'out_of_service') {
          apiStatus = 'INACTIVE';
        } else {
          apiStatus = editFormData.status;
        }
      }

      // Update table (area, capacity)
      const updatedTableResponse = await updateTableMutation.mutateAsync({
        tableId: selectedTable.id,
        data: {
          areaId: editFormData.areaId,
          tag: selectedTable.tag, // Keep original tag (table name cannot be changed)
          capacity: editFormData.capacity,
        },
      });

      // Update status separately if it changed
      let finalTableData = updatedTableResponse;
      if (editFormData.status !== selectedTable.status) {
        finalTableData = await updateTableStatusMutation.mutateAsync({
          tableId: selectedTable.id,
          status: apiStatus,
        });
      }

      // Find area name for the new areaId
      const newArea = areas.find(a => a.areaId === editFormData.areaId);

      // Prepare updated table data with area name
      const updatedTableData = {
        ...finalTableData,
        areaId: editFormData.areaId,
        areaName: newArea?.name || finalTableData.areaName || selectedTable.areaName,
        capacity: editFormData.capacity,
        status: apiStatus,
      };

      // Update selectedTable immediately with response data
      setSelectedTable(updatedTableData);

      // Update React Query cache directly to update the list view immediately
      // useTables hook uses queryKey: ['tables', branchId, page, size, sort]
      // We need to update all matching queries for this branchId
      // IMPORTANT: Update cache BEFORE invalidateQueries triggers refetch
      // This ensures the UI shows the new data immediately
      queryClient.setQueriesData(
        { queryKey: ['tables', validBranchId] },
        (oldData: any) => {
          if (!oldData || !oldData.content) return oldData;
          return {
            ...oldData,
            content: oldData.content.map((table: TableDTO) =>
              table.id === selectedTable.id ? updatedTableData : table
            ),
          };
        }
      );

      toast({
        title: 'Table updated successfully',
        description: 'Table information has been saved.',
      });

      setIsEditMode(false);
      setEditFormData(null);
    } catch (error: any) {
      console.error('Error updating table:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to update table';
      toast({
        variant: 'destructive',
        title: 'Error updating table',
        description: errorMessage,
      });
    } finally {
      setIsStatusUpdating(null);
    }
  };

  const getStatusColor = (status: string) => {
    const normalized = normalizeStatus(status);
    switch (normalized) {
      case 'available':
        return 'bg-green-500';
      case 'occupied':
        return 'bg-blue-500';
      case 'out_of_service':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusLabel = (status: string) => {
    const normalized = normalizeStatus(status);
    switch (normalized) {
      case 'available':
        return 'Available';
      case 'occupied':
        return 'Occupied';
      case 'out_of_service':
        return 'Out of Service';
      default:
        return status;
    }
  };

  // const selectedTableReservations = selectedTable ? getReservationsByTable(selectedTable.id) : [];

  // Child component to render a single table card and fetch its reservations.
  // Use local hover state inside the card so hovering one card doesn't re-render the whole list.
  const TableCard = ({ table, tableIndex }: { table: any; tableIndex: number }) => {
    const [isHovered, setIsHovered] = useState(false);

    const reservationsQuery = useQuery({
      queryKey: ['reservationsByTable', table.id],
      queryFn: () => apiGetReservationsByTable(table.id),
      // Only fetch when the user hovers the table or opens the details dialog for it
      enabled: !!table?.id && (isHovered || (dialogOpen && selectedTable?.id === table.id)),
      staleTime: 60_000,
      // cacheTime: 5 * 60_000,
      // Avoid refetch storms from focus/reconnect/mount
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      refetchOnMount: false,
    });

    const reservations = reservationsQuery.data || [];

    return (
      <div
        key={table.id}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="relative group"
        style={{
          animation: `slideIn 0.4s ease-out ${tableIndex * 0.05}s both`,
        }}
      >
        <Card
          className={cn(
            "border-2 transition-all duration-500 cursor-pointer overflow-hidden",
            isHovered ? 'border-primary shadow-2xl' : 'border-border/50 hover:shadow-lg',
            normalizeStatus(table.status) === 'out_of_service' && 'opacity-60',
            normalizeStatus(table.status) === 'occupied' && 'bg-destructive/5'
          )}
          style={{
            transition: 'transform 0.3s ease-out, box-shadow 0.3s ease-out',
            transform: isHovered ? 'translateY(-4px) scale(1.02)' : 'translateY(0) scale(1)',
          }}
        >
          <CardContent
            className="relative pt-5 h-full flex flex-col"
            style={{
              transition: 'padding-bottom 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          >
            <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-primary/10 to-transparent rounded-bl-3xl pointer-events-none" />

            <div className="space-y-3 relative flex-1 pb-4">
              <div className="flex items-start justify-between gap-2">
                <span className="font-bold text-lg bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent break-words">
                  {table.tag}
                </span>
              </div>

              <div className="flex items-center flex-wrap gap-2">
                <Badge className={cn(getStatusColor(table.status), "transition-all duration-300 text-white font-semibold")}>
                  {getStatusLabel(table.status)}
                </Badge>
                {Array.isArray(reservations) && reservations.length > 0 && (
                  <Badge variant="secondary" className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100 animate-pulse font-semibold">
                    {reservations.length} {reservations.length === 1 ? 'Booking' : 'Bookings'}
                  </Badge>
                )}

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <svg
                  className="w-4 h-4 flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                <span className="font-medium">
                  {table.capacity} {table.capacity === 1 ? 'seat' : 'seats'}
                </span>
              </div>
            </div>
            </div>

            <div
              className={cn(
                "mt-4 pt-4 border-t-2 transition-all duration-500 overflow-hidden",
                isHovered ? 'max-h-20 opacity-100' : 'max-h-0 opacity-0',
                "bg-muted/50 dark:bg-muted/30 rounded-b-lg"
              )}
              style={{
                transition: 'max-height 0.5s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.4s ease-out',
              }}
            >
              <div className="flex gap-2 justify-center items-center px-2 py-3">
                <Button
                  size="default"
                  variant="outline"
                  className="h-10 w-10 p-0 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-200 rounded-lg shadow-sm hover:shadow-md border-2"
                  onClick={() => handleViewDetails(table)}
                  title="View Details"
                >
                  <Eye className="w-5 h-5" />
                </Button>

                <Button
                  size="default"
                  variant="outline"
                  className="h-10 w-10 p-0 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-200 rounded-lg shadow-sm hover:shadow-md border-2"
                  onClick={() => {
                    const currentBranchId = validBranchId;
                    if (!currentBranchId || currentBranchId.trim() === '' || currentBranchId === 'undefined') {
                      toast({
                        variant: 'destructive',
                        title: 'Error',
                        description: 'Please select a branch first to view QR code.',
                      });
                      return;
                    }
                    setQrTable(table);
                    setIsQRDialogOpen(true);
                  }}
                  title="View QR Code"
                >
                  <QrCode className="w-5 h-5" />
                </Button>

                {!hideAddButtons && (
                  <Button
                    size="default"
                    variant="outline"
                    className="h-10 w-10 p-0 hover:bg-destructive hover:text-destructive-foreground hover:border-destructive transition-all duration-200 rounded-lg shadow-sm hover:shadow-md border-2 disabled:opacity-50"
                    onClick={() => handleDeleteClick(table.id, table.tag)}
                    disabled={isDeleteLoading === table.id}
                    title="Delete Table"
                  >
                    {isDeleteLoading === table.id ? (
                      <div className="w-5 h-5 border-2 border-destructive/40 border-t-destructive rounded-full animate-spin" />
                    ) : (
                      <Trash2 className="w-5 h-5" />
                    )}
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  useEffect(() => {
    // Only auto-select first branch if no branchId was provided initially
    // and no branch is currently selected
    if (allowBranchSelection && !selectedBranch && !initialBranchId && branches.length > 0) {
      const firstBranch = branches[0];
      if (firstBranch && firstBranch.branchId) {
        const branchIdStr = String(firstBranch.branchId);
        const isValidUUID = (str: string): boolean => {
          const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
          return uuidRegex.test(str);
        };
        if (isValidUUID(branchIdStr)) {
          setSelectedBranch(branchIdStr);
        }
      }
    }
    // If initialBranchId is provided, use it
    else if (allowBranchSelection && initialBranchId && !selectedBranch) {
      const branchIdStr = String(initialBranchId);
      const isValidUUID = (str: string): boolean => {
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        return uuidRegex.test(str);
      };
      if (isValidUUID(branchIdStr)) {
        setSelectedBranch(branchIdStr);
      }
    }
  }, [allowBranchSelection, selectedBranch, branches, initialBranchId]);

  return (
    <>
      <style>{`
        @keyframes fadeInScale {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(10px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        @keyframes shimmer {
          0% { background-position: -1000px 0; }
          100% { background-position: 1000px 0; }
        }
      `}</style>

      <div className="space-y-6">
        {allowBranchSelection && (
          <BranchSelection
            restaurantId={selectedRestaurant?.restaurantId}
            selectedBranchId={selectedBranch}
            onSelectBranch={(branch: BranchDTO) => {
              const branchIdStr = String(branch.branchId);
              const isValidUUID = (str: string): boolean => {
                const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
                return uuidRegex.test(str);
              };
              if (isValidUUID(branchIdStr)) {
                setSelectedBranch(branchIdStr);
                // Save to sessionStorage for persistence (for owner role)
                if (allowBranchSelection) {
                  sessionStorage.setItem('owner_selected_branch_id', branchIdStr);
                }
              }
            }}
            variant="compact"
            showFullDetails={false}
            title="Select Branch"
            description="Choose a branch to view its tables"
          />
        )}

        {!validBranchId ? (
          <div className="flex items-center justify-center min-h-[40vh]">
            <p className="text-muted-foreground">
              {allowBranchSelection ? 'Please select a branch to view tables' : 'Loading branch information...'}
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <div />
              {!hideAddButtons && (
                <div className="flex gap-2">
                  <Button
                    onClick={() => setIsAreaDialogOpen(true)}
                    className="transition-all duration-300 hover:scale-105 hover:shadow-lg"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Area
                  </Button>
                  <Button
                    onClick={() => { setInitialTableCount(apiTables.length); setIsAddTableOpen(true); }}
                    className="transition-all duration-300 hover:scale-105 hover:shadow-lg"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Table
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      const currentBranchId = validBranchId;
                      if (!currentBranchId || currentBranchId.trim() === '' || currentBranchId === 'undefined') {
                        toast({
                          variant: 'destructive',
                          title: 'Error',
                          description: 'Please select a branch first to view branch QR code.',
                        });
                        return;
                      }
                      setQrTable(null);
                      setIsQRDialogOpen(true);
                    }}
                    className="transition-all duration-300 hover:scale-105 hover:shadow-lg"
                  >
                    <QrCode className="mr-2 h-4 w-4" />
                    Branch QR
                  </Button>
                </div>
              )}
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <Card className="transition-all duration-300 hover:shadow-xl hover:scale-105">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Available</CardTitle>
                  <div className="h-3 w-3 rounded-full bg-green-500 animate-pulse" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{availableTables}</div>
                </CardContent>
              </Card>

              <Card className="transition-all duration-300 hover:shadow-xl hover:scale-105">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Occupied</CardTitle>
                  <div className="h-3 w-3 rounded-full bg-blue-500 animate-pulse" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{occupiedTables}</div>
                </CardContent>
              </Card>

              <Card className="transition-all duration-300 hover:shadow-xl hover:scale-105">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Out of Service</CardTitle>
                  <div className="h-3 w-3 rounded-full bg-gray-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{outOfServiceTables}</div>
                </CardContent>
              </Card>
            </div>

            <Card className="relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 pointer-events-none" />
              <CardHeader className="relative z-10">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                      Table Management by Floor
                    </CardTitle>
                    <CardDescription>
                      Manage table status, area status, and view reservations
                    </CardDescription>
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-3">
                  <Label className="text-sm font-medium whitespace-nowrap">Filter by Area:</Label>
                  <Select
                    value={selectedAreaId || 'all'}
                    onValueChange={(value) => {
                      setSelectedAreaId(value === 'all' ? null : value);
                    }}
                  >
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="All Areas" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Areas</SelectItem>
                      {areas.map((area) => (
                        <SelectItem key={area.areaId} value={area.areaId}>
                          {area.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent className="relative z-10">
                {apiTables.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Table2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No tables available</p>
                  </div>
                ) : (
                  <div className="space-y-8">
                    {sortedAreaEntries.map(([areaId, { areaName, tables: areaTables }], areaIndex) => {
                      const sortedTables = [...areaTables].sort((a, b) => {
                        const numA = parseInt(a.tag.match(/\d+/)?.[0] || '0');
                        const numB = parseInt(b.tag.match(/\d+/)?.[0] || '0');
                        if (numA && numB) return numA - numB;
                        return a.tag.localeCompare(b.tag);
                      });

                      return (
                        <div
                          key={areaId}
                          className="space-y-4"
                          style={{
                            animation: `fadeInScale 0.5s ease-out ${areaIndex * 0.1}s both`
                          }}
                        >
                          <div className="flex items-center gap-4">
                            <div className="bg-gradient-to-r from-primary/20 to-primary/10 rounded-lg px-5 py-2.5 shadow-sm">
                              <h3 className="text-lg font-semibold text-primary">{areaName}</h3>
                            </div>
                            <div className="flex-1 h-px bg-gradient-to-r from-border via-border/50 to-transparent" />
                            <Badge variant="secondary" className="text-sm">
                              {areaTables.length} table{areaTables.length !== 1 ? 's' : ''}
                            </Badge>
                            {!hideAddButtons && (
                              <Button
                                size="sm"
                                variant="destructive"
                                className="h-9 px-3 gap-2 hover:bg-destructive/90 transition-all duration-200 rounded-lg shadow-sm hover:shadow-md border border-destructive/20"
                                onClick={() => handleDeleteAreaClick(areaId, areaName)}
                                title="Delete Area"
                              >
                                <Trash2 className="w-4 h-4" />
                                <span className="text-xs font-semibold">Delete Area</span>
                              </Button>
                            )}
                          </div>

                          <div
                            className="grid gap-5"
                            style={{
                              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                            }}
                          >
                            {sortedTables.map((table, tableIndex) => (
                              <TableCard key={table.id} table={table} tableIndex={tableIndex} />
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={(open) => {
        setDialogOpen(open);
        if (!open) {
          setIsEditMode(false);
          setEditFormData(null);
        }
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader className="space-y-3">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1.5">
                <DialogTitle>Table Details</DialogTitle>
                <DialogDescription>
                  {isEditMode ? 'Edit table information' : 'View complete table information and reservations'}
                </DialogDescription>
              </div>
              <div className="flex-shrink-0">
                {!isEditMode && !disableStatusChange && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleEditClick}
                    className="gap-2"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit
                  </Button>
                )}
                {isEditMode && (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCancelEdit}
                      disabled={isStatusUpdating === selectedTable?.id}
                      className="gap-2"
                    >
                      <X className="w-4 h-4" />
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleSaveChanges}
                      disabled={isStatusUpdating === selectedTable?.id || !editFormData}
                      className="gap-2"
                    >
                      {isStatusUpdating === selectedTable?.id ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4" />
                          Save
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </DialogHeader>

          {selectedTable && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-muted-foreground">Table Name</Label>
                  <p className="font-semibold mt-1">{selectedTable.tag || (selectedTable as any).number || 'Unknown'}</p>
                  <p className="text-xs text-muted-foreground mt-1">Cannot be changed</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Area</Label>
                  {!isEditMode ? (
                    <p className="font-semibold mt-1">{selectedTable.areaName || areas.find(a => a.areaId === selectedTable.areaId)?.name || 'Unknown'}</p>
                  ) : (
                    <Select
                      value={editFormData?.areaId || ''}
                      onValueChange={(value) => {
                        setEditFormData(prev => prev ? { ...prev, areaId: value } : null);
                      }}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select area" />
                      </SelectTrigger>
                      <SelectContent>
                        {areas.map((area) => (
                          <SelectItem key={area.areaId} value={area.areaId}>
                            {area.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Capacity</Label>
                  {!isEditMode ? (
                    <p className="font-semibold mt-1">{selectedTable.capacity} guests</p>
                  ) : (
                    <Input
                      type="number"
                      min="1"
                      max="50"
                      value={editFormData?.capacity || 0}
                      onChange={(e) => {
                        const value = parseInt(e.target.value) || 0;
                        setEditFormData(prev => prev ? { ...prev, capacity: value } : null);
                      }}
                      className="mt-1"
                    />
                  )}
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Status</Label>
                  {!isEditMode ? (
                    <div className="mt-1">
                      <Badge className={getStatusColor(selectedTable.status)}>
                        {getStatusLabel(selectedTable.status)}
                      </Badge>
                    </div>
                  ) : (
                    <Select
                      value={getStatusDisplayValue(editFormData?.status || selectedTable.status)}
                      onValueChange={(value) => {
                        let apiStatus: TableStatus;
                        if (value === 'available') {
                          apiStatus = 'FREE';
                        } else if (value === 'occupied') {
                          apiStatus = 'OCCUPIED';
                        } else if (value === 'out_of_service') {
                          apiStatus = 'INACTIVE';
                        } else {
                          apiStatus = editFormData?.status || 'FREE';
                        }
                        setEditFormData(prev => prev ? { ...prev, status: apiStatus } : null);
                      }}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="available">
                          <div className="flex items-center gap-2">
                            <div className="h-2.5 w-2.5 rounded-full bg-green-500" />
                            Available
                          </div>
                        </SelectItem>
                        <SelectItem value="occupied">
                          <div className="flex items-center gap-2">
                            <div className="h-2.5 w-2.5 rounded-full bg-blue-500" />
                            Occupied
                          </div>
                        </SelectItem>
                        <SelectItem value="out_of_service">
                          <div className="flex items-center gap-2">
                            <div className="h-2.5 w-2.5 rounded-full bg-gray-500" />
                            Out of Service
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-muted-foreground mb-2">QR Code URL</p>
                  <div className="flex gap-2">
                    <Input
                      value={(() => {
                        // Use new URL format: /t/{branchId}/{tableId}
                        // This format is unique and prevents conflicts
                        const tableId = selectedTable.id || selectedTable.areaTableId || 'unknown';
                        const branchId = validBranchId || selectedTable.branchId || 'unknown';
                        return `${window.location.origin}/t/${branchId}/${tableId}`;
                      })()}
                      readOnly
                      className="font-mono text-xs"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        // Use new URL format: /t/{branchId}/{tableId}
                        const tableId = selectedTable.id || selectedTable.areaTableId || 'unknown';
                        const branchId = validBranchId || selectedTable.branchId || 'unknown';
                        const tableUrl = `${window.location.origin}/t/${branchId}/${tableId}`;

                        navigator.clipboard.writeText(tableUrl);
                        toast({ title: 'Copied!', description: 'URL copied to clipboard' });
                      }}
                    >
                      Copy
                    </Button>
                  </div>
                </div>
              </div>

              {(() => {
                const reservations = selectedTableReservationsQuery.data || [];
                const isLoading = selectedTableReservationsQuery.isLoading;
                if (isLoading) {
                  return (
                    <div className="border-t pt-6">
                      <p className="text-sm text-muted-foreground">Loading reservations...</p>
                    </div>
                  );
                }

                if (!reservations || reservations.length === 0) return null;

                const current = reservations[reservationIndex];

                return (
                  <div className="border-t pt-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-semibold flex items-center gap-2">
                        <Badge variant="secondary" className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100">
                          {reservations.length} Reservation{reservations.length > 1 ? 's' : ''}
                        </Badge>
                      </h4>
                      {reservations.length > 1 && (
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setReservationIndex(Math.max(0, reservationIndex - 1))}
                            disabled={reservationIndex === 0}
                          >
                            <ChevronLeft className="h-4 w-4" />
                          </Button>
                          <span className="text-sm text-muted-foreground">
                            {reservationIndex + 1} / {reservations.length}
                          </span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setReservationIndex(Math.min(reservations.length - 1, reservationIndex + 1))}
                            disabled={reservationIndex === reservations.length - 1}
                          >
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>

                    {current && (
                      <div className="bg-muted/30 rounded-lg p-4 space-y-3">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-muted-foreground">Guest Name</p>
                            <p className="font-semibold">{current.customerName || current.customerEmail || 'Unknown'}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Guests</p>
                            <p className="font-semibold">{current.guestNumber ?? current.guestNumber === 0 ? current.guestNumber : current.guestNumber ?? '-'}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Start Time</p>
                            <p className="font-semibold">
                              {current.startTime ? format(new Date(current.startTime), 'PPp') : '-'}
                            </p>
                          </div>
                          <div className="col-span-2">
                            <p className="text-sm text-muted-foreground">Contact</p>
                            <p className="text-sm">{current.customerEmail || '-'}</p>
                            <p className="text-sm">{current.customerPhone || '-'}</p>
                          </div>
                          {current.note && (
                            <div className="col-span-2">
                              <p className="text-sm text-muted-foreground">Notes</p>
                              <p className="text-sm">{current.note}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <TableDialog
        open={isAddTableOpen}
        onOpenChange={(open) => {
          if (!open) {
            if (tablesData && tablesData.content && tablesData.content.length > initialTableCount) {
              const latest = tablesData.content[tablesData.content.length - 1];
              const currentBranchId = validBranchId;
              if (currentBranchId && currentBranchId.trim() !== '' && currentBranchId !== 'undefined') {
                setQrTable(latest);
                setIsQRDialogOpen(true);
              } else {
                toast({
                  variant: 'destructive',
                  title: 'Warning',
                  description: 'Table created successfully, but QR code cannot be generated without a selected branch.',
                });
              }
            }
          }
          setIsAddTableOpen(open);
        }}
        branchId={validBranchId || ''}
        existingTables={existingTables}
      />

      <TableQRDialog
        open={isQRDialogOpen && !!qrTable}
        onOpenChange={(open) => {
          setIsQRDialogOpen(open);
          if (!open) setQrTable(null);
        }}
        table={qrTable}
      />

      <Dialog open={isAreaDialogOpen} onOpenChange={setIsAreaDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Area</DialogTitle>
            <DialogDescription>Create a new area/floor for this branch</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="areaName">Area Name *</Label>
              <Input
                id="areaName"
                value={areaName}
                onChange={(e) => setAreaName(e.target.value)}
                placeholder="e.g. Main Dining, Patio, Outdoor"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => {
                setIsAreaDialogOpen(false);
                setAreaName('');
              }}>Cancel</Button>
              <Button
                onClick={async () => {
                  if (!areaName.trim()) {
                    toast({
                      variant: 'destructive',
                      title: 'Error',
                      description: 'Area name is required',
                    });
                    return;
                  }
                  try {
                    const isValidUUID = (str: string): boolean => {
                      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
                      return uuidRegex.test(str);
                    };

                    if (!validBranchId || !isValidUUID(validBranchId)) {
                      toast({
                        variant: 'destructive',
                        title: 'Error',
                        description: `Invalid branchId format: ${validBranchId}. Please select a valid branch.`,
                      });
                      return;
                    }

                    // Check for duplicate area name before creating
                    const trimmedAreaName = areaName.trim();
                    const existingArea = areas.find(a =>
                      a.name.toLowerCase().trim() === trimmedAreaName.toLowerCase()
                    );

                    if (existingArea) {
                      toast({
                        variant: 'destructive',
                        title: 'Area already exists',
                        description: `An area with the name "${trimmedAreaName}" already exists. Please choose a different name.`,
                      });
                      return;
                    }

                    await createAreaMutation.mutateAsync({
                      branchId: validBranchId,
                      name: trimmedAreaName,
                    });
                    toast({
                      title: 'Area added',
                      description: 'New area has been created successfully.'
                    });
                    setAreaName('');
                    setIsAreaDialogOpen(false);
                  } catch (error: any) {
                    const errorMessage = error?.response?.data?.message
                      || error?.message
                      || 'Failed to create area. Please check if branchId is valid.';
                    toast({
                      variant: 'destructive',
                      title: 'Error',
                      description: errorMessage,
                    });
                  }
                }}
                disabled={createAreaMutation.isPending || !areaName.trim()}
              >
                {createAreaMutation.isPending ? 'Creating...' : 'Add Area'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isQRDialogOpen && !qrTable} onOpenChange={(open) => setIsQRDialogOpen(open)}>
      <DialogContent className="sm:max-w-md"> 
          <DialogHeader>
            <DialogTitle>Branch QR Code</DialogTitle>
            <DialogDescription>Scan to open the branch page</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center gap-4 py-4">
            {validBranchId ? (
              <>
                <div className="bg-white p-6 rounded-lg border-2 border-border mx-auto">
                  <QRCodeSVG value={`${window.location.origin}/branch/${validBranchId}`} size={200} />
                </div>
                <div className="text-sm font-mono select-all break-all text-center w-full px-4">
                  {`${window.location.origin}/branch/${validBranchId}`}
                </div>
              </>
            ) : (
              <div className="text-center text-muted-foreground">
                <p>Branch ID is missing. Cannot generate QR code.</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {(() => {
        const hasTable = !!qrTable;
        const hasBranchId = !!validBranchId && typeof validBranchId === 'string' && validBranchId.trim() !== '' && validBranchId !== 'undefined';
        const isDialogOpen = isQRDialogOpen;

        if (!isDialogOpen || !hasTable || !hasBranchId) {
          return null;
        }

        const branchIdValue = validBranchId;
        if (!branchIdValue || branchIdValue.trim() === '' || branchIdValue === 'undefined') {
          return null;
        }

        return (
          <TableQRDialog
            key={`qr-${qrTable?.id}-${branchIdValue}`}
            open={isDialogOpen}
            onOpenChange={(open) => {
              if (!open) {
                setIsQRDialogOpen(false);
                setQrTable(null);
              } else {
                const currentBranchId = validBranchId;
                if (!currentBranchId || currentBranchId.trim() === '' || currentBranchId === 'undefined') {
                  toast({
                    variant: 'destructive',
                    title: 'Error',
                    description: 'Please select a branch first to view QR code.',
                  });
                  setIsQRDialogOpen(false);
                  setQrTable(null);
                } else {
                  setIsQRDialogOpen(open);
                }
              }
            }}
            table={qrTable}
            branchId={branchIdValue}
          />
        );
      })()}

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <Trash2 className="w-5 h-5" />
              Delete Table
            </DialogTitle>
            <DialogDescription className="pt-2">
              Are you sure you want to delete <strong>"{tableToDelete?.name}"</strong>? This action cannot be undone and all associated data will be permanently removed.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setTableToDelete(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={isDeleteLoading === tableToDelete?.id}
            >
              {isDeleteLoading === tableToDelete?.id ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteAreaDialogOpen} onOpenChange={setIsDeleteAreaDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <Trash2 className="w-5 h-5" />
              Delete Area
            </DialogTitle>
            <DialogDescription className="pt-2">
              Are you sure you want to delete area <strong>"{areaToDelete?.name}"</strong>?
              {(() => {
                const areaTables = areaToDelete ? areaMap.get(areaToDelete.id)?.tables || [] : [];
                if (areaTables.length > 0) {
                  return ` This area has ${areaTables.length} table(s) that will be moved to "Undefined Area" after deletion.`;
                }
                return ' This action cannot be undone and the area will be permanently removed.';
              })()}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteAreaDialogOpen(false);
                setAreaToDelete(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDeleteArea}
              disabled={deleteAreaMutation.isPending}
            >
              {deleteAreaMutation.isPending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};