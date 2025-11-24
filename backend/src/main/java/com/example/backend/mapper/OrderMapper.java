package com.example.backend.mapper;

import com.example.backend.dto.OrderDTO;
import com.example.backend.entities.Order;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;


@Mapper(componentModel = "spring", uses = {OrderLineMapper.class})
public interface OrderMapper {
    
    @Mapping(target = "tableTag", source = "areaTable.tag")
    @Mapping(target = "areaName", source = "areaTable.area.name")
    OrderDTO toOrderDTO(Order order);
}
