package com.example.backend.mapper;

import com.example.backend.dto.CustomizationDTO;
import com.example.backend.entities.Customization;
import com.example.backend.entities.Restaurant;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

import java.util.UUID;

@Mapper(componentModel = "spring")
public interface CustomizationMapper {

    // Map từ entity → DTO
    @Mapping(target = "restaurantId", source = "restaurant.restaurantId")
    CustomizationDTO toCustomizationDTO(Customization customization);

    // Map từ DTO → entity
    @Mapping(target = "restaurant", source = "restaurantId", qualifiedByName = "mapRestaurantFromId")
    Customization toCustomization(CustomizationDTO customizationDTO);

    @Named("mapRestaurantFromId")
    default Restaurant mapRestaurantFromId(UUID restaurantId) {
        if (restaurantId == null) return null;
        Restaurant restaurant = new Restaurant();
        restaurant.setRestaurantId(restaurantId);
        return restaurant;
    }
}
