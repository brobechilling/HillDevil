import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BranchDTO } from '@/dto/branch.dto';
import { useBranches, useBranchesByRestaurant } from '@/hooks/queries/useBranches';
import { Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface BranchSelectionProps {
  /**
   * Restaurant ID - if provided, will use useBranchesByRestaurant, otherwise useBranches
   */
  restaurantId?: string;
  
  /**
   * Currently selected branch ID
   */
  selectedBranchId?: string;
  
  /**
   * Callback when a branch is selected
   */
  onSelectBranch: (branch: BranchDTO) => void;
  
  /**
   * Display variant: 'full' shows cards with all details, 'compact' shows compact buttons
   */
  variant?: 'full' | 'compact';
  
  /**
   * Whether to show full branch details (email, opening/closing times)
   */
  showFullDetails?: boolean;
  
  /**
   * Title text
   */
  title?: string;
  
  /**
   * Description text
   */
  description?: string;
  
  /**
   * Additional className for the container
   */
  className?: string;
}

export const BranchSelection = ({
  restaurantId,
  selectedBranchId,
  onSelectBranch,
  variant = 'full',
  showFullDetails = true,
  title = 'Select Branch',
  description = 'Choose a branch to continue',
  className,
}: BranchSelectionProps) => {
  const { data: branches, isLoading: isBranchesLoading } = restaurantId
    ? useBranchesByRestaurant(restaurantId)
    : useBranches();
  
  const branchesList = branches || [];

  if (isBranchesLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isBranchesLoading && branchesList.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-8">
        No branches found.
      </div>
    );
  }

  const isFull = variant === 'full';
  const gridCols = isFull 
    ? 'grid gap-4 md:grid-cols-2 lg:grid-cols-3'
    : 'grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4';

  return (
    <Card className={cn('relative overflow-hidden border-2 border-primary/20', className)}>
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10 pointer-events-none" />
      
      <CardHeader className="relative z-10">
        <CardTitle className="flex items-center gap-2 text-xl">
          {isFull ? (
            <Building2 className="h-6 w-6 text-primary" />
          ) : (
            <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
          )}
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>

      <CardContent className="relative z-10">
        <div className={gridCols}>
          {branchesList.map((branch, index) => {
            const isSelected = selectedBranchId === String(branch.branchId);
            const branchIdStr = String(branch.branchId);

            if (isFull) {
              // Full variant: Cards with all details
              return (
                <Card
                  key={branch.branchId}
                  className={cn(
                    'cursor-pointer transition-all duration-300',
                    isSelected
                      ? 'border-primary bg-primary/10 shadow-lg scale-105'
                      : 'hover:border-primary hover:shadow-md'
                  )}
                  onClick={() => onSelectBranch(branch)}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between mb-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Building2 className="h-6 w-6 text-primary" />
                      </div>
                      {isSelected && (
                        <div className="flex-shrink-0">
                          <div className="relative">
                            <span className="flex h-8 w-8">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-40"></span>
                              <span className="relative inline-flex rounded-full h-8 w-8 bg-primary items-center justify-center">
                                <svg
                                  className="w-5 h-5 text-primary-foreground"
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
                    <CardTitle className="text-xl">{branch.address}</CardTitle>
                    <CardDescription>Phone: {branch.branchPhone || 'No phone'}</CardDescription>
                    {showFullDetails && (
                      <>
                        <CardDescription>Email: {branch.mail || 'No mail'}</CardDescription>
                        <CardDescription>
                          Opening time: {branch.openingTime || 'No opening time'}
                        </CardDescription>
                        <CardDescription>
                          Closing time: {branch.closingTime || 'No closing time'}
                        </CardDescription>
                      </>
                    )}
                  </CardHeader>
                  <CardContent>
                    <Button className="w-full" variant="outline">
                      Select Branch
                    </Button>
                  </CardContent>
                </Card>
              );
            } else {
              // Compact variant: Buttons with minimal info
              return (
                <button
                  key={branch.branchId}
                  onClick={() => onSelectBranch(branch)}
                  className={cn(
                    'group relative p-6 rounded-xl text-left transition-all duration-500 transform',
                    isSelected
                      ? 'bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-2xl scale-105 ring-4 ring-primary/30'
                      : 'bg-card border-2 border-border hover:border-primary/50 hover:shadow-xl hover:scale-102'
                  )}
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
                          className={cn(
                            'font-bold text-lg mb-1 transition-colors',
                            isSelected ? 'text-primary-foreground' : 'text-foreground'
                          )}
                        >
                          {branch.address || `Branch ${branchIdStr.substring(0, 8)}`}
                        </h3>
                        <p
                          className={cn(
                            'text-sm',
                            isSelected ? 'text-primary-foreground/80' : 'text-muted-foreground'
                          )}
                        >
                          {branch.branchPhone || 'No phone'}
                        </p>
                      </div>

                      {isSelected && (
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
                        className={cn(
                          'flex items-center gap-1',
                          isSelected ? 'text-primary-foreground/70' : 'text-muted-foreground'
                        )}
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

                    {!isSelected && (
                      <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl pointer-events-none" />
                    )}
                  </div>

                  {isSelected && (
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-white/10 to-transparent opacity-50 pointer-events-none" />
                  )}
                </button>
              );
            }
          })}
        </div>
      </CardContent>
    </Card>
  );
};

