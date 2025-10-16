import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useTableStore } from '@/store/tableStore';

interface TableManagementReadOnlyByFloorProps {
  branchId?: string;
  allowBranchSelection?: boolean; // New prop to enable branch selection
}

export const TableManagementReadOnlyByFloor = ({ 
  branchId: initialBranchId,
  allowBranchSelection = false 
}: TableManagementReadOnlyByFloorProps) => {
  const [selectedBranch, setSelectedBranch] = useState(initialBranchId || '');
  const [isAnimating, setIsAnimating] = useState(false);
  const [hoveredTable, setHoveredTable] = useState<string | null>(null);
  
  const getTablesByBranchAndFloor = useTableStore((state) => state.getTablesByBranchAndFloor);
  const storeBranches = useTableStore((state) => state.branches);
  const allTables = useTableStore((state) => state.tables);
  
  // Extract unique branches from tables if store branches is empty
  const branches = storeBranches.length > 0 
    ? storeBranches 
    : (() => {
        const branchMap = new Map<string, { branch_id: string; address: string; branch_phone: string }>();
        
        allTables.forEach((table) => {
          if (table.branchId && !branchMap.has(table.branchId)) {
            branchMap.set(table.branchId, {
              branch_id: table.branchId,
              address: `Branch ${table.branchId}`,
              branch_phone: 'N/A'
            });
          }
        });
        
        return Array.from(branchMap.values());
      })();
  
  const floorMap = selectedBranch ? getTablesByBranchAndFloor(selectedBranch) : new Map();

  // Auto-select first branch if no branch selected and branch selection is enabled
  useEffect(() => {
    if (allowBranchSelection && !selectedBranch && branches.length > 0) {
      setSelectedBranch(branches[0].branch_id);
    }
  }, [branches, selectedBranch, allowBranchSelection]);

  const handleBranchChange = (branchId: string) => {
    setIsAnimating(true);
    setTimeout(() => {
      setSelectedBranch(branchId);
      setTimeout(() => setIsAnimating(false), 50);
    }, 300);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'default';
      case 'occupied':
        return 'destructive';
      case 'reserved':
        return 'secondary';
      default:
        return 'default';
    }
  };

  const sortedFloors = Array.from(floorMap.keys()).sort((a, b) => a - b);
  
  // Use either selected branch or initial branchId
  const displayBranchId = allowBranchSelection ? selectedBranch : initialBranchId;

  return (
    <div className="space-y-6">
      {/* Branch Selection Section - Only shown when allowBranchSelection is true */}
      {allowBranchSelection && branches.length > 0 && (
        <Card className="relative overflow-hidden border-2 border-primary/20">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10 pointer-events-none" />
          
          <CardHeader className="relative z-10">
            <CardTitle className="flex items-center gap-2 text-xl">
              <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              Select Branch
            </CardTitle>
            <CardDescription>Choose a branch to view its table layout</CardDescription>
          </CardHeader>
          
          <CardContent className="relative z-10">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {branches.map((branch, index) => (
                <button
                  key={branch.branch_id}
                  onClick={() => handleBranchChange(branch.branch_id)}
                  className={`
                    group relative p-6 rounded-xl text-left
                    transition-all duration-500 transform
                    ${selectedBranch === branch.branch_id 
                      ? 'bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-2xl scale-105 ring-4 ring-primary/30' 
                      : 'bg-card border-2 border-border hover:border-primary/50 hover:shadow-xl hover:scale-102'
                    }
                  `}
                  style={{
                    animation: `fadeInUp 0.5s ease-out ${index * 0.1}s both`
                  }}
                >
                  {/* Background Pattern */}
                  <div className="absolute inset-0 opacity-10">
                    <div className="absolute inset-0" style={{
                      backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)',
                      backgroundSize: '24px 24px'
                    }} />
                  </div>
                  
                  {/* Content */}
                  <div className="relative z-10 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className={`font-bold text-lg mb-1 transition-colors ${
                          selectedBranch === branch.branch_id ? 'text-primary-foreground' : 'text-foreground'
                        }`}>
                          Branch {branch.branch_id}
                        </h3>
                        <p className={`text-sm ${
                          selectedBranch === branch.branch_id ? 'text-primary-foreground/80' : 'text-muted-foreground'
                        }`}>
                          {branch.address || 'No address'}
                        </p>
                      </div>
                      
                      {selectedBranch === branch.branch_id && (
                        <div className="flex-shrink-0">
                          <div className="relative">
                            <span className="flex h-8 w-8">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-foreground opacity-40"></span>
                              <span className="relative inline-flex rounded-full h-8 w-8 bg-primary-foreground items-center justify-center">
                                <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              </span>
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Branch Info */}
                    <div className="flex items-center gap-3 text-xs">
                      <div className={`flex items-center gap-1 ${
                        selectedBranch === branch.branch_id ? 'text-primary-foreground/70' : 'text-muted-foreground'
                      }`}>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        <span>{branch.branch_phone || 'N/A'}</span>
                      </div>
                    </div>
                    
                    {/* Hover Indicator */}
                    {selectedBranch !== branch.branch_id && (
                      <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl pointer-events-none" />
                    )}
                  </div>
                  
                  {/* Selection Glow Effect */}
                  {selectedBranch === branch.branch_id && (
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-white/10 to-transparent opacity-50 pointer-events-none" />
                  )}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Table Layout Display */}
      {displayBranchId && (
        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 pointer-events-none" />
          
          <CardHeader className="relative z-10">
            <CardTitle className="text-2xl bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Table Layout (By Floor)
            </CardTitle>
            <CardDescription>
              {allowBranchSelection 
                ? 'Viewing tables for selected branch' 
                : 'View tables organized by floor - read-only'
              }
            </CardDescription>
          </CardHeader>
          
          <CardContent className="relative z-10">
            {sortedFloors.length === 0 ? (
              <div className="text-center py-12">
                <div className="animate-bounce inline-block">
                  <svg className="h-16 w-16 text-muted-foreground/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                </div>
                <p className="text-muted-foreground mt-4 text-lg">No tables found for this branch</p>
              </div>
            ) : (
              <div 
                className={`space-y-8 transition-all duration-300 ${
                  isAnimating ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'
                }`}
              >
                {sortedFloors.map((floor, floorIndex) => {
                  const tables = floorMap.get(floor) || [];
                  const sortedTables = tables.sort((a, b) => a.number - b.number);
                  
                  return (
                    <div 
                      key={floor} 
                      className="space-y-4"
                      style={{
                        animation: `slideInUp 0.5s ease-out ${floorIndex * 0.1}s both`
                      }}
                    >
                      {/* Floor Header */}
                      <div className="flex items-center gap-4">
                        <div className="relative bg-gradient-to-r from-primary to-primary/80 rounded-xl px-6 py-3 shadow-lg transform hover:scale-105 transition-transform duration-300">
                          <h3 className="text-xl font-bold text-primary-foreground">Floor {floor}</h3>
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
                      <div className="grid gap-4 md:grid-cols-4 lg:grid-cols-6">
                        {sortedTables.map((table, tableIndex) => (
                          <div
                            key={table.id}
                            onMouseEnter={() => setHoveredTable(table.id)}
                            onMouseLeave={() => setHoveredTable(null)}
                            className="relative"
                            style={{
                              animation: `fadeInScale 0.4s ease-out ${(floorIndex * 0.1) + (tableIndex * 0.05)}s both`
                            }}
                          >
                            <Card 
                              className={`
                                border-2 transition-all duration-300 cursor-pointer
                                ${hoveredTable === table.id 
                                  ? 'border-primary shadow-xl scale-105 -translate-y-2' 
                                  : 'border-border/50 hover:shadow-lg'
                                }
                                ${table.status === 'occupied' ? 'bg-destructive/5' : ''}
                                ${table.status === 'reserved' ? 'bg-secondary/10' : ''}
                              `}
                            >
                              <CardContent className="pt-4 pb-3 relative">
                                {/* Decorative corner */}
                                <div className="absolute top-0 right-0 w-12 h-12 bg-gradient-to-br from-primary/10 to-transparent rounded-bl-3xl" />
                                
                                <div className="space-y-3 relative">
                                  <div className="flex items-center justify-between">
                                    <span className="font-bold text-lg bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                                      T{table.number}
                                    </span>
                                    <div className="flex flex-col gap-1.5 items-end">
                                      <Badge 
                                        variant={getStatusColor(table.status)} 
                                        className={`
                                          text-xs font-semibold transition-transform duration-300
                                          ${hoveredTable === table.id ? 'scale-110' : ''}
                                        `}
                                      >
                                        {table.status}
                                      </Badge>
                                      {table.reservationStart && (
                                        <Badge 
                                          variant="secondary" 
                                          className="text-xs bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100 animate-pulse"
                                        >
                                          Reserved
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                  
                                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                    <span className="font-medium">
                                      {table.capacity} {table.capacity === 1 ? 'seat' : 'seats'}
                                    </span>
                                  </div>
                                  
                                  {table.reservationName && (
                                    <div className="pt-2 border-t border-border/50">
                                      <p className="text-xs text-muted-foreground truncate flex items-center gap-1">
                                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                        {table.reservationName}
                                      </p>
                                    </div>
                                  )}
                                </div>
                                
                                {/* Hover effect overlay */}
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
      
      {/* No Branch Selected Message */}
      {allowBranchSelection && !selectedBranch && branches.length === 0 && (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <div className="animate-pulse inline-block">
                <svg className="h-16 w-16 text-muted-foreground/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <p className="text-muted-foreground mt-4 text-lg">No branches available</p>
            </div>
          </CardContent>
        </Card>
      )}
      
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