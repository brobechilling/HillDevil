package com.example.backend.dto;

import java.math.BigDecimal;
import java.util.UUID;

public class OrderItemCustomizationDTO {
    private UUID orderItemCustomizationId = UUID.randomUUID();
    private String customizationName;
    private int quantity;
    private BigDecimal totalPrice;
    private UUID customizationId;

    public UUID getOrderItemCustomizationId() {
        return orderItemCustomizationId;
    }

    public void setOrderItemCustomizationId(UUID orderItemCustomizationId) {
        this.orderItemCustomizationId = orderItemCustomizationId;
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

    public String getCustomizationName() {
        return customizationName;
    }

    public void setCustomizationName(String customizationName) {
        this.customizationName = customizationName;
    }

    public UUID getCustomizationId() {
        return customizationId;
    }

    public void setCustomizationId(UUID customizationId) {
        this.customizationId = customizationId;
    }
    
}
