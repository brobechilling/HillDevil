package com.example.backend.mapper;

import com.example.backend.dto.OrderItemCustomizationDTO;
import com.example.backend.entities.Customization;
import com.example.backend.entities.OrderItemCustomization;
import org.mapstruct.*;

import java.util.List;
import java.util.UUID;

@Mapper(componentModel = "spring")
public interface OrderItemCustomizationMapper {

    @Mapping(source = "customization.customizationId", target = "customizationId")
    OrderItemCustomizationDTO toOrderItemCustomizationDTO(OrderItemCustomization entity);
    List<OrderItemCustomizationDTO> toDtoList(List<OrderItemCustomization> list);

    @Mapping(target = "orderItem", ignore = true)
    @Mapping(target = "customization", expression = "java(mapCustomization(dto.getCustomizationId()))")
    OrderItemCustomization toOrderItemCustomization(OrderItemCustomizationDTO dto);

    default Customization mapCustomization(UUID id) {
        if (id == null) return null;
        Customization c = new Customization();
        c.setCustomizationId(id);
        return c;
    }
}
