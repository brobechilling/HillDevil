package com.example.backend.service;

import com.example.backend.dto.OrderItemCustomizationDTO;
import com.example.backend.dto.request.CreateOrderItemCustomizationRequest;
import com.example.backend.entities.Customization;
import com.example.backend.entities.OrderItem;
import com.example.backend.entities.OrderItemCustomization;
import com.example.backend.exception.AppException;
import com.example.backend.exception.ErrorCode;
import com.example.backend.mapper.OrderItemCustomizationMapper;
import com.example.backend.repository.CustomizationRepository;
import com.example.backend.repository.OrderItemCustomizationRepository;
import com.example.backend.repository.OrderItemRepository;

import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class OrderItemCustomizationService {

    private final OrderItemCustomizationRepository orderItemCustomizationRepository;
    private final CustomizationRepository customizationRepository;
    private final OrderItemCustomizationMapper orderItemCustomizationMapper;
    private final OrderItemRepository orderItemRepository;

    public OrderItemCustomizationService(OrderItemCustomizationRepository orderItemCustomizationRepository,
                                         CustomizationRepository customizationRepository,
                                         OrderItemCustomizationMapper orderItemCustomizationMapper,
                                         OrderItemRepository orderItemRepository) {
        this.orderItemCustomizationRepository = orderItemCustomizationRepository;
        this.customizationRepository = customizationRepository;
        this.orderItemCustomizationMapper = orderItemCustomizationMapper;
        this.orderItemRepository = orderItemRepository;
    }

    public Set<OrderItemCustomization> createOrderItemCustomization(OrderItem orderItem, List<CreateOrderItemCustomizationRequest> createOrderItemCustomizationRequestList) {
        List<OrderItemCustomization> orderItemCustomizations = new ArrayList<>();
        for (CreateOrderItemCustomizationRequest createOrderItemCustomizationRequest : createOrderItemCustomizationRequestList) {
            OrderItemCustomization orderItemCustomization = orderItemCustomizationMapper.createOrderItemCustomization(createOrderItemCustomizationRequest);
            // orderItem is already saved in db
            orderItemCustomization.setOrderItem(orderItem);
            Customization customization = customizationRepository.findById(createOrderItemCustomizationRequest.getCustomizationId()).orElseThrow(() -> new AppException(ErrorCode.CUSTOMIZATION_NOT_FOUND));
            orderItemCustomization.setCustomization(customization);
            // recalculate the price from front end
            orderItemCustomization.setTotalPrice(customization.getPrice().multiply(BigDecimal.valueOf(createOrderItemCustomizationRequest.getQuantity())));
            orderItemCustomizations.add(orderItemCustomization);
        }
        return orderItemCustomizationRepository.saveAll(orderItemCustomizations).stream().collect(Collectors.toSet());
    }

    // used by OrderItemService
    // update quantity and totalPrice
    // be careful that this will update the field of orderItemCustomizations passed in
    public OrderItemCustomization udpateOrderItemCustomization(OrderItemCustomizationDTO orderItemCustomizationDTO) {
        OrderItemCustomization orderItemCustomization = orderItemCustomizationRepository.findById(orderItemCustomizationDTO.getOrderItemCustomizationId()).orElseThrow(() -> new AppException(ErrorCode.ORDERITEM_CUSTOMIZATION_NOT_EXISTS));
        BigDecimal oldQuantity = BigDecimal.valueOf(orderItemCustomization.getQuantity());
        orderItemCustomization.setTotalPrice(orderItemCustomization.getTotalPrice().divide(oldQuantity).multiply(BigDecimal.valueOf(orderItemCustomizationDTO.getQuantity())));
        orderItemCustomization.setQuantity(orderItemCustomizationDTO.getQuantity());
        return orderItemCustomizationRepository.save(orderItemCustomization);
    }

    // may not need
    public OrderItemCustomization deleteOrderItemCustomization(OrderItemCustomizationDTO orderItemCustomizationDTO) {
        OrderItemCustomization orderItemCustomization = orderItemCustomizationRepository.findById(orderItemCustomizationDTO.getOrderItemCustomizationId()).orElseThrow(() -> new AppException(ErrorCode.ORDERITEM_CUSTOMIZATION_NOT_EXISTS));
        // subtract orderItem totalPrice
        OrderItem orderItem = orderItemCustomization.getOrderItem();
        orderItem.setTotalPrice(orderItem.getTotalPrice().subtract(orderItemCustomization.getTotalPrice()));
        orderItemRepository.save(orderItem);
        orderItemCustomizationRepository.delete(orderItemCustomization);
        return orderItemCustomization;
    }
}
