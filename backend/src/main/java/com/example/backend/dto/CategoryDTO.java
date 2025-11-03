package com.example.backend.dto;

import java.time.Instant;
import java.util.Set;
import java.util.UUID;

public class CategoryDTO {
    private UUID categoryId;
    private String name;
    private UUID restaurantId;
    private Set<UUID> customizationIds;

    public UUID getCategoryId() { return categoryId; }
    public void setCategoryId(UUID categoryId) { this.categoryId = categoryId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public UUID getRestaurantId() { return restaurantId; }
    public void setRestaurantId(UUID restaurantId) { this.restaurantId = restaurantId; }


    public Set<UUID> getCustomizationIds() { return customizationIds; }
    public void setCustomizationIds(Set<UUID> customizationIds) { this.customizationIds = customizationIds; }
}
