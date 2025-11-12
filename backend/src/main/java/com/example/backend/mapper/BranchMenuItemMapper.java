package com.example.backend.mapper;

import com.example.backend.dto.response.GuestBranchMenuItemDTO;
import com.example.backend.entities.*;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;


@Mapper(componentModel = "spring")
public interface BranchMenuItemMapper {

    @Mapping(target = "imageUrl", ignore = true)
    @Mapping(target = "name", source = "menuItem.name")
    @Mapping(target = "description", source = "menuItem.description")
    @Mapping(target = "price", source = "menuItem.price")
    @Mapping(target = "bestSeller", source = "menuItem.bestSeller")
    @Mapping(target = "categoryId", source = "menuItem.category.categoryId")
    @Mapping(target = "branchId", source = "branch.branchId")
    @Mapping(target = "menuItemId", source = "menuItem.menuItemId")
    GuestBranchMenuItemDTO toGuestBranchMenuItemDTO(BranchMenuItem branchMenuItem);
}
