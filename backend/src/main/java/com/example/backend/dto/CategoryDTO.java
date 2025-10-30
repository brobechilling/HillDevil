package com.example.backend.dto;

import java.time.Instant;
import java.util.Set;
import java.util.UUID;

public class CategoryDTO {
    private UUID categoryId;
    private String name;
    private UUID restaurantId;
    private Instant createdAt;
    private Instant updatedAt;
    private Set<UUID> customizationIds;

    public UUID getCategoryId() { return categoryId; }
    public void setCategoryId(UUID categoryId) { this.categoryId = categoryId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public UUID getRestaurantId() { return restaurantId; }
    public void setRestaurantId(UUID restaurantId) { this.restaurantId = restaurantId; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }

    public Set<UUID> getCustomizationIds() { return customizationIds; }
    public void setCustomizationIds(Set<UUID> customizationIds) { this.customizationIds = customizationIds; }
}
