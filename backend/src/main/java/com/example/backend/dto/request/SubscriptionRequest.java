package com.example.backend.dto.request;

import java.util.UUID;

public class SubscriptionRequest {
    private UUID restaurantId;
    private UUID packageId;

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
}
