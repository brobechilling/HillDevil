package com.example.backend.dto.response;

import com.example.backend.entities.OrderLineStatus;

public class UpdateOrderLineStatusResponse {
    private boolean isSuccessful;
    private OrderLineStatus previousStatus;
    private OrderLineStatus newStatus;
    
    public boolean isSuccessful() {
        return isSuccessful;
    }
    public void setSuccessful(boolean isSuccessful) {
        this.isSuccessful = isSuccessful;
    }
    public OrderLineStatus getPreviousStatus() {
        return previousStatus;
    }
    public void setPreviousStatus(OrderLineStatus previousStatus) {
        this.previousStatus = previousStatus;
    }
    public OrderLineStatus getNewStatus() {
        return newStatus;
    }
    public void setNewStatus(OrderLineStatus newStatus) {
        this.newStatus = newStatus;
    }
    
}
