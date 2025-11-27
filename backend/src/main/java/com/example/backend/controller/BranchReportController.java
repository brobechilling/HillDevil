package com.example.backend.controller;

import com.example.backend.dto.ApiResponse;
import com.example.backend.dto.BranchAnalyticsDTO;
import com.example.backend.entities.ReportType;
import com.example.backend.exception.AppException;
import com.example.backend.service.BranchReportService;
import com.example.backend.service.RestaurantReportService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/branch-reports")
public class BranchReportController {

    private final BranchReportService branchReportService;
    private final RestaurantReportService restaurantReportService;

    public BranchReportController(
        BranchReportService branchReportService,
        RestaurantReportService restaurantReportService
    ) {
        this.branchReportService = branchReportService;
        this.restaurantReportService = restaurantReportService;
    }

    @GetMapping("/branch/{branchId}/analytics")
    public ApiResponse<BranchAnalyticsDTO> getBranchAnalytics(
        @PathVariable UUID branchId,
        @RequestParam ReportType reportType,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date
    ) {
        ApiResponse<BranchAnalyticsDTO> response = new ApiResponse<>();
        
        try {
            LocalDate targetDate = date != null ? date : LocalDate.now();
            BranchAnalyticsDTO analytics = branchReportService.getBranchAnalytics(branchId, reportType, targetDate);
            response.setResult(analytics);
        } catch (AppException e) {
            response.setCode(e.getErrorCode().getCode());
            response.setMessage(e.getMessage());
        }
        
        return response;
    }

    @GetMapping("/restaurant/{restaurantId}/branch-performance")
    public ApiResponse<List<Map<String, Object>>> getRestaurantBranchPerformance(
        @PathVariable UUID restaurantId,
        @RequestParam ReportType reportType,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date
    ) {
        ApiResponse<List<Map<String, Object>>> response = new ApiResponse<>();
        
        try {
            LocalDate targetDate = date != null ? date : LocalDate.now();
            List<Map<String, Object>> performance = branchReportService.getRestaurantBranchPerformance(
                restaurantId, 
                reportType, 
                targetDate
            );
            response.setResult(performance);
        } catch (AppException e) {
            response.setCode(e.getErrorCode().getCode());
            response.setMessage(e.getMessage());
        }
        
        return response;
    }

    @GetMapping("/restaurant/{restaurantId}/analytics")
    public ApiResponse<BranchAnalyticsDTO> getRestaurantAnalytics(
        @PathVariable UUID restaurantId,
        @RequestParam ReportType reportType,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date
    ) {
        ApiResponse<BranchAnalyticsDTO> response = new ApiResponse<>();
        
        try {
            // Use RestaurantReportService for proper aggregation
            BranchAnalyticsDTO analytics = restaurantReportService.getRestaurantAnalytics(restaurantId, reportType);
            response.setResult(analytics);
        } catch (AppException e) {
            response.setCode(e.getErrorCode().getCode());
            response.setMessage(e.getMessage());
        }
        
        return response;
    }

    @GetMapping("/branch/{branchId}/today-stats")
    public ApiResponse<Map<String, Object>> getTodayStats(
        @PathVariable UUID branchId
    ) {
        ApiResponse<Map<String, Object>> response = new ApiResponse<>();
        
        try {
            Map<String, Object> stats = branchReportService.getTodayStats(branchId);
            response.setResult(stats);
        } catch (AppException e) {
            response.setCode(e.getErrorCode().getCode());
            response.setMessage(e.getMessage());
        }
        
        return response;
    }
}
