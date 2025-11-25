export interface BranchAnalyticsDTO {
    totalRevenue: number;
    totalOrders: number;
    completedOrders: number;
    cancelledOrders: number;
    avgOrderValue: number;
    timeframe: 'DAY' | 'MONTH' | 'YEAR';
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
