import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useTables, useCreateTable, useDeleteTable, useTableQrCode } from '@/hooks/queries/useTables';
import { useBranches } from '@/hooks/queries/useBranches';
import { useAreas } from '@/hooks/queries/useAreas'; // THÊM HOOK MỚI
import { toast } from '@/hooks/use-toast';
import { TableDTO } from '@/dto/table.dto';
import { Plus, Trash2, Download, Eye } from 'lucide-react';
import { axiosClient } from '@/api/axiosClient';
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

const createTableSchema = z.object({
  tag: z.string().min(1, 'Table name is required'),
  capacity: z.coerce.number().min(1, 'Capacity must be at least 1'),
  areaId: z.string().min(1, 'Area is required'),
});

type CreateTableFormData = z.infer<typeof createTableSchema>;

interface TableManagementReadOnlyByFloorProps {
  branchId?: string;
  allowBranchSelection?: boolean;
}

export const TableManagementReadOnlyByFloor = ({
  branchId: initialBranchId,
  allowBranchSelection = false,
}: TableManagementReadOnlyByFloorProps) => {
  const [selectedBranch, setSelectedBranch] = useState(initialBranchId || '');
  const [isAnimating, setIsAnimating] = useState(false);
  const [hoveredTable, setHoveredTable] = useState<string | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isQrDialogOpen, setIsQrDialogOpen] = useState(false);
  const [selectedTableForQr, setSelectedTableForQr] = useState<TableDTO | null>(null);
  const [isDeleteLoading, setIsDeleteLoading] = useState<string | null>(null);

  const { data: branches = [] } = useBranches();
  const {
    data: tablesData,
    isLoading: isTablesLoading,
    error: tablesError,
  } = useTables(selectedBranch);
  
  // THÊM: Lấy danh sách areas
  const { data: areas = [] } = useAreas(selectedBranch);
  
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
  });

  // Watch areaId để có thể control bằng Select
  const selectedAreaId = watch('areaId');

  // Auto-select first branch if enabled
  useEffect(() => {
    if (allowBranchSelection && !selectedBranch && branches.length > 0) {
      setSelectedBranch(branches[0].branchId);
    }
  }, [branches, selectedBranch, allowBranchSelection]);

  const handleBranchChange = (branchId: string) => {
    setIsAnimating(true);
    setTimeout(() => {
      setSelectedBranch(branchId);
      setTimeout(() => setIsAnimating(false), 50);
    }, 300);
  };

  const handleCreateTable = async (data: CreateTableFormData) => {
    try {
      await createTableMutation.mutateAsync({
        areaId: data.areaId,
        tag: data.tag,
        capacity: data.capacity,
      });
      toast({
        title: 'Success',
        description: 'Table created successfully',
      });
      setIsCreateDialogOpen(false);
      reset();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to create table',
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
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to delete table',
      });
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
      // Use axiosClient instead of fetch to include Authorization header
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

  // THAY ĐỔI: Group tables by AREA thay vì floor
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

  // THAY ĐỔI: Sort by area name
  const sortedAreaEntries = Array.from(areaMap.entries()).sort((a, b) => 
    a[1].areaName.localeCompare(b[1].areaName)
  );
  
  const displayBranchId = allowBranchSelection ? selectedBranch : initialBranchId;

  return (
    <div className="space-y-6">
      {/* Branch Selection Section */}
      {allowBranchSelection && branches.length > 0 && (
        <Card className="relative overflow-hidden border-2 border-primary/20">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10 pointer-events-none" />

          <CardHeader className="relative z-10">
            <CardTitle className="flex items-center gap-2 text-xl">
              <svg
                className="w-6 h-6 text-primary"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
              Select Branch
            </CardTitle>
            <CardDescription>Choose a branch to view its tables</CardDescription>
          </CardHeader>

          <CardContent className="relative z-10">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {branches.map((branch, index) => (
                <button
                  key={branch.branchId}
                  onClick={() => handleBranchChange(branch.branchId)}
                  className={`
                    group relative p-6 rounded-xl text-left
                    transition-all duration-500 transform
                    ${
                      selectedBranch === branch.branchId
                        ? 'bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-2xl scale-105 ring-4 ring-primary/30'
                        : 'bg-card border-2 border-border hover:border-primary/50 hover:shadow-xl hover:scale-102'
                    }
                  `}
                  style={{
                    animation: `fadeInUp 0.5s ease-out ${index * 0.1}s both`,
                  }}
                >
                  <div className="absolute inset-0 opacity-10">
                    <div
                      className="absolute inset-0"
                      style={{
                        backgroundImage:
                          'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)',
                        backgroundSize: '24px 24px',
                      }}
                    />
                  </div>

                  <div className="relative z-10 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3
                          className={`font-bold text-lg mb-1 transition-colors ${
                            selectedBranch === branch.branchId
                              ? 'text-primary-foreground'
                              : 'text-foreground'
                          }`}
                        >
                          Branch {branch.branchId.substring(0, 8)}
                        </h3>
                        <p
                          className={`text-sm ${
                            selectedBranch === branch.branchId
                              ? 'text-primary-foreground/80'
                              : 'text-muted-foreground'
                          }`}
                        >
                          {branch.address || 'No address'}
                        </p>
                      </div>

                      {selectedBranch === branch.branchId && (
                        <div className="flex-shrink-0">
                          <div className="relative">
                            <span className="flex h-8 w-8">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-foreground opacity-40"></span>
                              <span className="relative inline-flex rounded-full h-8 w-8 bg-primary-foreground items-center justify-center">
                                <svg
                                  className="w-5 h-5 text-primary"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              </span>
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-3 text-xs">
                      <div
                        className={`flex items-center gap-1 ${
                          selectedBranch === branch.branchId
                            ? 'text-primary-foreground/70'
                            : 'text-muted-foreground'
                        }`}
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                          />
                        </svg>
                        <span>{branch.branchPhone || 'N/A'}</span>
                      </div>
                    </div>

                    {selectedBranch !== branch.branchId && (
                      <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl pointer-events-none" />
                    )}
                  </div>

                  {selectedBranch === branch.branchId && (
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-white/10 to-transparent opacity-50 pointer-events-none" />
                  )}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Table Management Section */}
      {displayBranchId && (
        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 pointer-events-none" />

          <CardHeader className="relative z-10">
            <div className="flex items-center justify-between">
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
              <Button
                onClick={() => setIsCreateDialogOpen(true)}
                className="gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Table
              </Button>
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
                {/* THAY ĐỔI: Loop qua areas thay vì floors */}
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
                      {/* THAY ĐỔI: Area Header thay vì Floor Header */}
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

                      {/* Tables Grid - GIỮ NGUYÊN */}
                      <div className="grid gap-4 md:grid-cols-4 lg:grid-cols-6">
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
                                    ? 'border-primary shadow-xl scale-105 -translate-y-2'
                                    : 'border-border/50 hover:shadow-lg'
                                }
                                ${
                                  table.status === 'OCCUPIED'
                                    ? 'bg-destructive/5'
                                    : ''
                                }
                              `}
                            >
                              <CardContent className="pt-4 pb-3 relative">
                                <div className="absolute top-0 right-0 w-12 h-12 bg-gradient-to-br from-primary/10 to-transparent rounded-bl-3xl" />

                                <div className="space-y-3 relative">
                                  <div className="flex items-center justify-between">
                                    <span className="font-bold text-lg bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                                      {table.tag}
                                    </span>
                                    <Badge
                                      variant={getStatusColor(table.status)}
                                      className={`
                                        text-xs font-semibold transition-transform duration-300
                                        ${hoveredTable === table.id ? 'scale-110' : ''}
                                      `}
                                    >
                                      {table.status}
                                    </Badge>
                                  </div>

                                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <svg
                                      className="w-4 h-4"
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

                                  {/* Action Buttons */}
                                  {hoveredTable === table.id && (
                                    <div className="pt-2 border-t border-border/50 flex gap-1">
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        className="h-7 px-2 flex-1"
                                        onClick={() => handleViewQr(table)}
                                      >
                                        <Eye className="w-3 h-3 mr-1" />
                                        QR
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        className="h-7 px-2 flex-1"
                                        onClick={() => handleDownloadQr(table)}
                                      >
                                        <Download className="w-3 h-3 mr-1" />
                                        DL
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        className="h-7 px-2 flex-1 text-destructive hover:text-destructive"
                                        onClick={() => handleDeleteTable(table.id)}
                                        disabled={isDeleteLoading === table.id}
                                      >
                                        <Trash2 className="w-3 h-3 mr-1" />
                                        {isDeleteLoading === table.id ? '...' : 'Del'}
                                      </Button>
                                    </div>
                                  )}
                                </div>

                                {hoveredTable === table.id && (
                                  <div className="absolute inset-0 bg-gradient-to-t from-primary/10 to-transparent rounded-lg pointer-events-none" />
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

      {/* THAY ĐỔI: Create Table Dialog - Sử dụng Select cho Area */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Table</DialogTitle>
            <DialogDescription>
              Add a new table to the selected area
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(handleCreateTable)} className="space-y-4">
            {/* THAY ĐỔI: Select Area thay vì Input */}
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

            <div className="space-y-2">
              <Label htmlFor="tag">Table Name/Tag *</Label>
              <Input
                {...register('tag')}
                id="tag"
                placeholder="e.g., Table 1, Window Seat A"
              />
              {errors.tag && (
                <p className="text-sm text-destructive">{errors.tag.message}</p>
              )}
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

      {/* QR Code Dialog - GIỮ NGUYÊN */}
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