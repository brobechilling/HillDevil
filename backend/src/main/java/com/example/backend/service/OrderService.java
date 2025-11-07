package com.example.backend.service;

import com.example.backend.dto.OrderDTO;
import com.example.backend.dto.OrderLineDTO;
import com.example.backend.dto.request.CreateOrderRequest;
import com.example.backend.entities.*;
import com.example.backend.exception.AppException;
import com.example.backend.exception.ErrorCode;
import com.example.backend.mapper.OrderMapper;
import com.example.backend.repository.OrderRepository;
import com.example.backend.repository.TableRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

@Service
public class OrderService {

    private final OrderMapper orderMapper;
    private final OrderRepository orderRepository;
    private final TableRepository tableRepository;
    private final OrderLineService orderLineService;

    public OrderService(OrderMapper orderMapper,
                        OrderRepository orderRepository,
                        TableRepository tableRepository,
                        OrderLineService orderLineService) {
        this.orderMapper = orderMapper;
        this.orderRepository = orderRepository;
        this.tableRepository = tableRepository;
        this.orderLineService = orderLineService;
    }

    public Order createOrder(UUID areaTableId) {
        Order order = new Order();
        order.setAreaTable(tableRepository.findById(areaTableId).orElseThrow(() -> new AppException(ErrorCode.TABLE_NOT_FOUND)));
        order.setStatus(OrderStatus.EATING);
        return orderRepository.save(order);
    }

    public Order checkOrderExist(UUID areaTableId) {
        return orderRepository.findTopByAreaTable_AreaTableIdAndStatusOrderByUpdatedAtDesc(areaTableId, OrderStatus.EATING).orElseGet( () -> createOrder(areaTableId));
    }

    // @Transactional
    // public OrderDTO create(CreateOrderRequest request) {
    //     if (request == null || request.getAreaTableId() == null
    //             || request.getOrderLines() == null || request.getOrderLines().isEmpty()) {
    //         throw new AppException(ErrorCode.INVALID_REQUEST);
    //     }

    //     AreaTable table = tableRepository.findById(request.getAreaTableId())
    //             .orElseThrow(() -> new AppException(ErrorCode.TABLE_NOT_FOUND));

    //     if (orderRepository.existsByAreaTable_AreaTableIdAndStatus(request.getAreaTableId(), OrderStatus.PENDING)) {
    //         throw new AppException(ErrorCode.TABLE_ALREADY_HAS_PENDING_ORDER);
    //     }

    //     Order order = new Order();
    //     order.setAreaTable(table);
    //     order.setStatus(OrderStatus.PENDING);
    //     order.setTotalPrice(BigDecimal.ZERO);
    //     Order savedOrder = orderRepository.save(order);

    //     List<OrderLineDTO> createdLines = orderLineService.createOrderLines(request.getOrderLines(), savedOrder);

    //     BigDecimal grandTotal = createdLines.stream()
    //             .map(OrderLineDTO::getTotalPrice)
    //             .filter(Objects::nonNull)
    //             .reduce(BigDecimal.ZERO, BigDecimal::add);

    //     savedOrder.setTotalPrice(grandTotal);
    //     savedOrder = orderRepository.save(savedOrder);

    //     return orderMapper.toOrderDTO(savedOrder);
    // }

}
