package com.example.backend.dto.request;

import java.math.BigDecimal;
import java.util.UUID;

public class SubscriptionRequest {
    private UUID restaurantId;
    private UUID packageId;
    private BigDecimal amount;

    public UUID getRestaurantId() {
        return restaurantId;
    }

    public void setRestaurantId(UUID restaurantId) {
        this.restaurantId = restaurantId;
    }

    public UUID getPackageId() {
        return packageId;
    }

    public void setPackageId(UUID packageId) {
        this.packageId = packageId;
    }

    public BigDecimal getAmount() {
        return amount;
    }
    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }
}
