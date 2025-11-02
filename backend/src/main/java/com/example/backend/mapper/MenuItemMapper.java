package com.example.backend.mapper;

import com.example.backend.dto.MenuItemDTO;
import com.example.backend.entities.MenuItem;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")

public interface MenuItemMapper {
    @Mapping(target = "categoryId", source = "category.categoryId")
    @Mapping(target = "restaurantId", source = "restaurant.restaurantId")
    MenuItemDTO toMenuItemDTO(MenuItem menuItem);
    MenuItem toMenuItem(MenuItemDTO menuItemDTO);
}
