package com.example.backend.controller;

import com.example.backend.dto.ApiResponse;
import com.example.backend.dto.OrderLineDTO;
import com.example.backend.entities.OrderLineStatus;
import com.example.backend.service.OrderLineService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/order-lines")
public class OrderLineController {

    private final OrderLineService orderLineService;

    public OrderLineController(OrderLineService orderLineService) {
        this.orderLineService = orderLineService;
    }

    @GetMapping("/{id}")
    public ApiResponse<OrderLineDTO> getById(@PathVariable UUID id) {
        ApiResponse<OrderLineDTO> res = new ApiResponse<>();
        res.setResult(orderLineService.getById(id));
        return res;
    }

    @GetMapping("/order/{orderId}")
    public ApiResponse<List<OrderLineDTO>> getByOrder(@PathVariable UUID orderId) {
        ApiResponse<List<OrderLineDTO>> res = new ApiResponse<>();
        res.setResult(orderLineService.getOrderLineFromOrder(orderId));
        return res;
    }

    @PutMapping("/{orderLineId}/status")
    public ApiResponse<OrderLineDTO> updateStatus(
            @PathVariable UUID orderLineId,
            @RequestParam OrderLineStatus status
    ) {
        ApiResponse<OrderLineDTO> res = new ApiResponse<>();
        res.setResult(orderLineService.setOrderLineStatus(orderLineId, status));
        return res;
    }
}
