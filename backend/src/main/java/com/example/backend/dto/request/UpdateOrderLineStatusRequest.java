package com.example.backend.dto.request;

import java.util.UUID;

import com.example.backend.entities.OrderLineStatus;

public class UpdateOrderLineStatusRequest {
    
    private UUID orderLineId;
    private OrderLineStatus orderLineStatus;
    
    public UUID getOrderLineId() {
        return orderLineId;
    }
    public void setOrderLineId(UUID orderLineId) {
        this.orderLineId = orderLineId;
    }
    public OrderLineStatus getOrderLineStatus() {
        return orderLineStatus;
    }
    public void setOrderLineStatus(OrderLineStatus orderLineStatus) {
        this.orderLineStatus = orderLineStatus;
    }

    
}
