package com.example.backend.controller;

import com.example.backend.dto.ApiResponse;
import com.example.backend.dto.OrderLineDTO;
import com.example.backend.dto.request.CreateOrderLineRequest;
import com.example.backend.dto.request.UpdateOrderLineStatusRequest;
import com.example.backend.entities.OrderLineStatus;
import com.example.backend.service.OrderLineService;

import java.util.List;
import java.util.UUID;

import org.springframework.web.bind.annotation.*;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.GetMapping;


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

    @GetMapping("/pending/{branchId}")
    public ApiResponse<List<OrderLineDTO>> getPendingOrderLine(@PathVariable UUID branchId) {
        ApiResponse<List<OrderLineDTO>> apiResponse = new ApiResponse<>();
        apiResponse.setResult(orderLineService.getOrderLinesByStatusAndBranch(branchId, OrderLineStatus.PENDING));
        return apiResponse;
    }
    
    @GetMapping("/preparing/{branchId}")
    public ApiResponse<List<OrderLineDTO>> getPreparingOrderLine(@PathVariable UUID branchId) {
        ApiResponse<List<OrderLineDTO>> apiResponse = new ApiResponse<>();
        apiResponse.setResult(orderLineService.getOrderLinesByStatusAndBranch(branchId, OrderLineStatus.PREPARING));
        return apiResponse;
    }

    @GetMapping("/completed/{branchId}")
    public ApiResponse<List<OrderLineDTO>> getCompletedOrderLine(@PathVariable UUID branchId) {
        ApiResponse<List<OrderLineDTO>> apiResponse = new ApiResponse<>();
        apiResponse.setResult(orderLineService.getOrderLinesByStatusAndBranch(branchId, OrderLineStatus.COMPLETED));
        return apiResponse;
    }

    @GetMapping("/cancelled/{branchId}")
    public ApiResponse<List<OrderLineDTO>> getCancelledOrderLine(@PathVariable UUID branchId) {
        ApiResponse<List<OrderLineDTO>> apiResponse = new ApiResponse<>();
        apiResponse.setResult(orderLineService.getOrderLinesByStatusAndBranch(branchId, OrderLineStatus.CANCELLED));
        return apiResponse;
    }

    @PostMapping("/status")
    public ApiResponse<Boolean> udpateOrderLineStatus(@RequestBody UpdateOrderLineStatusRequest request) {
        ApiResponse<Boolean> apiResponse = new ApiResponse<>();
        apiResponse.setResult(orderLineService.setOrderLineStatus(request));
        return apiResponse;
    }

    

}
