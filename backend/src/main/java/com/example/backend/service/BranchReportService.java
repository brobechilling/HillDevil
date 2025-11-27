package com.example.backend.service;

import com.example.backend.dto.BranchAnalyticsDTO;
import com.example.backend.entities.OrderStatus;
import com.example.backend.entities.ReportType;
import com.example.backend.repository.BranchReportRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.temporal.TemporalAdjusters;
import java.util.*;

@Service
public class BranchReportService {

    private static final ZoneId VIETNAM_TIMEZONE = ZoneId.of("Asia/Ho_Chi_Minh");

    private final BranchReportRepository branchReportRepository;

    public BranchReportService(BranchReportRepository branchReportRepository) {
        this.branchReportRepository = branchReportRepository;
    }

    public BranchAnalyticsDTO getBranchAnalytics(UUID branchId, ReportType reportType, LocalDate date) {
        // Calculate date range based on report type
        ZonedDateTime zonedDate = date.atStartOfDay(VIETNAM_TIMEZONE);
        Instant startDate;
        Instant endDate;

        switch (reportType) {
            case DAY:
                startDate = zonedDate.toInstant();
                endDate = zonedDate.plusDays(1).toInstant();
                break;
            case MONTH:
                startDate = zonedDate.with(TemporalAdjusters.firstDayOfMonth()).toInstant();
                endDate = zonedDate.with(TemporalAdjusters.firstDayOfNextMonth()).toInstant();
                break;
            case YEAR:
                startDate = zonedDate.with(TemporalAdjusters.firstDayOfYear()).toInstant();
                endDate = zonedDate.with(TemporalAdjusters.firstDayOfNextYear()).toInstant();
                break;
            default:
                throw new IllegalArgumentException("Invalid report type");
        }

        // Get order counts by status
        int eatingOrders = branchReportRepository.countOrdersByBranchAndStatusAndTimeframe(
                branchId, OrderStatus.EATING, startDate, endDate);
        int completedOrders = branchReportRepository.countOrdersByBranchAndStatusAndTimeframe(
                branchId, OrderStatus.COMPLETED, startDate, endDate);
        int cancelledOrders = branchReportRepository.countOrdersByBranchAndStatusAndTimeframe(
                branchId, OrderStatus.CANCELLED, startDate, endDate);
        
        int totalOrders = eatingOrders + completedOrders + cancelledOrders;

        // Get total revenue (COMPLETED orders only)
        BigDecimal totalRevenue = branchReportRepository.sumRevenueByBranchAndTimeframe(
                branchId, OrderStatus.COMPLETED, startDate, endDate);

        // Calculate average order value
        BigDecimal avgOrderValue = BigDecimal.ZERO;
        if (completedOrders > 0) {
            avgOrderValue = totalRevenue.divide(
                    BigDecimal.valueOf(completedOrders), 2, RoundingMode.HALF_UP);
        }

        BranchAnalyticsDTO dto = new BranchAnalyticsDTO();
        dto.setTotalRevenue(totalRevenue);
        dto.setTotalOrders(totalOrders);
        dto.setCompletedOrders(completedOrders);
        dto.setCancelledOrders(cancelledOrders);
        dto.setAvgOrderValue(avgOrderValue);
        dto.setTimeframe(reportType);

        return dto;
    }

    public List<Map<String, Object>> getRestaurantBranchPerformance(
        UUID restaurantId, 
        ReportType reportType, 
        LocalDate date
    ) {
        // Calculate date range
        ZonedDateTime zonedDate = date.atStartOfDay(VIETNAM_TIMEZONE);
        Instant startDate;
        Instant endDate;

        switch (reportType) {
            case DAY:
                startDate = zonedDate.toInstant();
                endDate = zonedDate.plusDays(1).toInstant();
                break;
            case MONTH:
                startDate = zonedDate.with(TemporalAdjusters.firstDayOfMonth()).toInstant();
                endDate = zonedDate.with(TemporalAdjusters.firstDayOfNextMonth()).toInstant();
                break;
            case YEAR:
                startDate = zonedDate.with(TemporalAdjusters.firstDayOfYear()).toInstant();
                endDate = zonedDate.with(TemporalAdjusters.firstDayOfNextYear()).toInstant();
                break;
            default:
                throw new IllegalArgumentException("Invalid report type");
        }

        List<Object[]> results = branchReportRepository.getRestaurantBranchPerformance(
            restaurantId,
            startDate,
            endDate
        );

        List<Map<String, Object>> branchPerformanceList = new ArrayList<>();
        BigDecimal totalRevenue = BigDecimal.ZERO;

        // Calculate total revenue first
        for (Object[] row : results) {
            BigDecimal revenue = row[2] != null ? new BigDecimal(row[2].toString()) : BigDecimal.ZERO;
            totalRevenue = totalRevenue.add(revenue);
        }

        // Build response with percentage
        for (Object[] row : results) {
            Map<String, Object> branchData = new HashMap<>();
            branchData.put("branchId", row[0] != null ? row[0].toString() : null);
            branchData.put("branchName", row[1] != null ? row[1].toString() : "Unknown");
            
            BigDecimal revenue = row[2] != null ? new BigDecimal(row[2].toString()) : BigDecimal.ZERO;
            branchData.put("totalRevenue", revenue);
            branchData.put("totalOrders", row[3] != null ? ((Number) row[3]).intValue() : 0);
            
            // Calculate percentage
            BigDecimal percentage = BigDecimal.ZERO;
            if (totalRevenue.compareTo(BigDecimal.ZERO) > 0) {
                percentage = revenue.multiply(BigDecimal.valueOf(100))
                    .divide(totalRevenue, 2, RoundingMode.HALF_UP);
            }
            branchData.put("percentage", percentage);

            branchPerformanceList.add(branchData);
        }

        return branchPerformanceList;
    }

    public Map<String, Object> getTodayStats(UUID branchId) {
        Map<String, Object> stats = new HashMap<>();

        // Get today's date range
        ZonedDateTime now = ZonedDateTime.now(VIETNAM_TIMEZONE);
        Instant todayStart = now.toLocalDate().atStartOfDay(VIETNAM_TIMEZONE).toInstant();
        Instant todayEnd = now.toLocalDate().plusDays(1).atStartOfDay(VIETNAM_TIMEZONE).toInstant();
        
        // Get yesterday's date range
        Instant yesterdayStart = now.toLocalDate().minusDays(1).atStartOfDay(VIETNAM_TIMEZONE).toInstant();
        Instant yesterdayEnd = todayStart;

        BigDecimal todayRevenue = branchReportRepository.getTodayRevenue(branchId, todayStart, todayEnd);
        BigDecimal yesterdayRevenue = branchReportRepository.getTodayRevenue(branchId, yesterdayStart, yesterdayEnd);
        int todayOrders = branchReportRepository.getTodayTotalOrders(branchId, todayStart, todayEnd);
        int todayCompletedOrders = branchReportRepository.getTodayCompletedOrders(branchId, todayStart, todayEnd);
        int totalMenuItemsSold = branchReportRepository.getTotalMenuItemsSold(branchId, todayStart, todayEnd);

        stats.put("todayRevenue", todayRevenue.doubleValue());
        stats.put("yesterdayRevenue", yesterdayRevenue.doubleValue());
        
        // Calculate percentage change
        double revenueChangePercent = 0.0;
        if (yesterdayRevenue.compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal change = todayRevenue.subtract(yesterdayRevenue)
                .divide(yesterdayRevenue, 4, RoundingMode.HALF_UP)
                .multiply(BigDecimal.valueOf(100));
            revenueChangePercent = change.setScale(1, RoundingMode.HALF_UP).doubleValue();
        }
        stats.put("revenueChangePercent", revenueChangePercent);
        
        stats.put("totalOrders", todayOrders);
        stats.put("totalMenuItemsSold", totalMenuItemsSold);
        
        // Calculate average order value
        double avgOrderValue = 0.0;
        if (todayCompletedOrders > 0) {
            avgOrderValue = todayRevenue.divide(
                BigDecimal.valueOf(todayCompletedOrders), 2, RoundingMode.HALF_UP
            ).doubleValue();
        }
        stats.put("averageOrderValue", avgOrderValue);

        return stats;
    }
}
