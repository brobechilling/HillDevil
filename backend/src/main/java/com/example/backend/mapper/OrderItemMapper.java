package com.example.backend.mapper;

import com.example.backend.dto.OrderItemDTO;
import com.example.backend.dto.request.CreateOrderItemRequest;
import com.example.backend.entities.OrderItem;
import org.mapstruct.*;

@Mapper(componentModel = "spring", uses = {OrderItemCustomizationMapper.class})
public interface OrderItemMapper {

    @Mapping(target = "customizations", ignore = true) // manually handled in servcie
    @Mapping(target = "menuItemName", source = "menuItem.name")
    OrderItemDTO toOrderItemDTO(OrderItem orderItem);

    // manually handled in servcie
    @Mapping(target = "menuItem", ignore = true)
    @Mapping(target = "orderItemCustomizations", ignore = true)
    @Mapping(target = "orderLine", ignore = true)
    OrderItem createOrderItem(CreateOrderItemRequest createOrderItemRequest);

}
