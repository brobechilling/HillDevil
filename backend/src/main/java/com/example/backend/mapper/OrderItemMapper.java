package com.example.backend.mapper;

import com.example.backend.dto.OrderItemDTO;
import com.example.backend.entities.MenuItem;
import com.example.backend.entities.OrderItem;
import org.mapstruct.*;

import java.util.List;
import java.util.UUID;

@Mapper(componentModel = "spring", uses = {OrderItemCustomizationMapper.class})
public interface OrderItemMapper {

    // Entity → DTO
    @Mapping(source = "menuItem.menuItemId", target = "menuItemId")
    OrderItemDTO toOrderItemDTO(OrderItem orderItem);
    List<OrderItemDTO> toDtoList(List<OrderItem> orderItems);

    // DTO → Entity
    @Mapping(target = "orderLine", ignore = true) // sẽ set ở service
    @Mapping(target = "menuItem", expression = "java(mapMenuItem(dto.getMenuItemId()))")
    OrderItem toOrderItem(OrderItemDTO dto);

    default MenuItem mapMenuItem(UUID id) {
        if (id == null) return null;
        MenuItem m = new MenuItem();
        m.setMenuItemId(id);
        return m;
    }
}
