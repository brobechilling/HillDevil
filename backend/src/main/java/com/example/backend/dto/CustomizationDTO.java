package com.example.backend.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public class CustomizationDTO {
    private UUID customizationId;
    private String name;
    private BigDecimal price;
    private UUID restaurantId;
    private Instant createdAt;
    private Instant updatedAt;

    public UUID getCustomizationId() { return customizationId; }
    public void setCustomizationId(UUID customizationId) { this.customizationId = customizationId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }

    public UUID getRestaurantId() { return restaurantId; }
    public void setRestaurantId(UUID restaurantId) { this.restaurantId = restaurantId; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
