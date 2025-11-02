package com.example.backend.repository;

import com.example.backend.entities.Customization;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface CustomizationRepository extends JpaRepository<Customization, UUID> {
    List<Customization> findAllByRestaurant_RestaurantIdAndStatusTrue(UUID restaurantId);
}
