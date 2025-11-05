package com.example.backend.dto;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public class OrderItemDTO {
    private UUID orderItemId;
    private UUID menuItemId;
    private int quantity;
    private BigDecimal totalPrice;
    private String note;
    private boolean status;

    private List<OrderItemCustomizationDTO> customizations;

    public UUID getOrderItemId() {
        return orderItemId;
    }

    public void setOrderItemId(UUID orderItemId) {
        this.orderItemId = orderItemId;
    }

    public List<OrderItemCustomizationDTO> getCustomizations() {
        return customizations;
    }

    public void setCustomizations(List<OrderItemCustomizationDTO> customizations) {
        this.customizations = customizations;
    }

    public boolean isStatus() {
        return status;
    }

    public void setStatus(boolean status) {
        this.status = status;
    }

    public String getNote() {
        return note;
    }

    public void setNote(String note) {
        this.note = note;
    }

    public BigDecimal getTotalPrice() {
        return totalPrice;
    }

    public void setTotalPrice(BigDecimal totalPrice) {
        this.totalPrice = totalPrice;
    }

    public int getQuantity() {
        return quantity;
    }

    public void setQuantity(int quantity) {
        this.quantity = quantity;
    }

    public UUID getMenuItemId() {
        return menuItemId;
    }

    public void setMenuItemId(UUID menuItemId) {
        this.menuItemId = menuItemId;
    }
}
