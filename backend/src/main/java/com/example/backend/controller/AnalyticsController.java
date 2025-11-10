package com.example.backend.controller;

import com.example.backend.dto.ApiResponse;
import com.example.backend.service.SubscriptionAnalyticsService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/analytics")
public class AnalyticsController {

    private final SubscriptionAnalyticsService subscriptionAnalyticsService;

    public AnalyticsController(SubscriptionAnalyticsService subscriptionAnalyticsService) {
        this.subscriptionAnalyticsService = subscriptionAnalyticsService;
    }


    @GetMapping("/subscriptions/active-packages")
    public ApiResponse<Map<String, Long>> getActivePackageCounts() {
        ApiResponse<Map<String, Long>> res = new ApiResponse<>();
        res.setResult(subscriptionAnalyticsService.countActivePackages());
        return res;
    }


    @GetMapping("/subscriptions/top-spenders")
    public ApiResponse<List<Map<String, Object>>> getTopSpendingUsers() {
        ApiResponse<List<Map<String, Object>>> res = new ApiResponse<>();
        res.setResult(subscriptionAnalyticsService.getTop5SpendingUsers());
        return res;
    }
}
