package com.example.backend.controller;

import com.example.backend.dto.ApiResponse;
import com.example.backend.dto.OrderItemCustomizationDTO;
import com.example.backend.dto.request.CreateOrderItemCustomizationRequest;
import com.example.backend.service.OrderItemCustomizationService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/order-item-customizations")
public class OrderItemCustomizationController {

    private final OrderItemCustomizationService customizationService;

    public OrderItemCustomizationController(OrderItemCustomizationService customizationService) {
        this.customizationService = customizationService;
    }

    @PostMapping("/order-item/{orderItemId}/create")
    public ApiResponse<List<OrderItemCustomizationDTO>> createCustomizations(
            @PathVariable UUID orderItemId,
            @RequestBody List<CreateOrderItemCustomizationRequest> requests
    ) {
        ApiResponse<List<OrderItemCustomizationDTO>> res = new ApiResponse<>();
        res.setResult(customizationService.createCustomizations(requests, null));
        return res;
    }
}
