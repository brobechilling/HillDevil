package com.example.backend.dto.response;

import com.example.backend.entities.OrderStatus;

public class UpdateOrderStatusResponse {
    
    private boolean successful;
    private OrderStatus previousStatus;
    private OrderStatus newStatus;
    
    public boolean isSuccessful() {
        return successful;
    }
    public void setSuccessful(boolean successful) {
        this.successful = successful;
    }
    public OrderStatus getPreviousStatus() {
        return previousStatus;
    }
    public void setPreviousStatus(OrderStatus previousStatus) {
        this.previousStatus = previousStatus;
    }
    public OrderStatus getNewStatus() {
        return newStatus;
    }
    public void setNewStatus(OrderStatus newStatus) {
        this.newStatus = newStatus;
    }

    
}
