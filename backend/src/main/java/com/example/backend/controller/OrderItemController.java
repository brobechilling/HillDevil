package com.example.backend.controller;

import com.example.backend.dto.ApiResponse;
import com.example.backend.dto.OrderItemDTO;
import com.example.backend.service.OrderItemService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;


@RestController
@RequestMapping("/api/order-items")
public class OrderItemController {

    private final OrderItemService orderItemService;

    public OrderItemController(OrderItemService orderItemService) {
        this.orderItemService = orderItemService;
    }

    @PutMapping("")
    public ApiResponse<OrderItemDTO> updateOrderItem(@RequestBody OrderItemDTO orderItemDTO) {
        ApiResponse<OrderItemDTO> apiResponse = new ApiResponse<>();
        apiResponse.setResult(orderItemService.updateOrderItem(orderItemDTO));
        return apiResponse;
    }
    
    @DeleteMapping("/{orderItemId}")
    public ApiResponse<Boolean> deleteOrderItem(@PathVariable UUID orderItemId) {
        ApiResponse<Boolean> apiResponse = new ApiResponse<>();
        apiResponse.setResult(orderItemService.deleteOrderItem(orderItemId));
        return apiResponse;
    }

}
