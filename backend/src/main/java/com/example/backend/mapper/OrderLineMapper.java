package com.example.backend.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import com.example.backend.dto.OrderLineDTO;
import com.example.backend.dto.request.CreateOrderLineRequest;
import com.example.backend.entities.OrderLine;

@Mapper(componentModel = "spring", uses = {OrderItemMapper.class})
public interface OrderLineMapper {

    // @Mapping(source = "orderLineStatus", target = "orderLineStatus")
    // OrderLineDTO toOrderLineDTO(OrderLine orderLine);

    @Mapping(target = "order", ignore = true)
    OrderLine createOrderLine(CreateOrderLineRequest createOrderLineRequest);

}
