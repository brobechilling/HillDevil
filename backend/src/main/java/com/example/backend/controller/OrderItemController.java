package com.example.backend.controller;

import com.example.backend.dto.ApiResponse;
import com.example.backend.dto.OrderItemDTO;
import com.example.backend.dto.request.CreateOrderItemRequest;
import com.example.backend.entities.OrderLine;
import com.example.backend.exception.AppException;
import com.example.backend.exception.ErrorCode;
import com.example.backend.repository.OrderLineRepository;
import com.example.backend.service.OrderItemService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/order-items")
public class OrderItemController {

    private final OrderItemService orderItemService;
    private final OrderLineRepository orderLineRepository;

    public OrderItemController(OrderItemService orderItemService,
                               OrderLineRepository orderLineRepository) {
        this.orderItemService = orderItemService;
        this.orderLineRepository = orderLineRepository;
    }

    @PostMapping("/order-line/{orderLineId}/create")
    public ApiResponse<List<OrderItemDTO>> createItems(
            @PathVariable UUID orderLineId,
            @RequestBody List<CreateOrderItemRequest> requests
    ) {
        ApiResponse<List<OrderItemDTO>> res = new ApiResponse<>();
        OrderLine orderLine = orderLineRepository.findById(orderLineId)
                .orElseThrow(() -> new AppException(ErrorCode.ORDERLINE_NOT_EXISTS));
        res.setResult(orderItemService.createOrderItems(requests, orderLine));
        return res;
    }
}
