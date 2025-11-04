package com.example.backend.dto.request;

import java.util.Set;
import java.util.UUID;

public class CategoryCreateRequest {
    private String name;
    private UUID restaurantId;
    private Set<UUID> customizationIds;

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public UUID getRestaurantId() { return restaurantId; }
    public void setRestaurantId(UUID restaurantId) { this.restaurantId = restaurantId; }

    public Set<UUID> getCustomizationIds() { return customizationIds; }
    public void setCustomizationIds(Set<UUID> customizationIds) { this.customizationIds = customizationIds; }
}
