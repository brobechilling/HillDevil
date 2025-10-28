package com.example.backend.dto;

import com.example.backend.dto.response.SubscriptionPaymentResponse;
import com.example.backend.dto.response.SubscriptionResponse;

import java.util.List;
import java.util.UUID;

public class RestaurantSubscriptionOverviewDTO {
    private UUID restaurantId;
    private String restaurantName;
    private SubscriptionResponse currentSubscription;
    private List<SubscriptionPaymentResponse> paymentHistory;

    public UUID getRestaurantId() {
        return restaurantId;
    }

    public void setRestaurantId(UUID restaurantId) {
        this.restaurantId = restaurantId;
    }

    public SubscriptionResponse getCurrentSubscription() {
        return currentSubscription;
    }

    public void setCurrentSubscription(SubscriptionResponse currentSubscription) {
        this.currentSubscription = currentSubscription;
    }

    public String getRestaurantName() {
        return restaurantName;
    }

    public void setRestaurantName(String restaurantName) {
        this.restaurantName = restaurantName;
    }

    public List<SubscriptionPaymentResponse> getPaymentHistory() {
        return paymentHistory;
    }

    public void setPaymentHistory(List<SubscriptionPaymentResponse> paymentHistory) {
        this.paymentHistory = paymentHistory;
    }
}
