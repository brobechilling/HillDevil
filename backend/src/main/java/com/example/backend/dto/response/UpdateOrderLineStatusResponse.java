package com.example.backend.dto.response;

import com.example.backend.entities.OrderLineStatus;

public class UpdateOrderLineStatusResponse {
    private boolean successful;
    private OrderLineStatus previousStatus;
    private OrderLineStatus newStatus;
    
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
    public boolean isSuccessful() {
        return successful;
    }
    public void setSuccessful(boolean successful) {
        this.successful = successful;
    }
    
}
