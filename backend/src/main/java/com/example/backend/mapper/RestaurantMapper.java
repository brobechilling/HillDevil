package com.example.backend.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import com.example.backend.dto.RestaurantDTO;
import com.example.backend.entities.Restaurant;

@Mapper(componentModel = "spring")
public interface RestaurantMapper {

    @Mapping(source = "user.userId", target = "userId")
    RestaurantDTO toRestaurantDto(Restaurant restaurant);

    @Mapping(source = "userId", target = "user.userId")
    Restaurant toRestaurant(RestaurantDTO dto);
}
