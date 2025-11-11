package com.example.backend.dto.request;

import com.example.backend.entities.OrderLineStatus;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public class CreateOrderLineRequest {

    // is this stateless
    // private UUID orderId;    
    private UUID areaTableId;
    private OrderLineStatus orderLineStatus = OrderLineStatus.PENDING;
    private List<CreateOrderItemRequest> orderItems;
    private BigDecimal totalPrice;

    // public UUID getOrderId() {
    //     return orderId;
    // }

    // public void setOrderId(UUID orderId) {
    //     this.orderId = orderId;
    // }

    public OrderLineStatus getOrderLineStatus() {
        return orderLineStatus;
    }

    public void setOrderLineStatus(OrderLineStatus orderLineStatus) {
        this.orderLineStatus = orderLineStatus;
    }

    public List<CreateOrderItemRequest> getOrderItems() {
        return orderItems;
    }

    public void setOrderItems(List<CreateOrderItemRequest> orderItems) {
        this.orderItems = orderItems;
    }

    public BigDecimal getTotalPrice() {
        return totalPrice;
    }

    public void setTotalPrice(BigDecimal totalPrice) {
        this.totalPrice = totalPrice;
    }

    public UUID getAreaTableId() {
        return areaTableId;
    }

    public void setAreaTableId(UUID areaTableId) {
        this.areaTableId = areaTableId;
    }
    
}
