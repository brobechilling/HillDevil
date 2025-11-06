import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useTables, useCreateTable, useDeleteTable, useTableQrCode } from '@/hooks/queries/useTables';
import { useBranches } from '@/hooks/queries/useBranches';
import { useAreas, useCreateArea } from '@/hooks/queries/useAreas';
import { toast } from '@/hooks/use-toast';
import { TableDTO } from '@/dto/table.dto';
import { Plus, Trash2, Download, Eye } from 'lucide-react';
import { axiosClient } from '@/api/axiosClient';
import { BranchSelection } from '@/components/common/BranchSelection';
import { BranchDTO } from '@/dto/branch.dto';
import { RestaurantDTO } from '@/dto/restaurant.dto';
import { getLocalStorageObject } from '@/utils/typeCast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useSessionStore } from '@/store/sessionStore';

// Tạo schema với validation dynamic cho duplicate name
const createTableSchema = z.object({
  capacity: z.coerce.number().min(1, 'Capacity must be at least 1'),
  areaId: z.string().min(1, 'Area is required'),
});

type CreateTableFormData = {
  capacity: number;
  areaId: string;
};

interface TableManagementReadOnlyByFloorProps {
  branchId?: string;
  allowBranchSelection?: boolean;
  hideTitle?: boolean; // Thêm prop để ẩn title nếu đã có title ở page level
  hideAddButtons?: boolean; // Thêm prop để ẩn Add Area và Add Table buttons
}

export const TableManagementReadOnlyByFloor = ({
  branchId: initialBranchId,
  allowBranchSelection = false,
  hideTitle = false,
  hideAddButtons = false,
}: TableManagementReadOnlyByFloorProps) => {
  const [selectedBranch, setSelectedBranch] = useState<string | undefined>(initialBranchId);
  const [isAnimating, setIsAnimating] = useState(false);
  const [hoveredTable, setHoveredTable] = useState<string | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isQrDialogOpen, setIsQrDialogOpen] = useState(false);
  const [selectedTableForQr, setSelectedTableForQr] = useState<TableDTO | null>(null);
  const [isDeleteLoading, setIsDeleteLoading] = useState<string | null>(null);
  const [isAreaDialogOpen, setIsAreaDialogOpen] = useState(false);
  const [areaName, setAreaName] = useState('');
  const { token } = useSessionStore();

  // Kiểm tra token trước khi gọi API
  const hasToken = useMemo(() => {
    return !!token && token.trim() !== '';
  }, []);

  const { data: branches = [] } = useBranches();
  
  // Chỉ gọi queries khi có token và branchId hợp lệ
  const validBranchId = useMemo(() => {
    return selectedBranch && selectedBranch.trim() !== '' ? selectedBranch : undefined;
  }, [selectedBranch]);
  
  const {
    data: tablesData,
    isLoading: isTablesLoading,
    error: tablesError,
  } = useTables(validBranchId);
  
  const { data: areas = [], error: areasError } = useAreas(validBranchId);
  const createAreaMutation = useCreateArea();

  // Log errors để debug
  useEffect(() => {
    if (tablesError) {
      if ((tablesError as any)?.response?.status !== 401) {
        console.warn('Tables query error:', tablesError);
      }
    }
    if (areasError) {
      if ((areasError as any)?.response?.status !== 401) {
        console.warn('Areas query error:', areasError);
      }
    }
  }, [tablesError, areasError]);
  
  const createTableMutation = useCreateTable();
  const deleteTableMutation = useDeleteTable();
  const { data: qrCodeUrl } = useTableQrCode(selectedTableForQr?.id);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateTableFormData>({
    resolver: zodResolver(createTableSchema),
    mode: 'onChange',
    reValidateMode: 'onChange',
  });

  const selectedAreaId = watch('areaId');

  // Function để extract số từ table tag (ví dụ: "Table 1" -> 1, "Table 10" -> 10)
  const extractTableNumber = (tag: string): number | null => {
    const match = tag.match(/(?:table|bàn)\s*(\d+)/i);
    return match ? parseInt(match[1], 10) : null;
  };

  // Tính số bàn tiếp theo dựa trên existing tables
  const getNextTableNumber = useMemo(() => {
    if (!tablesData?.content || tablesData.content.length === 0) {
      return 1; // Chưa có bàn nào, bắt đầu từ Table 1
    }
    
    // Extract tất cả số từ table tags
    const tableNumbers = tablesData.content
      .map(table => extractTableNumber(table.tag))
      .filter((num): num is number => num !== null);
    
    if (tableNumbers.length === 0) {
      return 1; // Không tìm thấy số nào, bắt đầu từ 1
    }
    
    // Tìm số lớn nhất và +1
    const maxNumber = Math.max(...tableNumbers);
    return maxNumber + 1;
  }, [tablesData?.content]);

  // Generate table tag tự động
  const autoGeneratedTag = useMemo(() => {
    return `Table ${getNextTableNumber}`;
  }, [getNextTableNumber]);

  // Auto-select first branch if enabled
  useEffect(() => {
    if (allowBranchSelection && !selectedBranch && branches.length > 0) {
      const timer = setTimeout(() => {
        if (branches[0]?.branchId) {
          setSelectedBranch(branches[0].branchId);
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [branches, selectedBranch, allowBranchSelection]);

  // Reset selectedBranch nếu là empty string
  useEffect(() => {
    if (selectedBranch === '') {
      setSelectedBranch(undefined);
    }
  }, [selectedBranch]);

  const handleBranchChange = (branchId: string) => {
    setIsAnimating(true);
    setTimeout(() => {
      setSelectedBranch(branchId);
      setTimeout(() => setIsAnimating(false), 50);
    }, 300);
  };

  const handleCreateTable = async (data: CreateTableFormData) => {
    try {
      // Sử dụng auto-generated tag thay vì từ form
      await createTableMutation.mutateAsync({
        areaId: data.areaId,
        tag: autoGeneratedTag, // Tự động generate table name
        capacity: data.capacity,
      });
      toast({
        title: 'Success',
        description: `Table "${autoGeneratedTag}" created successfully`,
      });
      setIsCreateDialogOpen(false);
      reset();
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to create table';
      toast({
        variant: 'destructive',
        title: 'Error',
        description: errorMessage,
      });
    }
  };

  const handleDeleteTable = async (tableId: string) => {
    setIsDeleteLoading(tableId);
    try {
      await deleteTableMutation.mutateAsync(tableId);
      toast({
        title: 'Success',
        description: 'Table deleted successfully',
      });
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message 
        || error?.message 
        || 'Failed to delete table';
      
      if (error?.response?.status === 401) {
        toast({
          variant: 'destructive',
          title: 'Authentication Error',
          description: 'Your session has expired. Please log in again.',
        });
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: errorMessage,
        });
      }
    } finally {
      setIsDeleteLoading(null);
    }
  };

  const handleViewQr = async (table: TableDTO) => {
    setSelectedTableForQr(table);
    setIsQrDialogOpen(true);
  };

  const handleDownloadQr = async (table: TableDTO) => {
    try {
      const response = await axiosClient.get(`/owner/tables/${table.id}/qr.png`, {
        params: { size: 512 },
        responseType: 'blob',
      });
      
      const blob = response.data;
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `table-${table.tag}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast({
        title: 'Success',
        description: 'QR code downloaded successfully',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to download QR code',
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'FREE':
        return 'default';
      case 'OCCUPIED':
        return 'destructive';
      case 'ACTIVE':
        return 'secondary';
      case 'INACTIVE':
        return 'outline';
      default:
        return 'default';
    }
  };

  // Group tables by AREA
  const areaMap = new Map<string, { areaName: string; tables: TableDTO[] }>();
  if (tablesData?.content) {
    tablesData.content.forEach((table) => {
      const areaId = table.areaId || 'unknown';
      const areaName = table.areaName || 'Unassigned';
      
      if (!areaMap.has(areaId)) {
        areaMap.set(areaId, { areaName, tables: [] });
      }
      areaMap.get(areaId)!.tables.push(table);
    });
  }

  // Sort by area name
  const sortedAreaEntries = Array.from(areaMap.entries()).sort((a, b) => 
    a[1].areaName.localeCompare(b[1].areaName)
  );
  
  const displayBranchId = allowBranchSelection 
    ? (selectedBranch && selectedBranch.trim() !== '' ? selectedBranch : undefined)
    : (initialBranchId && initialBranchId.trim() !== '' ? initialBranchId : undefined);

  // Get restaurant ID from localStorage to filter branches by restaurant
  const selectedRestaurant: RestaurantDTO | null = useMemo(() => {
    return getLocalStorageObject<RestaurantDTO>("selected_restaurant");
  }, []);

  return (
    <div className="space-y-6">
      {/* Branch Selection Section */}
      {allowBranchSelection && (
        <BranchSelection
          restaurantId={selectedRestaurant?.restaurantId}
          selectedBranchId={selectedBranch}
          onSelectBranch={(branch: BranchDTO) => {
            handleBranchChange(branch.branchId);
          }}
          variant="compact"
          showFullDetails={false}
          title="Select Branch"
          description="Choose a branch to view its tables"
        />
      )}

      {/* Table Management Section */}
      {displayBranchId && (
        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 pointer-events-none" />

          <CardHeader className="relative z-10">
            <div className="flex items-center justify-between">
              {!hideTitle && (
                <div>
                  <CardTitle className="text-2xl bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                    Table Management
                  </CardTitle>
                  <CardDescription>
                    {allowBranchSelection
                      ? 'Manage tables for selected branch'
                      : 'View and manage tables'}
                  </CardDescription>
                </div>
              )}
              {hideTitle && <div />}
              {!hideAddButtons && (
                <div className="flex gap-2">
                  <Button
                    onClick={() => setIsAreaDialogOpen(true)}
                    variant="outline"
                    className="gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add Area
                  </Button>
                  <Button
                    onClick={() => setIsCreateDialogOpen(true)}
                    className="gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add Table
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>

          <CardContent className="relative z-10">
            {isTablesLoading ? (
              <div className="flex items-center justify-center min-h-[300px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : tablesError ? (
              <div className="text-center py-12">
                <div className="text-destructive mb-4">
                  <svg
                    className="h-16 w-16 mx-auto"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4v2m0 4v2M7.08 6.47a7 7 0 1114.84 0M3.5 11a8.001 8.001 0 0116.98-.009"
                    />
                  </svg>
                </div>
                <p className="text-muted-foreground text-lg">
                  Failed to load tables
                </p>
              </div>
            ) : !tablesData?.content || tablesData.content.length === 0 ? (
              <div className="text-center py-12">
                <div className="animate-bounce inline-block">
                  <svg
                    className="h-16 w-16 text-muted-foreground/50"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                    />
                  </svg>
                </div>
                <p className="text-muted-foreground mt-4 text-lg">
                  No tables found
                </p>
                <p className="text-muted-foreground text-sm mt-2">
                  Click "Add Table" to create your first table
                </p>
              </div>
            ) : (
              <div
                className={`space-y-6 transition-all duration-300 ${
                  isAnimating ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'
                }`}
              >
                {sortedAreaEntries.map(([areaId, { areaName, tables }], areaIndex) => {
                  const sortedTables = tables.sort((a, b) =>
                    a.tag.localeCompare(b.tag)
                  );

                  return (
                    <div
                      key={areaId}
                      className="space-y-4"
                      style={{
                        animation: `slideInUp 0.5s ease-out ${areaIndex * 0.1}s both`,
                      }}
                    >
                      {/* Area Header */}
                      <div className="flex items-center gap-4">
                        <div className="relative bg-gradient-to-r from-primary to-primary/80 rounded-xl px-6 py-3 shadow-lg transform hover:scale-105 transition-transform duration-300">
                          <h3 className="text-xl font-bold text-primary-foreground">
                            {areaName}
                          </h3>
                          <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent rounded-xl opacity-50"></div>
                        </div>
                        <div className="flex-1 h-0.5 bg-gradient-to-r from-border to-transparent" />
                        <div className="bg-secondary/50 rounded-lg px-4 py-2 shadow-sm">
                          <span className="text-sm font-medium">
                            {tables.length} table{tables.length !== 1 ? 's' : ''}
                          </span>
                        </div>
                      </div>

                      {/* Tables Grid */}
                      <div className="grid gap-8 md:grid-cols-4 lg:grid-cols-6">
                        {sortedTables.map((table, tableIndex) => (
                          <div
                            key={table.id}
                            onMouseEnter={() => setHoveredTable(table.id)}
                            onMouseLeave={() => setHoveredTable(null)}
                            className="relative"
                            style={{
                              animation: `fadeInScale 0.4s ease-out ${
                                areaIndex * 0.1 + tableIndex * 0.05
                              }s both`,
                            }}
                          >
                            <Card
                              className={`
                                border-2 transition-all duration-300
                                ${
                                  hoveredTable === table.id
                                    ? 'border-primary shadow-2xl z-50'
                                    : 'border-border/50 hover:shadow-lg z-10'
                                }
                                ${
                                  table.status === 'OCCUPIED'
                                    ? 'bg-destructive/5'
                                    : ''
                                }
                              `}
                              style={{
                                position: 'relative',
                                width: '100%',
                                height: '140px',
                                transform: hoveredTable === table.id ? 'translateY(-4px) scale(1.02)' : 'translateY(0) scale(1)',
                                transition: 'all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)',
                                overflow: 'visible',
                                zIndex: hoveredTable === table.id ? 50 : 10,
                                willChange: 'transform',
                              }}
                            >
                              <CardContent 
                                className="relative pt-4 pb-3 h-full flex flex-col"
                                style={{
                                  overflow: 'visible',
                                }}
                              >
                                <div className="absolute top-0 right-0 w-12 h-12 bg-gradient-to-br from-primary/10 to-transparent rounded-bl-3xl pointer-events-none" />

                                <div className="space-y-2.5 relative flex-1">
                                  {/* Table Name */}
                                  <div className="w-full">
                                    <span 
                                      className="font-bold text-base bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent break-words"
                                    >
                                      {table.tag}
                                    </span>
                                  </div>

                                  {/* Status Badge */}
                                  <div className="flex items-center justify-start">
                                    <Badge
                                      variant={getStatusColor(table.status)}
                                      className="text-xs font-semibold w-fit"
                                    >
                                      {table.status}
                                    </Badge>
                                  </div>

                                  {/* Seats Info */}
                                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
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
                                      {table.capacity}{' '}
                                      {table.capacity === 1 ? 'seat' : 'seats'}
                                    </span>
                                  </div>
                                </div>

                                {/* Action Buttons Overlay */}
                                <div 
                                  className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-background/95 via-background/90 to-transparent backdrop-blur-sm rounded-b-lg"
                                  style={{
                                    opacity: hoveredTable === table.id ? 1 : 0,
                                    transform: hoveredTable === table.id ? 'translateY(0)' : 'translateY(10px)',
                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                    pointerEvents: hoveredTable === table.id ? 'auto' : 'none',
                                  }}
                                >
                                  <div className="flex gap-2 justify-center p-2 border-t border-border/30">
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="h-9 w-9 p-0 hover:bg-primary/10 hover:text-primary transition-colors"
                                      onClick={() => handleViewQr(table)}
                                      title="View QR Code"
                                      style={{
                                        transform: hoveredTable === table.id ? 'scale(1)' : 'scale(0.8)',
                                        opacity: hoveredTable === table.id ? 1 : 0,
                                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1) 0.05s',
                                      }}
                                    >
                                      <Eye className="w-4 h-4" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="h-9 w-9 p-0 hover:bg-primary/10 hover:text-primary transition-colors"
                                      onClick={() => handleDownloadQr(table)}
                                      title="Download QR Code"
                                      style={{
                                        transform: hoveredTable === table.id ? 'scale(1)' : 'scale(0.8)',
                                        opacity: hoveredTable === table.id ? 1 : 0,
                                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1) 0.1s',
                                      }}
                                    >
                                      <Download className="w-4 h-4" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="h-9 w-9 p-0 text-destructive hover:text-destructive hover:bg-destructive/10 transition-colors"
                                      onClick={() => handleDeleteTable(table.id)}
                                      disabled={isDeleteLoading === table.id}
                                      title="Delete Table"
                                      style={{
                                        transform: hoveredTable === table.id ? 'scale(1)' : 'scale(0.8)',
                                        opacity: hoveredTable === table.id ? 1 : 0,
                                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1) 0.15s',
                                      }}
                                    >
                                      {isDeleteLoading === table.id ? (
                                        <div className="w-4 h-4 border-2 border-destructive border-t-transparent rounded-full animate-spin" />
                                      ) : (
                                        <Trash2 className="w-4 h-4" />
                                      )}
                                    </Button>
                                  </div>
                                </div>

                                {hoveredTable === table.id && (
                                  <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent rounded-lg pointer-events-none" />
                                )}
                              </CardContent>
                            </Card>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Add Area Dialog */}
      <Dialog open={isAreaDialogOpen} onOpenChange={setIsAreaDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Area</DialogTitle>
            <DialogDescription>Create a new area for this branch</DialogDescription>
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
              <Button
                variant="outline"
                onClick={() => {
                  setIsAreaDialogOpen(false);
                  setAreaName('');
                }}
              >
                Cancel
              </Button>
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
                    // Validate branchId is UUID before calling API
                    const isValidUUID = (str: string): boolean => {
                      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
                      return uuidRegex.test(str);
                    };
                    
                    if (!validBranchId || !isValidUUID(validBranchId)) {
                      toast({
                        variant: 'destructive',
                        title: 'Error',
                        description: 'Invalid branchId. Please select a valid branch.',
                      });
                      return;
                    }
                    
                    await createAreaMutation.mutateAsync({
                      branchId: validBranchId,
                      name: areaName.trim(),
                    });
                    toast({
                      title: 'Area added',
                      description: 'New area has been created successfully.',
                    });
                    setAreaName('');
                    setIsAreaDialogOpen(false);
                  } catch (error: any) {
                    console.error('Create area error:', error);
                    const errorMessage =
                      error?.response?.data?.message ||
                      error?.message ||
                      'Failed to create area. Please check if branchId is valid.';
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

      {/* Create Table Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Table</DialogTitle>
            <DialogDescription>
              Add a new table to the selected area
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(handleCreateTable)} className="space-y-4">
            {/* Select Area */}
            <div className="space-y-2">
              <Label htmlFor="areaId">Area *</Label>
              <Select
                value={selectedAreaId}
                onValueChange={(value) => setValue('areaId', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select an area" />
                </SelectTrigger>
                <SelectContent>
                  {areas.map((area) => (
                    <SelectItem key={area.areaId} value={area.areaId}>
                      {area.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.areaId && (
                <p className="text-sm text-destructive">{errors.areaId.message}</p>
              )}
            </div>

            {/* Hiển thị table name sẽ được tự động generate */}
            <div className="space-y-2">
              <Label>Table Name</Label>
              <div className="px-3 py-2 bg-muted rounded-md text-sm font-medium">
                {autoGeneratedTag}
              </div>
              <p className="text-xs text-muted-foreground">
                Table name will be automatically generated
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="capacity">Capacity (people) *</Label>
              <Input
                {...register('capacity')}
                id="capacity"
                type="number"
                min="1"
                placeholder="e.g., 4"
              />
              {errors.capacity && (
                <p className="text-sm text-destructive">
                  {errors.capacity.message}
                </p>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createTableMutation.isPending}>
                {createTableMutation.isPending ? 'Creating...' : 'Create Table'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* QR Code Dialog */}
      <Dialog open={isQrDialogOpen} onOpenChange={setIsQrDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>QR Code for {selectedTableForQr?.tag}</DialogTitle>
            <DialogDescription>
              Scan this code to access the table menu
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col items-center gap-4 py-4">
            {qrCodeUrl ? (
              <img
                src={qrCodeUrl}
                alt="Table QR Code"
                className="w-48 h-48 border-2 border-border rounded-lg"
              />
            ) : (
              <div className="w-48 h-48 bg-muted rounded-lg flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            )}

            <Button
              onClick={() =>
                selectedTableForQr && handleDownloadQr(selectedTableForQr)
              }
              className="w-full"
            >
              <Download className="w-4 h-4 mr-2" />
              Download QR Code
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <style>{`
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeInScale {
          from {
            opacity: 0;
            transform: scale(0.8);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};