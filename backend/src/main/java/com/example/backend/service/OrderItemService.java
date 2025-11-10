package com.example.backend.service;

import com.example.backend.dto.OrderItemDTO;
import com.example.backend.dto.request.CreateOrderItemRequest;
import com.example.backend.entities.MenuItem;
import com.example.backend.entities.OrderItem;
import com.example.backend.entities.OrderItemCustomization;
import com.example.backend.entities.OrderLine;
import com.example.backend.exception.AppException;
import com.example.backend.exception.ErrorCode;
import com.example.backend.mapper.OrderItemMapper;
import com.example.backend.repository.MenuItemRepository;
import com.example.backend.repository.OrderItemRepository; 
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class OrderItemService {

    private final OrderItemRepository orderItemRepository;
    private final MenuItemRepository menuItemRepository;
    private final OrderItemCustomizationService orderItemCustomizationService;
    private final OrderItemMapper orderItemMapper;

    public OrderItemService(OrderItemRepository orderItemRepository,
                            MenuItemRepository menuItemRepository,
                            OrderItemCustomizationService orderItemCustomizationService,
                            OrderItemMapper orderItemMapper) {
        this.orderItemRepository = orderItemRepository;
        this.menuItemRepository = menuItemRepository;
        this.orderItemCustomizationService = orderItemCustomizationService;
        this.orderItemMapper = orderItemMapper;
    }

    // called by OrderLineService, when customer create a request -> no response back to customer
    public Set<OrderItem> createOrderItem(List<CreateOrderItemRequest> createOrderItemRequestList, OrderLine orderLine) {
        Set<OrderItem> orderItems = new LinkedHashSet<>();
        for (CreateOrderItemRequest createOrderItemRequest : createOrderItemRequestList) {
            OrderItem orderItem = orderItemMapper.createOrderItem(createOrderItemRequest);
            MenuItem menuItem = menuItemRepository.findById(createOrderItemRequest.getMenuItemId()).orElseThrow(() -> new AppException(ErrorCode.MENUITEM_NOT_FOUND));
            orderItem.setMenuItem(menuItem);
            orderItem.setOrderLine(orderLine);
            OrderItem savedOrderItem = orderItemRepository.save(orderItem);
            // save the orderItem first then fetch it and use in orderItemCustomizationService.createOrderItemCustomization 
            savedOrderItem.setOrderItemCustomizations(orderItemCustomizationService.createOrderItemCustomization(savedOrderItem, createOrderItemRequest.getCustomizations()));
            BigDecimal basePrice = menuItem.getPrice().multiply(BigDecimal.valueOf(createOrderItemRequest.getQuantity()));
            savedOrderItem.setTotalPrice(basePrice.add(getCustomizationPrice(savedOrderItem.getOrderItemCustomizations())));
            orderItems.add(orderItemRepository.save(savedOrderItem));
        }
        return orderItems;
    }

    private BigDecimal getCustomizationPrice(Set<OrderItemCustomization> orderItemCustomizations) {
        BigDecimal customizationTotal = BigDecimal.ZERO;
        for (OrderItemCustomization orderItemCustomization : orderItemCustomizations) {
            customizationTotal = customizationTotal.add(orderItemCustomization.getTotalPrice());
        }
        return customizationTotal;
    }

}
