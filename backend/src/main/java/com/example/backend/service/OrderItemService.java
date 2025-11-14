package com.example.backend.service;

import com.example.backend.dto.OrderItemDTO;
import com.example.backend.dto.OrderLineDTO;
import com.example.backend.dto.request.CreateOrderItemRequest;
import com.example.backend.entities.MenuItem;
import com.example.backend.entities.Order;
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
import com.example.backend.repository.OrderRepository;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class OrderItemService {

    private final OrderItemRepository orderItemRepository;
    private final MenuItemRepository menuItemRepository;
    private final OrderItemCustomizationService orderItemCustomizationService;
    private final OrderItemMapper orderItemMapper;
    private final OrderLineMapper orderLineMapper;
    private final OrderLineRepository orderLineRepository;
    private final OrderRepository orderRepository;
    private Logger logger = LoggerFactory.getLogger(getClass());

    public OrderItemService(OrderItemRepository orderItemRepository,
                            MenuItemRepository menuItemRepository,
                            OrderItemCustomizationService orderItemCustomizationService,
                            OrderItemMapper orderItemMapper,
                            OrderLineMapper orderLineMapper,
                            OrderLineRepository orderLineRepository,
                            OrderRepository orderRepository) {
        this.orderItemRepository = orderItemRepository;
        this.menuItemRepository = menuItemRepository;
        this.orderItemCustomizationService = orderItemCustomizationService;
        this.orderItemMapper = orderItemMapper;
        this.orderLineMapper = orderLineMapper;
        this.orderLineRepository = orderLineRepository;
        this.orderRepository = orderRepository;
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
        orderItem.setStatus(orderItemDTO.isStatus());
        
        // old customization handling
        Set<OrderItemCustomization> oldCustomization = orderItem.getOrderItemCustomizations();
        BigDecimal oldCustomizationPrice = getCustomizationPrice(oldCustomization);
        
        // new customization handling
        // this will update orderItemCustomization in db, not just create shallow copy of orderItemCustomization
        Set<OrderItemCustomization> newCustomization = orderItemDTO.getCustomizations().stream().filter(customization -> customization.getQuantity() != 0)
                                                                                                .map(orderItemCustomizationService::udpateOrderItemCustomization).collect(Collectors.toSet());
        BigDecimal newCustomizationPrice = getCustomizationPrice(newCustomization);
        // delete customization -> quantity must be 0
        orderItemDTO.getCustomizations().stream().filter(customization -> customization.getQuantity() == 0).forEach(orderItemCustomizationService::deleteOrderItemCustomization);
        
        // orderItem price handling
        orderItem.setOrderItemCustomizations(newCustomization);
        int oldQuantity = orderItem.getQuantity();
        orderItem.setQuantity(orderItemDTO.getQuantity());
        BigDecimal basePrice = orderItem.getTotalPrice().subtract(oldCustomizationPrice).divide(BigDecimal.valueOf(oldQuantity));
        orderItem.setTotalPrice(basePrice.multiply(BigDecimal.valueOf(orderItem.getQuantity())).add(newCustomizationPrice));
        orderItem = orderItemRepository.save(orderItem);
        
        // re-calculate totalPrice of orderLine after update orderItem
        OrderLine orderLine = orderItem.getOrderLine();
        BigDecimal oldOrderLinePrice = orderLine.getTotalPrice();
        BigDecimal newOrderLinePrice = reCalculateOrderLinePrice(orderLine);

        // may need to re-calculate totalPrice of order
        Order order = orderLine.getOrder();
        reCalculateOrderPrice(order, oldOrderLinePrice, newOrderLinePrice);

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

    // implement soft delete
    public boolean deleteOrderItem(UUID orderItemId) {
        OrderItem orderItem = orderItemRepository.findById(orderItemId).orElseThrow(() -> new AppException(ErrorCode.ORDERITEM_NOT_EXISTS));
        orderItem.setStatus(false);
        // delete orderItemCustomization
        orderItem.getOrderItemCustomizations().forEach(customization -> orderItemCustomizationService.deleteOrderItemCustomization(customization));
        orderItem.setOrderItemCustomizations(Collections.emptySet());
        orderItem = orderItemRepository.save(orderItem);
        
        // re-calculate totalPrice of orderLine after update orderItem
        OrderLine orderLine = orderItem.getOrderLine();
        BigDecimal oldOrderLinePrice = orderLine.getTotalPrice();
        BigDecimal newOrderLinePrice = reCalculateOrderLinePrice(orderLine);

        // may need to re-calculate totalPrice of order
        Order order = orderLine.getOrder();
        return reCalculateOrderPrice(order, oldOrderLinePrice, newOrderLinePrice);
    }

    private BigDecimal reCalculateOrderLinePrice(OrderLine orderLine) {
        orderLine.setTotalPrice(getOrderLinePrice(orderLine.getOrderItems()));
        orderLine = orderLineRepository.save(orderLine);
        return orderLine.getTotalPrice();
    }

    private boolean reCalculateOrderPrice(Order order, BigDecimal oldOrderLinePrice, BigDecimal newOrderLinePrice) {
        order.setTotalPrice(order.getTotalPrice().subtract(oldOrderLinePrice).add(newOrderLinePrice));
        return orderRepository.save(order) != null;
    }
}
