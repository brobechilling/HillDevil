package com.example.backend.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.BeanMapping;
import org.mapstruct.NullValuePropertyMappingStrategy;

import com.example.backend.dto.request.CreateTableRequest;
import com.example.backend.dto.response.AreaTableResponse;
import com.example.backend.dto.response.TableResponse;
import com.example.backend.entities.AreaTable;

@Mapper(componentModel = "spring")
public interface TableMapper {

    /**
     * Map AreaTable entity sang TableResponse DTO
     * ✅ ĐỒNG BỘ với TableResponse (có areaId và areaName)
     */
    @Mapping(source = "areaTableId", target = "id")
    @Mapping(source = "tag", target = "tag")
    @Mapping(source = "capacity", target = "capacity")
    @Mapping(source = "status", target = "status")
    @Mapping(target = "reservedBy", ignore = true) // Set thủ công trong service
    @Mapping(source = "area.areaId", target = "areaId")
    @Mapping(source = "area.name", target = "areaName")
    TableResponse toTableResponse(AreaTable table);

    /**
     * Map AreaTable entity sang AreaTableResponse DTO (với nested fields)
     */
    @Mapping(source = "areaTableId", target = "areaTableId")
    @Mapping(source = "tag", target = "tag")
    @Mapping(source = "capacity", target = "capacity")
    @Mapping(source = "status", target = "status")
    @Mapping(source = "qr", target = "qr")
    @Mapping(source = "area.areaId", target = "areaId")
    @Mapping(source = "area.name", target = "areaName")
    @Mapping(source = "area.branch.branchId", target = "branchId")
    @Mapping(source = "area.branch.address", target = "branchAddress")
    AreaTableResponse toAreaTableResponse(AreaTable table);

    /**
     * Map CreateTableRequest DTO sang AreaTable entity (cho create)
     */
    @Mapping(target = "areaTableId", ignore = true)
    @Mapping(target = "area", ignore = true) // Set từ service
    @Mapping(target = "status", ignore = true) // Set mặc định từ service
    @Mapping(target = "qr", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "reservations", ignore = true)
    @Mapping(target = "orders", ignore = true)
    AreaTable toEntity(CreateTableRequest request);

    /**
     * Update entity từ CreateTableRequest (cho update partial)
     */
    @Mapping(target = "areaTableId", ignore = true)
    @Mapping(target = "area", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "qr", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "reservations", ignore = true)
    @Mapping(target = "orders", ignore = true)
    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updateEntityFromRequest(CreateTableRequest request, @MappingTarget AreaTable table);
}