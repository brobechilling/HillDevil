export interface BranchAnalyticsDTO {
    totalRevenue: number;
    totalOrders: number;
    completedOrders: number;
    cancelledOrders: number;
    avgOrderValue: number;
    timeframe: 'DAY' | 'MONTH' | 'YEAR' | 'DAILY' | 'MONTHLY' | 'YEARLY';
}

export interface TopSellingItemDTO {
    menuItemId: string;
    menuItemName: string;
    quantitySold: number;
    totalRevenue: number;
}

export interface OrderDistributionDTO {
    hour: number;
    orderCount: number;
}

export interface BranchPerformanceDTO {
    branchId: string;
    branchName: string;
    totalRevenue: number;
    totalOrders: number;
    percentage: number;
}

export interface RestaurantAnalyticsDTO {
    totalRevenue: number;
    totalOrders: number;
    completedOrders: number;
    cancelledOrders: number;
    avgOrderValue: number;
    timeframe: 'DAILY' | 'MONTHLY' | 'YEARLY';
}

export interface TopSpenderDTO {
    userId: string;
    userName: string;
    totalSpent: number;
    orderCount: number;
}

export interface BranchTodayStatsDTO {
    todayRevenue: number;
    yesterdayRevenue: number;
    revenueChangePercent: number;
    totalOrders: number;
    averageOrderValue: number;
    totalMenuItemsSold: number;
}
