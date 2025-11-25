package com.example.backend.dto;

import com.example.backend.entities.ReportType;
import java.math.BigDecimal;

public class BranchAnalyticsDTO {
    private BigDecimal totalRevenue;
    private int totalOrders;
    private int completedOrders;
    private int cancelledOrders;
    private BigDecimal avgOrderValue;
    private ReportType timeframe;

    public BigDecimal getTotalRevenue() {
        return totalRevenue;
    }

    public void setTotalRevenue(BigDecimal totalRevenue) {
        this.totalRevenue = totalRevenue;
    }

    public int getTotalOrders() {
        return totalOrders;
    }

    public void setTotalOrders(int totalOrders) {
        this.totalOrders = totalOrders;
    }

    public int getCompletedOrders() {
        return completedOrders;
    }

    public void setCompletedOrders(int completedOrders) {
        this.completedOrders = completedOrders;
    }

    public int getCancelledOrders() {
        return cancelledOrders;
    }

    public void setCancelledOrders(int cancelledOrders) {
        this.cancelledOrders = cancelledOrders;
    }

    public BigDecimal getAvgOrderValue() {
        return avgOrderValue;
    }

    public void setAvgOrderValue(BigDecimal avgOrderValue) {
        this.avgOrderValue = avgOrderValue;
    }

    public ReportType getTimeframe() {
        return timeframe;
    }

    public void setTimeframe(ReportType timeframe) {
        this.timeframe = timeframe;
    }
}
