package com.example.backend.dto.request;

import java.util.UUID;

import com.example.backend.entities.OrderStatus;

public class UpdateOrderStatusRequest {

    private UUID orderId;
    private OrderStatus orderStatus;
    
    public UUID getOrderId() {
        return orderId;
    }
    public void setOrderId(UUID orderId) {
        this.orderId = orderId;
    }
    public OrderStatus getOrderStatus() {
        return orderStatus;
    }
    public void setOrderStatus(OrderStatus orderStatus) {
        this.orderStatus = orderStatus;
    }
    
}
