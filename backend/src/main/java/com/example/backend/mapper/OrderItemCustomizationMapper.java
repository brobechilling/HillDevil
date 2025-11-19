package com.example.backend.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import com.example.backend.dto.OrderItemCustomizationDTO;
import com.example.backend.dto.request.CreateOrderItemCustomizationRequest;
import com.example.backend.entities.OrderItemCustomization;


@Mapper(componentModel = "spring")
public interface OrderItemCustomizationMapper {

    @Mapping(target = "customizationName", source = "customization.name")
    @Mapping(target = "customizationId", source = "customization.customizationId")
    OrderItemCustomizationDTO toOrderItemCustomizationDTO(OrderItemCustomization entity);

    @Mapping(target = "customization", ignore = true)
    @Mapping(target = "orderItem", ignore = true)
    OrderItemCustomization createOrderItemCustomization(CreateOrderItemCustomizationRequest createOrderItemCustomizationRequest);
}
