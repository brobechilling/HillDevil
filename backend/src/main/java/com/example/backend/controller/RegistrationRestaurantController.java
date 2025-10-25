package com.example.backend.controller;

import com.example.backend.dto.ApiResponse;
import com.example.backend.dto.request.RestaurantCreateRequest;
import com.example.backend.dto.response.SubscriptionPaymentResponse;
import com.example.backend.service.RegistrationRestaurantService;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/registration")
public class RegistrationRestaurantController {
    private final RegistrationRestaurantService registrationRestaurantService;

    public RegistrationRestaurantController(RegistrationRestaurantService registrationRestaurantService) {
        this.registrationRestaurantService = registrationRestaurantService;
    }

    @PostMapping("/restaurant")
    public ApiResponse<SubscriptionPaymentResponse> registerRestaurantWithPayment(
            @RequestBody RestaurantCreateRequest dto,
            @RequestParam UUID packageId
    ) {
        ApiResponse<SubscriptionPaymentResponse> res = new ApiResponse<>();
        res.setResult(registrationRestaurantService.createRestaurantWithSubscriptionAndPayment(dto, packageId));
        res.setMessage("Restaurant registered and payment created successfully");
        return res;
    }
}
