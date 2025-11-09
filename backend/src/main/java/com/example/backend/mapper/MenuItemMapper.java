package com.example.backend.mapper;

import com.example.backend.dto.MenuItemDTO;
import com.example.backend.entities.Customization;
import com.example.backend.entities.MenuItem;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Mapper(componentModel = "spring")
public interface MenuItemMapper {

    @Mapping(target = "categoryId", source = "category.categoryId")
    @Mapping(target = "restaurantId", source = "restaurant.restaurantId")
    @Mapping(target = "customizationIds", expression = "java(mapCustomizations(menuItem.getCustomizations()))")
    MenuItemDTO toMenuItemDTO(MenuItem menuItem);

    MenuItem toMenuItem(MenuItemDTO menuItemDTO);

    default Set<UUID> mapCustomizations(Set<Customization> customizations) {
        if (customizations == null) return null;
        return customizations.stream()
                .map(Customization::getCustomizationId)
                .collect(Collectors.toSet());
    }
}