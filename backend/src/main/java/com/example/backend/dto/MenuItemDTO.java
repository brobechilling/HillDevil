package com.example.backend.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Set;
import java.util.UUID;

public class MenuItemDTO {
    private UUID menuItemId;
    private String name;
    private String description;
    private BigDecimal price;
    private boolean status;
    private boolean bestSeller;
    private boolean hasCustomization;
    private UUID restaurantId;
    private UUID categoryId;
    private Set<UUID> customizationIds;
    private Instant createdAt;
    private Instant updatedAt;

    // getters/setters
    public UUID getMenuItemId() { return menuItemId; }
    public void setMenuItemId(UUID menuItemId) { this.menuItemId = menuItemId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }

    public boolean isStatus() { return status; }
    public void setStatus(boolean status) { this.status = status; }

    public boolean isBestSeller() { return bestSeller; }
    public void setBestSeller(boolean bestSeller) { this.bestSeller = bestSeller; }

    public boolean isHasCustomization() { return hasCustomization; }
    public void setHasCustomization(boolean hasCustomization) { this.hasCustomization = hasCustomization; }

    public UUID getRestaurantId() { return restaurantId; }
    public void setRestaurantId(UUID restaurantId) { this.restaurantId = restaurantId; }

    public UUID getCategoryId() { return categoryId; }
    public void setCategoryId(UUID categoryId) { this.categoryId = categoryId; }

    public Set<UUID> getCustomizationIds() { return customizationIds; }
    public void setCustomizationIds(Set<UUID> customizationIds) { this.customizationIds = customizationIds; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}