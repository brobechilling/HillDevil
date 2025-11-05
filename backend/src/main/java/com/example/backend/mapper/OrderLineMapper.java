package com.example.backend.mapper;

import com.example.backend.dto.OrderLineDTO;
import com.example.backend.entities.OrderLine;
import org.mapstruct.*;
import java.util.List;

@Mapper(componentModel = "spring", uses = {OrderItemMapper.class})
public interface OrderLineMapper {

    @Mapping(source = "orderLineStatus", target = "orderLineStatus")
    OrderLineDTO toOrderLineDTO(OrderLine orderLine);

    List<OrderLineDTO> toDtoList(List<OrderLine> orderLines);
}
