package com.example.backend.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.BeanMapping;
import org.mapstruct.NullValuePropertyMappingStrategy;

import com.example.backend.dto.BranchDTO;
import com.example.backend.entities.Branch;

@Mapper(componentModel = "spring")
public interface BranchMapper {

    @Mapping(source = "restaurant.restaurantId", target = "restaurantId")
    BranchDTO toDto(Branch branch);

    @Mapping(source = "restaurantId", target = "restaurant.restaurantId")
    Branch toEntity(BranchDTO dto);

    @Mapping(target = "branchId", ignore = true)
    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(source = "restaurantId", target = "restaurant.restaurantId")
    void updateEntityFromDto(BranchDTO dto, @MappingTarget Branch entity);
}
