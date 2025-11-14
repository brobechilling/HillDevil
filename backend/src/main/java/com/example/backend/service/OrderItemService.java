package com.example.backend.service;

import com.example.backend.dto.OrderItemDTO;
import com.example.backend.dto.OrderLineDTO;
import com.example.backend.dto.request.CreateOrderItemRequest;
import com.example.backend.entities.MenuItem;
import com.example.backend.entities.OrderItem;
import com.example.backend.entities.OrderItemCustomization;
import com.example.backend.entities.OrderLine;
import com.example.backend.exception.AppException;
import com.example.backend.exception.ErrorCode;
import com.example.backend.mapper.OrderItemMapper;
import com.example.backend.mapper.OrderLineMapper;
import com.example.backend.repository.MenuItemRepository;
import com.example.backend.repository.OrderItemRepository;
import com.example.backend.repository.OrderLineRepository;

import org.springframework.stereotype.Service;

import java.math.BigDecimal;
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
    private final OrderLineMapper orderLineMapper;
    private final OrderLineRepository orderLineRepository;

    public OrderItemService(OrderItemRepository orderItemRepository,
                            MenuItemRepository menuItemRepository,
                            OrderItemCustomizationService orderItemCustomizationService,
                            OrderItemMapper orderItemMapper,
                            OrderLineMapper orderLineMapper,
                            OrderLineRepository orderLineRepository) {
        this.orderItemRepository = orderItemRepository;
        this.menuItemRepository = menuItemRepository;
        this.orderItemCustomizationService = orderItemCustomizationService;
        this.orderItemMapper = orderItemMapper;
        this.orderLineMapper = orderLineMapper;
        this.orderLineRepository = orderLineRepository;
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

    // waiter action
    // update orderItem: increase quantity or remove an orderItem, change customization for an orderItem
    public OrderItemDTO updateOrderItem(OrderItemDTO orderItemDTO) {
        OrderItem orderItem = orderItemRepository.findById(orderItemDTO.getOrderItemId()).orElseThrow(() -> new AppException(ErrorCode.ORDERITEM_NOT_EXISTS));
        orderItem.setNote(orderItemDTO.getNote());
        orderItem.setQuantity(orderItem.getQuantity());
        orderItem.setStatus(orderItem.isStatus());
        Set<OrderItemCustomization> oldCustomization = orderItem.getOrderItemCustomizations();
        Set<OrderItemCustomization> newCustomization = orderItemDTO.getCustomizations().stream().map(orderItemCustomizationDTO -> orderItemCustomizationService.udpateOrderItemCustomization(orderItemCustomizationDTO)).collect(Collectors.toSet());
        orderItem.setOrderItemCustomizations(newCustomization);
        BigDecimal basePrice = orderItem.getTotalPrice().subtract(getCustomizationPrice(oldCustomization));
        // re-calculate orderItem's totalPrice
        orderItem.setTotalPrice(basePrice.add(getCustomizationPrice(newCustomization)));
        orderItem = orderItemRepository.save(orderItem);
        // re-calculate totalPrice after update orderItem
        OrderLine orderLine = orderItem.getOrderLine();
        orderLine.setTotalPrice(getOrderLinePrice(orderLine.getOrderItems()));
        orderLineRepository.save(orderLine);
        return orderItemMapper.toOrderItemDTO(orderItem);
    }

    private BigDecimal getOrderLinePrice(Set<OrderItem> orderItems) {
        BigDecimal orderLinePrice = BigDecimal.ZERO;
        for (OrderItem orderItem : orderItems) {
            if (orderItem.isStatus())
                orderLinePrice = orderLinePrice.add(orderItem.getTotalPrice());
        }
        return orderLinePrice;
    }

    // implement soft delete -> api still return back -> no need to delete orderItemCustomization
    public boolean deleteOrderItemDTO(OrderItemDTO orderItemDTO) {
        OrderItem orderItem = orderItemRepository.findById(orderItemDTO.getOrderItemId()).orElseThrow(() -> new AppException(ErrorCode.ORDERITEM_NOT_EXISTS));
        orderItem.setStatus(false);
        orderItem = orderItemRepository.save(orderItem);
        // re-calculate totalPrice after update orderItem
        OrderLine orderLine = orderItem.getOrderLine();
        orderLine.setTotalPrice(getOrderLinePrice(orderLine.getOrderItems()));
        return orderLineRepository.save(orderLine) != null;
    }

}
