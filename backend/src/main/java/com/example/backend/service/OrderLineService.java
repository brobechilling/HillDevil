package com.example.backend.service;

import com.example.backend.dto.OrderItemDTO;
import com.example.backend.dto.OrderLineDTO;
import com.example.backend.dto.request.CreateOrderLineRequest;
import com.example.backend.entities.Order;
import com.example.backend.entities.OrderLine;
import com.example.backend.entities.OrderLineStatus;
import com.example.backend.exception.AppException;
import com.example.backend.exception.ErrorCode;
import com.example.backend.mapper.OrderLineMapper;
import com.example.backend.repository.OrderLineRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class OrderLineService {

    private final OrderLineRepository orderLineRepository;
    private final OrderLineMapper mapper;
    private final OrderItemService orderItemService;

    public OrderLineService(OrderLineRepository orderLineRepository,
                            OrderLineMapper mapper,
                            OrderItemService orderItemService) {
        this.orderLineRepository = orderLineRepository;
        this.mapper = mapper;
        this.orderItemService = orderItemService;
    }

    public OrderLineDTO getById(UUID orderLineId) {
        OrderLine orderLine = orderLineRepository.findById(orderLineId).orElseThrow(() -> new AppException(ErrorCode.ORDERLINE_NOT_EXISTS));
        return mapper.toOrderLineDTO(orderLine);
    }

    public List<OrderLineDTO> getOrderLineFromOrder(UUID orderId) {
        List<OrderLine> orderLines = orderLineRepository.findAllByOrder_OrderId(orderId);
        return mapper.toDtoList(orderLines);
    }



    public OrderLineDTO setOrderLineStatus(UUID orderLineId, OrderLineStatus status) {
        OrderLine line = orderLineRepository.findById(orderLineId)
                .orElseThrow(() -> new AppException(ErrorCode.ORDERLINE_NOT_EXISTS));

        line.setOrderLineStatus(status);
        line.setUpdatedAt(Instant.now());
        return mapper.toOrderLineDTO(orderLineRepository.save(line));
    }

    @Transactional
    public List<OrderLineDTO> createOrderLines(List<CreateOrderLineRequest> requests, Order order) {
        List<OrderLineDTO> savedLines = new ArrayList<>();

        for (CreateOrderLineRequest lineReq : requests) {
            OrderLine line = new OrderLine();
            line.setOrder(order);
            line.setOrderLineStatus(
                    lineReq.getOrderLineStatus() == null
                            ? OrderLineStatus.PENDING
                            : lineReq.getOrderLineStatus()
            );

            OrderLine savedLine = orderLineRepository.save(line);

            BigDecimal lineTotal = BigDecimal.ZERO;

            if (lineReq.getOrderItems() != null && !lineReq.getOrderItems().isEmpty()) {
                var items = orderItemService.createOrderItems(lineReq.getOrderItems(), savedLine);
                lineTotal = items.stream()
                        .map(OrderItemDTO::getTotalPrice)
                        .reduce(BigDecimal.ZERO, BigDecimal::add);
            }

            savedLine.setTotalPrice(lineTotal);
            savedLine = orderLineRepository.save(savedLine);

            savedLines.add(mapper.toOrderLineDTO(savedLine));
        }

        return savedLines;
    }
}
