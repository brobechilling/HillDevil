package com.example.backend.controller;

import com.example.backend.dto.ApiResponse;
import com.example.backend.dto.OrderDTO;
import com.example.backend.dto.request.CreateOrderRequest;
import com.example.backend.service.OrderService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @GetMapping("/branch/{branchId}/history")
    public ApiResponse<List<OrderDTO>> getOrdersHistory(@PathVariable UUID branchId) {
        ApiResponse<List<OrderDTO>> res = new ApiResponse<>();
        res.setResult(orderService.getOrdersHistoryFromBranch(branchId));
        return res;
    }

    @GetMapping("/{orderId}")
    public ApiResponse<OrderDTO> getById(@PathVariable UUID orderId) {
        ApiResponse<OrderDTO> res = new ApiResponse<>();
        res.setResult(orderService.getById(orderId));
        return res;
    }

    @PostMapping("/create")
    public ApiResponse<OrderDTO> create(@RequestBody CreateOrderRequest request) {
        ApiResponse<OrderDTO> res = new ApiResponse<>();
        res.setResult(orderService.create(request));
        return res;
    }

    @GetMapping("/table/{tableId}/pending")
    public ApiResponse<OrderDTO> getPendingByTable(@PathVariable UUID tableId) {
        ApiResponse<OrderDTO> res = new ApiResponse<>();
        res.setResult(orderService.getPendingOrderByTable(tableId));
        return res;
    }

    @PutMapping("/{orderId}/complete")
    public ApiResponse<OrderDTO> completeOrder(@PathVariable UUID orderId) {
        ApiResponse<OrderDTO> res = new ApiResponse<>();
        res.setResult(orderService.completeOrder(orderId));
        return res;
    }
}
