package com.example.backend.mapper;

import com.example.backend.dto.response.MenuPublicResponse;
import com.example.backend.dto.response.RestaurantPublicResponse;
import com.example.backend.entities.Branch;
import com.example.backend.entities.MenuItem;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface PublicPageMapper {

    @Mapping(source = "branchId", target = "branchId")
    @Mapping(source = "branchPhone", target = "phone")
    @Mapping(source = "mail", target = "email")
    @Mapping(source = "openingTime", target = "openingTime")
    @Mapping(source = "closingTime", target = "closingTime")
    RestaurantPublicResponse.BranchInfo branchToBranchInfo(Branch branch);

    @Mapping(source = "menuItemId", target = "id")
    @Mapping(source = "category.name", target = "category")
    MenuPublicResponse.MenuItemDTO menuItemToMenuItemDTO(MenuItem menuItem);
}
