package com.example.backend.service;

import com.example.backend.dto.OrderItemCustomizationDTO;
import com.example.backend.dto.OrderItemDTO;
import com.example.backend.dto.request.CreateOrderItemRequest;
import com.example.backend.entities.MenuItem;
import com.example.backend.entities.OrderItem;
import com.example.backend.entities.OrderLine;
import com.example.backend.exception.AppException;
import com.example.backend.exception.ErrorCode;
import com.example.backend.mapper.OrderItemMapper;
import com.example.backend.repository.MenuItemRepository;
import com.example.backend.repository.OrderItemRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Service
public class OrderItemService {

    private final OrderItemRepository orderItemRepository;
    private final MenuItemRepository menuItemRepository;
    private final OrderItemCustomizationService customizationService;
    private final OrderItemMapper mapper;

    public OrderItemService(OrderItemRepository orderItemRepository,
                            MenuItemRepository menuItemRepository,
                            OrderItemCustomizationService customizationService,
                            OrderItemMapper mapper) {
        this.orderItemRepository = orderItemRepository;
        this.menuItemRepository = menuItemRepository;
        this.customizationService = customizationService;
        this.mapper = mapper;
    }

    @Transactional
    public List<OrderItemDTO> createOrderItems(List<CreateOrderItemRequest> requests, OrderLine orderLine) {
        List<OrderItemDTO> results = new ArrayList<>();

        for (CreateOrderItemRequest req : requests) {
            MenuItem menuItem = menuItemRepository.findById(req.getMenuItemId())
                    .orElseThrow(() -> new AppException(ErrorCode.MENUITEM_NOT_FOUND));

            OrderItem item = new OrderItem();
            item.setOrderLine(orderLine);
            item.setMenuItem(menuItem);
            item.setQuantity(req.getQuantity());
            item.setNote(req.getNote());

            BigDecimal basePrice = menuItem.getPrice()
                    .multiply(BigDecimal.valueOf(req.getQuantity()));

            OrderItem savedItem = orderItemRepository.save(item);

            BigDecimal customizationTotal = BigDecimal.ZERO;
            if (req.getCustomizations() != null && !req.getCustomizations().isEmpty()) {
                var customizations = customizationService.createCustomizations(req.getCustomizations(), savedItem);
                customizationTotal = customizations.stream()
                        .map(OrderItemCustomizationDTO::getTotalPrice)
                        .reduce(BigDecimal.ZERO, BigDecimal::add);
            }

            BigDecimal totalPrice = basePrice.add(customizationTotal);
            savedItem.setTotalPrice(totalPrice);
            orderItemRepository.save(savedItem);

            results.add(mapper.toOrderItemDTO(savedItem));
        }

        return results;
    }

}
