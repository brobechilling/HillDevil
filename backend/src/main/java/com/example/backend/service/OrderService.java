package com.example.backend.service;

import com.example.backend.dto.OrderDTO;
import com.example.backend.dto.request.UpdateOrderStatusRequest;
import com.example.backend.dto.response.UpdateOrderStatusResponse;
import com.example.backend.entities.*;
import com.example.backend.exception.AppException;
import com.example.backend.exception.ErrorCode;
import com.example.backend.mapper.OrderMapper;
import com.example.backend.repository.OrderRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class OrderService {

    private final OrderMapper orderMapper;
    private final OrderRepository orderRepository;

    public OrderService(OrderMapper orderMapper,
                        OrderRepository orderRepository) {
        this.orderMapper = orderMapper;
        this.orderRepository = orderRepository;
    }

    public List<OrderDTO> getOrderByStatusAndBranch(UUID branchId, OrderStatus status) {
        return orderRepository.findAllByBranchIdAndStatus(branchId, status).stream().map(order -> orderMapper.toOrderDTO(order)).toList();
    }

    public UpdateOrderStatusResponse setOrderStatus(UpdateOrderStatusRequest request) {
        Order order = orderRepository.findById(request.getOrderId()).orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_EXISTS));
        UpdateOrderStatusResponse response = new UpdateOrderStatusResponse();
        response.setPreviousStatus(order.getStatus());
        order.setStatus(request.getOrderStatus());
        response.setNewStatus(order.getStatus());
        response.setSuccessful(orderRepository.save(order) != null);
        return response;
    }

}
