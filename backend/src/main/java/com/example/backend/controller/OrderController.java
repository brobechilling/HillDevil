package com.example.backend.controller;

import com.example.backend.dto.ApiResponse;
import com.example.backend.dto.OrderDTO;
import com.example.backend.dto.request.UpdateOrderStatusRequest;
import com.example.backend.dto.response.UpdateOrderStatusResponse;
import com.example.backend.entities.OrderStatus;
import com.example.backend.service.OrderService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.PathVariable;



@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @GetMapping("/eating/{branchId}")
    public ApiResponse<List<OrderDTO>> getEatingOrder(@PathVariable UUID branchId) {
        ApiResponse<List<OrderDTO>> apiResponse = new ApiResponse<>();
        apiResponse.setResult(orderService.getOrderByStatusAndBranch(branchId, OrderStatus.EATING));
        return apiResponse;
    }

    @GetMapping("/completed/{branchId}")
    public ApiResponse<List<OrderDTO>> getCompletedOrder(@PathVariable UUID branchId) {
        ApiResponse<List<OrderDTO>> apiResponse = new ApiResponse<>();
        apiResponse.setResult(orderService.getOrderByStatusAndBranch(branchId, OrderStatus.COMPLETED));
        return apiResponse;
    }

    @PutMapping("")
    public ApiResponse<UpdateOrderStatusResponse> setOrderStatus(@RequestBody UpdateOrderStatusRequest request) {
        ApiResponse<UpdateOrderStatusResponse> apiResponse = new ApiResponse<>();
        apiResponse.setResult(orderService.setOrderStatus(request));
        return apiResponse;
    }

}