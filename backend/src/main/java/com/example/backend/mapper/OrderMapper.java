package com.example.backend.mapper;

import com.example.backend.dto.OrderDTO;
import com.example.backend.entities.Order;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring", uses = {OrderLineMapper.class})
public interface OrderMapper {
    @Mapping(source = "areaTable.tag", target = "tableTag")
    @Mapping(source = "status", target = "status")
    OrderDTO toOrderDTO(Order order);
    List<OrderDTO> toDtoList(List<Order> orders);
}
