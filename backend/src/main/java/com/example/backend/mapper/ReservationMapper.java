package com.example.backend.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import com.example.backend.dto.request.CreateReservationRequest;
import com.example.backend.dto.response.ReservationResponse;
import com.example.backend.entities.Reservation;

@Mapper(componentModel = "spring")
public interface ReservationMapper {

    @Mapping(source = "branch.branchId", target = "branchId")
    @Mapping(source = "areaTable.areaTableId", target = "areaTableId")
    ReservationResponse toDto(Reservation entity);

    @Mapping(target = "reservationId", ignore = true)
    Reservation toEntity(CreateReservationRequest req);

}
