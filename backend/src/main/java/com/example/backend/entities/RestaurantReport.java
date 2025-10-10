package com.example.backend.entities;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "restaurant_report")
public class RestaurantReport {

    @Id
    @Column(name = "restaurant_report_id", nullable = false)
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID restaurantReportId;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(nullable = false, name = "restaurant_id")
    private Restaurant restaurant;

    @Enumerated(EnumType.STRING)
    @Column(name = "report_type")
    private ReportType reportType;

    // 1/10 : 00:00 will be monthly
    @Column(name = "create_date")
    private LocalDateTime createDate;

    @Column(name = "total_branches")
    private int totalBranches;

    @Column(name = "total_order")
    private int totalOrder;

    @Column(name = "completed_order")
    private int completedOrder;

    @Column(name = "cancelled_order")
    private int cancelledOrder;

    @Column(name = "total_revenue", precision = 10, scale = 2, nullable = false)
    private BigDecimal totalRevenue = BigDecimal.ZERO;

    @Column(name = "avg_revenue", precision = 10, scale = 2, nullable = false)
    private BigDecimal avgRevenue = BigDecimal.ZERO;

    public UUID getRestaurantReportId() {
        return restaurantReportId;
    }

    public void setRestaurantReportId(UUID restaurantReportId) {
        this.restaurantReportId = restaurantReportId;
    }

    public Restaurant getRestaurant() {
        return restaurant;
    }

    public void setRestaurant(Restaurant restaurant) {
        this.restaurant = restaurant;
    }

    public ReportType getReportType() {
        return reportType;
    }

    public void setReportType(ReportType reportType) {
        this.reportType = reportType;
    }

    public LocalDateTime getCreateDate() {
        return createDate;
    }

    public void setCreateDate(LocalDateTime createDate) {
        this.createDate = createDate;
    }

    public int getTotalBranches() {
        return totalBranches;
    }

    public void setTotalBranches(int totalBranches) {
        this.totalBranches = totalBranches;
    }

    public int getTotalOrder() {
        return totalOrder;
    }

    public void setTotalOrder(int totalOrder) {
        this.totalOrder = totalOrder;
    }

    public int getCompletedOrder() {
        return completedOrder;
    }

    public void setCompletedOrder(int completedOrder) {
        this.completedOrder = completedOrder;
    }

    public int getCancelledOrder() {
        return cancelledOrder;
    }

    public void setCancelledOrder(int cancelledOrder) {
        this.cancelledOrder = cancelledOrder;
    }

    public BigDecimal getTotalRevenue() {
        return totalRevenue;
    }

    public void setTotalRevenue(BigDecimal totalRevenue) {
        this.totalRevenue = totalRevenue;
    }

    public BigDecimal getAvgRevenue() {
        return avgRevenue;
    }

    public void setAvgRevenue(BigDecimal avgRevenue) {
        this.avgRevenue = avgRevenue;
    }

}
