package com.example.backend.dto.request;

import java.math.BigDecimal;
import java.util.UUID;

public class CreateOrderItemCustomizationRequest {

    private UUID customizationId;
    private int quantity;
    private BigDecimal totalPrice;

    public UUID getCustomizationId() {
        return customizationId;
    }

    public void setCustomizationId(UUID customizationId) {
        this.customizationId = customizationId;
    }

    public int getQuantity() {
        return quantity;
    }

    public void setQuantity(int quantity) {
        this.quantity = quantity;
    }

    public BigDecimal getTotalPrice() {
        return totalPrice;
    }

    public void setTotalPrice(BigDecimal totalPrice) {
        this.totalPrice = totalPrice;
    }
}
