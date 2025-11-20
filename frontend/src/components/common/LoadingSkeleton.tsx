/**
 * Shared loading skeleton component
 * Provides consistent loading states across the application
 */

import { cn } from "@/lib/utils";

interface LoadingSkeletonProps {
  className?: string;
  variant?: "text" | "card" | "circle" | "button" | "table";
  rows?: number;
}

export const Skeleton = ({ className }: { className?: string }) => {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-muted",
        className
      )}
    />
  );
};

export const TextSkeleton = ({ 
  className, 
  rows = 1 
}: { 
  className?: string; 
  rows?: number;
}) => {
  return (
    <div className={cn("space-y-2", className)}>
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton 
          key={i} 
          className={cn(
            "h-4",
            i === rows - 1 && rows > 1 ? "w-3/4" : "w-full"
          )} 
        />
      ))}
    </div>
  );
};


export const CardSkeleton = ({ className }: { className?: string }) => {
  return (
    <div className={cn("rounded-lg border bg-card p-6 space-y-4", className)}>
      <Skeleton className="h-6 w-1/3" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
      <div className="flex gap-2 pt-2">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-24" />
      </div>
    </div>
  );
};


export const CircleSkeleton = ({ 
  className,
  size = "md" 
}: { 
  className?: string;
  size?: "sm" | "md" | "lg";
}) => {
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-12 w-12",
    lg: "h-16 w-16"
  };

  return (
    <Skeleton 
      className={cn(
        "rounded-full",
        sizeClasses[size],
        className
      )} 
    />
  );
};


export const ButtonSkeleton = ({ className }: { className?: string }) => {
  return <Skeleton className={cn("h-10 w-24 rounded-md", className)} />;
};

export const TableSkeleton = ({ 
  rows = 5,
  columns = 4,
  className 
}: { 
  rows?: number;
  columns?: number;
  className?: string;
}) => {
  return (
    <div className={cn("space-y-3", className)}>
      {/* Header */}
      <div className="flex gap-4 pb-2 border-b">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={`header-${i}`} className="h-4 flex-1" />
        ))}
      </div>
      
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={`row-${rowIndex}`} className="flex gap-4 py-2">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton 
              key={`cell-${rowIndex}-${colIndex}`} 
              className="h-4 flex-1" 
            />
          ))}
        </div>
      ))}
    </div>
  );
};


const LoadingSkeleton = ({ 
  className, 
  variant = "text",
  rows = 3
}: LoadingSkeletonProps) => {
  switch (variant) {
    case "card":
      return <CardSkeleton className={className} />;
    case "circle":
      return <CircleSkeleton className={className} />;
    case "button":
      return <ButtonSkeleton className={className} />;
    case "table":
      return <TableSkeleton rows={rows} className={className} />;
    case "text":
    default:
      return <TextSkeleton rows={rows} className={className} />;
  }
};

export default LoadingSkeleton;
