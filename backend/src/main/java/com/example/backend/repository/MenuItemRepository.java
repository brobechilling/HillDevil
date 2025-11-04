package com.example.backend.repository;

import com.example.backend.entities.MenuItem;
import com.example.backend.entities.MenuItemStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface MenuItemRepository extends JpaRepository<MenuItem, UUID> {
    List<MenuItem> findAllByRestaurant_RestaurantIdAndStatus(UUID restaurantId, MenuItemStatus status);
}
