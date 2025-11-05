package com.example.backend.dto.request;

import com.example.backend.entities.OrderLineStatus;
import java.util.List;
import java.util.UUID;

public class CreateOrderLineRequest {

    private OrderLineStatus orderLineStatus = OrderLineStatus.PENDING;
    private List<CreateOrderItemRequest> orderItems;
    private UUID orderId;

    public UUID getOrderId() {
        return orderId;
    }

    public void setOrderId(UUID orderId) {
        this.orderId = orderId;
    }

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
}
