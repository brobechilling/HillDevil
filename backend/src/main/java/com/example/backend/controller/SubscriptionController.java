package com.example.backend.controller;

import com.example.backend.dto.ApiResponse;
import com.example.backend.dto.RestaurantSubscriptionOverviewDTO;
import com.example.backend.dto.response.SubscriptionPaymentResponse;
import com.example.backend.dto.response.SubscriptionResponse;
import com.example.backend.service.SubscriptionService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/subscriptions")
public class SubscriptionController {

    private final SubscriptionService subscriptionService;

    public SubscriptionController(SubscriptionService subscriptionService) {
        this.subscriptionService = subscriptionService;
    }

    @GetMapping("/{id}")
    public ApiResponse<SubscriptionResponse> getById(@PathVariable UUID id) {
        ApiResponse<SubscriptionResponse> res = new ApiResponse<>();
        res.setResult(subscriptionService.getById(id));
        return res;
    }

    @PutMapping("/{subscriptionId}/activate")
    public ApiResponse<SubscriptionResponse> activateSubscription(
            @PathVariable UUID subscriptionId,
            @RequestParam(defaultValue = "1") int durationMonths) {
        ApiResponse<SubscriptionResponse> res = new ApiResponse<>();
        res.setResult(subscriptionService.activateSubscription(subscriptionId, durationMonths));
        return res;
    }

    @PutMapping("/{subscriptionId}/renew")
    public ApiResponse<SubscriptionResponse> renewSubscription(
            @PathVariable UUID subscriptionId,
            @RequestParam UUID packageId) {
        ApiResponse<SubscriptionResponse> res = new ApiResponse<>();
        res.setResult(subscriptionService.renewSubscription(subscriptionId, packageId));
        return res;
    }

    @PutMapping("/{subscriptionId}/cancel")
    public ApiResponse<Void> cancelSubscription(@PathVariable UUID subscriptionId) {
        subscriptionService.cancelSubscription(subscriptionId);
        ApiResponse<Void> res = new ApiResponse<>();
        res.setCode(1000);
        res.setMessage("Subscription cancelled successfully");
        return res;
    }

    @PostMapping("/change")
    public ApiResponse<SubscriptionResponse> changePackage(
            @RequestParam UUID restaurantId,
            @RequestParam UUID newPackageId) {
        ApiResponse<SubscriptionResponse> res = new ApiResponse<>();
        res.setResult(subscriptionService.changePackage(restaurantId, newPackageId));
        return res;
    }

    // ✅ NEW: Overview for current owner
    @GetMapping("/overview")
    public ApiResponse<List<RestaurantSubscriptionOverviewDTO>> getSubscriptionsOverviewForOwner() {
        ApiResponse<List<RestaurantSubscriptionOverviewDTO>> res = new ApiResponse<>();
        res.setResult(subscriptionService.getSubscriptionsOverviewForOwner());
        return res;
    }

    @GetMapping("/active")
    public ApiResponse<List<SubscriptionResponse>> getAllActiveSubscriptions() {
        ApiResponse<List<SubscriptionResponse>> res = new ApiResponse<>();
        res.setResult(subscriptionService.getActiveSubscriptions());
        return res;
    }

    @GetMapping("/restaurant/{restaurantId}/active")
    public ApiResponse<SubscriptionResponse> getActiveSubscriptionByRestaurant(@PathVariable UUID restaurantId) {
        ApiResponse<SubscriptionResponse> res = new ApiResponse<>();
        res.setResult(subscriptionService.getActiveSubscriptionByRestaurant(restaurantId));
        return res;
    }

    @GetMapping("/stats")
    public ApiResponse<Map<String, Long>> getPackagePurchaseStats() {
        ApiResponse<Map<String, Long>> res = new ApiResponse<>();
        res.setResult(subscriptionService.getPackagePurchaseStats());
        return res;
    }

    @GetMapping("/restaurant/{restaurantId}/latest-payment")
    public ApiResponse<SubscriptionPaymentResponse> getLatestPaymentStatus(
            @PathVariable UUID restaurantId) {
        ApiResponse<SubscriptionPaymentResponse> res = new ApiResponse<>();
        SubscriptionPaymentResponse result = subscriptionService.getLatestPaymentStatusForRestaurant(restaurantId);
        res.setResult(result);
        if (result == null) {
            res.setMessage("No payment status found for this restaurant");
            res.setCode(404);
        }
        return res;
    }

    @GetMapping("/restaurant/{restaurantId}/payments")
    public ApiResponse<List<SubscriptionPaymentResponse>> getPaymentHistory(
            @PathVariable UUID restaurantId) {
        ApiResponse<List<SubscriptionPaymentResponse>> res = new ApiResponse<>();
        List<SubscriptionPaymentResponse> result = subscriptionService.getPaymentHistoryByRestaurant(restaurantId);
        res.setResult(result);
        return res;
    }
}
