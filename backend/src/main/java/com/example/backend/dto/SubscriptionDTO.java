package com.example.backend.dto;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public class SubscriptionDTO {
    private UUID subscriptionId;
    private UUID restaurantId;
    private UUID packageId;
    private boolean status;
    private Instant createdAt;
    private Instant updatedAt;
    private LocalDate startDate;
    private LocalDate endDate;

    private List<SubscriptionPaymentDTO> payments;

    public UUID getSubscriptionId() {
        return subscriptionId;
    }

    public void setSubscriptionId(UUID subscriptionId) {
        this.subscriptionId = subscriptionId;
    }

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

    public boolean isStatus() {
        return status;
    }

    public void setStatus(boolean status) {
        this.status = status;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }

    public LocalDate getEndDate() {
        return endDate;
    }

    public void setEndDate(LocalDate endDate) {
        this.endDate = endDate;
    }

    public List<SubscriptionPaymentDTO> getPayments() {
        return payments;
    }

    public void setPayments(List<SubscriptionPaymentDTO> payments) {
        this.payments = payments;
    }

}
