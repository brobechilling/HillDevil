package com.example.backend.controller;

import com.example.backend.dto.ApiResponse;
import com.example.backend.dto.BranchAnalyticsDTO;
import com.example.backend.dto.OrderDistributionDTO;
import com.example.backend.dto.TopSellingItemDTO;
import com.example.backend.entities.ReportType;
import com.example.backend.exception.AppException;
import com.example.backend.service.BranchService;
import com.example.backend.service.RestaurantReportService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/reports")
public class RestaurantReportController {

    private final RestaurantReportService restaurantReportService;
    private final BranchService branchService;

    public RestaurantReportController(
            RestaurantReportService restaurantReportService,
            BranchService branchService
    ) {
        this.restaurantReportService = restaurantReportService;
        this.branchService = branchService;
    }

    @GetMapping("/branch/{branchId}/analytics")
    public ApiResponse<BranchAnalyticsDTO> getBranchAnalytics(
            @PathVariable UUID branchId,
            @RequestParam(defaultValue = "DAY") ReportType timeframe
    ) {
        ApiResponse<BranchAnalyticsDTO> response = new ApiResponse<>();
        
        try {
            // Validate branch exists by getting restaurant ID
            branchService.getRestaurantIdByBranchId(branchId);
            
            // Call service to get analytics
            BranchAnalyticsDTO analytics = restaurantReportService.getBranchAnalytics(branchId, timeframe);
            response.setResult(analytics);
            
        } catch (AppException e) {
            response.setCode(e.getErrorCode().getCode());
            response.setMessage(e.getMessage());
        }
        
        return response;
    }

    @GetMapping("/branch/{branchId}/top-items")
    public ApiResponse<List<TopSellingItemDTO>> getTopSellingItems(
            @PathVariable UUID branchId,
            @RequestParam(defaultValue = "DAY") ReportType timeframe,
            @RequestParam(defaultValue = "10") int limit
    ) {
        ApiResponse<List<TopSellingItemDTO>> response = new ApiResponse<>();
        
        try {
            // Validate branch exists by getting restaurant ID
            branchService.getRestaurantIdByBranchId(branchId);
            
            // Call service to get top selling items
            List<TopSellingItemDTO> topItems = restaurantReportService.getTopSellingItems(branchId, timeframe, limit);
            response.setResult(topItems);
            
        } catch (AppException e) {
            response.setCode(e.getErrorCode().getCode());
            response.setMessage(e.getMessage());
        }
        
        return response;
    }

    @GetMapping("/branch/{branchId}/order-distribution")
    public ApiResponse<List<OrderDistributionDTO>> getOrderDistribution(
            @PathVariable UUID branchId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date
    ) {
        ApiResponse<List<OrderDistributionDTO>> response = new ApiResponse<>();
        
        try {
            // Validate branch exists by getting restaurant ID
            branchService.getRestaurantIdByBranchId(branchId);
            
            // Use current date if not provided
            LocalDate targetDate = (date != null) ? date : LocalDate.now();
            
            // Call service to get order distribution
            List<OrderDistributionDTO> distribution = restaurantReportService.getOrderDistribution(branchId, targetDate);
            response.setResult(distribution);
            
        } catch (AppException e) {
            response.setCode(e.getErrorCode().getCode());
            response.setMessage(e.getMessage());
        }
        
        return response;
    }
}
