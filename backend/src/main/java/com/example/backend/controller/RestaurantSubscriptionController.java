package com.example.backend.controller;

import com.example.backend.dto.ApiResponse;
import com.example.backend.dto.request.RestaurantCreateRequest;
import com.example.backend.dto.response.SubscriptionPaymentResponse;
import com.example.backend.service.RestaurantSubscriptionService;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/registration")
public class RestaurantSubscriptionController {
    private final RestaurantSubscriptionService restaurantSubscriptionService;

    public RestaurantSubscriptionController(RestaurantSubscriptionService restaurantSubscriptionService) {
        this.restaurantSubscriptionService = restaurantSubscriptionService;
    }

    @PostMapping("/restaurant")
    public ApiResponse<SubscriptionPaymentResponse> registerRestaurantWithPayment(
            @RequestBody RestaurantCreateRequest dto,
            @RequestParam UUID packageId) {
        ApiResponse<SubscriptionPaymentResponse> res = new ApiResponse<>();
        res.setResult(restaurantSubscriptionService.createRestaurantWithSubscriptionAndPayment(dto, packageId));
        res.setMessage("Restaurant registered and payment created successfully");
        return res;
    }

    @PostMapping("/subscription/renew")
    public ApiResponse<SubscriptionPaymentResponse> renewRestaurantSubscription(
            @RequestParam UUID restaurantId,
            @RequestParam UUID packageId) {
        ApiResponse<SubscriptionPaymentResponse> res = new ApiResponse<>();
        res.setResult(restaurantSubscriptionService.renewSubscription(restaurantId, packageId));
        res.setMessage("Subscription renewed and payment created successfully");
        return res;
    }

    @PostMapping("/subscription/change-package")
    public ApiResponse<SubscriptionPaymentResponse> changePackage(
            @RequestParam UUID restaurantId,
            @RequestParam UUID newPackageId) {
        ApiResponse<SubscriptionPaymentResponse> res = new ApiResponse<>();
        res.setResult(restaurantSubscriptionService.changePackage(restaurantId, newPackageId));
        res.setMessage("Package changed and payment created successfully");
        return res;
    }
}
