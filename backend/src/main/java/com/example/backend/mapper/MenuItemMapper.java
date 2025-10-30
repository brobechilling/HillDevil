package com.example.backend.mapper;

import com.example.backend.dto.MenuItemDTO;
import com.example.backend.entities.MenuItem;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")

public interface MenuItemMapper {
    MenuItemDTO toMenuItemDTO(MenuItem menuItem);
    MenuItem toMenuItem(MenuItemDTO menuItemDTO);
}
