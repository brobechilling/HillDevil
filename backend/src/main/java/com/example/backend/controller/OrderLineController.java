package com.example.backend.controller;

import com.example.backend.dto.ApiResponse;
import com.example.backend.dto.request.CreateOrderLineRequest;
import com.example.backend.service.OrderLineService;
import org.springframework.web.bind.annotation.*;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;


@RestController
@RequestMapping("/api/orderlines")
public class OrderLineController {

    private final OrderLineService orderLineService;

    public OrderLineController(OrderLineService orderLineService) {
        this.orderLineService = orderLineService;
    }

    @PostMapping("")
    public ApiResponse<Boolean> createOrderLine(@RequestBody CreateOrderLineRequest createOrderLineRequest) {
        ApiResponse<Boolean> apiResponse = new ApiResponse<>();
        apiResponse.setResult(orderLineService.createOrderLine(createOrderLineRequest));
        return apiResponse;
    }

    
    
}
