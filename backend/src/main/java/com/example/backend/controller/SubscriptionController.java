package com.example.backend.controller;

import com.example.backend.dto.ApiResponse;
import com.example.backend.dto.response.SubscriptionResponse;
import com.example.backend.service.SubscriptionService;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/subscriptions")
public class SubscriptionController {

    private final SubscriptionService subscriptionService;

    public SubscriptionController(SubscriptionService subscriptionService) {
        this.subscriptionService = subscriptionService;
    }


    @PutMapping("/{subscriptionId}/activate")
    public ApiResponse<SubscriptionResponse> activateSubscription(
            @PathVariable UUID subscriptionId,
            @RequestParam(defaultValue = "1") int durationMonths
    ) {
        ApiResponse<SubscriptionResponse> res = new ApiResponse<>();
        res.setResult(subscriptionService.activateSubscription(subscriptionId, durationMonths));
        return res;
    }

    @PutMapping("/{subscriptionId}/renew")
    public ApiResponse<SubscriptionResponse> renewSubscription(
            @PathVariable UUID subscriptionId,
            @RequestParam(defaultValue = "1") int additionalMonths
    ) {
        ApiResponse<SubscriptionResponse> res = new ApiResponse<>();
        res.setResult(subscriptionService.renewSubscription(subscriptionId, additionalMonths));
        return res;
    }

    @GetMapping("/{id}")
    public ApiResponse<SubscriptionResponse> getById(@PathVariable UUID id) {
        ApiResponse<SubscriptionResponse> res = new ApiResponse<>();
        res.setResult(subscriptionService.getById(id));
        return res;
    }
}
