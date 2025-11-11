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

   

}
