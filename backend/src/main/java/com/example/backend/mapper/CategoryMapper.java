package com.example.backend.mapper;

import com.example.backend.dto.CategoryDTO;
import com.example.backend.entities.Category;
import com.example.backend.entities.Customization;
import com.example.backend.entities.Restaurant;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Mapper(componentModel = "spring")
public interface CategoryMapper {

    @Mapping(target = "restaurantId", source = "restaurant.restaurantId")
    @Mapping(target = "customizationIds", source = "customizations", qualifiedByName = "mapCustomizationsToIds")
    CategoryDTO toCategoryDTO(Category category);

    @Mapping(target = "restaurant", source = "restaurantId", qualifiedByName = "mapRestaurantFromId")
    @Mapping(target = "customizations", source = "customizationIds", qualifiedByName = "mapIdsToCustomizations")
    Category toCategory(CategoryDTO dto);

    @Named("mapRestaurantFromId")
    default Restaurant mapRestaurantFromId(UUID restaurantId) {
        if (restaurantId == null) return null;
        Restaurant restaurant = new Restaurant();
        restaurant.setRestaurantId(restaurantId);
        return restaurant;
    }

    @Named("mapCustomizationsToIds")
    default Set<UUID> mapCustomizationsToIds(Set<Customization> customizations) {
        if (customizations == null || customizations.isEmpty()) return Set.of();

        // 🔹 Lọc chỉ customizations đang active (status = true)
        return customizations.stream()
                .filter(Customization::isStatus)
                .map(Customization::getCustomizationId)
                .collect(Collectors.toSet());
    }

    @Named("mapIdsToCustomizations")
    default Set<Customization> mapIdsToCustomizations(Set<UUID> ids) {
        if (ids == null || ids.isEmpty()) return Set.of();

        return ids.stream().map(id -> {
            Customization c = new Customization();
            c.setCustomizationId(id);
            return c;
        }).collect(Collectors.toSet());
    }
}
