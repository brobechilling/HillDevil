package com.example.backend.dto.request;

import java.math.BigDecimal;
import java.util.UUID;

public class CustomizationCreateRequest {
    private String name;
    private BigDecimal price;
    private UUID restaurantId;

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public  BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }

    public UUID getRestaurantId() { return restaurantId; }
    public void setRestaurantId(UUID restaurantId) { this.restaurantId = restaurantId; }
}