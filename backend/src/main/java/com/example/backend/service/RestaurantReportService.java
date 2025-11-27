package com.example.backend.service;

import com.example.backend.dto.BranchAnalyticsDTO;
import com.example.backend.dto.OrderDistributionDTO;
import com.example.backend.dto.TopSellingItemDTO;
import com.example.backend.entities.OrderStatus;
import com.example.backend.entities.ReportType;
import com.example.backend.repository.BranchRepository;
import com.example.backend.repository.OrderRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.temporal.TemporalAdjusters;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class RestaurantReportService {

    private static final ZoneId VIETNAM_TIMEZONE = ZoneId.of("Asia/Ho_Chi_Minh");

    private final OrderRepository orderRepository;
    private final BranchRepository branchRepository;

    public RestaurantReportService(OrderRepository orderRepository, BranchRepository branchRepository) {
        this.orderRepository = orderRepository;
        this.branchRepository = branchRepository;
    }

    /**
     * Get restaurant-wide analytics aggregated from all active branches
     */
    @Transactional(readOnly = true)
    public BranchAnalyticsDTO getRestaurantAnalytics(UUID restaurantId, ReportType timeframe) {
        // Calculate date range based on timeframe
        ZonedDateTime now = ZonedDateTime.now(VIETNAM_TIMEZONE);
        Instant startDate;
        Instant endDate;

        switch (timeframe) {
            case DAY:
                startDate = now.toLocalDate().atStartOfDay(VIETNAM_TIMEZONE).toInstant();
                endDate = now.toLocalDate().plusDays(1).atStartOfDay(VIETNAM_TIMEZONE).toInstant();
                break;
            case MONTH:
                startDate = now.with(TemporalAdjusters.firstDayOfMonth())
                        .toLocalDate().atStartOfDay(VIETNAM_TIMEZONE).toInstant();
                endDate = now.with(TemporalAdjusters.firstDayOfNextMonth())
                        .toLocalDate().atStartOfDay(VIETNAM_TIMEZONE).toInstant();
                break;
            case YEAR:
                startDate = now.with(TemporalAdjusters.firstDayOfYear())
                        .toLocalDate().atStartOfDay(VIETNAM_TIMEZONE).toInstant();
                endDate = now.with(TemporalAdjusters.firstDayOfNextYear())
                        .toLocalDate().atStartOfDay(VIETNAM_TIMEZONE).toInstant();
                break;
            default:
                throw new IllegalArgumentException("Invalid timeframe: " + timeframe);
        }

        // Get all active branches for this restaurant
        List<com.example.backend.entities.Branch> branches = branchRepository.findByRestaurant_RestaurantIdAndIsActiveTrue(restaurantId);
        
        // Aggregate data from all branches
        BigDecimal totalRevenue = BigDecimal.ZERO;
        int totalOrders = 0;
        int completedOrders = 0;
        int cancelledOrders = 0;
        int eatingOrders = 0;

        for (com.example.backend.entities.Branch branch : branches) {
            UUID branchId = branch.getBranchId();
            
            eatingOrders += orderRepository.countOrdersByBranchAndStatusAndTimeframe(
                    branchId, OrderStatus.EATING, startDate, endDate);
            completedOrders += orderRepository.countOrdersByBranchAndStatusAndTimeframe(
                    branchId, OrderStatus.COMPLETED, startDate, endDate);
            cancelledOrders += orderRepository.countOrdersByBranchAndStatusAndTimeframe(
                    branchId, OrderStatus.CANCELLED, startDate, endDate);
            
            BigDecimal branchRevenue = orderRepository.sumRevenueByBranchAndTimeframe(
                    branchId, OrderStatus.COMPLETED, startDate, endDate);
            totalRevenue = totalRevenue.add(branchRevenue);
        }

        totalOrders = eatingOrders + completedOrders + cancelledOrders;

        // Calculate average order value
        BigDecimal avgOrderValue = BigDecimal.ZERO;
        if (completedOrders > 0) {
            avgOrderValue = totalRevenue.divide(
                    BigDecimal.valueOf(completedOrders), 2, RoundingMode.HALF_UP);
        }

        // Build and return DTO
        BranchAnalyticsDTO dto = new BranchAnalyticsDTO();
        dto.setTotalRevenue(totalRevenue);
        dto.setTotalOrders(totalOrders);
        dto.setCompletedOrders(completedOrders);
        dto.setCancelledOrders(cancelledOrders);
        dto.setAvgOrderValue(avgOrderValue);
        dto.setTimeframe(timeframe);

        return dto;
    }
    
    /**
     * Get branch-specific analytics (kept for backward compatibility)
     */
    @Transactional(readOnly = true)
    public BranchAnalyticsDTO getBranchAnalytics(UUID branchId, ReportType timeframe) {
        // Calculate date range based on timeframe
        ZonedDateTime now = ZonedDateTime.now(VIETNAM_TIMEZONE);
        Instant startDate;
        Instant endDate;

        switch (timeframe) {
            case DAY:
                startDate = now.toLocalDate().atStartOfDay(VIETNAM_TIMEZONE).toInstant();
                endDate = now.toLocalDate().plusDays(1).atStartOfDay(VIETNAM_TIMEZONE).toInstant();
                break;
            case MONTH:
                startDate = now.with(TemporalAdjusters.firstDayOfMonth())
                        .toLocalDate().atStartOfDay(VIETNAM_TIMEZONE).toInstant();
                endDate = now.with(TemporalAdjusters.firstDayOfNextMonth())
                        .toLocalDate().atStartOfDay(VIETNAM_TIMEZONE).toInstant();
                break;
            case YEAR:
                startDate = now.with(TemporalAdjusters.firstDayOfYear())
                        .toLocalDate().atStartOfDay(VIETNAM_TIMEZONE).toInstant();
                endDate = now.with(TemporalAdjusters.firstDayOfNextYear())
                        .toLocalDate().atStartOfDay(VIETNAM_TIMEZONE).toInstant();
                break;
            default:
                throw new IllegalArgumentException("Invalid timeframe: " + timeframe);
        }

        // Get order counts by status
        int eatingOrders = orderRepository.countOrdersByBranchAndStatusAndTimeframe(
                branchId, OrderStatus.EATING, startDate, endDate);
        int completedOrders = orderRepository.countOrdersByBranchAndStatusAndTimeframe(
                branchId, OrderStatus.COMPLETED, startDate, endDate);
        int cancelledOrders = orderRepository.countOrdersByBranchAndStatusAndTimeframe(
                branchId, OrderStatus.CANCELLED, startDate, endDate);
        
        // Calculate total orders
        int totalOrders = eatingOrders + completedOrders + cancelledOrders;

        // Get total revenue (COMPLETED orders only)
        BigDecimal totalRevenue = orderRepository.sumRevenueByBranchAndTimeframe(
                branchId, OrderStatus.COMPLETED, startDate, endDate);

        // Calculate average order value (handle zero division)
        BigDecimal avgOrderValue = BigDecimal.ZERO;
        if (completedOrders > 0) {
            avgOrderValue = totalRevenue.divide(
                    BigDecimal.valueOf(completedOrders), 2, RoundingMode.HALF_UP);
        }

        // Build and return DTO
        BranchAnalyticsDTO dto = new BranchAnalyticsDTO();
        dto.setTotalRevenue(totalRevenue);
        dto.setTotalOrders(totalOrders);
        dto.setCompletedOrders(completedOrders);
        dto.setCancelledOrders(cancelledOrders);
        dto.setAvgOrderValue(avgOrderValue);
        dto.setTimeframe(timeframe);

        return dto;
    }

    /**
     * Get top selling items for restaurant (aggregated from all branches)
     */
    @Transactional(readOnly = true)
    public List<TopSellingItemDTO> getRestaurantTopSellingItems(UUID restaurantId, ReportType timeframe, int limit) {
        // Calculate date range based on timeframe
        ZonedDateTime now = ZonedDateTime.now(VIETNAM_TIMEZONE);
        Instant startDate;
        Instant endDate;

        switch (timeframe) {
            case DAY:
                startDate = now.toLocalDate().atStartOfDay(VIETNAM_TIMEZONE).toInstant();
                endDate = now.toLocalDate().plusDays(1).atStartOfDay(VIETNAM_TIMEZONE).toInstant();
                break;
            case MONTH:
                startDate = now.with(TemporalAdjusters.firstDayOfMonth())
                        .toLocalDate().atStartOfDay(VIETNAM_TIMEZONE).toInstant();
                endDate = now.with(TemporalAdjusters.firstDayOfNextMonth())
                        .toLocalDate().atStartOfDay(VIETNAM_TIMEZONE).toInstant();
                break;
            case YEAR:
                startDate = now.with(TemporalAdjusters.firstDayOfYear())
                        .toLocalDate().atStartOfDay(VIETNAM_TIMEZONE).toInstant();
                endDate = now.with(TemporalAdjusters.firstDayOfNextYear())
                        .toLocalDate().atStartOfDay(VIETNAM_TIMEZONE).toInstant();
                break;
            default:
                throw new IllegalArgumentException("Invalid timeframe: " + timeframe);
        }

        // Call repository method to get top selling items across all branches
        List<TopSellingItemDTO> allItems = orderRepository.findTopSellingItemsByRestaurant(
                restaurantId, OrderStatus.COMPLETED, startDate, endDate);

        // Limit results
        return allItems.stream()
                .limit(limit)
                .collect(Collectors.toList());
    }

    /**
     * Get order distribution for restaurant (aggregated from all branches)
     */
    @Transactional(readOnly = true)
    public List<OrderDistributionDTO> getRestaurantOrderDistribution(UUID restaurantId, LocalDate date) {
        // Calculate start and end of day in Asia/Ho_Chi_Minh timezone
        ZonedDateTime startOfDay = date.atStartOfDay(VIETNAM_TIMEZONE);
        ZonedDateTime endOfDay = date.plusDays(1).atStartOfDay(VIETNAM_TIMEZONE);

        Instant startDate = startOfDay.toInstant();
        Instant endDate = endOfDay.toInstant();

        // Call repository method to get order counts by hour across all branches
        List<OrderDistributionDTO> distribution = orderRepository.findOrderDistributionByRestaurantAndDate(
                restaurantId, startDate, endDate);

        // Fill in missing hours with zero counts
        List<OrderDistributionDTO> completeDistribution = new ArrayList<>();
        for (int hour = 0; hour < 24; hour++) {
            final int currentHour = hour;
            OrderDistributionDTO existingData = distribution.stream()
                    .filter(d -> d.getHour() == currentHour)
                    .findFirst()
                    .orElse(null);

            if (existingData != null) {
                completeDistribution.add(existingData);
            } else {
                completeDistribution.add(new OrderDistributionDTO(hour, 0));
            }
        }

        return completeDistribution;
    }

    @Transactional(readOnly = true)
    public List<TopSellingItemDTO> getTopSellingItems(UUID branchId, ReportType timeframe, int limit) {
        // Calculate date range based on timeframe
        ZonedDateTime now = ZonedDateTime.now(VIETNAM_TIMEZONE);
        Instant startDate;
        Instant endDate;

        switch (timeframe) {
            case DAY:
                startDate = now.toLocalDate().atStartOfDay(VIETNAM_TIMEZONE).toInstant();
                endDate = now.toLocalDate().plusDays(1).atStartOfDay(VIETNAM_TIMEZONE).toInstant();
                break;
            case MONTH:
                startDate = now.with(TemporalAdjusters.firstDayOfMonth())
                        .toLocalDate().atStartOfDay(VIETNAM_TIMEZONE).toInstant();
                endDate = now.with(TemporalAdjusters.firstDayOfNextMonth())
                        .toLocalDate().atStartOfDay(VIETNAM_TIMEZONE).toInstant();
                break;
            case YEAR:
                startDate = now.with(TemporalAdjusters.firstDayOfYear())
                        .toLocalDate().atStartOfDay(VIETNAM_TIMEZONE).toInstant();
                endDate = now.with(TemporalAdjusters.firstDayOfNextYear())
                        .toLocalDate().atStartOfDay(VIETNAM_TIMEZONE).toInstant();
                break;
            default:
                throw new IllegalArgumentException("Invalid timeframe: " + timeframe);
        }

        // Call repository method to get top selling items
        List<TopSellingItemDTO> allItems = orderRepository.findTopSellingItemsByBranch(
                branchId, OrderStatus.COMPLETED, startDate, endDate);

        // Limit results
        return allItems.stream()
                .limit(limit)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<OrderDistributionDTO> getOrderDistribution(UUID branchId, LocalDate date) {
        // Calculate start and end of day in Asia/Ho_Chi_Minh timezone
        ZonedDateTime startOfDay = date.atStartOfDay(VIETNAM_TIMEZONE);
        ZonedDateTime endOfDay = date.plusDays(1).atStartOfDay(VIETNAM_TIMEZONE);

        Instant startDate = startOfDay.toInstant();
        Instant endDate = endOfDay.toInstant();

        // Call repository method to get order counts by hour
        List<OrderDistributionDTO> distribution = orderRepository.findOrderDistributionByBranchAndDate(
                branchId, startDate, endDate);

        // Fill in missing hours with zero counts
        List<OrderDistributionDTO> completeDistribution = new ArrayList<>();
        for (int hour = 0; hour < 24; hour++) {
            final int currentHour = hour;
            OrderDistributionDTO existingData = distribution.stream()
                    .filter(d -> d.getHour() == currentHour)
                    .findFirst()
                    .orElse(null);

            if (existingData != null) {
                completeDistribution.add(existingData);
            } else {
                completeDistribution.add(new OrderDistributionDTO(hour, 0));
            }
        }

        return completeDistribution;
    }
}
