package com.example.backend.dto.request;

import java.math.BigDecimal;
import java.util.UUID;
import java.util.List;

public class CreateOrderItemRequest {

    private UUID menuItemId;
    private int quantity;
    // totalPrice is calculated in frontend by List<CreateOrderItemCustomizationRequest>
    // can change later
    private BigDecimal totalPrice;
    private String note;
    private boolean status = true;
    private List<CreateOrderItemCustomizationRequest> customizations;

    public UUID getMenuItemId() {
        return menuItemId;
    }

    public void setMenuItemId(UUID menuItemId) {
        this.menuItemId = menuItemId;
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

    public String getNote() {
        return note;
    }

    public void setNote(String note) {
        this.note = note;
    }

    public boolean isStatus() {
        return status;
    }

    public void setStatus(boolean status) {
        this.status = status;
    }

    public List<CreateOrderItemCustomizationRequest> getCustomizations() {
        return customizations;
    }

    public void setCustomizations(List<CreateOrderItemCustomizationRequest> customizations) {
        this.customizations = customizations;
    }
}
