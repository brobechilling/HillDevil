package com.example.backend.mapper;

import com.example.backend.dto.BillDTO;
import com.example.backend.entities.Bill;
import org.mapstruct.*;
import java.util.List;

@Mapper(componentModel = "spring")
public interface BillMapper {

    // @Mapping(source = "order.orderId", target = "orderId")
    // BillDTO toBillDTO(Bill bill);

    // List<BillDTO> toDtoList(List<Bill> bills);
}
