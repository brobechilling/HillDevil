package com.example.backend.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import com.example.backend.dto.BranchDTO;
import com.example.backend.entities.Branch;

@Mapper(componentModel = "spring")
public interface BranchMapper {

    @Mapping(source = "restaurant.restaurantId", target = "restaurantId")
    BranchDTO toDto(Branch branch);

    @Mapping(source = "restaurantId", target = "restaurant.restaurantId")
    Branch toEntity(BranchDTO dto);

    // update existing entity from dto
    @Mapping(target = "branchId", ignore = true)
    @Mapping(source = "restaurantId", target = "restaurant.restaurantId")
    void updateEntityFromDto(BranchDTO dto, @MappingTarget Branch entity);
}
