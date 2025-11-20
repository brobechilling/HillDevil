package com.example.backend.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import com.example.backend.dto.OrderLineDTO;
import com.example.backend.entities.OrderLine;

@Mapper(componentModel = "spring", uses = {OrderItemMapper.class})
public interface OrderLineMapper {

    @Mapping(target = "tableTag", ignore = true)
    @Mapping(target = "areaName", ignore = true)
    OrderLineDTO toOrderLineDTO(OrderLine orderLine);

}
